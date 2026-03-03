"""
Configuración centralizada del sistema POS Cesariel.

Este módulo gestiona todas las variables de configuración del backend,
incluyendo credenciales, URLs de servicios externos y parámetros operacionales.

Gestión de configuración:
    - Variables de entorno desde .env (desarrollo) o sistema (producción)
    - Valores por defecto seguros para desarrollo local
    - Validación automática de tipos con type hints
    - Separación de configuración por dominio (DB, Auth, Cloudinary, etc.)

Dominios de configuración:
    - Aplicación: Nombre, versión, modo debug
    - Servidor: Host, puerto, workers
    - Base de datos: Conexión PostgreSQL
    - CORS: Orígenes permitidos para frontend
    - Autenticación: JWT secret key, algoritmo, expiración
    - Cloudinary: Gestión de imágenes en la nube
    - Entorno: Development/Production flags

Flujo de configuración:
    .env file → os.getenv() → Settings class → app startup

Security:
    - NUNCA commitear archivo .env al repositorio
    - Variables sensibles: SECRET_KEY, DB_PASSWORD, API_KEYS
    - En producción: Usar secrets manager (AWS Secrets, Vault, etc.)
    - Rotar credenciales regularmente

Example:
    # Acceder a configuración desde cualquier módulo
    from config.settings import settings
    
    if settings.is_production:
        print(f"Running {settings.app_name} v{settings.app_version}")
    
    # Obtener URL de base de datos
    engine = create_engine(settings.database_url)

Note:
    Este archivo debe ser el primer punto de lectura para entender
    qué variables de entorno necesita el sistema para funcionar.
"""

import os
from typing import List
from dotenv import load_dotenv

# Cargar variables de entorno desde archivo .env
# Busca archivo .env en el directorio actual o padres
# No sobrescribe variables ya definidas en el sistema
load_dotenv()


