"""
Models package for POS Cesariel.

This package organizes SQLAlchemy models by domain for better maintainability.
All models are re-exported here for backward compatibility.
"""

# Import enums
from app.models.enums import UserRole, SaleType, OrderStatus

# Import user-related models
from app.models.user import Branch, User

# Import product-related models
from app.models.product import Category, Product

# Import inventory-related models
from app.models.inventory import (
    BranchStock,
    InventoryMovement,
    ProductSize,
    ImportLog
)

# Import sales-related models
from app.models.sales import Sale, SaleItem

# Import ecommerce-related models
from app.models.ecommerce import (
    EcommerceConfig,
    StoreBanner,
    ProductImage
)

# Import payment-related models
from app.models.payment import PaymentConfig, CustomInstallment
from app.models.payment_method import PaymentMethod

# Import whatsapp-related models
from app.models.whatsapp import (
    WhatsAppConfig,
    WhatsAppSale,
    SocialMediaConfig
)

# Import system configuration models
from app.models.system_config import SystemConfig, CurrencyCode, CurrencyPosition

# Import tax rate models
from app.models.tax_rate import TaxRate

# Import notification models
from app.models.notification import (
    Notification,
    NotificationSetting,
    NotificationType,
    NotificationPriority
)

# Import branch configuration models
from app.models.branch_config import (
    BranchTaxRate,
    BranchPaymentMethod
)

# Import audit and logging models
from app.models.audit import (
    ConfigChangeLog,
    SecurityAuditLog,
    ChangeAction
)

# Define __all__ for explicit exports
__all__ = [
    # Enums
    "UserRole",
    "SaleType",
    "OrderStatus",
    # User models
    "Branch",
    "User",
    # Product models
    "Category",
    "Product",
    # Inventory models
    "BranchStock",
    "InventoryMovement",
    "ProductSize",
    "ImportLog",
    # Sales models
    "Sale",
    "SaleItem",
    # Ecommerce models
    "EcommerceConfig",
    "StoreBanner",
    "ProductImage",
    # Payment models
    "PaymentConfig",
    "CustomInstallment",
    "PaymentMethod",
    # WhatsApp models
    "WhatsAppConfig",
    "WhatsAppSale",
    "SocialMediaConfig",
    # System Config models
    "SystemConfig",
    "CurrencyCode",
    "CurrencyPosition",
    # Tax Rate models
    "TaxRate",
    # Notification models
    "Notification",
    "NotificationSetting",
    "NotificationType",
    "NotificationPriority",
    # Branch Configuration models
    "BranchTaxRate",
    "BranchPaymentMethod",
    # Audit and Logging models
    "ConfigChangeLog",
    "SecurityAuditLog",
    "ChangeAction",
]
