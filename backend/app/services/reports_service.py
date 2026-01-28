"""
Reports Service for POS Cesariel.

Handles all reporting and analytics business logic.
Orchestrates between repositories and implements business rules.
"""

from sqlalchemy.orm import Session
from datetime import datetime, date, time
from typing import Optional, List
from decimal import Decimal

from app.repositories.reports import ReportsRepository
from app.repositories.product import ProductRepository
from app.models import User, UserRole, Branch, Product
from app.schemas.reports import (
    DashboardStats,
    SalesReport,
    DetailedSalesReport,
    DailySales,
    ChartData,
    TopProduct,
    BranchSalesData,
    PaymentMethodData,
    SaleTypeData
)


class ReportsService:
    """
    Service for reports and analytics business logic.
    
    Implements permission checks, data transformations, and business rules
    for all reporting functionality.
    """
    
    def __init__(self, db: Session):
        """
        Initialize reports service with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self.reports_repo = ReportsRepository(db)
        self.product_repo = ProductRepository(Product, db)
    
    # ==================== PERMISSIONS & VALIDATION ====================
    
    def _validate_branch_access(self, user: User, requested_branch_id: Optional[int]) -> Optional[int]:
        """
        Validate and determine effective branch ID based on user role.
        
        Business Rules:
        - ADMIN: Can access any branch or all branches (None)
        - Non-ADMIN: Can only access their assigned branch
        
        Args:
            user: Current user making the request
            requested_branch_id: Branch ID requested by user (can be None)
            
        Returns:
            Effective branch ID to use for queries
            
        Raises:
            PermissionError: If user tries to access unauthorized branch
        """
        if user.role == UserRole.ADMIN:
            # Admin can see any branch or all branches
            return requested_branch_id
        
        # Non-admin users can only see their own branch
        if requested_branch_id is not None and requested_branch_id != user.branch_id:
            raise PermissionError(
                f"User does not have permission to access branch {requested_branch_id}"
            )
        
        return user.branch_id
    
    def _validate_date_range(self, start: datetime, end: datetime) -> None:
        """
        Validate date range for reports.
        
        Business Rules:
        - End date must be >= start date
        - Date range cannot exceed 2 years
        
        Args:
            start: Start datetime
            end: End datetime
            
        Raises:
            ValueError: If date range is invalid
        """
        if end < start:
            raise ValueError("End date must be after or equal to start date")
        
        delta = end - start
        if delta.days > 730:  # ~2 years
            raise ValueError("Date range cannot exceed 2 years (730 days)")
    
    # ==================== DATE UTILITIES ====================
    
    def _get_today_start(self) -> datetime:
        """Get start of today (00:00:00)."""
        return datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    def _get_today_end(self) -> datetime:
        """Get end of today (23:59:59.999999)."""
        return datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
    
    def _get_month_start(self) -> datetime:
        """Get start of current month."""
        return datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    def _date_to_datetime(self, d: date, end_of_day: bool = False) -> datetime:
        """
        Convert date to datetime.
        
        Args:
            d: Date to convert
            end_of_day: If True, returns end of day (23:59:59.999999)
            
        Returns:
            Datetime object
        """
        if end_of_day:
            return datetime.combine(d, time(23, 59, 59, 999999))
        return datetime.combine(d, time(0, 0, 0))
    
    # ==================== DASHBOARD STATS ====================
    
    def get_dashboard_stats(
        self,
        user: User,
        branch_id: Optional[int] = None
    ) -> DashboardStats:
        """
        Get dashboard statistics with permission checks.
        
        Args:
            user: Current user requesting stats
            branch_id: Optional branch filter
            
        Returns:
            DashboardStats with current metrics
            
        Raises:
            PermissionError: If user doesn't have access to requested branch
        """
        # Validate permissions
        effective_branch_id = self._validate_branch_access(user, branch_id)
        
        # Get date ranges
        today_start = self._get_today_start()
        today_end = self._get_today_end()
        month_start = self._get_month_start()
        
        # Fetch sales data
        total_sales_today = self.reports_repo.get_sales_total_for_period(
            start=today_start,
            end=today_end,
            branch_id=effective_branch_id
        )
        
        total_sales_month = self.reports_repo.get_sales_total_for_period(
            start=month_start,
            end=today_end,
            branch_id=effective_branch_id
        )
        
        # Get product stats
        total_products = self.product_repo.count()
        
        # Count low stock products
        low_stock_products = 0
        try:
            products = self.product_repo.get_all()
            for product in products:
                try:
                    total_stock = product.calculate_total_stock()
                    if total_stock <= product.min_stock:
                        low_stock_products += 1
                except Exception:
                    # Skip products with calculation errors
                    pass
        except Exception:
            # If we can't count, default to 0
            pass
        
        # Get branch/user counts
        active_branches = self.db.query(Branch).filter(Branch.is_active == True).count()
        total_users = self.db.query(User).filter(User.is_active == True).count()
        
        return DashboardStats(
            total_sales_today=total_sales_today,
            total_sales_month=total_sales_month,
            total_products=total_products,
            low_stock_products=low_stock_products,
            active_branches=active_branches,
            total_users=total_users
        )
    
    # ==================== SALES REPORTS ====================
    
    def get_sales_report(
        self,
        user: User,
        start_date: date,
        end_date: date,
        branch_id: Optional[int] = None
    ) -> SalesReport:
        """
        Get comprehensive sales report for date range.
        
        Args:
            user: Current user requesting report
            start_date: Report start date
            end_date: Report end date
            branch_id: Optional branch filter
            
        Returns:
            SalesReport with aggregated data
            
        Raises:
            PermissionError: If user doesn't have access
            ValueError: If date range is invalid
        """
        # Validate permissions
        effective_branch_id = self._validate_branch_access(user, branch_id)
        
        # Convert dates to datetime
        start_datetime = self._date_to_datetime(start_date)
        end_datetime = self._date_to_datetime(end_date, end_of_day=True)
        
        # Validate date range
        self._validate_date_range(start_datetime, end_datetime)
        
        # Get totals
        total_sales = self.reports_repo.get_sales_total_for_period(
            start=start_datetime,
            end=end_datetime,
            branch_id=effective_branch_id
        )
        
        total_transactions = self.reports_repo.get_sales_count_for_period(
            start=start_datetime,
            end=end_datetime,
            branch_id=effective_branch_id
        )
        
        # Calculate average
        average_sale = total_sales / total_transactions if total_transactions > 0 else Decimal(0)
        
        # Get top products
        top_products_data = self.reports_repo.get_top_products(
            start=start_datetime,
            end=end_datetime,
            branch_id=effective_branch_id,
            limit=10
        )
        
        top_products = [
            TopProduct(
                name=p.name,
                quantity=int(p.total_quantity),
                revenue=p.total_revenue
            )
            for p in top_products_data
        ]
        
        # Get branch sales (admin only)
        sales_by_branch: List[BranchSalesData] = []
        if user.role == UserRole.ADMIN:
            branch_sales_data = self.reports_repo.get_branch_sales(
                start=start_datetime,
                end=end_datetime
            )
            sales_by_branch = [
                BranchSalesData(
                    branch_name=b.name,
                    total_sales=b.total_sales,
                    total_transactions=b.total_transactions
                )
                for b in branch_sales_data
            ]
        
        return SalesReport(
            period=f"{start_date} to {end_date}",
            total_sales=total_sales,
            total_transactions=total_transactions,
            average_sale=average_sale,
            top_products=top_products,
            sales_by_branch=sales_by_branch
        )
    
    def get_detailed_sales_report(
        self,
        user: User,
        start_date: date,
        end_date: date,
        branch_id: Optional[int] = None
    ) -> DetailedSalesReport:
        """
        Get detailed sales report with payment method and sale type breakdowns.
        
        Args:
            user: Current user requesting report
            start_date: Report start date
            end_date: Report end date
            branch_id: Optional branch filter
            
        Returns:
            DetailedSalesReport with extended data
        """
        # Get base report
        base_report = self.get_sales_report(user, start_date, end_date, branch_id)
        
        # Get effective branch ID
        effective_branch_id = self._validate_branch_access(user, branch_id)
        
        # Convert dates
        start_datetime = self._date_to_datetime(start_date)
        end_datetime = self._date_to_datetime(end_date, end_of_day=True)
        
        # Get payment method breakdown
        payment_data = self.reports_repo.get_sales_by_payment_method(
            start=start_datetime,
            end=end_datetime,
            branch_id=effective_branch_id
        )
        
        sales_by_payment_method = [
            PaymentMethodData(
                payment_method=p.payment_method or "Unknown",
                total_sales=p.total_sales,
                transaction_count=p.transaction_count
            )
            for p in payment_data
        ]
        
        # Get sale type breakdown
        type_data = self.reports_repo.get_sales_by_type(
            start=start_datetime,
            end=end_datetime,
            branch_id=effective_branch_id
        )
        
        sales_by_type = [
            SaleTypeData(
                sale_type=t.sale_type.value,
                total_sales=t.total_sales,
                transaction_count=t.transaction_count
            )
            for t in type_data
        ]
        
        return DetailedSalesReport(
            **base_report.dict(),
            sales_by_payment_method=sales_by_payment_method,
            sales_by_type=sales_by_type
        )
    
    # ==================== CHART DATA ====================
    
    def get_daily_sales(
        self,
        user: User,
        start_date: date,
        end_date: date,
        branch_id: Optional[int] = None
    ) -> List[DailySales]:
        """
        Get daily sales breakdown for charts.
        
        Args:
            user: Current user
            start_date: Start date
            end_date: End date
            branch_id: Optional branch filter
            
        Returns:
            List of DailySales data points
        """
        effective_branch_id = self._validate_branch_access(user, branch_id)
        
        start_datetime = self._date_to_datetime(start_date)
        end_datetime = self._date_to_datetime(end_date, end_of_day=True)
        
        daily_data = self.reports_repo.get_daily_sales(
            start=start_datetime,
            end=end_datetime,
            branch_id=effective_branch_id
        )
        
        return [
            DailySales(
                date=day.sale_date.isoformat(),
                sales=day.daily_sales or Decimal(0),
                transactions=day.daily_transactions or 0
            )
            for day in daily_data
        ]
    
    def get_products_chart_data(
        self,
        user: User,
        start_date: date,
        end_date: date,
        branch_id: Optional[int] = None,
        limit: int = 10
    ) -> List[ChartData]:
        """
        Get top products data for charts.
        
        Args:
            user: Current user
            start_date: Start date
            end_date: End date
            branch_id: Optional branch filter
            limit: Number of products to return
            
        Returns:
            List of ChartData points
        """
        effective_branch_id = self._validate_branch_access(user, branch_id)
        
        start_datetime = self._date_to_datetime(start_date)
        end_datetime = self._date_to_datetime(end_date, end_of_day=True)
        
        products_data = self.reports_repo.get_products_chart_data(
            start=start_datetime,
            end=end_datetime,
            branch_id=effective_branch_id,
            limit=limit
        )
        
        return [
            ChartData(
                name=p.name,
                value=Decimal(str(p.total_quantity))
            )
            for p in products_data
        ]
    
    def get_branches_chart_data(
        self,
        user: User,
        start_date: date,
        end_date: date
    ) -> List[ChartData]:
        """
        Get branch comparison data for charts (admin only).
        
        Args:
            user: Current user
            start_date: Start date
            end_date: End date
            
        Returns:
            List of ChartData points
            
        Raises:
            PermissionError: If user is not admin
        """
        # Only admins can see branch comparison
        if user.role != UserRole.ADMIN:
            raise PermissionError("Admin access required to view branch comparison")
        
        start_datetime = self._date_to_datetime(start_date)
        end_datetime = self._date_to_datetime(end_date, end_of_day=True)
        
        branches_data = self.reports_repo.get_branch_sales_chart_data(
            start=start_datetime,
            end=end_datetime
        )
        
        return [
            ChartData(
                name=b.name,
                value=b.total_sales or Decimal(0)
            )
            for b in branches_data
        ]
