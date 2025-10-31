"""
Payment configuration models for the POS Cesariel system.

This module contains payment-related models for managing payment methods,
surcharges, and installment configurations.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class PaymentConfig(Base):
    """
    Modelo de Configuración de Métodos de Pago del sistema POS Cesariel.
    
    Define los diferentes métodos de pago disponibles en el sistema,
    incluyendo recargos por tipo de tarjeta, cuotas disponibles y
    configuraciones específicas para cada método.
    
    Attributes:
        id (int): Identificador único de la configuración de pago
        payment_type (str): Tipo de pago (efectivo, tarjeta, transferencia, etc.)
        card_type (str): Subtipo de tarjeta (bancarizadas, no_bancarizadas, tarjeta_naranja)
        installments (int): Número de cuotas disponibles
        surcharge_percentage (decimal): Porcentaje de recargo aplicado
        is_active (bool): Estado activo/inactivo del método de pago
        description (str): Descripción del método de pago
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    __tablename__ = "payment_config"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración de pago")
    payment_type = Column(String(50), nullable=False,
                          doc="Tipo de pago (efectivo, tarjeta, transferencia, etc.)")
    card_type = Column(String(50),
                       doc="Subtipo de tarjeta (bancarizadas, no_bancarizadas, etc.)")
    
    # Configuración financiera
    installments = Column(Integer, default=1,
                          doc="Número de cuotas disponibles")
    surcharge_percentage = Column(Numeric(5, 2), default=0,
                                  doc="Porcentaje de recargo aplicado")
    
    # Información adicional
    description = Column(String(200),
                        doc="Descripción del método de pago")
    
    # Estado y auditoría
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo del método de pago")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")


class CustomInstallment(Base):
    """
    Custom Installment Plans for Credit Cards.

    Allows administrators to configure custom installment plans
    (e.g., 15, 18, 24 installments) with personalized surcharges
    for bancarizadas and no_bancarizadas cards.

    This provides flexibility beyond the standard installment configurations,
    enabling the creation of promotional or special payment plans.

    Attributes:
        id (int): Unique identifier for the custom installment plan
        card_type (str): Card type - 'bancarizadas' or 'no_bancarizadas'
        installments (int): Number of installments (1-60)
        surcharge_percentage (decimal): Surcharge percentage (0.00-100.00)
        is_active (bool): Whether this plan is currently active
        description (str): Description of the installment plan
        created_at (datetime): Timestamp of creation
        updated_at (datetime): Timestamp of last update

    Example:
        Custom plan for 18 installments with 35% surcharge:
        - card_type: 'bancarizadas'
        - installments: 18
        - surcharge_percentage: 35.00
        - description: 'Plan especial 18 cuotas'
    """
    __tablename__ = "custom_installments"

    # Primary key
    id = Column(Integer, primary_key=True, index=True,
                doc="Unique identifier for the custom installment plan")

    # Core configuration
    card_type = Column(String(50), nullable=False, index=True,
                       doc="Card type: 'bancarizadas' or 'no_bancarizadas'")
    installments = Column(Integer, nullable=False,
                          doc="Number of installments (1-60, validated at app level)")
    surcharge_percentage = Column(Numeric(5, 2), nullable=False,
                                  doc="Surcharge percentage (0.00-100.00)")

    # Status and metadata
    is_active = Column(Boolean, default=True, nullable=False, index=True,
                       doc="Whether this installment plan is active")
    description = Column(String(255), nullable=False,
                        doc="Description of the installment plan")

    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(),
                        doc="Timestamp when the record was created")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(),
                        doc="Timestamp when the record was last updated")

    def __repr__(self):
        """String representation of the custom installment plan."""
        return f"<CustomInstallment {self.card_type} - {self.installments} cuotas @ {self.surcharge_percentage}%>"

    def __str__(self):
        """Human-readable string representation."""
        status = "Activo" if self.is_active else "Inactivo"
        return f"{self.installments} cuotas - {self.card_type} (+{self.surcharge_percentage}%) - {status}"
