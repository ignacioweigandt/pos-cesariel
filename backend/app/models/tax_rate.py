"""
Tax Rate Models

Models for storing tax rates configuration (IVA, etc.).
"""

from sqlalchemy import Column, Integer, String, Boolean, Numeric, DateTime
from sqlalchemy.sql import func
from database import Base


class TaxRate(Base):
    """
    Tax Rate Model

    Stores tax rates that can be applied to products and sales.
    Examples: IVA General (21%), IVA Reducido (10.5%), Exento (0%).
    """
    __tablename__ = "tax_rates"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Tax Rate Details
    name = Column(
        String(100),
        nullable=False,
        comment="Display name (e.g., 'IVA General', 'IVA Reducido')"
    )
    rate = Column(
        Numeric(5, 2),
        nullable=False,
        comment="Tax rate percentage (e.g., 21.0 for 21%)"
    )
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this tax rate is currently enabled"
    )
    is_default = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether this is the default tax rate for new products"
    )
    description = Column(
        String(255),
        nullable=True,
        comment="Optional description"
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=func.now(),
        nullable=False,
        comment="Timestamp de creación del registro"
    )
    updated_at = Column(
        DateTime,
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp de última actualización"
    )

    def __repr__(self):
        return f"<TaxRate(name={self.name}, rate={self.rate}%, default={self.is_default})>"
