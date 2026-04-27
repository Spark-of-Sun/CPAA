"""User and session models"""
from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """User profile stored in database"""
    user_id: str  # WhatsApp phone number or unique ID
    phone_number: str
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    preferences: Dict = Field(default_factory=dict)
    connected_tools: List[str] = Field(default_factory=list)


class ToolConnection(BaseModel):
    """User's connected tool/platform"""
    user_id: str
    toolkit: str  # e.g., "gmail", "github", "slack"
    connected_account_id: str
    auth_config_id: str
    status: str = "active"  # active, expired, pending
    connected_at: datetime = Field(default_factory=datetime.utcnow)
    scopes: List[str] = Field(default_factory=list)


class AgentSession(BaseModel):
    """Agent conversation session"""
    session_id: str
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    message_count: int = 0


class WhatsAppMessage(BaseModel):
    """Incoming WhatsApp message"""
    from_number: str
    message_id: str
    timestamp: str
    text: Optional[str] = None
    message_type: str = "text"


class ConnectToolRequest(BaseModel):
    """Request to connect a new tool"""
    toolkit: str
    auth_config_id: str
    callback_url: Optional[str] = None


class UserCreateRequest(BaseModel):
    """Request to create/register a user"""
    phone_number: str
    name: Optional[str] = None
