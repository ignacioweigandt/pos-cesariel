"""
Script de migración para el sistema de notificaciones.

Este script crea las tablas necesarias para el sistema de notificaciones
y configura notificaciones por defecto para los usuarios existentes.

Uso:
    python migrate_notifications.py
"""

import logging
from database import engine, get_db, Base
from app.models.notification import Notification, NotificationSetting
from app.models import User
from sqlalchemy import inspect

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def check_table_exists(table_name: str) -> bool:
    """Verificar si una tabla existe en la base de datos"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


def create_notification_tables():
    """Crear tablas de notificaciones"""
    logger.info("Checking notification tables...")

    notifications_exists = check_table_exists('notifications')
    settings_exists = check_table_exists('notification_settings')

    if notifications_exists and settings_exists:
        logger.info("✓ Notification tables already exist. Skipping creation.")
        return False

    logger.info("Creating notification tables...")

    try:
        # Crear solo las tablas de notificaciones
        Notification.__table__.create(engine, checkfirst=True)
        NotificationSetting.__table__.create(engine, checkfirst=True)

        logger.info("✓ Notification tables created successfully!")
        return True
    except Exception as e:
        logger.error(f"✗ Error creating notification tables: {str(e)}")
        raise


def create_default_settings_for_users():
    """Crear configuración por defecto para usuarios existentes"""
    logger.info("Creating default notification settings for existing users...")

    db = next(get_db())
    try:
        # Obtener todos los usuarios activos
        users = db.query(User).filter(User.is_active == True).all()
        logger.info(f"Found {len(users)} active users")

        created_count = 0
        for user in users:
            # Verificar si ya tiene configuración
            existing = db.query(NotificationSetting).filter(
                NotificationSetting.user_id == user.id
            ).first()

            if not existing:
                # Crear configuración por defecto
                setting = NotificationSetting(
                    user_id=user.id,
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
                db.add(setting)
                created_count += 1

        db.commit()
        logger.info(f"✓ Created default settings for {created_count} users")
        db.close()
        return created_count
    except Exception as e:
        db.rollback()
        db.close()
        logger.error(f"✗ Error creating default settings: {str(e)}")
        raise


def verify_migration():
    """Verificar que la migración fue exitosa"""
    logger.info("Verifying migration...")

    db = next(get_db())
    try:
        # Contar notificaciones
        notification_count = db.query(Notification).count()
        logger.info(f"  - Notifications in DB: {notification_count}")

        # Contar configuraciones
        setting_count = db.query(NotificationSetting).count()
        logger.info(f"  - Notification settings in DB: {setting_count}")

        # Contar usuarios
        user_count = db.query(User).filter(User.is_active == True).count()
        logger.info(f"  - Active users in DB: {user_count}")

        if setting_count > 0:
            logger.info("✓ Migration verified successfully!")
        else:
            logger.warning("⚠ No notification settings created. This might be expected if there are no users.")

        db.close()
    except Exception as e:
        db.close()
        logger.error(f"✗ Error verifying migration: {str(e)}")
        raise


def main():
    """Ejecutar migración completa"""
    logger.info("=" * 70)
    logger.info("NOTIFICATION SYSTEM MIGRATION")
    logger.info("=" * 70)

    try:
        # Paso 1: Crear tablas
        tables_created = create_notification_tables()

        # Paso 2: Crear configuraciones por defecto
        created_count = create_default_settings_for_users()

        # Paso 3: Verificar migración
        verify_migration()

        # Resumen
        logger.info("=" * 70)
        logger.info("MIGRATION SUMMARY")
        logger.info("=" * 70)
        logger.info(f"  - Tables created: {'Yes' if tables_created else 'Already existed'}")
        logger.info(f"  - Default settings created: {created_count}")
        logger.info("=" * 70)
        logger.info("✓ Migration completed successfully!")
        logger.info("=" * 70)

    except Exception as e:
        logger.error("=" * 70)
        logger.error("✗ MIGRATION FAILED!")
        logger.error(f"Error: {str(e)}")
        logger.error("=" * 70)
        raise


if __name__ == "__main__":
    main()
