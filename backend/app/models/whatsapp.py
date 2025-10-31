"""
WhatsApp and social media integration models for the POS Cesariel system.

This module contains models for WhatsApp Business integration, WhatsApp sales,
and social media configuration.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class WhatsAppConfig(Base):
    """
    Modelo de Configuración de WhatsApp del sistema POS Cesariel.
    
    Gestiona la configuración de WhatsApp Business para la integración
    con el e-commerce, permitiendo la comunicación directa con clientes
    para coordinar pedidos, consultas y servicio al cliente.
    
    Attributes:
        id (int): Identificador único de la configuración de WhatsApp
        business_phone (str): Número de WhatsApp empresarial (con código de país)
        business_name (str): Nombre del negocio mostrado en WhatsApp
        welcome_message (str): Mensaje de bienvenida personalizado
        business_hours (str): Horarios de atención del negocio
        auto_response_enabled (bool): Activación de respuesta automática
        is_active (bool): Estado activo/inactivo de la integración WhatsApp
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    __tablename__ = "whatsapp_config"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración de WhatsApp")
    business_phone = Column(String(20), nullable=False,
                            doc="Número de WhatsApp empresarial (con código de país)")
    business_name = Column(String(100), nullable=False,
                           doc="Nombre del negocio mostrado en WhatsApp")
    
    # Mensajería y comunicación
    welcome_message = Column(Text,
                            doc="Mensaje de bienvenida personalizado para nuevos contactos")
    business_hours = Column(String(200),
                           doc="Horarios de atención del negocio")
    auto_response_enabled = Column(Boolean, default=False,
                                   doc="Activación de respuesta automática")
    
    # Estado y auditoría
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la integración WhatsApp")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")


class WhatsAppSale(Base):
    __tablename__ = "whatsapp_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    customer_whatsapp = Column(String(20), nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_address = Column(Text)
    shipping_method = Column(String(50))  # pickup, delivery, shipping
    shipping_cost = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    whatsapp_chat_url = Column(String(500))  # Generated WhatsApp chat URL
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    sale = relationship("Sale")
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )


class SocialMediaConfig(Base):
    """
    Modelo de Configuración de Redes Sociales del sistema POS Cesariel.
    
    Almacena los enlaces y configuración de redes sociales de la tienda
    que se mostrarán en el e-commerce para conectar con los clientes
    a través de diferentes plataformas sociales.
    
    Attributes:
        id (int): Identificador único de la configuración de red social
        platform (str): Nombre de la plataforma (facebook, instagram, twitter, etc.)
        username (str): Nombre de usuario en la plataforma (opcional)
        url (str): URL completa del perfil de la red social
        is_active (bool): Estado activo/inactivo de la red social
        display_order (int): Orden de visualización en el frontend
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    __tablename__ = "social_media_config"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración de red social")
    platform = Column(String(50), nullable=False,
                      doc="Nombre de la plataforma (facebook, instagram, twitter, whatsapp, etc.)")
    username = Column(String(100),
                      doc="Nombre de usuario en la plataforma (opcional)")
    url = Column(String(500),
                 doc="URL completa del perfil de la red social")
    
    # Configuración de visualización
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la red social")
    display_order = Column(Integer, default=1,
                           doc="Orden de visualización en el frontend")
    
    # Campos de auditoría
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Restricciones de tabla
    __table_args__ = (
        {"extend_existing": True},
    )
