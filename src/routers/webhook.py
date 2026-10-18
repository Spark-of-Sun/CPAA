"""WhatsApp Webhook handler"""
import os
import httpx
import logging
import traceback
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from fastapi.responses import PlainTextResponse
from src.services.agent_manager import agent_manager
from src.services.redis_client import redis_client
from src.models.user import WhatsAppMessage

logger = logging.getLogger(__name__)
router = APIRouter()

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")
ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

# Shared HTTP client: created once, reused for every message.
# Long connect timeout + retries because the network to Meta can be slow.
_timeout = httpx.Timeout(30.0, connect=20.0)
_transport = httpx.AsyncHTTPTransport(retries=3)
_http_client = httpx.AsyncClient(transport=_transport, timeout=_timeout)


async def close_http_client():
    """Call this on app shutdown (e.g. in FastAPI lifespan)."""
    await _http_client.aclose()


@router.get("")
async def verify_webhook(request: Request):
    """Meta webhook verification endpoint"""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return PlainTextResponse(content=challenge)

    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("")
async def receive_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive WhatsApp messages and process with agent"""
    data = await request.json()

    # Extract message from webhook payload
    message = extract_message(data)
    if not message:
        return {"status": "no_message"}

    # Process message in background
    background_tasks.add_task(process_message, message)

    return {"status": "received"}


def extract_message(data: dict) -> WhatsAppMessage | None:
    """Extract message from WhatsApp webhook payload"""
    try:
        entry = data.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        if not messages:
            return None

        msg = messages[0]
        return WhatsAppMessage(
            from_number=msg.get("from"),
            message_id=msg.get("id"),
            timestamp=msg.get("timestamp"),
            text=msg.get("text", {}).get("body") if msg.get("type") == "text" else None,
            message_type=msg.get("type", "text"),
        )
    except Exception:
        return None


async def process_message(message: WhatsAppMessage):
    """Process incoming message with the agent"""
    print(f"📥 Received message from {message.from_number}: {message.text}")

    if not message.text:
        print("⚠️ Non-text message, skipping")
        await send_whatsapp_message(
            message.from_number,
            "I can only process text messages for now.",
        )
        return

    try:
        # Import here to avoid circular imports
        from src.routers.linking import handle_linking_message
        from src.services.whatsapp_linking import whatsapp_linking

        # Check if this is a linking-related message
        linking_response = await handle_linking_message(
            message.from_number,
            message.text,
        )

        if linking_response:
            print(f"🔗 Linking response: {linking_response}")
            await send_whatsapp_message(message.from_number, linking_response)
            return

        # Check if user is linked - get their Auth0 user ID for tools
        auth0_user_id = await whatsapp_linking.get_auth0_user_for_phone(message.from_number)

        # Use Auth0 user ID if linked, otherwise use phone number
        user_id = auth0_user_id if auth0_user_id else message.from_number
        print(f"👤 User ID: {user_id} (linked: {auth0_user_id is not None})")

        # Handle help command
        if message.text.strip().lower() == "help":
            is_linked = auth0_user_id is not None
            help_text = get_help_message(is_linked)
            print("📤 Sending help message")
            await send_whatsapp_message(message.from_number, help_text)
            return

        # Process with agent
        print("🤖 Processing with agent...")
        response = await agent_manager.process_message(
            user_id=user_id,
            message=message.text,
        )
        print(
            f"📤 Agent response: {response[:200]}..."
            if len(response) > 200
            else f"📤 Agent response: {response}"
        )

    except Exception as e:
        # Only agent/logic errors land here (send errors are handled inside
        # send_whatsapp_message), so this fallback message is accurate.
        print(f"❌ Error processing message: {e}")
        print(traceback.format_exc())
        await send_whatsapp_message(
            message.from_number,
            "Sorry, I encountered an error. Please try again.",
        )
        return

    # Send response back via WhatsApp (outside the try so send failures
    # aren't reported as agent errors)
    await send_whatsapp_message(message.from_number, response)


def get_help_message(is_linked: bool) -> str:
    """Get help message based on linking status"""
    if is_linked:
        return (
            "🤖 *Personal Assistant Help*\n\n"
            "✅ Your account is linked!\n\n"
            "*Commands:*\n"
            "• Just ask me anything\n"
            "• I can use your connected tools\n"
            "• 'help' - Show this message\n\n"
            "*Connected Tools:*\n"
            "Manage your tools at the dashboard."
        )
    else:
        return (
            "🤖 *Personal Assistant Help*\n\n"
            "⚠️ Your WhatsApp is not linked to an account.\n\n"
            "*To link your account:*\n"
            "1. Say 'link' to get an OTP\n"
            "2. Enter the OTP on the dashboard\n\n"
            "*Or from dashboard:*\n"
            "1. Generate a code on dashboard\n"
            "2. Send the 6-digit code here\n\n"
            "You can still chat with me, but won't have access to your tools."
        )


async def send_whatsapp_message(to: str, text: str):
    """Send message via WhatsApp Cloud API"""
    # Validate text is not empty
    if not text or not text.strip():
        print(f"⚠️ Cannot send empty message to {to}, using fallback")
        text = "I'm sorry, I couldn't generate a response. Please try again."

    url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text},
    }

    print(
        f"📨 Sending WhatsApp message to {to}: {text[:100]}..."
        if len(text) > 100
        else f"📨 Sending WhatsApp message to {to}: {text}"
    )

    try:
        response = await _http_client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print("✅ Message sent successfully")
    except httpx.HTTPStatusError as e:
        print(f"❌ WhatsApp API error {e.response.status_code}: {e.response.text}")
    except httpx.RequestError as e:
        print(f"❌ WhatsApp network error: {type(e).__name__}: {e}")