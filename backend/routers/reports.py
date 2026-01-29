"""
Reports Router for POS Cesariel.

Thin HTTP layer that delegates all business logic to ReportsService.
Each endpoint should be < 30 lines and only handle HTTP concerns.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional, List

from database import get_db
from app.models import User
from app.services.reports_service import ReportsService
from app.schemas.reports import (
    DashboardStats,
    SalesReport,
    DetailedSalesReport,
    DailySales,
    ChartData,
    TopBrand,
    SalesListResponse,
    BranchData
)
from auth_compat import get_current_active_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get real-time dashboard statistics.
    
    - **branch_id**: Optional branch filter (admin only)
    
    Returns current metrics including sales today, sales this month,
    product counts, and low stock alerts.
    """
    try:
        service = ReportsService(db)
        return service.get_dashboard_stats(
            user=current_user,
            branch_id=branch_id
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )


@router.get("/sales", response_model=SalesReport)
async def get_sales_report(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get comprehensive sales report for date range.
    
    - **start_date**: Report start date (YYYY-MM-DD)
    - **end_date**: Report end date (YYYY-MM-DD)
    - **branch_id**: Optional branch filter (admin only)
    
    Returns aggregated sales data, top products, and branch breakdown.
    """
    try:
        service = ReportsService(db)
        return service.get_sales_report(
            user=current_user,
            start_date=start_date,
            end_date=end_date,
            branch_id=branch_id
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating sales report: {str(e)}"
        )


@router.get("/sales/detailed", response_model=DetailedSalesReport)
async def get_detailed_sales_report(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed sales report with payment method and sale type breakdowns.
    
    - **start_date**: Report start date
    - **end_date**: Report end date
    - **branch_id**: Optional branch filter
    
    Includes all data from standard report plus:
    - Sales by payment method
    - Sales by sale type (POS/E-commerce/WhatsApp)
    """
    try:
        service = ReportsService(db)
        return service.get_detailed_sales_report(
            user=current_user,
            start_date=start_date,
            end_date=end_date,
            branch_id=branch_id
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating detailed report: {str(e)}"
        )


@router.get("/daily-sales", response_model=List[DailySales])
async def get_daily_sales(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get daily sales breakdown for the specified date range.
    
    - **start_date**: Start date
    - **end_date**: End date
    - **branch_id**: Optional branch filter
    
    Returns daily aggregated sales data suitable for line charts.
    """
    try:
        service = ReportsService(db)
        return service.get_daily_sales(
            user=current_user,
            start_date=start_date,
            end_date=end_date,
            branch_id=branch_id
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching daily sales: {str(e)}"
        )


@router.get("/products-chart", response_model=List[ChartData])
async def get_products_chart_data(
    start_date: date,
    end_date: date,
    limit: int = 10,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get top selling products data for charts.
    
    - **start_date**: Start date
    - **end_date**: End date
    - **limit**: Maximum number of products (default: 10)
    - **branch_id**: Optional branch filter
    
    Returns product names and quantities suitable for pie/bar charts.
    """
    try:
        service = ReportsService(db)
        return service.get_products_chart_data(
            user=current_user,
            start_date=start_date,
            end_date=end_date,
            branch_id=branch_id,
            limit=limit
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products chart data: {str(e)}"
        )


@router.get("/branches-chart", response_model=List[BranchData])
async def get_branches_chart_data(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get branch sales comparison data with full details (admin only).
    
    - **start_date**: Start date
    - **end_date**: End date
    
    Returns complete branch data including id, name, total sales, and orders count.
    Admin access required.
    """
    try:
        service = ReportsService(db)
        return service.get_branches_chart_data(
            user=current_user,
            start_date=start_date,
            end_date=end_date
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching branches chart data: {str(e)}"
        )


@router.get("/brands-chart", response_model=List[TopBrand])
async def get_brands_chart_data(
    start_date: date,
    end_date: date,
    limit: int = 10,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get top selling brands data with complete details.
    
    - **start_date**: Start date
    - **end_date**: End date
    - **limit**: Maximum number of brands (default: 10)
    - **branch_id**: Optional branch filter
    
    Returns complete brand data including id, name, products count, quantity sold, and total revenue.
    """
    try:
        service = ReportsService(db)
        return service.get_brands_chart_data(
            user=current_user,
            start_date=start_date,
            end_date=end_date,
            branch_id=branch_id,
            limit=limit
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching brands chart data: {str(e)}"
        )


@router.get("/sales-list", response_model=SalesListResponse)
async def get_sales_list(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    sale_type: Optional[str] = None,
    payment_method: Optional[str] = None,
    order_status: Optional[str] = None,
    search: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    page: int = 1,
    page_size: int = 25,
    order_by: str = "created_at",
    order_dir: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get paginated list of individual sales with full details and advanced filters.
    
    - **start_date**: Start date
    - **end_date**: End date
    - **branch_id**: Optional branch filter
    - **sale_type**: Optional sale type filter (POS/ECOMMERCE)
    - **payment_method**: Optional payment method filter
    - **order_status**: Optional order status filter (PENDING/CONFIRMED/COMPLETED/CANCELLED)
    - **search**: Optional text search (sale_number or customer_name)
    - **min_amount**: Optional minimum amount filter
    - **max_amount**: Optional maximum amount filter
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 25, max: 100)
    - **order_by**: Sort column (created_at, total_amount, sale_number)
    - **order_dir**: Sort direction (asc/desc)
    
    Returns paginated list of sales with metadata.
    """
    try:
        from decimal import Decimal
        
        # Validate page_size
        if page_size > 100:
            page_size = 100
        if page_size < 1:
            page_size = 25
        
        # Convert float amounts to Decimal
        min_amount_decimal = Decimal(str(min_amount)) if min_amount is not None else None
        max_amount_decimal = Decimal(str(max_amount)) if max_amount is not None else None
        
        service = ReportsService(db)
        return service.get_sales_list(
            user=current_user,
            start_date=start_date,
            end_date=end_date,
            branch_id=branch_id,
            sale_type=sale_type,
            payment_method=payment_method,
            order_status=order_status,
            search=search,
            min_amount=min_amount_decimal,
            max_amount=max_amount_decimal,
            page=page,
            page_size=page_size,
            order_by=order_by,
            order_dir=order_dir
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching sales list: {str(e)}"
        )
