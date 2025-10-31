"""
Payment Method Schemas

Pydantic schemas for payment method validation and serialization.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PaymentMethodBase(BaseModel):
    """Base schema for payment method"""

    name: str = Field(..., max_length=100, description="Display name")
    code: str = Field(..., max_length=50, description="Unique code")
    icon: Optional[str] = Field(None, max_length=10, description="Emoji or icon")
    is_active: bool = Field(default=True, description="Whether method is enabled")
    requires_change: bool = Field(default=False, description="Whether requires giving change")
    description: Optional[str] = Field(None, max_length=255, description="Optional description")

    class Config:
        from_attributes = True


class PaymentMethodCreate(PaymentMethodBase):
    """Schema for creating payment method"""
    pass


class PaymentMethodUpdate(BaseModel):
    """Schema for updating payment method"""

    name: Optional[str] = Field(None, max_length=100, description="Display name")
    icon: Optional[str] = Field(None, max_length=10, description="Emoji or icon")
    is_active: Optional[bool] = Field(None, description="Whether method is enabled")
    requires_change: Optional[bool] = Field(None, description="Whether requires giving change")
    description: Optional[str] = Field(None, max_length=255, description="Optional description")

    class Config:
        from_attributes = True


class PaymentMethodResponse(PaymentMethodBase):
    """Schema for payment method response"""

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
