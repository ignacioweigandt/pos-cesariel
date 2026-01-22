"""
Capa de compatibilidad para la autenticación.

Este módulo proporciona las funciones de autenticación que necesitan los routers,
utilizando el nuevo servicio de autenticación centralizado.
"""

from datetime import timedelta
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from app.models import User, UserRole
from services.auth_service import auth_service
from config.settings import settings

# Configuración de seguridad HTTP Bearer
security = HTTPBearer()

# Re-exportar constantes para compatibilidad
ACCESS_TOKEN_EXPIRE_MINUTES = settings.jwt_access_token_expire_minutes


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña usando el servicio de autenticación."""
    return auth_service.verify_password(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Genera un hash de contraseña usando el servicio de autenticación."""
    return auth_service.get_password_hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un token de acceso usando el servicio de autenticación."""
    return auth_service.create_access_token(data, expires_delta)


def authenticate_user(db: Session, username: str, password: str):
    """Autentica un usuario usando el servicio de autenticación."""
    return auth_service.authenticate_user(db, username, password)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    """Obtiene el usuario actual desde el token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = auth_service.decode_access_token(credentials.credentials)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Obtiene el usuario actual y verifica que esté activo."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def require_role(allowed_roles: list[UserRole]):
    """Crea un dependency que requiere roles específicos."""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role"
            )
        return current_user
    return role_checker


def require_admin(current_user: User = Depends(get_current_active_user)):
    """Requiere que el usuario sea administrador."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_manager_or_admin(current_user: User = Depends(get_current_active_user)):
    """Requiere que el usuario sea manager o administrador."""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or Admin access required"
        )
    return current_user


def require_same_branch_or_admin(branch_id: int, current_user: User = Depends(get_current_active_user)):
    """Requiere que el usuario pertenezca a la misma sucursal o sea admin."""
    if current_user.role == UserRole.ADMIN:
        return current_user
    if current_user.branch_id != branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: different branch"
        )
    return current_user


def require_stock_management_permission(current_user: User = Depends(get_current_active_user)):
    """
    Permite acceso a funciones de gestión de stock (ajuste de stock).
    Roles permitidos: ADMIN, MANAGER, SELLER
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Stock management access required (Admin, Manager, or Seller role)"
        )
    return current_user