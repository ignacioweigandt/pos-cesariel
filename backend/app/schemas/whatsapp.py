"""
WhatsApp schemas for POS Cesariel.

This module contains Pydantic schemas for WhatsApp integration and sales.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


# WhatsApp Config Schemas
class WhatsAppConfigBase(BaseModel):
    business_phone: str
    business_name: str
    welcome_message: Optional[str] = None
    business_hours: Optional[str] = None
    auto_response_enabled: bool = False
    is_active: bool = True


class WhatsAppConfigCreate(WhatsAppConfigBase):
    pass


class WhatsAppConfigUpdate(BaseModel):
    business_phone: Optional[str] = None
    business_name: Optional[str] = None
    welcome_message: Optional[str] = None
    business_hours: Optional[str] = None
    auto_response_enabled: Optional[bool] = None
    is_active: Optional[bool] = None


class WhatsAppConfig(WhatsAppConfigBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# WhatsApp Sale Schemas
class WhatsAppSaleBase(BaseModel):
    sale_id: int
    customer_whatsapp: str
    customer_name: str
    customer_address: Optional[str] = None
    shipping_method: Optional[str] = None
    shipping_cost: Decimal = 0
    notes: Optional[str] = None
    whatsapp_chat_url: Optional[str] = None


class WhatsAppSaleCreate(WhatsAppSaleBase):
    pass


class WhatsAppSaleUpdate(BaseModel):
    customer_whatsapp: Optional[str] = None
    customer_name: Optional[str] = None
    customer_address: Optional[str] = None
    shipping_method: Optional[str] = None
    shipping_cost: Optional[Decimal] = None
    notes: Optional[str] = None
    whatsapp_chat_url: Optional[str] = None


class WhatsAppSale(WhatsAppSaleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    sale: Optional["Sale"] = None
    
    class Config:
        from_attributes = True


# WhatsApp Sale with Full Details
class WhatsAppSaleWithDetails(WhatsAppSale):
    sale: "Sale"


# Forward reference resolution
from app.schemas.sale import Sale
WhatsAppSale.model_rebuild()
WhatsAppSaleWithDetails.model_rebuild()
