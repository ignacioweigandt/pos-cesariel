"""
Inventory Service for POS Cesariel.

Handles all inventory-related business logic including stock management,
stock transfers, and size-based inventory.

This service replaces business logic that was in the Product model.
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from app.repositories.inventory import (
    BranchStockRepository,
    ProductSizeRepository,
    InventoryMovementRepository
)
from app.repositories.product import ProductRepository
from app.models import Product, BranchStock, ProductSize, InventoryMovement


class InventoryService:
    """Service for inventory management operations."""

    def __init__(self, db: Session):
        self.db = db
        self.branch_stock_repo = BranchStockRepository(BranchStock, db)
        self.product_size_repo = ProductSizeRepository(ProductSize, db)
        self.inventory_movement_repo = InventoryMovementRepository(InventoryMovement, db)
        self.product_repo = ProductRepository(Product, db)

    def get_product_stock_for_branch(self, product_id: int, branch_id: int) -> int:
        """
        Get stock for a specific product in a specific branch.
        Handles both sized and non-sized products.
        
        Replaces: Product.get_stock_for_branch() method.
        """
        product = self.product_repo.get(product_id)
        if not product:
            return 0

        if product.has_sizes:
            # Sum stock from ProductSize for this branch
            sizes = self.product_size_repo.get_by_product_and_branch(product_id, branch_id)
            return sum(size.stock_quantity for size in sizes)
        else:
            # Get BranchStock
            branch_stock = self.branch_stock_repo.get_by_branch_and_product(branch_id, product_id)
            return branch_stock.stock_quantity if branch_stock else 0

    def get_available_stock_for_branch(self, product_id: int, branch_id: int) -> int:
        """
        Get available (non-reserved) stock for a branch.
        
        Replaces: Product.get_available_stock_for_branch() method.
        """
        product = self.product_repo.get(product_id)
        if not product:
            return 0

        if product.has_sizes:
            return self.get_product_stock_for_branch(product_id, branch_id)
        else:
            branch_stock = self.branch_stock_repo.get_by_branch_and_product(branch_id, product_id)
            return branch_stock.available_stock if branch_stock else 0

    def calculate_total_stock(self, product_id: int) -> int:
        """
        Calculate total stock across all branches.
        
        Replaces: Product.calculate_total_stock() method.
        """
        product = self.product_repo.get(product_id)
        if not product:
            return 0

        if product.has_sizes:
            sizes = self.product_size_repo.get_by_product(product_id)
            return sum(size.stock_quantity for size in sizes)
        else:
            stocks = self.branch_stock_repo.get_many_by_field("product_id", product_id)
            return sum(stock.stock_quantity for stock in stocks)

    def calculate_total_available_stock(self, product_id: int) -> int:
        """
        Calculate total available stock across all branches.
        
        Replaces: Product.calculate_total_available_stock() method.
        """
        product = self.product_repo.get(product_id)
        if not product:
            return 0

        if product.has_sizes:
            return self.calculate_total_stock(product_id)
        else:
            stocks = self.branch_stock_repo.get_many_by_field("product_id", product_id)
            return sum(stock.available_stock for stock in stocks)

    def has_sufficient_stock(
        self, 
        product_id: int, 
        branch_id: int, 
        quantity: int = 1,
        size: Optional[str] = None
    ) -> bool:
        """
        Check if there's sufficient stock available.
        
        Replaces: Product.has_stock_in_branch() method.
        """
        product = self.product_repo.get(product_id)
        if not product:
            return False

        if product.has_sizes and size:
            sizes = self.product_size_repo.get_by_product_and_branch(product_id, branch_id)
            size_stock = next((s for s in sizes if s.size == size), None)
            return size_stock.stock_quantity >= quantity if size_stock else False
        else:
            available = self.get_available_stock_for_branch(product_id, branch_id)
            return available >= quantity

    def get_branches_with_stock(self, product_id: int) -> List[int]:
        """
        Get list of branch IDs that have stock.
        
        Replaces: Product.get_branches_with_stock() method.
        """
        stocks = self.branch_stock_repo.get_many_by_field("product_id", product_id)
        return [stock.branch_id for stock in stocks if stock.stock_quantity > 0]

    def decrease_stock(
        self,
        product_id: int,
        branch_id: int,
        quantity: int,
        size: Optional[str] = None,
        reference_type: str = "SALE",
        reference_id: Optional[int] = None,
        notes: Optional[str] = None
    ) -> bool:
        """
        Decrease stock for a product in a branch.
        Creates inventory movement record.
        """
        product = self.product_repo.get(product_id)
        if not product:
            return False

        if product.has_sizes and size:
            # Handle sized product
            sizes = self.product_size_repo.get_by_product_and_branch(product_id, branch_id)
            size_stock = next((s for s in sizes if s.size == size), None)
            if not size_stock or size_stock.stock_quantity < quantity:
                return False
            
            previous_stock = size_stock.stock_quantity
            size_stock.stock_quantity -= quantity
            self.db.commit()
        else:
            # Handle non-sized product
            branch_stock = self.branch_stock_repo.get_by_branch_and_product(branch_id, product_id)
            if not branch_stock or branch_stock.stock_quantity < quantity:
                return False
            
            previous_stock = branch_stock.stock_quantity
            branch_stock.stock_quantity -= quantity
            self.db.commit()

        # Create inventory movement
        movement_data = {
            "product_id": product_id,
            "branch_id": branch_id,
            "movement_type": "OUT",
            "quantity": -quantity,
            "previous_stock": previous_stock,
            "new_stock": previous_stock - quantity,
            "reference_type": reference_type,
            "reference_id": reference_id,
            "notes": notes or f"Stock decreased by {quantity}"
        }
        self.inventory_movement_repo.create(movement_data)

        return True
