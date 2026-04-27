"""Auth0 authentication service for FastAPI"""
import os
from typing import Optional, Dict
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from src.config import settings

# OAuth setup
oauth = OAuth()

oauth.register(
    name="auth0",
    client_id=os.getenv("AUTH0_CLIENT_ID"),
    client_secret=os.getenv("AUTH0_CLIENT_SECRET"),
    client_kwargs={"scope": "openid profile email"},
    server_metadata_url=f'https://{os.getenv("AUTH0_DOMAIN")}/.well-known/openid-configuration'
)


def get_logout_url(return_to: str) -> str:
    """Generate Auth0 logout URL"""
    from urllib.parse import quote_plus, urlencode
    return (
        f"https://{os.getenv('AUTH0_DOMAIN')}/v2/logout?"
        + urlencode(
            {
                "returnTo": return_to,
                "client_id": os.getenv("AUTH0_CLIENT_ID"),
            },
            quote_via=quote_plus,
        )
    )
