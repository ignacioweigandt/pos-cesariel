"""
Módulo de autenticación y autorización para POS Cesariel.

Este módulo centraliza toda la lógica de seguridad del sistema, incluyendo:
- Autenticación de usuarios mediante JWT (JSON Web Tokens)
- Hashing seguro de contraseñas con bcrypt
- Validación y verificación de tokens de acceso
- Control de acceso basado en roles (RBAC - Role-Based Access Control)
- Protección de endpoints por permisos y sucursales

Roles del sistema:
    - ADMIN: Acceso completo al sistema, gestión multisucursal
    - MANAGER: Gestión de sucursal específica, reportes avanzados
    - SELLER: Operaciones POS, ventas y stock básico
    - ECOMMERCE: Solo acceso a funcionalidades de tienda online

Arquitectura de seguridad:
    - Tokens JWT con expiración de 8 horas
    - Hashing de contraseñas con bcrypt (salt automático)
    - Bearer token authentication en HTTP headers
    - Validación de roles en cada endpoint protegido
    - Validación de sucursal para control multi-tenant

Ejemplo de uso:
    @router.get("/protected")
    def protected_route(current_user: User = Depends(get_current_active_user)):
        return {"user": current_user.username}
    
    @router.post("/admin-only")
    def admin_route(current_user: User = Depends(require_admin)):
        return {"message": "Admin access granted"}
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from app.models import User, UserRole
import os

# ===== CONFIGURACIÓN DE SEGURIDAD =====

# Clave secreta para firmar tokens JWT
# IMPORTANTE: En producción debe ser una clave robusta y secreta
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")

# Algoritmo de encriptación para JWT (HS256 es el estándar recomendado)
ALGORITHM = "HS256"

# Tiempo de expiración de tokens de acceso (8 horas = 480 minutos)
# Balance entre seguridad (tokens cortos) y UX (no re-autenticar constantemente)
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas

# Configuración de hashing de contraseñas con bcrypt
# - bcrypt es el algoritmo recomendado para hashing de contraseñas
# - Genera salt automático para cada password
# - Resistente a ataques de fuerza bruta y rainbow tables
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuración de seguridad HTTP Bearer para FastAPI
# Extrae automáticamente el token del header "Authorization: Bearer <token>"
security = HTTPBearer()


# ===== FUNCIONES DE HASHING DE CONTRASEÑAS =====

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica que una contraseña en texto plano coincida con su versión hasheada.
    
    Utiliza bcrypt para comparar de forma segura la contraseña ingresada
    con el hash almacenado en la base de datos. Esta función es resistente
    a timing attacks gracias a la implementación de bcrypt.
    
    Args:
        plain_password: Contraseña en texto plano ingresada por el usuario
        hashed_password: Hash de contraseña almacenado en la base de datos
    
    Returns:
        bool: True si la contraseña es correcta, False en caso contrario
    
    Example:
        >>> hashed = get_password_hash("mipassword123")
        >>> verify_password("mipassword123", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro de una contraseña usando bcrypt.
    
    Crea un hash único para cada contraseña utilizando bcrypt con salt
    automático. Este hash es seguro para almacenar en la base de datos
    ya que es unidireccional (no se puede revertir a la contraseña original).
    
    Args:
        password: Contraseña en texto plano a hashear
    
    Returns:
        str: Hash de la contraseña en formato bcrypt (ej: $2b$12$...)
    
    Note:
        El hash generado incluye automáticamente:
        - Identificador de algoritmo ($2b$)
        - Cost factor (12 rounds por defecto)
        - Salt aleatorio de 22 caracteres
        - Hash final de 31 caracteres
    
    Example:
        >>> hash_pwd = get_password_hash("supersecret")
        >>> print(hash_pwd)
        $2b$12$KIXqP0Zk.../hash_completo...
    """
    return pwd_context.hash(password)


