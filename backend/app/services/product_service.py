"""
Product Service for POS Cesariel.

Handles all product-related business logic including creation,
updates, validation, and product management.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.product import ProductRepository, CategoryRepository
from app.services.inventory_service import InventoryService
from app.models import Product, Category
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    """Service for product management operations."""

    def __init__(self, db: Session):
        self.db = db
        self.product_repo = ProductRepository(Product, db)
        self.category_repo = CategoryRepository(Category, db)
        self.inventory_service = InventoryService(db)

    def create_product(self, product_data: ProductCreate, user_id: int) -> Product:
        """Create a new product with validation."""
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
        """Update product with validation."""
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
        """Get product with stock information."""
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
        """Search products by name, SKU, or barcode."""
        return self.product_repo.search_products(query)[:limit]

    def get_low_stock_products(self, branch_id: Optional[int] = None) -> List[Product]:
        """Get products with low stock."""
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
        """Get products available for e-commerce."""
        return self.product_repo.get_ecommerce_products()
