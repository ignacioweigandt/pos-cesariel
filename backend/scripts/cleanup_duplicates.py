"""
Script para limpiar registros duplicados ANTES de aplicar UNIQUE constraints.

IMPORTANTE: Ejecutar esto ANTES de la migración de constraints.

Uso:
    docker compose exec backend python scripts/cleanup_duplicates.py
"""

import sys
from pathlib import Path

# Agregar backend al path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import func
from database import SessionLocal
from app.models import (
    BranchStock, ProductSize, BranchTaxRate, BranchPaymentMethod
)


def cleanup_branch_stock_duplicates(db):
    """Elimina duplicados en BranchStock, manteniendo el de mayor stock."""
    print("\n🔍 Buscando duplicados en BranchStock...")
    
    # Encontrar duplicados
    duplicates = db.query(
        BranchStock.branch_id,
        BranchStock.product_id,
        func.count(BranchStock.id).label('count')
    ).group_by(
        BranchStock.branch_id,
        BranchStock.product_id
    ).having(
        func.count(BranchStock.id) > 1
    ).all()
    
    if not duplicates:
        print("✅ No hay duplicados en BranchStock")
        return
    
    print(f"⚠️  Encontrados {len(duplicates)} grupos duplicados")
    
    for branch_id, product_id, count in duplicates:
        print(f"\n  Duplicado: branch_id={branch_id}, product_id={product_id} ({count} registros)")
        
        # Obtener todos los duplicados
        records = db.query(BranchStock).filter(
            BranchStock.branch_id == branch_id,
            BranchStock.product_id == product_id
        ).order_by(BranchStock.stock_quantity.desc()).all()
        
        # Mantener el que tiene más stock
        keep = records[0]
        to_delete = records[1:]
        
        print(f"    Manteniendo: id={keep.id}, stock={keep.stock_quantity}")
        for record in to_delete:
            print(f"    Eliminando: id={record.id}, stock={record.stock_quantity}")
            db.delete(record)
    
    db.commit()
    print(f"✅ BranchStock limpiado ({len(duplicates)} duplicados eliminados)")


def cleanup_product_size_duplicates(db):
    """Elimina duplicados en ProductSize, manteniendo el de mayor stock."""
    print("\n🔍 Buscando duplicados en ProductSize...")
    
    # Encontrar duplicados
    duplicates = db.query(
        ProductSize.product_id,
        ProductSize.branch_id,
        ProductSize.size,
        func.count(ProductSize.id).label('count')
    ).group_by(
        ProductSize.product_id,
        ProductSize.branch_id,
        ProductSize.size
    ).having(
        func.count(ProductSize.id) > 1
    ).all()
    
    if not duplicates:
        print("✅ No hay duplicados en ProductSize")
        return
    
    print(f"⚠️  Encontrados {len(duplicates)} grupos duplicados")
    
    for product_id, branch_id, size, count in duplicates:
        print(f"\n  Duplicado: product_id={product_id}, branch_id={branch_id}, size={size} ({count} registros)")
        
        # Obtener todos los duplicados
        records = db.query(ProductSize).filter(
            ProductSize.product_id == product_id,
            ProductSize.branch_id == branch_id,
            ProductSize.size == size
        ).order_by(ProductSize.stock_quantity.desc()).all()
        
        # Mantener el que tiene más stock
        keep = records[0]
        to_delete = records[1:]
        
        print(f"    Manteniendo: id={keep.id}, stock={keep.stock_quantity}")
        for record in to_delete:
            print(f"    Eliminando: id={record.id}, stock={record.stock_quantity}")
            db.delete(record)
    
    db.commit()
    print(f"✅ ProductSize limpiado ({len(duplicates)} duplicados eliminados)")


def cleanup_branch_tax_rate_duplicates(db):
    """Elimina duplicados en BranchTaxRate, manteniendo el más reciente."""
    print("\n🔍 Buscando duplicados en BranchTaxRate...")
    
    # Encontrar duplicados
    duplicates = db.query(
        BranchTaxRate.branch_id,
        BranchTaxRate.tax_rate_id,
        func.count(BranchTaxRate.id).label('count')
    ).group_by(
        BranchTaxRate.branch_id,
        BranchTaxRate.tax_rate_id
    ).having(
        func.count(BranchTaxRate.id) > 1
    ).all()
    
    if not duplicates:
        print("✅ No hay duplicados en BranchTaxRate")
        return
    
    print(f"⚠️  Encontrados {len(duplicates)} grupos duplicados")
    
    for branch_id, tax_rate_id, count in duplicates:
        print(f"\n  Duplicado: branch_id={branch_id}, tax_rate_id={tax_rate_id} ({count} registros)")
        
        # Obtener todos los duplicados
        records = db.query(BranchTaxRate).filter(
            BranchTaxRate.branch_id == branch_id,
            BranchTaxRate.tax_rate_id == tax_rate_id
        ).order_by(BranchTaxRate.created_at.desc()).all()
        
        # Mantener el más reciente
        keep = records[0]
        to_delete = records[1:]
        
        print(f"    Manteniendo: id={keep.id}")
        for record in to_delete:
            print(f"    Eliminando: id={record.id}")
            db.delete(record)
    
    db.commit()
    print(f"✅ BranchTaxRate limpiado ({len(duplicates)} duplicados eliminados)")


