"""
Common schemas and enums for POS Cesariel.

This module contains shared enumerations and common schemas used across the application.
"""

from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SELLER = "SELLER"
    ECOMMERCE = "ECOMMERCE"


class SaleType(str, Enum):
    POS = "POS"
    ECOMMERCE = "ECOMMERCE"


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
