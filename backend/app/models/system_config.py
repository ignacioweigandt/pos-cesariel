"""
System Configuration Models

Models for storing system-wide configuration including currency settings.
"""

from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from database import Base
import enum


class CurrencyCode(str, enum.Enum):
    """Allowed currency codes - RESTRICTED to ARS and USD only"""
    ARS = "ARS"  # Peso Argentino
    USD = "USD"  # US Dollar


class CurrencyPosition(str, enum.Enum):
    """Position of currency symbol"""
    BEFORE = "before"  # $1234.56
    AFTER = "after"    # 1234.56$


class SystemConfig(Base):
    """
    System Configuration Model

    Stores system-wide settings including currency configuration.
    Only one record should exist in this table.
    """
    __tablename__ = "system_config"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Currency Settings
    default_currency = Column(
        SQLEnum(CurrencyCode),
        nullable=False,
        default=CurrencyCode.ARS,
        comment="Default currency for the system (ARS or USD only)"
    )
    currency_symbol = Column(
        String(10),
        nullable=False,
        default="$",
        comment="Symbol to display for currency"
    )
    currency_position = Column(
        SQLEnum(CurrencyPosition),
        nullable=False,
        default=CurrencyPosition.BEFORE,
        comment="Position of currency symbol (before or after amount)"
    )
    decimal_places = Column(
        Integer,
        nullable=False,
        default=2,
        comment="Number of decimal places for prices (0-2)"
    )

    # Other System Settings
    default_tax_rate = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Default tax rate percentage"
    )
    session_timeout = Column(
        Integer,
        nullable=False,
        default=30,
        comment="Session timeout in minutes"
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
        return f"<SystemConfig(currency={self.default_currency}, symbol={self.currency_symbol})>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "default_currency": self.default_currency.value if isinstance(self.default_currency, CurrencyCode) else self.default_currency,
            "currency_symbol": self.currency_symbol,
            "currency_position": self.currency_position.value if isinstance(self.currency_position, CurrencyPosition) else self.currency_position,
            "decimal_places": self.decimal_places,
            "default_tax_rate": self.default_tax_rate,
            "session_timeout": self.session_timeout,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
