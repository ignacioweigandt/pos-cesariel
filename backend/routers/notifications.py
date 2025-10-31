"""
Router de notificaciones para POS Cesariel.

Este módulo define los endpoints para gestión de notificaciones
y configuración de notificaciones por usuario.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth_compat import get_current_active_user
from app.models import User, UserRole, NotificationType, NotificationPriority
from app.schemas import (
    NotificationResponse,
    NotificationCreate,
    NotificationUpdate,
    NotificationStats,
    NotificationSettingResponse,
    NotificationSettingUpdate,
    NotificationBulkMarkRead,
    NotificationBulkDelete
)
from app.services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)


# ============================================================================
# Endpoints de Notificaciones
# ============================================================================

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_read: Optional[bool] = None,
    type: Optional[NotificationType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener notificaciones del usuario actual.

    Parámetros:
    - skip: Número de registros a saltar para paginación
    - limit: Número máximo de registros a retornar
    - is_read: Filtrar por estado leído/no leído (opcional)
    - type: Filtrar por tipo de notificación (opcional)
    """
    service = NotificationService(db)

    if type:
        # Si se especifica tipo, usar el método específico
        notifications = service.notification_repo.get_by_type(
            notification_type=type,
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
    else:
        # De lo contrario, usar el método general
        notifications = service.get_user_notifications(
            user_id=current_user.id,
            skip=skip,
            limit=limit,
            is_read=is_read
        )

    return notifications


@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener estadísticas de notificaciones del usuario actual.

    Retorna:
    - Total de notificaciones
    - Notificaciones no leídas
    - Distribución por tipo
    - Distribución por prioridad
    """
    service = NotificationService(db)
    stats = service.get_notification_stats(current_user.id)
    return stats


@router.get("/summary")
async def get_notification_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener resumen completo de notificaciones incluyendo:
    - Estadísticas
    - Notificaciones recientes
    - Notificaciones no leídas
    """
    service = NotificationService(db)
    summary = service.get_notification_summary(current_user.id)
    return summary


@router.get("/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener cantidad de notificaciones no leídas"""
    service = NotificationService(db)
    count = service.get_unread_count(current_user.id)
    return {"count": count}


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener una notificación específica por ID"""
    service = NotificationService(db)
    notification = service.get_notification(notification_id)

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Verificar que la notificación pertenece al usuario actual
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this notification"
        )

    return notification


@router.patch("/{notification_id}/mark-read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Marcar una notificación como leída"""
    service = NotificationService(db)

    # Verificar que la notificación existe y pertenece al usuario
    notification = service.get_notification(notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this notification"
        )

    updated = service.mark_as_read(notification_id)
    return updated


@router.post("/mark-all-read")
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Marcar todas las notificaciones del usuario como leídas"""
    service = NotificationService(db)
    count = service.mark_all_as_read(current_user.id)

    return {
        "message": f"{count} notifications marked as read",
        "count": count
    }


@router.post("/mark-multiple-read")
async def mark_multiple_as_read(
    data: NotificationBulkMarkRead,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Marcar múltiples notificaciones como leídas"""
    service = NotificationService(db)
    count = service.mark_multiple_as_read(data.notification_ids, current_user.id)

    return {
        "message": f"{count} notifications marked as read",
        "count": count
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Eliminar una notificación (soft delete)"""
    service = NotificationService(db)

    # Verificar que la notificación existe y pertenece al usuario
    notification = service.get_notification(notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this notification"
        )

    success = service.delete_notification(notification_id)

    if success:
        return {"message": "Notification deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )


@router.post("/bulk-delete")
async def bulk_delete_notifications(
    data: NotificationBulkDelete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Eliminar múltiples notificaciones"""
    service = NotificationService(db)
    count = service.bulk_delete(data.notification_ids, current_user.id)

    return {
        "message": f"{count} notifications deleted",
        "count": count
    }


# ============================================================================
# Endpoints de Configuración de Notificaciones
# ============================================================================

@router.get("/settings/my-settings", response_model=NotificationSettingResponse)
async def get_my_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener configuración de notificaciones del usuario actual"""
    service = NotificationService(db)
    settings = service.get_user_settings(current_user.id)
    return settings


@router.put("/settings/my-settings", response_model=NotificationSettingResponse)
async def update_my_notification_settings(
    settings_data: NotificationSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Actualizar configuración de notificaciones del usuario actual"""
    service = NotificationService(db)
    updated = service.update_user_settings(current_user.id, settings_data)

    return updated


# ============================================================================
# Endpoints Administrativos (Solo ADMIN)
# ============================================================================

@router.post("/admin/trigger-low-stock-check")
async def trigger_low_stock_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Ejecutar verificación manual de stock bajo y crear alertas.
    Solo disponible para administradores.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can trigger this action"
        )

    service = NotificationService(db)
    count = service.check_and_create_low_stock_alerts()

    return {
        "message": f"Low stock check completed. {count} alerts created.",
        "alerts_created": count
    }


@router.post("/admin/trigger-daily-sales-report")
async def trigger_daily_sales_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generar reportes diarios de ventas manualmente.
    Solo disponible para administradores.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can trigger this action"
        )

    service = NotificationService(db)
    count = service.create_daily_sales_report()

    return {
        "message": f"Daily sales reports generated. {count} reports created.",
        "reports_created": count
    }


@router.post("/admin/trigger-backup-reminder")
async def trigger_backup_reminder(
    frequency: str = Query("weekly", regex="^(daily|weekly|monthly)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generar recordatorios de respaldo manualmente.
    Solo disponible para administradores.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can trigger this action"
        )

    service = NotificationService(db)
    count = service.create_backup_reminders(frequency)

    return {
        "message": f"Backup reminders generated. {count} reminders created.",
        "reminders_created": count,
        "frequency": frequency
    }


@router.post("/admin/cleanup-old")
async def cleanup_old_notifications(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Limpiar notificaciones antiguas leídas.
    Solo disponible para administradores.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can perform this action"
        )

    service = NotificationService(db)
    count = service.cleanup_old_notifications(days)

    return {
        "message": f"Cleanup completed. {count} old notifications removed.",
        "cleaned": count,
        "days": days
    }


@router.post("/admin/deactivate-expired")
async def deactivate_expired_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Desactivar notificaciones expiradas.
    Solo disponible para administradores.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can perform this action"
        )

    service = NotificationService(db)
    count = service.deactivate_expired_notifications()

    return {
        "message": f"Expired notifications deactivated. {count} notifications affected.",
        "deactivated": count
    }
