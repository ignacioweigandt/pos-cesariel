"""
Aplicación principal del backend POS Cesariel.

Este es el punto de entrada de la API FastAPI que configura y orquesta
todos los componentes del sistema: middleware, routers, autenticación,
base de datos y comunicación en tiempo real.

Arquitectura del sistema:
    ┌─────────────────────────────────────────────┐
    │  Clientes (POS Admin + E-commerce)          │
    └─────────────────┬───────────────────────────┘
                      │ HTTP/WebSocket
    ┌─────────────────▼───────────────────────────┐
    │  FastAPI App (main.py)                      │
    │  ├─ CORS Middleware                         │
    │  ├─ Rate Limiting                           │
    │  ├─ Authentication (JWT)                    │
    │  └─ Routers (endpoints modulares)           │
    └─────────────────┬───────────────────────────┘
                      │
    ┌─────────────────▼───────────────────────────┐
    │  Capa de Negocio (Services + Repositories)  │
    └─────────────────┬───────────────────────────┘
                      │
    ┌─────────────────▼───────────────────────────┐
    │  PostgreSQL Database                        │
    └─────────────────────────────────────────────┘

Módulos del sistema:
    - Auth: Autenticación JWT y gestión de sesiones
    - Users & Branches: Administración multi-tenant
    - Products & Categories: Inventario y catálogo
    - Sales & Reports: POS y analytics
    - E-commerce: API pública para tienda online
    - WebSockets: Sincronización en tiempo real
    - Config: Configuración global del sistema

Características clave:
    - Multi-tenant por sucursal (branch-based isolation)
    - Role-based access control (ADMIN, MANAGER, SELLER, ECOMMERCE)
    - Real-time updates via WebSockets
    - Rate limiting para prevenir abuso
    - CORS configurado para dual frontend
    - Migraciones de BD con Alembic

Deployments:
    - Desarrollo: localhost:8000 con auto-reload
    - Docker: Orquestado con docker-compose (backend + db + frontend)
    - Producción: Railway/Render con PostgreSQL managed

Example:
    # Ejecutar servidor de desarrollo
    python main.py
    
    # Con uvicorn directamente
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    
    # En Docker
    docker compose up backend

Note:
    Este archivo debe ser liviano y solo orquestar componentes.
    La lógica de negocio va en services/, los endpoints en routers/.
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import os
import json
import re

# Configuración de base de datos y aplicación
from database import engine, Base
from config.settings import settings
from config.rate_limit import limiter, rate_limit_exceeded_handler, RateLimits
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Routers modulares del sistema organizados por dominio
from routers import (
    auth,                  # /auth/* - Login, logout, validación de tokens
    branches,              # /branches/* - Gestión de sucursales
    users,                 # /users/* - CRUD usuarios, roles, permisos
    categories,            # /categories/* - Categorización de productos
    brands,                # /brands/* - Gestión de marcas
    products,              # /products/* - CRUD productos, stock, talles
    sales,                 # /sales/* - Ventas POS (legacy endpoints)
    reports,               # /reports/* - Reportes y analytics (Clean Architecture)
    websockets,            # /ws/* - WebSockets para sincronización real-time
    config,                # /config/* - Configuración del sistema
    ecommerce_advanced,    # /ecommerce-advanced/* - Admin e-commerce (protegido)
    ecommerce_public,      # /ecommerce/* - API pública tienda online (sin auth)
    content_management,    # /content/* - Gestión de banners y contenido CMS
    notifications,         # /notifications/* - Sistema de notificaciones
    init_db_endpoint       # /api/init/* - Inicialización de base de datos
)


# ===== MIGRACIONES DE BASE DE DATOS =====

# IMPORTANTE: Estrategia de migraciones según entorno
#
# Desarrollo (ENV=development):
#   - Auto-crear tablas con Base.metadata.create_all()
#   - Rápido para prototipar, pero no maneja cambios de esquema
#
# Producción (ENV=production):
#   - NUNCA usar create_all() - no maneja migraciones
#   - Usar Alembic para migraciones controladas:
#       docker compose exec backend alembic upgrade head
#
# Ver: backend/alembic/ y MIGRATIONS.md para más información

if os.getenv("ENVIRONMENT", "development") == "development":
    # Modo desarrollo: Auto-crear tablas si no existen
    Base.metadata.create_all(bind=engine)
else:
    # Modo producción: Advertir que se debe usar Alembic
    print("⚠️  PRODUCCIÓN: Ejecutar 'alembic upgrade head' para aplicar migraciones")


# ===== MIDDLEWARE PERSONALIZADO =====

class DateTimeMiddleware(BaseHTTPMiddleware):
    """
    Middleware que agrega 'Z' a todos los datetime en las respuestas JSON.
    
    Solución al problema de timezone:
        - Backend guarda datetime sin timezone (naive datetime)
        - JavaScript interpreta datetime sin 'Z' como hora local
        - Este middleware agrega 'Z' para indicar que es UTC
        
    Regex pattern:
        Busca strings en formato ISO 8601: "2026-02-14T23:17:35.840854"
        Y agrega 'Z' al final: "2026-02-14T23:17:35.840854Z"
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Solo procesar respuestas JSON
        if response.headers.get("content-type", "").startswith("application/json"):
            # Leer el body
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            
            try:
                # Decodificar JSON
                body_str = body.decode()
                
                # Regex para encontrar datetime ISO 8601 SIN timezone
                # Formato: "YYYY-MM-DDTHH:MM:SS.ffffff" (sin Z al final)
                pattern = r'"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)"'
                
                # Agregar 'Z' a todos los datetime encontrados
                modified_body = re.sub(pattern, r'"\1Z"', body_str)
                
                # Actualizar Content-Length header
                headers = dict(response.headers)
                headers['content-length'] = str(len(modified_body.encode()))
                
                # Crear nueva respuesta con body modificado
                return Response(
                    content=modified_body,
                    status_code=response.status_code,
                    headers=headers,
                    media_type=response.media_type
                )
            except:
                # Si falla, devolver respuesta original
                return Response(
                    content=body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.media_type
                )
        
        return response


