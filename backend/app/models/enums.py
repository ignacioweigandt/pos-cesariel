"""
Enumeraciones del sistema POS Cesariel.

Este módulo define todos los enums utilizados en los modelos de base de datos
para estandarizar valores categóricos y mejorar la validación de datos.
"""

import enum


class UserRole(enum.Enum):
    """
    Roles de usuario disponibles en el sistema POS Cesariel.

    - ADMIN: Acceso completo al sistema, gestión de usuarios y configuración
    - MANAGER: Gestión de sucursal, inventario, reportes y usuarios de sucursal
    - SELLER: Operaciones de punto de venta únicamente
    - ECOMMERCE: Gestión de e-commerce y reportes de ventas online
    """
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SELLER = "SELLER"
    ECOMMERCE = "ECOMMERCE"


class SaleType(enum.Enum):
    """
    Tipos de venta soportados por el sistema.

    - POS: Venta realizada en punto de venta físico
    - ECOMMERCE: Venta realizada a través del e-commerce
    """
    POS = "POS"
    ECOMMERCE = "ECOMMERCE"


class OrderStatus(enum.Enum):
    """
    Estados posibles de una orden en el sistema.

    - PENDING: Orden creada pero pendiente de procesamiento
    - PROCESSING: Orden en proceso de preparación
    - SHIPPED: Orden enviada al cliente
    - DELIVERED: Orden entregada exitosamente
    - CANCELLED: Orden cancelada
    """
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
