"""
Servicio de notificaciones para POS Cesariel.

Este módulo contiene la lógica de negocio para el sistema de notificaciones,
incluyendo creación, gestión y generación automática de notificaciones.
"""

from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.notification import (
    Notification,
    NotificationSetting,
    NotificationType,
    NotificationPriority
)
from app.models import Product, Sale, User, Branch
from app.repositories.notification import (
    NotificationRepository,
    NotificationSettingRepository
)
from app.repositories.product import ProductRepository
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationSettingUpdate
)
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Servicio para gestión de notificaciones del sistema.
    """

    def __init__(self, db: Session):
        self.db = db
        self.notification_repo = NotificationRepository(db)
        self.setting_repo = NotificationSettingRepository(db)
        # ProductRepository hereda de BaseRepository que requiere (model, db)
        from app.models import Product
        self.product_repo = ProductRepository(Product, db)

    # ========================================================================
    # Operaciones CRUD básicas
    # ========================================================================

    def create_notification(
        self,
        notification_data: NotificationCreate
    ) -> Notification:
        """Crear una nueva notificación"""
        notification_dict = notification_data.model_dump()
        return self.notification_repo.create(notification_dict)

    def get_notification(self, notification_id: int) -> Optional[Notification]:
        """Obtener una notificación por ID"""
        return self.notification_repo.get(notification_id)

    def get_user_notifications(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        is_read: Optional[bool] = None
    ) -> List[Notification]:
        """Obtener notificaciones de un usuario"""
        return self.notification_repo.get_by_user(user_id, skip, limit, is_read)

    def get_branch_notifications(
        self,
        branch_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[Notification]:
        """Obtener notificaciones de una sucursal"""
        return self.notification_repo.get_by_branch(branch_id, skip, limit)

    def get_unread_count(self, user_id: int) -> int:
        """Obtener cantidad de notificaciones no leídas"""
        return self.notification_repo.get_unread_count(user_id)

    def mark_as_read(self, notification_id: int) -> Optional[Notification]:
        """Marcar notificación como leída"""
        return self.notification_repo.mark_as_read(notification_id)

    def mark_all_as_read(self, user_id: int) -> int:
        """Marcar todas las notificaciones como leídas"""
        return self.notification_repo.mark_all_as_read(user_id)

    def mark_multiple_as_read(self, notification_ids: List[int], user_id: int) -> int:
        """Marcar múltiples notificaciones como leídas"""
        return self.notification_repo.mark_multiple_as_read(notification_ids, user_id)

    def delete_notification(self, notification_id: int) -> bool:
        """Eliminar notificación (soft delete)"""
        notification = self.notification_repo.get(notification_id)
        if notification:
            notification.is_active = False
            self.db.commit()
            return True
        return False

    def bulk_delete(self, notification_ids: List[int], user_id: int) -> int:
        """Eliminar múltiples notificaciones"""
        return self.notification_repo.bulk_delete(notification_ids, user_id)

    def get_notification_stats(self, user_id: int) -> Dict:
        """Obtener estadísticas de notificaciones"""
        return self.notification_repo.get_stats(user_id)

    # ========================================================================
    # Configuración de notificaciones
    # ========================================================================

    def get_user_settings(self, user_id: int) -> NotificationSetting:
        """Obtener configuración de notificaciones de un usuario"""
        return self.setting_repo.get_or_create(user_id)

    def update_user_settings(
        self,
        user_id: int,
        settings_data: NotificationSettingUpdate
    ) -> NotificationSetting:
        """Actualizar configuración de notificaciones"""
        update_dict = settings_data.model_dump(exclude_none=True)
        return self.setting_repo.update_settings(user_id, update_dict)

    def create_default_settings(self, user_id: int) -> NotificationSetting:
        """Crear configuración por defecto para un usuario nuevo"""
        return self.setting_repo.create_default_for_user(user_id)

    # ========================================================================
    # Generación automática de notificaciones
    # ========================================================================

    def check_and_create_low_stock_alerts(self) -> int:
        """
        Verificar productos con stock bajo y crear alertas.
        Retorna la cantidad de alertas creadas.
        """
        logger.info("Checking for low stock products...")
        alerts_created = 0

        # Obtener usuarios con alertas de stock bajo habilitadas
        enabled_settings = self.setting_repo.get_users_with_low_stock_enabled()

        for setting in enabled_settings:
            user = self.db.query(User).filter(User.id == setting.user_id).first()
            if not user or not user.is_active:
                continue

            # Obtener productos con stock bajo según el umbral del usuario
            low_stock_products = self.db.query(Product).filter(
                Product.is_active == True,
                Product.stock_quantity <= setting.low_stock_threshold,
                Product.stock_quantity > 0  # No incluir productos sin stock
            ).all()

            # Crear notificación para cada producto con stock bajo
            for product in low_stock_products:
                # Verificar si ya existe una alerta reciente para este producto
                recent_alert = self.db.query(Notification).filter(
                    Notification.user_id == user.id,
                    Notification.type == NotificationType.LOW_STOCK,
                    Notification.data['product_id'].astext == str(product.id),
                    Notification.created_at >= datetime.utcnow() - timedelta(hours=24)
                ).first()

                if not recent_alert:
                    # Crear nueva alerta
                    notification = NotificationCreate(
                        type=NotificationType.LOW_STOCK,
                        priority=NotificationPriority.HIGH if product.stock_quantity <= 5 else NotificationPriority.MEDIUM,
                        title=f"Stock Bajo: {product.name}",
                        message=f"El producto '{product.name}' tiene stock bajo ({product.stock_quantity} unidades). "
                                f"Se recomienda reabastecer pronto.",
                        data={
                            "product_id": product.id,
                            "product_name": product.name,
                            "current_stock": product.stock_quantity,
                            "min_stock": product.min_stock or setting.low_stock_threshold,
                            "sku": product.sku
                        },
                        user_id=user.id,
                        branch_id=user.branch_id
                    )
                    self.create_notification(notification)
                    alerts_created += 1

        logger.info(f"Created {alerts_created} low stock alerts")
        return alerts_created

    def create_daily_sales_report(self, date: Optional[datetime] = None) -> int:
        """
        Crear reporte diario de ventas para usuarios con esta opción habilitada.
        Retorna la cantidad de reportes creados.
        """
        if date is None:
            date = datetime.utcnow().date()
        else:
            date = date.date()

        logger.info(f"Creating daily sales reports for {date}...")
        reports_created = 0

        # Obtener usuarios con reporte diario habilitado
        enabled_settings = self.setting_repo.get_users_with_daily_sales_enabled()

        for setting in enabled_settings:
            user = self.db.query(User).filter(User.id == setting.user_id).first()
            if not user or not user.is_active:
                continue

            # Calcular estadísticas de ventas del día
            start_date = datetime.combine(date, datetime.min.time())
            end_date = datetime.combine(date, datetime.max.time())

            sales_query = self.db.query(Sale).filter(
                Sale.created_at >= start_date,
                Sale.created_at <= end_date
            )

            # Si el usuario tiene sucursal específica, filtrar por sucursal
            if user.branch_id:
                sales_query = sales_query.filter(Sale.branch_id == user.branch_id)

            sales = sales_query.all()
            total_sales = len(sales)
            total_amount = sum(sale.total_amount for sale in sales)
            total_items = sum(len(sale.items) for sale in sales)

            # Crear notificación de reporte
            notification = NotificationCreate(
                type=NotificationType.DAILY_SALES_REPORT,
                priority=NotificationPriority.LOW,
                title=f"Reporte de Ventas - {date.strftime('%d/%m/%Y')}",
                message=f"Resumen de ventas del día:\n"
                        f"• Total de ventas: {total_sales}\n"
                        f"• Monto total: ${total_amount:,.2f}\n"
                        f"• Productos vendidos: {total_items}",
                data={
                    "date": date.isoformat(),
                    "total_sales": total_sales,
                    "total_amount": float(total_amount),
                    "total_items": total_items,
                    "branch_id": user.branch_id
                },
                user_id=user.id,
                branch_id=user.branch_id,
                expires_at=datetime.utcnow() + timedelta(days=7)  # Expira en 7 días
            )
            self.create_notification(notification)
            reports_created += 1

        logger.info(f"Created {reports_created} daily sales reports")
        return reports_created

    def create_backup_reminders(self, frequency: str = "weekly") -> int:
        """
        Crear recordatorios de respaldo para usuarios con esta opción habilitada.
        frequency: 'daily', 'weekly', 'monthly'
        Retorna la cantidad de recordatorios creados.
        """
        logger.info(f"Creating {frequency} backup reminders...")
        reminders_created = 0

        # Obtener usuarios con recordatorio habilitado para esta frecuencia
        enabled_settings = self.setting_repo.get_users_with_backup_reminder_enabled(frequency)

        today = datetime.utcnow()

        for setting in enabled_settings:
            should_remind = False

            # Verificar si es día de recordatorio según la frecuencia
            if frequency == "daily":
                should_remind = True
            elif frequency == "weekly":
                # Recordar el día de la semana configurado (1=Lunes, 7=Domingo)
                if today.isoweekday() == setting.backup_reminder_day:
                    should_remind = True
            elif frequency == "monthly":
                # Recordar el día del mes configurado
                if today.day == setting.backup_reminder_day:
                    should_remind = True

            if should_remind:
                user = self.db.query(User).filter(User.id == setting.user_id).first()
                if not user or not user.is_active:
                    continue

                # Verificar si ya existe un recordatorio reciente
                recent_reminder = self.db.query(Notification).filter(
                    Notification.user_id == user.id,
                    Notification.type == NotificationType.BACKUP_REMINDER,
                    Notification.created_at >= today - timedelta(hours=12)
                ).first()

                if not recent_reminder:
                    # Crear recordatorio
                    notification = NotificationCreate(
                        type=NotificationType.BACKUP_REMINDER,
                        priority=NotificationPriority.MEDIUM,
                        title="Recordatorio de Respaldo",
                        message=f"Es hora de realizar el respaldo {frequency} del sistema. "
                                f"Asegúrate de respaldar:\n"
                                f"• Base de datos\n"
                                f"• Configuraciones\n"
                                f"• Imágenes de productos\n"
                                f"No olvides verificar que el respaldo se complete correctamente.",
                        data={
                            "frequency": frequency,
                            "date": today.isoformat(),
                            "reminder_day": setting.backup_reminder_day
                        },
                        user_id=user.id,
                        branch_id=user.branch_id,
                        expires_at=today + timedelta(days=1)  # Expira en 1 día
                    )
                    self.create_notification(notification)
                    reminders_created += 1

        logger.info(f"Created {reminders_created} backup reminders")
        return reminders_created

    def create_custom_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        branch_id: Optional[int] = None,
        data: Optional[Dict] = None,
        expires_in_days: Optional[int] = None
    ) -> Notification:
        """Crear una notificación personalizada"""
        expires_at = None
        if expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=expires_in_days)

        notification = NotificationCreate(
            type=NotificationType.CUSTOM,
            priority=priority,
            title=title,
            message=message,
            data=data,
            user_id=user_id,
            branch_id=branch_id,
            expires_at=expires_at
        )
        return self.create_notification(notification)

    # ========================================================================
    # Mantenimiento y limpieza
    # ========================================================================

    def cleanup_old_notifications(self, days: int = 30) -> int:
        """Limpiar notificaciones antiguas leídas"""
        return self.notification_repo.delete_old_notifications(days)

    def deactivate_expired_notifications(self) -> int:
        """Desactivar notificaciones expiradas"""
        return self.notification_repo.deactivate_expired()

    # ========================================================================
    # Utilidades
    # ========================================================================

    def get_notification_summary(self, user_id: int) -> Dict:
        """Obtener resumen completo de notificaciones de un usuario"""
        stats = self.get_notification_stats(user_id)
        recent = self.get_user_notifications(user_id, limit=10)
        unread = self.get_user_notifications(user_id, limit=10, is_read=False)

        return {
            "stats": stats,
            "recent_notifications": [
                {
                    "id": n.id,
                    "type": n.type,
                    "title": n.title,
                    "message": n.message[:100] + "..." if len(n.message) > 100 else n.message,
                    "is_read": n.is_read,
                    "priority": n.priority,
                    "created_at": n.created_at.isoformat()
                }
                for n in recent
            ],
            "unread_notifications": [
                {
                    "id": n.id,
                    "type": n.type,
                    "title": n.title,
                    "priority": n.priority,
                    "created_at": n.created_at.isoformat()
                }
                for n in unread
            ]
        }