class OptionsMiddleware(BaseHTTPMiddleware):
    """
    Middleware que maneja peticiones OPTIONS para CORS preflight.
    
    CORS preflight:
        Antes de una petición HTTP "no simple" (PUT, DELETE, custom headers),
        el navegador envía una petición OPTIONS para verificar que el servidor
        permite esa operación desde ese origen.
    
    Este middleware:
        - Intercepta TODAS las peticiones OPTIONS
        - Responde con headers CORS apropiados sin procesar la petición
        - Previene errores de CORS en operaciones complejas
    
    Headers importantes:
        - Access-Control-Allow-Origin: Origen que puede hacer la petición
        - Access-Control-Allow-Methods: Métodos HTTP permitidos
        - Access-Control-Allow-Headers: Headers personalizados permitidos
        - Access-Control-Max-Age: Tiempo de cache de la respuesta (24h)
    
    Note:
        Este middleware debe agregarse ANTES de CORSMiddleware para
        interceptar OPTIONS antes de que llegue a los routers.
    """
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            # Responder directamente a preflight sin procesar request
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers", "*"),
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "86400",  # Cache por 24 horas
                }
            )
        
        # Para métodos no-OPTIONS, continuar con la request normal
        response = await call_next(request)
        return response


# ===== APLICACIÓN FASTAPI =====

# Crear instancia principal de FastAPI con configuración centralizada
app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    
    # Documentación interactiva (Swagger UI y ReDoc)
    # Solo disponible en modo debug por seguridad
    docs_url="/docs" if settings.debug_mode else None,
    redoc_url="/redoc" if settings.debug_mode else None,
    
    # Modo debug: Habilita logs detallados y auto-reload
    debug=settings.debug_mode
)


# ===== RATE LIMITING =====

# Configurar rate limiting para prevenir abuso de API
# 
# Límites definidos en config/rate_limit.py:
#   - Login: 5 intentos por minuto (previene brute force)
#   - API general: 100 requests por minuto por IP
#   - Búsquedas: 30 por minuto (operaciones costosas)
#
# Ver: config/rate_limit.py para configuración detallada

