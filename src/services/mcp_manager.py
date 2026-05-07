"""
MCP Manager - Manages MCP clients for Composio tools per user
Uses latest Composio API v3 to generate user-specific MCP URLs
"""
import os
import httpx
from typing import Optional, Dict, List
from contextlib import contextmanager
from mcp.client.streamable_http import streamablehttp_client
from strands.tools.mcp import MCPClient
from src.services.redis_client import redis_client


COMPOSIO_BASE_URL = "https://backend.composio.dev"
MCP_URL_CACHE_TTL = 7 * 24 * 60 * 60  # 7 days


class MCPManager:
    """Manages MCP connections for users' Composio tools"""

    def __init__(self):
        self.composio_api_key = os.getenv("COMPOSIO_API_KEY", "")
        self._active_clients: Dict[str, MCPClient] = {}

    async def get_mcp_url(self, user_id: str) -> str:
        """
        Generate Composio MCP server URL for a user using API v3.
        Cached in Redis for 7 days.
        """
        cache_key = f"mcp_url:{user_id}"
        cached = await redis_client.get(cache_key)
        if cached:
            return cached

        # Call Composio API to generate MCP URL
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{COMPOSIO_BASE_URL}/api/v3/mcp/servers/generate",
                headers={
                    "x-api-key": self.composio_api_key,
                    "Content-Type": "application/json"
                },
                json={"user_id": user_id},
                timeout=10.0
            )

            if response.status_code != 200:
                print(f"❌ Failed to generate MCP URL: {response.status_code} {response.text}")
                # Fallback to direct URL
                return f"https://connect.composio.dev/mcp?user_id={user_id}"

            data = response.json()
            mcp_url = data.get("url") or data.get("mcp_url") or data.get("server_url")

            if not mcp_url:
                print(f"❌ No URL in response: {data}")
                return f"https://connect.composio.dev/mcp?user_id={user_id}"

            # Cache it
            await redis_client.set(cache_key, mcp_url, ttl=MCP_URL_CACHE_TTL)
            print(f"🔗 Generated MCP URL for {user_id}: {mcp_url}")
            return mcp_url

    def create_mcp_client(self, mcp_url: str) -> MCPClient:
        """Create MCP client for a given URL"""
        headers = {"x-api-key": self.composio_api_key} if self.composio_api_key else {}

        client = MCPClient(
            lambda url=mcp_url, h=headers: streamablehttp_client(
                url=url,
                headers=h if h else None
            )
        )
        return client

    @contextmanager
    def get_tools_context(self, mcp_url: str):
        """Context manager for getting tools from MCP"""
        client = self.create_mcp_client(mcp_url)
        with client:
            tools = client.list_tools_sync()
            yield tools

    def get_mcp_clients_for_user(self, mcp_url: str) -> List[MCPClient]:
        """Get MCP client for user"""
        if self.composio_api_key:
            return [self.create_mcp_client(mcp_url)]
        return []


mcp_manager = MCPManager()