"""
Aplicación principal del backend POS Cesariel.

Esta es la aplicación FastAPI principal que configura el servidor,
middleware, rutas y conexión a base de datos para el sistema POS.

El sistema POS Cesariel es una solución completa que incluye:
- Backend API con FastAPI para operaciones CRUD y lógica de negocio
- Frontend administrativo (Next.js) para gestión de inventario, ventas y usuarios
- Frontend e-commerce (Next.js) para tienda online integrada
- Base de datos PostgreSQL con SQLAlchemy ORM
- Sistema de autenticación JWT con roles diferenciados
- Comunicación en tiempo real via WebSockets
- Integración con servicios de terceros (Cloudinary, WhatsApp)

Arquitectura:
- API REST: Endpoints organizados por módulos funcionales
- Multi-tenant: Soporte para múltiples sucursales
- Role-based access: Admin, Manager, Seller, E-commerce
- Real-time sync: Inventario sincronizado entre POS y e-commerce
"""

# Importaciones principales de FastAPI
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import os

# Configuración de base de datos y aplicación
from database import engine, Base
from config.settings import settings

# Importación de todos los routers modulares del sistema
from routers import (
    auth,                  # Autenticación JWT y gestión de sesiones
    branches,              # Gestión de sucursales multisede
    users,                 # Administración de usuarios y permisos
    categories,            # Categorización de productos
    brands,                # Gestión de marcas de productos
    products,              # CRUD de productos, inventario y stock
    sales,                 # Ventas, reportes y analytics
    websockets,            # Comunicación en tiempo real
    config,                # Configuración general del sistema
    ecommerce_advanced,    # Funcionalidades avanzadas de e-commerce
    ecommerce_public,      # API pública para la tienda online
    content_management,    # Gestión de contenido y banners
    notifications,         # Sistema de notificaciones
    init_db_endpoint       # Inicialización de base de datos
)

# Inicialización automática de la base de datos
# Crea todas las tablas definidas en models.py si no existen
Base.metadata.create_all(bind=engine)

# Middleware personalizado para manejar peticiones OPTIONS (CORS preflight)
class OptionsMiddleware(BaseHTTPMiddleware):
    """Middleware que maneja todas las peticiones OPTIONS para CORS preflight"""
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            # Responder directamente a OPTIONS con headers CORS apropiados
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers", "*"),
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "86400",  # 24 horas
                }
            )
        response = await call_next(request)
        return response



# Crear la instancia principal de FastAPI con configuración centralizada
# La configuración se obtiene desde config/settings.py basada en variables de entorno
app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    docs_url="/docs" if settings.debug_mode else None,  # Swagger UI solo en desarrollo
    redoc_url="/redoc" if settings.debug_mode else None,  # ReDoc solo en desarrollo
    debug=settings.debug_mode  # Habilita logs detallados y recarga automática
)

# IMPORTANTE: Agregar middleware personalizado de OPTIONS PRIMERO para interceptar preflight requests
app.add_middleware(OptionsMiddleware)

# Configuración de middleware CORS para comunicación entre frontend y backend
# Permite las solicitudes desde los dos frontends del sistema (POS admin y E-commerce)
# NOTA: No se puede usar "*" con allow_credentials=True, por eso listamos orígenes específicos
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # POS Frontend administrativo en desarrollo local
        "http://frontend:3000",   # POS Frontend administrativo en contenedor Docker
        "http://localhost:3001",  # E-commerce frontend en desarrollo local
        "http://ecommerce:3001",  # E-commerce frontend en contenedor Docker
        "https://frontend-pos-production.up.railway.app",  # POS Frontend en Railway PRODUCCIÓN
        "https://e-commerce-production-3634.up.railway.app",  # E-commerce en Railway PRODUCCIÓN
    ],
    allow_credentials=True,  # Permitir cookies y headers de autenticación (REQUIERE orígenes específicos)
    allow_methods=["*"],  # Permitir todos los métodos HTTP (incluye OPTIONS para CORS preflight)
    allow_headers=["*"],  # Headers permitidos (Authorization, Content-Type, etc.)
    expose_headers=["*"],  # Exponer todos los headers en la respuesta
)

