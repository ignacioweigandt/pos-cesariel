"""
Modelos de tasas impositivas para POS Cesariel.

Gestiona configuración de impuestos aplicables a productos y ventas.
Ejemplos: IVA General (21%), IVA Reducido (10.5%), Exento (0%).

Modelos:
    - TaxRate: Tasas de impuesto configurables del sistema
"""

from sqlalchemy import Column, Integer, String, Boolean, Numeric, DateTime
from sqlalchemy.sql import func
from database import Base


class TaxRate(Base):
    """
    Tasas de impuesto aplicables a ventas.
    
    Define las tasas impositivas disponibles en el sistema (IVA, impuestos provinciales, etc.)
    con capacidad de activar/desactivar y marcar una como predeterminada.
    
    Attributes:
        id: ID único
        name: Nombre descriptivo (ej: "IVA General", "IVA Reducido")
        rate: Porcentaje de impuesto (ej: 21.0 para 21%)
        is_active: Flag de habilitación
        is_default: Si es la tasa por defecto para nuevos productos
        description: Texto descriptivo opcional
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Business Rules:
        - Solo una tasa puede tener is_default=True
        - Tasas inactivas no se muestran en selects pero mantienen histórico
        - Al aplicar en venta, se guarda snapshot (no reflejar cambios futuros)
    
    Ejemplo:
        TaxRate(
            name="IVA General",
            rate=21.00,
            is_active=True,
            is_default=True,
            description="Impuesto al Valor Agregado estándar"
        )
    """
    __tablename__ = "tax_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Configuración del impuesto
    name = Column(String(100), nullable=False,
                 doc="Nombre mostrado (ej: 'IVA General', 'IVA Reducido')")
    rate = Column(Numeric(5, 2), nullable=False,
                 doc="Porcentaje de impuesto (ej: 21.0 para 21%)")
    description = Column(String(255),
                        doc="Descripción opcional del impuesto")
    
    # Flags de configuración
    is_active = Column(Boolean, default=True, nullable=False, index=True,
                      doc="Habilitación de la tasa")
    is_default = Column(Boolean, default=False, nullable=False, index=True,
                       doc="Si es la tasa por defecto para nuevos productos")
    
    # Auditoría
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<TaxRate(name={self.name}, rate={self.rate}%, default={self.is_default})>"
