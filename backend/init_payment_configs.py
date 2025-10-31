"""
Script para inicializar configuraciones de pago en la base de datos

Uso:
    python init_payment_configs.py
"""

from database import SessionLocal
from app.models import PaymentConfig
from decimal import Decimal
import sys


def init_payment_configs():
    """Crear configuraciones de pago por defecto en la base de datos"""

    print("=" * 60)
    print("Inicializando configuraciones de pago")
    print("=" * 60)

    db = SessionLocal()

    try:
        # Verificar si ya existen configuraciones
        existing_count = db.query(PaymentConfig).count()

        if existing_count > 0:
            print(f"✓ Ya existen {existing_count} configuraciones de pago")
            print("✅ No se requiere inicialización")
            return True

        print("\n⊕ Creando configuraciones de pago por defecto...")

        default_configs = [
            # Efectivo
            PaymentConfig(
                payment_type="efectivo",
                card_type=None,
                installments=1,
                surcharge_percentage=Decimal("0.00"),
                is_active=True,
                description="Pago en efectivo sin recargo"
            ),
            # Transferencia
            PaymentConfig(
                payment_type="transferencia",
                card_type=None,
                installments=1,
                surcharge_percentage=Decimal("0.00"),
                is_active=True,
                description="Transferencia bancaria sin recargo"
            ),
            # Tarjetas Bancarizadas - 1 cuota
            PaymentConfig(
                payment_type="tarjeta",
                card_type="bancarizadas",
                installments=1,
                surcharge_percentage=Decimal("0.00"),
                is_active=True,
                description="Tarjetas bancarizadas - 1 cuota"
            ),
            # Tarjetas Bancarizadas - 3 cuotas
            PaymentConfig(
                payment_type="tarjeta",
                card_type="bancarizadas",
                installments=3,
                surcharge_percentage=Decimal("8.00"),
                is_active=True,
                description="Tarjetas bancarizadas - 3 cuotas"
            ),
            # Tarjetas Bancarizadas - 6 cuotas
            PaymentConfig(
                payment_type="tarjeta",
                card_type="bancarizadas",
                installments=6,
                surcharge_percentage=Decimal("14.00"),
                is_active=True,
                description="Tarjetas bancarizadas - 6 cuotas"
            ),
            # Tarjetas Bancarizadas - 9 cuotas
            PaymentConfig(
                payment_type="tarjeta",
                card_type="bancarizadas",
                installments=9,
                surcharge_percentage=Decimal("20.00"),
                is_active=True,
                description="Tarjetas bancarizadas - 9 cuotas"
            ),
            # Tarjetas Bancarizadas - 12 cuotas
            PaymentConfig(
                payment_type="tarjeta",
                card_type="bancarizadas",
                installments=12,
                surcharge_percentage=Decimal("26.00"),
                is_active=True,
                description="Tarjetas bancarizadas - 12 cuotas"
            ),
            # Tarjetas No Bancarizadas
            PaymentConfig(
                payment_type="tarjeta",
                card_type="no_bancarizadas",
                installments=1,
                surcharge_percentage=Decimal("15.00"),
                is_active=True,
                description="Tarjetas no bancarizadas"
            ),
            # Tarjeta Naranja
            PaymentConfig(
                payment_type="tarjeta",
                card_type="tarjeta_naranja",
                installments=1,
                surcharge_percentage=Decimal("15.00"),
                is_active=True,
                description="Tarjeta Naranja"
            )
        ]

        for config in default_configs:
            db.add(config)

        db.commit()

        print(f"✓ {len(default_configs)} configuraciones de pago creadas exitosamente")
        print("\n" + "=" * 60)
        print("✅ Inicialización completada")
        print("=" * 60)
        print("\n📋 Configuraciones creadas:")
        print("1. Efectivo (sin recargo)")
        print("2. Transferencia (sin recargo)")
        print("3-7. Tarjetas bancarizadas (1, 3, 6, 9, 12 cuotas)")
        print("8. Tarjetas no bancarizadas (15% recargo)")
        print("9. Tarjeta Naranja (15% recargo)")
        print("\n💡 Ahora puedes modificar estas configuraciones desde Settings → Payment Methods")

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    print("\n🚀 Iniciando...\n")

    try:
        success = init_payment_configs()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
