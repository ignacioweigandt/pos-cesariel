"""
Repository Base - Patrón Repository Genérico.

Implementa operaciones CRUD genéricas que heredan todos los repositories del sistema.
Abstrae acceso a datos y proporciona interfaz consistente para SQLAlchemy.

Patrón:
    Repository Pattern - Separa lógica de negocio de acceso a datos.

Herencia:
    Todos los repositories (ProductRepository, SaleRepository, etc.) heredan de aquí.

Características:
    - Generic con TypeVar para type safety
    - CRUD completo: get, get_all, create, update, delete
    - Paginación y ordenamiento integrados
    - Búsqueda por campos arbitrarios
    - Conteo y verificación de existencia
"""

from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from database import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """
    Repository base genérico con operaciones CRUD completas.
    
    Proporciona interfaz unificada para acceso a datos de cualquier modelo
    SQLAlchemy. Todos los repositories específicos heredan esta funcionalidad.
    
    Attributes:
        model: Clase del modelo SQLAlchemy (Product, Sale, User, etc.)
        db: Sesión de SQLAlchemy para queries y transacciones
    
    Type Parameters:
        ModelType: Tipo genérico del modelo SQLAlchemy (bound=Base)
    
    Ejemplo:
        class ProductRepository(BaseRepository[Product]):
            def __init__(self, db: Session):
                super().__init__(Product, db)
    """

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Inicializa repository con modelo y sesión de BD.
        
        Args:
            model: Clase del modelo SQLAlchemy
            db: Sesión activa de SQLAlchemy
        """
        self.model = model
        self.db = db

    def get(self, id: int) -> Optional[ModelType]:
        """
        Obtiene registro único por ID.
        
        Args:
            id: Identificador del registro
        
        Returns:
            Instancia del modelo o None si no existe
        """
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        order_by: str = "id",
        order_dir: str = "asc"
    ) -> List[ModelType]:
        """
        Obtiene todos los registros con paginación y ordenamiento.
        
        Args:
            skip: Registros a saltar (offset)
            limit: Máximo de registros a retornar
            order_by: Campo por el cual ordenar (default: "id")
            order_dir: Dirección de orden ("asc" o "desc")
        
        Returns:
            Lista de instancias del modelo
        """
        query = self.db.query(self.model)
        
        # Apply ordering
        order_column = getattr(self.model, order_by, self.model.id)
        if order_dir == "desc":
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))
        
        return query.offset(skip).limit(limit).all()

    def get_by_field(self, field: str, value: Any) -> Optional[ModelType]:
        """
        Obtiene primer registro que coincida con campo=valor.
        
        Args:
            field: Nombre del campo del modelo
            value: Valor a buscar
        
        Returns:
            Primera instancia que coincida o None
        """
        return self.db.query(self.model).filter(
            getattr(self.model, field) == value
        ).first()

    def get_many_by_field(self, field: str, value: Any) -> List[ModelType]:
        """
        Obtiene todos los registros que coincidan con campo=valor.
        
        Args:
            field: Nombre del campo del modelo
            value: Valor a buscar
        
        Returns:
            Lista de instancias que coincidan
        """
        return self.db.query(self.model).filter(
            getattr(self.model, field) == value
        ).all()

    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """
        Crea nuevo registro en la BD.
        
        Args:
            obj_in: Diccionario con campos del modelo
        
        Returns:
            Instancia del modelo creada y refrescada
        """
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: int, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """
        Actualiza registro existente.
        
        Args:
            id: ID del registro a actualizar
            obj_in: Diccionario con campos a modificar
        
        Returns:
            Instancia actualizada o None si no existe
        """
        db_obj = self.get(id)
        if db_obj:
            for field, value in obj_in.items():
                setattr(db_obj, field, value)
            self.db.commit()
            self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        """
        Elimina registro por ID.
        
        Args:
            id: ID del registro a eliminar
        
        Returns:
            True si eliminó exitosamente, False si no existe
        """
        db_obj = self.get(id)
        if db_obj:
            self.db.delete(db_obj)
            self.db.commit()
            return True
        return False

    def count(self) -> int:
        """
        Cuenta total de registros del modelo.
        
        Returns:
            Cantidad total de registros
        """
        return self.db.query(self.model).count()

    def exists(self, id: int) -> bool:
        """
        Verifica si existe registro con ID dado.
        
        Args:
            id: ID a verificar
        
        Returns:
            True si existe, False si no
        """
        return self.db.query(self.model).filter(self.model.id == id).first() is not None
