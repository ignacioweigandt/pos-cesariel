"""
Repositories de Usuario y Sucursal.

Acceso a datos para gestión de usuarios (autenticación, roles) y
operaciones de sucursales (multi-tenant).

Repositories:
    - UserRepository: CRUD usuarios + búsqueda por username/email/branch
    - BranchRepository: CRUD sucursales + filtrado activas
"""

from app.repositories.base import BaseRepository
from app.models import User, Branch
from typing import Optional, List

class UserRepository(BaseRepository[User]):
    """
    Repository de usuarios del sistema.
    
    Métodos específicos para autenticación y gestión de usuarios por sucursal.
    Hereda CRUD completo de BaseRepository.
    """
    
    def get_by_username(self, username: str) -> Optional[User]:
        """
        Busca usuario por username (login).
        
        Args:
            username: Nombre de usuario único
        
        Returns:
            Usuario si existe, None si no
        """
        return self.get_by_field("username", username)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """
        Busca usuario por email.
        
        Args:
            email: Dirección de email
        
        Returns:
            Usuario si existe, None si no
        """
        return self.get_by_field("email", email)
    
    def get_by_branch(self, branch_id: int) -> List[User]:
        """
        Obtiene todos los usuarios de una sucursal.
        
        Args:
            branch_id: ID de la sucursal
        
        Returns:
            Lista de usuarios de esa sucursal
        """
        return self.get_many_by_field("branch_id", branch_id)
    
    def get_active_users(self) -> List[User]:
        """
        Obtiene usuarios activos del sistema.
        
        Returns:
            Lista de usuarios con is_active=True
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()

class BranchRepository(BaseRepository[Branch]):
    """
    Repository de sucursales.
    
    Gestión de sucursales para sistema multi-tenant.
    Hereda CRUD completo de BaseRepository.
    """
    
    def get_active_branches(self) -> List[Branch]:
        """
        Obtiene sucursales activas.
        
        Returns:
            Lista de sucursales con is_active=True
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()
