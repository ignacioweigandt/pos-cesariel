"""
Modelos de configuración global del sistema para POS Cesariel.

Gestiona configuración a nivel de sistema incluyendo moneda, formateo de precios y sesiones.
Patrón singleton: solo debe existir un registro.

Modelos:
    - CurrencyCode: Enum de monedas permitidas (ARS, USD)
    - CurrencyPosition: Enum de posición del símbolo (antes/después)
    - SystemConfig: Configuración global del sistema
"""

from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from database import Base
import enum


class CurrencyCode(str, enum.Enum):
    """Códigos de moneda permitidos (restringido a ARS y USD)."""
    ARS = "ARS"  # Peso Argentino
    USD = "USD"  # Dólar Estadounidense


class CurrencyPosition(str, enum.Enum):
    """Posición del símbolo de moneda en el formateo."""
    BEFORE = "before"  # $1234.56
    AFTER = "after"    # 1234.56$


class SystemConfig(Base):
    """
    Configuración global del sistema (singleton).
    
    Almacena configuraciones aplicables a todo el sistema: moneda, formateo,
    timeouts de sesión. Solo debe existir un registro (id=1).
    
    Attributes:
        id: ID único (siempre 1)
        default_currency: Moneda del sistema (CurrencyCode: ARS o USD)
        currency_symbol: Símbolo para mostrar (ej: "$", "USD")
        currency_position: Posición del símbolo (before/after)
        decimal_places: Cantidad de decimales para precios (0-2)
        default_tax_rate: Tasa de impuesto por defecto (%)
        session_timeout: Timeout de sesión en minutos
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Business Rules:
        - Solo un registro debe existir (id=1)
        - decimal_places entre 0 y 2
        - session_timeout recomendado: 15-60 minutos
    
    Ejemplo:
        SystemConfig(
            id=1,
            default_currency=CurrencyCode.ARS,
            currency_symbol="$",
            currency_position=CurrencyPosition.BEFORE,
            decimal_places=2,
            default_tax_rate=21,
            session_timeout=30
        )
    """
    __tablename__ = "system_config"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Configuración de moneda
    default_currency = Column(SQLEnum(CurrencyCode), nullable=False, default=CurrencyCode.ARS,
                             doc="Moneda principal del sistema (ARS o USD)")
    currency_symbol = Column(String(10), nullable=False, default="$",
                            doc="Símbolo a mostrar para la moneda")
    currency_position = Column(SQLEnum(CurrencyPosition), nullable=False, default=CurrencyPosition.BEFORE,
                               doc="Posición del símbolo (before: $100, after: 100$)")
    decimal_places = Column(Integer, nullable=False, default=2,
                           doc="Decimales para precios (0-2)")
    
    # Otras configuraciones
    default_tax_rate = Column(Integer, nullable=False, default=0,
                             doc="Tasa de impuesto por defecto (%)")
    session_timeout = Column(Integer, nullable=False, default=30,
                            doc="Timeout de sesión en minutos")
    
    # Auditoría
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def to_dict(self):
        """Convierte a diccionario para respuestas de API."""
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
    
    def __repr__(self):
        return f"<SystemConfig(currency={self.default_currency}, symbol={self.currency_symbol})>"
