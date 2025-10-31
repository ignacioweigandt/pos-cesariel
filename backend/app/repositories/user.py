"""
User and Branch repositories for POS Cesariel.

Provides data access for user management and branch operations.
"""

from app.repositories.base import BaseRepository
from app.models import User, Branch
from typing import Optional, List

class UserRepository(BaseRepository[User]):
    """Repository for User entity."""
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.get_by_field("username", username)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        return self.get_by_field("email", email)
    
    def get_by_branch(self, branch_id: int) -> List[User]:
        """Get all users belonging to a specific branch."""
        return self.get_many_by_field("branch_id", branch_id)
    
    def get_active_users(self) -> List[User]:
        """Get all active users in the system."""
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()

class BranchRepository(BaseRepository[Branch]):
    """Repository for Branch entity."""
    
    def get_active_branches(self) -> List[Branch]:
        """Get all active branches."""
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()
