"""
Paquete de Repositories - Capa de Acceso a Datos.

Implementa Repository Pattern para abstraer acceso a datos SQLAlchemy.
Separa lógica de negocio de queries de base de datos.

Arquitectura:
    - BaseRepository: CRUD genérico con paginación y ordenamiento
    - Repositories específicos: extienden BaseRepository con métodos de dominio
    - ReportsRepository: caso especial para agregaciones (no hereda Base)

Repositories Disponibles:
    - User/Branch: Usuarios y sucursales
    - Product/Category/Brand: Catálogo de productos
    - Inventory: BranchStock, ProductSize, InventoryMovement
    - Sale/SaleItem: Transacciones de venta
    - Ecommerce: Configuración de tienda online
    - Payment: Medios de pago y cuotas
    - WhatsApp: Integración con WhatsApp Business
    - Notification: Sistema de notificaciones
    - Config: Configuraciones por sucursal y audit logs
    - Reports: Analíticas y reportes empresariales

Uso:
    from app.repositories import ProductRepository
    
    repo = ProductRepository(db_session)
    products = repo.get_active_products()
"""

from app.repositories.base import BaseRepository
from app.repositories.user import UserRepository, BranchRepository
from app.repositories.product import ProductRepository, CategoryRepository, BrandRepository
from app.repositories.inventory import (
    BranchStockRepository,
    ProductSizeRepository,
    InventoryMovementRepository
)
from app.repositories.sale import SaleRepository, SaleItemRepository
from app.repositories.ecommerce import (
    EcommerceConfigRepository,
    StoreBannerRepository,
    ProductImageRepository
)
from app.repositories.payment import PaymentConfigRepository
from app.repositories.whatsapp import WhatsAppConfigRepository, WhatsAppSaleRepository
from app.repositories.notification import NotificationRepository, NotificationSettingRepository
from app.repositories.config import (
    BranchTaxRateRepository,
    BranchPaymentMethodRepository,
    ConfigChangeLogRepository,
    SecurityAuditLogRepository
)
from app.repositories.reports import ReportsRepository

__all__ = [
    "BaseRepository",
    "UserRepository",
    "BranchRepository",
    "ProductRepository",
    "CategoryRepository",
    "BrandRepository",
    "BranchStockRepository",
    "ProductSizeRepository",
    "InventoryMovementRepository",
    "SaleRepository",
    "SaleItemRepository",
    "EcommerceConfigRepository",
    "StoreBannerRepository",
    "ProductImageRepository",
    "PaymentConfigRepository",
    "WhatsAppConfigRepository",
    "WhatsAppSaleRepository",
    "NotificationRepository",
    "NotificationSettingRepository",
    "BranchTaxRateRepository",
    "BranchPaymentMethodRepository",
    "ConfigChangeLogRepository",
    "SecurityAuditLogRepository",
    "ReportsRepository",
]
