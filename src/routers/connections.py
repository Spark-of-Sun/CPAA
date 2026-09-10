"""Connection management routes"""
from fastapi import APIRouter, Request, Depends, HTTPException
from typing import List
from src.services.composio_service import composio_service
from src.routers.auth import get_current_user_dep

router = APIRouter()


@router.get("")
async def list_connections(user: dict = Depends(get_current_user_dep)):
    """List all user's connected accounts"""
    user_id = user.get("sub")
    connections = await composio_service.list_connections(user_id)
    return {"connections": connections}


@router.get("/{connection_id}")
async def get_connection(
    connection_id: str,
    user: dict = Depends(get_current_user_dep)
):
    """Get details of a specific connection"""
    user_id = user.get("sub")
    connection = await composio_service.get_connection(user_id, connection_id)
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    return connection


@router.delete("/{connection_id}")
async def delete_connection(
    connection_id: str,
    user: dict = Depends(get_current_user_dep)
):
    """Delete a connection"""
    user_id = user.get("sub")
    success = await composio_service.delete_connection(user_id, connection_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    return {"status": "deleted"}


@router.post("/{connection_id}/refresh")
async def refresh_connection(
    connection_id: str,
    user: dict = Depends(get_current_user_dep)
):
    """Refresh connection credentials"""
    user_id = user.get("sub")
    result = await composio_service.refresh_connection(user_id, connection_id)
    
    if not result:
        raise HTTPException(status_code=400, detail="Failed to refresh connection")
    
    return {"status": "refreshed", "connection": result}


# WhatsApp user connection endpoints (no Auth0 required)
@router.post("/whatsapp/{phone_number}/connect/{toolkit_name}")
async def connect_whatsapp_user_tool(
    phone_number: str,
    toolkit_name: str,
    request: Request
):
    """Generate connection link for WhatsApp user"""
    user_id = phone_number  # Use phone number as user_id
    
    result = await composio_service.initiate_connection(
        user_id=user_id,
        toolkit=toolkit_name,
        callback_url=str(request.base_url) + "connections/whatsapp/callback"
    )
    
    return result


@router.get("/whatsapp/callback")
async def whatsapp_tool_callback(request: Request):
    """Handle OAuth callback for WhatsApp users"""
    return {"status": "connected", "message": "Tool connected! Return to WhatsApp."}


@router.get("/whatsapp/{phone_number}")
async def list_whatsapp_connections(phone_number: str):
    """List connections for a WhatsApp user"""
    connections = await composio_service.list_connections(phone_number)
    return {"connections": connections}
