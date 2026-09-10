"""Mem0 Memory Service for agent long-term memory"""
import os
from typing import Optional, List, Dict
from mem0 import MemoryClient
from src.services.redis_client import redis_client


class MemoryService:
    """
    Mem0 integration for agent memory.
    Stores and retrieves user-specific memories for personalized responses.
    """
    
    def __init__(self):
        self.client: Optional[MemoryClient] = None
        self._init_client()
    
    def _init_client(self):
        """Initialize Mem0 client"""
        api_key = os.getenv("MEM0_API_KEY")
        if api_key:
            self.client = MemoryClient(api_key=api_key)
            print("✅ Mem0 memory client initialized")
        else:
            print("⚠️ MEM0_API_KEY not set - memory disabled")
    
    async def store_memory(
        self,
        user_id: str,
        content: str,
        metadata: Optional[Dict] = None
    ) -> Optional[str]:
        """Store a memory for a user"""
        if not self.client:
            return None
        
        try:
            messages = [{"role": "user", "content": content}]
            result = self.client.add(
                messages=messages,
                user_id=user_id,
                metadata=metadata or {}
            )
            return result
        except Exception as e:
            print(f"Error storing memory: {e}")
            return None
    
    async def search_memories(
        self,
        user_id: str,
        query: str,
        limit: int = 5
    ) -> List[Dict]:
        """Search memories relevant to a query"""
        if not self.client:
            return []
        
        try:
            results = self.client.search(
                query=query,
                user_id=user_id,
                limit=limit
            )
            return results.get("results", []) if isinstance(results, dict) else results
        except Exception as e:
            # Silently fail - memory is optional
            return []
    
    async def get_all_memories(self, user_id: str) -> List[Dict]:
        """Get all memories for a user"""
        if not self.client:
            return []
        
        try:
            results = self.client.get_all(user_id=user_id)
            return results.get("results", []) if isinstance(results, dict) else results
        except Exception as e:
            # Silently fail - memory is optional
            return []
    
    async def delete_memory(self, memory_id: str) -> bool:
        """Delete a specific memory"""
        if not self.client:
            return False
        
        try:
            self.client.delete(memory_id=memory_id)
            return True
        except Exception as e:
            print(f"Error deleting memory: {e}")
            return False
    
    async def delete_all_memories(self, user_id: str) -> bool:
        """Delete all memories for a user"""
        if not self.client:
            return False
        
        try:
            self.client.delete_all(user_id=user_id)
            return True
        except Exception as e:
            print(f"Error deleting all memories: {e}")
            return False
    
    def get_memory_context(self, memories: List[Dict]) -> str:
        """Format memories as context for the agent"""
        if not memories:
            return ""
        
        context_parts = ["## User Memory Context:"]
        for mem in memories:
            memory_text = mem.get("memory", mem.get("text", ""))
            if memory_text:
                context_parts.append(f"- {memory_text}")
        
        return "\n".join(context_parts)


memory_service = MemoryService()
