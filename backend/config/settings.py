"""
Configuración centralizada para el backend de POS Cesariel.

Este módulo contiene todas las configuraciones del sistema, incluyendo
configuraciones de base de datos, autenticación, CORS y variables de entorno.
"""
import os
from typing import List
from dotenv import load_dotenv

# Cargar variables de entorno desde archivo .env
load_dotenv()


class Settings:
    """
    Clase que centraliza todas las configuraciones del sistema POS Cesariel.
    
    Attributes:
        app_name (str): Nombre de la aplicación
        app_version (str): Versión de la aplicación
        app_description (str): Descripción de la aplicación
        debug_mode (bool): Modo de depuración
        database_url (str): URL de conexión a la base de datos
        cors_origins (List[str]): Orígenes permitidos para CORS
        jwt_secret_key (str): Clave secreta para tokens JWT
        jwt_algorithm (str): Algoritmo utilizado para JWT
        cloudinary_cloud_name (str): Nombre del cloud de Cloudinary
        cloudinary_api_key (str): API key de Cloudinary
        cloudinary_api_secret (str): API secret de Cloudinary
    """
    
    # Configuración de la aplicación
    app_name: str = "Backend POS Cesariel"
    app_version: str = "1.0.0"
    app_description: str = "API para el sistema de punto de venta multisucursal con e-commerce"
    debug_mode: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Configuración del servidor
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    
    # Configuración de base de datos
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/pos_cesariel")
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: str = os.getenv("DB_PORT", "5432")
    db_name: str = os.getenv("DB_NAME", "pos_cesariel")
    db_user: str = os.getenv("DB_USER", "postgres")
    db_password: str = os.getenv("DB_PASSWORD", "password")
    
    # Configuración de CORS
    cors_origins: List[str] = [
        "http://localhost:3000",  # POS Frontend en desarrollo
        "http://frontend:3000",   # POS Frontend en Docker
        "http://localhost:3001",  # E-commerce en desarrollo
        "http://ecommerce:3001",  # E-commerce en Docker
        "*"  # En desarrollo, permitir todos los orígenes
    ]
    
    # Configuración de autenticación JWT
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "tu_clave_secreta_super_segura_aqui")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", 30))
    
    # Configuración de Cloudinary para imágenes
    cloudinary_cloud_name: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    cloudinary_api_key: str = os.getenv("CLOUDINARY_API_KEY", "")
    cloudinary_api_secret: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    # Configuración de la aplicación
    environment: str = os.getenv("ENV", "development")
    
    @property
    def is_development(self) -> bool:
        """Retorna True si estamos en entorno de desarrollo."""
        return self.environment.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Retorna True si estamos en entorno de producción."""
        return self.environment.lower() == "production"


# Instancia global de configuración
settings = Settings()