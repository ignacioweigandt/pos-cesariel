"""
Brand model for the POS Cesariel system.

This module contains the Brand entity which manages product brands
for both POS and e-commerce operations.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Brand(Base):
    """
    Modelo de Marca del sistema POS Cesariel.

    Gestiona las marcas de productos disponibles en el sistema,
    permitiendo categorización y organización consistente de productos
    tanto en POS como en e-commerce.

    Attributes:
        id (int): Identificador único de la marca
        name (str): Nombre de la marca (máx. 100 caracteres, único)
        description (str): Descripción opcional de la marca
        logo_url (str): URL del logo de la marca (opcional)
        is_active (bool): Estado activo/inactivo de la marca
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación

    Relationships:
        products: Lista de productos que pertenecen a esta marca
    """
    __tablename__ = "brands"

    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental de la marca")
    name = Column(String(100), nullable=False, unique=True, index=True,
                  doc="Nombre de la marca (único)")
    description = Column(Text,
                        doc="Descripción opcional de la marca")
    logo_url = Column(String(255),
                     doc="URL del logo de la marca (Cloudinary u otro CDN)")

    # Campos de control
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la marca")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")

    # Relaciones con otras entidades
    products = relationship("Product", back_populates="brand_rel",
                           doc="Productos que pertenecen a esta marca")

    def __repr__(self):
        return f"<Brand(id={self.id}, name='{self.name}')>"