# Adjuntar limiter al estado de la app para acceso en endpoints
app.state.limiter = limiter

# Registrar handler para errores de rate limit (429 Too Many Requests)
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Agregar middleware de rate limiting
app.add_middleware(SlowAPIMiddleware)


# ===== MIDDLEWARE STACK =====

# IMPORTANTE: El orden de middleware importa (se ejecutan de arriba hacia abajo)
#
# Orden actual:
#   1. SlowAPIMiddleware (rate limiting) - Primero para prevenir abuso
#   2. DateTimeMiddleware (timezone fix) - Agregar 'Z' a datetime en JSON
#   3. OptionsMiddleware (CORS preflight) - Antes de CORS principal
#   4. CORSMiddleware (CORS completo) - Headers para todos los requests

# 1. Middleware de timezone para datetime
app.add_middleware(DateTimeMiddleware)

# 2. Middleware de OPTIONS para CORS preflight
app.add_middleware(OptionsMiddleware)

# 3. Middleware de CORS para comunicación frontend-backend
#
# Configuración multi-frontend:
#   - POS Admin: localhost:3000 (dev) + frontend:3000 (Docker) + Railway URL
#   - E-commerce: localhost:3001 (dev) + ecommerce:3001 (Docker) + Railway URL
#
# Seguridad:
#   - allow_credentials=True: Permite enviar cookies y Authorization header
#   - allow_origins: DEBE ser lista específica (no "*") cuando credentials=True
#   - En producción: Agregar dominios reales, eliminar localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Desarrollo local
        "http://localhost:3000",       # POS Admin frontend
        "http://localhost:3001",       # E-commerce frontend
        
        # Docker containers
        "http://frontend:3000",        # POS Admin container
        "http://ecommerce:3001",       # E-commerce container
        
        # Producción Railway (actualizar con tus URLs reales)
        "https://frontend-pos-production.up.railway.app",
        "https://e-commerce-production-3634.up.railway.app",
    ],
    allow_credentials=True,   # Permite cookies y auth headers (requiere orígenes específicos)
    allow_methods=["*"],      # Todos los métodos HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],      # Todos los headers (Authorization, Content-Type, etc.)
    expose_headers=["*"],     # Exponer todos los headers en la respuesta
)


# ===== REGISTRO DE ROUTERS =====

# Routers organizados por dominio funcional
# Cada router maneja un conjunto específico de endpoints
# Ver: routers/ para implementación de cada módulo

# === CORE: Autenticación y Usuarios ===
app.include_router(auth.router)           # /auth/*
app.include_router(branches.router)       # /branches/*
app.include_router(users.router)          # /users/*

# === CATÁLOGO: Productos y Clasificación ===
app.include_router(categories.router)     # /categories/*
app.include_router(brands.router)         # /brands/*
app.include_router(products.router)       # /products/*

# === OPERACIONES: Ventas y Reportes ===
app.include_router(sales.router)          # /sales/* (legacy)
app.include_router(reports.router)        # /reports/* (Clean Architecture)

# === TIEMPO REAL: WebSockets ===
app.include_router(websockets.router)     # /ws/{branch_id}

# === CONFIGURACIÓN: Sistema y Notificaciones ===
app.include_router(config.router)         # /config/*
app.include_router(notifications.router)  # /notifications/*
app.include_router(init_db_endpoint.router)  # /api/init/*

# === E-COMMERCE: API Pública y Admin ===
app.include_router(ecommerce_advanced.router)  # /ecommerce-advanced/* (protegido)
app.include_router(ecommerce_public.router)    # /ecommerce/* (público, sin auth)
app.include_router(content_management.router)  # /content/*


# ===== ENDPOINTS PRINCIPALES DEL SISTEMA =====

