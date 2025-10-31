"""
Product and Category repositories for POS Cesariel.

Provides data access for product catalog and category management.
"""

from app.repositories.base import BaseRepository
from app.models import Product, Category, ProductSize, ProductImage
from typing import Optional, List

class ProductRepository(BaseRepository[Product]):
    """Repository for Product entity."""
    
    def get_by_sku(self, sku: str) -> Optional[Product]:
        """Get product by SKU code."""
        return self.get_by_field("sku", sku)
    
    def get_by_barcode(self, barcode: str) -> Optional[Product]:
        """Get product by barcode."""
        return self.get_by_field("barcode", barcode)
    
    def get_by_category(self, category_id: int) -> List[Product]:
        """Get all products in a specific category."""
        return self.get_many_by_field("category_id", category_id)
    
    def get_active_products(self) -> List[Product]:
        """Get all active products."""
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()
    
    def get_ecommerce_products(self) -> List[Product]:
        """Get all products visible in e-commerce."""
        return self.db.query(self.model).filter(
            self.model.show_in_ecommerce == True,
            self.model.is_active == True
        ).all()
    
    def search_products(self, query: str) -> List[Product]:
        """
        Search products by name, SKU, or barcode.
        
        Args:
            query: Search term to match against product fields
            
        Returns:
            List of matching products
        """
        search = f"%{query}%"
        return self.db.query(self.model).filter(
            (self.model.name.ilike(search)) |
            (self.model.sku.ilike(search)) |
            (self.model.barcode.ilike(search))
        ).all()

class CategoryRepository(BaseRepository[Category]):
    """Repository for Category entity."""
    
    def get_active_categories(self) -> List[Category]:
        """Get all active categories."""
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()
