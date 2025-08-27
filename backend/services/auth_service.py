"""
Servicio de autenticación para POS Cesariel.

Este módulo maneja toda la lógica de autenticación y autorización del sistema,
incluyendo generación de tokens JWT, verificación de contraseñas y manejo de permisos.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models import User, UserRole
from config.settings import settings


class AuthenticationService:
    """
    Servicio de autenticación centralizado para el sistema POS Cesariel.
    
    Maneja todas las operaciones relacionadas con autenticación, autorización
    y gestión de tokens JWT.
    """
    
    def __init__(self):
        """Inicializa el servicio de autenticación con configuraciones seguras."""
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = settings.jwt_secret_key
        self.algorithm = settings.jwt_algorithm
        self.access_token_expire_minutes = settings.jwt_access_token_expire_minutes

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verifica si una contraseña en texto plano coincide con el hash almacenado.
        
        Args:
            plain_password (str): Contraseña en texto plano
            hashed_password (str): Hash de la contraseña almacenada
            
        Returns:
            bool: True si las contraseñas coinciden, False en caso contrario
        """
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """
        Genera un hash seguro para una contraseña.
        
        Args:
            password (str): Contraseña en texto plano
            
        Returns:
            str: Hash seguro de la contraseña
        """
        return self.pwd_context.hash(password)

    def create_access_token(
        self, 
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Crea un token JWT de acceso con los datos proporcionados.
        
        Args:
            data (Dict[str, Any]): Datos a codificar en el token
            expires_delta (Optional[timedelta]): Tiempo de expiración personalizado
            
        Returns:
            str: Token JWT codificado
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=self.access_token_expire_minutes
            )
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def decode_access_token(self, token: str) -> Dict[str, Any]:
        """
        Decodifica y valida un token JWT.
        
        Args:
            token (str): Token JWT a decodificar
            
        Returns:
            Dict[str, Any]: Datos decodificados del token
            
        Raises:
            JWTError: Si el token es inválido o ha expirado
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            raise JWTError(f"Token inválido: {str(e)}")

    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[User]:
        """
        Autentica un usuario con credenciales de username y contraseña.
        
        Args:
            db (Session): Sesión de base de datos
            username (str): Nombre de usuario
            password (str): Contraseña en texto plano
            
        Returns:
            Optional[User]: Usuario autenticado o None si las credenciales son inválidas
        """
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            return None
            
        if not self.verify_password(password, user.hashed_password):
            return None
            
        return user

    def get_user_permissions(self, user: User) -> Dict[str, bool]:
        """
        Obtiene los permisos de un usuario basado en su rol.
        
        Args:
            user (User): Usuario del cual obtener permisos
            
        Returns:
            Dict[str, bool]: Diccionario con los permisos del usuario
        """
        # Definir permisos por rol
        role_permissions = {
            UserRole.ADMIN: {
                'pos': True,
                'inventory': True,
                'reports': True,
                'users': True,
                'settings': True,
                'ecommerce': True,
                'branches': True
            },
            UserRole.MANAGER: {
                'pos': True,
                'inventory': True,
                'reports': True,
                'users': True,
                'settings': False,
                'ecommerce': True,
                'branches': False
            },
            UserRole.SELLER: {
                'pos': True,
                'inventory': False,
                'reports': False,
                'users': False,
                'settings': False,
                'ecommerce': False,
                'branches': False
            },
            UserRole.ECOMMERCE: {
                'pos': False,
                'inventory': False,
                'reports': True,
                'users': False,
                'settings': False,
                'ecommerce': True,
                'branches': False
            }
        }
        
        return role_permissions.get(user.role, {})

    def can_access_module(self, user: User, module: str) -> bool:
        """
        Verifica si un usuario puede acceder a un módulo específico.
        
        Args:
            user (User): Usuario a verificar
            module (str): Nombre del módulo
            
        Returns:
            bool: True si el usuario puede acceder al módulo
        """
        permissions = self.get_user_permissions(user)
        return permissions.get(module, False)


# Instancia global del servicio de autenticación
auth_service = AuthenticationService()