"""
Configuración de conexión a base de datos para el sistema POS Cesariel.

Este módulo configura SQLAlchemy ORM para conectar con PostgreSQL,
establece el motor de base de datos, sesiones y la clase base 
para todos los modelos del sistema.

Funcionalidades principales:
- Conexión a PostgreSQL usando variables de entorno
- Configuración del motor SQLAlchemy con parámetros optimizados
- Factory de sesiones para operaciones de base de datos
- Clase base declarativa para definición de modelos
- Dependency injection para FastAPI endpoints
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ===== CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS =====

# URL de conexión obtenida desde variables de entorno
# Formato: postgresql://usuario:contraseña@host:puerto/nombre_bd
# Default: PostgreSQL local con credenciales de desarrollo
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/pos_cesariel"
)

# ===== MOTOR DE BASE DE DATOS =====

# Crear motor SQLAlchemy con configuración optimizada para PostgreSQL
# - echo=False: No mostrar queries SQL en logs (cambiar a True para debug)
# - pool_pre_ping=True: Verificar conexiones antes de usar (recomendado para producción)
# - pool_recycle=3600: Reciclar conexiones cada hora para evitar timeouts
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Cambiar a True para debug de queries SQL
    pool_pre_ping=True,  # Verificar conexiones válidas
    pool_recycle=3600,   # Reciclar conexiones cada hora
    pool_size=10,        # Número de conexiones en el pool
    max_overflow=20      # Conexiones adicionales permitidas
)

# ===== FACTORY DE SESIONES =====

# Crear factory de sesiones SQLAlchemy
# - autocommit=False: Transacciones manuales para mayor control
# - autoflush=False: Flush manual para optimizar performance
# - bind=engine: Asociar al motor de base de datos configurado
SessionLocal = sessionmaker(
    autocommit=False,  # Requiere commit manual para transacciones
    autoflush=False,   # Requiere flush manual para mayor control
    bind=engine        # Motor de BD configurado arriba
)

# ===== CLASE BASE DECLARATIVA =====

# Clase base para todos los modelos SQLAlchemy
# Todos los modelos en models.py heredan de esta clase
Base = declarative_base()

# ===== DEPENDENCY INJECTION PARA FASTAPI =====

def get_db():
    """
    Generador de sesión de base de datos para dependency injection en FastAPI.

    Proporciona una sesión SQLAlchemy para cada request HTTP y garantiza
    que la conexión se cierre correctamente al finalizar la operación.

    Usage:
        @app.get("/products")
        def get_products(db: Session = Depends(get_db)):
            return db.query(Product).all()

    Yields:
        Session: Sesión SQLAlchemy activa para operaciones de BD

    Behavior:
        1. Crea nueva sesión usando SessionLocal factory
        2. Yield la sesión al endpoint que la requiere
        3. Garantiza cierre de sesión en bloque finally
        4. Maneja automáticamente limpieza de recursos
    """
    db = SessionLocal()  # Crear nueva sesión de BD
    try:
        yield db  # Proveer sesión al endpoint
    finally:
        db.close()  # Garantizar cierre de conexión


# ===== FUNCIONES DE UTILIDAD =====

def init_db():
    """
    Inicializa la base de datos creando todas las tablas definidas en los modelos.

    Esta función crea todas las tablas necesarias si no existen.
    Útil para desarrollo y pruebas.
    """
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error initializing database: {e}")


def check_db_connection():
    """
    Verifica la conexión a la base de datos.

    Returns:
        bool: True si la conexión es exitosa, False en caso contrario
    """
    db = None
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database connection error: {e}")
        return False
    finally:
        if db:
            db.close()


# Alias for backwards compatibility
SQLALCHEMY_DATABASE_URL = DATABASE_URL