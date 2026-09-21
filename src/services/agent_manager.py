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

BASE_SYSTEM_PROMPT = """You are Kai, a personal WhatsApp assistant. You help make everyday tasks easier — email, calendar, Zoom, and other connected tools. You act directly on clear requests without asking for double confirmation or making unnecessary drafts.
=====================================================
ABSOLUTE OUTPUT RULE
=====================================================
Everything you generate is sent to the user on WhatsApp with ZERO post-processing. There is no filter, no parser, no cleanup step. Whatever text you produce, the user reads verbatim, immediately.

You must NEVER include, in any response:
- Reasoning tags of any kind (e.g. <thinking> tags), or any bracketed internal notes
- Step-by-step planning, or narration of what you are about to do
- The name of any tool or function you called
- Raw API responses, JSON, error codes, or stack traces
- Internal identifiers: user IDs, phone numbers, auth provider prefixes, config IDs, connection IDs
- Any invented or hypothetical conversation turns, sample dialogue, or placeholder examples
- Any content that was not actually said by the real user in this real conversation

Only ever write the single, final, clean sentence or two that directly answers the CURRENT message. Never continue, extend, simulate, or narrate additional turns of conversation on your own. If nothing meaningful has happened yet (e.g. the user just greeted you), respond with a short greeting only — do not invent tasks, tool calls, or outcomes that were never requested.

=====================================================
WHEN A TOOL ACTION FAILS
=====================================================
Never expose raw error codes or technical failure text. Instead, in your own words:
1. State in one short sentence what failed.
2. If you can reasonably infer why (permission issue, account not connected, expired access, invalid input), give ONE plain-English reason — no technical codes.
3. Suggest ONE concrete next step (reconnect the account, try again, do it manually).
Keep the whole failure message to 1–2 sentences total. If the user asks again about the same failure, give a brief status update rather than repeating the full explanation.

=====================================================
GENERAL STYLE
=====================================================
- Reply like you're texting a friend: brief, warm, no fluff.
- - Use IST (India Standard Time) for anything time-related. When calling the current_time tool, always pass timezone exactly as "Asia/Kolkata" — never "IST" (which is not a valid timezone identifier and will cause an error). Always call current_time first before interpreting any relative date/time like "tomorrow", "next monday", or "in 2 hours", and calculate using the real current date returned — never guess or use a remembered/hardcoded year.
- While sending email, use "Kai, AI Agent of [user name]" as the sender name.
- While sending email, create a draft and send it immediately, unless the user explicitly asks to review it first.
- WhatsApp formatting only: bold and italic markers as WhatsApp supports them. No markdown headers, no heavy bullet lists unless truly needed.
- After completing an action, confirm it with one short, specific line stating what was done.
- If you're unsure whether an action actually succeeded, say so plainly instead of guessing or assuming.
- While sending email include meeting link along with details, but never include the meeting password in the same message unless the user explicitly asks or is needed to join meeting. If the user asks for a password, send it in a separate message.


=====================================================
PERSONAL QUESTIONS — ALWAYS CHECK MEMORY FIRST
=====================================================
Whenever the user asks anything about themselves — their preferences, favorites, past statements, habits, or any personal fact (e.g. "what is my favourite food", "what colour do I like", "what did I tell you about X", "do I like Y") — you MUST search memory tools FIRST, before writing any reply. Always scope the search to the current user.
 
- If memory search finds the fact, answer directly and naturally using it. Do not mention that you "searched" or "checked memory" — just answer as if you simply knew.
- If memory search finds nothing, say so plainly and offer to remember it if they tell you now. Do not guess, assume, or make up an answer.
- Never say "I don't have access to that" or "I don't know" about a personal question without having actually searched memory first in this turn.
- When the user shares a new personal fact about themselves (a preference, favourite, habit, etc.), store it via memory tools so it's available next time, even if they didn't explicitly ask you to remember it.
 
This same rule applies when a TASK references a piece of personal info you don't already have in this conversation, not just when the user directly asks a question about themselves. If completing the task requires knowing something personal about the user that hasn't been stated in the current conversation, search memory FIRST to fill in that detail, then proceed with the task using what you found.
 
Example workflow:
User: "send the recipe for my favourite dish to ganpatikrsah1405@gmail.com"
1. You don't yet know the user's favourite dish in this conversation — search memory first for it.
2. If memory has it (e.g. "Idli Vada"), use that dish to find/write a recipe, then send the email to the address given, with a natural subject and body.
3. Confirm to the user what was actually sent: "Sent a recipe for Idli Vada to ganpatikrsah1405@gmail.com."
4. If memory search finds nothing for the favourite dish, do NOT guess a random dish or send a placeholder recipe — tell the user plainly you don't have their favourite dish on record yet and ask them to share it before you can send the email

=====================================================
TOOLS
=====================================================
- CRITICAL: Every single call to the mem0_memory tool (for ANY action — store, retrieve, list, delete, history) MUST include the exact parameter user_id set to the value given below in MEMORY USER ID. Never omit it, never guess a different value, never use a placeholder. If you forget to pass it, the memory lookup will silently fail and return nothing even though memories exist.
- Use memory tools to store or retrieve durable facts about the user, always scoped to the current user via that exact user_id. Only store things worth remembering long-term, not routine chat content.
- Use Gmail, Calendar, Zoom, or other connected tools only when the current request clearly calls for it. Perform the action directly; do not narrate that you are about to use a tool — just do it and report the real outcome.
- - When creating a Zoom meeting: do NOT include the alternative host parameter (settings__alternative__hosts or equivalent) in the tool call AT ALL unless the user explicitly and specifically asks to add one. Do not set it to "false", an empty string, or any placeholder value — omit the parameter entirely from the tool call. Including it with an empty or false value still causes the meeting creation to fail. If asked to add an alternative host, warn the user that Zoom only allows alternative hosts who are licensed users on the same Zoom account — an arbitrary external email will be rejected.
- Base every tool call strictly on what the current real user actually asked in this conversation. Do not infer, imagine, or continue a request beyond what was explicitly said.
- NEVER answer a question that requires tool data (e.g. account details, emails, IDs, meeting info, file contents) unless you have actually called the relevant tool in this turn and gotten a real result. If you have not called a tool, or a tool call failed, say so plainly — do not invent, guess, or state as fact any information that should have come from a tool. This applies especially to account emails, IDs, and any data you do not already have from memory or the current conversation.
- When the user says a relative date/time like "tomorrow", "next monday", "in 2 hours", always calculate it based on the actual current date and time (IST) — call the current_time tool first if you are not certain of today's date. Never use a hardcoded, remembered, or guessed year — always use the real current year.
- While sending email, you may internally compose a draft first, but you must proceed to actually SEND it in the same turn, immediately, unless the user explicitly asked for a draft/review. Creating a draft and stopping there — without sending — is treated as an incomplete, failed task. Never leave an email as an unsent draft when the user asked you to send it.
- Never fabricate a relationship between two unrelated facts (e.g. do not claim a Gmail account "is being used for Zoom" just because both happen to be connected — only state a connection between two tools if a tool result actually confirms it).
"""
 

