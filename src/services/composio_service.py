"""Composio integration service - Tool connections via Connect Link"""
import os
import httpx
from datetime import datetime, timezone
from typing import List, Optional, Dict
from composio import Composio
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.services.redis_client import redis_client
from src.database import async_session
from src.models.db_models import ToolConnection, User


# Icon mapping for toolkits
TOOLKIT_ICONS = {
    "gmail": "📧", "googlecalendar": "📅", "googledrive": "📁",
    "github": "🐙", "slack": "💬", "notion": "📝",
    "linear": "📋", "twitter": "🐦", "trello": "📌",
    "spotify": "🎵", "discord": "🎮", "jira": "📊",
    "asana": "✅", "dropbox": "📦", "zoom": "📹",
    "google_calendar": "📅", "google_drive": "📁",
    "youtube": "📺", "linkedin": "💼", "instagram": "📷",
    "whatsapp": "💬", "telegram": "✈️", "microsoft_teams": "👥",
}


class ComposioService:
    """Service for Composio tool connections using Connect Link"""
    
    def __init__(self):
        self.api_key = os.getenv("COMPOSIO_API_KEY", "")
        self.base_url = "https://backend.composio.dev/api/v3"
        self.client: Optional[Composio] = None
        if self.api_key:
            self.client = Composio(api_key=self.api_key)
    
    async def fetch_auth_configs(self) -> List[Dict]:
        """
        Fetch all auth configs from Composio API.
        These are the toolkits configured in your Composio dashboard.
        """
        if not self.api_key:
            return []
        
        # Check cache first (5 min TTL)
        cached = await redis_client.get("composio_auth_configs")
        if cached:
            return cached
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/auth_configs",
                    headers={"x-api-key": self.api_key},
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    print(f"Error fetching auth configs: {response.status_code}")
                    return []
                
                data = response.json()
                items = data.get("items", [])
                
                # Transform to simpler format
                configs = []
                for item in items:
                    toolkit = item.get("toolkit", {})
                    toolkit_slug = toolkit.get("slug", "").lower()
                    
                    configs.append({
                        "id": item.get("id"),
                        "name": item.get("name"),
                        "toolkit": toolkit_slug,
                        "toolkit_logo": toolkit.get("logo"),
                        "auth_scheme": item.get("auth_scheme"),
                        "status": item.get("status"),
                        "is_composio_managed": item.get("is_composio_managed", False),
                        "connections_count": item.get("no_of_connections", 0),
                    })
                
                # Cache for 5 minutes
                await redis_client.set("composio_auth_configs", configs, ttl=300)
                
                return configs
                
        except Exception as e:
            print(f"Error fetching auth configs: {e}")
            return []
    
    async def get_available_toolkits(self) -> List[Dict]:
        """Get list of available toolkits from auth configs"""
        configs = await self.fetch_auth_configs()
        
        # Only return enabled configs
        return [
            {
                "name": c.get("toolkit"),
                "label": c.get("name") or c.get("toolkit", "").replace("_", " ").title(),
                "icon": TOOLKIT_ICONS.get(c.get("toolkit"), "🔧"),
                "logo": c.get("toolkit_logo"),
                "auth_config_id": c.get("id"),
                "auth_scheme": c.get("auth_scheme"),
                "status": c.get("status"),
            }
            for c in configs
            if c.get("status") == "ENABLED"
        ]
    
    async def get_auth_config_id(self, toolkit: str) -> Optional[str]:
        """Get auth config ID for a toolkit"""
        configs = await self.fetch_auth_configs()
        for c in configs:
            if c.get("toolkit") == toolkit.lower() and c.get("status") == "ENABLED":
                return c.get("id")
        return None
    
    async def initiate_connection(
        self,
        user_id: str,
        toolkit: str,
        callback_url: str
    ) -> Dict:
        """
        Initiate tool connection using Composio Connect Link.
        Returns redirect URL for user to complete OAuth.
        """
        if not self.client:
            return {"error": "Composio not configured. Set COMPOSIO_API_KEY."}
        
        auth_config_id = await self.get_auth_config_id(toolkit)
        if not auth_config_id:
            return {"error": f"No auth config found for {toolkit}. Create one at platform.composio.dev/auth-configs"}
        
        try:
            # Use Connect Link for hosted authentication
            connection_request = self.client.connected_accounts.link(
                user_id=user_id,
                auth_config_id=auth_config_id,
                callback_url=callback_url
            )
            
            # Store pending connection in database
            await self._save_connection_to_db(
                connection_id=connection_request.id,
                user_id=user_id,
                toolkit=toolkit,
                auth_config_id=auth_config_id,
                status="pending"
            )
            
            return {
                "redirect_url": connection_request.redirect_url,
                "connection_id": connection_request.id,
                "toolkit": toolkit
            }
            
        except Exception as e:
            print(f"Error initiating connection: {e}")
            return {"error": str(e)}
    
    async def _save_connection_to_db(
        self,
        connection_id: str,
        user_id: str,
        toolkit: str,
        auth_config_id: str,
        status: str = "active"
    ):
        """Save or update tool connection in database"""
        # Clean toolkit name - extract slug if it's an object representation
        toolkit_clean = toolkit.lower()
        if "slug='" in toolkit_clean:
            # Extract slug from "itemtoolkit(slug='gmail')" format
            import re
            match = re.search(r"slug='([^']+)'", toolkit_clean)
            if match:
                toolkit_clean = match.group(1)
        
        try:
            async with async_session() as session:
                # Check if connection exists
                result = await session.execute(
                    select(ToolConnection).where(
                        ToolConnection.user_id == user_id,
                        ToolConnection.toolkit == toolkit_clean
                    )
                )
                existing = result.scalar_one_or_none()
                
                # Use naive datetime for DB (no timezone)
                now = datetime.utcnow()
                
                if existing:
                    # Update existing
                    existing.id = connection_id
                    existing.auth_config_id = auth_config_id
                    existing.status = status
                    existing.connected_at = now
                else:
                    # Create new
                    connection = ToolConnection(
                        id=connection_id,
                        user_id=user_id,
                        toolkit=toolkit_clean,
                        auth_config_id=auth_config_id,
                        status=status,
                        connected_at=now
                    )
                    session.add(connection)
                
                await session.commit()
        except Exception as e:
            print(f"Error saving connection to DB: {e}")
    
    async def get_user_connections(self, user_id: str) -> List[Dict]:
        """Get user's active connections from DB and sync with Composio"""
        # First get from database
        db_connections = await self._get_connections_from_db(user_id)
        
        # Then sync with Composio to update statuses
        if self.client:
            try:
                composio_connections = self.client.connected_accounts.list(
                    user_ids=[user_id],
                    statuses=["ACTIVE"]
                )
                
                # Update DB with Composio status
                for c in composio_connections.items:
                    # Try to extract toolkit name
                    toolkit = None
                    
                    # Try toolkit.slug first (nested object)
                    if hasattr(c, 'toolkit') and c.toolkit:
                        if hasattr(c.toolkit, 'slug'):
                            toolkit = c.toolkit.slug
                        elif isinstance(c.toolkit, dict):
                            toolkit = c.toolkit.get('slug')
                        elif isinstance(c.toolkit, str):
                            toolkit = c.toolkit
                    
                    # Try other attribute names
                    if not toolkit:
                        for attr in ['app_name', 'appName', 'app']:
                            if hasattr(c, attr):
                                val = getattr(c, attr)
                                if val:
                                    if hasattr(val, 'slug'):
                                        toolkit = val.slug
                                    elif isinstance(val, str):
                                        toolkit = val
                                    break
                    
                    if not toolkit:
                        toolkit = "unknown"
                    
                    toolkit = toolkit.lower() if isinstance(toolkit, str) else str(toolkit).lower()
                    conn_id = c.id if hasattr(c, 'id') else str(c)
                    
                    await self._save_connection_to_db(
                        connection_id=conn_id,
                        user_id=user_id,
                        toolkit=toolkit,
                        auth_config_id="",
                        status="active"
                    )
                
                # Return fresh data
                db_connections = await self._get_connections_from_db(user_id)
                
            except Exception as e:
                print(f"Error syncing with Composio: {e}")
                import traceback
                traceback.print_exc()
        
        return db_connections
    
    async def _get_connections_from_db(self, user_id: str) -> List[Dict]:
        """Get connections from database"""
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(ToolConnection).where(
                        ToolConnection.user_id == user_id
                    )
                )
                connections = result.scalars().all()
                
                return [
                    {
                        "id": c.id,
                        "toolkit": c.toolkit,
                        "status": c.status,
                        "connected_at": c.connected_at.isoformat() if c.connected_at else None,
                        "last_used_at": c.last_used_at.isoformat() if c.last_used_at else None
                    }
                    for c in connections
                ]
        except Exception as e:
            print(f"Error getting connections from DB: {e}")
            return []
    
    async def disconnect(self, user_id: str, toolkit: str) -> bool:
        """Disconnect a toolkit - remove from DB"""
        try:
            async with async_session() as session:
                await session.execute(
                    delete(ToolConnection).where(
                        ToolConnection.user_id == user_id,
                        ToolConnection.toolkit == toolkit.lower()
                    )
                )
                await session.commit()
                return True
        except Exception as e:
            print(f"Error disconnecting: {e}")
            return False
    
    async def get_connection_status(self, user_id: str, toolkit: str) -> str:
        """Get connection status for a toolkit from DB"""
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(ToolConnection).where(
                        ToolConnection.user_id == user_id,
                        ToolConnection.toolkit == toolkit.lower()
                    )
                )
                connection = result.scalar_one_or_none()
                
                if connection:
                    return connection.status
                return "not_connected"
        except Exception as e:
            print(f"Error getting status: {e}")
            return "not_connected"
    
    async def update_connection_last_used(self, user_id: str, toolkit: str):
        """Update last_used_at timestamp for a connection"""
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(ToolConnection).where(
                        ToolConnection.user_id == user_id,
                        ToolConnection.toolkit == toolkit.lower()
                    )
                )
                connection = result.scalar_one_or_none()
                
                if connection:
                    connection.last_used_at = datetime.now(timezone.utc)
                    await session.commit()
        except Exception as e:
            print(f"Error updating last_used: {e}")
    
    async def refresh_cache(self) -> List[Dict]:
        """Force refresh auth configs cache"""
        await redis_client.delete("composio_auth_configs")
        return await self.fetch_auth_configs()


composio_service = ComposioService()
