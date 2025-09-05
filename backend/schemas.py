from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Union
from decimal import Decimal
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SELLER = "SELLER"
    ECOMMERCE = "ECOMMERCE"

class SaleType(str, Enum):
    POS = "POS"
    ECOMMERCE = "ECOMMERCE"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

# Branch Schemas
class BranchBase(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: bool = True

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class Branch(BranchBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole
    branch_id: Optional[int] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    branch_id: Optional[int] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    branch: Optional[Branch] = None
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    category_id: Optional[int] = None
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
    category: Optional[Category] = None
    
    class Config:
        from_attributes = True

# Sale Schemas
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
    product: Optional[Product] = None
    
    class Config:
        from_attributes = True

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
    branch: Optional[Branch] = None
    user: Optional[User] = None
    sale_items: List[SaleItem] = []
    
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
    product: Optional[Product] = None
    
    class Config:
        from_attributes = True

# Stock Adjustment Schema
class StockAdjustment(BaseModel):
    new_stock: int
    notes: Optional[str] = ""

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

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_sales_today: Decimal
    total_sales_month: Decimal
    total_products: int
    low_stock_products: int
    active_branches: int
    total_users: int

class SalesReport(BaseModel):
    period: str
    total_sales: Decimal
    total_transactions: int
    average_sale: Decimal
    top_products: List[dict]
    sales_by_branch: List[dict]

# Chart Data Schemas
class DailySales(BaseModel):
    date: str
    sales: Decimal
    transactions: int

class ChartData(BaseModel):
    name: str
    value: Union[int, float, Decimal]

# Payment Config Schemas
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
    
    class Config:
        from_attributes = True

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
    branch: Optional[Branch] = None
    product: Optional[Product] = None
    
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
    branch: Optional[Branch] = None
    
    class Config:
        from_attributes = True

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
    user: Optional[User] = None
    
    class Config:
        from_attributes = True

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

# Stock Multi-Branch Schemas
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
    
# Size Stock Management Schemas  
class SizeStockData(BaseModel):
    size: str
    stock_quantity: int

class UpdateSizeStocks(BaseModel):
    sizes: List[SizeStockData]

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
    sale: Optional[Sale] = None
    
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

# Enhanced E-commerce Schemas
class ProductWithImages(Product):
    product_images: List[ProductImage] = []

class EcommerceStoreData(BaseModel):
    store_config: EcommerceConfig
    banners: List[StoreBanner] = []
    social_media: List[SocialMediaConfig] = []
    featured_products: List[ProductWithImages] = []

# WhatsApp Sale with Full Details
class WhatsAppSaleWithDetails(WhatsAppSale):
    sale: Sale
    
class EcommerceSalesReport(BaseModel):
    total_whatsapp_sales: int
    total_whatsapp_revenue: Decimal
    pending_orders: int
    completed_orders: int
    recent_sales: List[WhatsAppSaleWithDetails] = []

# Branch Stock Schemas
class BranchStockBase(BaseModel):
    branch_id: int
    product_id: int
    stock_quantity: int = 0
    min_stock: int = 0
    # reserved_stock: int = 0

class BranchStockCreate(BranchStockBase):
    pass

class BranchStockUpdate(BaseModel):
    stock_quantity: Optional[int] = None
    min_stock: Optional[int] = None
    # reserved_stock: Optional[int] = None

class BranchStock(BranchStockBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Stock Management Schemas
class StockAdjustmentRequest(BaseModel):
    branch_id: int
    quantity: int
    reason: str = "Manual adjustment"

class StockTransferRequest(BaseModel):
    from_branch_id: int
    to_branch_id: int
    quantity: int
    reason: str = "Stock transfer"

class BranchStockInfo(BaseModel):
    branch_id: int
    branch_name: str
    stock_quantity: int
    available_stock: int
    # reserved_stock: int
    min_stock: int
    low_stock: bool

class ProductStockByBranch(BaseModel):
    id: int
    name: str
    sku: str
    branches: List[BranchStockInfo]
    total_stock: int
    total_available: int

# Stock Operation Response Schemas
class StockAdjustmentResponse(BaseModel):
    success: bool
    message: str
    old_stock: int
    new_stock: int
    total_product_stock: int

class StockTransferResponse(BaseModel):
    success: bool
    message: str
    from_branch: dict
    to_branch: dict