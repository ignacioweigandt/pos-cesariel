"""
Pydantic schemas package for POS Cesariel.

This package organizes Pydantic validation schemas by domain.
All schemas are re-exported here for backward compatibility.
"""

# Import common/enums
from app.schemas.common import UserRole, SaleType, OrderStatus

# Import auth schemas
from app.schemas.auth import Token, TokenData, UserLogin

# Import branch schemas
from app.schemas.branch import (
    BranchBase,
    BranchCreate,
    BranchUpdate,
    Branch
)

# Import user schemas
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    User
)

# Import category schemas
from app.schemas.category import (
    CategoryBase,
    CategoryCreate,
    CategoryUpdate,
    Category
)

# Import product schemas
from app.schemas.product import (
    ProductBase,
    ProductCreate,
    ProductUpdate,
    Product,
    ProductSizeBase,
    ProductSizeCreate,
    ProductSizeUpdate,
    ProductSize,
    ProductImageBase,
    ProductImageCreate,
    ProductImageUpdate,
    ProductImage,
    ProductWithImages,
    ProductImportData,
    BulkImportResponse,
    SizeStockData,
    UpdateSizeStocks,
    BulkPriceUpdateRequest,
    BulkPriceUpdateResponse
)

# Import inventory schemas
from app.schemas.inventory import (
    BranchStockBase,
    BranchStockCreate,
    BranchStockUpdate,
    BranchStock,
    InventoryMovementBase,
    InventoryMovementCreate,
    InventoryMovement,
    StockAdjustment,
    StockAdjustmentRequest,
    StockAdjustmentResponse,
    StockTransferRequest,
    StockTransferResponse,
    ImportLogBase,
    ImportLogCreate,
    ImportLog,
    ProductStockBySite,
    ProductWithMultiBranchStock,
    BranchStockInfo,
    ProductStockByBranch
)

# Import sale schemas
from app.schemas.sale import (
    SaleItemBase,
    SaleItemCreate,
    SaleItem,
    SaleBase,
    SaleCreate,
    SaleStatusUpdate,
    Sale
)

# Import ecommerce schemas
from app.schemas.ecommerce import (
    EcommerceConfigBase,
    EcommerceConfigCreate,
    EcommerceConfigUpdate,
    EcommerceConfig,
    StoreBannerBase,
    StoreBannerCreate,
    StoreBannerUpdate,
    StoreBanner,
    SocialMediaConfigBase,
    SocialMediaConfigCreate,
    SocialMediaConfigUpdate,
    SocialMediaConfig,
    EcommerceStoreData,
    EcommerceSalesReport
)

# Import payment schemas
from app.schemas.payment import (
    PaymentConfigBase,
    PaymentConfigCreate,
    PaymentConfigUpdate,
    PaymentConfig,
    CustomInstallmentBase,
    CustomInstallmentCreate,
    CustomInstallmentUpdate,
    CustomInstallment,
    CurrencyCode,
    ALLOWED_CURRENCIES,
    CURRENCY_NAMES
)

# Import whatsapp schemas
from app.schemas.whatsapp import (
    WhatsAppConfigBase,
    WhatsAppConfigCreate,
    WhatsAppConfigUpdate,
    WhatsAppConfig,
    WhatsAppSaleBase,
    WhatsAppSaleCreate,
    WhatsAppSaleUpdate,
    WhatsAppSale,
    WhatsAppSaleWithDetails
)

# Import dashboard schemas
from app.schemas.dashboard import (
    DashboardStats,
    SalesReport,
    DailySales,
    ChartData
)

# Import system config schemas
from app.schemas.system_config import (
    SystemConfigBase,
    SystemConfigCreate,
    SystemConfigUpdate,
    SystemConfigResponse,
    CurrencyConfigResponse
)

# Import tax rate schemas
from app.schemas.tax_rate import (
    TaxRateBase,
    TaxRateCreate,
    TaxRateUpdate,
    TaxRateResponse
)

