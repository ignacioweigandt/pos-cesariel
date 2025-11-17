"""
Branch-specific configuration models for POS Cesariel.

This module contains models for branch-level configuration overrides,
allowing each branch to have customized settings for tax rates and
payment methods while maintaining a system-wide default configuration.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class BranchTaxRate(Base):
    """
    Branch-specific tax rate configuration.

    Allows branches to have different tax rates based on their jurisdiction.
    For example, different provinces or states may have different tax rates.

    Attributes:
        id (int): Identificador único
        branch_id (int): ID de la sucursal
        tax_rate_id (int): ID de la tasa de impuesto aplicable
        is_default (bool): Si esta es la tasa por defecto para la sucursal
        effective_from (datetime): Fecha desde la cual aplica esta configuración
        notes (str): Notas sobre por qué se aplica esta tasa específica
        created_at (datetime): Fecha de creación del registro
        updated_at (datetime): Fecha de última actualización

    Relationships:
        branch: Sucursal a la que se aplica esta tasa
        tax_rate: Tasa de impuesto configurada

    Business Rules:
        - Una sucursal puede tener múltiples tax_rates históricas (effective_from)
        - Solo una puede ser is_default=True por sucursal
        - Si no hay configuración específica, se usa system_config.default_tax_rate
    """
    __tablename__ = "branch_tax_rates"

    # Primary key
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración")

    # Foreign keys
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"),
                      nullable=False, index=True,
                      doc="Sucursal a la que se aplica esta tasa")
    tax_rate_id = Column(Integer, ForeignKey("tax_rates.id", ondelete="RESTRICT"),
                        nullable=False, index=True,
                        doc="Tasa de impuesto aplicable")

    # Configuration fields
    is_default = Column(Boolean, default=True,
                       doc="Si esta es la tasa por defecto para la sucursal")
    effective_from = Column(DateTime, default=func.now(),
                           doc="Fecha desde la cual aplica esta configuración")
    notes = Column(String(500), nullable=True,
                  doc="Notas sobre por qué se aplica esta tasa (jurisdicción, etc.)")

    # Audit fields
    created_at = Column(DateTime, default=func.now(),
                       doc="Timestamp de creación")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                       doc="Timestamp de última actualización")

    # Relationships
    branch = relationship("Branch", backref="branch_tax_rates",
                         doc="Sucursal a la que se aplica esta configuración")
    tax_rate = relationship("TaxRate", backref="branch_configurations",
                           doc="Tasa de impuesto configurada")

    def __repr__(self):
        return f"<BranchTaxRate(branch_id={self.branch_id}, tax_rate_id={self.tax_rate_id}, default={self.is_default})>"


class BranchPaymentMethod(Base):
    """
    Branch-specific payment method configuration.

    Allows branches to enable/disable specific payment methods and
    apply custom surcharges. For example, a branch in a tourist area
    might accept international credit cards with different fees.

    Attributes:
        id (int): Identificador único
        branch_id (int): ID de la sucursal
        payment_method_id (int): ID del método de pago
        is_active (bool): Si este método está activo para esta sucursal
        surcharge_override (decimal): Recargo personalizado para esta sucursal (%)
        installment_override (int): Cantidad de cuotas personalizadas
        notes (str): Notas sobre configuración específica
        created_at (datetime): Fecha de creación del registro
        updated_at (datetime): Fecha de última actualización

    Relationships:
        branch: Sucursal a la que se aplica esta configuración
        payment_method: Método de pago configurado

    Business Rules:
        - Si no hay configuración específica, se usa la global de payment_methods
        - surcharge_override anula el recargo global del payment_method
        - Si is_active=False, el método no está disponible en esa sucursal
    """
    __tablename__ = "branch_payment_methods"

    # Primary key
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración")

    # Foreign keys
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"),
                      nullable=False, index=True,
                      doc="Sucursal a la que se aplica esta configuración")
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id", ondelete="RESTRICT"),
                              nullable=False, index=True,
                              doc="Método de pago configurado")

    # Configuration fields
    is_active = Column(Boolean, default=True,
                      doc="Si este método está activo para esta sucursal")
    surcharge_override = Column(Numeric(5, 2), nullable=True,
                               doc="Recargo personalizado (%) que anula el global")
    installment_override = Column(Integer, nullable=True,
                                 doc="Cantidad de cuotas personalizadas para esta sucursal")
    notes = Column(String(500), nullable=True,
                  doc="Notas sobre configuración específica (ej: acuerdo con banco local)")

    # Audit fields
    created_at = Column(DateTime, default=func.now(),
                       doc="Timestamp de creación")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                       doc="Timestamp de última actualización")

    # Relationships
    branch = relationship("Branch", backref="branch_payment_methods",
                         doc="Sucursal a la que se aplica esta configuración")
    payment_method = relationship("PaymentMethod", backref="branch_configurations",
                                 doc="Método de pago configurado")

    def __repr__(self):
        return f"<BranchPaymentMethod(branch_id={self.branch_id}, payment_method_id={self.payment_method_id}, active={self.is_active})>"
