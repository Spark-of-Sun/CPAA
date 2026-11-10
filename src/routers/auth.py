"""Auth0 authentication routes"""
import os
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from src.services.auth import oauth, get_logout_url
from src.services.redis_client import redis_client
from src.database import async_session
from src.models.db_models import User
from src.config import settings
from sqlalchemy import select
from datetime import datetime

router = APIRouter()


@router.get("/login")
async def login(request: Request):
    """Redirect to Auth0 login"""
    redirect_uri = (
        os.getenv("AUTH0_REDIRECT_URI")
        or os.getenv("AUTH0_REDIRECT_URL")
        or settings.auth0_redirect_uri
    )
    if redirect_uri:
        if redirect_uri.endswith("/auth/authorize"):
            redirect_uri = redirect_uri[:-len("/auth/authorize")] + "/auth/callback"
    else:
        redirect_uri = str(request.url_for("callback"))
        if request.headers.get("x-forwarded-proto") == "https" and redirect_uri.startswith("http://"):
            redirect_uri = redirect_uri.replace("http://", "https://", 1)

    return await oauth.auth0.authorize_redirect(request, redirect_uri)


@router.get("/callback")
@router.get("/authorize")
async def callback(request: Request):
    """Handle Auth0 callback after login"""
    try:
        token = await oauth.auth0.authorize_access_token(request)
        
        # Store user info in session
        request.session["user"] = token
        
        # Get user info
        userinfo = token.get("userinfo", {})
        user_id = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name")
        picture = userinfo.get("picture")

        # Save to database
        if user_id:
            try:
                async with async_session() as session:
                    result = await session.execute(
                        select(User).where(User.id == user_id)
                    )
                    user = result.scalar_one_or_none()
                    
                    if user:
                        # Update existing user
                        user.email = email
                        user.name = name
                        user.picture = picture
                        user.last_active_at = datetime.utcnow()
                    else:
                        # Create new user
                        user = User(
                            id=user_id,
                            email=email,
                            name=name,
                            picture=picture,
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow(),
                        )
                        session.add(user)
                    
                    await session.commit()
                    print(f"✅ User saved to DB: {user_id}")
            except Exception as e:
                print(f"❌ Error saving user to DB: {e}")

        # Cache user session in Redis
        if user_id:
            await redis_client.set(
                f"user_session:{user_id}",
                {
                    "user_id": user_id,
                    "email": email,
                    "name": name,
                    "picture": picture,
                },
                ttl=86400  # 24 hours
            )
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        response = RedirectResponse(url=f"{frontend_url}/dashboard")
        if user_id:
            response.set_cookie(
                key="cpaa_user_id",
                value=user_id,
                max_age=86400,
                path="/",
                httponly=False,
                samesite="lax",
            )
        return response
    
    except Exception as e:
        print("AUTH ERROR:", str(e))
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


@router.get("/logout")
async def logout(request: Request):
    """Logout user and clear session"""
    user = request.session.get("user", {})
    userinfo = user.get("userinfo", {})
    user_id = userinfo.get("sub") or request.cookies.get("cpaa_user_id")
    
    if user_id:
        await redis_client.delete(f"user_session:{user_id}")
    
    request.session.clear()
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    response = RedirectResponse(url=get_logout_url(frontend_url))
    response.delete_cookie(key="cpaa_user_id", path="/")
    response.delete_cookie(key="session", path="/")
    return response


@router.get("/me")
async def get_current_user(request: Request):
    """Get current authenticated user"""
    user = request.session.get("user")
    if user:
        userinfo = user.get("userinfo", {})
        return {
            "user_id": userinfo.get("sub"),
            "email": userinfo.get("email"),
            "name": userinfo.get("name"),
            "picture": userinfo.get("picture"),
        }
    
    # Fallback to cpaa_user_id cookie verified against Redis
    user_id = request.cookies.get("cpaa_user_id")
    if user_id:
        cached = await redis_client.get(f"user_session:{user_id}")
        if cached and isinstance(cached, dict):
            request.session["user"] = {"userinfo": cached}
            return {
                "user_id": cached.get("user_id", user_id),
                "email": cached.get("email"),
                "name": cached.get("name"),
                "picture": cached.get("picture"),
            }
    
    raise HTTPException(status_code=401, detail="Not authenticated")


# Dependency to get current user
async def get_current_user_dep(request: Request) -> dict:
    """Dependency to require authentication"""
    user = request.session.get("user")
    if user:
        return user.get("userinfo", {})
    
    user_id = request.cookies.get("cpaa_user_id")
    if user_id:
        cached = await redis_client.get(f"user_session:{user_id}")
        if cached and isinstance(cached, dict):
            request.session["user"] = {"userinfo": cached}
            return cached

    raise HTTPException(status_code=401, detail="Not authenticated")
