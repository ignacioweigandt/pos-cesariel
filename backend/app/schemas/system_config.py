"""
System Configuration Schemas

Pydantic schemas for system configuration validation and serialization.
"""

from pydantic import BaseModel, Field, validator
from typing import Literal, Optional
from datetime import datetime


class SystemConfigBase(BaseModel):
    """Base schema for system configuration"""

    default_currency: Literal["ARS", "USD"] = Field(
        default="ARS",
        description="Default currency (ARS or USD only)"
    )
    currency_symbol: str = Field(
        default="$",
        max_length=10,
        description="Currency symbol to display"
    )
    currency_position: Literal["before", "after"] = Field(
        default="before",
        description="Position of currency symbol"
    )
    decimal_places: int = Field(
        default=2,
        ge=0,
        le=2,
        description="Number of decimal places for prices (0-2)"
    )
    default_tax_rate: int = Field(
        default=0,
        ge=0,
        le=100,
        description="Default tax rate percentage"
    )
    session_timeout: int = Field(
        default=30,
        ge=5,
        le=1440,
        description="Session timeout in minutes (5-1440)"
    )

    @validator('default_currency')
    def validate_currency(cls, v):
        """Ensure only ARS or USD are allowed"""
        if v not in ["ARS", "USD"]:
            raise ValueError("Solo se permiten las monedas ARS (Peso Argentino) y USD (Dólar Estadounidense)")
        return v

    class Config:
        from_attributes = True


class SystemConfigCreate(SystemConfigBase):
    """Schema for creating system configuration"""
    pass


class SystemConfigUpdate(BaseModel):
    """Schema for updating system configuration"""

    default_currency: Optional[Literal["ARS", "USD"]] = Field(
        default=None,
        description="Default currency (ARS or USD only)"
    )
    currency_symbol: Optional[str] = Field(
        default=None,
        max_length=10,
        description="Currency symbol to display"
    )
    currency_position: Optional[Literal["before", "after"]] = Field(
        default=None,
        description="Position of currency symbol"
    )
    decimal_places: Optional[int] = Field(
        default=None,
        ge=0,
        le=2,
        description="Number of decimal places for prices (0-2)"
    )
    default_tax_rate: Optional[int] = Field(
        default=None,
        ge=0,
        le=100,
        description="Default tax rate percentage"
    )
    session_timeout: Optional[int] = Field(
        default=None,
        ge=5,
        le=1440,
        description="Session timeout in minutes (5-1440)"
    )

    @validator('default_currency')
    def validate_currency(cls, v):
        """Ensure only ARS or USD are allowed"""
        if v is not None and v not in ["ARS", "USD"]:
            raise ValueError("Solo se permiten las monedas ARS (Peso Argentino) y USD (Dólar Estadounidense)")
        return v

    class Config:
        from_attributes = True


class SystemConfigResponse(SystemConfigBase):
    """Schema for system configuration response"""

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Add read-only system info fields
    app_name: str = Field(default="POS Cesariel", description="Application name")
    version: str = Field(default="1.0.0", description="Application version")
    environment: str = Field(default="development", description="Environment")

    class Config:
        from_attributes = True


class CurrencyConfigResponse(BaseModel):
    """Schema for currency configuration only (subset of SystemConfig)"""

    default_currency: Literal["ARS", "USD"]
    currency_symbol: str
    currency_position: Literal["before", "after"]
    decimal_places: int

    class Config:
        from_attributes = True
