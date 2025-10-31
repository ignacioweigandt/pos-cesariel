"""
Payment schemas for POS Cesariel.

This module contains Pydantic schemas for payment configuration,
including custom installment plans with comprehensive validation.
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional, Literal
from decimal import Decimal


# =================== PAYMENT CONFIG SCHEMAS ===================

class PaymentConfigBase(BaseModel):
    payment_type: str
    card_type: Optional[str] = None
    installments: int = 1
    surcharge_percentage: Decimal = 0
    is_active: bool = True
    description: Optional[str] = None


class PaymentConfigCreate(PaymentConfigBase):
    pass


class PaymentConfigUpdate(BaseModel):
    payment_type: Optional[str] = None
    card_type: Optional[str] = None
    installments: Optional[int] = None
    surcharge_percentage: Optional[Decimal] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


class PaymentConfig(PaymentConfigBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =================== CUSTOM INSTALLMENT SCHEMAS ===================

class CustomInstallmentBase(BaseModel):
    """Base schema for custom installment plans with validation."""

    card_type: Literal["bancarizadas", "no_bancarizadas"] = Field(
        ...,
        description="Card type: 'bancarizadas' or 'no_bancarizadas'"
    )
    installments: int = Field(
        ...,
        ge=1,
        le=60,
        description="Number of installments (1-60)"
    )
    surcharge_percentage: Decimal = Field(
        ...,
        ge=Decimal("0.00"),
        le=Decimal("100.00"),
        decimal_places=2,
        description="Surcharge percentage (0.00-100.00)"
    )
    description: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Description of the installment plan"
    )

    @field_validator('surcharge_percentage')
    @classmethod
    def validate_surcharge(cls, v: Decimal) -> Decimal:
        """Validate surcharge percentage is within valid range."""
        if v < Decimal("0") or v > Decimal("100"):
            raise ValueError("Surcharge percentage must be between 0.00 and 100.00")
        return v

    @field_validator('installments')
    @classmethod
    def validate_installments(cls, v: int) -> int:
        """Validate installments is within valid range."""
        if v < 1 or v > 60:
            raise ValueError("Installments must be between 1 and 60")
        return v


class CustomInstallmentCreate(CustomInstallmentBase):
    """Schema for creating a new custom installment plan."""
    pass


class CustomInstallmentUpdate(BaseModel):
    """Schema for updating an existing custom installment plan."""

    installments: Optional[int] = Field(
        None,
        ge=1,
        le=60,
        description="Number of installments (1-60)"
    )
    surcharge_percentage: Optional[Decimal] = Field(
        None,
        ge=Decimal("0.00"),
        le=Decimal("100.00"),
        decimal_places=2,
        description="Surcharge percentage (0.00-100.00)"
    )
    description: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Description of the installment plan"
    )
    is_active: Optional[bool] = Field(
        None,
        description="Whether this plan is active"
    )

    @field_validator('surcharge_percentage')
    @classmethod
    def validate_surcharge(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Validate surcharge percentage if provided."""
        if v is not None and (v < Decimal("0") or v > Decimal("100")):
            raise ValueError("Surcharge percentage must be between 0.00 and 100.00")
        return v

    @field_validator('installments')
    @classmethod
    def validate_installments(cls, v: Optional[int]) -> Optional[int]:
        """Validate installments if provided."""
        if v is not None and (v < 1 or v > 60):
            raise ValueError("Installments must be between 1 and 60")
        return v


class CustomInstallment(CustomInstallmentBase):
    """Complete schema for custom installment plan with all fields."""

    id: int = Field(..., description="Unique identifier")
    is_active: bool = Field(True, description="Whether this plan is active")
    created_at: datetime = Field(..., description="Timestamp when created")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when last updated")

    model_config = ConfigDict(from_attributes=True)


# =================== ALLOWED CURRENCIES ===================

# Type alias for allowed currencies
CurrencyCode = Literal["ARS", "USD"]

ALLOWED_CURRENCIES = ["ARS", "USD"]
CURRENCY_NAMES = {
    "ARS": "Peso Argentino",
    "USD": "Dólar Estadounidense"
}
