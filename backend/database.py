"""
Módulo de configuración de base de datos para POS Cesariel.

Este módulo centraliza toda la configuración de SQLAlchemy ORM para
la conexión con PostgreSQL, gestión de sesiones y definición de modelos.

Componentes principales:
    - Motor SQLAlchemy: Gestión del pool de conexiones a PostgreSQL
    - SessionLocal: Factory para crear sesiones transaccionales
    - Base: Clase base declarativa para todos los modelos ORM
    - get_db(): Dependency injection para FastAPI endpoints

Configuración del pool de conexiones:
    - pool_size: 10 conexiones simultáneas base
    - max_overflow: 20 conexiones adicionales bajo demanda
    - pool_recycle: Renovación automática cada hora (previene timeouts)
    - pool_pre_ping: Verificación de conexiones antes de usar

Arquitectura:
    Database URL (env) → Engine → SessionLocal → get_db() → FastAPI Endpoints
    
Example:
    # En un endpoint de FastAPI
    @app.get("/products")
    def get_products(db: Session = Depends(get_db)):
        return db.query(Product).all()
    
    # Inicialización manual de base de datos
    from database import init_db
    init_db()  # Crea todas las tablas si no existen

Note:
    En producción, usar Alembic para migraciones en lugar de create_all().
    Ver: backend/alembic/ y MIGRATIONS.md
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os


# ===== CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS =====

# URL de conexión obtenida desde variable de entorno
# Formato estándar PostgreSQL: postgresql://usuario:password@host:puerto/nombre_bd
# 
# Variables de entorno relevantes:
#   - DATABASE_URL: URL completa (prioridad)
#   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD: Componentes individuales
#
# Ejemplo en desarrollo:
#   DATABASE_URL=postgresql://postgres:password@localhost:5432/pos_cesariel
#
# Ejemplo en Docker:
#   DATABASE_URL=postgresql://postgres:password@db:5432/pos_cesariel
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/pos_cesariel"
)


# ===== MOTOR DE BASE DE DATOS =====

# Crear motor SQLAlchemy con configuración optimizada para PostgreSQL
#
# Parámetros de configuración:
#
# echo (bool):
#   - False: No mostrar queries SQL en logs (recomendado para producción)
#   - True: Mostrar todas las queries (útil para debugging)
#
# pool_pre_ping (bool):
#   - True: Verificar que la conexión esté viva antes de usarla
#   - Previene errores por conexiones cerradas o timeouts
#   - Overhead mínimo: solo un "SELECT 1" antes de cada operación
#   - CRÍTICO en producción con conexiones persistentes
#
# pool_recycle (int):
#   - 3600 segundos = 1 hora
#   - Fuerza renovación de conexiones antes de que el servidor las cierre
#   - Previene "MySQL has gone away" / "connection already closed"
#   - PostgreSQL cierra conexiones idle después de cierto tiempo
#
# pool_size (int):
#   - 10: Número de conexiones permanentes en el pool
#   - Estas conexiones se mantienen abiertas y listas para usar
#   - Ajustar según carga esperada y recursos del servidor
#
# max_overflow (int):
#   - 20: Conexiones adicionales que se pueden crear bajo demanda
#   - Total máximo de conexiones: pool_size + max_overflow = 30
#   - Estas conexiones se cierran cuando ya no se necesitan
#   - Previene saturación bajo picos de tráfico
#
# Recomendaciones de tuning:
#   - Desarrollo: pool_size=5, max_overflow=10 (recursos limitados)
#   - Producción baja carga: pool_size=10, max_overflow=20 (actual)
#   - Producción alta carga: pool_size=20, max_overflow=40
#   - Monitorear: Si se alcanza max_overflow frecuentemente, aumentar pool_size
engine = create_engine(
    DATABASE_URL,
    echo=False,              # Queries SQL en logs: False=producción, True=debug
    pool_pre_ping=True,      # Verificar conexión antes de usar (recomendado)
    pool_recycle=3600,       # Renovar conexiones cada hora (previene timeouts)
    pool_size=10,            # Conexiones permanentes en el pool
    max_overflow=20          # Conexiones adicionales bajo demanda
)


# ===== FACTORY DE SESIONES =====

# Configurar factory de sesiones SQLAlchemy para manejo transaccional
#
# Parámetros:
#
# autocommit (bool):
#   - False: Requiere commit manual para confirmar cambios
#   - Proporciona control explícito de transacciones
#   - Permite rollback en caso de errores
#   - Recomendado para operaciones críticas (ventas, pagos, stock)
#
# autoflush (bool):
#   - False: Requiere flush manual para sincronizar con BD
#   - Mayor control sobre cuándo se ejecutan las queries INSERT/UPDATE
#   - Mejor performance: agrupa múltiples cambios en una sola operación
#   - Útil para operaciones batch (importación de productos)
#
# bind (Engine):
#   - Asocia la sesión al motor de BD configurado arriba
#   - Todas las sesiones creadas usarán esta conexión
#
# Ciclo de vida de una transacción:
#   1. db = SessionLocal()           # Crear sesión
#   2. db.add(objeto)                # Agregar cambios al buffer
#   3. db.flush()                    # Ejecutar SQL pero no confirmar
#   4. db.commit()                   # Confirmar cambios en BD
#   5. db.rollback()                 # Revertir si hay error
#   6. db.close()                    # Cerrar conexión (SIEMPRE)
SessionLocal = sessionmaker(
    autocommit=False,        # Transacciones manuales (mayor control)
    autoflush=False,         # Flush manual (mejor performance)
    bind=engine              # Motor de BD configurado
)


# ===== CLASE BASE DECLARATIVA =====

# Clase base para todos los modelos SQLAlchemy del sistema
#
# Uso:
#   Todos los modelos ORM deben heredar de esta clase base:
#
#   from database import Base
#
#   class Product(Base):
#       __tablename__ = "products"
#       id = Column(Integer, primary_key=True)
#       name = Column(String(100))
#
# Características:
#   - Declarative style: Define tabla y clase en un solo lugar
#   - Metadata automática: Registra todas las tablas para create_all()
#   - Type hints: Permite anotaciones de tipo en Python
#   - Relaciones: Soporte para ForeignKey, relationships, etc.
#
# Generación de tablas:
#   Base.metadata.create_all(bind=engine)  # Crea todas las tablas
#   Base.metadata.drop_all(bind=engine)    # Elimina todas las tablas
#
# IMPORTANTE:
#   En producción, usar Alembic para migraciones en lugar de create_all().
#   Ver: backend/alembic/ y MIGRATIONS.md
Base = declarative_base()


# ===== DEPENDENCY INJECTION PARA FASTAPI =====

def get_db():
    """
    Generador de sesión de base de datos para dependency injection en FastAPI.
    
    Esta función es un generador que proporciona una sesión SQLAlchemy
    para cada request HTTP y garantiza su cierre correcto al finalizar,
    incluso si ocurre una excepción.
    
    Ciclo de vida de una request:
        1. Cliente HTTP hace petición → FastAPI recibe request
        2. get_db() crea nueva sesión → db = SessionLocal()
        3. Sesión se inyecta en endpoint → yield db
        4. Endpoint ejecuta lógica de negocio → db.query(...).all()
        5. Endpoint retorna respuesta → return {...}
        6. Sesión se cierra automáticamente → finally: db.close()
    
    Ventajas:
        - Aislamiento de sesiones: Cada request tiene su propia sesión
        - Cierre garantizado: El bloque finally asegura limpieza de recursos
        - Thread-safe: Cada thread tiene su propia sesión
        - Exception-safe: La sesión se cierra incluso si hay errores
    
    Usage en endpoints:
        @app.get("/products")
        def get_products(db: Session = Depends(get_db)):
            # 'db' es una sesión lista para usar
            products = db.query(Product).all()
            return products
            # Sesión se cierra automáticamente al retornar
    
    Usage en operaciones manuales:
        db = next(get_db())  # Obtener sesión manualmente
        try:
            products = db.query(Product).all()
        finally:
            db.close()  # CRÍTICO: Siempre cerrar
    
    Yields:
        Session: Sesión SQLAlchemy activa y lista para operaciones de BD
    
    Note:
        FastAPI maneja automáticamente el ciclo de vida cuando se usa Depends().
        El yield permite que FastAPI ejecute código después de la response.
    
    Warning:
        No crear sesiones manualmente en endpoints:
            # ❌ INCORRECTO (leak de conexiones)
            db = SessionLocal()
            products = db.query(Product).all()
            # ¿Quién cierra db? ¡Leak de memoria!
            
            # ✅ CORRECTO (usa dependency injection)
            def endpoint(db: Session = Depends(get_db)):
                products = db.query(Product).all()
                # FastAPI cierra automáticamente
    """
    # Crear nueva sesión de BD usando el factory configurado
    db = SessionLocal()
    try:
        # Yield la sesión al endpoint que la solicitó
        # El código del endpoint se ejecuta aquí
        yield db
    finally:
        # Garantizar cierre de conexión al finalizar request
        # Este bloque SIEMPRE se ejecuta, incluso si hay excepciones
        db.close()


# ===== FUNCIONES DE UTILIDAD =====

def init_db():
    """
    Inicializa la base de datos creando todas las tablas definidas en los modelos.
    
    Esta función usa Base.metadata.create_all() para generar automáticamente
    el esquema de base de datos a partir de los modelos SQLAlchemy.
    
    Comportamiento:
        - Crea tablas que no existen (idempotente)
        - NO modifica tablas existentes (no hace ALTER TABLE)
        - NO elimina datos existentes
        - NO maneja migraciones de esquema
    
    Uso recomendado:
        - Desarrollo local: Para setup inicial rápido
        - Testing: Para crear DB de prueba limpia
        - Demos: Para setup automatizado
    
    NO usar en producción:
        - No maneja cambios de esquema (columnas nuevas, índices, etc.)
        - No tiene rollback de migraciones
        - No mantiene historial de cambios
        - Usar Alembic en su lugar: `alembic upgrade head`
    
    Raises:
        Exception: Si hay error de conexión o permisos insuficientes
    
    Example:
        # Script de inicialización
        from database import init_db
        
        if __name__ == "__main__":
            print("Creando tablas...")
            init_db()
            print("✅ Base de datos inicializada")
    
    See Also:
        - backend/alembic/: Migraciones profesionales con Alembic
        - MIGRATIONS.md: Guía de uso de migraciones
        - Makefile: `make init-db` para inicialización completa
    """
    try:
        # Crear todas las tablas definidas en modelos que heredan de Base
        # Equivalente a ejecutar todos los CREATE TABLE necesarios
        Base.metadata.create_all(bind=engine)
        
    except Exception as e:
        # Capturar errores de conexión, permisos, etc.
        print(f"❌ Error inicializando base de datos: {e}")
        print(f"   Verificar DATABASE_URL: {DATABASE_URL}")
        print(f"   Verificar que PostgreSQL esté corriendo")
        raise


def check_db_connection():
    """
    Verifica que la conexión a la base de datos esté funcionando correctamente.
    
    Realiza una consulta simple (SELECT 1) para validar que:
    - PostgreSQL esté corriendo y accesible
    - Las credenciales sean correctas
    - El pool de conexiones esté funcionando
    - No haya problemas de red o firewall
    
    Esta función es útil para:
    - Health checks en contenedores Docker
    - Validación de configuración en CI/CD
    - Diagnóstico de problemas de conectividad
    - Startup checks antes de levantar el servidor
    
    Returns:
        bool: True si la conexión es exitosa, False en caso contrario
    
    Example:
        # Health check al iniciar aplicación
        from database import check_db_connection
        
        if not check_db_connection():
            print("❌ Error: No se puede conectar a la base de datos")
            exit(1)
        
        print("✅ Conexión a base de datos OK")
        # Continuar con startup de la aplicación...
    
    Example (FastAPI endpoint):
        @app.get("/health")
        def health_check():
            db_ok = check_db_connection()
            return {
                "status": "healthy" if db_ok else "unhealthy",
                "database": "connected" if db_ok else "disconnected"
            }
    
    Note:
        Esta función crea y cierra su propia sesión, no interfiere con
        el pool de conexiones de la aplicación.
    """
    db = None
    try:
        # Crear sesión temporal para la prueba
        db = SessionLocal()
        
        # Ejecutar query simple para verificar conectividad
        # text() es necesario para SQL crudo en SQLAlchemy 2.0+
        db.execute(text("SELECT 1"))
        
        # Si llegamos aquí, la conexión funciona
        return True
        
    except Exception as e:
        # Capturar cualquier error de conexión
        print(f"❌ Error de conexión a base de datos: {e}")
        print(f"   DATABASE_URL: {DATABASE_URL}")
        print(f"   Host: {os.getenv('DB_HOST', 'localhost')}")
        print(f"   Port: {os.getenv('DB_PORT', '5432')}")
        print(f"   Database: {os.getenv('DB_NAME', 'pos_cesariel')}")
        return False
        
    finally:
        # CRÍTICO: Siempre cerrar la sesión temporal
        if db:
            db.close()


# ===== COMPATIBILIDAD Y ALIAS =====

# Alias para mantener compatibilidad con código legacy
# Algunos módulos antiguos pueden importar SQLALCHEMY_DATABASE_URL
# en lugar de DATABASE_URL. Este alias previene errores.
#
# TODO: Deprecar en versión futura, migrar todo código a DATABASE_URL
SQLALCHEMY_DATABASE_URL = DATABASE_URL
