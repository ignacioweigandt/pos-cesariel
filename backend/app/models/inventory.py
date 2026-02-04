"""
Modelos de gestión de inventario para POS Cesariel.

Este módulo centraliza todos los modelos relacionados con el control de stock
y trazabilidad de inventario en el sistema multisucursal.

Arquitectura de inventario:
    ┌─────────────────────────────────────────────────┐
    │  Product (producto general)                     │
    │  └─ stock_quantity (calculado, no editable)     │
    └─────────────────┬───────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼─────────┐      ┌───────▼────────┐
    │ BranchStock  │      │ ProductSize    │
    │ (sin talles) │      │ (con talles)   │
    │              │      │                │
    │ - branch_id  │      │ - branch_id    │
    │ - quantity   │      │ - size         │
    │              │      │ - quantity     │
    └──────────────┘      └────────────────┘

Flujo de stock:
    1. Producto sin talles → BranchStock (stock por sucursal)
    2. Producto con talles → ProductSize (stock por sucursal + talle)
    3. Cada cambio → InventoryMovement (auditoría)
    4. Import masivo → ImportLog (trazabilidad)

Modelos:
    - BranchStock: Stock por sucursal (productos sin talles)
    - ProductSize: Stock por sucursal y talle (productos con talles)
    - InventoryMovement: Historial de movimientos de stock (auditoría)
    - ImportLog: Registro de importaciones masivas de productos

Reglas de negocio críticas:
    - NUNCA modificar Product.stock_quantity directamente
    - SIEMPRE actualizar via BranchStock o ProductSize
    - TODO movimiento debe generar InventoryMovement
    - Stock negativo está prohibido (validar antes de descontar)
    - Stock reservado se implementa a futuro (columna comentada)

Note:
    La suma de BranchStock.stock_quantity de todas las sucursales
    debe coincidir con Product.stock_quantity calculado.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class BranchStock(Base):
    """
    Stock de productos por sucursal sin sistema de talles.
    
    Gestiona el inventario independiente de cada sucursal para productos
    que NO manejan talles (ej: accesorios, electrónica, artículos únicos).
    
    Cada sucursal mantiene su propio stock aislado, permitiendo:
        - Control de inventario descentralizado
        - Transferencias entre sucursales
        - Reportes de stock por ubicación
        - Alertas de reposición por sucursal
    
    Arquitectura multi-tenant:
        - Cada BranchStock pertenece a UNA sucursal
        - Cada combinación branch_id + product_id es única (constraint implícita)
        - El stock global del producto = SUM(stock_quantity) de todas las sucursales
        - Vendedores ven solo el stock de SU sucursal
        - Admins ven el stock consolidado de TODAS las sucursales
    
    Attributes:
        id (int): Identificador único del registro
        branch_id (int): ID de la sucursal propietaria (FK → branches.id)
        product_id (int): ID del producto (FK → products.id)
        stock_quantity (int): Cantidad física disponible en esta sucursal
        min_stock (int): Umbral mínimo para alertas de reposición
        created_at (datetime): Timestamp de creación del registro
        updated_at (datetime): Timestamp de última modificación
    
    Relationships:
        branch: Sucursal propietaria del stock
        product: Producto al que corresponde este stock
    
    Business Rules:
        - Un producto puede tener múltiples BranchStock (uno por sucursal)
        - Stock negativo NO permitido (validar antes de descontar)
        - reserved_stock (comentado) se implementará para reservas de e-commerce
        - Al vender en POS, descontar de BranchStock de esa sucursal
        - Al vender en e-commerce, descontar de sucursal con mayor stock
        - Transferencias entre sucursales: descontar origen, sumar destino
    
    Uso en ventas:
        # Venta POS - Descontar de sucursal del vendedor
        branch_stock = db.query(BranchStock).filter(
            BranchStock.branch_id == user.branch_id,
            BranchStock.product_id == product_id
        ).first()
        
        if branch_stock.has_sufficient_stock(quantity):
            branch_stock.stock_quantity -= quantity
            db.commit()
    
    Alertas de stock bajo:
        # Detectar productos bajo mínimo
        low_stock = db.query(BranchStock).filter(
            BranchStock.stock_quantity < BranchStock.min_stock
        ).all()
    
    Constraints implícitas:
        - (branch_id, product_id) debe ser único
        - stock_quantity >= 0 (validar en aplicación)
        - min_stock >= 0
    
    Example:
        >>> # Crear stock inicial para sucursal
        >>> branch_stock = BranchStock(
        ...     branch_id=1,
        ...     product_id=100,
        ...     stock_quantity=50,
        ...     min_stock=10
        ... )
        >>> db.add(branch_stock)
        >>> db.commit()
        
        >>> # Verificar disponibilidad antes de vender
        >>> if branch_stock.has_sufficient_stock(5):
        ...     branch_stock.stock_quantity -= 5
        ...     db.commit()
    
    See Also:
        - ProductSize: Para productos CON sistema de talles
        - InventoryMovement: Auditoría de cambios de stock
        - Product.calculate_total_stock(): Cálculo de stock global
    """
    __tablename__ = "branch_stock"
    
    # ===== IDENTIFICADORES =====
    
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        doc="Identificador único autoincremental"
    )
    
    branch_id = Column(
        Integer, 
        ForeignKey("branches.id"), 
        nullable=False,
        index=True,  # Índice para queries frecuentes por sucursal
        doc="ID de la sucursal propietaria del stock (multi-tenant)"
    )
    
    product_id = Column(
        Integer, 
        ForeignKey("products.id"), 
        nullable=False,
        index=True,  # Índice para queries por producto
        doc="ID del producto al que corresponde este stock"
    )
    
    # ===== CONTROL DE INVENTARIO =====
    
    stock_quantity = Column(
        Integer, 
        default=0, 
        nullable=False,
        doc="Cantidad física disponible en esta sucursal. "
            "NO modificar directamente, usar repositorio para auditoría."
    )
    
    min_stock = Column(
        Integer, 
        default=0,
        doc="Umbral mínimo para generar alertas de reposición. "
            "Cuando stock_quantity < min_stock, notificar al manager."
    )
    
    # FUTURO: Stock reservado para pedidos online pendientes
    # reserved_stock = Column(
    #     Integer, 
    #     default=0,
    #     doc="Stock reservado para pedidos de e-commerce pendientes de pago. "
    #         "available_stock = stock_quantity - reserved_stock"
    # )
    
    # ===== AUDITORÍA Y CONCURRENCIA =====
    
    version = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Versión para optimistic locking. Se incrementa en cada UPDATE "
            "para prevenir race conditions en ventas concurrentes."
    )
    
    created_at = Column(
        DateTime, 
        default=func.now(),
        doc="Timestamp de creación del registro (inmutable)"
    )
    
    updated_at = Column(
        DateTime, 
        default=func.now(), 
        onupdate=func.now(),
        doc="Timestamp de última modificación (actualizado en cada UPDATE)"
    )
    
    # ===== RELACIONES =====
    
    branch = relationship(
        "Branch",
        doc="Sucursal propietaria de este stock. "
            "Permite acceder a branch.name, branch.address, etc."
    )
    
    product = relationship(
        "Product", 
        back_populates="branch_stocks",
        doc="Producto al que corresponde este stock. "
            "Permite acceder a product.name, product.price, etc."
    )
    
    # ===== CONSTRAINTS DE TABLA =====
    
    __table_args__ = (
        # IMPORTANTE: Debería haber un UniqueConstraint aquí
        # para (branch_id, product_id) pero está implícito en el negocio
        # TODO: Agregar en próxima migración:
        # UniqueConstraint('branch_id', 'product_id', name='uq_branch_product')
        {"extend_existing": True},
    )
    
    # ===== PROPIEDADES CALCULADAS =====
    
    @property
    def available_stock(self) -> int:
        """
        Stock disponible para venta (por ahora igual a stock_quantity).
        
        En el futuro, cuando se implemente reserved_stock:
            available_stock = stock_quantity - reserved_stock
        
        Returns:
            int: Cantidad disponible para venta inmediata
        
        Example:
            >>> branch_stock.stock_quantity = 100
            >>> branch_stock.available_stock
            100
            
            # Futuro con reservas:
            >>> branch_stock.reserved_stock = 20
            >>> branch_stock.available_stock
            80
        """
        # TODO: Cuando se implemente reserved_stock:
        # return self.stock_quantity - (self.reserved_stock or 0)
        return self.stock_quantity
    
    # ===== MÉTODOS DE NEGOCIO =====
    
    def has_sufficient_stock(self, quantity: int) -> bool:
        """
        Verifica si hay stock suficiente para una cantidad solicitada.
        
        Usa available_stock en lugar de stock_quantity para considerar
        stock reservado cuando se implemente.
        
        Args:
            quantity: Cantidad solicitada para venta o reserva
        
        Returns:
            bool: True si hay stock suficiente, False si no alcanza
        
        Example:
            >>> branch_stock = BranchStock(stock_quantity=10)
            >>> branch_stock.has_sufficient_stock(5)
            True
            >>> branch_stock.has_sufficient_stock(15)
            False
        
        Note:
            Esta validación NO descuenta stock, solo verifica disponibilidad.
            El descuento debe hacerse explícitamente después de la validación.
        """
        return self.available_stock >= quantity
    
    def is_below_minimum(self) -> bool:
        """
        Verifica si el stock está por debajo del mínimo configurado.
        
        Útil para generar alertas automáticas de reposición.
        
        Returns:
            bool: True si stock_quantity < min_stock
        
        Example:
            >>> branch_stock = BranchStock(stock_quantity=5, min_stock=10)
            >>> branch_stock.is_below_minimum()
            True
        """
        return self.stock_quantity < self.min_stock
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        return (
            f"<BranchStock("
            f"branch_id={self.branch_id}, "
            f"product_id={self.product_id}, "
            f"stock={self.stock_quantity}, "
            f"available={self.available_stock}"
            f")>"
        )


class InventoryMovement(Base):
    """
    Registro de auditoría de todos los movimientos de inventario.
    
    Cada vez que el stock de un producto cambia, se crea un InventoryMovement
    para mantener trazabilidad completa de todas las operaciones.
    
    Tipos de movimientos:
        IN (Entrada):
            - Compra a proveedor
            - Transferencia desde otra sucursal (recepción)
            - Ajuste positivo (corrección de inventario)
            - Devolución de cliente
        
        OUT (Salida):
            - Venta a cliente (POS o e-commerce)
            - Transferencia a otra sucursal (envío)
            - Merma o pérdida
            - Devolución a proveedor
        
        ADJUSTMENT (Ajuste):
            - Corrección de inventario físico
            - Recuento (puede ser positivo o negativo)
            - Ajuste por diferencia de sistema
    
    Trazabilidad:
        Cada movimiento referencia la operación que lo originó:
        - reference_type: Tipo de operación (SALE, PURCHASE, ADJUSTMENT, TRANSFER)
        - reference_id: ID del registro origen (Sale.id, Purchase.id, etc.)
        - notes: Notas adicionales del operador
    
    Attributes:
        id (int): Identificador único del movimiento
        product_id (int): ID del producto afectado (FK → products.id)
        branch_id (int): ID de la sucursal donde ocurrió (FK → branches.id)
        movement_type (str): Tipo de movimiento (IN, OUT, ADJUSTMENT)
        quantity (int): Cantidad del movimiento (+ para IN, - para OUT)
        previous_stock (int): Stock antes del movimiento (snapshot)
        new_stock (int): Stock después del movimiento (snapshot)
        reference_id (int): ID de la operación origen (Sale.id, etc.)
        reference_type (str): Tipo de operación (SALE, PURCHASE, etc.)
        notes (str): Notas explicativas del movimiento
        created_at (datetime): Timestamp del movimiento (inmutable)
    
    Relationships:
        product: Producto afectado por el movimiento
        branch: Sucursal donde ocurrió el movimiento
    
    Business Rules:
        - TODOS los cambios de stock deben generar un InventoryMovement
        - previous_stock + quantity = new_stock (validar consistencia)
        - movement_type debe ser IN, OUT o ADJUSTMENT
        - Para ventas: movement_type=OUT, reference_type=SALE, reference_id=Sale.id
        - Para compras: movement_type=IN, reference_type=PURCHASE, reference_id=Purchase.id
        - created_at NO debe modificarse (auditoría inmutable)
    
    Uso en ventas:
        # Registrar salida de stock por venta
        movement = InventoryMovement(
            product_id=product_id,
            branch_id=branch_id,
            movement_type="OUT",
            quantity=-5,  # Negativo porque es salida
            previous_stock=100,
            new_stock=95,
            reference_type="SALE",
            reference_id=sale.id,
            notes=f"Venta #{sale.sale_number}"
        )
        db.add(movement)
    
    Reportes de auditoría:
        # Historial de movimientos de un producto
        movements = db.query(InventoryMovement).filter(
            InventoryMovement.product_id == product_id
        ).order_by(InventoryMovement.created_at.desc()).all()
        
        # Detectar discrepancias
        for movement in movements:
            expected_new = movement.previous_stock + movement.quantity
            if expected_new != movement.new_stock:
                print(f"ALERTA: Discrepancia en movimiento {movement.id}")
    
    Example:
        >>> # Entrada por compra
        >>> movement_in = InventoryMovement(
        ...     product_id=100,
        ...     branch_id=1,
        ...     movement_type="IN",
        ...     quantity=50,
        ...     previous_stock=10,
        ...     new_stock=60,
        ...     reference_type="PURCHASE",
        ...     reference_id=purchase.id,
        ...     notes="Compra a proveedor XYZ"
        ... )
        
        >>> # Salida por venta
        >>> movement_out = InventoryMovement(
        ...     product_id=100,
        ...     branch_id=1,
        ...     movement_type="OUT",
        ...     quantity=-5,
        ...     previous_stock=60,
        ...     new_stock=55,
        ...     reference_type="SALE",
        ...     reference_id=sale.id,
        ...     notes=f"Venta #{sale.sale_number}"
        ... )
    
    See Also:
        - BranchStock: Donde se actualiza el stock real
        - ProductSize: Para productos con talles
        - app/services/inventory_service.py: Lógica de movimientos
    """
    __tablename__ = "inventory_movements"
    
    # ===== IDENTIFICADORES =====
    
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        doc="Identificador único autoincremental"
    )
    
    product_id = Column(
        Integer, 
        ForeignKey("products.id"),
        index=True,  # Índice para queries por producto
        doc="ID del producto afectado por este movimiento"
    )
    
    branch_id = Column(
        Integer, 
        ForeignKey("branches.id"),
        index=True,  # Índice para queries por sucursal
        doc="ID de la sucursal donde ocurrió el movimiento"
    )
    
    # ===== INFORMACIÓN DEL MOVIMIENTO =====
    
    movement_type = Column(
        String(20), 
        nullable=False,
        index=True,  # Índice para filtrar por tipo
        doc="Tipo de movimiento: IN (entrada), OUT (salida), ADJUSTMENT (ajuste)"
    )
    
    quantity = Column(
        Integer, 
        nullable=False,
        doc="Cantidad del movimiento. Positiva para IN, negativa para OUT"
    )
    
    previous_stock = Column(
        Integer, 
        nullable=False,
        doc="Snapshot del stock ANTES del movimiento (para auditoría)"
    )
    
    new_stock = Column(
        Integer, 
        nullable=False,
        doc="Snapshot del stock DESPUÉS del movimiento (para validación)"
    )
    
    # ===== TRAZABILIDAD =====
    
    reference_id = Column(
        Integer,
        doc="ID de la operación que causó el movimiento (Sale.id, Purchase.id, etc.)"
    )
    
    reference_type = Column(
        String(20),
        doc="Tipo de operación origen: SALE, PURCHASE, ADJUSTMENT, TRANSFER, RETURN"
    )
    
    notes = Column(
        Text,
        doc="Notas explicativas del movimiento para contexto adicional"
    )
    
    # ===== AUDITORÍA =====
    
    created_at = Column(
        DateTime, 
        default=func.now(),
        index=True,  # Índice para ordenar por fecha
        doc="Timestamp del movimiento (inmutable, NO debe actualizarse)"
    )
    
    # ===== RELACIONES =====
    
    product = relationship(
        "Product", 
        back_populates="inventory_movements",
        doc="Producto afectado por este movimiento"
    )
    
    branch = relationship(
        "Branch", 
        back_populates="inventory_movements",
        doc="Sucursal donde ocurrió el movimiento"
    )
    
    # ===== MÉTODOS DE VALIDACIÓN =====
    
    def validate_consistency(self) -> bool:
        """
        Valida que la matemática del movimiento sea consistente.
        
        Verifica: previous_stock + quantity = new_stock
        
        Returns:
            bool: True si es consistente, False si hay error
        
        Example:
            >>> movement = InventoryMovement(
            ...     previous_stock=100,
            ...     quantity=-10,
            ...     new_stock=90
            ... )
            >>> movement.validate_consistency()
            True
            
            >>> bad_movement = InventoryMovement(
            ...     previous_stock=100,
            ...     quantity=-10,
            ...     new_stock=95  # Error!
            ... )
            >>> bad_movement.validate_consistency()
            False
        """
        expected_new_stock = self.previous_stock + self.quantity
        return expected_new_stock == self.new_stock
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        return (
            f"<InventoryMovement("
            f"product_id={self.product_id}, "
            f"type={self.movement_type}, "
            f"qty={self.quantity:+d}, "
            f"{self.previous_stock}→{self.new_stock}"
            f")>"
        )


class ProductSize(Base):
    """
    Stock de productos con sistema de talles por sucursal.
    
    Para productos que manejan variantes de talle (ropa, calzado),
    el stock se gestiona a nivel de talle específico por sucursal.
    
    Casos de uso:
        - Ropa: XS, S, M, L, XL, XXL
        - Calzado: 35, 36, 37, 38, 39, 40, 41, 42
        - Pantalones: 28, 30, 32, 34, 36, 38
        - Remeras: S, M, L, XL
    
    Diferencia con BranchStock:
        - BranchStock: Stock por sucursal (productos SIN talles)
        - ProductSize: Stock por sucursal + talle (productos CON talles)
        - Si Product.has_sizes=True → usar ProductSize
        - Si Product.has_sizes=False → usar BranchStock
    
    Attributes:
        id (int): Identificador único del registro
        product_id (int): ID del producto padre (FK → products.id)
        branch_id (int): ID de la sucursal (FK → branches.id)
        size (str): Denominación del talle (XS, S, M, 35, 36, etc.)
        stock_quantity (int): Cantidad disponible de este talle
        created_at (datetime): Timestamp de creación
        updated_at (datetime): Timestamp de última modificación
    
    Relationships:
        product: Producto padre (debe tener has_sizes=True)
        branch: Sucursal donde está este stock
    
    Business Rules:
        - (product_id, branch_id, size) debe ser único (constraint implícita)
        - Talles válidos dependen de la categoría del producto
        - Stock negativo NO permitido
        - Al vender, especificar talle obligatoriamente
        - Stock total del producto = SUM(stock_quantity) de todos los talles
    
    Validación de talles:
        # Obtener talles válidos según categoría
        if product.category.name == "Remeras":
            valid_sizes = ["XS", "S", "M", "L", "XL", "XXL"]
        elif product.category.name == "Calzado":
            valid_sizes = ["35", "36", "37", "38", "39", "40", "41", "42"]
        
        # Validar antes de crear ProductSize
        if size not in valid_sizes:
            raise ValueError(f"Talle {size} no válido para {product.category.name}")
    
    Uso en ventas:
        # Buscar stock de talle específico
        product_size = db.query(ProductSize).filter(
            ProductSize.product_id == product_id,
            ProductSize.branch_id == branch_id,
            ProductSize.size == "M"
        ).first()
        
        if product_size and product_size.stock_quantity >= quantity:
            product_size.stock_quantity -= quantity
            db.commit()
    
    Reportes de stock:
        # Stock por talle de un producto
        sizes = db.query(ProductSize).filter(
            ProductSize.product_id == product_id
        ).all()
        
        for size in sizes:
            print(f"Talle {size.size}: {size.stock_quantity} unidades")
        
        # Talles sin stock (para alertas)
        out_of_stock = db.query(ProductSize).filter(
            ProductSize.product_id == product_id,
            ProductSize.stock_quantity == 0
        ).all()
    
    Example:
        >>> # Crear stock de talles para remera
        >>> for size in ["S", "M", "L", "XL"]:
        ...     product_size = ProductSize(
        ...         product_id=100,
        ...         branch_id=1,
        ...         size=size,
        ...         stock_quantity=20
        ...     )
        ...     db.add(product_size)
        >>> db.commit()
        
        >>> # Vender talle M
        >>> size_m = db.query(ProductSize).filter(
        ...     ProductSize.product_id == 100,
        ...     ProductSize.size == "M"
        ... ).first()
        >>> size_m.stock_quantity -= 2
        >>> db.commit()
    
    See Also:
        - BranchStock: Para productos SIN talles
        - Product.has_sizes: Flag que indica si usar ProductSize
        - utils/size_validators.py: Validación de talles por categoría
    """
    __tablename__ = "product_sizes"
    
    # ===== IDENTIFICADORES =====
    
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        doc="Identificador único autoincremental"
    )
    
    product_id = Column(
        Integer, 
        ForeignKey("products.id"), 
        nullable=False,
        index=True,  # Índice para queries por producto
        doc="ID del producto padre (debe tener has_sizes=True)"
    )
    
    branch_id = Column(
        Integer, 
        ForeignKey("branches.id"), 
        nullable=False,
        index=True,  # Índice para queries por sucursal
        doc="ID de la sucursal donde está este stock de talle"
    )
    
    # ===== INFORMACIÓN DEL TALLE =====
    
    size = Column(
        String(10), 
        nullable=False,
        index=True,  # Índice para búsquedas por talle
        doc="Denominación del talle: XS, S, M, L, XL, 35, 36, 37, etc."
    )
    
    stock_quantity = Column(
        Integer, 
        default=0, 
        nullable=False,
        doc="Cantidad disponible de este talle específico en esta sucursal"
    )
    
    # ===== AUDITORÍA Y CONCURRENCIA =====
    
    version = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Versión para optimistic locking. Previene race conditions."
    )
    
    created_at = Column(
        DateTime, 
        default=func.now(),
        doc="Timestamp de creación del registro"
    )
    
    updated_at = Column(
        DateTime, 
        default=func.now(), 
        onupdate=func.now(),
        doc="Timestamp de última modificación"
    )
    
    # ===== RELACIONES =====
    
    product = relationship(
        "Product", 
        back_populates="product_sizes",
        doc="Producto padre del cual este es un talle específico"
    )
    
    branch = relationship(
        "Branch",
        doc="Sucursal donde se encuentra este stock de talle"
    )
    
    # ===== CONSTRAINTS DE TABLA =====
    
    __table_args__ = (
        # IMPORTANTE: Debería haber un UniqueConstraint aquí
        # para (product_id, branch_id, size) pero está implícito
        # TODO: Agregar en próxima migración:
        # UniqueConstraint('product_id', 'branch_id', 'size', name='uq_product_branch_size')
        {"extend_existing": True},
    )
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        return (
            f"<ProductSize("
            f"product_id={self.product_id}, "
            f"branch_id={self.branch_id}, "
            f"size={self.size}, "
            f"stock={self.stock_quantity}"
            f")>"
        )


class ImportLog(Base):
    """
    Registro de auditoría para importaciones masivas de productos.
    
    Cuando se importan productos via CSV/Excel, este modelo registra:
        - Quién ejecutó la importación
        - Cuántos registros se procesaron
        - Cuántos fueron exitosos vs fallidos
        - Qué errores ocurrieron
        - Cuánto tiempo tomó
    
    Estados de importación:
        PROCESSING: Importación en curso
        COMPLETED: Importación finalizada exitosamente
        FAILED: Importación falló completamente
    
    Attributes:
        id (int): Identificador único del log
        filename (str): Nombre del archivo importado (máx. 255 caracteres)
        user_id (int): ID del usuario que ejecutó la importación (FK → users.id)
        total_rows (int): Total de filas en el archivo
        successful_rows (int): Filas importadas exitosamente
        failed_rows (int): Filas que fallaron
        status (str): Estado actual (PROCESSING, COMPLETED, FAILED)
        error_details (str): Detalles de errores ocurridos (JSON o texto)
        created_at (datetime): Timestamp de inicio de la importación
        completed_at (datetime): Timestamp de finalización
    
    Relationships:
        user: Usuario que ejecutó la importación
    
    Business Rules:
        - Una importación puede ser parcialmente exitosa (algunos rows ok, otros fail)
        - successful_rows + failed_rows = total_rows
        - error_details debe contener info útil para debugging
        - completed_at solo se setea cuando status != PROCESSING
    
    Uso típico:
        # Iniciar importación
        import_log = ImportLog(
            filename="productos_2024.csv",
            user_id=current_user.id,
            total_rows=1000,
            status="PROCESSING"
        )
        db.add(import_log)
        db.commit()
        
        # Procesar filas...
        successful = 0
        failed = 0
        errors = []
        
        for row in csv_rows:
            try:
                # Importar producto
                successful += 1
            except Exception as e:
                failed += 1
                errors.append(f"Fila {row_num}: {str(e)}")
        
        # Finalizar importación
        import_log.successful_rows = successful
        import_log.failed_rows = failed
        import_log.error_details = "\\n".join(errors)
        import_log.status = "COMPLETED" if failed == 0 else "FAILED"
        import_log.completed_at = func.now()
        db.commit()
    
    Reportes de importaciones:
        # Últimas importaciones
        recent_imports = db.query(ImportLog).order_by(
            ImportLog.created_at.desc()
        ).limit(10).all()
        
        # Importaciones con errores
        failed_imports = db.query(ImportLog).filter(
            ImportLog.status == "FAILED"
        ).all()
    
    Example:
        >>> import_log = ImportLog(
        ...     filename="productos_enero.xlsx",
        ...     user_id=1,
        ...     total_rows=500,
        ...     successful_rows=480,
        ...     failed_rows=20,
        ...     status="COMPLETED",
        ...     error_details="20 productos sin SKU válido"
        ... )
        >>> db.add(import_log)
        >>> db.commit()
    
    See Also:
        - app/services/import_service.py: Lógica de importación
        - routers/products.py: Endpoint /products/import
    """
    __tablename__ = "import_logs"
    
    # ===== IDENTIFICADORES =====
    
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        doc="Identificador único del log de importación"
    )
    
    filename = Column(
        String(255), 
        nullable=False,
        doc="Nombre del archivo importado (con extensión)"
    )
    
    user_id = Column(
        Integer, 
        ForeignKey("users.id"), 
        nullable=False,
        index=True,  # Índice para queries por usuario
        doc="ID del usuario que ejecutó la importación (auditoría)"
    )
    
    # ===== ESTADÍSTICAS DE IMPORTACIÓN =====
    
    total_rows = Column(
        Integer, 
        default=0,
        doc="Total de filas en el archivo (incluyendo header)"
    )
    
    successful_rows = Column(
        Integer, 
        default=0,
        doc="Cantidad de filas importadas exitosamente"
    )
    
    failed_rows = Column(
        Integer, 
        default=0,
        doc="Cantidad de filas que fallaron por errores de validación"
    )
    
    # ===== ESTADO Y ERRORES =====
    
    status = Column(
        String(20), 
        default="PROCESSING",
        index=True,  # Índice para filtrar por estado
        doc="Estado actual: PROCESSING (en curso), COMPLETED (exitosa), FAILED (falló)"
    )
    
    error_details = Column(
        Text,
        doc="Detalles de errores ocurridos (JSON, lista de errores, stack traces)"
    )
    
    # ===== TIMESTAMPS =====
    
    created_at = Column(
        DateTime, 
        default=func.now(),
        index=True,  # Índice para ordenar por fecha
        doc="Timestamp de inicio de la importación"
    )
    
    completed_at = Column(
        DateTime,
        doc="Timestamp de finalización de la importación (NULL si aún está PROCESSING)"
    )
    
    # ===== RELACIONES =====
    
    user = relationship(
        "User",
        doc="Usuario que ejecutó la importación (auditoría)"
    )
    
    # ===== MÉTODOS DE NEGOCIO =====
    
    def calculate_success_rate(self) -> float:
        """
        Calcula el porcentaje de éxito de la importación.
        
        Returns:
            float: Porcentaje de filas exitosas (0-100)
        
        Example:
            >>> import_log = ImportLog(total_rows=100, successful_rows=95)
            >>> import_log.calculate_success_rate()
            95.0
        """
        if self.total_rows == 0:
            return 0.0
        return (self.successful_rows / self.total_rows) * 100
    
    def is_complete(self) -> bool:
        """
        Verifica si la importación finalizó (exitosa o fallida).
        
        Returns:
            bool: True si status != PROCESSING
        """
        return self.status != "PROCESSING"
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        return (
            f"<ImportLog("
            f"id={self.id}, "
            f"file='{self.filename}', "
            f"status={self.status}, "
            f"success_rate={self.calculate_success_rate():.1f}%"
            f")>"
        )
