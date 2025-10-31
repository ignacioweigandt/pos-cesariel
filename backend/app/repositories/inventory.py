"""
Inventory repositories for POS Cesariel.

Provides data access for stock management, product sizes, and inventory movements.
"""

from app.repositories.base import BaseRepository
from app.models import BranchStock, InventoryMovement, ProductSize
from typing import List, Optional

class BranchStockRepository(BaseRepository[BranchStock]):
    """Repository for BranchStock entity."""
    
    def get_by_branch_and_product(
        self, branch_id: int, product_id: int
    ) -> Optional[BranchStock]:
        """
        Get stock record for a specific product in a specific branch.
        
        Args:
            branch_id: Branch identifier
            product_id: Product identifier
            
        Returns:
            BranchStock record if found, None otherwise
        """
        return self.db.query(self.model).filter(
            self.model.branch_id == branch_id,
            self.model.product_id == product_id
        ).first()
    
    def get_by_branch(self, branch_id: int) -> List[BranchStock]:
        """Get all stock records for a specific branch."""
        return self.get_many_by_field("branch_id", branch_id)

class ProductSizeRepository(BaseRepository[ProductSize]):
    """Repository for ProductSize entity."""
    
    def get_by_product(self, product_id: int) -> List[ProductSize]:
        """Get all size variants for a specific product."""
        return self.get_many_by_field("product_id", product_id)
    
    def get_by_product_and_branch(
        self, product_id: int, branch_id: int
    ) -> List[ProductSize]:
        """
        Get size variants for a product in a specific branch.
        
        Args:
            product_id: Product identifier
            branch_id: Branch identifier
            
        Returns:
            List of ProductSize records
        """
        return self.db.query(self.model).filter(
            self.model.product_id == product_id,
            self.model.branch_id == branch_id
        ).all()

class InventoryMovementRepository(BaseRepository[InventoryMovement]):
    """Repository for InventoryMovement entity."""
    
    def get_by_product(self, product_id: int) -> List[InventoryMovement]:
        """Get all inventory movements for a specific product."""
        return self.get_many_by_field("product_id", product_id)
    
    def get_by_branch(self, branch_id: int) -> List[InventoryMovement]:
        """Get all inventory movements for a specific branch."""
        return self.get_many_by_field("branch_id", branch_id)
