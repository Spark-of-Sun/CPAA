"""
Agent Manager - Strands Agents SDK with Composio MCP
"""
import os
import shutil
import time
from typing import Optional, Dict, Any, Tuple
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands.session.file_session_manager import FileSessionManager
from strands.agent.conversation_manager import SlidingWindowConversationManager
from strands.tools.mcp import MCPClient
from mcp.client.streamable_http import streamablehttp_client
from composio import Composio
from src.services.redis_client import redis_client
from strands_tools import current_time, mem0_memory


# Model
DEFAULT_MODEL_ID = "apac.amazon.nova-lite-v1:0"

try:
    model_id = os.getenv("MODEL_ID", DEFAULT_MODEL_ID)
    MODEL = BedrockModel(model_id=model_id)
    print(f"✅ Model: {model_id}")
except Exception as e:
    print(f"⚠️ Model load failed ({e}), using default")
    MODEL = BedrockModel(model_id=DEFAULT_MODEL_ID)


# TTLs
TOOL_CACHE_TTL = 60 * 60          # 1 hour
USER_URL_CACHE_TTL = 7 * 24 * 60 * 60  # 7 days

BASE_SYSTEM_PROMPT = """You are a professional personal assistant communicating via WhatsApp.

═══════════════════════════════════════
ABSOLUTE OUTPUT RULE — READ FIRST
═══════════════════════════════════════
Every word you generate is sent DIRECTLY to the user's WhatsApp with ZERO post-processing.
There is no filtering step. Whatever you output, the user reads verbatim.

You MUST NEVER include, under any circumstances:
- <thinking> tags or any reasoning/planning text
- "Tool #1:", tool names, function names, or tool call descriptions
- Explanations of what you're about to do or why
- Internal IDs: user_id, google-oauth2, auth0 identifiers, session IDs
- Meta-commentary like "Let me check that for you" followed by visible reasoning

Your response must contain ONLY the final message to the user. Nothing else. Not one extra line.

If you need to use a tool, call it silently. Then write only the natural, final reply
based on the result — as if you already knew the answer.

═══════════════════════════════════════
ACT DECISIVELY
═══════════════════════════════════════
- If you have all the information needed to complete a request, DO IT — don't ask "should I proceed?" or "would you like me to send it now?"
- Only ask a clarifying question if information genuinely required to complete the action is missing (e.g. no recipient email given, no event date/time given, ambiguous which contact was meant).
- Once you ask a clarifying question and get an answer, complete the action immediately — don't ask again.

═══════════════════════════════════════
TONE & STYLE
═══════════════════════════════════════
Professional, warm, and efficient — like a highly competent executive assistant.
Not robotic, not overly casual. Clear and direct, but never cold.

CORRECT OUTPUT EXAMPLES:
"Your name is *Ganpati*."
"Got it, I'll remember that."
"You have 2 new emails from Google and Amazon."
"Meeting scheduled for 3 PM tomorrow — Zoom link sent to your email."
"Email sent to ganpatikumar5919@gmail.com. and subjecta and body"

NEVER OUTPUT:
"<thinking> I should check the calendar first </thinking>"
"Tool #1: GMAIL_FETCH_EMAILS"
"Would you like me to send it now?" (when you already have everything needed to send)

RULES:
- Brief responses, like texting a friend — but polished, not sloppy
- IST timezone for all times
- WhatsApp formatting: *bold* _italic_ ~strike~ (use sparingly, for real emphasis)

TOOLS:
- mem0_memory: Store/retrieve user info. Always include user_id.
- Gmail/Calendar/Zoom: Only when user asks — don't proactively check unless requested.
- If the user says "send" an email, use GMAIL_SEND_EMAIL directly. Do NOT create a draft first.
- Only create a draft (GMAIL_CREATE_EMAIL_DRAFT) if the user explicitly says "draft."
- For calendar events, if date/time/title are all given, create the event immediately — don't ask for confirmation.
- If no suitable tool exists for a request, say so plainly rather than guessing.

Remember: the user only ever sees your final sentence(s). Everything else must happen silently.
"""


