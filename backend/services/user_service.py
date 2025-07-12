
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate, UserUpdate
from typing import List, Optional
import uuid

class UserService:
    @staticmethod
    def create_user(db: Session, user_data: UserCreate, clerk_id: str) -> User:
        """Create a new user linked to Clerk ID"""
        db_user = User(
            id=clerk_id,
            **user_data.dict()
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def update_user(db: Session, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user profile"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def search_users_by_skill(db: Session, skill: str) -> List[User]:
        """Search public users by offered or wanted skills"""
        return db.query(User).filter(
            User.is_public == True,
            User.is_active == True,
            User.is_banned == False,
            (User.skills_offered.contains([skill]) | User.skills_wanted.contains([skill]))
        ).all()

    @staticmethod
    def get_all_users(db: Session) -> List[User]:
        """Get all users (admin only)"""
        return db.query(User).all()

    @staticmethod
    def ban_user(db: Session, user_id: str) -> Optional[User]:
        """Ban a user (admin only)"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_banned = True
            db.commit()
            db.refresh(user)
        return user
