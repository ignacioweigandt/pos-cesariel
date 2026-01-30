"""
Repositories de Ventas.

Acceso a datos para transacciones de venta (POS/Ecommerce/WhatsApp)
y sus ítems individuales.

Repositories:
    - SaleRepository: CRUD ventas + filtros por sucursal/usuario/tipo/fecha
    - SaleItemRepository: CRUD ítems + filtros por venta/producto
"""

from app.repositories.base import BaseRepository
from app.models import Sale, SaleItem
from app.models.enums import SaleType
from typing import List
from datetime import datetime

class SaleRepository(BaseRepository[Sale]):
    """
    Repository de ventas.
    
    Gestión de transacciones de venta con filtros específicos para reportes
    y análisis. Soporta ventas POS, E-commerce y WhatsApp.
    """
    
    def get_by_branch(self, branch_id: int) -> List[Sale]:
        """
        Obtiene ventas de una sucursal.
        
        Args:
            branch_id: ID de la sucursal
        
        Returns:
            Lista de ventas de esa sucursal
        """
        return self.get_many_by_field("branch_id", branch_id)
    
    def get_by_user(self, user_id: int) -> List[Sale]:
        """
        Obtiene ventas realizadas por un usuario.
        
        Args:
            user_id: ID del vendedor
        
        Returns:
            Lista de ventas del usuario
        """
        return self.get_many_by_field("user_id", user_id)
    
    def get_by_type(self, sale_type: SaleType) -> List[Sale]:
        """
        Obtiene ventas por tipo de canal.
        
        Args:
            sale_type: Tipo de venta (POS, ECOMMERCE, WHATSAPP)
        
        Returns:
            Lista de ventas del tipo especificado
        """
        return self.db.query(self.model).filter(
            self.model.sale_type == sale_type
        ).all()
    
    def get_by_date_range(
        self, start_date: datetime, end_date: datetime
    ) -> List[Sale]:
        """
        Obtiene ventas en rango de fechas.
        
        Args:
            start_date: Fecha inicio (inclusive)
            end_date: Fecha fin (inclusive)
            
        Returns:
            Lista de ventas en el rango especificado
        """
        return self.db.query(self.model).filter(
            self.model.created_at >= start_date,
            self.model.created_at <= end_date
        ).all()

class SaleItemRepository(BaseRepository[SaleItem]):
    """
    Repository de ítems de venta.
    
    Gestión de líneas individuales dentro de cada transacción de venta.
    Útil para análisis de productos vendidos.
    """
    
    def get_by_sale(self, sale_id: int) -> List[SaleItem]:
        """
        Obtiene ítems de una venta específica.
        
        Args:
            sale_id: ID de la venta
        
        Returns:
            Lista de ítems de esa venta
        """
        return self.get_many_by_field("sale_id", sale_id)
    
    def get_by_product(self, product_id: int) -> List[SaleItem]:
        """
        Obtiene ventas de un producto específico.
        
        Args:
            product_id: ID del producto
        
        Returns:
            Lista de ítems vendidos de ese producto
        """
        return self.get_many_by_field("product_id", product_id)
