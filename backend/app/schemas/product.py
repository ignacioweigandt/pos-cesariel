"""
Product schemas for POS Cesariel.

This module contains Pydantic schemas for product and product-related entities.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    price: Decimal
    cost: Optional[Decimal] = None
    stock_quantity: int = 0
    min_stock: int = 0
    is_active: bool = True
    show_in_ecommerce: bool = True
    ecommerce_price: Optional[Decimal] = None
    image_url: Optional[str] = None
    has_sizes: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    price: Optional[Decimal] = None
    cost: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    min_stock: Optional[int] = None
    is_active: Optional[bool] = None
    show_in_ecommerce: Optional[bool] = None
    ecommerce_price: Optional[Decimal] = None
    image_url: Optional[str] = None
    has_sizes: Optional[bool] = None


class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional["Category"] = None
    
    class Config:
        from_attributes = True


# Product Size Schemas
class ProductSizeBase(BaseModel):
    product_id: int
    branch_id: int
    size: str
    stock_quantity: int = 0


class ProductSizeCreate(ProductSizeBase):
    pass


class ProductSizeUpdate(BaseModel):
    stock_quantity: Optional[int] = None


class ProductSize(ProductSizeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    product: Optional[Product] = None
    branch: Optional["Branch"] = None
    
    class Config:
        from_attributes = True


# Product Image Schemas
class ProductImageBase(BaseModel):
    product_id: int
    image_url: str
    image_order: int = 1
    alt_text: Optional[str] = None
    is_main: bool = False


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageUpdate(BaseModel):
    image_url: Optional[str] = None
    image_order: Optional[int] = None
    alt_text: Optional[str] = None
    is_main: Optional[bool] = None


class ProductImage(ProductImageBase):
    id: int
    created_at: datetime
    updated_at: datetime
    product: Optional[Product] = None
    
    class Config:
        from_attributes = True


# Enhanced Product with Images
class ProductWithImages(Product):
    product_images: List[ProductImage] = []


# Bulk Import Schemas
class ProductImportData(BaseModel):
    codigo_barra: str
    modelo: str
    efectivo: Decimal


class BulkImportResponse(BaseModel):
    import_log_id: int
    message: str
    total_rows: int
    successful_rows: int
    failed_rows: int
    errors: List[dict] = []


# Size Stock Management Schemas
class SizeStockData(BaseModel):
    size: str
    stock_quantity: int


class UpdateSizeStocks(BaseModel):
    sizes: List[SizeStockData]


# Forward reference resolution
from app.schemas.category import Category
from app.schemas.branch import Branch
Product.model_rebuild()
ProductSize.model_rebuild()
