"""
Repository de Reportes y Analíticas.

Acceso a datos especializado para reportes empresariales y dashboards.
NO hereda de BaseRepository: son agregaciones read-only, no CRUD.

Características:
    - Agregaciones multi-tabla (ventas, productos, sucursales)
    - Filtros avanzados por fecha, sucursal, usuario, tipo de venta
    - Optimizado para reportes de gran volumen
    - Métricas: totales, promedios, rankings, tendencias
    - Soporte para gráficos y dashboards

Tipos de Reportes:
    - Ventas: totales, por período, por sucursal, por usuario, por tipo
    - Productos: más vendidos, stock bajo, por categoría
    - Clientes: frecuencia, ticket promedio
    - Financieros: por método de pago, cuotas, recargos
    - Tendencias: comparativas temporales, growth rates
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
            exclude_cancelled: Whether to exclude cancelled/pending sales
            
        Returns:
            Total sales amount as Decimal
        """
        query = self.db.query(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        if exclude_cancelled:
            # Excluir ventas canceladas Y pendientes (e-commerce no confirmado)
            query = query.filter(
                Sale.order_status != OrderStatus.CANCELLED,
                Sale.order_status != OrderStatus.PENDING
            )
        
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
            exclude_cancelled: Whether to exclude cancelled/pending sales
            
        Returns:
            Number of transactions
        """
        query = self.db.query(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        if exclude_cancelled:
            # Excluir ventas canceladas Y pendientes (e-commerce no confirmado)
            query = query.filter(
                Sale.order_status != OrderStatus.CANCELLED,
                Sale.order_status != OrderStatus.PENDING
            )
        
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
            query = query.filter(
                Sale.order_status != OrderStatus.CANCELLED,
                Sale.order_status != OrderStatus.PENDING
            )
        
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
            Sale.order_status != OrderStatus.CANCELLED,
            Sale.order_status != OrderStatus.PENDING
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
            Sale.order_status != OrderStatus.CANCELLED,
            Sale.order_status != OrderStatus.PENDING
        )
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        return query.group_by(Product.name).order_by(
            func.sum(SaleItem.quantity).desc()
        ).limit(limit).all()
    
    # ==================== BRAND ANALYTICS ====================
    
    def get_top_brands(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None,
        limit: int = 10,
        order_by: str = "revenue"
    ) -> List[Any]:
        """
        Get top selling brands for a period.
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            limit: Maximum number of brands to return
            order_by: Sort by 'quantity' or 'revenue'
            
        Returns:
            List of tuples (brand_id, brand_name, products_count, total_quantity, total_revenue)
        """
        from app.models import Brand
        
        query = self.db.query(
            Brand.id.label('brand_id'),
            Brand.name.label('brand_name'),
            func.count(func.distinct(Product.id)).label('products_count'),
            func.sum(SaleItem.quantity).label('total_quantity'),
            func.sum(SaleItem.total_price).label('total_revenue')
        ).join(
            Product, Product.brand_id == Brand.id
        ).join(
            SaleItem, SaleItem.product_id == Product.id
        ).join(
            Sale, Sale.id == SaleItem.sale_id
        ).filter(
            Sale.created_at >= start,
            Sale.created_at <= end,
            Sale.order_status != OrderStatus.CANCELLED,
            Sale.order_status != OrderStatus.PENDING,
            Product.brand_id.isnot(None)  # Only products with assigned brand
        )
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        # Group by brand
        query = query.group_by(Brand.id, Brand.name)
        
        # Order by specified metric
        if order_by == "quantity":
            query = query.order_by(func.sum(SaleItem.quantity).desc())
        else:  # Default to revenue
            query = query.order_by(func.sum(SaleItem.total_price).desc())
        
        return query.limit(limit).all()
    
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
            query = query.filter(
                Sale.order_status != OrderStatus.CANCELLED,
                Sale.order_status != OrderStatus.PENDING
            )
        
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
        Get branch sales data with complete details.
        
        Args:
            start: Start datetime
            end: End datetime
            exclude_cancelled: Whether to exclude cancelled sales
            
        Returns:
            List of objects with attributes: id, name, total_sales, orders_count
        """
        query = self.db.query(
            Branch.id,
            Branch.name,
            func.sum(Sale.total_amount).label('total_sales'),
            func.count(Sale.id).label('orders_count')
        ).join(Sale).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        if exclude_cancelled:
            query = query.filter(
                Sale.order_status != OrderStatus.CANCELLED,
                Sale.order_status != OrderStatus.PENDING
            )
        
        return query.group_by(Branch.id, Branch.name).order_by(
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
            Sale.order_status != OrderStatus.CANCELLED,
            Sale.order_status != OrderStatus.PENDING
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
            Sale.order_status != OrderStatus.CANCELLED,
            Sale.order_status != OrderStatus.PENDING
        )
        
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        return query.group_by(Sale.sale_type).all()
    
    def get_sales_list(
        self,
        start: datetime,
        end: datetime,
        branch_id: Optional[int] = None,
        sale_type: Optional[str] = None,
        payment_method: Optional[str] = None,
        order_status: Optional[str] = None,
        search: Optional[str] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        page: int = 1,
        page_size: int = 25,
        order_by: str = "created_at",
        order_dir: str = "desc"
    ) -> Dict[str, Any]:
        """
        Get paginated list of individual sales with details and advanced filters.
        
        Args:
            start: Start datetime
            end: End datetime
            branch_id: Optional branch filter
            sale_type: Optional sale type filter (POS/ECOMMERCE)
            payment_method: Optional payment method filter
            order_status: Optional order status filter (PENDING/CONFIRMED/COMPLETED/CANCELLED)
            search: Optional text search (sale_number or customer_name)
            min_amount: Optional minimum amount filter
            max_amount: Optional maximum amount filter
            page: Page number (1-indexed)
            page_size: Number of items per page
            order_by: Column to order by (created_at, total_amount, sale_number)
            order_dir: Order direction (asc/desc)
            
        Returns:
            Dict with 'items', 'total', 'page', 'page_size', 'total_pages'
        """
        # Base query with joins
        query = self.db.query(
            Sale.id,
            Sale.sale_number,
            Sale.sale_type,
            Branch.name.label('branch_name'),
            Sale.customer_name,
            func.count(SaleItem.id).label('items_count'),
            Sale.total_amount,
            Sale.payment_method,
            Sale.order_status,
            Sale.created_at
        ).join(
            Branch, Sale.branch_id == Branch.id
        ).outerjoin(
            SaleItem, SaleItem.sale_id == Sale.id
        ).filter(
            Sale.created_at >= start,
            Sale.created_at <= end
        )
        
        # Apply filters
        if branch_id is not None:
            query = query.filter(Sale.branch_id == branch_id)
        
        if sale_type is not None:
            query = query.filter(Sale.sale_type == sale_type)
        
        if payment_method is not None:
            # Case-insensitive comparison for payment_method
            query = query.filter(func.lower(Sale.payment_method) == payment_method.lower())
        
        if order_status is not None:
            # Convert string to OrderStatus enum
            try:
                status_enum = OrderStatus(order_status)
                query = query.filter(Sale.order_status == status_enum)
            except ValueError:
                # Invalid status value, ignore filter
                pass
        
        # Text search: sale_number OR customer_name (case-insensitive)
        if search is not None and search.strip():
            search_term = f"%{search.strip()}%"
            query = query.filter(
                (Sale.sale_number.ilike(search_term)) |
                (Sale.customer_name.ilike(search_term))
            )
        
        # Amount range filters
        if min_amount is not None:
            query = query.filter(Sale.total_amount >= min_amount)
        
        if max_amount is not None:
            query = query.filter(Sale.total_amount <= max_amount)
        
        # Group by all non-aggregated columns
        query = query.group_by(
            Sale.id,
            Sale.sale_number,
            Sale.sale_type,
            Branch.name,
            Sale.customer_name,
            Sale.total_amount,
            Sale.payment_method,
            Sale.order_status,
            Sale.created_at
        )
        
        # Count total before pagination
        total = query.count()
        
        # Apply ordering
        order_column = Sale.created_at
        if order_by == "total_amount":
            order_column = Sale.total_amount
        elif order_by == "sale_number":
            order_column = Sale.sale_number
        
        if order_dir == "asc":
            query = query.order_by(order_column.asc())
        else:
            query = query.order_by(order_column.desc())
        
        # Apply pagination
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        
        # Calculate total pages
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        
        return {
            'items': items,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages
        }
