"""
Paquete de Services - Capa de Lógica de Negocio.

Implementa reglas de negocio y orquesta repositories para operaciones complejas.
Capa intermedia entre routers (API) y repositories (datos).

Arquitectura:
    Routers → Services → Repositories → Database
    
Services Disponibles:
    - UserService: Gestión de usuarios con validaciones de unicidad
    - ProductService: Catálogo con coordinación de stock
    - InventoryService: Stock multi-sucursal con soporte para talles
    - SaleService: Creación de ventas con validaciones y snapshots
    - PaymentService: Medios de pago y planes de cuotas personalizados
    - NotificationService: Sistema de notificaciones en tiempo real
    - ConfigService: Configuraciones por sucursal con auditoría
    - ReportsService: Reportes empresariales con validación de permisos

Responsabilidades de los Services:
    - Validaciones de negocio (unicidad, rangos, permisos)
    - Coordinación entre múltiples repositories
    - Transacciones atómicas (múltiples operaciones)
    - Cálculos y transformaciones de datos
    - Generación automática de registros (notificaciones, auditoría)
    - Aplicación de reglas de negocio complejas

Uso:
    from app.services import ProductService, InventoryService
    
    product_service = ProductService(db)
    inventory_service = InventoryService(db)
    
    # Coordinación entre services
    product = product_service.get_product_with_stock(product_id, branch_id)
"""

from app.services.inventory_service import InventoryService
from app.services.product_service import ProductService
from app.services.sale_service import SaleService
from app.services.user_service import UserService
from app.services.config_service import ConfigService
from app.services.reports_service import ReportsService

__all__ = [
    "InventoryService",
    "ProductService",
    "SaleService",
    "UserService",
    "ConfigService",
    "ReportsService",
]
