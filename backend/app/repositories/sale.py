"""
Sale repositories for POS Cesariel.

Provides data access for sales transactions and sale items.
"""

from app.repositories.base import BaseRepository
from app.models import Sale, SaleItem
from app.models.enums import SaleType
from typing import List
from datetime import datetime

class SaleRepository(BaseRepository[Sale]):
    """Repository for Sale entity."""
    
    def get_by_branch(self, branch_id: int) -> List[Sale]:
        """Get all sales for a specific branch."""
        return self.get_many_by_field("branch_id", branch_id)
    
    def get_by_user(self, user_id: int) -> List[Sale]:
        """Get all sales made by a specific user."""
        return self.get_many_by_field("user_id", user_id)
    
    def get_by_type(self, sale_type: SaleType) -> List[Sale]:
        """Get all sales of a specific type (POS, ECOMMERCE, WHATSAPP)."""
        return self.db.query(self.model).filter(
            self.model.sale_type == sale_type
        ).all()
    
    def get_by_date_range(
        self, start_date: datetime, end_date: datetime
    ) -> List[Sale]:
        """
        Get all sales within a date range.
        
        Args:
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            List of Sale records in the specified range
        """
        return self.db.query(self.model).filter(
            self.model.created_at >= start_date,
            self.model.created_at <= end_date
        ).all()

class SaleItemRepository(BaseRepository[SaleItem]):
    """Repository for SaleItem entity."""
    
    def get_by_sale(self, sale_id: int) -> List[SaleItem]:
        """Get all items for a specific sale."""
        return self.get_many_by_field("sale_id", sale_id)
    
    def get_by_product(self, product_id: int) -> List[SaleItem]:
        """Get all sale items for a specific product."""
        return self.get_many_by_field("product_id", product_id)
