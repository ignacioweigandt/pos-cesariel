"""
Reports schemas for POS Cesariel.

Strong typing with Pydantic for all report-related data structures.
Replaces weak typing in dashboard.py with proper validation.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from decimal import Decimal
from datetime import date


# ==================== BASIC DATA STRUCTURES ====================

class TopProduct(BaseModel):
    """Top selling product data with strong typing."""
    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    quantity: int = Field(..., ge=0, description="Total units sold")
    revenue: Decimal = Field(..., ge=0, description="Total revenue generated")
    
    class Config:
        json_encoders = {
            Decimal: str  # Serialize Decimal as string to preserve precision
        }


class BranchSalesData(BaseModel):
    """Sales data for a specific branch."""
    branch_name: str = Field(..., min_length=1, max_length=100, description="Branch name")
    total_sales: Decimal = Field(..., ge=0, description="Total sales amount")
    total_transactions: int = Field(..., ge=0, description="Number of transactions")
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class PaymentMethodData(BaseModel):
    """Sales breakdown by payment method."""
    payment_method: str = Field(..., min_length=1, description="Payment method name")
    total_sales: Decimal = Field(..., ge=0, description="Total sales for this method")
    transaction_count: int = Field(..., ge=0, description="Number of transactions")
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class SaleTypeData(BaseModel):
    """Sales breakdown by sale type (POS, ECOMMERCE, WHATSAPP)."""
    sale_type: str = Field(..., min_length=1, description="Sale type")
    total_sales: Decimal = Field(..., ge=0, description="Total sales for this type")
    transaction_count: int = Field(..., ge=0, description="Number of transactions")
    
    class Config:
        json_encoders = {
            Decimal: str
        }


# ==================== DASHBOARD SCHEMAS ====================

class DashboardStats(BaseModel):
    """Dashboard overview statistics with strong validation."""
    total_sales_today: Decimal = Field(..., ge=0, description="Total sales for today")
    total_sales_month: Decimal = Field(..., ge=0, description="Total sales for current month")
    total_products: int = Field(..., ge=0, description="Total active products")
    low_stock_products: int = Field(..., ge=0, description="Products below minimum stock")
    active_branches: int = Field(..., ge=0, description="Number of active branches")
    total_users: int = Field(..., ge=0, description="Number of active users")
    
    @validator('low_stock_products')
    def low_stock_cannot_exceed_total(cls, v, values):
        """Validate that low stock products cannot exceed total products."""
        if 'total_products' in values and v > values['total_products']:
            raise ValueError('low_stock_products cannot exceed total_products')
        return v
    
    class Config:
        json_encoders = {
            Decimal: str
        }


# ==================== REPORT SCHEMAS ====================

class SalesReport(BaseModel):
    """Comprehensive sales report with strong typing."""
    period: str = Field(..., min_length=1, description="Report period description")
    total_sales: Decimal = Field(..., ge=0, description="Total sales amount")
    total_transactions: int = Field(..., ge=0, description="Total number of transactions")
    average_sale: Decimal = Field(..., ge=0, description="Average transaction amount")
    top_products: List[TopProduct] = Field(default_factory=list, description="Top selling products")
    sales_by_branch: List[BranchSalesData] = Field(default_factory=list, description="Sales by branch")
    
    @validator('average_sale')
    def validate_average(cls, v, values):
        """Validate that average makes sense given total sales and transactions."""
        if 'total_transactions' in values and 'total_sales' in values:
            if values['total_transactions'] == 0:
                if v != Decimal("0.00"):
                    raise ValueError('average_sale must be 0 when total_transactions is 0')
            else:
                expected_avg = values['total_sales'] / values['total_transactions']
                # Allow small rounding differences
                if abs(v - expected_avg) > Decimal("0.01"):
                    raise ValueError(f'average_sale ({v}) does not match calculated average ({expected_avg})')
        return v
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class DetailedSalesReport(SalesReport):
    """Extended sales report with additional breakdowns."""
    sales_by_payment_method: List[PaymentMethodData] = Field(
        default_factory=list,
        description="Sales breakdown by payment method"
    )
    sales_by_type: List[SaleTypeData] = Field(
        default_factory=list,
        description="Sales breakdown by sale type"
    )


# ==================== CHART DATA SCHEMAS ====================

class DailySales(BaseModel):
    """Daily sales data point for charts."""
    date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$', description="Date in YYYY-MM-DD format")
    sales: Decimal = Field(..., ge=0, description="Total sales for the day")
    transactions: int = Field(..., ge=0, description="Number of transactions")
    
    @validator('date')
    def validate_date_format(cls, v):
        """Validate date format more strictly."""
        try:
            # Try to parse as date to ensure it's valid
            year, month, day = map(int, v.split('-'))
            date(year, month, day)
        except (ValueError, AttributeError):
            raise ValueError('Invalid date format. Must be YYYY-MM-DD with valid date values')
        return v
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class ChartData(BaseModel):
    """Generic chart data point (for pie charts, bar charts, etc)."""
    name: str = Field(..., min_length=1, max_length=200, description="Data point label")
    value: Decimal = Field(..., ge=0, description="Data point value")
    
    class Config:
        json_encoders = {
            Decimal: str
        }


# ==================== REQUEST SCHEMAS ====================

class ReportFilters(BaseModel):
    """Filters for report generation."""
    start_date: date = Field(..., description="Report start date")
    end_date: date = Field(..., description="Report end date")
    branch_id: Optional[int] = Field(None, ge=1, description="Optional branch filter")
    
    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        """Validate that end date is after or equal to start date."""
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after or equal to start_date')
        return v
    
    @validator('end_date')
    def date_range_not_too_large(cls, v, values):
        """Validate that date range is reasonable (max 2 years)."""
        if 'start_date' in values:
            delta = v - values['start_date']
            if delta.days > 730:  # ~2 years
                raise ValueError('Date range cannot exceed 2 years (730 days)')
        return v


# ==================== RESPONSE METADATA ====================

class ReportMetadata(BaseModel):
    """Metadata about report generation."""
    generated_at: str = Field(..., description="ISO timestamp of report generation")
    filters_applied: dict = Field(..., description="Filters used to generate report")
    data_points: int = Field(..., ge=0, description="Number of data points in report")
    
    class Config:
        schema_extra = {
            "example": {
                "generated_at": "2025-01-28T10:30:00Z",
                "filters_applied": {
                    "start_date": "2025-01-01",
                    "end_date": "2025-01-31",
                    "branch_id": 1
                },
                "data_points": 150
            }
        }


class SalesReportWithMetadata(BaseModel):
    """Sales report with generation metadata."""
    report: SalesReport = Field(..., description="The actual report data")
    metadata: ReportMetadata = Field(..., description="Report generation metadata")