def cleanup_branch_payment_method_duplicates(db):
    """Elimina duplicados en BranchPaymentMethod, manteniendo el más reciente."""
    print("\n🔍 Buscando duplicados en BranchPaymentMethod...")
    
    # Encontrar duplicados
    duplicates = db.query(
        BranchPaymentMethod.branch_id,
        BranchPaymentMethod.payment_method_id,
        func.count(BranchPaymentMethod.id).label('count')
    ).group_by(
        BranchPaymentMethod.branch_id,
        BranchPaymentMethod.payment_method_id
    ).having(
        func.count(BranchPaymentMethod.id) > 1
    ).all()
    
    if not duplicates:
        print("✅ No hay duplicados en BranchPaymentMethod")
        return
    
    print(f"⚠️  Encontrados {len(duplicates)} grupos duplicados")
    
    for branch_id, payment_method_id, count in duplicates:
        print(f"\n  Duplicado: branch_id={branch_id}, payment_method_id={payment_method_id} ({count} registros)")
        
        # Obtener todos los duplicados
        records = db.query(BranchPaymentMethod).filter(
            BranchPaymentMethod.branch_id == branch_id,
            BranchPaymentMethod.payment_method_id == payment_method_id
        ).order_by(BranchPaymentMethod.created_at.desc()).all()
        
        # Mantener el más reciente
        keep = records[0]
        to_delete = records[1:]
        
        print(f"    Manteniendo: id={keep.id}")
        for record in to_delete:
            print(f"    Eliminando: id={record.id}")
            db.delete(record)
    
    db.commit()
    print(f"✅ BranchPaymentMethod limpiado ({len(duplicates)} duplicados eliminados)")


def verify_no_negative_stock(db):
    """Verifica que no haya stock negativo antes de aplicar constraints."""
    print("\n🔍 Verificando stock negativo...")
    
    # BranchStock
    negative_branch_stock = db.query(BranchStock).filter(
        BranchStock.stock_quantity < 0
    ).all()
    
    if negative_branch_stock:
        print(f"⚠️  ALERTA: {len(negative_branch_stock)} registros con stock negativo en BranchStock:")
        for record in negative_branch_stock:
            print(f"    - id={record.id}, branch_id={record.branch_id}, "
                  f"product_id={record.product_id}, stock={record.stock_quantity}")
        print("    👉 Corregir manualmente o setear a 0")
        
        # Opción: Corregir automáticamente
        response = input("\n¿Corregir automáticamente a 0? (s/n): ")
        if response.lower() == 's':
            for record in negative_branch_stock:
                record.stock_quantity = 0
            db.commit()
            print("✅ Stock negativo corregido a 0")
    else:
        print("✅ No hay stock negativo en BranchStock")
    
    # ProductSize
    negative_product_size = db.query(ProductSize).filter(
        ProductSize.stock_quantity < 0
    ).all()
    
    if negative_product_size:
        print(f"⚠️  ALERTA: {len(negative_product_size)} registros con stock negativo en ProductSize:")
        for record in negative_product_size:
            print(f"    - id={record.id}, product_id={record.product_id}, "
                  f"size={record.size}, stock={record.stock_quantity}")
        
        response = input("\n¿Corregir automáticamente a 0? (s/n): ")
        if response.lower() == 's':
            for record in negative_product_size:
                record.stock_quantity = 0
            db.commit()
            print("✅ Stock negativo corregido a 0")
    else:
        print("✅ No hay stock negativo en ProductSize")


def main():
    """Ejecutar limpieza completa."""
    print("=" * 60)
    print("🧹 LIMPIEZA DE DUPLICADOS ANTES DE CONSTRAINTS")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Limpiar duplicados
        cleanup_branch_stock_duplicates(db)
        cleanup_product_size_duplicates(db)
        cleanup_branch_tax_rate_duplicates(db)
        cleanup_branch_payment_method_duplicates(db)
        
        # Verificar datos inválidos
        verify_no_negative_stock(db)
        
        print("\n" + "=" * 60)
        print("✅ LIMPIEZA COMPLETADA")
        print("=" * 60)
        print("\n👉 Ahora podés ejecutar: make migrate-upgrade")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
