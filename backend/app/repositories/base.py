"""
Base Repository for POS Cesariel.

Provides generic CRUD operations that all repositories inherit.
Follows the Repository pattern to abstract data access.
"""

from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from database import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """
    Base repository with common CRUD operations.
    All domain repositories should inherit from this.
    """

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Initialize repository with model class and database session.
        
        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    def get(self, id: int) -> Optional[ModelType]:
        """Get a single record by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        order_by: str = "id",
        order_dir: str = "asc"
    ) -> List[ModelType]:
        """Get all records with pagination and ordering."""
        query = self.db.query(self.model)
        
        # Apply ordering
        order_column = getattr(self.model, order_by, self.model.id)
        if order_dir == "desc":
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))
        
        return query.offset(skip).limit(limit).all()

    def get_by_field(self, field: str, value: Any) -> Optional[ModelType]:
        """Get a single record by any field."""
        return self.db.query(self.model).filter(
            getattr(self.model, field) == value
        ).first()

    def get_many_by_field(self, field: str, value: Any) -> List[ModelType]:
        """Get multiple records by field value."""
        return self.db.query(self.model).filter(
            getattr(self.model, field) == value
        ).all()

    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: int, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """Update an existing record."""
        db_obj = self.get(id)
        if db_obj:
            for field, value in obj_in.items():
                setattr(db_obj, field, value)
            self.db.commit()
            self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        """Delete a record by ID."""
        db_obj = self.get(id)
        if db_obj:
            self.db.delete(db_obj)
            self.db.commit()
            return True
        return False

    def count(self) -> int:
        """Count total records."""
        return self.db.query(self.model).count()

    def exists(self, id: int) -> bool:
        """Check if record exists."""
        return self.db.query(self.model).filter(self.model.id == id).first() is not None
