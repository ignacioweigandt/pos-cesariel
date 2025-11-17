"""
Repository package for POS Cesariel.

Provides data access abstraction layer using the Repository pattern.
"""

from app.repositories.base import BaseRepository
from app.repositories.user import UserRepository, BranchRepository
from app.repositories.product import ProductRepository, CategoryRepository
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

__all__ = [
    "BaseRepository",
    "UserRepository",
    "BranchRepository",
    "ProductRepository",
    "CategoryRepository",
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
]
