"""SQLAlchemy database models"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, JSON, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from src.database import Base


class User(Base):
    """User account - linked to Auth0"""
    __tablename__ = "users"
    
    id = Column(String(255), primary_key=True)  # Auth0 user ID (sub)
    email = Column(String(255), unique=True, nullable=True)
    name = Column(String(255), nullable=True)
    picture = Column(Text, nullable=True)
    
    # WhatsApp linking
    whatsapp_number = Column(String(20), unique=True, nullable=True)
    whatsapp_linked_at = Column(DateTime, nullable=True)
    
    # Preferences
    preferences = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    connections = relationship("ToolConnection", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("AgentSession", back_populates="user", cascade="all, delete-orphan")


class ToolConnection(Base):
    """User's connected tool/platform via Composio"""
    __tablename__ = "tool_connections"
    
    id = Column(String(255), primary_key=True)  # Composio connection ID
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False)
    
    toolkit = Column(String(100), nullable=False)  # gmail, github, slack, etc.
    auth_config_id = Column(String(255), nullable=True)
    
    # Status
    status = Column(String(50), default="active")  # active, expired, pending
    scopes = Column(JSON, default=list)
    
    # Timestamps
    connected_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="connections")


class AgentSession(Base):
    """Agent conversation session metadata"""
    __tablename__ = "agent_sessions"
    
    id = Column(String(255), primary_key=True)  # Session ID
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False)
    
    # Session info
    session_type = Column(String(50), default="whatsapp")  # whatsapp, web
    mcp_config_id = Column(String(255), nullable=True)
    
    # Stats
    message_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="sessions")


class WhatsAppLinkingOTP(Base):
    """OTP codes for WhatsApp linking"""
    __tablename__ = "whatsapp_linking_otps"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(10), unique=True, nullable=False)
    
    # Flow type
    flow = Column(String(50), nullable=False)  # web_initiated, whatsapp_initiated
    
    # For web_initiated: Auth0 user requesting link
    auth0_user_id = Column(String(255), nullable=True)
    
    # For whatsapp_initiated: Phone number requesting link
    phone_number = Column(String(20), nullable=True)
    
    # Status
    used = Column(Boolean, default=False)
    used_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)


class MCPConfig(Base):
    """User's MCP server configuration"""
    __tablename__ = "mcp_configs"
    
    id = Column(String(255), primary_key=True)  # Composio MCP config ID
    user_id = Column(String(255), ForeignKey("users.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    toolkits = Column(JSON, default=list)  # List of toolkit configs
    allowed_tools = Column(JSON, default=list)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
