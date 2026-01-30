"""
Servicio de Usuarios - Lógica de Negocio.

Gestiona operaciones de usuarios con validaciones y reglas de negocio.
Capa intermedia entre routers y repositories.

Responsabilidades:
    - Validación de unicidad (username, email)
    - Verificación de existencia de branch
    - Coordinación con repositories
    - Aplicación de reglas de negocio

Validaciones:
    - Username único en el sistema
    - Email único en el sistema
    - Branch válido y existente
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.user import UserRepository, BranchRepository
from app.models import User, Branch
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """
    Servicio de gestión de usuarios.
    
    Coordina repositories y aplica validaciones de negocio.
    """

    def __init__(self, db: Session):
        """
        Inicializa servicio con sesión de BD.
        
        Args:
            db: Sesión de SQLAlchemy
        """
        self.db = db
        self.user_repo = UserRepository(User, db)
        self.branch_repo = BranchRepository(Branch, db)

    def create_user(self, user_data: UserCreate, hashed_password: str) -> User:
        """
        Crea usuario con validaciones de negocio.
        
        Valida:
            - Username único
            - Email único
            - Branch existente
        
        Args:
            user_data: Datos del usuario a crear
            hashed_password: Contraseña ya hasheada (desde auth.py)
        
        Returns:
            Usuario creado
        
        Raises:
            ValueError: Si username/email duplicado o branch inválido
        """
        # Check username uniqueness
        if self.user_repo.get_by_username(user_data.username):
            raise ValueError(f"Username {user_data.username} already exists")
        
        # Check email uniqueness
        if self.user_repo.get_by_email(user_data.email):
            raise ValueError(f"Email {user_data.email} already exists")
        
        # Validate branch exists if provided
        if user_data.branch_id:
            branch = self.branch_repo.get(user_data.branch_id)
            if not branch:
                raise ValueError(f"Branch {user_data.branch_id} not found")

        # Create user
        user_dict = user_data.dict()
        user_dict['hashed_password'] = hashed_password
        return self.user_repo.create(user_dict)

    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """
        Actualiza usuario con validaciones.
        
        Args:
            user_id: ID del usuario a actualizar
            user_data: Datos parciales a actualizar
        
        Returns:
            Usuario actualizado o None si no existe
        
        Raises:
            ValueError: Si username/email duplicado
        """
        user = self.user_repo.get(user_id)
        if not user:
            return None

        # Validate username uniqueness if changed
        if user_data.username and user_data.username != user.username:
            existing = self.user_repo.get_by_username(user_data.username)
            if existing:
                raise ValueError(f"Username {user_data.username} already exists")

        # Validate email uniqueness if changed
        if user_data.email and user_data.email != user.email:
            existing = self.user_repo.get_by_email(user_data.email)
            if existing:
                raise ValueError(f"Email {user_data.email} already exists")

        # Update user
        update_data = user_data.dict(exclude_unset=True)
        return self.user_repo.update(user_id, update_data)

    def get_users_by_branch(self, branch_id: int) -> List[User]:
        """Obtiene usuarios de una sucursal."""
        return self.user_repo.get_by_branch(branch_id)

    def get_active_users(self) -> List[User]:
        """Obtiene usuarios activos."""
        return self.user_repo.get_active_users()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Obtiene usuario por username."""
        return self.user_repo.get_by_username(username)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Obtiene usuario por email."""
        return self.user_repo.get_by_email(email)
