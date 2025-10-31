"""
Modelos de notificaciones del sistema POS Cesariel.

Este módulo define los modelos para el sistema de notificaciones:
- Notification: Notificaciones generadas por el sistema
- NotificationSetting: Configuración de notificaciones por usuario/sucursal
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class NotificationType(str, enum.Enum):
    """Tipos de notificaciones del sistema"""
    LOW_STOCK = "low_stock"  # Alerta de stock bajo
    DAILY_SALES_REPORT = "daily_sales_report"  # Reporte diario de ventas
    BACKUP_REMINDER = "backup_reminder"  # Recordatorio de respaldo
    SYSTEM_ALERT = "system_alert"  # Alerta del sistema
    CUSTOM = "custom"  # Notificación personalizada


class NotificationPriority(str, enum.Enum):
    """Prioridad de las notificaciones"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Notification(Base):
    """
    Modelo para notificaciones del sistema.

    Representa notificaciones generadas automáticamente o manualmente
    que se muestran a los usuarios según su configuración.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # Tipo y prioridad
    type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    priority = Column(SQLEnum(NotificationPriority), default=NotificationPriority.MEDIUM)

    # Contenido
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)

    # Datos adicionales (JSON para flexibilidad)
    # Ejemplo: {"product_id": 123, "current_stock": 5, "min_stock": 10}
    data = Column(JSON, nullable=True)

    # Estado
    is_read = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True, index=True)

    # Destinatario (puede ser para un usuario específico o una sucursal)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    read_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # Fecha de expiración opcional

    # Relaciones
    user = relationship("User", back_populates="notifications")
    branch = relationship("Branch", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.id}: {self.type} - {self.title}>"

    def mark_as_read(self):
        """Marcar notificación como leída"""
        self.is_read = True
        self.read_at = datetime.utcnow()

    def is_expired(self):
        """Verificar si la notificación ha expirado"""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False


class NotificationSetting(Base):
    """
    Modelo para configuración de notificaciones por usuario.

    Permite a cada usuario personalizar qué notificaciones desea recibir
    y con qué frecuencia.
    """
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)

    # Usuario al que pertenece la configuración
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # Configuración de alertas de stock bajo
    low_stock_enabled = Column(Boolean, default=True)
    low_stock_threshold = Column(Integer, default=10)  # Stock mínimo para alertar

    # Configuración de reporte diario de ventas
    daily_sales_enabled = Column(Boolean, default=True)
    daily_sales_time = Column(String(5), default="18:00")  # Hora del día (HH:MM)

    # Configuración de recordatorio de respaldo
    backup_reminder_enabled = Column(Boolean, default=True)
    backup_reminder_frequency = Column(String(20), default="weekly")  # daily, weekly, monthly
    backup_reminder_day = Column(Integer, default=1)  # Día del mes o día de la semana

    # Configuración general
    enabled = Column(Boolean, default=True)  # Activar/desactivar todas las notificaciones
    email_notifications = Column(Boolean, default=False)  # Enviar por email (futuro)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relación
    user = relationship("User", back_populates="notification_settings")

    def __repr__(self):
        return f"<NotificationSetting user_id={self.user_id}>"
