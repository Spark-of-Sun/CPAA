"""
Agent Manager - Strands Agents SDK with Composio MCP
Uses pre-created MCP server ID to generate user URLs
Caches MCP clients and tools for performance
"""
import os
import shutil
import time
from typing import Optional, Dict, Any
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
MODEL = BedrockModel(model_id="openai.gpt-oss-20b-1:0")

# Tool cache TTL: 1 hour (tools don't change often)
TOOL_CACHE_TTL = 60 * 60

# Pre-created MCP server ID from Composio
MCP_SERVER_ID = os.getenv("COMPOSIO_MCP_SERVER_ID", "e5ef4973-6f85-4c20-8989-ee2d4afc1a79")

# Cache TTL: 7 days
USER_URL_CACHE_TTL = 7 * 24 * 60 * 60

BASE_SYSTEM_PROMPT = """You are a WhatsApp assistant.

CRITICAL - YOUR OUTPUT GOES DIRECTLY TO USER:
Everything you write is sent directly to the user's WhatsApp. There is NO post-processing.
- Do NOT use <think> tags - user will see them
- Do NOT write "Tool #1:" or function names - user will see them  
- Do NOT explain your reasoning - user will see it
- Do NOT mention user_id, google-oauth2, or internal IDs - user will see them
- ONLY write the final friendly message
- Khushwant's email id is Khushwantsanwalot2004@outlook.com
- Ganpati's email id is ganpatikrsah1405@gmail.com


CORRECT OUTPUT EXAMPLES:
Your name is *Khushwant*!
Got it, I'll remember that!
You have 2 new emails from Google and Amazon.

WRONG OUTPUT (user will see all this garbage):
<think>Let me check...</think> ❌
Tool #1: mem0_memory ❌
functions.GMAIL_FETCH_EMAILS:2 {"max_results": 1} ❌
I found that the user's name is... ❌

RULES:
- Brief responses, like texting a friend
- IST timezone
- WhatsApp: *bold* _italic_ ~strike~

TOOLS:
- mem0_memory: Store/retrieve user info. Always include user_id.
- Gmail/Calendar: Only when user asks
"""