# Import notification schemas
from app.schemas.notification import (
    NotificationBase,
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
    NotificationStats,
    NotificationSettingBase,
    NotificationSettingCreate,
    NotificationSettingUpdate,
    NotificationSettingResponse,
    NotificationBulkMarkRead,
    NotificationBulkDelete,
    NotificationFilter
)

__all__ = [
    # Enums
    "UserRole",
    "SaleType",
    "OrderStatus",
    
    # Auth
    "Token",
    "TokenData",
    "UserLogin",
    
    # Branch
    "BranchBase",
    "BranchCreate",
    "BranchUpdate",
    "Branch",
    
    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "User",
    
    # Category
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "Category",
    
    # Product
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "Product",
    "ProductSizeBase",
    "ProductSizeCreate",
    "ProductSizeUpdate",
    "ProductSize",
    "ProductImageBase",
    "ProductImageCreate",
    "ProductImageUpdate",
    "ProductImage",
    "ProductWithImages",
    "ProductImportData",
    "BulkImportResponse",
    "SizeStockData",
    "UpdateSizeStocks",
    "BulkPriceUpdateRequest",
    "BulkPriceUpdateResponse",
    
    # Inventory
    "BranchStockBase",
    "BranchStockCreate",
    "BranchStockUpdate",
    "BranchStock",
    "InventoryMovementBase",
    "InventoryMovementCreate",
    "InventoryMovement",
    "StockAdjustment",
    "StockAdjustmentRequest",
    "StockAdjustmentResponse",
    "StockTransferRequest",
    "StockTransferResponse",
    "ImportLogBase",
    "ImportLogCreate",
    "ImportLog",
    "ProductStockBySite",
    "ProductWithMultiBranchStock",
    "BranchStockInfo",
    "ProductStockByBranch",
    
    # Sale
    "SaleItemBase",
    "SaleItemCreate",
    "SaleItem",
    "SaleBase",
    "SaleCreate",
    "SaleStatusUpdate",
    "Sale",
    
    # Ecommerce
    "EcommerceConfigBase",
    "EcommerceConfigCreate",
    "EcommerceConfigUpdate",
    "EcommerceConfig",
    "StoreBannerBase",
    "StoreBannerCreate",
    "StoreBannerUpdate",
    "StoreBanner",
    "SocialMediaConfigBase",
    "SocialMediaConfigCreate",
    "SocialMediaConfigUpdate",
    "SocialMediaConfig",
    "EcommerceStoreData",
    "EcommerceSalesReport",
    
    # Payment
    "PaymentConfigBase",
    "PaymentConfigCreate",
    "PaymentConfigUpdate",
    "PaymentConfig",
    "CustomInstallmentBase",
    "CustomInstallmentCreate",
    "CustomInstallmentUpdate",
    "CustomInstallment",
    "CurrencyCode",
    "ALLOWED_CURRENCIES",
    "CURRENCY_NAMES",
    
    # WhatsApp
    "WhatsAppConfigBase",
    "WhatsAppConfigCreate",
    "WhatsAppConfigUpdate",
    "WhatsAppConfig",
    "WhatsAppSaleBase",
    "WhatsAppSaleCreate",
    "WhatsAppSaleUpdate",
    "WhatsAppSale",
    "WhatsAppSaleWithDetails",
    
    # Dashboard
    "DashboardStats",
    "SalesReport",
    "DailySales",
    "ChartData",

    # System Config
    "SystemConfigBase",
    "SystemConfigCreate",
    "SystemConfigUpdate",
    "SystemConfigResponse",
    "CurrencyConfigResponse",

    # Tax Rate
    "TaxRateBase",
    "TaxRateCreate",
    "TaxRateUpdate",
    "TaxRateResponse",

    # Notification
    "NotificationBase",
    "NotificationCreate",
    "NotificationUpdate",
    "NotificationResponse",
    "NotificationStats",
    "NotificationSettingBase",
    "NotificationSettingCreate",
    "NotificationSettingUpdate",
    "NotificationSettingResponse",
    "NotificationBulkMarkRead",
    "NotificationBulkDelete",
    "NotificationFilter",
]
