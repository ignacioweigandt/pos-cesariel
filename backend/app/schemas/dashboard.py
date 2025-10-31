"""
Dashboard schemas for POS Cesariel.

This module contains Pydantic schemas for dashboard statistics and reports.
"""

from pydantic import BaseModel
from typing import List, Union
from decimal import Decimal


# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_sales_today: Decimal
    total_sales_month: Decimal
    total_products: int
    low_stock_products: int
    active_branches: int
    total_users: int


# Sales Report Schema
class SalesReport(BaseModel):
    period: str
    total_sales: Decimal
    total_transactions: int
    average_sale: Decimal
    top_products: List[dict]
    sales_by_branch: List[dict]


# Chart Data Schemas
class DailySales(BaseModel):
    date: str
    sales: Decimal
    transactions: int


class ChartData(BaseModel):
    name: str
    value: Union[int, float, Decimal]
