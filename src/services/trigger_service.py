"""
Composio Trigger Service - Gmail triggers with queuing
Sets up triggers and queues events for users to review
"""
import os
import json
import threading
from typing import Optional, Dict, List
from datetime import datetime, timezone
from composio import Composio
import redis

# Queue settings
EMAIL_QUEUE_KEY = "email_queue:{user_id}"
EMAIL_QUEUE_TTL = 7 * 24 * 60 * 60  # 7 days
MAX_QUEUED_EMAILS = 50


class TriggerService:
    """Manages Composio triggers and event queuing"""
    
    def __init__(self):
        self.composio_api_key = os.getenv("COMPOSIO_API_KEY", "")
        self._composio_client: Optional[Composio] = None
        self._subscription = None
        self._triggers: Dict[str, str] = {}  # user_id -> trigger_id
        self._running = False
        
        # Sync Redis client for background thread
        self._sync_redis: Optional[redis.Redis] = None
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            self._sync_redis = redis.from_url(redis_url, decode_responses=True)
        
        if self.composio_api_key:
            self._composio_client = Composio(api_key=self.composio_api_key)
            print("✅ Trigger service initialized")
    
    async def setup_gmail_trigger(self, user_id: str) -> Optional[str]:
        """Setup Gmail trigger for a user"""
        from src.services.redis_client import redis_client
        
        if not self._composio_client:
            return None
        
        # Check if trigger already exists
        cache_key = f"user_trigger:{user_id}"
        existing_trigger = await redis_client.get(cache_key)
        if existing_trigger:
            self._triggers[user_id] = existing_trigger
            print(f"📧 Using existing trigger for {user_id}: {existing_trigger}")
            return existing_trigger
        
        try:
            trigger = self._composio_client.triggers.create(
                user_id=user_id,
                slug="GMAIL_NEW_GMAIL_MESSAGE",
                trigger_config={
                    "labelIds": "INBOX",
                    "userId": "me",
                    "interval": 1
                }
            )
            
            trigger_id = trigger.trigger_id
            
            # Cache trigger ID
            await redis_client.set(cache_key, trigger_id, ttl=None)
            self._triggers[user_id] = trigger_id
            
            print(f"✅ Created Gmail trigger for {user_id}: {trigger_id}")
            return trigger_id
            
        except Exception as e:
            print(f"❌ Failed to create trigger: {e}")
            return None
    
    async def queue_email_event(self, user_id: str, email_data: dict):
        """Queue an email event for a user"""
        from src.services.redis_client import redis_client
        queue_key = EMAIL_QUEUE_KEY.format(user_id=user_id)
        
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": email_data
        }
        
        try:
            # Get current queue
            current_queue = await redis_client.get(queue_key) or []
            if not isinstance(current_queue, list):
                current_queue = []
            
            # Add new event at the beginning
            current_queue.insert(0, event)
            
            # Trim to max size
            current_queue = current_queue[:MAX_QUEUED_EMAILS]
            
            # Save back
            await redis_client.set(queue_key, current_queue, ttl=EMAIL_QUEUE_TTL)
            
        except Exception as e:
            print(f"❌ Failed to queue email: {e}")

    async def get_queued_emails(self, user_id: str, limit: int = 10) -> List[dict]:
        """Get queued emails for a user"""
        from src.services.redis_client import redis_client
        queue_key = EMAIL_QUEUE_KEY.format(user_id=user_id)
        
        try:
            queue = await redis_client.get(queue_key) or []
            return queue[:limit]
        except Exception:
            return []
    
    async def clear_email_queue(self, user_id: str):
        """Clear email queue for a user"""
        from src.services.redis_client import redis_client
        queue_key = EMAIL_QUEUE_KEY.format(user_id=user_id)
        await redis_client.delete(queue_key)
    
    async def get_email_summary(self, user_id: str) -> str:
        """Get a summary of queued emails"""
        emails = await self.get_queued_emails(user_id, limit=10)
        
        if not emails:
            return "No new emails in queue."
        
        summary_parts = [f"*📬 {len(emails)} Recent Emails:*\n"]
        
        for i, email in enumerate(emails[:5], 1):
            data = email.get("data", {})
            subject = data.get("subject", "No subject")[:50]
            sender = data.get("from", data.get("sender", "Unknown"))
            timestamp = email.get("timestamp", "")[:10]
            
            summary_parts.append(f"{i}. *{subject}*")
            summary_parts.append(f"   From: {sender}")
            if timestamp:
                summary_parts.append(f"   Date: {timestamp}")
            summary_parts.append("")
        
        if len(emails) > 5:
            summary_parts.append(f"_...and {len(emails) - 5} more_")
        
        return "\n".join(summary_parts)
    
    def start_listener(self):
        """Start the trigger subscription listener in background thread"""
        if not self._composio_client or self._running:
            return
        
        def _listen():
            try:
                self._subscription = self._composio_client.triggers.subscribe()
                self._running = True
                print("🎧 Trigger listener started")
                
                @self._subscription.handle()
                def handle_event(data):
                    self._handle_trigger_event(data)
                
                self._subscription.wait_forever()
            except Exception as e:
                print(f"❌ Trigger listener error: {e}")
                self._running = False
        
        thread = threading.Thread(target=_listen, daemon=True)
        thread.start()
    
    def _handle_trigger_event(self, data: dict):
        """Handle incoming trigger event (runs in background thread)"""
        try:
            trigger_id = data.get("trigger_id", "")
            payload = data.get("payload", {})
            
            # Find user for this trigger
            user_id = None
            for uid, tid in self._triggers.items():
                if tid == trigger_id:
                    user_id = uid
                    break
            
            if not user_id:
                # Try to get from metadata
                user_id = data.get("user_id", data.get("metadata", {}).get("user_id"))
            
            if user_id and payload:
                # Queue using sync Redis (we're in a background thread)
                self._queue_email_sync(user_id, payload)
                print(f"📧 Received & queued email for {user_id}")
                
        except Exception as e:
            print(f"❌ Error handling trigger: {e}")
    
    def _queue_email_sync(self, user_id: str, email_data: dict):
        """Queue email using sync Redis (for background thread)"""
        if not self._sync_redis:
            print("❌ Sync Redis not available")
            return
        
        queue_key = EMAIL_QUEUE_KEY.format(user_id=user_id)
        
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": email_data
        }
        
        try:
            # Get current queue
            raw = self._sync_redis.get(queue_key)
            current_queue = json.loads(raw) if raw else []
            
            # Add new event
            current_queue.insert(0, event)
            current_queue = current_queue[:MAX_QUEUED_EMAILS]
            
            # Save back
            self._sync_redis.setex(queue_key, EMAIL_QUEUE_TTL, json.dumps(current_queue))
            print(f"📬 Queued email for {user_id}")
            
        except Exception as e:
            print(f"❌ Failed to queue email: {e}")
    
    def stop_listener(self):
        """Stop the trigger listener"""
        self._running = False
        if self._subscription:
            try:
                self._subscription.close()
            except Exception:
                pass


trigger_service = TriggerService()
