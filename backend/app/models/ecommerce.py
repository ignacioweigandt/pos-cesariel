"""
E-commerce models for the POS Cesariel system.

This module contains e-commerce-related models including EcommerceConfig,
StoreBanner, and ProductImage for online store management.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class EcommerceConfig(Base):
    """
    Modelo de Configuración de E-commerce del sistema POS Cesariel.
    
    Almacena toda la configuración general de la tienda online,
    incluyendo información de contacto, branding, impuestos y moneda.
    Esta configuración es utilizada por el frontend de e-commerce.
    
    Attributes:
        id (int): Identificador único de la configuración
        store_name (str): Nombre de la tienda online (máx. 100 caracteres)
        store_description (str): Descripción de la tienda para SEO y presentación
        store_logo (str): URL del logo de la tienda (máx. 255 caracteres)
        contact_email (str): Email de contacto de la tienda
        contact_phone (str): Teléfono de contacto de la tienda
        address (str): Dirección física de la tienda (máx. 200 caracteres)
        is_active (bool): Estado activo/inactivo del e-commerce
        tax_percentage (decimal): Porcentaje de impuesto por defecto (5 dígitos, 2 decimales)
        currency (str): Moneda utilizada en la tienda (ISO 4217, máx. 10 caracteres)
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    __tablename__ = "ecommerce_config"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración de e-commerce")
    store_name = Column(String(100), nullable=False,
                        doc="Nombre de la tienda online")
    store_description = Column(Text,
                              doc="Descripción de la tienda para SEO y presentación")
    store_logo = Column(String(255),
                        doc="URL del logo de la tienda (Cloudinary u otro CDN)")
    
    # Información de contacto
    contact_email = Column(String(100),
                          doc="Email de contacto de la tienda")
    contact_phone = Column(String(20),
                          doc="Teléfono de contacto de la tienda")
    address = Column(String(200),
                     doc="Dirección física de la tienda")
    
    # Configuración financiera
    tax_percentage = Column(Numeric(5, 2), default=0,
                            doc="Porcentaje de impuesto por defecto")
    currency = Column(String(10), default="USD",
                      doc="Moneda utilizada en la tienda (ISO 4217)")
    
    # Estado y auditoría
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo del e-commerce")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")


class StoreBanner(Base):
    __tablename__ = "store_banners"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300))
    image_url = Column(String(500), nullable=False)
    link_url = Column(String(500))
    button_text = Column(String(100))
    banner_order = Column(Integer, default=1)  # 1, 2, 3 for ordering
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )


class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    image_order = Column(Integer, default=1)  # 1, 2, 3 for ordering
    alt_text = Column(String(255))
    is_main = Column(Boolean, default=False)  # Primary product image
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="product_images")
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )
