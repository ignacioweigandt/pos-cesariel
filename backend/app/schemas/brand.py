"""
Brand schemas for the POS Cesariel system.

This module contains Pydantic schemas for Brand validation and serialization.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BrandBase(BaseModel):
    """Base schema for Brand with common attributes."""
    name: str = Field(..., min_length=1, max_length=100, description="Nombre de la marca")
    description: Optional[str] = Field(None, description="Descripción de la marca")
    logo_url: Optional[str] = Field(None, max_length=255, description="URL del logo de la marca")


class BrandCreate(BrandBase):
    """Schema for creating a new brand."""
    pass


class BrandUpdate(BaseModel):
    """Schema for updating an existing brand."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    logo_url: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class Brand(BrandBase):
    """Schema for Brand with all fields (response model)."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic V2 (anteriormente orm_mode = True)


class BrandFormData(BaseModel):
    """Schema for brand form data from frontend."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
