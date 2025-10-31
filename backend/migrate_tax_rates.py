"""
Migración: Agregar tabla tax_rates

Este script agrega la tabla tax_rates a una base de datos existente
para almacenar tasas de impuestos configurables.

Uso:
    python migrate_tax_rates.py
"""

from database import SessionLocal, engine
from app.models.tax_rate import TaxRate
from sqlalchemy import inspect
import sys


def table_exists(table_name):
    """Verificar si una tabla existe en la base de datos"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


def migrate_tax_rates():
    """Crear tabla tax_rates y agregar tasas por defecto"""

    print("=" * 60)
    print("Migración: Agregar tabla tax_rates")
    print("=" * 60)

    # Verificar si la tabla ya existe
    if table_exists('tax_rates'):
        print("✓ La tabla 'tax_rates' ya existe")

        # Verificar si hay datos
        db = SessionLocal()
        try:
            rate_count = db.query(TaxRate).count()
            if rate_count > 0:
                print(f"✓ Ya existen {rate_count} tasa(s) de impuesto")
                print("\n✅ No se requiere migración")
                return True
            else:
                print("⚠ La tabla existe pero está vacía")
        except Exception as e:
            print(f"⚠ Error verificando datos: {e}")
        finally:
            db.close()
    else:
        print("⊕ Creando tabla 'tax_rates'...")

        # Crear solo la tabla tax_rates
        try:
            TaxRate.__table__.create(bind=engine, checkfirst=True)
            print("✓ Tabla 'tax_rates' creada exitosamente")
        except Exception as e:
            print(f"❌ Error creando tabla: {e}")
            return False

    # Insertar tasas de impuestos por defecto
    print("\n⊕ Insertando tasas de impuestos por defecto...")
    db = SessionLocal()

    try:
        default_rates = [
            TaxRate(
                name="IVA General",
                rate=21.0,
                is_active=True,
                is_default=True,
                description="Impuesto al Valor Agregado general"
            ),
            TaxRate(
                name="IVA Reducido",
                rate=10.5,
                is_active=True,
                is_default=False,
                description="IVA reducido para productos básicos"
            ),
            TaxRate(
                name="Exento",
                rate=0.0,
                is_active=True,
                is_default=False,
                description="Productos exentos de impuestos"
            )
        ]

        for rate in default_rates:
            db.add(rate)

        db.commit()

        print(f"✓ {len(default_rates)} tasas de impuestos insertadas:")
        for i, rate in enumerate(default_rates, 1):
            status = "✓ Activo" if rate.is_active else "✗ Inactivo"
            default_mark = " [POR DEFECTO]" if rate.is_default else ""
            print(f"  {i}. {rate.name} ({rate.rate}%) - {status}{default_mark}")

        print("\n" + "=" * 60)
        print("✅ Migración completada exitosamente")
        print("=" * 60)
        print("\n📋 Próximos pasos:")
        print("1. Las tasas de impuestos están disponibles")
        print("2. Puedes gestionarlas desde Settings → Tax Rates")
        print("3. O usando la API: GET/POST/PUT/DELETE /config/tax-rates")
        print("\n💡 Reinicia el frontend para que cargue la configuración:")
        print("   docker-compose restart frontend")

        return True

    except Exception as e:
        print(f"\n❌ Error insertando tasas de impuestos: {e}")
        db.rollback()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    print("\n🚀 Iniciando migración...\n")

    try:
        success = migrate_tax_rates()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
