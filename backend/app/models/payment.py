"""
Modelos de configuración de pagos para POS Cesariel.

Gestiona métodos de pago, recargos por tarjeta y planes de cuotas personalizados.
Usado para calcular precios finales según método de pago seleccionado.

Modelos:
    - PaymentConfig: Configuración de métodos de pago con recargos y cuotas
    - CustomInstallment: Planes de cuotas personalizados para tarjetas
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class PaymentConfig(Base):
    """
    Configuración de métodos de pago con recargos y cuotas.
    
    Define los métodos de pago disponibles (efectivo, tarjeta, transferencia)
    con sus recargos específicos y cantidad de cuotas permitidas.
    
    Attributes:
        id: ID único
        payment_type: Tipo (efectivo, tarjeta, transferencia, mercadopago)
        card_type: Subtipo de tarjeta (bancarizadas, no_bancarizadas, naranja)
        installments: Número de cuotas disponibles (1-60)
        surcharge_percentage: Recargo aplicado (0-100%)
        is_active: Flag de habilitación
        description: Texto descriptivo para UI
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Ejemplo:
        # Efectivo sin recargo
        PaymentConfig(payment_type="efectivo", surcharge_percentage=0, installments=1)
        
        # Tarjeta bancarizada 12 cuotas con 25% recargo
        PaymentConfig(payment_type="tarjeta", card_type="bancarizadas", 
                     installments=12, surcharge_percentage=25.00)
    """
    __tablename__ = "payment_config"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Tipo de pago
    payment_type = Column(String(50), nullable=False, index=True,
                          doc="Tipo: efectivo, tarjeta, transferencia, mercadopago")
    card_type = Column(String(50), index=True,
                      doc="Subtipo tarjeta: bancarizadas, no_bancarizadas, naranja")
    
    # Configuración financiera
    installments = Column(Integer, default=1,
                         doc="Cuotas disponibles (1-60)")
    surcharge_percentage = Column(Numeric(5, 2), default=0,
                                 doc="Recargo aplicado (0-100%)")
    
    # Metadata
    description = Column(String(200),
                        doc="Descripción mostrada en UI")
    is_active = Column(Boolean, default=True, index=True,
                      doc="Habilitación del método")
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class CustomInstallment(Base):
    """
    Planes de cuotas personalizados para tarjetas.
    
    Permite crear planes especiales de cuotas (ej: 15, 18, 24 cuotas)
    con recargos personalizados para promociones o condiciones especiales.
    
    Attributes:
        id: ID único
        card_type: Tipo de tarjeta (bancarizadas, no_bancarizadas)
        installments: Cantidad de cuotas (1-60)
        surcharge_percentage: Recargo aplicado (0-100%)
        is_active: Flag de habilitación
        description: Texto descriptivo del plan
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Ejemplo:
        # Plan 18 cuotas con 35% recargo
        CustomInstallment(
            card_type="bancarizadas",
            installments=18,
            surcharge_percentage=35.00,
            description="Plan especial 18 cuotas"
        )
    """
    __tablename__ = "custom_installments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Configuración del plan
    card_type = Column(String(50), nullable=False, index=True,
                      doc="Tipo: bancarizadas o no_bancarizadas")
    installments = Column(Integer, nullable=False,
                         doc="Cantidad de cuotas (1-60)")
    surcharge_percentage = Column(Numeric(5, 2), nullable=False,
                                 doc="Recargo aplicado (0-100%)")
    
    # Metadata
    description = Column(String(255), nullable=False,
                        doc="Descripción del plan")
    is_active = Column(Boolean, default=True, nullable=False, index=True,
                      doc="Habilitación del plan")
    
    # Auditoría
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<CustomInstallment {self.card_type} - {self.installments} cuotas @ {self.surcharge_percentage}%>"
