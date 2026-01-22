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
