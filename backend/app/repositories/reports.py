"""
Reports repository for POS Cesariel.

Provides specialized data access methods for reporting and analytics.
This repository doesn't follow the standard CRUD pattern since reports
are read-only aggregations from multiple tables.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any

from app.models import (
    Sale, SaleItem, Product, Branch, User,
    OrderStatus, SaleType
)


class ReportsRepository:
    """
    Repository for reports and analytics data access.
    
    Unlike standard repositories, this doesn't inherit from BaseRepository
    since reports are aggregations, not CRUD operations on a single model.
    """
    
    def __init__(self, db: Session):
        """
        Initialize reports repository.
        
        Args:
            db: Database session
        """
        self.db = db
    
    # ==================== SALES AGGREGATIONS ====================
    
    def get_sales_total_for_period(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None,
        sale_type: Optional[SaleType] = None,
        exclude_cancelled: bool = True
    ) -> Decimal:
        """
        Get total sales amount for a period.
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            sale_type: Optional sale type filter
            exclude_cancelled: Whether to exclude cancelled sales
            
        Returns:
            Total sales amount as Decimal
        """
        query = self.db.query(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        if exclude_cancelled:
            query = query.filter(Sale.order_status != OrderStatus.CANCELLED)
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        if sale_type is not None:
            query = query.filter(Sale.sale_type == sale_type)
        
        total = query.with_entities(func.sum(Sale.total_amount)).scalar()
        return total or Decimal("0.00")
    
    def get_sales_count_for_period(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None,
        sale_type: Optional[SaleType] = None,
        exclude_cancelled: bool = True
    ) -> int:
        """
        Get total number of transactions for a period.
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            sale_type: Optional sale type filter
            exclude_cancelled: Whether to exclude cancelled sales
            
        Returns:
            Number of transactions
        """
        query = self.db.query(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        if exclude_cancelled:
            query = query.filter(Sale.order_status != OrderStatus.CANCELLED)
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        if sale_type is not None:
            query = query.filter(Sale.sale_type == sale_type)
        
        return query.count()
    
    def get_daily_sales(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None,
        exclude_cancelled: bool = True
    ) -> List[Any]:
        """
        Get daily sales breakdown for a period.
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            exclude_cancelled: Whether to exclude cancelled sales
            
        Returns:
            List of tuples (date, total_sales, transaction_count)
        """
        query = self.db.query(
            func.date(Sale.created_at).label('sale_date'),
            func.sum(Sale.total_amount).label('daily_sales'),
            func.count(Sale.id).label('daily_transactions')
        ).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        if exclude_cancelled:
            query = query.filter(Sale.order_status != OrderStatus.CANCELLED)
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        return query.group_by(
            func.date(Sale.created_at)
        ).order_by(
            func.date(Sale.created_at)
        ).all()
    
    # ==================== PRODUCT ANALYTICS ====================
    
    def get_top_products(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None,
        limit: int = 10,
        order_by: str = "quantity"
    ) -> List[Any]:
        """
        Get top selling products for a period.
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            limit: Maximum number of products to return
            order_by: Sort by 'quantity' or 'revenue'
            
        Returns:
            List of tuples (product_name, total_quantity, total_revenue)
        """
        query = self.db.query(
            Product.name,
            func.sum(SaleItem.quantity).label('total_quantity'),
            func.sum(SaleItem.total_price).label('total_revenue')
        ).join(SaleItem).join(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end,
            Sale.order_status != OrderStatus.CANCELLED
        )
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        # Order by specified metric
        if order_by == "revenue":
            query = query.group_by(Product.name).order_by(
                func.sum(SaleItem.total_price).desc()
            )
        else:  # Default to quantity
            query = query.group_by(Product.name).order_by(
                func.sum(SaleItem.quantity).desc()
            )
        
        return query.limit(limit).all()
    
    def get_products_chart_data(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None,
        limit: int = 10
    ) -> List[Any]:
        """
        Get product data optimized for charts (quantity only).
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            limit: Maximum number of products
            
        Returns:
            List of tuples (product_name, total_quantity)
        """
        query = self.db.query(
            Product.name,
            func.sum(SaleItem.quantity).label('total_quantity')
        ).join(SaleItem).join(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end,
            Sale.order_status != OrderStatus.CANCELLED
        )
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        return query.group_by(Product.name).order_by(
            func.sum(SaleItem.quantity).desc()
        ).limit(limit).all()
    
    # ==================== BRANCH ANALYTICS ====================
    
    def get_branch_sales(
        self,
        start: datetime,
        end: datetime,
        exclude_cancelled: bool = True
    ) -> List[Any]:
        """
        Get sales data by branch for comparison.
        
        Args:
            start: Start datetime
            end: End datetime
            exclude_cancelled: Whether to exclude cancelled sales
            
        Returns:
            List of tuples (branch_name, total_sales, transaction_count)
        """
        query = self.db.query(
            Branch.name,
            func.sum(Sale.total_amount).label('total_sales'),
            func.count(Sale.id).label('total_transactions')
        ).join(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        if exclude_cancelled:
            query = query.filter(Sale.order_status != OrderStatus.CANCELLED)
        
        return query.group_by(Branch.name).order_by(
            func.sum(Sale.total_amount).desc()
        ).all()
    
    def get_branch_sales_chart_data(
        self,
        start: datetime,
        end: datetime,
        exclude_cancelled: bool = True
    ) -> List[Any]:
        """
        Get branch sales data optimized for charts.
        
        Args:
            start: Start datetime
            end: End datetime
            exclude_cancelled: Whether to exclude cancelled sales
            
        Returns:
            List of tuples (branch_name, total_sales)
        """
        query = self.db.query(
            Branch.name,
            func.sum(Sale.total_amount).label('total_sales')
        ).join(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        if exclude_cancelled:
            query = query.filter(Sale.order_status != OrderStatus.CANCELLED)
        
        return query.group_by(Branch.name).order_by(
            func.sum(Sale.total_amount).desc()
        ).all()
    
    # ==================== HELPER QUERIES ====================
    
    def get_sales_by_payment_method(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None
    ) -> List[Any]:
        """
        Get sales breakdown by payment method.
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            
        Returns:
            List of tuples (payment_method, total_sales, transaction_count)
        """
        query = self.db.query(
            Sale.payment_method,
            func.sum(Sale.total_amount).label('total_sales'),
            func.count(Sale.id).label('transaction_count')
        ).filter(
            Sale.created_at >= start,
            Sale.created_at <= end,
            Sale.order_status != OrderStatus.CANCELLED
        )
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        return query.group_by(Sale.payment_method).all()
    
    def get_sales_by_type(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None
    ) -> List[Any]:
        """
        Get sales breakdown by sale type (POS, ECOMMERCE, WHATSAPP).
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            
        Returns:
            List of tuples (sale_type, total_sales, transaction_count)
        """
        query = self.db.query(
            Sale.sale_type,
            func.sum(Sale.total_amount).label('total_sales'),
            func.count(Sale.id).label('transaction_count')
        ).filter(
            Sale.created_at >= start,
            Sale.created_at <= end,
            Sale.order_status != OrderStatus.CANCELLED
        )
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        return query.group_by(Sale.sale_type).all()
