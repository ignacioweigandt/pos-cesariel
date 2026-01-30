"""
Repositories de Inventario.

Acceso a datos para gestión de stock multi-sucursal, talles/tamaños
y movimientos de inventario (entrada/salida/ajustes).

Repositories:
    - BranchStockRepository: Stock por sucursal + producto + talle
    - ProductSizeRepository: Variantes de talle por producto
    - InventoryMovementRepository: Historial de movimientos de stock
"""

from app.repositories.base import BaseRepository
from app.models import BranchStock, InventoryMovement, ProductSize
from typing import List, Optional

class BranchStockRepository(BaseRepository[BranchStock]):
    """
    Repository de stock por sucursal.
    
    Gestiona stock multi-tenant (sucursal + producto + talle).
    Esta es la ÚNICA fuente de verdad para cantidades de stock.
    """
    
    def get_by_branch_and_product(
        self, branch_id: int, product_id: int
    ) -> Optional[BranchStock]:
        """
        Obtiene stock de un producto en una sucursal.
        
        Args:
            branch_id: ID de la sucursal
            product_id: ID del producto
            
        Returns:
            Registro de stock o None si no existe
        """
        return self.db.query(self.model).filter(
            self.model.branch_id == branch_id,
            self.model.product_id == product_id
        ).first()
    
    def get_by_branch(self, branch_id: int) -> List[BranchStock]:
        """
        Obtiene todo el stock de una sucursal.
        
        Args:
            branch_id: ID de la sucursal
        
        Returns:
            Lista de registros de stock de esa sucursal
        """
        return self.get_many_by_field("branch_id", branch_id)

class ProductSizeRepository(BaseRepository[ProductSize]):
    """
    Repository de talles/tamaños de productos.
    
    Gestiona variantes de talle para productos (calzado, ropa, etc.).
    Cada talle tiene stock independiente por sucursal.
    """
    
    def get_by_product(self, product_id: int) -> List[ProductSize]:
        """
        Obtiene talles de un producto.
        
        Args:
            product_id: ID del producto
        
        Returns:
            Lista de talles del producto
        """
        return self.get_many_by_field("product_id", product_id)
    
    def get_by_product_and_branch(
        self, product_id: int, branch_id: int
    ) -> List[ProductSize]:
        """
        Obtiene talles de un producto en una sucursal.
        
        Args:
            product_id: ID del producto
            branch_id: ID de la sucursal
            
        Returns:
            Lista de talles disponibles en esa sucursal
        """
        return self.db.query(self.model).filter(
            self.model.product_id == product_id,
            self.model.branch_id == branch_id
        ).all()

class InventoryMovementRepository(BaseRepository[InventoryMovement]):
    """
    Repository de movimientos de inventario.
    
    Registra historial de cambios de stock (entrada/salida/ajuste/venta).
    Útil para auditorías y trazabilidad.
    """
    
    def get_by_product(self, product_id: int) -> List[InventoryMovement]:
        """
        Obtiene movimientos de un producto.
        
        Args:
            product_id: ID del producto
        
        Returns:
            Lista de movimientos de ese producto
        """
        return self.get_many_by_field("product_id", product_id)
    
    def get_by_branch(self, branch_id: int) -> List[InventoryMovement]:
        """
        Obtiene movimientos de una sucursal.
        
        Args:
            branch_id: ID de la sucursal
        
        Returns:
            Lista de movimientos de esa sucursal
        """
        return self.get_many_by_field("branch_id", branch_id)
