"""
Router para inicialización de base de datos.

Este endpoint permite inicializar la base de datos con datos de prueba
directamente desde una llamada HTTP, útil para deployments en Railway.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import sys
import os

router = APIRouter(prefix="/api/init", tags=["Database Initialization"])


@router.post("/database")
async def initialize_database(db: Session = Depends(get_db)):
    """
    Inicializa la base de datos con datos de prueba.

    Ejecuta los scripts de inicialización en orden:
    1. init_data.py - Usuarios, sucursales, categorías, productos
    2. init_content_data.py - Contenido de e-commerce
    3. init_sportswear_data.py - Catálogo deportivo

    ⚠️ ADVERTENCIA: Solo ejecutar en bases de datos vacías.
    """

    results = {
        "status": "success",
        "steps": []
    }

    try:
        # Importar y ejecutar init_data.py
        results["steps"].append({
            "name": "init_data",
            "status": "running",
            "message": "Creando usuarios, sucursales y productos básicos..."
        })

        import init_data
        init_data.create_initial_data()

        results["steps"][-1]["status"] = "completed"
        results["steps"][-1]["message"] = "✅ Datos esenciales creados"

    except Exception as e:
        results["steps"][-1]["status"] = "error"
        results["steps"][-1]["error"] = str(e)
        results["status"] = "partial"

    try:
        # Importar y ejecutar init_content_data.py
        results["steps"].append({
            "name": "init_content_data",
            "status": "running",
            "message": "Creando contenido de e-commerce..."
        })

        import init_content_data
        init_content_data.main()

        results["steps"][-1]["status"] = "completed"
        results["steps"][-1]["message"] = "✅ Contenido de e-commerce creado"

    except Exception as e:
        results["steps"][-1]["status"] = "error"
        results["steps"][-1]["error"] = str(e)
        results["status"] = "partial"

    try:
        # Importar y ejecutar init_sportswear_data.py
        results["steps"].append({
            "name": "init_sportswear_data",
            "status": "running",
            "message": "Cargando catálogo deportivo..."
        })

        import init_sportswear_data
        init_sportswear_data.create_sportswear_data()

        results["steps"][-1]["status"] = "completed"
        results["steps"][-1]["message"] = "✅ Catálogo deportivo cargado"

    except Exception as e:
        results["steps"][-1]["status"] = "error"
        results["steps"][-1]["error"] = str(e)
        results["status"] = "partial"

    # Resumen final
    completed = sum(1 for step in results["steps"] if step["status"] == "completed")
    total = len(results["steps"])

    results["summary"] = {
        "completed": completed,
        "total": total,
        "success_rate": f"{(completed/total)*100:.1f}%"
    }

    results["credentials"] = {
        "admin": {"username": "admin", "password": "admin123"},
        "manager": {"username": "manager", "password": "manager123"},
        "seller": {"username": "seller", "password": "seller123"}
    }

    return results


@router.get("/status")
async def check_database_status(db: Session = Depends(get_db)):
    """
    Verifica si la base de datos ya tiene datos.
    """
    from app.models import User, Product, Branch

    try:
        user_count = db.query(User).count()
        product_count = db.query(Product).count()
        branch_count = db.query(Branch).count()

        return {
            "initialized": user_count > 0 or product_count > 0,
            "counts": {
                "users": user_count,
                "products": product_count,
                "branches": branch_count
            },
            "recommendation": "safe_to_initialize" if user_count == 0 else "already_initialized"
        }
    except Exception as e:
        return {
            "initialized": False,
            "error": str(e),
            "recommendation": "safe_to_initialize"
        }


@router.post("/migrate/brands")
async def migrate_brands_table(db: Session = Depends(get_db)):
    """
    Ejecuta la migración para crear la tabla de brands y migrar datos existentes.

    Esta migración:
    1. Crea la tabla 'brands' si no existe
    2. Agrega la columna 'brand_id' a productos si no existe
    3. Migra los datos de la columna 'brand' existente a la nueva tabla

    Es seguro ejecutar múltiples veces (idempotente).
    """
    from sqlalchemy import text

    results = {
        "status": "success",
        "steps": [],
        "summary": {}
    }

    try:
        # Step 1: Create brands table
        results["steps"].append({
            "name": "create_brands_table",
            "status": "running"
        })

        db.execute(text("""
            CREATE TABLE IF NOT EXISTS brands (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                logo_url VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        db.commit()
        results["steps"][-1]["status"] = "completed"
        results["steps"][-1]["message"] = "Table 'brands' created/verified"

        # Step 2: Add brand_id column to products
        results["steps"].append({
            "name": "add_brand_id_column",
            "status": "running"
        })

        # Check if column exists first
        column_check = db.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'products' AND column_name = 'brand_id'
        """))

        if not column_check.fetchone():
            db.execute(text("""
                ALTER TABLE products
                ADD COLUMN brand_id INTEGER REFERENCES brands(id)
            """))
            db.commit()
            results["steps"][-1]["message"] = "Column 'brand_id' added to products"
        else:
            results["steps"][-1]["message"] = "Column 'brand_id' already exists"

        results["steps"][-1]["status"] = "completed"

        # Step 3: Migrate existing brand data
        results["steps"].append({
            "name": "migrate_brand_data",
            "status": "running"
        })

        # Get unique brands
        result = db.execute(text("""
            SELECT DISTINCT brand
            FROM products
            WHERE brand IS NOT NULL AND brand != ''
            ORDER BY brand
        """))
        unique_brands = [row[0] for row in result.fetchall()]

        brands_created = 0
        products_updated = 0

        for brand_name in unique_brands:
            # Check if brand exists
            existing = db.execute(
                text("SELECT id FROM brands WHERE name = :name"),
                {"name": brand_name}
            ).fetchone()

            if existing:
                brand_id = existing[0]
            else:
                # Insert new brand
                result = db.execute(
                    text("""
                        INSERT INTO brands (name, is_active)
                        VALUES (:name, TRUE)
                        RETURNING id
                    """),
                    {"name": brand_name}
                )
                brand_id = result.fetchone()[0]
                brands_created += 1

            # Update products
            update_result = db.execute(
                text("""
                    UPDATE products
                    SET brand_id = :brand_id
                    WHERE brand = :brand_name AND (brand_id IS NULL OR brand_id != :brand_id)
                """),
                {"brand_id": brand_id, "brand_name": brand_name}
            )
            products_updated += update_result.rowcount

        db.commit()

        results["steps"][-1]["status"] = "completed"
        results["steps"][-1]["message"] = f"Migrated {len(unique_brands)} brands, updated {products_updated} products"

        results["summary"] = {
            "brands_found": len(unique_brands),
            "brands_created": brands_created,
            "products_updated": products_updated
        }

    except Exception as e:
        db.rollback()
        results["status"] = "error"
        results["error"] = str(e)
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")

    return results


@router.post("/migrate/consolidate-brands")
async def consolidate_brands(db: Session = Depends(get_db)):
    """
    Consolida todos los productos para usar brand_id en lugar del campo legacy brand.

    Esta migración:
    1. Para productos con brand (string) pero sin brand_id: busca/crea la marca y asigna brand_id
    2. Limpia el campo legacy 'brand' de todos los productos

    Es seguro ejecutar múltiples veces (idempotente).
    """
    from app.models import Product, Brand
    from sqlalchemy import func

    results = {
        "status": "success",
        "before": {},
        "after": {},
        "actions": []
    }

    try:
        # Estado antes de la migración
        total_products = db.query(Product).count()
        with_brand_string = db.query(Product).filter(
            Product.brand.isnot(None),
            Product.brand != ''
        ).count()
        with_brand_id = db.query(Product).filter(
            Product.brand_id.isnot(None)
        ).count()

        results["before"] = {
            "total_products": total_products,
            "with_brand_string": with_brand_string,
            "with_brand_id": with_brand_id
        }

        # Paso 1: Migrar productos con brand string pero sin brand_id
        products_to_migrate = db.query(Product).filter(
            Product.brand.isnot(None),
            Product.brand != '',
            Product.brand_id.is_(None)
        ).all()

        brands_created = 0
        products_migrated = 0

        for product in products_to_migrate:
            brand_name = product.brand.strip()

            # Buscar marca existente (case-insensitive)
            existing_brand = db.query(Brand).filter(
                func.lower(Brand.name) == func.lower(brand_name)
            ).first()

            if existing_brand:
                product.brand_id = existing_brand.id
            else:
                # Crear nueva marca
                new_brand = Brand(name=brand_name, is_active=True)
                db.add(new_brand)
                db.flush()
                product.brand_id = new_brand.id
                brands_created += 1

            products_migrated += 1

        results["actions"].append({
            "step": "migrate_to_brand_id",
            "products_migrated": products_migrated,
            "brands_created": brands_created
        })

        # Paso 2: Limpiar campo legacy brand de todos los productos
        products_with_brand = db.query(Product).filter(
            Product.brand.isnot(None),
            Product.brand != ''
        ).all()

        cleared_count = 0
        for product in products_with_brand:
            product.brand = None
            cleared_count += 1

        results["actions"].append({
            "step": "clear_legacy_brand",
            "products_cleared": cleared_count
        })

        db.commit()

        # Estado después de la migración
        with_brand_string_after = db.query(Product).filter(
            Product.brand.isnot(None),
            Product.brand != ''
        ).count()
        with_brand_id_after = db.query(Product).filter(
            Product.brand_id.isnot(None)
        ).count()

        results["after"] = {
            "total_products": total_products,
            "with_brand_string": with_brand_string_after,
            "with_brand_id": with_brand_id_after
        }

        results["summary"] = f"Migración completada: {products_migrated} productos migrados, {brands_created} marcas creadas, {cleared_count} campos legacy limpiados"

    except Exception as e:
        db.rollback()
        results["status"] = "error"
        results["error"] = str(e)
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")

    return results
