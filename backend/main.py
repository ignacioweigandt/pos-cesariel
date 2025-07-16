from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from database import engine, Base
from routers import auth, branches, users, categories, products, sales, websockets, config, ecommerce_advanced, ecommerce_public, content_management

# Cargar variables de entorno
load_dotenv()

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la instancia de FastAPI
app = FastAPI(
    title="Backend POS Cesariel",
    description="API para el sistema de punto de venta multisucursal con e-commerce",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # POS Frontend en desarrollo
        "http://frontend:3000",   # POS Frontend en Docker
        "http://localhost:3001",  # E-commerce en desarrollo
        "http://ecommerce:3001",  # E-commerce en Docker
        "*"  # En desarrollo, permitir todos los orígenes
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(branches.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(websockets.router)
app.include_router(config.router)
app.include_router(ecommerce_advanced.router)
app.include_router(ecommerce_public.router)
app.include_router(content_management.router)

# Ruta de prueba
@app.get("/")
async def root():
    return {
        "message": "Backend POS Cesariel funcionando correctamente",
        "features": [
            "Autenticación JWT",
            "Gestión de sucursales",
            "Gestión de usuarios",
            "Inventario centralizado",
            "Ventas POS y E-commerce",
            "Reportes y dashboard",
            "WebSockets en tiempo real",
            "Sistema de talles multisucursal",
            "E-commerce avanzado con imágenes",
            "Gestión de banners",
            "Ventas WhatsApp",
            "Configuración de redes sociales"
        ]
    }

# Ruta de health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "Backend POS Cesariel",
        "database_url": os.getenv("DATABASE_URL", "No configurada"),
        "environment": os.getenv("ENV", "No configurado")
    }

# Ruta de prueba de base de datos
@app.get("/db-test")
async def test_database():
    try:
        from database import get_db
        db = next(get_db())
        # Probar conexión ejecutando una consulta simple
        from sqlalchemy import text
        result = db.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "message": "Conexión a base de datos exitosa",
            "database_url": os.getenv("DATABASE_URL", "No configurada")
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error de conexión: {str(e)}"
        }

# Ruta de dashboard stats (redirección a sales/reports/dashboard)
@app.get("/dashboard/stats")
async def dashboard_stats_redirect():
    from fastapi import Depends
    from sqlalchemy.orm import Session
    from database import get_db
    from auth import get_current_active_user
    from models import User
    from routers.sales import get_dashboard_stats
    
    # Esta es una función wrapper que redirige a la función real
    return {"message": "Use /sales/reports/dashboard endpoint instead"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=os.getenv("HOST", "0.0.0.0"), 
        port=int(os.getenv("PORT", 8000))
    )
