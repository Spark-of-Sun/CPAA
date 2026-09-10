"""
Personal WhatsApp Agent - FastAPI Backend
A multi-platform personal assistant accessible via WhatsApp
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv

load_dotenv()

from src.routers import webhook, users, tools, connections, auth, whatsapp, linking
from src.services.redis_client import redis_client
from src.services.agent_manager import agent_manager
from src.services.trigger_service import trigger_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    await redis_client.connect()
    
    # Clear any corrupted sessions on startup
    await agent_manager.clear_all_sessions()
    
    # Start trigger listener in background
    trigger_service.start_listener()
    
    print("🚀 Personal Agent API started")
    yield
    # Shutdown
    trigger_service.stop_listener()
    await redis_client.disconnect()
    print("👋 Personal Agent API shutdown")


app = FastAPI(
    title="Personal WhatsApp Agent",
    description="Multi-platform personal assistant accessible via WhatsApp",
    version="1.0.0",
    lifespan=lifespan
)

# Session middleware for Auth0
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "change-me-in-production"),
    max_age=86400,  # 24 hours
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(webhook.router, prefix="/webhook", tags=["WhatsApp Webhook"])
app.include_router(users.router, prefix="/users", tags=["User Management"])
app.include_router(tools.router, prefix="/tools", tags=["Tool Management"])
app.include_router(connections.router, prefix="/connections", tags=["Connections"])
app.include_router(whatsapp.router, prefix="/whatsapp", tags=["WhatsApp Users"])
app.include_router(linking.router, prefix="/linking", tags=["WhatsApp Linking"])


@app.get("/", name="home")
async def home():
    """API endpoint links"""
    return {
        "service": "Personal WhatsApp Agent API",
        "version": "1.0.0",
        "endpoints": {
            "authentication": {
                "login": "/auth/login",
                "callback": "/auth/callback",
                "logout": "/auth/logout",
                "current_user": "/auth/me"
            },
            "users": {
                "my_profile": "/users/me",
                "my_connections": "/users/me/connections",
                "my_sessions": "/users/me/sessions"
            },
            "tools": {
                "available_toolkits": "/tools/available",
                "connected_tools": "/tools/connected",
                "connect_toolkit": "/tools/connect/{toolkit}",
                "callback": "/tools/callback"
            },
            "connections": {
                "list": "/connections",
                "get": "/connections/{connection_id}",
                "delete": "/connections/{connection_id}",
                "refresh": "/connections/{connection_id}/refresh"
            },
            "whatsapp": {
                "connect_tool": "/whatsapp/{phone_number}/connect/{toolkit}",
                "callback": "/whatsapp/{phone_number}/callback",
                "get_tools": "/whatsapp/{phone_number}/tools"
            },
            "linking": {
                "send_otp": "/linking/send-otp",
                "verify_otp": "/linking/verify-otp",
                "status": "/linking/status",
                "unlink": "/linking/unlink"
            },
            "webhook": {
                "whatsapp": "/webhook/whatsapp"
            },
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }



@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "personal-agent"}
