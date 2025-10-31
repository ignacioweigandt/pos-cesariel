"""
Migración: Agregar tabla payment_methods

Este script agrega la tabla payment_methods a una base de datos existente
para almacenar métodos de pago habilitados/deshabilitados (Efectivo, Débito, Crédito, Transferencia).

Uso:
    python migrate_payment_methods.py
"""

from database import SessionLocal, engine
from app.models.payment_method import PaymentMethod
from sqlalchemy import inspect
import sys


def table_exists(table_name):
    """Verificar si una tabla existe en la base de datos"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


def migrate_payment_methods():
    """Crear tabla payment_methods y agregar métodos por defecto"""

    print("=" * 60)
    print("Migración: Agregar tabla payment_methods")
    print("=" * 60)

    # Verificar si la tabla ya existe
    if table_exists('payment_methods'):
        print("✓ La tabla 'payment_methods' ya existe")

        # Verificar si hay datos
        db = SessionLocal()
        try:
            method_count = db.query(PaymentMethod).count()
            if method_count > 0:
                print(f"✓ Ya existen {method_count} método(s) de pago")
                print("\n✅ No se requiere migración")
                return True
            else:
                print("⚠ La tabla existe pero está vacía")
        except Exception as e:
            print(f"⚠ Error verificando datos: {e}")
        finally:
            db.close()
    else:
        print("⊕ Creando tabla 'payment_methods'...")

        # Crear solo la tabla payment_methods
        try:
            PaymentMethod.__table__.create(bind=engine, checkfirst=True)
            print("✓ Tabla 'payment_methods' creada exitosamente")
        except Exception as e:
            print(f"❌ Error creando tabla: {e}")
            return False

    # Insertar métodos de pago por defecto
    print("\n⊕ Insertando métodos de pago por defecto...")
    db = SessionLocal()

    try:
        default_methods = [
            PaymentMethod(
                name="Efectivo",
                code="CASH",
                icon="💵",
                is_active=True,
                requires_change=True,
                description="Pago en efectivo"
            ),
            PaymentMethod(
                name="Tarjetas",
                code="CARD",
                icon="💳",
                is_active=True,
                requires_change=False,
                description="Pago con tarjetas (bancarizadas, no bancarizadas, etc.)"
            ),
            PaymentMethod(
                name="Transferencia",
                code="TRANSFER",
                icon="🏦",
                is_active=True,
                requires_change=False,
                description="Transferencia bancaria"
            )
        ]

        for method in default_methods:
            db.add(method)

        db.commit()

        print(f"✓ {len(default_methods)} métodos de pago insertados:")
        for i, method in enumerate(default_methods, 1):
            print(f"  {i}. {method.name} ({method.code}) - {'Habilitado' if method.is_active else 'Deshabilitado'}")

        print("\n" + "=" * 60)
        print("✅ Migración completada exitosamente")
        print("=" * 60)
        print("\n📋 Próximos pasos:")
        print("1. Los métodos de pago están disponibles")
        print("2. Puedes habilitarlos/deshabilitarlos desde Settings → Payment Methods")
        print("3. O usando la API: PUT /config/payment-methods/{id}")
        print("\n💡 Reinicia el frontend para que cargue la configuración:")
        print("   docker-compose restart frontend")

        return True

    except Exception as e:
        print(f"\n❌ Error insertando métodos de pago: {e}")
        db.rollback()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    print("\n🚀 Iniciando migración...\n")

    try:
        success = migrate_payment_methods()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
