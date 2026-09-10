"""WhatsApp number linking service - Phone OTP only"""
import secrets
import string
from datetime import datetime, timezone
from typing import Optional, Dict
from sqlalchemy import select
from src.services.redis_client import redis_client
from src.database import async_session
from src.models.db_models import User


class WhatsAppLinkingService:
    """
    Service for linking WhatsApp numbers to Auth0 users via Phone OTP.
    
    Single flow:
    1. User enters phone number on dashboard
    2. OTP sent to their WhatsApp
    3. User enters OTP on dashboard
    4. Account linked!
    """
    
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    
    def _generate_otp(self) -> str:
        """Generate a 6-digit OTP"""
        return ''.join(secrets.choice(string.digits) for _ in range(self.OTP_LENGTH))
    
    async def send_otp(self, auth0_user_id: str, phone_number: str) -> str:
        """
        Generate and store OTP for phone verification.
        Returns the OTP code to be sent via WhatsApp.
        """
        code = self._generate_otp()
        
        # Store OTP
        await redis_client.set(
            f"phone_otp:{auth0_user_id}:{phone_number}",
            {
                "code": code,
                "auth0_user_id": auth0_user_id,
                "phone_number": phone_number,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "attempts": 0
            },
            ttl=self.OTP_EXPIRY_MINUTES * 60
        )
        
        return code
    
    async def verify_otp(self, auth0_user_id: str, phone_number: str, code: str) -> Dict:
        """Verify OTP and link phone to user"""
        key = f"phone_otp:{auth0_user_id}:{phone_number}"
        otp_data = await redis_client.get(key)
        
        if not otp_data:
            return {"success": False, "error": "OTP expired. Please request a new one."}
        
        # Check attempts
        attempts = otp_data.get("attempts", 0)
        if attempts >= 3:
            await redis_client.delete(key)
            return {"success": False, "error": "Too many attempts. Please request a new OTP."}
        
        # Verify code
        if otp_data.get("code") != code:
            otp_data["attempts"] = attempts + 1
            await redis_client.set(key, otp_data, ttl=self.OTP_EXPIRY_MINUTES * 60)
            return {"success": False, "error": "Incorrect OTP. Please try again."}
        
        # Check if phone already linked to another user
        existing = await redis_client.get(f"whatsapp_user:{phone_number}")
        if existing and existing.get("auth0_user_id") != auth0_user_id:
            return {"success": False, "error": "This phone is already linked to another account."}
        
        # Create link
        await self._create_link(auth0_user_id, phone_number)
        
        # Cleanup
        await redis_client.delete(key)
        
        return {
            "success": True,
            "auth0_user_id": auth0_user_id,
            "phone_number": phone_number
        }
    
    async def _create_link(self, auth0_user_id: str, phone_number: str):
        """Create bidirectional link between Auth0 user and WhatsApp number"""
        # Store in database
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(User).where(User.id == auth0_user_id)
                )
                user = result.scalar_one_or_none()
                
                now = datetime.utcnow()  # naive datetime, no timezone

                if user:
                    user.whatsapp_number = phone_number
                    user.whatsapp_linked_at = now
                    user.updated_at = now
                else:
                    user = User(
                        id=auth0_user_id,
                        whatsapp_number=phone_number,
                        whatsapp_linked_at=now,
                        updated_at=now
                    )
                    session.add(user)
                
                await session.commit()
        except Exception as e:
            print(f"Error saving link to DB: {e}")
        
        # Also store in Redis for fast lookup
        await redis_client.set(f"user_whatsapp:{auth0_user_id}", phone_number, ttl=None)
        await redis_client.set(
            f"whatsapp_user:{phone_number}",
            {
                "auth0_user_id": auth0_user_id,
                "phone_number": phone_number,
                "linked_at": datetime.utcnow().isoformat()
            },
            ttl=None
        )
        
        # Sync MCP config
        mcp_config = await redis_client.get(f"user_mcp_config:{auth0_user_id}")
        if mcp_config:
            await redis_client.set(f"user_mcp_config:{phone_number}", mcp_config)
        
    async def unlink(self, auth0_user_id: str) -> bool:
        """Unlink WhatsApp from user"""
        phone = await redis_client.get(f"user_whatsapp:{auth0_user_id}")
        if not phone:
            # Try from DB
            try:
                async with async_session() as session:
                    result = await session.execute(
                        select(User).where(User.id == auth0_user_id)
                    )
                    user = result.scalar_one_or_none()
                    if user and user.whatsapp_number:
                        phone = user.whatsapp_number
            except Exception as e:
                print(f"Error getting phone from DB: {e}")
        
        if not phone:
            return False
        
        # Remove from database
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(User).where(User.id == auth0_user_id)
                )
                user = result.scalar_one_or_none()
                if user:
                    user.whatsapp_number = None
                    user.whatsapp_linked_at = None
                    await session.commit()
        except Exception as e:
            print(f"Error unlinking from DB: {e}")
        
        # Remove from Redis
        await redis_client.delete(f"user_whatsapp:{auth0_user_id}")
        await redis_client.delete(f"whatsapp_user:{phone}")
        await redis_client.delete(f"user_mcp_config:{phone}")
        
        return True
    
    async def get_status(self, auth0_user_id: str) -> Dict:
        """Get linking status - check DB first, then Redis"""
        phone = None
        linked_at = None
        
        # Check database first
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(User).where(User.id == auth0_user_id)
                )
                user = result.scalar_one_or_none()
                if user and user.whatsapp_number:
                    phone = user.whatsapp_number
                    linked_at = user.whatsapp_linked_at.isoformat() if user.whatsapp_linked_at else None
        except Exception as e:
            print(f"Error getting status from DB: {e}")
        
        # Fallback to Redis
        if not phone:
            phone = await redis_client.get(f"user_whatsapp:{auth0_user_id}")
        
        return {
            "linked": phone is not None,
            "phone_number": phone,
            "linked_at": linked_at
        }
    
    async def get_auth0_user_for_phone(self, phone_number: str) -> Optional[str]:
        """Get Auth0 user ID for a phone number - check DB first"""
        # Check database first
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(User).where(User.whatsapp_number == phone_number)
                )
                user = result.scalar_one_or_none()
                if user:
                    return user.id
        except Exception as e:
            print(f"Error getting user from DB: {e}")
        
        # Fallback to Redis
        data = await redis_client.get(f"whatsapp_user:{phone_number}")
        return data.get("auth0_user_id") if data else None
    
    async def is_phone_linked(self, phone_number: str) -> bool:
        """Check if phone is linked - check DB first"""
        # Check database first
        try:
            async with async_session() as session:
                result = await session.execute(
                    select(User).where(User.whatsapp_number == phone_number)
                )
                user = result.scalar_one_or_none()
                if user:
                    return True
        except Exception as e:
            print(f"Error checking link in DB: {e}")
        
        # Fallback to Redis
        return await redis_client.exists(f"whatsapp_user:{phone_number}")

    async def verify_phone_code(self, phone_number: str, code: str) -> Dict:
        """
        Verify a dashboard-generated code sent via WhatsApp.
        This is for reverse flow: dashboard generates code, user sends it via WhatsApp.
        """
        # Look for pending code in Redis
        key = f"dashboard_code:{code}"
        code_data = await redis_client.get(key)
        
        if not code_data:
            # Code not found - might not be a linking code
            return {"success": False, "error": "invalid_code"}
        
        auth0_user_id = code_data.get("auth0_user_id")
        if not auth0_user_id:
            return {"success": False, "error": "Invalid code data"}
        
        # Check if phone already linked to another user
        existing = await self.get_auth0_user_for_phone(phone_number)
        if existing and existing != auth0_user_id:
            return {"success": False, "error": "This phone is already linked to another account."}
        
        # Create link
        await self._create_link(auth0_user_id, phone_number)
        
        # Cleanup
        await redis_client.delete(key)
        
        return {
            "success": True,
            "auth0_user_id": auth0_user_id,
            "phone_number": phone_number
        }


whatsapp_linking = WhatsAppLinkingService()