# ===== FUNCIONES DE GESTIÓN DE TOKENS JWT =====

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Crea un token JWT de acceso con los datos del usuario y tiempo de expiración.
    
    Genera un token JWT firmado que contiene la información del usuario
    y una marca de tiempo de expiración. Este token se envía al cliente
    y debe incluirse en el header Authorization de cada petición protegida.
    
    Args:
        data: Diccionario con los datos a codificar en el token.
              Típicamente incluye: {"sub": username, "role": "ADMIN"}
        expires_delta: Tiempo personalizado de expiración. Si no se especifica,
                      usa ACCESS_TOKEN_EXPIRE_MINUTES (8 horas por defecto)
    
    Returns:
        str: Token JWT codificado y firmado listo para enviar al cliente
    
    Note:
        El token contiene:
        - Payload: Datos del usuario (username, role, etc.)
        - Timestamp de expiración (exp claim)
        - Firma digital para prevenir manipulación
    
    Security:
        - El token está firmado pero NO encriptado (no incluir datos sensibles)
        - Usar HTTPS en producción para proteger el token en tránsito
        - El cliente debe almacenar el token de forma segura (httpOnly cookies)
    
    Example:
        >>> token = create_access_token({"sub": "admin", "role": "ADMIN"})
        >>> print(token)
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    """
    to_encode = data.copy()
    
    # Calcular tiempo de expiración
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Agregar claim de expiración al payload
    to_encode.update({"exp": expire})
    
    # Codificar y firmar el token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ===== FUNCIONES DE AUTENTICACIÓN =====

def authenticate_user(db: Session, username: str, password: str):
    """
    Autentica un usuario verificando sus credenciales contra la base de datos.
    
    Busca al usuario por username y verifica que la contraseña ingresada
    coincida con el hash almacenado. Esta función es el punto de entrada
    para el proceso de login.
    
    Args:
        db: Sesión de base de datos SQLAlchemy
        username: Nombre de usuario ingresado
        password: Contraseña en texto plano ingresada
    
    Returns:
        User: Instancia del usuario autenticado si las credenciales son válidas
        False: Si el usuario no existe o la contraseña es incorrecta
    
    Security:
        - No revela si el error es por usuario inexistente o password incorrecto
          (previene enumeración de usuarios)
        - Usa timing-safe password comparison (implementado por bcrypt)
    
    Example:
        >>> user = authenticate_user(db, "admin", "password123")
        >>> if user:
        >>>     print(f"Login exitoso: {user.username}")
        >>> else:
        >>>     print("Credenciales inválidas")
    """
    # Buscar usuario por username
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    
    # Verificar contraseña
    if not verify_password(password, user.hashed_password):
        return False
    
    return user


# ===== DEPENDENCY INJECTION PARA FASTAPI =====

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    """
    Dependency de FastAPI que extrae y valida el usuario actual desde el token JWT.
    
    Esta función se inyecta en endpoints protegidos mediante Depends().
    Extrae el token del header Authorization, lo decodifica, verifica su validez
    y retorna el usuario correspondiente desde la base de datos.
    
    Args:
        credentials: Credenciales HTTP Bearer extraídas automáticamente del header
        db: Sesión de base de datos inyectada automáticamente
    
    Returns:
        User: Instancia del usuario autenticado actual
    
    Raises:
        HTTPException 401: Si el token es inválido, expirado o el usuario no existe
    
    Flow:
        1. Extraer token del header "Authorization: Bearer <token>"
        2. Decodificar y verificar firma del token
        3. Extraer username del claim "sub"
        4. Buscar usuario en base de datos
        5. Retornar instancia de User
    
    Example:
        @router.get("/me")
        def get_my_profile(current_user: User = Depends(get_current_user)):
            return {"username": current_user.username}
    """
    # Excepción HTTP estándar para errores de autenticación
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificar y verificar token JWT
        payload = jwt.decode(
            credentials.credentials, 
            SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        
        # Extraer username del claim "sub" (subject)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
    except JWTError:
        # Token inválido, expirado o firma incorrecta
        raise credentials_exception
    
    # Buscar usuario en base de datos
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)):
    """
    Dependency que valida que el usuario autenticado esté activo.
    
    Extiende get_current_user agregando validación del campo is_active.
    Esto permite deshabilitar usuarios sin eliminarlos de la base de datos.
    
    Args:
        current_user: Usuario autenticado desde get_current_user
    
    Returns:
        User: Usuario activo y autenticado
    
    Raises:
        HTTPException 400: Si el usuario está inactivo (is_active=False)
    
    Example:
        @router.get("/dashboard")
        def dashboard(user: User = Depends(get_current_active_user)):
            return {"message": f"Welcome {user.username}"}
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=400, 
            detail="Inactive user"
        )
    return current_user


# ===== CONTROL DE ACCESO BASADO EN ROLES (RBAC) =====

def require_role(allowed_roles: list[UserRole]):
    """
    Factory de dependency que restringe acceso a roles específicos.
    
    Crea una función de validación que verifica que el usuario actual
    tenga uno de los roles permitidos. Útil para endpoints que requieren
    múltiples roles alternativos.
    
    Args:
        allowed_roles: Lista de roles permitidos (ej: [UserRole.ADMIN, UserRole.MANAGER])
    
    Returns:
        function: Dependency que valida el rol del usuario
    
    Raises:
        HTTPException 403: Si el usuario no tiene ninguno de los roles permitidos
    
    Example:
        # Permitir solo Admin o Manager
        @router.post("/reports")
        def create_report(
            user: User = Depends(require_role([UserRole.ADMIN, UserRole.MANAGER]))
        ):
            return {"message": "Report created"}
    """
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role"
            )
        return current_user
    return role_checker


