"""
Migración: Agregar tabla system_config

Este script agrega la tabla system_config a una base de datos existente
sin afectar ninguna otra tabla o dato.

Uso:
    python migrate_system_config.py
"""

from database import SessionLocal, engine
from app.models.system_config import SystemConfig
from sqlalchemy import inspect
import sys


def table_exists(table_name):
    """Verificar si una tabla existe en la base de datos"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


def migrate_system_config():
    """Crear tabla system_config y agregar configuración por defecto"""

    print("=" * 60)
    print("Migración: Agregar tabla system_config")
    print("=" * 60)

    # Verificar si la tabla ya existe
    if table_exists('system_config'):
        print("✓ La tabla 'system_config' ya existe")

        # Verificar si hay datos
        db = SessionLocal()
        try:
            config_count = db.query(SystemConfig).count()
            if config_count > 0:
                print(f"✓ Ya existe configuración ({config_count} registro(s))")
                print("\n✅ No se requiere migración")
                return True
            else:
                print("⚠ La tabla existe pero está vacía")
        except Exception as e:
            print(f"⚠ Error verificando datos: {e}")
        finally:
            db.close()
    else:
        print("⊕ Creando tabla 'system_config'...")

        # Crear solo la tabla system_config
        try:
            SystemConfig.__table__.create(bind=engine, checkfirst=True)
            print("✓ Tabla 'system_config' creada exitosamente")
        except Exception as e:
            print(f"❌ Error creando tabla: {e}")
            return False

    # Insertar configuración por defecto
    print("\n⊕ Insertando configuración por defecto...")
    db = SessionLocal()

    try:
        # Crear configuración por defecto
        default_config = SystemConfig(
            default_currency="ARS",
            currency_symbol="$",
            currency_position="before",
            decimal_places=2,
            default_tax_rate=0,
            session_timeout=30
        )

        db.add(default_config)
        db.commit()
        db.refresh(default_config)

        print("✓ Configuración por defecto insertada:")
        print(f"  - Moneda: {default_config.default_currency}")
        print(f"  - Símbolo: {default_config.currency_symbol}")
        print(f"  - Posición: {default_config.currency_position}")
        print(f"  - Decimales: {default_config.decimal_places}")
        print(f"  - ID: {default_config.id}")

        print("\n" + "=" * 60)
        print("✅ Migración completada exitosamente")
        print("=" * 60)
        print("\n📋 Próximos pasos:")
        print("1. La configuración de moneda ya está disponible")
        print("2. Puedes cambiarla desde Settings → Currency en el frontend")
        print("3. O usando la API: PUT /config/currency")
        print("\n💡 Reinicia el frontend para que cargue la configuración:")
        print("   make restart")

        return True

    except Exception as e:
        print(f"\n❌ Error insertando configuración: {e}")
        db.rollback()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    print("\n🚀 Iniciando migración...\n")

    try:
        success = migrate_system_config()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
