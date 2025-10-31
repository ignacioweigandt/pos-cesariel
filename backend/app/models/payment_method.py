"""
Payment Method Models

Models for storing available payment methods (Cash, Debit, Credit, Transfer).
This is different from PaymentConfig which stores installment configurations.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


class PaymentMethod(Base):
    """
    Payment Method Model

    Stores basic payment methods that can be enabled/disabled.
    Examples: Cash, Debit Card, Credit Card, Transfer.
    """
    __tablename__ = "payment_methods"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Payment Method Details
    name = Column(
        String(100),
        nullable=False,
        comment="Display name (e.g., 'Efectivo', 'Tarjeta de Débito')"
    )
    code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique code (e.g., 'CASH', 'CARD', 'TRANSFER')"
    )
    icon = Column(
        String(10),
        nullable=True,
        comment="Emoji or icon for UI display"
    )
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this payment method is currently enabled"
    )
    requires_change = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether this method requires giving change (e.g., cash)"
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
        return f"<PaymentMethod(code={self.code}, name={self.name}, active={self.is_active})>"
