"""
Modelos de configuración por sucursal para POS Cesariel.

Permite configuraciones específicas por sucursal que sobrescriben la configuración
global del sistema. Útil para jurisdicciones con diferentes impuestos o acuerdos locales.

Modelos:
    - BranchTaxRate: Tasas impositivas específicas por sucursal
    - BranchPaymentMethod: Métodos de pago y recargos personalizados por sucursal
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class BranchTaxRate(Base):
    """
    Tasa impositiva específica por sucursal.
    
    Permite a cada sucursal tener tasas impositivas diferentes según jurisdicción
    (ej: provincias con IVA diferencial). Si no hay configuración específica,
    usa system_config.default_tax_rate.
    
    Attributes:
        id: ID único
        branch_id: Sucursal afectada (FK → branches.id)
        tax_rate_id: Tasa de impuesto aplicable (FK → tax_rates.id)
        is_default: Si es la tasa por defecto para esa sucursal
        effective_from: Fecha desde la cual aplica
        notes: Justificación de configuración específica
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Business Rules:
        - Una sucursal puede tener múltiples tasas históricas (effective_from)
        - Solo una puede tener is_default=True por sucursal
        - Si no hay config específica, usar global
    
    Ejemplo:
        # Sucursal en provincia con IVA reducido
        BranchTaxRate(
            branch_id=2,
            tax_rate_id=3,  # IVA 10.5%
            is_default=True,
            effective_from=datetime.now(),
            notes="Provincia con IVA diferencial"
        )
    """
    __tablename__ = "branch_tax_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relaciones
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"),
                      nullable=False, index=True,
                      doc="Sucursal afectada")
    tax_rate_id = Column(Integer, ForeignKey("tax_rates.id", ondelete="RESTRICT"),
                        nullable=False, index=True,
                        doc="Tasa de impuesto aplicable")
    
    # Configuración
    is_default = Column(Boolean, default=True,
                       doc="Tasa por defecto para esta sucursal")
    effective_from = Column(DateTime, default=func.now(),
                           doc="Fecha de inicio de vigencia")
    notes = Column(String(500),
                  doc="Justificación (jurisdicción, acuerdo especial, etc.)")
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    branch = relationship("Branch", backref="branch_tax_rates")
    tax_rate = relationship("TaxRate", backref="branch_configurations")
    
    def __repr__(self):
        return f"<BranchTaxRate(branch_id={self.branch_id}, tax_rate_id={self.tax_rate_id}, default={self.is_default})>"


class BranchPaymentMethod(Base):
    """
    Método de pago personalizado por sucursal.
    
    Permite a cada sucursal activar/desactivar métodos de pago específicos
    y aplicar recargos diferentes (ej: sucursal turística con fees especiales).
    
    Attributes:
        id: ID único
        branch_id: Sucursal afectada (FK → branches.id)
        payment_method_id: Método de pago (FK → payment_methods.id)
        is_active: Si está activo para esta sucursal
        surcharge_override: Recargo personalizado (anula el global)
        installment_override: Cuotas personalizadas (anula el global)
        notes: Justificación de configuración específica
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Business Rules:
        - Si no hay config específica, usar payment_methods global
        - surcharge_override anula el recargo global del método
        - Si is_active=False, método no disponible en esa sucursal
    
    Ejemplo:
        # Sucursal con acuerdo local (menor recargo en tarjetas)
        BranchPaymentMethod(
            branch_id=3,
            payment_method_id=2,  # Tarjeta de crédito
            is_active=True,
            surcharge_override=10.00,  # 10% en lugar del 15% global
            installment_override=12,
            notes="Acuerdo con banco local"
        )
    """
    __tablename__ = "branch_payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relaciones
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"),
                      nullable=False, index=True,
                      doc="Sucursal afectada")
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id", ondelete="RESTRICT"),
                              nullable=False, index=True,
                              doc="Método de pago configurado")
    
    # Configuración
    is_active = Column(Boolean, default=True,
                      doc="Habilitación para esta sucursal")
    surcharge_override = Column(Numeric(5, 2),
                               doc="Recargo personalizado (%) que anula el global")
    installment_override = Column(Integer,
                                 doc="Cuotas personalizadas (anula el global)")
    notes = Column(String(500),
                  doc="Justificación (acuerdo local, promoción, etc.)")
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    branch = relationship("Branch", backref="branch_payment_methods")
    payment_method = relationship("PaymentMethod", backref="branch_configurations")
    
    def __repr__(self):
        return f"<BranchPaymentMethod(branch_id={self.branch_id}, payment_method_id={self.payment_method_id}, active={self.is_active})>"
