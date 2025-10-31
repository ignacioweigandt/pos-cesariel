"""
Sale schemas for POS Cesariel.

This module contains Pydantic schemas for sales and order management.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from app.schemas.common import SaleType, OrderStatus


# Sale Item Schemas
class SaleItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal
    size: Optional[str] = None  # Para productos con talles


class SaleItemCreate(SaleItemBase):
    pass


class SaleItem(SaleItemBase):
    id: int
    total_price: Decimal
    product: Optional["Product"] = None
    
    class Config:
        from_attributes = True


# Sale Schemas
class SaleBase(BaseModel):
    sale_type: SaleType
    branch_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = None
    payment_method: Optional[str] = None
    order_status: OrderStatus = OrderStatus.PENDING
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    items: List[SaleItemCreate]


class SaleStatusUpdate(BaseModel):
    new_status: OrderStatus


class Sale(SaleBase):
    id: int
    sale_number: str
    user_id: Optional[int] = None
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    branch: Optional["Branch"] = None
    user: Optional["User"] = None
    sale_items: List[SaleItem] = []
    
    class Config:
        from_attributes = True


# Forward reference resolution
from app.schemas.product import Product
from app.schemas.branch import Branch
from app.schemas.user import User
SaleItem.model_rebuild()
Sale.model_rebuild()
