"""
User schemas for POS Cesariel.

This module contains Pydantic schemas for user management.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.schemas.common import UserRole


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole
    branch_id: Optional[int] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    branch_id: Optional[int] = None
    is_active: Optional[bool] = None


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    branch: Optional["Branch"] = None
    
    class Config:
        from_attributes = True


# Forward reference resolution
from app.schemas.branch import Branch
User.model_rebuild()
