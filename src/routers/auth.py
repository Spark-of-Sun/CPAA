"""Auth0 authentication routes"""
import os
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from src.services.auth import oauth, get_logout_url
from src.services.redis_client import redis_client

router = APIRouter()


@router.get("/login")
async def login(request: Request):
    """Redirect to Auth0 login"""
    redirect_uri = request.url_for("callback")
    return await oauth.auth0.authorize_redirect(request, redirect_uri)


@router.get("/callback")
async def callback(request: Request):
    """Handle Auth0 callback after login"""
    try:
        token = await oauth.auth0.authorize_access_token(request)
        
        # Store user info in session
        request.session["user"] = token
        
        # Get user info
        userinfo = token.get("userinfo", {})
        user_id = userinfo.get("sub")
        
        # Cache user session in Redis
        if user_id:
            await redis_client.set(
                f"user_session:{user_id}",
                {
                    "user_id": user_id,
                    "email": userinfo.get("email"),
                    "name": userinfo.get("name"),
                    "picture": userinfo.get("picture"),
                },
                ttl=86400  # 24 hours
            )
        
        # Debug for checking if login is working
        #userinfo = token.get("userinfo", {})
        #print(userinfo)
        # Redirect to dashboard or home
        return RedirectResponse(url="http://localhost:8000")
    
    except Exception as e:
        print("AUTH ERROR:", str(e))
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


@router.get("/logout")
async def logout(request: Request):
    """Logout user and clear session"""
    # Get user before clearing
    user = request.session.get("user", {})
    userinfo = user.get("userinfo", {})
    user_id = userinfo.get("sub")
    
    # Clear Redis session
    if user_id:
        await redis_client.delete(f"user_session:{user_id}")
    
    # Clear local session
    request.session.clear()
    
    # Redirect to Auth0 logout
    return_to = str(request.url_for("home"))
    return RedirectResponse(url=get_logout_url(return_to))


@router.get("/me")
async def get_current_user(request: Request):
    """Get current authenticated user"""
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    userinfo = user.get("userinfo", {})
    return {
        "user_id": userinfo.get("sub"),
        "email": userinfo.get("email"),
        "name": userinfo.get("name"),
        "picture": userinfo.get("picture"),
    }


# Dependency to get current user
async def get_current_user_dep(request: Request) -> dict:
    """Dependency to require authentication"""
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.get("userinfo", {})
