"""
Programador de tareas para notificaciones automáticas.

Este módulo implementa tareas programadas que se ejecutan periódicamente
para generar notificaciones automáticas del sistema.

Uso:
    python notification_scheduler.py

El scheduler ejecuta las siguientes tareas:
- Verificación de stock bajo cada hora
- Reporte diario de ventas a las 18:00
- Recordatorios de respaldo según configuración
- Limpieza de notificaciones antiguas (semanalmente)
"""

import schedule
import time
import logging
from datetime import datetime
from database import get_db
from app.services.notification_service import NotificationService

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def check_low_stock():
    """Verificar stock bajo y crear alertas"""
    logger.info("Running low stock check...")
    try:
        db = next(get_db())
        service = NotificationService(db)
        count = service.check_and_create_low_stock_alerts()
        logger.info(f"Low stock check completed. {count} alerts created.")
        db.close()
    except Exception as e:
        logger.error(f"Error in low stock check: {str(e)}")


def create_daily_sales_report():
    """Crear reporte diario de ventas"""
    logger.info("Creating daily sales reports...")
    try:
        db = next(get_db())
        service = NotificationService(db)
        count = service.create_daily_sales_report()
        logger.info(f"Daily sales reports created. {count} reports generated.")
        db.close()
    except Exception as e:
        logger.error(f"Error creating daily sales reports: {str(e)}")


def create_daily_backup_reminders():
    """Crear recordatorios de respaldo diarios"""
    logger.info("Creating daily backup reminders...")
    try:
        db = next(get_db())
        service = NotificationService(db)
        count = service.create_backup_reminders(frequency="daily")
        logger.info(f"Daily backup reminders created. {count} reminders generated.")
        db.close()
    except Exception as e:
        logger.error(f"Error creating daily backup reminders: {str(e)}")


def create_weekly_backup_reminders():
    """Crear recordatorios de respaldo semanales"""
    logger.info("Creating weekly backup reminders...")
    try:
        db = next(get_db())
        service = NotificationService(db)
        count = service.create_backup_reminders(frequency="weekly")
        logger.info(f"Weekly backup reminders created. {count} reminders generated.")
        db.close()
    except Exception as e:
        logger.error(f"Error creating weekly backup reminders: {str(e)}")


def create_monthly_backup_reminders():
    """Crear recordatorios de respaldo mensuales"""
    logger.info("Creating monthly backup reminders...")
    try:
        db = next(get_db())
        service = NotificationService(db)
        count = service.create_backup_reminders(frequency="monthly")
        logger.info(f"Monthly backup reminders created. {count} reminders generated.")
        db.close()
    except Exception as e:
        logger.error(f"Error creating monthly backup reminders: {str(e)}")


def cleanup_old_notifications():
    """Limpiar notificaciones antiguas"""
    logger.info("Cleaning up old notifications...")
    try:
        db = next(get_db())
        service = NotificationService(db)
        count = service.cleanup_old_notifications(days=30)
        logger.info(f"Old notifications cleaned up. {count} notifications removed.")
        db.close()
    except Exception as e:
        logger.error(f"Error cleaning up old notifications: {str(e)}")


def deactivate_expired():
    """Desactivar notificaciones expiradas"""
    logger.info("Deactivating expired notifications...")
    try:
        db = next(get_db())
        service = NotificationService(db)
        count = service.deactivate_expired_notifications()
        logger.info(f"Expired notifications deactivated. {count} notifications affected.")
        db.close()
    except Exception as e:
        logger.error(f"Error deactivating expired notifications: {str(e)}")


def main():
    """Configurar y ejecutar el scheduler"""
    logger.info("Starting notification scheduler...")

    # ========================================================================
    # Programar tareas
    # ========================================================================

    # Verificación de stock bajo - cada hora
    schedule.every().hour.do(check_low_stock)

    # Reporte diario de ventas - a las 18:00
    schedule.every().day.at("18:00").do(create_daily_sales_report)

    # Recordatorios de respaldo diarios - a las 09:00
    schedule.every().day.at("09:00").do(create_daily_backup_reminders)

    # Recordatorios de respaldo semanales - los lunes a las 09:00
    schedule.every().monday.at("09:00").do(create_weekly_backup_reminders)

    # Recordatorios de respaldo mensuales - el día 1 a las 09:00
    # Nota: schedule no soporta día específico del mes, se ejecuta manualmente

    # Desactivar notificaciones expiradas - cada 6 horas
    schedule.every(6).hours.do(deactivate_expired)

    # Limpieza de notificaciones antiguas - todos los domingos a las 03:00
    schedule.every().sunday.at("03:00").do(cleanup_old_notifications)

    # ========================================================================
    # Ejecutar tareas iniciales al inicio
    # ========================================================================

    logger.info("Running initial checks...")
    check_low_stock()
    deactivate_expired()

    # ========================================================================
    # Loop principal
    # ========================================================================

    logger.info("Scheduler is running. Press Ctrl+C to stop.")
    logger.info("Scheduled tasks:")
    logger.info("  - Low stock check: Every hour")
    logger.info("  - Daily sales report: Every day at 18:00")
    logger.info("  - Daily backup reminders: Every day at 09:00")
    logger.info("  - Weekly backup reminders: Every Monday at 09:00")
    logger.info("  - Deactivate expired: Every 6 hours")
    logger.info("  - Cleanup old notifications: Every Sunday at 03:00")

    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verificar cada minuto
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user.")
    except Exception as e:
        logger.error(f"Scheduler error: {str(e)}")


if __name__ == "__main__":
    main()
