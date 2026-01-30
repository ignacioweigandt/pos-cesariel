"""
Paquete de Routers - Capa de API (Endpoints HTTP).

Implementa endpoints FastAPI para toda la aplicación.
Capa más externa que expone la API REST al mundo.

Arquitectura:
    HTTP Request → Routers → Services → Repositories → Database

Routers Disponibles (15):
    - auth.py: Autenticación (login, logout, /me)
    - users.py: Gestión de usuarios
    - branches.py: Gestión de sucursales (multi-tenant)
    - categories.py: Categorías de productos
    - brands.py: Marcas de productos
    - products.py: CRUD productos + stock + import Excel
    - sales.py: Ventas POS/Ecommerce/WhatsApp
    - reports.py: Reportes y analíticas empresariales
    - notifications.py: Sistema de notificaciones
    - config.py: Configuraciones globales y de sistema
    - content_management.py: Banners, RRSS, contenido
    - ecommerce_public.py: API pública de storefront (SIN auth)
    - ecommerce_advanced.py: Backoffice ecommerce (CON auth)
    - websockets.py: WebSocket para tiempo real
    - init_db_endpoint.py: Inicialización de BD

Responsabilidades de los Routers:
    - Validación de entrada (Pydantic schemas)
    - Autenticación y autorización (JWT dependencies)
    - Manejo de errores HTTP
    - Serialización de respuestas
    - Delegación a Services para lógica de negocio
    - Rate limiting (donde aplica)
    - Logging de requests

Patrones Comunes:
    - Dependency injection (get_db, get_current_user)
    - Response models (Pydantic schemas)
    - HTTPException para errores
    - Filtros opcionales con Query params
    - Paginación con skip/limit
    - Permisos con decoradores (require_admin, etc.)

Seguridad:
    - JWT authentication en mayoría de endpoints
    - Role-based access control (ADMIN, MANAGER, SELLER)
    - Rate limiting en endpoints críticos
    - Validación de permisos multi-tenant

Endpoints Públicos (SIN auth):
    - POST /auth/login
    - POST /auth/login-json
    - GET /ecommerce/* (storefront público)
    - POST /api/init/database (solo desarrollo)

Registro en main.py:
    Todos los routers se registran en backend/main.py con app.include_router()
"""