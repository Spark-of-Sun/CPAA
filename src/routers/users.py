"""User management routes"""
from fastapi import APIRouter, Request, Depends, HTTPException
from typing import List
from src.services.redis_client import redis_client
from src.services.user_service import user_service
from src.routers.auth import get_current_user_dep
from src.models.user import UserProfile, UserCreateRequest

router = APIRouter()


@router.get("/me")
async def get_my_profile(user: dict = Depends(get_current_user_dep)):
    """Get current user's profile"""
    user_id = user.get("sub")
    profile = await user_service.get_user(user_id)
    
    if not profile:
        # Create profile if doesn't exist
        profile = await user_service.create_user(
            user_id=user_id,
            phone_number=user.get("phone_number", ""),
            name=user.get("name")
        )
    
    return profile


@router.get("/me/connections")
async def get_my_connections(user: dict = Depends(get_current_user_dep)):
    """Get user's connected tools/platforms"""
    user_id = user.get("sub")
    connections = await user_service.get_user_connections(user_id)
    return {"connections": connections}


@router.get("/me/sessions")
async def get_my_sessions(user: dict = Depends(get_current_user_dep)):
    """Get user's agent sessions"""
    user_id = user.get("sub")
    sessions = await user_service.get_user_sessions(user_id)
    return {"sessions": sessions}


@router.delete("/me/sessions/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(get_current_user_dep)):
    """Delete a specific agent session"""
    user_id = user.get("sub")
    success = await user_service.delete_session(user_id, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted"}


@router.put("/me/preferences")
async def update_preferences(
    preferences: dict,
    user: dict = Depends(get_current_user_dep)
):
    """Update user preferences"""
    user_id = user.get("sub")
    updated = await user_service.update_preferences(user_id, preferences)
    return {"preferences": updated}


# Admin/internal endpoints for WhatsApp users
@router.post("/whatsapp/register")
async def register_whatsapp_user(phone_number: str, name: str = None):
    """Register a WhatsApp user (called internally)"""
    user_id = f"whatsapp:{phone_number}"
    
    existing = await user_service.get_user(user_id)
    if existing:
        return existing
    
    profile = await user_service.create_user(
        user_id=user_id,
        phone_number=phone_number,
        name=name
    )
    return profile


@router.get("/whatsapp/{phone_number}")
async def get_whatsapp_user(phone_number: str):
    """Get WhatsApp user profile"""
    user_id = f"whatsapp:{phone_number}"
    profile = await user_service.get_user(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile


# ============ Memory Endpoints ============

@router.get("/me/memories")
async def get_my_memories(user: dict = Depends(get_current_user_dep)):
    """Get all memories for current user"""
    from src.services.memory_service import memory_service
    
    user_id = user.get("sub")
    memories = await memory_service.get_all_memories(user_id)
    return {"memories": memories, "count": len(memories)}


@router.get("/me/memories/search")
async def search_my_memories(
    query: str,
    limit: int = 5,
    user: dict = Depends(get_current_user_dep)
):
    """Search memories for current user"""
    from src.services.memory_service import memory_service
    
    user_id = user.get("sub")
    memories = await memory_service.search_memories(user_id, query, limit)
    return {"query": query, "memories": memories}


@router.post("/me/memories")
async def add_memory(
    content: str,
    user: dict = Depends(get_current_user_dep)
):
    """Manually add a memory"""
    from src.services.memory_service import memory_service
    
    user_id = user.get("sub")
    result = await memory_service.store_memory(
        user_id=user_id,
        content=content,
        metadata={"type": "manual", "source": "dashboard"}
    )
    return {"status": "stored", "result": result}


@router.delete("/me/memories/{memory_id}")
async def delete_memory(
    memory_id: str,
    user: dict = Depends(get_current_user_dep)
):
    """Delete a specific memory"""
    from src.services.memory_service import memory_service
    
    success = await memory_service.delete_memory(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"status": "deleted"}


@router.delete("/me/memories")
async def delete_all_memories(user: dict = Depends(get_current_user_dep)):
    """Delete all memories for current user"""
    from src.services.memory_service import memory_service
    
    user_id = user.get("sub")
    success = await memory_service.delete_all_memories(user_id)
    return {"status": "deleted" if success else "failed"}
