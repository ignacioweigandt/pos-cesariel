"""
Modelos base y mixins para el sistema POS Cesariel.

Este módulo proporciona clases base y mixins reutilizables
para todos los modelos de la aplicación.
"""

from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func


class TimestampMixin:
    """
    Mixin que agrega campos de auditoría de timestamps.

    Proporciona created_at y updated_at automáticos para
    rastrear la creación y modificación de registros.

    Attributes:
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    created_at = Column(DateTime, default=func.now(), nullable=False,
                       doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False,
                       doc="Timestamp de última actualización")
