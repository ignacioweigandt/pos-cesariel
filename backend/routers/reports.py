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
    ChartData
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


@router.get("/branches-chart", response_model=List[ChartData])
async def get_branches_chart_data(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get branch sales comparison data for charts (admin only).
    
    - **start_date**: Start date
    - **end_date**: End date
    
    Returns sales data by branch suitable for bar/column charts.
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
