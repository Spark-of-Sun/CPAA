"""User management service"""
from datetime import datetime
from typing import Optional, List, Dict
from src.services.redis_client import redis_client


class UserService:
    """Service for managing user profiles and sessions"""
    
    async def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user profile"""
        return await redis_client.get(f"user:{user_id}")
    
    async def create_user(
        self,
        user_id: str,
        phone_number: str,
        name: Optional[str] = None
    ) -> Dict:
        """Create a new user profile"""
        profile = {
            "user_id": user_id,
            "phone_number": phone_number,
            "name": name,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "preferences": {},
            "connected_tools": []
        }
        
        await redis_client.set(f"user:{user_id}", profile, ttl=None)
        return profile
    
    async def update_user(self, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update user profile"""
        profile = await self.get_user(user_id)
        if not profile:
            return None
        
        profile.update(updates)
        profile["updated_at"] = datetime.utcnow().isoformat()
        
        await redis_client.set(f"user:{user_id}", profile, ttl=None)
        return profile
    
    async def update_preferences(self, user_id: str, preferences: Dict) -> Dict:
        """Update user preferences"""
        profile = await self.get_user(user_id)
        if not profile:
            profile = await self.create_user(user_id, "", None)
        
        current_prefs = profile.get("preferences", {})
        current_prefs.update(preferences)
        profile["preferences"] = current_prefs
        profile["updated_at"] = datetime.utcnow().isoformat()
        
        await redis_client.set(f"user:{user_id}", profile, ttl=None)
        return current_prefs
    
    async def get_user_connections(self, user_id: str) -> List[Dict]:
        """Get user's tool connections"""
        connections = await redis_client.hgetall(f"connections:{user_id}")
        return list(connections.values()) if connections else []
    
    async def add_connection(self, user_id: str, toolkit: str, connection_data: Dict):
        """Add a tool connection for user"""
        await redis_client.hset(f"connections:{user_id}", toolkit, connection_data)
        
        # Update user profile
        profile = await self.get_user(user_id)
        if profile:
            tools = profile.get("connected_tools", [])
            if toolkit not in tools:
                tools.append(toolkit)
                profile["connected_tools"] = tools
                await redis_client.set(f"user:{user_id}", profile, ttl=None)
    
    async def remove_connection(self, user_id: str, toolkit: str) -> bool:
        """Remove a tool connection"""
        # Remove from connections hash
        connections = await redis_client.hgetall(f"connections:{user_id}")
        if toolkit in connections:
            # Redis hset doesn't have hdel in our wrapper, so rebuild
            del connections[toolkit]
            await redis_client.delete(f"connections:{user_id}")
            for k, v in connections.items():
                await redis_client.hset(f"connections:{user_id}", k, v)
        
        # Update user profile
        profile = await self.get_user(user_id)
        if profile:
            tools = profile.get("connected_tools", [])
            if toolkit in tools:
                tools.remove(toolkit)
                profile["connected_tools"] = tools
                await redis_client.set(f"user:{user_id}", profile, ttl=None)
        
        return True
    
    async def get_user_sessions(self, user_id: str) -> List[Dict]:
        """Get user's agent sessions"""
        sessions = await redis_client.get(f"sessions:{user_id}")
        return sessions if sessions else []
    
    async def add_session(self, user_id: str, session_id: str, session_data: Dict):
        """Add an agent session"""
        sessions = await self.get_user_sessions(user_id)
        sessions.append({
            "session_id": session_id,
            **session_data,
            "created_at": datetime.utcnow().isoformat()
        })
        await redis_client.set(f"sessions:{user_id}", sessions)
    
    async def delete_session(self, user_id: str, session_id: str) -> bool:
        """Delete an agent session"""
        sessions = await self.get_user_sessions(user_id)
        original_len = len(sessions)
        sessions = [s for s in sessions if s.get("session_id") != session_id]
        
        if len(sessions) < original_len:
            await redis_client.set(f"sessions:{user_id}", sessions)
            # Also delete the actual session data
            await redis_client.delete(f"agent_session:{session_id}")
            return True
        return False


user_service = UserService()
