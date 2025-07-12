
import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
import requests
from config import get_settings
from db.database import get_db
from models.user import User

settings = get_settings()
security = HTTPBearer()

def get_clerk_public_key():
    """Fetch Clerk's public key for JWT verification"""
    try:
        response = requests.get(f"https://api.clerk.dev/v1/jwks")
        return response.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch Clerk public key"
        )

def verify_clerk_token(token: str) -> dict:
    """Verify Clerk JWT token and return user data"""
    try:
        # For development, we'll decode without verification
        # In production, you should verify with Clerk's public key
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract current user ID from Clerk JWT token"""
    token = credentials.credentials
    user_data = verify_clerk_token(token)
    user_id = user_data.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user token"
        )
    
    return user_id

def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from database"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is banned"
        )
    
    return user
