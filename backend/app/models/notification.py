"""
Modelos de notificaciones para POS Cesariel.

Sistema de notificaciones internas del sistema para alertas, reportes y eventos.
Incluye configuración personalizable por usuario para tipos y frecuencia de notificaciones.

Modelos:
    - NotificationType: Enum de tipos de notificación
    - NotificationPriority: Enum de niveles de prioridad
    - Notification: Notificaciones generadas por el sistema
    - NotificationSetting: Configuración de notificaciones por usuario
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class NotificationType(str, enum.Enum):
    """Tipos de notificaciones del sistema."""
    LOW_STOCK = "low_stock"                   # Alerta de stock bajo
    DAILY_SALES_REPORT = "daily_sales_report" # Reporte diario de ventas
    BACKUP_REMINDER = "backup_reminder"       # Recordatorio de respaldo
    SYSTEM_ALERT = "system_alert"             # Alerta del sistema
    CUSTOM = "custom"                         # Notificación personalizada


class NotificationPriority(str, enum.Enum):
    """Niveles de prioridad de notificaciones."""
    LOW = "low"       # Informativa
    MEDIUM = "medium" # Normal
    HIGH = "high"     # Importante
    URGENT = "urgent" # Urgente (requiere acción inmediata)


class Notification(Base):
    """
    Notificaciones del sistema.
    
    Notificaciones generadas automáticamente o manualmente que se muestran
    a usuarios según configuración. Soporta notificaciones por usuario o por sucursal.
    
    Attributes:
        id: ID único
        type: Tipo de notificación (NotificationType enum)
        priority: Nivel de prioridad (NotificationPriority enum)
        title: Título de la notificación (máx 200 chars)
        message: Mensaje completo de la notificación
        data: Datos adicionales en JSON (ej: {"product_id": 123, "stock": 5})
        is_read: Flag de lectura
        is_active: Flag de activación (permite ocultar sin eliminar)
        user_id: Destinatario específico (NULL = todos los usuarios)
        branch_id: Sucursal específica (NULL = todas las sucursales)
        created_at: Timestamp de creación
        read_at: Timestamp de lectura (NULL si no leída)
        expires_at: Fecha de expiración (NULL = no expira)
    
    Ejemplo:
        # Alerta de stock bajo para un usuario
        Notification(
            type=NotificationType.LOW_STOCK,
            priority=NotificationPriority.HIGH,
            title="Stock bajo: Remera Nike",
            message="El producto tiene solo 3 unidades",
            data={"product_id": 123, "current_stock": 3},
            user_id=5
        )
    """
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Tipo y prioridad
    type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    priority = Column(SQLEnum(NotificationPriority), default=NotificationPriority.MEDIUM)
    
    # Contenido
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, nullable=True,
                 doc="Datos adicionales en formato JSON flexible")
    
    # Estado
    is_read = Column(Boolean, default=False, index=True)
    is_active = Column(Boolean, default=True, index=True)
    
    # Destinatario (NULL = broadcast)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    read_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    # Relaciones
    user = relationship("User", back_populates="notifications")
    branch = relationship("Branch", back_populates="notifications")
    
    def mark_as_read(self):
        """Marca la notificación como leída con timestamp actual."""
        self.is_read = True
        self.read_at = datetime.utcnow()
    
    def is_expired(self) -> bool:
        """Verifica si la notificación expiró."""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False
    
    def __repr__(self):
        return f"<Notification {self.id}: {self.type.value} - {self.title}>"


class NotificationSetting(Base):
    """
    Configuración de notificaciones por usuario.
    
    Permite personalizar qué notificaciones recibir, con qué frecuencia
    y por qué canales (in-app, email futuro).
    
    Attributes:
        id: ID único
        user_id: Usuario dueño de esta configuración (único)
        
        # Alertas de stock bajo
        low_stock_enabled: Habilitar alertas de stock
        low_stock_threshold: Umbral mínimo de stock para alertar
        
        # Reporte diario de ventas
        daily_sales_enabled: Habilitar reporte diario
        daily_sales_time: Hora de envío del reporte (HH:MM)
        
        # Recordatorio de respaldo
        backup_reminder_enabled: Habilitar recordatorio
        backup_reminder_frequency: Frecuencia (daily, weekly, monthly)
        backup_reminder_day: Día del mes o semana (1-31 o 1-7)
        
        # General
        enabled: Flag maestro de notificaciones (deshabilita todas)
        email_notifications: Enviar por email (futuro)
        
        created_at: Timestamp de creación
        updated_at: Timestamp de última modificación
    
    Ejemplo:
        NotificationSetting(
            user_id=5,
            low_stock_enabled=True,
            low_stock_threshold=10,
            daily_sales_enabled=True,
            daily_sales_time="18:00"
        )
    """
    __tablename__ = "notification_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Alertas de stock bajo
    low_stock_enabled = Column(Boolean, default=True)
    low_stock_threshold = Column(Integer, default=10)
    
    # Reporte diario de ventas
    daily_sales_enabled = Column(Boolean, default=True)
    daily_sales_time = Column(String(5), default="18:00")  # HH:MM
    
    # Recordatorio de respaldo
    backup_reminder_enabled = Column(Boolean, default=True)
    backup_reminder_frequency = Column(String(20), default="weekly")  # daily, weekly, monthly
    backup_reminder_day = Column(Integer, default=1)  # 1-31 o 1-7 según frequency
    
    # General
    enabled = Column(Boolean, default=True)           # Maestro on/off
    email_notifications = Column(Boolean, default=False)  # Futuro
    
    # Auditoría
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relación
    user = relationship("User", back_populates="notification_settings")
    
    def __repr__(self):
        return f"<NotificationSetting user_id={self.user_id}>"
