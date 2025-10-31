"""
Schemas Pydantic para notificaciones del sistema POS Cesariel.

Este módulo define los esquemas de validación para las notificaciones
y configuración de notificaciones.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.notification import NotificationType, NotificationPriority


# ============================================================================
# Notification Schemas
# ============================================================================

class NotificationBase(BaseModel):
    """Schema base para notificaciones"""
    type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    title: str = Field(..., max_length=200)
    message: str
    data: Optional[Dict[str, Any]] = None
    user_id: Optional[int] = None
    branch_id: Optional[int] = None
    expires_at: Optional[datetime] = None


class NotificationCreate(NotificationBase):
    """Schema para crear una notificación"""
    pass


class NotificationUpdate(BaseModel):
    """Schema para actualizar una notificación"""
    is_read: Optional[bool] = None
    is_active: Optional[bool] = None


class NotificationResponse(NotificationBase):
    """Schema de respuesta para notificación"""
    id: int
    is_read: bool
    is_active: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationStats(BaseModel):
    """Estadísticas de notificaciones"""
    total: int
    unread: int
    by_type: Dict[str, int]
    by_priority: Dict[str, int]


# ============================================================================
# Notification Setting Schemas
# ============================================================================

class NotificationSettingBase(BaseModel):
    """Schema base para configuración de notificaciones"""
    # Alertas de stock bajo
    low_stock_enabled: bool = True
    low_stock_threshold: int = Field(default=10, ge=0, le=1000)

    # Reporte diario de ventas
    daily_sales_enabled: bool = True
    daily_sales_time: str = Field(default="18:00", pattern=r"^([0-1][0-9]|2[0-3]):[0-5][0-9]$")

    # Recordatorio de respaldo
    backup_reminder_enabled: bool = True
    backup_reminder_frequency: str = Field(default="weekly", pattern=r"^(daily|weekly|monthly)$")
    backup_reminder_day: int = Field(default=1, ge=1, le=31)

    # General
    enabled: bool = True
    email_notifications: bool = False

    @field_validator('daily_sales_time')
    @classmethod
    def validate_time_format(cls, v):
        """Validar formato de hora HH:MM"""
        try:
            hour, minute = map(int, v.split(':'))
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                raise ValueError('Invalid time range')
            return v
        except:
            raise ValueError('Time must be in HH:MM format')

    @field_validator('backup_reminder_frequency')
    @classmethod
    def validate_frequency(cls, v):
        """Validar frecuencia de respaldo"""
        if v not in ['daily', 'weekly', 'monthly']:
            raise ValueError('Frequency must be daily, weekly, or monthly')
        return v


class NotificationSettingCreate(NotificationSettingBase):
    """Schema para crear configuración de notificaciones"""
    user_id: int


class NotificationSettingUpdate(BaseModel):
    """Schema para actualizar configuración de notificaciones"""
    low_stock_enabled: Optional[bool] = None
    low_stock_threshold: Optional[int] = Field(None, ge=0, le=1000)
    daily_sales_enabled: Optional[bool] = None
    daily_sales_time: Optional[str] = None
    backup_reminder_enabled: Optional[bool] = None
    backup_reminder_frequency: Optional[str] = None
    backup_reminder_day: Optional[int] = Field(None, ge=1, le=31)
    enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None


class NotificationSettingResponse(NotificationSettingBase):
    """Schema de respuesta para configuración"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Bulk Operations
# ============================================================================

class NotificationBulkMarkRead(BaseModel):
    """Schema para marcar múltiples notificaciones como leídas"""
    notification_ids: List[int]


class NotificationBulkDelete(BaseModel):
    """Schema para eliminar múltiples notificaciones"""
    notification_ids: List[int]


# ============================================================================
# Filters and Queries
# ============================================================================

class NotificationFilter(BaseModel):
    """Filtros para consultar notificaciones"""
    type: Optional[NotificationType] = None
    priority: Optional[NotificationPriority] = None
    is_read: Optional[bool] = None
    is_active: Optional[bool] = None
    user_id: Optional[int] = None
    branch_id: Optional[int] = None
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=50, ge=1, le=100)
