"""
Sale Service for POS Cesariel.

Handles all sale-related business logic including sale creation,
validation, stock updates, and reporting.
"""

from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from app.repositories.sale import SaleRepository, SaleItemRepository
from app.services.inventory_service import InventoryService
from app.services.product_service import ProductService
from app.models import Sale, SaleItem
from app.schemas.sale import SaleCreate


class SaleService:
    """Service for sale management operations."""

    def __init__(self, db: Session):
        self.db = db
        self.sale_repo = SaleRepository(Sale, db)
        self.sale_item_repo = SaleItemRepository(SaleItem, db)
        self.inventory_service = InventoryService(db)
        self.product_service = ProductService(db)

    def create_sale(
        self,
        sale_data: SaleCreate,
        user_id: int,
        branch_id: int
    ) -> Sale:
        """
        Create a new sale with stock validation and updates.
        """
        # Validate stock availability for all items
        for item in sale_data.items:
            product = self.product_service.product_repo.get(item.product_id)
            if not product:
                raise ValueError(f"Product {item.product_id} not found")

            has_stock = self.inventory_service.has_sufficient_stock(
                product_id=item.product_id,
                branch_id=branch_id,
                quantity=item.quantity,
                size=getattr(item, 'size', None)
            )

            if not has_stock:
                raise ValueError(
                    f"Insufficient stock for product {product.name}. "
                    f"Required: {item.quantity}"
                )

        # Calculate totals
        subtotal = self._calculate_subtotal(sale_data.items)
        tax = self._calculate_tax(subtotal, getattr(sale_data, 'tax_amount', None))
        discount = getattr(sale_data, 'discount_amount', Decimal(0))
        total = subtotal + tax - discount

        # Create sale
        sale_dict = sale_data.dict(exclude={'items'})
        sale_dict.update({
            'user_id': user_id,
            'branch_id': branch_id,
            'subtotal': subtotal,
            'tax_amount': tax,
            'discount_amount': discount,
            'total_amount': total
        })
        sale = self.sale_repo.create(sale_dict)

        # Create sale items and update inventory
        for item_data in sale_data.items:
            product = self.product_service.product_repo.get(item_data.product_id)
            
            # Create sale item
            item_dict = {
                'sale_id': sale.id,
                'product_id': item_data.product_id,
                'quantity': item_data.quantity,
                'unit_price': item_data.unit_price,
                'total_price': item_data.unit_price * item_data.quantity,
                'size': getattr(item_data, 'size', None)
            }
            self.sale_item_repo.create(item_dict)

            # Decrease inventory
            self.inventory_service.decrease_stock(
                product_id=item_data.product_id,
                branch_id=branch_id,
                quantity=item_data.quantity,
                size=getattr(item_data, 'size', None),
                reference_type="SALE",
                reference_id=sale.id
            )

        return sale

    def _calculate_subtotal(self, items) -> Decimal:
        """Calculate sale subtotal from items."""
        return sum(
            Decimal(str(item.unit_price)) * item.quantity 
            for item in items
        )

    def _calculate_tax(self, subtotal: Decimal, provided_tax: Optional[Decimal] = None) -> Decimal:
        """Calculate tax amount."""
        if provided_tax is not None:
            return Decimal(str(provided_tax))
        
        # Default tax rate (could be from configuration)
        tax_rate = Decimal("0.00")  # Adjust as needed
        return subtotal * tax_rate

    def get_sales_by_date_range(
        self,
        start_date: datetime,
        end_date: datetime,
        branch_id: Optional[int] = None
    ) -> List[Sale]:
        """Get sales within date range."""
        sales = self.sale_repo.get_by_date_range(start_date, end_date)
        
        if branch_id:
            sales = [s for s in sales if s.branch_id == branch_id]
        
        return sales
