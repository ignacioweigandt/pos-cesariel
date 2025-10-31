"""
Tax Rate Schemas

Pydantic schemas for tax rate validation and serialization.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class TaxRateBase(BaseModel):
    """Base schema for tax rate"""

    name: str = Field(..., max_length=100, description="Display name (e.g., 'IVA General')")
    rate: float = Field(..., ge=0, le=100, description="Tax rate percentage (0-100)")
    is_active: bool = Field(default=True, description="Whether tax rate is enabled")
    is_default: bool = Field(default=False, description="Whether this is the default tax rate")
    description: Optional[str] = Field(None, max_length=255, description="Optional description")

    @validator('rate')
    def validate_rate(cls, v):
        """Ensure rate is within valid range"""
        if v < 0 or v > 100:
            raise ValueError("La tasa de impuesto debe estar entre 0% y 100%")
        return round(v, 2)  # Round to 2 decimal places

    class Config:
        from_attributes = True


class TaxRateCreate(TaxRateBase):
    """Schema for creating tax rate"""
    pass


class TaxRateUpdate(BaseModel):
    """Schema for updating tax rate"""

    name: Optional[str] = Field(None, max_length=100, description="Display name")
    rate: Optional[float] = Field(None, ge=0, le=100, description="Tax rate percentage (0-100)")
    is_active: Optional[bool] = Field(None, description="Whether tax rate is enabled")
    is_default: Optional[bool] = Field(None, description="Whether this is the default tax rate")
    description: Optional[str] = Field(None, max_length=255, description="Optional description")

    @validator('rate')
    def validate_rate(cls, v):
        """Ensure rate is within valid range"""
        if v is not None:
            if v < 0 or v > 100:
                raise ValueError("La tasa de impuesto debe estar entre 0% y 100%")
            return round(v, 2)  # Round to 2 decimal places
        return v

    class Config:
        from_attributes = True


class TaxRateResponse(TaxRateBase):
    """Schema for tax rate response"""

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
