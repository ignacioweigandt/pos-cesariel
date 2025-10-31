"""
User and Branch models for the POS Cesariel system.

This module contains user-related models including Branch and User entities,
which handle multi-branch management and role-based access control.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from app.models.enums import UserRole


class Branch(Base):
    """
    Modelo de Sucursal para el sistema multisucursal POS Cesariel.
    
    Representa una sucursal física donde se realizan operaciones de venta,
    gestión de inventario y administración de usuarios locales.
    
    Attributes:
        id (int): Identificador único de la sucursal
        name (str): Nombre descriptivo de la sucursal (máx. 100 caracteres)
        address (str): Dirección física de la sucursal (máx. 200 caracteres)
        phone (str): Número de teléfono de contacto (máx. 20 caracteres)
        email (str): Email de contacto de la sucursal (máx. 100 caracteres)
        is_active (bool): Indica si la sucursal está activa operativamente
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        users: Lista de usuarios asignados a esta sucursal
        sales: Lista de ventas realizadas en esta sucursal
    """
    __tablename__ = "branches"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True, 
                doc="Identificador único autoincremental de la sucursal")
    name = Column(String(100), nullable=False,
                  doc="Nombre descriptivo de la sucursal")
    address = Column(String(200), 
                     doc="Dirección física completa de la sucursal")
    phone = Column(String(20),
                   doc="Número de teléfono de contacto")
    email = Column(String(100),
                   doc="Email de contacto institucional")
    
    # Campos de control
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la sucursal")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    users = relationship("User", back_populates="branch",
                        doc="Usuarios asignados a esta sucursal")
    sales = relationship("Sale", back_populates="branch",
                        doc="Ventas realizadas en esta sucursal")
    inventory_movements = relationship("InventoryMovement", back_populates="branch",
                                     doc="Movimientos de inventario de esta sucursal")
    notifications = relationship("Notification", back_populates="branch",
                                doc="Notificaciones de esta sucursal")


class User(Base):
    """
    Modelo de Usuario del sistema POS Cesariel.
    
    Representa a todos los usuarios que pueden acceder al sistema,
    incluyendo administradores, gerentes, vendedores y usuarios de e-commerce.
    Cada usuario está asignado a una sucursal específica y tiene un rol definido
    que determina sus permisos y funcionalidades disponibles.
    
    Attributes:
        id (int): Identificador único del usuario
        email (str): Email único del usuario, usado para notificaciones y recuperación
        username (str): Nombre de usuario único para login (máx. 50 caracteres)
        full_name (str): Nombre completo del usuario (máx. 100 caracteres)
        hashed_password (str): Contraseña hasheada con bcrypt (máx. 255 caracteres)
        role (UserRole): Rol del usuario que determina permisos (ADMIN, MANAGER, SELLER, ECOMMERCE)
        branch_id (int): ID de la sucursal asignada (FK hacia branches.id)
        is_active (bool): Estado activo/inactivo del usuario
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        branch: Sucursal asignada al usuario
        sales: Lista de ventas realizadas por este usuario
    """
    __tablename__ = "users"
    
    # Campos principales de identificación
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental del usuario")
    email = Column(String(100), unique=True, index=True, nullable=False,
                   doc="Email único del usuario para autenticación y notificaciones")
    username = Column(String(50), unique=True, index=True, nullable=False,
                      doc="Nombre de usuario único para inicio de sesión")
    full_name = Column(String(100), nullable=False,
                       doc="Nombre completo del usuario para mostrar en interfaz")
    
    # Campos de seguridad y autorización
    hashed_password = Column(String(255), nullable=False,
                             doc="Contraseña encriptada usando bcrypt")
    role = Column(Enum(UserRole), nullable=False,
                  doc="Rol del usuario que define permisos del sistema")
    
    # Asignación de sucursal
    branch_id = Column(Integer, ForeignKey("branches.id"),
                       doc="ID de la sucursal asignada al usuario")
    
    # Campos de control
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo del usuario")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    branch = relationship("Branch", back_populates="users",
                         doc="Sucursal asignada al usuario")
    sales = relationship("Sale", back_populates="user",
                        doc="Ventas realizadas por este usuario")
    notifications = relationship("Notification", back_populates="user",
                                doc="Notificaciones del usuario")
    notification_settings = relationship("NotificationSetting", back_populates="user", uselist=False,
                                        doc="Configuración de notificaciones del usuario")
