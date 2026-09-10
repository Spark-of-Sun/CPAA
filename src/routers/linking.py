"""WhatsApp linking routes - Phone OTP only"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from src.services.whatsapp_linking import whatsapp_linking
from src.services.agent_manager import agent_manager
from src.routers.auth import get_current_user_dep

router = APIRouter()


class SendOTPRequest(BaseModel):
    phone_number: str


class VerifyOTPRequest(BaseModel):
    phone_number: str
    code: str


@router.post("/send-otp")
async def send_otp(request: SendOTPRequest, user: dict = Depends(get_current_user_dep)):
    """
    Send OTP to user's WhatsApp number.
    
    Flow:
    1. User enters phone on dashboard
    2. OTP sent to WhatsApp
    3. User enters OTP on dashboard
    4. Linked!
    """
    auth0_user_id = user.get("sub")
    phone = request.phone_number.strip()
    
    if not phone or len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")
    
    # Check if already linked
    status = await whatsapp_linking.get_status(auth0_user_id)
    if status.get("linked"):
        raise HTTPException(status_code=400, detail="Already linked. Unlink first to change number.")
    
    # Check if phone linked to another user
    if await whatsapp_linking.is_phone_linked(phone):
        raise HTTPException(status_code=400, detail="This phone is linked to another account")
    
    # Generate OTP
    code = await whatsapp_linking.send_otp(auth0_user_id, phone)
    
    # Send via WhatsApp
    from src.routers.webhook import send_whatsapp_message
    await send_whatsapp_message(
        phone,
        f"🔐 Your verification code is: *{code}*\n\nEnter this on the dashboard to link your WhatsApp.\n\nExpires in 10 minutes."
    )
    
    return {"status": "sent", "message": "OTP sent to your WhatsApp"}


@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest, user: dict = Depends(get_current_user_dep)):
    """Verify OTP and link WhatsApp"""
    auth0_user_id = user.get("sub")
    
    result = await whatsapp_linking.verify_otp(
        auth0_user_id=auth0_user_id,
        phone_number=request.phone_number,
        code=request.code
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.get("/status")
async def get_status(user: dict = Depends(get_current_user_dep)):
    """Get WhatsApp linking status"""
    auth0_user_id = user.get("sub")
    return await whatsapp_linking.get_status(auth0_user_id)


@router.delete("/unlink")
async def unlink(user: dict = Depends(get_current_user_dep)):
    """Unlink WhatsApp"""
    auth0_user_id = user.get("sub")
    
    status = await whatsapp_linking.get_status(auth0_user_id)
    phone = status.get("phone_number")
    
    success = await whatsapp_linking.unlink(auth0_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="No WhatsApp linked")
    
    # Clear agent session
    if phone:
        await agent_manager.clear_session(phone)
    
    return {"status": "unlinked"}


async def handle_linking_message(phone_number: str, message: str) -> str | None:
    """
    Handle linking-related messages from WhatsApp.
    Returns a response string if handled, None if not a linking command.
    """
    text = message.strip().lower()
    
    # Check if user wants to link
    if text == "link":
        # Check if already linked
        auth0_user_id = await whatsapp_linking.get_auth0_user_for_phone(phone_number)
        if auth0_user_id:
            return "✅ Your WhatsApp is already linked to an account!"
        
        return (
            "🔗 *Link Your Account*\n\n"
            "To link your WhatsApp:\n"
            "1. Go to the dashboard\n"
            "2. Enter your phone number\n"
            "3. You'll receive an OTP here\n"
            "4. Enter the OTP on the dashboard\n\n"
            "Or if you have a 6-digit code from the dashboard, send it here."
        )
    
    # Check if message is a 6-digit code (dashboard-generated)
    if text.isdigit() and len(text) == 6:
        # Try to verify as a dashboard-generated code
        result = await whatsapp_linking.verify_phone_code(phone_number, text)
        if result.get("success"):
            return "✅ Your WhatsApp is now linked! You can now use all your connected tools."
        elif result.get("error") == "invalid_code":
            return None  # Not a linking code, let agent handle it
        else:
            return f"❌ {result.get('error', 'Failed to link')}"
    
    # Check unlink command
    if text == "unlink":
        auth0_user_id = await whatsapp_linking.get_auth0_user_for_phone(phone_number)
        if not auth0_user_id:
            return "⚠️ Your WhatsApp is not linked to any account."
        
        success = await whatsapp_linking.unlink(auth0_user_id)
        if success:
            await agent_manager.clear_session(phone_number)
            return "✅ Your WhatsApp has been unlinked."
        return "❌ Failed to unlink. Please try again."
    
    # Not a linking command
    return None
