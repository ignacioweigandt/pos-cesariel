"""
Repository para gestión de notificaciones en POS Cesariel.

Este módulo implementa el patrón Repository para acceso a datos
de notificaciones y configuración de notificaciones.
"""

from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_, func
from datetime import datetime, timedelta
from app.models.notification import (
    Notification,
    NotificationSetting,
    NotificationType,
    NotificationPriority
)
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """
    Repository para operaciones CRUD de notificaciones.
    """

    def __init__(self, db: Session):
        super().__init__(Notification, db)

    def get_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        is_read: Optional[bool] = None,
        is_active: bool = True
    ) -> List[Notification]:
        """Obtener notificaciones de un usuario específico"""
        query = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_active == is_active
        )

        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)

        return query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

    def get_by_branch(
        self,
        branch_id: int,
        skip: int = 0,
        limit: int = 50,
        is_active: bool = True
    ) -> List[Notification]:
        """Obtener notificaciones de una sucursal específica"""
        return self.db.query(Notification).filter(
            Notification.branch_id == branch_id,
            Notification.is_active == is_active
        ).order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

    def get_by_type(
        self,
        notification_type: NotificationType,
        user_id: Optional[int] = None,
        branch_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Notification]:
        """Obtener notificaciones por tipo"""
        query = self.db.query(Notification).filter(
            Notification.type == notification_type,
            Notification.is_active == True
        )

        if user_id:
            query = query.filter(Notification.user_id == user_id)
        if branch_id:
            query = query.filter(Notification.branch_id == branch_id)

        return query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

    def get_unread_count(self, user_id: int) -> int:
        """Contar notificaciones no leídas de un usuario"""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False,
            Notification.is_active == True
        ).count()

    def mark_as_read(self, notification_id: int) -> Optional[Notification]:
        """Marcar una notificación como leída"""
        notification = self.get(notification_id)
        if notification:
            notification.mark_as_read()
            self.db.commit()
            self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: int) -> int:
        """Marcar todas las notificaciones de un usuario como leídas"""
        updated = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            "is_read": True,
            "read_at": datetime.utcnow()
        })
        self.db.commit()
        return updated

    def mark_multiple_as_read(self, notification_ids: List[int], user_id: int) -> int:
        """Marcar múltiples notificaciones como leídas"""
        updated = self.db.query(Notification).filter(
            Notification.id.in_(notification_ids),
            Notification.user_id == user_id
        ).update({
            "is_read": True,
            "read_at": datetime.utcnow()
        }, synchronize_session=False)
        self.db.commit()
        return updated

    def delete_old_notifications(self, days: int = 30) -> int:
        """Eliminar notificaciones antiguas (soft delete)"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        deleted = self.db.query(Notification).filter(
            Notification.created_at < cutoff_date,
            Notification.is_read == True
        ).update({"is_active": False})
        self.db.commit()
        return deleted

    def get_expired_notifications(self) -> List[Notification]:
        """Obtener notificaciones expiradas"""
        now = datetime.utcnow()
        return self.db.query(Notification).filter(
            Notification.expires_at < now,
            Notification.is_active == True
        ).all()

    def deactivate_expired(self) -> int:
        """Desactivar notificaciones expiradas"""
        now = datetime.utcnow()
        updated = self.db.query(Notification).filter(
            Notification.expires_at < now,
            Notification.is_active == True
        ).update({"is_active": False})
        self.db.commit()
        return updated

    def get_stats(self, user_id: int) -> Dict:
        """Obtener estadísticas de notificaciones de un usuario"""
        total = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_active == True
        ).count()

        unread = self.get_unread_count(user_id)

        # Estadísticas por tipo
        by_type = self.db.query(
            Notification.type,
            func.count(Notification.id).label('count')
        ).filter(
            Notification.user_id == user_id,
            Notification.is_active == True
        ).group_by(Notification.type).all()

        # Estadísticas por prioridad
        by_priority = self.db.query(
            Notification.priority,
            func.count(Notification.id).label('count')
        ).filter(
            Notification.user_id == user_id,
            Notification.is_active == True
        ).group_by(Notification.priority).all()

        return {
            "total": total,
            "unread": unread,
            "by_type": {str(t): c for t, c in by_type},
            "by_priority": {str(p): c for p, c in by_priority}
        }

    def bulk_delete(self, notification_ids: List[int], user_id: int) -> int:
        """Eliminar múltiples notificaciones (soft delete)"""
        deleted = self.db.query(Notification).filter(
            Notification.id.in_(notification_ids),
            Notification.user_id == user_id
        ).update({"is_active": False}, synchronize_session=False)
        self.db.commit()
        return deleted


class NotificationSettingRepository(BaseRepository[NotificationSetting]):
    """
    Repository para configuración de notificaciones.
    """

    def __init__(self, db: Session):
        super().__init__(NotificationSetting, db)

    def get_by_user_id(self, user_id: int) -> Optional[NotificationSetting]:
        """Obtener configuración de notificaciones por user_id"""
        return self.db.query(NotificationSetting).filter(
            NotificationSetting.user_id == user_id
        ).first()

    def create_default_for_user(self, user_id: int) -> NotificationSetting:
        """Crear configuración por defecto para un usuario"""
        settings = NotificationSetting(
            user_id=user_id,
            low_stock_enabled=True,
            low_stock_threshold=10,
            daily_sales_enabled=True,
            daily_sales_time="18:00",
            backup_reminder_enabled=True,
            backup_reminder_frequency="weekly",
            backup_reminder_day=1,
            enabled=True,
            email_notifications=False
        )
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def get_or_create(self, user_id: int) -> NotificationSetting:
        """Obtener configuración o crearla si no existe"""
        settings = self.get_by_user_id(user_id)
        if not settings:
            settings = self.create_default_for_user(user_id)
        return settings

    def update_settings(
        self,
        user_id: int,
        update_data: dict
    ) -> Optional[NotificationSetting]:
        """Actualizar configuración de notificaciones"""
        settings = self.get_or_create(user_id)
        for key, value in update_data.items():
            if hasattr(settings, key) and value is not None:
                setattr(settings, key, value)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def get_users_with_low_stock_enabled(self) -> List[NotificationSetting]:
        """Obtener usuarios con alertas de stock bajo habilitadas"""
        return self.db.query(NotificationSetting).filter(
            NotificationSetting.enabled == True,
            NotificationSetting.low_stock_enabled == True
        ).all()

    def get_users_with_daily_sales_enabled(self) -> List[NotificationSetting]:
        """Obtener usuarios con reporte diario habilitado"""
        return self.db.query(NotificationSetting).filter(
            NotificationSetting.enabled == True,
            NotificationSetting.daily_sales_enabled == True
        ).all()

    def get_users_with_backup_reminder_enabled(self, frequency: str) -> List[NotificationSetting]:
        """Obtener usuarios con recordatorio de respaldo habilitado por frecuencia"""
        return self.db.query(NotificationSetting).filter(
            NotificationSetting.enabled == True,
            NotificationSetting.backup_reminder_enabled == True,
            NotificationSetting.backup_reminder_frequency == frequency
        ).all()