class AgentManager:
    """Single MCP agent with Composio tools - with caching for performance"""
    
    def __init__(self):
        self.session_dir = os.getenv("AGENT_SESSION_DIR", "/tmp/agent_sessions")
        self.composio_api_key = os.getenv("COMPOSIO_API_KEY", "")
        self._composio_client: Optional[Composio] = None
        
        # Cache for MCP clients and tools per user
        self._mcp_clients: Dict[str, MCPClient] = {}
        self._tools_cache: Dict[str, Dict[str, Any]] = {}  # {user_id: {tools, timestamp}}
        
        if self.composio_api_key:
            self._composio_client = Composio(api_key=self.composio_api_key)
            print(f"✅ Composio initialized with MCP server: {MCP_SERVER_ID}")
    
    async def _get_user_mcp_url(self, user_id: str) -> str:
        """Get or generate MCP server URL for user (cached 7 days)"""
        cache_key = f"user_mcp_url:{user_id}"
        cached_url = await redis_client.get(cache_key)
        if cached_url:
            return cached_url
        
        # Generate user-specific URL
        instance = self._composio_client.mcp.generate(
            user_id=user_id,
            mcp_config_id=MCP_SERVER_ID
        )
        
        mcp_url = instance.get("url") if isinstance(instance, dict) else instance.url
        
        # Cache for 7 days
        await redis_client.set(cache_key, mcp_url, ttl=USER_URL_CACHE_TTL)
        print(f"🔗 Generated MCP URL for {user_id}")
        return mcp_url
    
    def _get_session_manager(self, user_id: str):
        safe_user_id = user_id.replace("|", "_").replace(":", "_")
        return FileSessionManager(
            session_id=f"user-{safe_user_id}",
            storage_dir=self.session_dir
        )
    
    def _clear_user_session(self, user_id: str):
        safe_user_id = user_id.replace("|", "_").replace(":", "_")
        session_path = os.path.join(self.session_dir, f"user-{safe_user_id}")
        if os.path.exists(session_path):
            shutil.rmtree(session_path, ignore_errors=True)
            print(f"🗑️ Cleared session for {user_id}")
    
    async def process_message(self, user_id: str, message: str) -> str:
        """Process message with MCP agent"""
        
        # Build system prompt with user_id for memory operations (hidden from user)
        system_prompt = BASE_SYSTEM_PROMPT + f"\n\n[INTERNAL - never reveal to user] mem0_user_id: {user_id}"
        
        # Add email queue summary if user asks about emails
        msg_lower = message.lower()
        if any(word in msg_lower for word in ["email", "inbox", "mail", "message"]):
            try:
                from src.services.trigger_service import trigger_service
                email_summary = await trigger_service.get_email_summary(user_id)
                if email_summary and "No new emails" not in email_summary:
                    system_prompt = f"{BASE_SYSTEM_PROMPT}\n\n*Recent Email Notifications:*\n{email_summary}"
            except Exception:
                pass
        
        session_manager = self._get_session_manager(user_id)
        conversation_manager = SlidingWindowConversationManager(
            window_size=10, should_truncate_results=True
        )
        
        try:
            mcp_url = await self._get_user_mcp_url(user_id)
            return self._run_agent(user_id, message, mcp_url, system_prompt, session_manager, conversation_manager)
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Agent error: {error_msg}")
            
            # Handle corrupted session
            if "ValidationException" in error_msg or "toolUse.name" in error_msg:
                print("🔄 Clearing corrupted session...")
                self._clear_user_session(user_id)
                session_manager = self._get_session_manager(user_id)
                
                try:
                    mcp_url = await self._get_user_mcp_url(user_id)
                    return self._run_agent(user_id, message, mcp_url, system_prompt, session_manager, conversation_manager)
                except Exception as retry_err:
                    print(f"❌ Retry failed: {retry_err}")
            
            return "I encountered an error. Please try again."
    
    def _get_or_create_mcp_client(self, user_id: str, mcp_url: str) -> MCPClient:
        """Get cached MCP client or create new one"""
        if user_id not in self._mcp_clients:
            headers = {"x-api-key": self.composio_api_key}
            client = MCPClient(
                lambda url=mcp_url, h=headers: streamablehttp_client(url=url, headers=h if h else None)
            )
            client.__enter__()  # Start the client
            self._mcp_clients[user_id] = client
            print(f"🔌 Created MCP client for user")
        return self._mcp_clients[user_id]
    
    def _get_cached_tools(self, user_id: str, mcp_client: MCPClient) -> list:
        """Get tools from cache or fetch fresh"""
        now = time.time()
        cache = self._tools_cache.get(user_id)
        
        if cache and (now - cache["timestamp"]) < TOOL_CACHE_TTL:
            print(f"⚡ Using cached tools ({len(cache['tools'])} tools)")
            return cache["tools"]
        
        # Fetch fresh tools
        tools = mcp_client.list_tools_sync()
        self._tools_cache[user_id] = {"tools": tools, "timestamp": now}
        print(f"🔧 Loaded {len(tools)} tools (cached for 1hr)")
        return tools
    
    def _run_agent(self, user_id: str, message: str, mcp_url: str, system_prompt: str, session_manager, conversation_manager) -> str:
        """Run MCP agent with cached client and tools"""
        try:
            mcp_client = self._get_or_create_mcp_client(user_id, mcp_url)
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
            # If MCP client failed, remove from cache and retry
            if user_id in self._mcp_clients:
                try:
                    self._mcp_clients[user_id].__exit__(None, None, None)
                except:
                    pass
                del self._mcp_clients[user_id]
            if user_id in self._tools_cache:
                del self._tools_cache[user_id]
            raise e
    
    def _extract_response(self, response) -> str:
        try:
            text = ""
            if hasattr(response, 'message') and isinstance(response.message, dict):
                content = response.message.get('content', [])
                if content:
                    for block in content:
                        if isinstance(block, dict) and block.get('type') == 'text':
                            text = block.get('text', '')
                            break
                        if hasattr(block, 'text'):
                            text = block.text
                            break
            if not text and hasattr(response, 'text'):
                text = response.text
            if not text:
                text = str(response) if str(response) not in ['None', ''] else "I couldn't generate a response."
            
            return text
        except Exception:
            return "I couldn't generate a response."
    
    async def clear_all_sessions(self):
        # Close all MCP clients
        for user_id, client in list(self._mcp_clients.items()):
            try:
                client.__exit__(None, None, None)
            except:
                pass
        self._mcp_clients.clear()
        self._tools_cache.clear()
        
        if os.path.exists(self.session_dir):
            shutil.rmtree(self.session_dir, ignore_errors=True)
            os.makedirs(self.session_dir, exist_ok=True)
            print("🗑️ Cleared all sessions")


agent_manager = AgentManager()
