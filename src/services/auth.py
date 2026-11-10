"""Auth0 authentication service for FastAPI"""
import os
import json
from typing import Optional, Dict
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from src.config import settings
from src.services.redis_client import redis_client


class AuthlibCacheAdapter:
    """Async cache adapter for Authlib using Redis with in-memory fallback.
    Prevents CSRF state mismatch errors across different hosts/ports/cookies.
    """
    def __init__(self):
        self._memory = {}

    async def get(self, key: str) -> Optional[str]:
        # 1. Try Redis
        try:
            await redis_client._ensure_connected()
            if redis_client.client:
                val = await redis_client.client.get(key)
                if val is not None:
                    return val
        except Exception:
            pass
        # 2. Fallback to memory
        return self._memory.get(key)

    async def set(self, key: str, value: str, expires_in: int = 300):
        # Store in memory
        self._memory[key] = value
        # Store in Redis
        try:
            await redis_client._ensure_connected()
            if redis_client.client:
                await redis_client.client.set(key, value, ex=expires_in)
        except Exception:
            pass

    async def delete(self, key: str):
        self._memory.pop(key, None)
        try:
            await redis_client._ensure_connected()
            if redis_client.client:
                await redis_client.client.delete(key)
        except Exception:
            pass


authlib_cache = AuthlibCacheAdapter()
oauth = OAuth(cache=authlib_cache)

auth0_domain = (os.getenv("AUTH0_DOMAIN") or settings.auth0_domain or "").removeprefix("https://").strip("/")
auth0_client_id = os.getenv("AUTH0_CLIENT_ID") or settings.auth0_client_id
auth0_client_secret = os.getenv("AUTH0_CLIENT_SECRET") or settings.auth0_client_secret

oauth.register(
    name="auth0",
    client_id=auth0_client_id,
    client_secret=auth0_client_secret,
    client_kwargs={"scope": "openid profile email"},
    server_metadata_url=f"https://{auth0_domain}/.well-known/openid-configuration"
)


def get_logout_url(return_to: str) -> str:
    """Generate Auth0 logout URL"""
    from urllib.parse import quote_plus, urlencode
    return (
        f"https://{auth0_domain}/v2/logout?"
        + urlencode(
            {
                "returnTo": return_to,
                "client_id": auth0_client_id,
            },
            quote_via=quote_plus,
        )
    )

