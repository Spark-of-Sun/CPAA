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
MODEL = BedrockModel(model_id="global.amazon.nova-2-lite-v1:0")

# TTLs
TOOL_CACHE_TTL = 60 * 60          # 1 hour
USER_URL_CACHE_TTL = 7 * 24 * 60 * 60  # 7 days

BASE_SYSTEM_PROMPT = """You are a WhatsApp assistant.

CRITICAL - YOUR OUTPUT GOES DIRECTLY TO USER:
Everything you write is sent directly to the user's WhatsApp. There is NO post-processing.
- Do NOT use <think> tags - user will see them
- Do NOT write "Tool #1:" or function names - user will see them
- Do NOT explain your reasoning - user will see it
- Do NOT mention user_id, google-oauth2, or internal IDs - user will see them
- ONLY write the final friendly message

CORRECT OUTPUT EXAMPLES:
Your name is *Khushwant*!
Got it, I'll remember that!
You have 2 new emails from Google and Amazon.

RULES:
- Brief responses, like texting a friend
- IST timezone
- WhatsApp: *bold* _italic_ ~strike~

TOOLS:
- mem0_memory: Store/retrieve user info. Always include user_id.
- Gmail/Calendar: Only when user asks
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

        # New Composio SDK: create a session for the user
        session = self._composio_client.create(user_id)
        mcp_url = session.mcp.url
        mcp_headers = dict(session.mcp.headers) if session.mcp.headers else {}

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