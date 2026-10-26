"""Redis client for session and cache management"""
import json
from typing import Optional, Any
import redis.asyncio as redis
from src.config import settings


class RedisClient:
    def __init__(self):
        self.client: Optional[redis.Redis] = None
    
    async def connect(self):
        self.client = redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True
        )
        await self.client.ping()
        print("✅ Redis connected")

    async def _ensure_connected(self):
        if self.client is None:
            await self.connect()
    
    async def disconnect(self):
        if self.client:
            await self.client.close()
            self.client = None
    
    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        await self._ensure_connected()
        if not self.client:
            return False
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        return await self.client.set(key, value, ex=ttl or settings.session_cache_ttl)
    
    async def get(self, key: str) -> Optional[Any]:
        await self._ensure_connected()
        if not self.client:
            return None
        value = await self.client.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    
    async def delete(self, key: str) -> bool:
        await self._ensure_connected()
        if not self.client:
            return False
        return await self.client.delete(key) > 0
    
    async def exists(self, key: str) -> bool:
        await self._ensure_connected()
        if not self.client:
            return False
        return await self.client.exists(key) > 0
    
    async def hset(self, name: str, key: str, value: Any):
        await self._ensure_connected()
        if not self.client:
            return None
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        return await self.client.hset(name, key, value)
    
    async def hget(self, name: str, key: str) -> Optional[Any]:
        await self._ensure_connected()
        if not self.client:
            return None
        value = await self.client.hget(name, key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    
    async def hgetall(self, name: str) -> dict:
        await self._ensure_connected()
        if not self.client:
            return {}
        data = await self.client.hgetall(name)
        result = {}
        for k, v in data.items():
            try:
                result[k] = json.loads(v)
            except json.JSONDecodeError:
                result[k] = v
        return result


redis_client = RedisClient()