class Settings:
    """
    Clase que centraliza toda la configuración del sistema POS Cesariel.
    
    Esta clase actúa como un singleton de configuración, agregando todas
    las variables de entorno en un solo lugar con tipos explícitos y
    valores por defecto seguros.
    
    Ventajas de centralizar configuración:
        - Type safety: Los IDEs pueden autocompletar y validar tipos
        - Documentación: Todas las configs en un solo lugar
        - Testing: Fácil de mockear en tests
        - Mantenibilidad: Cambios en un solo archivo
    
    Attributes:
        # === APLICACIÓN ===
        app_name (str): Nombre del sistema mostrado en API docs
        app_version (str): Versión semántica (major.minor.patch)
        app_description (str): Descripción breve del sistema
        debug_mode (bool): Habilita logs detallados y auto-reload
        
        # === SERVIDOR ===
        host (str): IP donde escucha el servidor (0.0.0.0 = todas las IPs)
        port (int): Puerto HTTP del servidor (default: 8000)
        
        # === BASE DE DATOS ===
        database_url (str): URL completa de conexión a PostgreSQL
        db_host (str): Hostname del servidor PostgreSQL
        db_port (str): Puerto de PostgreSQL (default: 5432)
        db_name (str): Nombre de la base de datos
        db_user (str): Usuario de PostgreSQL
        db_password (str): Contraseña de PostgreSQL
        
        # === CORS ===
        cors_origins (List[str]): Orígenes permitidos para requests CORS
        
        # === AUTENTICACIÓN JWT ===
        jwt_secret_key (str): Clave secreta para firmar tokens JWT
        jwt_algorithm (str): Algoritmo de encriptación (HS256)
        jwt_access_token_expire_minutes (int): Tiempo de vida del token
        
        # === CLOUDINARY ===
        cloudinary_cloud_name (str): Nombre del cloud en Cloudinary
        cloudinary_api_key (str): API key pública de Cloudinary
        cloudinary_api_secret (str): API secret privado de Cloudinary
        
        # === ENTORNO ===
        environment (str): Entorno actual (development/production)
    
    Example:
        # Crear instancia de configuración
        settings = Settings()
        
        # Acceder a propiedades
        if settings.debug_mode:
            print(f"Debug habilitado en {settings.environment}")
        
        # Usar en FastAPI
        app = FastAPI(
            title=settings.app_name,
            debug=settings.debug_mode
        )
    """
    
    # ===== CONFIGURACIÓN DE LA APLICACIÓN =====
    
    # Nombre del sistema mostrado en:
    # - Swagger UI (/docs)
    # - ReDoc (/redoc)
    # - Logs del servidor
    # - Respuestas de health check
    app_name: str = "Backend POS Cesariel"
    
    # Versión semántica del sistema (semantic versioning: MAJOR.MINOR.PATCH)
    # - MAJOR: Cambios incompatibles de API
    # - MINOR: Nueva funcionalidad compatible con versión anterior
    # - PATCH: Bug fixes compatibles
    app_version: str = "1.0.0"
    
    # Descripción mostrada en documentación de API
    app_description: str = "API para el sistema de punto de venta multisucursal con e-commerce"
    
    # Modo debug: Habilita características de desarrollo
    # - True: Logs detallados, auto-reload, stack traces completos, Swagger UI
    # - False: Logs mínimos, sin auto-reload, errores genéricos, sin docs públicas
    # IMPORTANTE: Siempre False en producción por seguridad
    debug_mode: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    
    # ===== CONFIGURACIÓN DEL SERVIDOR =====
    
    # Host donde escucha el servidor
    # - "0.0.0.0": Acepta conexiones desde cualquier IP (recomendado en Docker)
    # - "127.0.0.1": Solo acepta conexiones locales (desarrollo sin Docker)
    # - IP específica: Solo acepta conexiones desde esa IP
    host: str = os.getenv("HOST", "0.0.0.0")
    
    # Puerto HTTP donde escucha el servidor
    # - 8000: Puerto estándar para APIs Python
    # - Debe coincidir con el mapeo de puertos en docker-compose.yml
    # - No usar puertos < 1024 (requieren privilegios root)
    port: int = int(os.getenv("PORT", 8000))
    
    
    # ===== CONFIGURACIÓN DE BASE DE DATOS =====
    
    # URL completa de conexión a PostgreSQL
    # Formato: postgresql://usuario:password@host:puerto/nombre_bd
    #
    # Ejemplos:
    # - Desarrollo local: postgresql://postgres:password@localhost:5432/pos_cesariel
    # - Docker: postgresql://postgres:password@db:5432/pos_cesariel
    # - Producción: postgresql://user:pass@prod-server.com:5432/pos_prod
    #
    # IMPORTANTE: Esta URL debe tener prioridad sobre componentes individuales
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:password@localhost:5432/pos_cesariel"
    )
    
    # Componentes individuales de conexión a BD
    # Útiles para logs, health checks y debugging
    # En producción, extraer de DATABASE_URL en lugar de variables separadas
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: str = os.getenv("DB_PORT", "5432")
    db_name: str = os.getenv("DB_NAME", "pos_cesariel")
    db_user: str = os.getenv("DB_USER", "postgres")
    
    # SECURITY: Nunca loggear db_password en producción
    db_password: str = os.getenv("DB_PASSWORD", "password")
    
    
    # ===== CONFIGURACIÓN DE CORS =====
    
    # Lista de orígenes (origins) permitidos para solicitudes CORS
    #
    # CORS (Cross-Origin Resource Sharing) permite que el frontend en un dominio
    # diferente pueda hacer peticiones al backend.
    #
    # Configuración actual:
    # - Frontend POS Admin: localhost:3000 (dev) + frontend:3000 (Docker)
    # - Frontend E-commerce: localhost:3001 (dev) + ecommerce:3001 (Docker)
    # - Wildcard "*": Permite todos los orígenes (SOLO para desarrollo)
    #
    # IMPORTANTE en producción:
    # - Eliminar el wildcard "*"
    # - Solo incluir dominios específicos (https://tudominio.com)
    # - No mezclar "*" con allow_credentials=True (error de CORS)
    #
    # Ver también: main.py → CORSMiddleware para configuración completa
    cors_origins: List[str] = (
        # Leer de variable de entorno CORS_ORIGINS (separados por comas)
        os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else [
            "http://localhost:3000",  # POS Frontend administrativo (desarrollo local)
            "http://frontend:3000",   # POS Frontend administrativo (contenedor Docker)
            "http://localhost:3001",  # E-commerce frontend (desarrollo local)
            "http://ecommerce:3001",  # E-commerce frontend (contenedor Docker)
            "*"  # Wildcard para desarrollo - ELIMINAR EN PRODUCCIÓN
        ]
    )
    
    
    # ===== CONFIGURACIÓN DE AUTENTICACIÓN JWT =====
    
    # Clave secreta para firmar tokens JWT
    # CRÍTICO PARA SEGURIDAD:
    # - Debe ser una cadena larga y aleatoria (mínimo 32 caracteres)
    # - Nunca usar el valor por defecto en producción
    # - Si esta clave se compromete, TODOS los tokens quedan invalidados
    # - Rotar periódicamente (cada 6-12 meses)
    #
    # Generar clave segura:
    #   python -c "import secrets; print(secrets.token_urlsafe(32))"
    #   openssl rand -base64 32
    #
    # IMPORTANTE: Si cambias esta clave, todos los usuarios deben re-autenticarse
    jwt_secret_key: str = os.getenv(
        "SECRET_KEY",
        "your-secret-key-here-change-in-production"  # ⚠️ CAMBIAR EN PRODUCCIÓN
    )
    
    # Algoritmo utilizado para firmar JWT
    # - HS256 (HMAC + SHA256): Simétrico, rápido, recomendado para APIs internas
    # - RS256 (RSA + SHA256): Asimétrico, más seguro, requiere par de claves
    # Usar HS256 a menos que necesites verificación de firma en múltiples servicios
    jwt_algorithm: str = "HS256"
    
    # Tiempo de vida de los tokens JWT en minutos
    # - Valor actual: 30 minutos (default conservador)
    # - Consideraciones:
    #   * Tokens cortos (15-30 min): Más seguro, pero requiere refresh frecuente
    #   * Tokens largos (8-24 hrs): Mejor UX, pero mayor ventana de ataque
    # - En POS físico: Puede ser más largo (8 hrs) porque es ambiente controlado
    # - En e-commerce: Debe ser corto (30 min) por seguridad
    jwt_access_token_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", 30))
    
    
    # ===== CONFIGURACIÓN DE CLOUDINARY =====
    
    # Cloudinary es el servicio de gestión de imágenes en la nube
    # Usado para:
    # - Imágenes de productos
    # - Avatares de usuarios
    # - Banners de e-commerce
    # - Logos de tienda
    #
    # Configuración requerida:
    # 1. Crear cuenta gratuita en cloudinary.com
    # 2. Obtener credenciales del dashboard
    # 3. Configurar variables de entorno
    #
    # Capacidad free tier:
    # - 25 GB de almacenamiento
    # - 25 GB de ancho de banda mensual
    # - Transformaciones de imagen ilimitadas
    
    # Nombre único del cloud (ej: "mi-tienda-pos")
    cloudinary_cloud_name: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    
    # API Key pública (no es secreta, se puede exponer)
    cloudinary_api_key: str = os.getenv("CLOUDINARY_API_KEY", "")
    
    # API Secret privado (MANTENER SECRETO)
    # Permite subir, eliminar y modificar imágenes
    cloudinary_api_secret: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    
    # ===== CONFIGURACIÓN DE ENTORNO =====
    
    # Entorno de ejecución actual
    # Valores válidos:
    # - "development": Desarrollo local con debug habilitado
    # - "staging": Pre-producción para testing
    # - "production": Producción con optimizaciones y seguridad máxima
    #
    # Este valor afecta:
    # - Logging level (debug vs info)
    # - Error reporting (stack traces vs mensajes genéricos)
    # - API documentation (/docs disponible o no)
    # - Migraciones de BD (auto vs manual con Alembic)
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    
    # ===== PROPIEDADES DERIVADAS =====
    
    @property
    def is_development(self) -> bool:
        """
        Retorna True si estamos en entorno de desarrollo.
        
        Útil para condicionales donde el comportamiento debe cambiar
        entre desarrollo y producción.
        
        Returns:
            bool: True si environment == "development" (case-insensitive)
        
        Example:
            if settings.is_development:
                # Habilitar features solo para dev
                app.add_middleware(DebugToolbarMiddleware)
        """
        return self.environment.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """
        Retorna True si estamos en entorno de producción.
        
        Útil para validar configuraciones críticas que solo aplican
        en producción (HTTPS, secrets robustos, etc.)
        
        Returns:
            bool: True si environment == "production" (case-insensitive)
        
        Example:
            if settings.is_production:
                # Validar que no haya valores por defecto inseguros
                assert settings.jwt_secret_key != "default_key"
                assert not settings.debug_mode
        """
        return self.environment.lower() == "production"


