"""
Modelos de métodos de pago básicos para POS Cesariel.

Define los métodos de pago simples disponibles en el sistema (Efectivo, Débito, Crédito, Transferencia).
Diferente de PaymentConfig que maneja configuración de cuotas y recargos.

Modelos:
    - PaymentMethod: Métodos de pago básicos habilitables/deshabilitables
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


class PaymentMethod(Base):
    """
    Métodos de pago básicos del sistema.
    
    Almacena los métodos de pago fundamentales que se pueden activar/desactivar.
    Ejemplos: Efectivo, Tarjeta de Débito, Tarjeta de Crédito, Transferencia.
    
    Diferencia con PaymentConfig:
        - PaymentMethod: Lista simple de métodos habilitables (este modelo)
        - PaymentConfig: Configuración compleja con cuotas y recargos
    
    Attributes:
        id: ID único
        name: Nombre mostrado en UI (ej: "Efectivo", "Tarjeta de Débito")
        code: Código único (ej: "CASH", "DEBIT_CARD", "CREDIT_CARD")
        icon: Emoji o ícono para UI (ej: "💵", "💳")
        is_active: Flag de habilitación del método
        requires_change: Si requiere dar vuelto (True para efectivo)
        description: Texto descriptivo opcional
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Ejemplo:
        PaymentMethod(
            name="Efectivo",
            code="CASH",
            icon="💵",
            is_active=True,
            requires_change=True
        )
    """
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identificación
    name = Column(String(100), nullable=False,
                 doc="Nombre para UI (ej: 'Efectivo', 'Tarjeta de Débito')")
    code = Column(String(50), unique=True, nullable=False, index=True,
                 doc="Código único (ej: 'CASH', 'DEBIT_CARD', 'TRANSFER')")
    icon = Column(String(10),
                 doc="Emoji o ícono para UI (ej: '💵', '💳', '🏦')")
    
    # Configuración
    is_active = Column(Boolean, default=True, nullable=False, index=True,
                      doc="Habilitación del método de pago")
    requires_change = Column(Boolean, default=False, nullable=False,
                            doc="Si requiere dar vuelto (True para efectivo)")
    description = Column(String(255),
                        doc="Descripción opcional del método")
    
    # Auditoría
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<PaymentMethod(code={self.code}, name={self.name}, active={self.is_active})>"
