"""
Paquete de Modelos SQLAlchemy - POS Cesariel.

Organización de modelos por dominio siguiendo arquitectura limpia.
Centraliza exports para importación simplificada en toda la aplicación.

Estructura por Dominio:
    - User: Branch, User (autenticación y sucursales)
    - Product: Category, Product, Brand (catálogo)
    - Inventory: BranchStock, ProductSize, InventoryMovement, ImportLog (stock)
    - Sales: Sale, SaleItem (ventas POS/ecommerce/WhatsApp)
    - Ecommerce: EcommerceConfig, StoreBanner, ProductImage (tienda online)
    - Payment: PaymentConfig, CustomInstallment, PaymentMethod (medios de pago)
    - WhatsApp: WhatsAppConfig, WhatsAppSale, SocialMediaConfig (ventas sociales)
    - System: SystemConfig, TaxRate (configuración global)
    - Branch Config: BranchTaxRate, BranchPaymentMethod (config por sucursal)
    - Notifications: Notification, NotificationSetting (alertas en tiempo real)
    - Audit: ConfigChangeLog, SecurityAuditLog (trazabilidad y seguridad)

Enums Disponibles:
    - UserRole: ADMIN, MANAGER, SELLER, ECOMMERCE
    - SaleType: POS, ECOMMERCE, WHATSAPP
    - OrderStatus: PENDING, CONFIRMED, COMPLETED, CANCELLED
    - NotificationType: LOW_STOCK, NEW_SALE, ORDER_STATUS, SYSTEM
    - NotificationPriority: LOW, MEDIUM, HIGH, URGENT
    - CurrencyCode: ARS, USD, EUR, BRL
    - CurrencyPosition: BEFORE, AFTER
    - ChangeAction: CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE

Uso:
    # Importación recomendada (desde package)
    from app.models import User, Product, Sale, UserRole, SaleType
    
    # Evitar importación directa de módulos individuales
    # from app.models.user import User  # NO recomendado

Notes:
    - Todos los modelos usan Base de database.py
    - Multi-tenant: la mayoría tiene branch_id para aislamiento por sucursal
    - Stock gestionado exclusivamente vía BranchStock (no Product.stock_quantity)
    - Timestamps automáticos: created_at, updated_at en modelos principales
"""

# Import enums
from app.models.enums import UserRole, SaleType, OrderStatus

# Import user-related models
from app.models.user import Branch, User

# Import product-related models
from app.models.product import Category, Product
from app.models.brand import Brand

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
    "Brand",
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
