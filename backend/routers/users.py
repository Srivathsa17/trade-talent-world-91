
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from utils.auth_utils import get_current_user_id, get_current_user, verify_clerk_token
from services.user_service import UserService
from schemas.user import UserCreate, UserUpdate, UserResponse, UserPublicResponse
from models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/profile", response_model=UserResponse)
def create_or_update_profile(
    user_data: UserCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create or update user profile"""
    existing_user = UserService.get_user_by_id(db, current_user_id)
    
    if existing_user:
        # Update existing user
        update_data = UserUpdate(**user_data.dict())
        user = UserService.update_user(db, current_user_id, update_data)
    else:
        # Create new user
        user = UserService.create_user(db, user_data, current_user_id)
    
    return user

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_data: UserUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    user = UserService.update_user(db, current_user_id, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("/search", response_model=List[UserPublicResponse])
def search_users(
    skill: str = None,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Search public users by skill or get all public users"""
    if skill:
        users = UserService.search_users_by_skill(db, skill)
    else:
        users = UserService.get_all_public_users(db, exclude_user_id=current_user_id)
    
    return [UserPublicResponse.from_orm(user) for user in users]

@router.post("/sync-from-clerk", response_model=UserResponse)
def sync_user_from_clerk(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Sync user data from Clerk profile"""
    # This would normally fetch from Clerk API, but for now we'll use token data
    # In a real implementation, you'd make an API call to Clerk to get the latest user data
    user = UserService.get_user_by_id(db, current_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
