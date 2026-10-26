"""Configuration settings"""
import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = ""
    
    # App Secret
    secret_key: str = "change-me-in-production"
    
    # Auth0
    auth0_client_id: str = ""
    auth0_client_secret: str = ""
    auth0_domain: str = ""
    auth0_redirect_uri: str = ""
    
    # WhatsApp
    whatsapp_verify_token: str = ""
    whatsapp_access_token: str = ""
    whatsapp_phone_number_id: str = ""
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str = ""
    session_cache_ttl: int = 3600
    
    # Composio
    composio_api_key: str = ""

    # Google API (Gemini)
    gemini_api_key: str = ""
    google_api_key: str = ""
    model_provider: str = "google"
    model_id: str = "gemini-3.5-flash"

    # AWS (Optional - for Bedrock or S3 sessions)
    aws_region: str = "ap-south-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    
    # Agent Session Storage
    agent_session_type: str = "file"  # file, s3
    agent_session_dir: str = "/tmp/agent_sessions"
    s3_session_bucket: str = "agent-sessions"
    s3_session_prefix: str = "whatsapp-agent/"
    
    # Mem0
    mem0_api_key: str = ""

    @field_validator("redis_url", mode="before")
    @classmethod
    def sanitize_redis_url(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().strip('"').strip("'")
            if v.startswith("redis-cli -u "):
                v = v.removeprefix("redis-cli -u ").strip().strip('"').strip("'")
        return v

    @field_validator("model_id", mode="before")
    @classmethod
    def sanitize_model_id(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().strip('"').strip("'")
            if any(prefix in v.lower() for prefix in ["amazon", "nova", "apac.", "bedrock", "gemini-2.5-flash"]):
                return "gemini-3.5-flash"
        return v or "gemini-3.5-flash"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"  # Ignore extra env vars
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
