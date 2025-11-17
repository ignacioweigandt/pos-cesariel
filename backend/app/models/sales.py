"""
Sales models for the POS Cesariel system.

This module contains sales-related models including Sale and SaleItem entities,
which handle all sales transactions and line items.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from app.models.enums import SaleType, OrderStatus


class Sale(Base):
    """
    Modelo de Venta del sistema POS Cesariel.
    
    Representa todas las transacciones de venta realizadas tanto en POS
    como en e-commerce. Incluye información del cliente, montos, impuestos,
    descuentos y estado de la orden para un seguimiento completo.
    
    Attributes:
        id (int): Identificador único de la venta
        sale_number (str): Número único de venta generado automáticamente
        sale_type (SaleType): Tipo de venta (POS o ECOMMERCE)
        branch_id (int): ID de la sucursal donde se realizó la venta
        user_id (int): ID del usuario que procesó la venta
        customer_name (str): Nombre del cliente (máx. 100 caracteres)
        customer_email (str): Email del cliente para notificaciones
        customer_phone (str): Teléfono del cliente para contacto
        subtotal (decimal): Subtotal de la venta sin impuestos ni descuentos
        tax_amount (decimal): Monto de impuestos aplicados
        discount_amount (decimal): Monto de descuento aplicado
        total_amount (decimal): Monto total final de la venta
        payment_method (str): Método de pago utilizado
        payment_method_id (int): Referencia al payment_method usado
        payment_method_name (str): Nombre del método de pago (snapshot)
        order_status (OrderStatus): Estado actual de la orden
        tax_rate_id (int): Referencia a la tasa de impuesto aplicada
        tax_rate_name (str): Nombre de la tasa de impuesto (snapshot)
        tax_rate_percentage (decimal): Porcentaje de impuesto aplicado (snapshot)
        notes (str): Notas adicionales de la venta
        created_at (datetime): Fecha y hora de creación de la venta
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        branch: Sucursal donde se realizó la venta
        user: Usuario que procesó la venta
        sale_items: Lista de productos vendidos en esta transacción
    """
    __tablename__ = "sales"
    
    # Campos principales de identificación
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental de la venta")
    sale_number = Column(String(50), unique=True, index=True, nullable=False,
                         doc="Número único de venta generado automáticamente")
    sale_type = Column(Enum(SaleType), nullable=False,
                       doc="Tipo de venta (POS presencial o ECOMMERCE online)")
    
    # Asignación de sucursal y usuario
    branch_id = Column(Integer, ForeignKey("branches.id"),
                       doc="ID de la sucursal donde se realizó la venta")
    user_id = Column(Integer, ForeignKey("users.id"),
                     doc="ID del usuario que procesó la venta")
    
    # Información del cliente
    customer_name = Column(String(100),
                          doc="Nombre del cliente")
    customer_email = Column(String(100),
                           doc="Email del cliente para notificaciones")
    customer_phone = Column(String(20),
                           doc="Teléfono del cliente para contacto")
    
    # Montos financieros
    subtotal = Column(Numeric(10, 2), nullable=False,
                      doc="Subtotal de la venta sin impuestos ni descuentos")
    tax_amount = Column(Numeric(10, 2), default=0,
                        doc="Monto de impuestos aplicados")
    discount_amount = Column(Numeric(10, 2), default=0,
                             doc="Monto de descuento aplicado")
    total_amount = Column(Numeric(10, 2), nullable=False,
                          doc="Monto total final de la venta")
    
    # Información de pago y estado
    payment_method = Column(String(50),
                            doc="Método de pago utilizado (efectivo, tarjeta, etc.)")
    payment_method_id = Column(Integer, nullable=True,
                               doc="Referencia al método de pago usado (payment_methods.id)")
    payment_method_name = Column(String(100), nullable=True,
                                doc="Nombre del método de pago al momento de la venta")
    order_status = Column(Enum(OrderStatus), default=OrderStatus.PENDING,
                          doc="Estado actual de la orden")

    # Referencias de configuración de impuestos (trazabilidad)
    tax_rate_id = Column(Integer, nullable=True,
                        doc="Referencia a la tasa de impuesto aplicada (tax_rates.id)")
    tax_rate_name = Column(String(100), nullable=True,
                          doc="Nombre de la tasa de impuesto al momento de la venta")
    tax_rate_percentage = Column(Numeric(5, 2), nullable=True,
                                doc="Porcentaje de impuesto aplicado al momento de la venta")
    
    # Información adicional
    notes = Column(Text,
                   doc="Notas adicionales de la venta")
    
    # Campos de auditoría
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación de la venta")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    branch = relationship("Branch", back_populates="sales",
                         doc="Sucursal donde se realizó la venta")
    user = relationship("User", back_populates="sales",
                       doc="Usuario que procesó la venta")
    sale_items = relationship("SaleItem", back_populates="sale",
                             doc="Lista de productos vendidos en esta transacción")


class SaleItem(Base):
    """
    Modelo de Ítem de Venta del sistema POS Cesariel.
    
    Representa cada producto individual vendido dentro de una transacción.
    Permite manejar productos con talles específicos, precios unitarios
    y cantidades variables por cada línea de venta.
    
    Attributes:
        id (int): Identificador único del ítem de venta
        sale_id (int): ID de la venta padre (FK hacia sales.id)
        product_id (int): ID del producto vendido (FK hacia products.id)
        quantity (int): Cantidad vendida del producto
        unit_price (decimal): Precio unitario al momento de la venta
        total_price (decimal): Precio total de la línea (quantity * unit_price)
        size (str): Talle específico del producto (opcional, máx. 10 caracteres)
        
    Relationships:
        sale: Venta padre que contiene este ítem
        product: Producto vendido en esta línea
    """
    __tablename__ = "sale_items"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único del ítem de venta")
    sale_id = Column(Integer, ForeignKey("sales.id"),
                     doc="ID de la venta padre")
    product_id = Column(Integer, ForeignKey("products.id"),
                        doc="ID del producto vendido")
    
    # Cantidad y precios
    quantity = Column(Integer, nullable=False,
                      doc="Cantidad vendida del producto")
    unit_price = Column(Numeric(10, 2), nullable=False,
                        doc="Precio unitario al momento de la venta")
    total_price = Column(Numeric(10, 2), nullable=False,
                         doc="Precio total de la línea (quantity * unit_price)")
    
    # Información de variante
    size = Column(String(10),
                  doc="Talle específico del producto (para productos con talles)")
    
    # Relaciones con otras entidades
    sale = relationship("Sale", back_populates="sale_items",
                       doc="Venta padre que contiene este ítem")
    product = relationship("Product", back_populates="sale_items",
                          doc="Producto vendido en esta línea")
