"""
Script para actualizar métodos de pago: fusionar DEBIT_CARD y CREDIT_CARD en CARD

Este script actualiza la base de datos existente para:
1. Eliminar el registro de CREDIT_CARD
2. Actualizar DEBIT_CARD a CARD con nombre "Tarjetas"
3. O crear CARD si no existen registros previos

Uso:
    python update_card_methods.py
"""

from database import SessionLocal
from app.models.payment_method import PaymentMethod
import sys


def update_card_methods():
    """Fusionar DEBIT_CARD y CREDIT_CARD en un único método CARD"""

    print("=" * 60)
    print("Actualización: Fusionar tarjetas de débito y crédito")
    print("=" * 60)

    db = SessionLocal()

    try:
        # Buscar métodos existentes
        debit_card = db.query(PaymentMethod).filter(PaymentMethod.code == "DEBIT_CARD").first()
        credit_card = db.query(PaymentMethod).filter(PaymentMethod.code == "CREDIT_CARD").first()
        card = db.query(PaymentMethod).filter(PaymentMethod.code == "CARD").first()

        print("\n📊 Estado actual:")
        print(f"  - DEBIT_CARD: {'✓ Existe' if debit_card else '✗ No existe'}")
        print(f"  - CREDIT_CARD: {'✓ Existe' if credit_card else '✗ No existe'}")
        print(f"  - CARD: {'✓ Existe' if card else '✗ No existe'}")

        # Si CARD ya existe, verificar y limpiar antiguos
        if card:
            print("\n✓ El método CARD ya existe")

            # Eliminar DEBIT_CARD si existe
            if debit_card:
                db.delete(debit_card)
                print("  → Eliminado DEBIT_CARD (duplicado)")

            # Eliminar CREDIT_CARD si existe
            if credit_card:
                db.delete(credit_card)
                print("  → Eliminado CREDIT_CARD (duplicado)")

            if debit_card or credit_card:
                db.commit()
                print("\n✅ Registros antiguos eliminados exitosamente")
            else:
                print("\n✅ No hay registros antiguos para limpiar")

            return True

        # Si existe DEBIT_CARD, actualizarlo a CARD
        if debit_card:
            print("\n⊕ Actualizando DEBIT_CARD → CARD")
            debit_card.code = "CARD"
            debit_card.name = "Tarjetas"
            debit_card.description = "Pago con tarjetas (bancarizadas, no bancarizadas, etc.)"
            print("  ✓ DEBIT_CARD actualizado a CARD")

        # Si existe CREDIT_CARD pero no DEBIT_CARD, actualizar CREDIT_CARD
        elif credit_card:
            print("\n⊕ Actualizando CREDIT_CARD → CARD")
            credit_card.code = "CARD"
            credit_card.name = "Tarjetas"
            credit_card.description = "Pago con tarjetas (bancarizadas, no bancarizadas, etc.)"
            print("  ✓ CREDIT_CARD actualizado a CARD")

        # Si no existe ninguno, crear CARD
        else:
            print("\n⊕ Creando nuevo método CARD")
            card = PaymentMethod(
                name="Tarjetas",
                code="CARD",
                icon="💳",
                is_active=True,
                requires_change=False,
                description="Pago con tarjetas (bancarizadas, no bancarizadas, etc.)"
            )
            db.add(card)
            print("  ✓ Método CARD creado")

        # Eliminar el otro método si existe (después de actualizar uno)
        if debit_card and credit_card:
            db.delete(credit_card)
            print("  ✓ CREDIT_CARD eliminado (duplicado)")
        elif credit_card and not debit_card:
            # Ya actualizamos credit_card, no hay que hacer nada más
            pass
        elif debit_card and credit_card:
            # Ya actualizamos debit_card, eliminar credit_card
            pass

        # Confirmar cambios
        db.commit()

        print("\n" + "=" * 60)
        print("✅ Actualización completada exitosamente")
        print("=" * 60)

        # Mostrar resultado final
        print("\n📋 Métodos de pago actuales:")
        all_methods = db.query(PaymentMethod).order_by(PaymentMethod.id).all()
        for method in all_methods:
            status = "✓ Activo" if method.is_active else "✗ Inactivo"
            print(f"  {method.id}. {method.name} ({method.code}) - {status}")

        print("\n💡 Próximos pasos:")
        print("1. Reinicia el frontend para que cargue la nueva configuración:")
        print("   docker-compose restart frontend")
        print("2. Verifica en Settings → Payment Methods")
        print("3. Ahora deberías ver solo 'Tarjetas' en lugar de dos opciones separadas")

        return True

    except Exception as e:
        print(f"\n❌ Error durante la actualización: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    print("\n🚀 Iniciando actualización...\n")

    try:
        success = update_card_methods()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
