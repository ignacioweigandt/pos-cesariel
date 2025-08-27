"""
Módulo de excepciones personalizadas para POS Cesariel.

Este módulo define todas las excepciones personalizadas del sistema
para un manejo de errores más específico y controlado.
"""

from .custom_exceptions import (
    PosBaseException,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    BusinessLogicError,
    DatabaseError,
    ExternalServiceError,
    InventoryError,
    SalesError
)

__all__ = [
    "PosBaseException",
    "AuthenticationError", 
    "AuthorizationError",
    "ValidationError",
    "BusinessLogicError",
    "DatabaseError",
    "ExternalServiceError",
    "InventoryError",
    "SalesError"
]