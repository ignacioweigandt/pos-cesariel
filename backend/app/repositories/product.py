"""
Repositories de Catálogo de Productos.

Acceso a datos para gestión completa del catálogo: productos,
categorías y marcas.

Repositories:
    - ProductRepository: CRUD productos + búsqueda + filtros e-commerce
    - CategoryRepository: CRUD categorías + filtro activas
    - BrandRepository: CRUD marcas + búsqueda por nombre
"""

from app.repositories.base import BaseRepository
from app.models import Product, Category, Brand, ProductSize, ProductImage
from typing import Optional, List

class ProductRepository(BaseRepository[Product]):
    """
    Repository de productos.
    
    Gestión completa del catálogo con búsqueda avanzada y filtros para
    e-commerce. Incluye búsqueda por SKU/barcode para POS rápido.
    """
    
    def get_by_sku(self, sku: str) -> Optional[Product]:
        """
        Busca producto por código SKU único.
        
        Args:
            sku: Código SKU del producto
        
        Returns:
            Producto si existe, None si no
        """
        return self.get_by_field("sku", sku)
    
    def get_by_barcode(self, barcode: str) -> Optional[Product]:
        """
        Busca producto por código de barras.
        
        Args:
            barcode: Código de barras del producto
        
        Returns:
            Producto si existe, None si no
        """
        return self.get_by_field("barcode", barcode)
    
    def get_by_category(self, category_id: int) -> List[Product]:
        """
        Obtiene productos de una categoría.
        
        Args:
            category_id: ID de la categoría
        
        Returns:
            Lista de productos de esa categoría
        """
        return self.get_many_by_field("category_id", category_id)
    
    def get_active_products(self) -> List[Product]:
        """
        Obtiene productos activos.
        
        Returns:
            Lista de productos con is_active=True
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()
    
    def get_ecommerce_products(self) -> List[Product]:
        """
        Obtiene productos visibles en tienda online.
        
        Returns:
            Lista de productos con show_in_ecommerce=True y activos
        """
        return self.db.query(self.model).filter(
            self.model.show_in_ecommerce == True,
            self.model.is_active == True
        ).all()
    
    def search_products(self, query: str) -> List[Product]:
        """
        Búsqueda full-text en productos.
        
        Busca coincidencias en nombre, SKU y barcode (case-insensitive).
        Útil para autocomplete en POS y admin.
        
        Args:
            query: Término de búsqueda
            
        Returns:
            Lista de productos que coincidan en algún campo
        """
        search = f"%{query}%"
        return self.db.query(self.model).filter(
            (self.model.name.ilike(search)) |
            (self.model.sku.ilike(search)) |
            (self.model.barcode.ilike(search))
        ).all()

class CategoryRepository(BaseRepository[Category]):
    """
    Repository de categorías.
    
    Gestión de categorías de productos para organización del catálogo.
    """

    def get_active_categories(self) -> List[Category]:
        """
        Obtiene categorías activas.
        
        Returns:
            Lista de categorías con is_active=True
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()


class BrandRepository(BaseRepository[Brand]):
    """
    Repository de marcas.
    
    Gestión de marcas de productos (Nike, Adidas, etc.).
    """

    def get_active_brands(self) -> List[Brand]:
        """
        Obtiene marcas activas ordenadas alfabéticamente.
        
        Returns:
            Lista de marcas con is_active=True ordenadas por nombre
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).order_by(self.model.name).all()

    def get_by_name(self, name: str) -> Optional[Brand]:
        """
        Busca marca por nombre exacto.
        
        Args:
            name: Nombre de la marca
        
        Returns:
            Marca si existe, None si no
        """
        return self.get_by_field("name", name)
