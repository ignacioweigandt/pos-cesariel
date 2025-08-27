"""
Excepciones personalizadas para el sistema POS Cesariel.

Este módulo define excepciones específicas para diferentes tipos de errores
que pueden ocurrir en el sistema, proporcionando un manejo de errores más granular.
"""

from typing import Any, Dict, Optional


class PosBaseException(Exception):
    """
    Excepción base para todas las excepciones personalizadas del sistema POS.
    
    Attributes:
        message (str): Mensaje de error descriptivo
        error_code (str): Código de error único
        details (Dict[str, Any]): Detalles adicionales del error
    """
    
    def __init__(
        self, 
        message: str, 
        error_code: str = "POS_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Inicializa la excepción base.
        
        Args:
            message (str): Mensaje descriptivo del error
            error_code (str): Código único del error
            details (Optional[Dict[str, Any]]): Información adicional del error
        """
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(PosBaseException):
    """
    Excepción para errores de autenticación.
    
    Se lanza cuando fallan las credenciales de usuario o token inválido.
    """
    
    def __init__(self, message: str = "Error de autenticación", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "AUTH_ERROR", details)


class AuthorizationError(PosBaseException):
    """
    Excepción para errores de autorización.
    
    Se lanza cuando un usuario no tiene permisos para realizar una acción.
    """
    
    def __init__(self, message: str = "No autorizado", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "AUTHORIZATION_ERROR", details)


class ValidationError(PosBaseException):
    """
    Excepción para errores de validación de datos.
    
    Se lanza cuando los datos de entrada no cumplen con los criterios de validación.
    """
    
    def __init__(
        self, 
        message: str = "Error de validación", 
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if field:
            details = details or {}
            details['field'] = field
        super().__init__(message, "VALIDATION_ERROR", details)


class BusinessLogicError(PosBaseException):
    """
    Excepción para errores de lógica de negocio.
    
    Se lanza cuando una operación viola las reglas de negocio del sistema.
    """
    
    def __init__(self, message: str = "Error de lógica de negocio", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "BUSINESS_LOGIC_ERROR", details)


class DatabaseError(PosBaseException):
    """
    Excepción para errores de base de datos.
    
    Se lanza cuando ocurren problemas de conectividad o integridad en la base de datos.
    """
    
    def __init__(self, message: str = "Error de base de datos", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "DATABASE_ERROR", details)


class ExternalServiceError(PosBaseException):
    """
    Excepción para errores de servicios externos.
    
    Se lanza cuando fallan las integraciones con servicios externos (Cloudinary, etc.).
    """
    
    def __init__(
        self, 
        message: str = "Error de servicio externo", 
        service: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if service:
            details = details or {}
            details['service'] = service
        super().__init__(message, "EXTERNAL_SERVICE_ERROR", details)


class InventoryError(PosBaseException):
    """
    Excepción para errores específicos del inventario.
    
    Se lanza cuando ocurren problemas relacionados con stock, productos, etc.
    """
    
    def __init__(self, message: str = "Error de inventario", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "INVENTORY_ERROR", details)


class InsufficientStockError(InventoryError):
    """
    Excepción específica para stock insuficiente.
    """
    
    def __init__(
        self, 
        product_name: str, 
        requested_quantity: int, 
        available_quantity: int,
        details: Optional[Dict[str, Any]] = None
    ):
        message = (
            f"Stock insuficiente para '{product_name}'. "
            f"Solicitado: {requested_quantity}, Disponible: {available_quantity}"
        )
        details = details or {}
        details.update({
            'product_name': product_name,
            'requested_quantity': requested_quantity,
            'available_quantity': available_quantity
        })
        super().__init__(message, details)


class ProductNotFoundError(InventoryError):
    """
    Excepción específica para producto no encontrado.
    """
    
    def __init__(self, product_identifier: str, details: Optional[Dict[str, Any]] = None):
        message = f"Producto no encontrado: {product_identifier}"
        details = details or {}
        details['product_identifier'] = product_identifier
        super().__init__(message, details)


class SalesError(PosBaseException):
    """
    Excepción para errores específicos de ventas.
    
    Se lanza cuando ocurren problemas durante el proceso de ventas.
    """
    
    def __init__(self, message: str = "Error en venta", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "SALES_ERROR", details)


class InvalidSaleStateError(SalesError):
    """
    Excepción específica para estado inválido de venta.
    """
    
    def __init__(self, sale_id: int, current_state: str, details: Optional[Dict[str, Any]] = None):
        message = f"Estado de venta inválido para venta {sale_id}: {current_state}"
        details = details or {}
        details.update({
            'sale_id': sale_id,
            'current_state': current_state
        })
        super().__init__(message, details)


class PaymentError(SalesError):
    """
    Excepción específica para errores de pago.
    """
    
    def __init__(self, message: str = "Error de pago", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, details)