"""
Migration script to initialize BranchStock for existing products.

This script ensures that all existing products without sizes have a BranchStock
entry with stock_quantity = 0 for each active branch. This is necessary for
proper multi-branch stock management.

Usage:
    python migrate_initialize_branch_stock.py
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from app.models import Product, Branch, BranchStock
from sqlalchemy import text


def migrate_initialize_branch_stock():
    """Initialize BranchStock entries for all existing products."""
    db: Session = SessionLocal()

    try:
        print("🚀 Iniciando migración de stock multisucursal...")
        print("=" * 60)

        # Obtener todas las sucursales activas
        active_branches = db.query(Branch).filter(Branch.is_active == True).all()
        print(f"✅ Encontradas {len(active_branches)} sucursales activas:")
        for branch in active_branches:
            print(f"   - {branch.name} (ID: {branch.id})")

        # Obtener todos los productos SIN talles
        products_without_sizes = db.query(Product).filter(
            Product.has_sizes == False,
            Product.is_active == True
        ).all()

        print(f"\n✅ Encontrados {len(products_without_sizes)} productos sin talles")
        print("=" * 60)

        # Contadores
        products_migrated = 0
        branch_stocks_created = 0
        products_skipped = 0

        for product in products_without_sizes:
            print(f"\n📦 Procesando producto: {product.name} (ID: {product.id}, SKU: {product.sku})")

            # Verificar si ya tiene BranchStock para todas las sucursales
            existing_branch_stocks = db.query(BranchStock).filter(
                BranchStock.product_id == product.id
            ).all()

            existing_branch_ids = {bs.branch_id for bs in existing_branch_stocks}

            # Encontrar sucursales faltantes
            missing_branches = [b for b in active_branches if b.id not in existing_branch_ids]

            if not missing_branches:
                print(f"   ⏭️  Ya tiene BranchStock para todas las sucursales. Saltando...")
                products_skipped += 1
                continue

            print(f"   🔧 Creando BranchStock para {len(missing_branches)} sucursales faltantes:")

            for branch in missing_branches:
                branch_stock = BranchStock(
                    product_id=product.id,
                    branch_id=branch.id,
                    stock_quantity=0,  # Stock inicial en 0
                    min_stock=product.min_stock
                )
                db.add(branch_stock)
                branch_stocks_created += 1
                print(f"      ✅ {branch.name}: stock=0, min_stock={product.min_stock}")

            products_migrated += 1

        # Commit de todos los cambios
        db.commit()

        print("\n" + "=" * 60)
        print("🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        print(f"✅ Productos migrados: {products_migrated}")
        print(f"✅ BranchStocks creados: {branch_stocks_created}")
        print(f"⏭️  Productos saltados (ya configurados): {products_skipped}")
        print(f"📊 Total productos procesados: {len(products_without_sizes)}")
        print("=" * 60)

        # Verificación final
        print("\n🔍 Verificación final:")
        for branch in active_branches:
            count = db.query(BranchStock).filter(
                BranchStock.branch_id == branch.id
            ).count()
            print(f"   Sucursal '{branch.name}': {count} productos con stock configurado")

    except Exception as e:
        print(f"\n❌ ERROR durante la migración: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def verify_migration():
    """Verify that the migration was successful."""
    db: Session = SessionLocal()

    try:
        print("\n" + "=" * 60)
        print("🔍 VERIFICACIÓN DETALLADA")
        print("=" * 60)

        # Verificar productos sin BranchStock
        products_without_sizes = db.query(Product).filter(
            Product.has_sizes == False,
            Product.is_active == True
        ).all()

        active_branches = db.query(Branch).filter(Branch.is_active == True).all()
        expected_branch_stocks = len(products_without_sizes) * len(active_branches)

        actual_branch_stocks = db.query(BranchStock).count()

        print(f"📊 Productos sin talles activos: {len(products_without_sizes)}")
        print(f"📊 Sucursales activas: {len(active_branches)}")
        print(f"📊 BranchStocks esperados: {expected_branch_stocks}")
        print(f"📊 BranchStocks actuales: {actual_branch_stocks}")

        if actual_branch_stocks >= expected_branch_stocks:
            print("✅ Verificación EXITOSA: Todos los productos tienen BranchStock")
        else:
            missing = expected_branch_stocks - actual_branch_stocks
            print(f"⚠️  ADVERTENCIA: Faltan {missing} BranchStocks")

            # Identificar productos problemáticos
            print("\n🔍 Productos sin BranchStock completo:")
            for product in products_without_sizes:
                branch_stocks = db.query(BranchStock).filter(
                    BranchStock.product_id == product.id
                ).count()
                if branch_stocks < len(active_branches):
                    print(f"   ❌ {product.name} (ID: {product.id}): "
                          f"{branch_stocks}/{len(active_branches)} sucursales")

        print("=" * 60)

    except Exception as e:
        print(f"\n❌ ERROR durante la verificación: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║  MIGRACIÓN: Inicializar Stock Multisucursal             ║
║                                                          ║
║  Este script crea registros BranchStock en 0 para       ║
║  todos los productos existentes sin talles en todas     ║
║  las sucursales activas.                                ║
╚══════════════════════════════════════════════════════════╝
    """)

    confirmation = input("\n¿Desea continuar con la migración? (s/n): ")

    if confirmation.lower() in ['s', 'si', 'yes', 'y']:
        migrate_initialize_branch_stock()
        verify_migration()
        print("\n✅ Proceso completado. Puede cerrar esta ventana.")
    else:
        print("\n❌ Migración cancelada por el usuario.")
