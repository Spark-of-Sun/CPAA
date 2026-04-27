"""
MCP Manager - Manages MCP clients for Composio tools per user
Uses Streamable HTTP transport to connect to Composio MCP servers
"""
import os
from typing import Optional, Dict, List
from contextlib import contextmanager
from mcp.client.streamable_http import streamablehttp_client
from strands.tools.mcp import MCPClient
from src.services.redis_client import redis_client
from src.config import settings


class MCPManager:
    """Manages MCP connections for users' Composio tools"""
    
    def __init__(self):
        self.composio_api_key = os.getenv("COMPOSIO_API_KEY", "")
        self.base_url = "https://backend.composio.dev/v3/mcp"
        self._active_clients: Dict[str, MCPClient] = {}
    
    def get_mcp_url(self, user_id: str, mcp_config_id: Optional[str] = None) -> str:
        """Generate Composio MCP server URL for a user"""
        if mcp_config_id:
            return f"{self.base_url}/{mcp_config_id}?include_composio_helper_actions=true&user_id={user_id}"
        # Default URL without specific config
        return f"{self.base_url}?include_composio_helper_actions=true&user_id={user_id}"
    
    def create_mcp_client(self, user_id: str, mcp_config_id: Optional[str] = None) -> MCPClient:
        """Create MCP client for user's Composio tools"""
        url = self.get_mcp_url(user_id, mcp_config_id)
        
        headers = {}
        if self.composio_api_key:
            headers["x-api-key"] = self.composio_api_key
        
        client = MCPClient(
            lambda url=url, headers=headers: streamablehttp_client(
                url=url,
                headers=headers if headers else None
            )
        )
        
        return client
    
    @contextmanager
    def get_tools_context(self, user_id: str, mcp_config_id: Optional[str] = None):
        """Context manager for getting tools from MCP"""
        client = self.create_mcp_client(user_id, mcp_config_id)
        
        with client:
            tools = client.list_tools_sync()
            yield tools
    
    def get_mcp_clients_for_user(self, user_id: str, toolkits: List[str] = None) -> List[MCPClient]:
        """Get list of MCP clients for user's connected toolkits"""
        clients = []
        
        # Create Composio MCP client
        if self.composio_api_key:
            composio_client = self.create_mcp_client(user_id)
            clients.append(composio_client)
        
        return clients


mcp_manager = MCPManager()