class AgentManager:
    """MCP agent with Composio tools - with caching for performance"""

    def __init__(self):
        self.session_dir = os.getenv("AGENT_SESSION_DIR", "/tmp/agent_sessions")
        self.composio_api_key = os.getenv("COMPOSIO_API_KEY", "")
        self._composio_client: Optional[Composio] = None
        self._mcp_clients: Dict[str, MCPClient] = {}
        self._tools_cache: Dict[str, Dict[str, Any]] = {}

        if self.composio_api_key:
            self._composio_client = Composio(api_key=self.composio_api_key)
            print("✅ Composio initialized")

    # ─── MCP URL ────────────────────────────────────────────────────────────

    async def _get_user_mcp_url(self, user_id: str) -> Tuple[str, dict]:
        """Get MCP server URL and headers for user (cached 7 days)"""
        cache_key = f"user_mcp_url:{user_id}"
        cached = await redis_client.get(cache_key)
        if cached and isinstance(cached, dict):
            return cached["url"], cached.get("headers", {})

        if not self._composio_client:
            raise Exception("Composio client not initialized. Check COMPOSIO_API_KEY.")

        from src.services.composio_service import composio_service
        mcp_config_id = await composio_service.ensure_mcp_server()

        instance = self._composio_client.mcp.generate(user_id=user_id, mcp_config_id=mcp_config_id)
        mcp_url = instance["url"]
        mcp_headers = {"x-api-key": self.composio_api_key}

        await redis_client.set(
            cache_key,
            {"url": mcp_url, "headers": mcp_headers},
            ttl=USER_URL_CACHE_TTL
        )
        print(f"🔗 MCP session created for {user_id}")
        return mcp_url, mcp_headers

    # ─── MCP Client ─────────────────────────────────────────────────────────

    def _get_or_create_mcp_client(self, user_id: str, mcp_url: str, mcp_headers: dict) -> MCPClient:
        """Get cached MCP client or create new one"""
        if user_id not in self._mcp_clients:
            client = MCPClient(
                lambda url=mcp_url, h=mcp_headers: streamablehttp_client(
                    url=url, headers=h if h else None
                )
            )
            client.__enter__()
            self._mcp_clients[user_id] = client
            print("🔌 Created MCP client for user")
        return self._mcp_clients[user_id]

    def _get_cached_tools(self, user_id: str, mcp_client: MCPClient) -> list:
        """Get tools from cache or fetch fresh"""
        now = time.time()
        cache = self._tools_cache.get(user_id)
        if cache and (now - cache["timestamp"]) < TOOL_CACHE_TTL:
            print(f"⚡ Using cached tools ({len(cache['tools'])} tools)")
            return cache["tools"]

        tools = mcp_client.list_tools_sync()
        self._tools_cache[user_id] = {"tools": tools, "timestamp": now}
        print(f"🔧 Loaded {len(tools)} tools (cached for 1hr)")
        return tools

    # ─── Session ────────────────────────────────────────────────────────────

    def _get_session_manager(self, user_id: str) -> FileSessionManager:
        safe_id = user_id.replace("|", "_").replace(":", "_")
        return FileSessionManager(
            session_id=f"user-{safe_id}",
            storage_dir=self.session_dir
        )

    def _clear_user_session(self, user_id: str):
        safe_id = user_id.replace("|", "_").replace(":", "_")
        session_path = os.path.join(self.session_dir, f"user-{safe_id}")
        if os.path.exists(session_path):
            shutil.rmtree(session_path, ignore_errors=True)
            print(f"🗑️ Cleared session for {user_id}")

    # ─── Agent Run ──────────────────────────────────────────────────────────

    def _run_agent(
        self,
        user_id: str,
        message: str,
        mcp_url: str,
        mcp_headers: dict,
        system_prompt: str,
        session_manager,
        conversation_manager
    ) -> str:
        try:
            mcp_client = self._get_or_create_mcp_client(user_id, mcp_url, mcp_headers)
            tools = self._get_cached_tools(user_id, mcp_client)

            agent = Agent(
                model=MODEL,
                system_prompt=system_prompt,
                tools=tools + [current_time, mem0_memory],
                session_manager=session_manager,
                conversation_manager=conversation_manager
            )

            response = agent(message)
            return self._extract_response(response)

        except Exception as e:
            # Clear broken client and cache, then re-raise for retry
            if user_id in self._mcp_clients:
                try:
                    self._mcp_clients[user_id].__exit__(None, None, None)
                except Exception:
                    pass
                del self._mcp_clients[user_id]
            if user_id in self._tools_cache:
                del self._tools_cache[user_id]
            raise e

    # ─── Process Message ────────────────────────────────────────────────────

    async def process_message(self, user_id: str, message: str) -> str:
        """Process a user message through the MCP agent"""
        system_prompt = BASE_SYSTEM_PROMPT + f"\n\n[INTERNAL] mem0_user_id: {user_id}"

        # Inject email context if relevant
        if any(w in message.lower() for w in ["email", "inbox", "mail"]):
            try:
                from src.services.trigger_service import trigger_service
                summary = await trigger_service.get_email_summary(user_id)
                if summary and "No new emails" not in summary:
                    system_prompt += f"\n\nRecent Emails:\n{summary}"
            except Exception:
                pass

        session_manager = self._get_session_manager(user_id)
        conversation_manager = SlidingWindowConversationManager(
            window_size=10, should_truncate_results=True
        )

        try:
            mcp_url, mcp_headers = await self._get_user_mcp_url(user_id)
            return self._run_agent(
                user_id, message, mcp_url, mcp_headers,
                system_prompt, session_manager, conversation_manager
            )

        except Exception as e:
            error_msg = str(e)
            print(f"❌ Agent error: {error_msg}")
            import traceback; traceback.print_exc()

            # Retry once with cleared session on corruption
            if "ValidationException" in error_msg or "toolUse.name" in error_msg:
                print("🔄 Clearing corrupted session and retrying...")
                self._clear_user_session(user_id)
                session_manager = self._get_session_manager(user_id)
                try:
                    mcp_url, mcp_headers = await self._get_user_mcp_url(user_id)
                    return self._run_agent(
                        user_id, message, mcp_url, mcp_headers,
                        system_prompt, session_manager, conversation_manager
                    )
                except Exception as retry_err:
                    print(f"❌ Retry failed: {retry_err}")

            return "I encountered an error. Please try again."

    # ─── Helpers ────────────────────────────────────────────────────────────

    def _extract_response(self, response) -> str:
        try:
            if hasattr(response, 'message') and isinstance(response.message, dict):
                for block in response.message.get('content', []):
                    if isinstance(block, dict) and block.get('type') == 'text':
                        return block['text']
                    if hasattr(block, 'text'):
                        return block.text
            if hasattr(response, 'text') and response.text:
                return response.text
            text = str(response)
            return text if text not in ['None', ''] else "I couldn't generate a response."
        except Exception:
            return "I couldn't generate a response."

    async def clear_session(self, user_id: str):
        """Clear session for a specific user"""
        self._clear_user_session(user_id)
        if user_id in self._mcp_clients:
            try:
                self._mcp_clients[user_id].__exit__(None, None, None)
            except Exception:
                pass
            del self._mcp_clients[user_id]
        if user_id in self._tools_cache:
            del self._tools_cache[user_id]

    async def set_user_mcp_config(self, user_id: str, mcp_config_id: str):
        """Store MCP config ID for a user"""
        await redis_client.set(f"user_mcp_config:{user_id}", mcp_config_id)

    async def reset_mcp_config(self):
        """Reset MCP config"""
        self._mcp_clients.clear()
        self._tools_cache.clear()

    async def clear_all_sessions(self):
        """Clear all sessions and MCP clients"""
        for client in list(self._mcp_clients.values()):
            try:
                client.__exit__(None, None, None)
            except Exception:
                pass
        self._mcp_clients.clear()
        self._tools_cache.clear()

        if os.path.exists(self.session_dir):
            shutil.rmtree(self.session_dir, ignore_errors=True)
            os.makedirs(self.session_dir, exist_ok=True)
            print("🗑️ Cleared all sessions")


agent_manager = AgentManager()