@app.get("/", tags=["Sistema"])
async def root():
    """
    Endpoint raíz - Información general del sistema.
    
    Proporciona un overview rápido de las características del sistema
    y enlaces a la documentación de la API.
    
    Returns:
        dict: Información del sistema, versión, features y enlaces útiles
    
    Example:
        GET http://localhost:8000/
        
        Response:
        {
            "message": "Backend POS Cesariel funcionando correctamente",
            "version": "1.0.0",
            "features": [...],
            "api_docs": "/docs"
        }
    """
    return {
        "message": "Backend POS Cesariel funcionando correctamente",
        "version": settings.app_version,
        "environment": settings.environment,
        "features": [
            "🔐 Autenticación JWT con roles (ADMIN, MANAGER, SELLER, ECOMMERCE)",
            "🏢 Gestión multisucursal con aislamiento de datos",
            "👥 Administración de usuarios y permisos granulares",
            "📦 Inventario centralizado con stock por sucursal",
            "💰 Ventas POS y E-commerce con sincronización",
            "📊 Reportes avanzados y dashboard en tiempo real",
            "⚡ WebSockets para actualizaciones instantáneas",
            "📏 Sistema de talles flexible por producto",
            "🛒 E-commerce completo con carrito y checkout",
            "🎨 CMS para banners y contenido visual",
            "📱 Integración WhatsApp para ventas directas",
            "🌐 Configuración de redes sociales"
        ],
        "api_docs": "/docs" if settings.debug_mode else "Documentación deshabilitada en producción"
    }


@app.get("/health", tags=["Sistema"])
async def health_check():
    """
    Health check endpoint - Verificación de salud del sistema.
    
    Usado por:
        - Docker health checks (docker-compose.yml)
        - Kubernetes liveness/readiness probes
        - Monitoreo externo (Pingdom, UptimeRobot, etc.)
        - Load balancers para verificar instancia sana
    
    Returns:
        dict: Estado del sistema (healthy/unhealthy), configuración básica
    
    Example:
        GET http://localhost:8000/health
        
        Response:
        {
            "status": "healthy",
            "service": "Backend POS Cesariel",
            "version": "1.0.0",
            "environment": "production",
            "database_configured": true
        }
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
    Database connectivity test - Prueba de conexión a PostgreSQL.
    
    Ejecuta una query simple (SELECT 1) para verificar que:
        - PostgreSQL está corriendo y accesible
        - Las credenciales son correctas
        - El pool de conexiones funciona
        - No hay problemas de red o firewall
    
    Útil para:
        - Debugging de problemas de conexión
        - Verificación post-deployment
        - CI/CD health checks
    
    Returns:
        dict: Estado de conexión (ok/error), información de BD
    
    Example:
        GET http://localhost:8000/db-test
        
        Response OK:
        {
            "status": "ok",
            "message": "Conexión a base de datos exitosa",
            "database_host": "db",
            "database_name": "pos_cesariel"
        }
        
        Response Error:
        {
            "status": "error",
            "message": "Error de conexión: connection refused"
        }
    """
    try:
        from database import get_db
        from sqlalchemy import text
        
        # Obtener sesión y ejecutar query simple
        db = next(get_db())
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


# ===== PUNTO DE ENTRADA =====

# Entry point para ejecutar el servidor directamente
# En producción se usa Gunicorn/Uvicorn workers desde CLI

if __name__ == "__main__":
    import uvicorn
    
    # Logs de inicio
    print(f"🚀 Iniciando {settings.app_name} v{settings.app_version}")
    print(f"🌐 Entorno: {settings.environment}")
    print(f"🗄️  Base de datos: {settings.db_host}:{settings.db_port}/{settings.db_name}")
    print(f"📡 Servidor: http://{settings.host}:{settings.port}")
    
    if settings.debug_mode:
        print(f"📚 Docs: http://{settings.host}:{settings.port}/docs")
    
    # Ejecutar servidor Uvicorn con configuración desde settings
    uvicorn.run(
        "main:app",                      # Aplicación FastAPI a correr
        host=settings.host,              # IP donde escuchar (0.0.0.0 = todas)
        port=settings.port,              # Puerto HTTP (default: 8000)
        reload=settings.debug_mode,      # Auto-reload en cambios de código (solo dev)
        log_level="debug" if settings.debug_mode else "info"  # Nivel de logging
    )
