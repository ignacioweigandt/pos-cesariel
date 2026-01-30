"""
Servicio de Productos - Lógica de Negocio.

Gestiona operaciones de productos con validaciones y coordinación con inventario.
Integra datos de catálogo con stock de sucursales.

Responsabilidades:
    - Validación de unicidad (SKU, barcode)
    - Coordinación con InventoryService para stock
    - Cálculo de stock bajo por sucursal
    - Búsqueda full-text de productos
    - Filtrado de productos para e-commerce

Validaciones:
    - SKU único en el sistema
    - Barcode único (si se proporciona)
    - Categoría válida y existente
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.product import ProductRepository, CategoryRepository
from app.services.inventory_service import InventoryService
from app.models import Product, Category
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    """
    Servicio de gestión de productos.
    
    Coordina operaciones de catálogo con inventario multi-sucursal.
    """

    def __init__(self, db: Session):
        """
        Inicializa servicio con sesión de BD.
        
        Args:
            db: Sesión de SQLAlchemy
        """
        self.db = db
        self.product_repo = ProductRepository(Product, db)
        self.category_repo = CategoryRepository(Category, db)
        self.inventory_service = InventoryService(db)

    def create_product(self, product_data: ProductCreate, user_id: int) -> Product:
        """
        Crea producto con validaciones de unicidad.
        
        Args:
            product_data: Datos del producto
            user_id: ID del usuario creador (para audit)
        
        Returns:
            Producto creado
        
        Raises:
            ValueError: Si SKU o barcode duplicado
        """
        # Validate SKU uniqueness
        if self.product_repo.get_by_sku(product_data.sku):
            raise ValueError(f"Product with SKU {product_data.sku} already exists")
        
        # Validate barcode uniqueness if provided
        if product_data.barcode and self.product_repo.get_by_barcode(product_data.barcode):
            raise ValueError(f"Product with barcode {product_data.barcode} already exists")
        
        # Create product
        product = self.product_repo.create(product_data.dict())
        return product

    def update_product(
        self, 
        product_id: int, 
        product_data: ProductUpdate
    ) -> Optional[Product]:
        """
        Actualiza producto con validaciones.
        
        Args:
            product_id: ID del producto
            product_data: Datos parciales a actualizar
        
        Returns:
            Producto actualizado o None si no existe
        
        Raises:
            ValueError: Si SKU duplicado
        """
        product = self.product_repo.get(product_id)
        if not product:
            return None

        # Validate SKU uniqueness if changed
        if product_data.sku and product_data.sku != product.sku:
            existing = self.product_repo.get_by_sku(product_data.sku)
            if existing:
                raise ValueError(f"SKU {product_data.sku} already exists")

        # Update product
        update_data = product_data.dict(exclude_unset=True)
        return self.product_repo.update(product_id, update_data)

    def get_product_with_stock(self, product_id: int, branch_id: Optional[int] = None):
        """
        Obtiene producto enriquecido con información de stock.
        
        Agrega atributo `current_stock` calculado desde BranchStock.
        
        Args:
            product_id: ID del producto
            branch_id: ID de sucursal (None = stock total de todas)
        
        Returns:
            Producto con current_stock o None si no existe
        """
        product = self.product_repo.get(product_id)
        if not product:
            return None

        # Add stock information
        if branch_id:
            product.current_stock = self.inventory_service.get_product_stock_for_branch(
                product_id, branch_id
            )
        else:
            product.current_stock = self.inventory_service.calculate_total_stock(product_id)

        return product

    def search_products(self, query: str, limit: int = 50) -> List[Product]:
        """
        Búsqueda full-text de productos.
        
        Args:
            query: Término de búsqueda
            limit: Máximo de resultados
        
        Returns:
            Lista de productos coincidentes (limitada)
        """
        return self.product_repo.search_products(query)[:limit]

    def get_low_stock_products(self, branch_id: Optional[int] = None) -> List[Product]:
        """
        Obtiene productos con stock bajo (≤ min_stock).
        
        Útil para alertas y notificaciones automáticas.
        
        Args:
            branch_id: ID de sucursal (None = todas las sucursales)
        
        Returns:
            Lista de productos con stock bajo, con current_stock calculado
        """
        all_products = self.product_repo.get_active_products()
        low_stock_products = []

        for product in all_products:
            if branch_id:
                stock = self.inventory_service.get_product_stock_for_branch(
                    product.id, branch_id
                )
            else:
                stock = self.inventory_service.calculate_total_stock(product.id)

            if stock <= product.min_stock:
                product.current_stock = stock
                low_stock_products.append(product)

        return low_stock_products

    def get_ecommerce_products(self) -> List[Product]:
        """
        Obtiene productos visibles en tienda online.
        
        Returns:
            Productos con show_in_ecommerce=True y activos
        """
        return self.product_repo.get_ecommerce_products()