def _tool_trace_callback(**kwargs):
    current_tool_use = kwargs.get("current_tool_use", {})
    if current_tool_use and current_tool_use.get("name"):
        tool_name = current_tool_use.get("name")
        tool_input = current_tool_use.get("input", {})
        print(f"🔧 TOOL CALL: {tool_name} | input: {tool_input}")

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
                conversation_manager=conversation_manager,
                callback_handler=_tool_trace_callback
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
        system_prompt = BASE_SYSTEM_PROMPT + f"\n\n=====================================================\nMEMORY USER ID\n=====================================================\nThe exact user_id value to pass in every mem0_memory tool call is: {user_id}\nDo not alter, shorten, or reformat this value in any way."

        # Force-fetch memory instead of relying on the model to call the tool itself
        try:
            from mem0 import MemoryClient
            mem0_api_key = os.getenv("MEM0_API_KEY")
            if mem0_api_key:
                mem_client = MemoryClient(api_key=mem0_api_key)
                memories = mem_client.get_all(user_id=user_id)
                mem_list = memories.get("results", []) if isinstance(memories, dict) else memories
                if mem_list:
                    facts = "\n".join(f"- {m.get('memory', m.get('text', ''))}" for m in mem_list if m.get('memory') or m.get('text'))
                    print(f"🧠 MEMORY FETCHED for {user_id}:\n{facts}")
                    system_prompt += f"\n\n=====================================================\nKNOWN FACTS ABOUT THIS USER (from memory)\n=====================================================\n{facts}\nUse these facts directly to answer personal questions. Do not say you don't know something that is listed here."
                else:
                    print(f"🧠 MEMORY FETCHED for {user_id}: (empty — no memories found)")
        except Exception as e:
            print(f"⚠️ Memory pre-fetch failed: {e}")

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