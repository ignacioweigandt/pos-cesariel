"""
Inventory management models for the POS Cesariel system.

This module contains inventory-related models including BranchStock, InventoryMovement,
ProductSize, and ImportLog for comprehensive stock control and tracking.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class BranchStock(Base):
    """
    Modelo de Stock por Sucursal del sistema POS Cesariel.
    
    Gestiona el inventario independiente de cada sucursal, permitiendo
    que cada ubicación mantenga su propio control de stock sin interferir
    con el inventario de otras sucursales.
    
    Attributes:
        id (int): Identificador único del registro de stock por sucursal
        branch_id (int): ID de la sucursal (FK hacia branches.id)
        product_id (int): ID del producto (FK hacia products.id)
        stock_quantity (int): Cantidad en stock específica para esta sucursal
        min_stock (int): Stock mínimo para alertas de reposición por sucursal
        reserved_stock (int): Stock reservado (para pedidos pendientes)
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        branch: Sucursal propietaria de este stock
        product: Producto al que pertenece este stock
        
    Business Rules:
        - Combinación única de sucursal-producto
        - El stock total del producto se calcula sumando todos los BranchStock
        - Cada sucursal ve solo su propio stock en el POS
        - E-commerce ve la suma de stock de todas las sucursales activas
    """
    __tablename__ = "branch_stock"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único del registro de stock por sucursal")
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False,
                       doc="ID de la sucursal propietaria del stock")
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False,
                        doc="ID del producto")
    
    # Control de inventario
    stock_quantity = Column(Integer, default=0, nullable=False,
                            doc="Cantidad en stock específica para esta sucursal")
    min_stock = Column(Integer, default=0,
                       doc="Stock mínimo para alertas de reposición por sucursal")
    # reserved_stock = Column(Integer, default=0,
    #                        doc="Stock reservado para pedidos pendientes")
    
    # Campos de auditoría
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    branch = relationship("Branch", 
                         doc="Sucursal propietaria de este stock")
    product = relationship("Product", back_populates="branch_stocks",
                          doc="Producto al que pertenece este stock")
    
    # Restricciones de tabla
    __table_args__ = (
        # Índice único para combinación sucursal-producto
        # Evita duplicados de stock para el mismo producto en la misma sucursal
        {"extend_existing": True},
    )
    
    @property
    def available_stock(self):
        """
        Calcula el stock disponible (por ahora igual a stock_quantity).
        
        Returns:
            int: Cantidad disponible para venta
        """
        return self.stock_quantity
    
    def has_sufficient_stock(self, quantity):
        """
        Verifica si hay suficiente stock disponible para una cantidad solicitada.
        
        Args:
            quantity (int): Cantidad solicitada
            
        Returns:
            bool: True si hay stock suficiente, False en caso contrario
        """
        return self.available_stock >= quantity
    
    def __repr__(self):
        return f"<BranchStock(branch_id={self.branch_id}, product_id={self.product_id}, stock={self.stock_quantity})>"


class InventoryMovement(Base):
    """
    Modelo de Movimiento de Inventario del sistema POS Cesariel.
    
    Registra todos los movimientos de stock para auditoria y trazabilidad.
    Incluye entradas, salidas y ajustes de inventario con referencias
    a las operaciones que originaron el movimiento.
    
    Attributes:
        id (int): Identificador único del movimiento
        product_id (int): ID del producto afectado (FK hacia products.id)
        branch_id (int): ID de la sucursal donde ocurrió el movimiento
        movement_type (str): Tipo de movimiento (IN, OUT, ADJUSTMENT)
        quantity (int): Cantidad del movimiento (positiva o negativa)
        previous_stock (int): Stock anterior al movimiento
        new_stock (int): Stock resultante después del movimiento
        reference_id (int): ID de la operación que causó el movimiento
        reference_type (str): Tipo de referencia (SALE, PURCHASE, ADJUSTMENT)
        notes (str): Notas explicativas del movimiento
        created_at (datetime): Fecha y hora del movimiento
        
    Relationships:
        product: Producto afectado por el movimiento
        branch: Sucursal donde ocurrió el movimiento
    """
    __tablename__ = "inventory_movements"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único del movimiento de inventario")
    product_id = Column(Integer, ForeignKey("products.id"),
                        doc="ID del producto afectado")
    branch_id = Column(Integer, ForeignKey("branches.id"),
                       doc="ID de la sucursal donde ocurrió el movimiento")
    
    # Información del movimiento
    movement_type = Column(String(20), nullable=False,
                           doc="Tipo de movimiento (IN=entrada, OUT=salida, ADJUSTMENT=ajuste)")
    quantity = Column(Integer, nullable=False,
                      doc="Cantidad del movimiento (positiva para IN, negativa para OUT)")
    previous_stock = Column(Integer, nullable=False,
                            doc="Stock anterior al movimiento")
    new_stock = Column(Integer, nullable=False,
                       doc="Stock resultante después del movimiento")
    
    # Referencias de trazabilidad
    reference_id = Column(Integer,
                          doc="ID de la operación que causó el movimiento")
    reference_type = Column(String(20),
                            doc="Tipo de referencia (SALE, PURCHASE, ADJUSTMENT)")
    
    # Información adicional
    notes = Column(Text,
                   doc="Notas explicativas del movimiento")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp del movimiento")
    
    # Relaciones con otras entidades
    product = relationship("Product", back_populates="inventory_movements",
                          doc="Producto afectado por el movimiento")
    branch = relationship("Branch", back_populates="inventory_movements",
                         doc="Sucursal donde ocurrió el movimiento")


class ProductSize(Base):
    """
    Modelo de Talles de Producto del sistema POS Cesariel.
    
    Maneja los talles/variantes específicas de productos que requieren
    control de stock por talle y sucursal. Permite la gestión granular
    de inventario para productos de indumentaria, calzado, etc.
    
    Attributes:
        id (int): Identificador único del talle del producto
        product_id (int): ID del producto padre (FK hacia products.id)
        branch_id (int): ID de la sucursal (FK hacia branches.id)
        size (str): Denominación del talle (XS, S, M, L, XL, 35, 36, etc.)
        stock_quantity (int): Cantidad en stock para este talle específico
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        product: Producto padre del cual este es un talle
        branch: Sucursal donde se encuentra este stock de talle
        
    Business Rules:
        - Combinación única de producto-sucursal-talle
        - El stock del producto general se calcula sumando todos los talles
    """
    __tablename__ = "product_sizes"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único del talle del producto")
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False,
                        doc="ID del producto padre")
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False,
                       doc="ID de la sucursal")
    
    # Información del talle
    size = Column(String(10), nullable=False,
                  doc="Denominación del talle (XS, S, M, L, XL, 35, 36, etc.)")
    stock_quantity = Column(Integer, default=0, nullable=False,
                            doc="Cantidad en stock para este talle específico")
    
    # Campos de auditoría
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    product = relationship("Product", back_populates="product_sizes",
                          doc="Producto padre del cual este es un talle")
    branch = relationship("Branch",
                         doc="Sucursal donde se encuentra este stock de talle")
    
    # Restricción única por combinación producto-sucursal-talle
    __table_args__ = (
        {"extend_existing": True},
    )


class ImportLog(Base):
    __tablename__ = "import_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_rows = Column(Integer, default=0)
    successful_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    status = Column(String(20), default="PROCESSING")  # PROCESSING, COMPLETED, FAILED
    error_details = Column(Text)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User")
