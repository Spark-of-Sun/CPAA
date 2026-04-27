"""Tool connection routes - Composio integration"""
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse
from src.services.composio_service import composio_service
from src.services.agent_manager import agent_manager
from src.routers.auth import get_current_user_dep

router = APIRouter()


@router.get("/available")
async def list_available_toolkits():
    """List all available toolkits"""
    toolkits = await composio_service.get_available_toolkits()
    return {"toolkits": toolkits}


@router.get("/connected")
async def get_connected_tools(user: dict = Depends(get_current_user_dep)):
    """Get user's connected tools"""
    user_id = user.get("sub")
    tools = await composio_service.get_user_connections(user_id)
    return {"tools": tools}


@router.post("/connect/{toolkit}")
async def connect_tool(
    toolkit: str,
    request: Request,
    user: dict = Depends(get_current_user_dep)
):
    """Initiate connection to a toolkit"""
    user_id = user.get("sub")
    callback_url = str(request.url_for("tool_callback"))
    
    result = await composio_service.initiate_connection(
        user_id=user_id,
        toolkit=toolkit,
        callback_url=callback_url
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/callback", name="tool_callback")
async def tool_callback(request: Request):
    """OAuth callback from Composio"""
    html = """
    <!DOCTYPE html>
    <html>
    <head><title>Connected!</title>
    <style>
        body { font-family: Arial; display: flex; justify-content: center; 
               align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
        .box { text-align: center; padding: 40px; background: white; 
               border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #22c55e; }
    </style>
    </head>
    <body>
        <div class="box">
            <h1>✅ Tool Connected!</h1>
            <p>You can close this window.</p>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html)


@router.delete("/disconnect/{toolkit}")
async def disconnect_tool(toolkit: str, user: dict = Depends(get_current_user_dep)):
    """Disconnect a toolkit"""
    user_id = user.get("sub")
    success = await composio_service.disconnect(user_id, toolkit)
    if not success:
        raise HTTPException(status_code=404, detail="Connection not found")
    return {"status": "disconnected", "toolkit": toolkit}


@router.get("/status/{toolkit}")
async def get_tool_status(toolkit: str, user: dict = Depends(get_current_user_dep)):
    """Check connection status for a toolkit"""
    user_id = user.get("sub")
    status = await composio_service.get_connection_status(user_id, toolkit)
    return {"toolkit": toolkit, "status": status}


@router.post("/refresh-configs")
async def refresh_auth_configs():
    """Refresh auth configs cache"""
    configs = await composio_service.refresh_cache()
    return {"status": "refreshed", "count": len(configs)}


@router.post("/reset-mcp")
async def reset_mcp_config():
    """Reset MCP config - creates a new one"""
    await agent_manager.reset_mcp_config()
    return {"status": "reset", "mcp_config_id": agent_manager._mcp_config_id}


@router.post("/clear-sessions")
async def clear_all_sessions():
    """Clear all agent sessions (fixes corrupted sessions)"""
    await agent_manager.clear_all_sessions()
    return {"status": "cleared"}



# ============ Triggers ============

@router.post("/triggers/gmail")
async def setup_gmail_trigger(user: dict = Depends(get_current_user_dep)):
    """Setup Gmail trigger for new email notifications"""
    from src.services.trigger_service import trigger_service
    
    user_id = user.get("sub")
    trigger_id = await trigger_service.setup_gmail_trigger(user_id)
    
    if not trigger_id:
        raise HTTPException(status_code=500, detail="Failed to setup trigger")
    
    return {"status": "active", "trigger_id": trigger_id}


@router.get("/triggers/emails")
async def get_queued_emails(user: dict = Depends(get_current_user_dep)):
    """Get queued email notifications"""
    from src.services.trigger_service import trigger_service
    from src.services.redis_client import redis_client
    
    user_id = user.get("sub")
    
    # Check if trigger is set up
    trigger_id = await redis_client.get(f"user_trigger:{user_id}")
    if not trigger_id:
        raise HTTPException(status_code=404, detail="Trigger not configured")
    
    emails = await trigger_service.get_queued_emails(user_id)
    summary = await trigger_service.get_email_summary(user_id)
    
    return {"count": len(emails), "summary": summary, "emails": emails, "trigger_id": trigger_id}


@router.delete("/triggers/emails")
async def clear_email_queue(user: dict = Depends(get_current_user_dep)):
    """Clear email queue"""
    from src.services.trigger_service import trigger_service
    
    user_id = user.get("sub")
    await trigger_service.clear_email_queue(user_id)
    
    return {"status": "cleared"}


@router.get("/triggers/status")
async def get_trigger_status(user: dict = Depends(get_current_user_dep)):
    """Check if Gmail trigger is configured"""
    from src.services.redis_client import redis_client
    
    user_id = user.get("sub")
    trigger_id = await redis_client.get(f"user_trigger:{user_id}")
    
    return {
        "configured": trigger_id is not None,
        "trigger_id": trigger_id
    }