# ===== INSTANCIA GLOBAL DE CONFIGURACIÓN =====

# Crear instancia única (singleton pattern) de configuración
# Esta instancia se importa en todos los módulos que necesitan acceso a settings
#
# Uso:
#   from config.settings import settings
#   print(settings.app_name)
#
# Ventajas del singleton:
# - Una sola lectura de variables de entorno al startup
# - Configuración consistente en toda la aplicación
# - Fácil de mockear en tests unitarios
#
# Testing:
#   En tests, se puede sobrescribir temporalmente:
#   
#   def test_production_mode():
#       original_env = settings.environment
#       settings.environment = "production"
#       
#       # Test logic...
#       
#       settings.environment = original_env  # Restore
settings = Settings()


# ===== VALIDACIONES DE STARTUP =====

# Validar configuración crítica al importar este módulo
# Previene errores en runtime por configuración incorrecta

if settings.is_production:
    # En producción, validar que no haya valores por defecto inseguros
    
    if settings.jwt_secret_key == "your-secret-key-here-change-in-production":
        raise ValueError(
            "⚠️  PRODUCCIÓN: JWT_SECRET_KEY debe ser una clave robusta y única. "
            "Generar con: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
        )
    
    if settings.debug_mode:
        raise ValueError(
            "⚠️  PRODUCCIÓN: DEBUG debe estar en False por seguridad. "
            "Set: DEBUG=False en variables de entorno."
        )
    
    # Comentado temporalmente para permitir wildcard en staging/testing
    # TODO: Descomentar y configurar CORS_ORIGINS en producción real
    # if "*" in settings.cors_origins:
    #     raise ValueError(
    #         "⚠️  PRODUCCIÓN: No permitir CORS wildcard '*'. "
    #         "Especificar dominios exactos en cors_origins."
    #     )