# Registro de routers modulares - Cada router maneja un conjunto específico de endpoints
# Los routers están organizados por funcionalidad para mantener el código modular y escalable

# ===== ROUTERS CORE DEL SISTEMA =====
app.include_router(auth.router)           # /auth/* - Login, logout, verificación de tokens
app.include_router(branches.router)       # /branches/* - Gestión de sucursales multisede
app.include_router(users.router)          # /users/* - CRUD usuarios, permisos, roles
app.include_router(categories.router)     # /categories/* - Categorización de productos
app.include_router(brands.router)         # /brands/* - Gestión de marcas de productos

# ===== ROUTERS DE INVENTARIO Y VENTAS =====
app.include_router(products.router)       # /products/* - CRUD productos, stock, talles, importación
app.include_router(sales.router)          # /sales/* - Ventas POS, reportes, dashboard

# ===== COMUNICACIÓN EN TIEMPO REAL =====
app.include_router(websockets.router)     # WebSockets para sincronización en tiempo real

# ===== CONFIGURACIÓN Y ADMINISTRACIÓN =====
app.include_router(config.router)         # /config/* - Configuración general del sistema
app.include_router(notifications.router)  # /notifications/* - Sistema de notificaciones
app.include_router(init_db_endpoint.router)  # /api/init/* - Inicialización de base de datos

# ===== E-COMMERCE INTEGRADO =====
app.include_router(ecommerce_advanced.router)  # /ecommerce-advanced/* - Admin e-commerce con autenticación
app.include_router(ecommerce_public.router)    # /ecommerce/* - API pública para tienda online
app.include_router(content_management.router)  # /content/* - Gestión de banners y contenido CMS

# Rutas principales del sistema
@app.get("/", tags=["Sistema"])
async def root():
    """
    Endpoint raíz que proporciona información general del sistema.
    
    Returns:
        dict: Información sobre el sistema y sus características principales
    """
    return {
        "message": "Backend POS Cesariel funcionando correctamente",
        "version": settings.app_version,
        "environment": settings.environment,
        "features": [
            "🔐 Autenticación JWT con roles",
            "🏢 Gestión multisucursal",
            "👥 Administración de usuarios",
            "📦 Inventario centralizado",
            "💰 Ventas POS y E-commerce",
            "📊 Reportes y dashboard",
            "⚡ WebSockets en tiempo real",
            "📏 Sistema de talles multisucursal",
            "🛒 E-commerce avanzado con imágenes",
            "🎨 Gestión de banners y contenido",
            "📱 Integración WhatsApp",
            "🌐 Configuración de redes sociales"
        ],
        "api_docs": "/docs" if settings.debug_mode else "No disponible en producción"
    }


@app.get("/health", tags=["Sistema"])
async def health_check():
    """
    Endpoint de verificación de salud del sistema.
    
    Returns:
        dict: Estado de salud del sistema incluyendo conectividad de BD
    """
    return {
        "status": "healthy", 
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "database_configured": bool(settings.database_url),
        "timestamp": os.environ.get("START_TIME", "No disponible")
    }


@app.get("/db-test", tags=["Sistema"])
async def test_database():
    """
    Endpoint para probar la conectividad con la base de datos.
    
    Returns:
        dict: Resultado de la prueba de conexión a la BD
    """
    try:
        from database import get_db
        from sqlalchemy import text
        
        db = next(get_db())
        # Probar conexión ejecutando una consulta simple
        result = db.execute(text("SELECT 1"))
        db.close()
        
        return {
            "status": "ok",
            "message": "Conexión a base de datos exitosa",
            "database_host": settings.db_host,
            "database_name": settings.db_name,
            "timestamp": settings.get_current_timestamp() if hasattr(settings, 'get_current_timestamp') else None
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error de conexión a base de datos: {str(e)}",
            "database_configured": bool(settings.database_url)
        }


# Punto de entrada para ejecutar el servidor
if __name__ == "__main__":
    import uvicorn
    
    print(f"🚀 Iniciando {settings.app_name} v{settings.app_version}")
    print(f"🌐 Entorno: {settings.environment}")
    print(f"🗄️  Base de datos: {settings.db_host}:{settings.db_port}")
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug_mode,
        log_level="debug" if settings.debug_mode else "info"
    )
