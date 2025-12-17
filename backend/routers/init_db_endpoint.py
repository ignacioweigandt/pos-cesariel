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