def require_admin(current_user: User = Depends(get_current_active_user)):
    """
    Dependency que restringe acceso solo a usuarios con rol ADMIN.
    
    Valida que el usuario autenticado tenga rol ADMIN. Este es el rol
    con máximos privilegios del sistema (acceso multisucursal, configuración global).
    
    Args:
        current_user: Usuario autenticado desde get_current_active_user
    
    Returns:
        User: Usuario con rol ADMIN
    
    Raises:
        HTTPException 403: Si el usuario no es ADMIN
    
    Example:
        @router.delete("/users/{user_id}")
        def delete_user(
            user_id: int,
            current_user: User = Depends(require_admin)
        ):
            # Solo admins pueden eliminar usuarios
            return {"message": "User deleted"}
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_manager_or_admin(current_user: User = Depends(get_current_active_user)):
    """
    Dependency que permite acceso a ADMIN o MANAGER.
    
    Valida que el usuario tenga rol ADMIN o MANAGER. Estos roles tienen
    permisos de gestión y reportes avanzados. Managers solo pueden operar
    en su sucursal, mientras que Admins tienen acceso multisucursal.
    
    Args:
        current_user: Usuario autenticado desde get_current_active_user
    
    Returns:
        User: Usuario con rol ADMIN o MANAGER
    
    Raises:
        HTTPException 403: Si el usuario no es ADMIN ni MANAGER
    
    Example:
        @router.get("/reports/sales")
        def sales_report(
            current_user: User = Depends(require_manager_or_admin)
        ):
            # Admins y Managers pueden ver reportes
            return {"sales": [...]}
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or Admin access required"
        )
    return current_user


def require_same_branch_or_admin(
    branch_id: int, 
    current_user: User = Depends(get_current_active_user)
):
    """
    Dependency que valida acceso a una sucursal específica.
    
    Implementa control multi-tenant verificando que:
    - Si el usuario es ADMIN: puede acceder a cualquier sucursal
    - Si el usuario NO es ADMIN: solo puede acceder a su propia sucursal
    
    Args:
        branch_id: ID de la sucursal a la que se intenta acceder
        current_user: Usuario autenticado desde get_current_active_user
    
    Returns:
        User: Usuario con acceso autorizado a la sucursal
    
    Raises:
        HTTPException 403: Si el usuario intenta acceder a una sucursal diferente
    
    Use Cases:
        - Ver productos de otra sucursal
        - Consultar ventas de otra sucursal
        - Modificar configuración de otra sucursal
    
    Example:
        @router.get("/branches/{branch_id}/products")
        def get_branch_products(
            branch_id: int,
            current_user: User = Depends(
                lambda: require_same_branch_or_admin(branch_id)
            )
        ):
            # Solo Admin o usuarios de esa sucursal pueden ver productos
            return {"products": [...]}
    """
    # Admins tienen acceso multisucursal
    if current_user.role == UserRole.ADMIN:
        return current_user
    
    # Usuarios no-admin solo acceden a su propia sucursal
    if current_user.branch_id != branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: different branch"
        )
    
    return current_user


def require_stock_management_permission(current_user: User = Depends(get_current_active_user)):
    """
    Dependency que permite acceso a funciones de gestión de inventario.
    
    Valida que el usuario tenga permisos para ajustar stock, crear productos
    y gestionar inventario. Estos permisos están disponibles para:
    - ADMIN: Gestión global de inventario multisucursal
    - MANAGER: Gestión de inventario de su sucursal
    - SELLER: Ajustes de stock durante ventas y devoluciones
    
    Args:
        current_user: Usuario autenticado desde get_current_active_user
    
    Returns:
        User: Usuario con permisos de gestión de stock
    
    Raises:
        HTTPException 403: Si el usuario es ECOMMERCE (sin permisos de inventario)
    
    Note:
        El rol ECOMMERCE está excluido porque solo necesita consultar stock,
        no modificarlo directamente.
    
    Example:
        @router.patch("/products/{product_id}/stock")
        def adjust_stock(
            product_id: int,
            quantity: int,
            current_user: User = Depends(require_stock_management_permission)
        ):
            # Ajustar stock del producto
            return {"message": "Stock updated"}
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Stock management access required (Admin, Manager, or Seller role)"
        )
    return current_user
