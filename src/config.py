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
    auth0_redirect_url: str = ""
    
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

    # AI Models & Providers
    # Mode 1: "bedrock" (AWS Bedrock Nova Pro)
    # Mode 2: "google" (Google Free Tier API)
    model_provider: str = "bedrock"
    model_id: str = ""

    # Google API (Gemini Free Tier)
    gemini_api_key: str = ""
    google_api_key: str = ""

    # AWS (Bedrock & S3 Sessions)
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

    @field_validator("model_provider", mode="before")
    @classmethod
    def sanitize_model_provider(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().strip('"').strip("'").lower()
            if v in ("nova", "bedrock", "aws", "aws_bedrock"):
                return "bedrock"
            if v in ("google", "gemini"):
                return "google"
        return v or "bedrock"

    @field_validator("model_id", mode="before")
    @classmethod
    def sanitize_model_id(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().strip('"').strip("'")
        return v or ""

    def get_effective_model_id(self) -> str:
        """Returns the configured model_id or the optimal default for the provider."""
        provider = self.model_provider.lower()
        if self.model_id:
            # Prevent accidental mismatch (e.g. google model when provider is bedrock)
            if provider == "bedrock" and "gemini" in self.model_id.lower():
                pass
            elif provider == "google" and ("nova" in self.model_id.lower() or "amazon" in self.model_id.lower() or "apac." in self.model_id.lower()):
                pass
            else:
                return self.model_id

        if provider == "bedrock":
            region = (self.aws_region or "ap-south-1").lower()
            if "ap-" in region or "apac" in region:
                return "apac.amazon.nova-pro-v1:0"
            return "amazon.nova-pro-v1:0"
        return "gemini-3.5-flash"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"  # Ignore extra env vars
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
