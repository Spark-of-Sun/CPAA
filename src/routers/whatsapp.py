"""WhatsApp-specific routes for tool connection without Auth0"""
from fastapi import APIRouter, Request
from typing import List, Optional
from src.services.composio_service import composio_service
from src.services.agent_manager import agent_manager
from src.services.redis_client import redis_client

router = APIRouter()


@router.post("/{phone_number}/connect/{toolkit}")
async def connect_tool_for_whatsapp_user(
    phone_number: str,
    toolkit: str,
    request: Request,
    auth_config_id: Optional[str] = None
):
    """
    Generate connection link for WhatsApp user to connect a tool.
    Returns a URL the user can click to authenticate.
    """
    callback_url = str(request.base_url) + f"whatsapp/{phone_number}/callback"
    
    result = await composio_service.initiate_connection(
        user_id=phone_number,
        toolkit=toolkit,
        callback_url=callback_url
    )
    
    return result


@router.get("/{phone_number}/callback")
async def whatsapp_oauth_callback(phone_number: str, request: Request):
    """Handle OAuth callback for WhatsApp users"""
    # After successful OAuth, refresh user's agent
    await agent_manager.clear_session(phone_number)
    
    return {
        "status": "connected",
        "message": "Tool connected successfully! You can now return to WhatsApp."
    }


@router.get("/{phone_number}/tools")
async def get_whatsapp_user_tools(phone_number: str):
    """Get connected tools for a WhatsApp user"""
    connections = await composio_service.list_connections(phone_number)
    return {"phone_number": phone_number, "connections": connections}


@router.post("/{phone_number}/mcp/setup")
async def setup_whatsapp_user_mcp(
    phone_number: str,
    toolkits: List[str],
    auth_configs: dict
):
    """Setup MCP config for WhatsApp user"""
    result = await composio_service.setup_user_mcp(
        user_id=phone_number,
        toolkits=toolkits,
        auth_configs=auth_configs
    )
    
    if "mcp_config_id" in result:
        # Store for agent manager
        await agent_manager.set_user_mcp_config(phone_number, result["mcp_config_id"])
    
    return result


@router.delete("/{phone_number}/session")
async def clear_whatsapp_session(phone_number: str):
    """Clear agent session for WhatsApp user"""
    await agent_manager.clear_session(phone_number)
    return {"status": "cleared"}


@router.get("/{phone_number}/status")
async def get_whatsapp_user_status(phone_number: str):
    """Get status of WhatsApp user's agent setup"""
    mcp_config = await redis_client.get(f"user_mcp_config:{phone_number}")
    connections = await composio_service.list_connections(phone_number)
    
    return {
        "phone_number": phone_number,
        "mcp_configured": mcp_config is not None,
        "mcp_config_id": mcp_config,
        "connected_tools": [c.get("toolkit") for c in connections],
        "connection_count": len(connections)
    }
