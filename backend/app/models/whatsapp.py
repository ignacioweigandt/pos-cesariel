"""
Modelos de integración WhatsApp y redes sociales para POS Cesariel.

Gestiona la configuración de WhatsApp Business para ventas directas
y los enlaces a redes sociales mostrados en el e-commerce.

Modelos:
    - WhatsAppConfig: Configuración de WhatsApp Business
    - WhatsAppSale: Ventas coordinadas por WhatsApp
    - SocialMediaConfig: Enlaces a redes sociales (Instagram, Facebook, etc.)
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class WhatsAppConfig(Base):
    """
    Configuración de WhatsApp Business.
    
    Gestiona la integración con WhatsApp Business para comunicación
    directa con clientes: pedidos, consultas y servicio al cliente.
    
    Attributes:
        id: ID único
        business_phone: Número de WhatsApp con código país (ej: +5491112345678)
        business_name: Nombre del negocio en WhatsApp
        welcome_message: Mensaje de bienvenida para nuevos contactos
        business_hours: Horarios de atención (ej: "Lun-Vie 9-18hs")
        auto_response_enabled: Habilitar respuesta automática
        is_active: Flag de habilitación de integración
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Ejemplo:
        WhatsAppConfig(
            business_phone="+5491112345678",
            business_name="POS Cesariel",
            welcome_message="Hola! Gracias por contactarnos",
            business_hours="Lun-Vie 9-18hs, Sáb 9-13hs",
            auto_response_enabled=True
        )
    """
    __tablename__ = "whatsapp_config"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Datos del negocio
    business_phone = Column(String(20), nullable=False,
                           doc="Número con código país: +5491112345678")
    business_name = Column(String(100), nullable=False,
                          doc="Nombre mostrado en WhatsApp")
    
    # Mensajería
    welcome_message = Column(Text,
                            doc="Mensaje de bienvenida automático")
    business_hours = Column(String(200),
                           doc="Horarios de atención (ej: 'Lun-Vie 9-18hs')")
    auto_response_enabled = Column(Boolean, default=False,
                                   doc="Habilitar respuesta automática")
    
    # Estado
    is_active = Column(Boolean, default=True)
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class WhatsAppSale(Base):
    """
    Ventas coordinadas por WhatsApp.
    
    Registra ventas iniciadas y coordinadas a través de WhatsApp,
    incluyendo información de envío y chat URL para seguimiento.
    
    Attributes:
        id: ID único
        sale_id: ID de la venta (FK → sales.id)
        customer_whatsapp: Número de WhatsApp del cliente
        customer_name: Nombre del cliente
        customer_address: Dirección de envío (si aplica)
        shipping_method: Método (pickup, delivery, shipping)
        shipping_cost: Costo de envío
        notes: Notas adicionales
        whatsapp_chat_url: URL del chat de WhatsApp generada
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Ejemplo:
        WhatsAppSale(
            sale_id=123,
            customer_whatsapp="+5491198765432",
            customer_name="Juan Pérez",
            customer_address="Av. Libertador 1234",
            shipping_method="delivery",
            shipping_cost=500.00
        )
    """
    __tablename__ = "whatsapp_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    
    # Información del cliente
    customer_whatsapp = Column(String(20), nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_address = Column(Text)
    
    # Envío
    shipping_method = Column(String(50))  # pickup, delivery, shipping
    shipping_cost = Column(Numeric(10, 2), default=0)
    
    # Detalles
    notes = Column(Text)
    whatsapp_chat_url = Column(String(500))  # URL del chat generada
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relación
    sale = relationship("Sale")
    
    __table_args__ = ({"extend_existing": True},)


class SocialMediaConfig(Base):
    """
    Configuración de redes sociales.
    
    Almacena enlaces a redes sociales mostrados en el footer del e-commerce
    para que clientes puedan seguir y contactar a la tienda.
    
    Attributes:
        id: ID único
        platform: Nombre de la red social (facebook, instagram, twitter, tiktok)
        username: Usuario en la plataforma (opcional)
        url: URL completa del perfil
        is_active: Flag de habilitación
        display_order: Orden de visualización (1, 2, 3, ...)
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Ejemplo:
        SocialMediaConfig(
            platform="instagram",
            username="@poscesariel",
            url="https://instagram.com/poscesariel",
            is_active=True,
            display_order=1
        )
    """
    __tablename__ = "social_media_config"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identificación
    platform = Column(String(50), nullable=False, index=True,
                     doc="Plataforma: facebook, instagram, twitter, tiktok, youtube")
    username = Column(String(100),
                     doc="Usuario en la plataforma (opcional)")
    url = Column(String(500),
                doc="URL completa del perfil")
    
    # Visualización
    is_active = Column(Boolean, default=True, index=True)
    display_order = Column(Integer, default=1,
                          doc="Orden de aparición (menor = primero)")
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    __table_args__ = ({"extend_existing": True},)
