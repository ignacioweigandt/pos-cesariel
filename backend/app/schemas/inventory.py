"""
Inventory schemas for POS Cesariel.

This module contains Pydantic schemas for inventory management and stock operations.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


# Branch Stock Schemas
class BranchStockBase(BaseModel):
    branch_id: int
    product_id: int
    stock_quantity: int = 0
    min_stock: int = 0


class BranchStockCreate(BranchStockBase):
    pass


class BranchStockUpdate(BaseModel):
    stock_quantity: Optional[int] = None
    min_stock: Optional[int] = None


class BranchStock(BranchStockBase):
    id: int
    created_at: datetime
    updated_at: datetime
    branch: Optional["Branch"] = None
    product: Optional["Product"] = None
    
    class Config:
        from_attributes = True


# Inventory Movement Schemas
class InventoryMovementBase(BaseModel):
    product_id: int
    movement_type: str
    quantity: int
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    notes: Optional[str] = None


class InventoryMovementCreate(InventoryMovementBase):
    pass


class InventoryMovement(InventoryMovementBase):
    id: int
    previous_stock: int
    new_stock: int
    created_at: datetime
    product: Optional["Product"] = None
    
    class Config:
        from_attributes = True


# Stock Adjustment Schemas
class StockAdjustment(BaseModel):
    new_stock: int
    notes: Optional[str] = ""


class StockAdjustmentRequest(BaseModel):
    branch_id: int
    quantity: int
    reason: str = "Manual adjustment"


class StockAdjustmentResponse(BaseModel):
    success: bool
    message: str
    old_stock: int
    new_stock: int
    total_product_stock: int


# Stock Transfer Schemas
class StockTransferRequest(BaseModel):
    from_branch_id: int
    to_branch_id: int
    quantity: int
    reason: str = "Stock transfer"


class StockTransferResponse(BaseModel):
    success: bool
    message: str
    from_branch: dict
    to_branch: dict


# Import Log Schemas
class ImportLogBase(BaseModel):
    filename: str
    total_rows: int = 0
    successful_rows: int = 0
    failed_rows: int = 0
    status: str = "PROCESSING"
    error_details: Optional[str] = None


class ImportLogCreate(ImportLogBase):
    user_id: int


class ImportLog(ImportLogBase):
    id: int
    user_id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    user: Optional["User"] = None
    
    class Config:
        from_attributes = True


# Multi-Branch Stock Schemas
class ProductStockBySite(BaseModel):
    branch_id: int
    branch_name: str
    stock_quantity: int
    min_stock: int


class ProductWithMultiBranchStock(BaseModel):
    id: int
    name: str
    sku: str
    has_sizes: bool
    total_stock: int
    branch_stocks: List[ProductStockBySite]


class BranchStockInfo(BaseModel):
    branch_id: int
    branch_name: str
    stock_quantity: int
    available_stock: int
    min_stock: int
    low_stock: bool


class ProductStockByBranch(BaseModel):
    id: int
    name: str
    sku: str
    branches: List[BranchStockInfo]
    total_stock: int
    total_available: int


# Forward reference resolution
from app.schemas.branch import Branch
from app.schemas.product import Product
from app.schemas.user import User
BranchStock.model_rebuild()
InventoryMovement.model_rebuild()
ImportLog.model_rebuild()
