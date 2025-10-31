"""
E-commerce schemas for POS Cesariel.

This module contains Pydantic schemas for e-commerce configuration and management.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


# E-commerce Config Schemas
class EcommerceConfigBase(BaseModel):
    store_name: str
    store_description: Optional[str] = None
    store_logo: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True
    tax_percentage: Decimal = 0
    currency: str = "USD"


class EcommerceConfigCreate(EcommerceConfigBase):
    pass


class EcommerceConfigUpdate(BaseModel):
    store_name: Optional[str] = None
    store_description: Optional[str] = None
    store_logo: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None
    tax_percentage: Optional[Decimal] = None
    currency: Optional[str] = None


class EcommerceConfig(EcommerceConfigBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Store Banner Schemas
class StoreBannerBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    button_text: Optional[str] = None
    banner_order: int = 1
    is_active: bool = True


class StoreBannerCreate(StoreBannerBase):
    pass


class StoreBannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    button_text: Optional[str] = None
    banner_order: Optional[int] = None
    is_active: Optional[bool] = None


class StoreBanner(StoreBannerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Social Media Config Schemas
class SocialMediaConfigBase(BaseModel):
    platform: str
    username: Optional[str] = None
    url: Optional[str] = None
    is_active: bool = True
    display_order: int = 1


class SocialMediaConfigCreate(SocialMediaConfigBase):
    pass


class SocialMediaConfigUpdate(BaseModel):
    platform: Optional[str] = None
    username: Optional[str] = None
    url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class SocialMediaConfig(SocialMediaConfigBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Enhanced E-commerce Schemas
class EcommerceStoreData(BaseModel):
    store_config: EcommerceConfig
    banners: List[StoreBanner] = []
    social_media: List[SocialMediaConfig] = []
    featured_products: List["ProductWithImages"] = []


# E-commerce Sales Report
class EcommerceSalesReport(BaseModel):
    total_whatsapp_sales: int
    total_whatsapp_revenue: Decimal
    pending_orders: int
    completed_orders: int
    recent_sales: List["WhatsAppSaleWithDetails"] = []


# Forward reference resolution
from app.schemas.product import ProductWithImages
from app.schemas.whatsapp import WhatsAppSaleWithDetails
EcommerceStoreData.model_rebuild()
EcommerceSalesReport.model_rebuild()
