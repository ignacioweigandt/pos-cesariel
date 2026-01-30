"""
Modelos de ventas para POS Cesariel.

Este módulo centraliza todos los modelos relacionados con transacciones
de venta, tanto para punto de venta físico (POS) como e-commerce online.

Arquitectura de ventas:
    ┌──────────────────────────────────────┐
    │  Sale (encabezado de venta)          │
    │  - sale_number (único)               │
    │  - sale_type (POS/ECOMMERCE)         │
    │  - customer_*                        │
    │  - totales (subtotal, tax, total)    │
    │  - payment_method                    │
    │  - order_status (solo e-commerce)    │
    └─────────────┬────────────────────────┘
                  │
                  │ 1:N
                  │
    ┌─────────────▼────────────────────────┐
    │  SaleItem (líneas de venta)          │
    │  - product_id                        │
    │  - quantity                          │
    │  - unit_price (snapshot)             │
    │  - total_price                       │
    │  - size (opcional)                   │
    └──────────────────────────────────────┘

Flujo de venta:
    1. Crear Sale (encabezado) con customer y totales
    2. Agregar SaleItems (líneas) con productos y cantidades
    3. Descontar stock de BranchStock o ProductSize
    4. Crear InventoryMovement para auditoría
    5. Registrar pago y completar transacción

Diferencias POS vs E-commerce:
    POS (sale_type=POS):
        - Venta presencial instantánea
        - order_status = NULL (no aplica)
        - Stock se descuenta inmediatamente
        - user_id = vendedor que atendió
        - branch_id = sucursal física
    
    E-commerce (sale_type=ECOMMERCE):
        - Venta online con workflow
        - order_status obligatorio (PENDING → ... → DELIVERED)
        - Stock se reserva en PENDING, descuenta en PROCESSING
        - user_id = NULL o sistema
        - branch_id = sucursal que procesa el pedido

Modelos:
    - Sale: Encabezado de transacción de venta
    - SaleItem: Líneas de productos vendidos

See Also:
    - app/models/enums.py: SaleType, OrderStatus
    - app/models/inventory.py: BranchStock, ProductSize
    - app/services/sales_service.py: Lógica de negocio
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from app.models.enums import SaleType, OrderStatus


class Sale(Base):
    """
    Encabezado de transacción de venta (POS o E-commerce).
    
    Representa una transacción completa de venta con toda su información:
    cliente, montos, impuestos, descuentos, método de pago y estado.
    
    Este modelo unifica ventas de dos canales:
        - POS físico: Ventas presenciales en sucursal
        - E-commerce: Ventas online con envío o retiro
    
    Ciclo de vida POS (instantáneo):
        1. Vendedor escanea/selecciona productos
        2. Sistema calcula totales (subtotal + impuestos - descuentos)
        3. Cliente paga (efectivo, tarjeta, transferencia)
        4. Se genera Sale con sale_type=POS, order_status=NULL
        5. Stock se descuenta inmediatamente
        6. Se imprime ticket/factura
    
    Ciclo de vida E-commerce (workflow):
        1. Cliente agrega productos al carrito
        2. Completa checkout con datos de envío
        3. Se genera Sale con sale_type=ECOMMERCE, order_status=PENDING
        4. Cliente realiza pago online
        5. Admin confirma pago → order_status=PROCESSING
        6. Se prepara pedido → order_status=SHIPPED
        7. Cliente recibe → order_status=DELIVERED
        8. Posible cancelación en cualquier etapa → order_status=CANCELLED
    
    Attributes:
        # === IDENTIFICACIÓN ===
        id (int): Identificador único autoincremental
        sale_number (str): Número de venta único (formato: V-{timestamp}-{id})
        sale_type (SaleType): Canal de venta (POS o ECOMMERCE)
        
        # === CONTEXTO ===
        branch_id (int): Sucursal donde se procesa la venta
        user_id (int): Vendedor que procesó (POS) o NULL (e-commerce)
        
        # === CLIENTE ===
        customer_name (str): Nombre completo del cliente
        customer_email (str): Email para notificaciones y factura
        customer_phone (str): Teléfono de contacto
        
        # === MONTOS ===
        subtotal (Decimal): Suma de SaleItems.total_price
        tax_amount (Decimal): Impuestos aplicados (subtotal * tax_rate)
        discount_amount (Decimal): Descuentos aplicados
        total_amount (Decimal): Total final (subtotal + tax - discount)
        
        # === PAGO ===
        payment_method (str): Método de pago (efectivo, tarjeta, etc.)
        payment_method_id (int): Referencia a configuración de pago
        payment_method_name (str): Snapshot del nombre del método
        
        # === IMPUESTOS (snapshot para trazabilidad) ===
        tax_rate_id (int): Referencia a tasa de impuesto aplicada
        tax_rate_name (str): Snapshot del nombre del impuesto
        tax_rate_percentage (Decimal): Snapshot del % aplicado
        
        # === E-COMMERCE ===
        order_status (OrderStatus): Estado del pedido (NULL para POS)
        
        # === NOTAS ===
        notes (str): Observaciones adicionales de la venta
        
        # === AUDITORÍA ===
        created_at (datetime): Timestamp de creación de la venta
        updated_at (datetime): Timestamp de última modificación
    
    Relationships:
        branch: Sucursal donde se procesó la venta
        user: Vendedor que atendió (POS) o NULL (e-commerce)
        sale_items: Lista de productos vendidos (líneas)
    
    Business Rules:
        - sale_number debe ser único (índice unique)
        - total_amount = subtotal + tax_amount - discount_amount
        - POS sales: order_status debe ser NULL
        - E-commerce sales: order_status obligatorio, inicia en PENDING
        - tax_rate_* son snapshots (no cambiar si se modifica config)
        - payment_method_* son snapshots (trazabilidad)
        - Stock se descuenta SOLO cuando se confirma pago
    
    Cálculo de totales:
        # Calcular subtotal
        subtotal = sum(item.total_price for item in sale_items)
        
        # Aplicar impuesto
        tax_amount = subtotal * (tax_rate_percentage / 100)
        
        # Aplicar descuento
        discount_amount = subtotal * (discount_percentage / 100)
        
        # Total final
        total_amount = subtotal + tax_amount - discount_amount
    
    Validaciones críticas:
        - Verificar stock disponible ANTES de crear Sale
        - Para productos con talles, verificar ProductSize específico
        - Para e-commerce, validar email y teléfono obligatorios
        - Validar que payment_method esté activo
        - Validar que branch esté activo
    
    Example (POS):
        >>> sale = Sale(
        ...     sale_number="V-20240130-001",
        ...     sale_type=SaleType.POS,
        ...     branch_id=1,
        ...     user_id=5,  # Vendedor
        ...     customer_name="Juan Pérez",
        ...     subtotal=1000.00,
        ...     tax_amount=210.00,  # 21% IVA
        ...     discount_amount=0,
        ...     total_amount=1210.00,
        ...     payment_method="Efectivo",
        ...     order_status=None  # NULL para POS
        ... )
        >>> db.add(sale)
        >>> db.commit()
    
    Example (E-commerce):
        >>> sale = Sale(
        ...     sale_number="E-20240130-042",
        ...     sale_type=SaleType.ECOMMERCE,
        ...     branch_id=1,  # Sucursal que procesará
        ...     user_id=None,  # Sin vendedor específico
        ...     customer_name="María González",
        ...     customer_email="maria@example.com",
        ...     customer_phone="+5491112345678",
        ...     subtotal=2500.00,
        ...     tax_amount=525.00,
        ...     discount_amount=250.00,  # Cupón descuento
        ...     total_amount=2775.00,
        ...     payment_method="MercadoPago",
        ...     order_status=OrderStatus.PENDING  # Esperando pago
        ... )
        >>> db.add(sale)
        >>> db.commit()
    
    Reportes comunes:
        # Ventas del día por sucursal
        today_sales = db.query(Sale).filter(
            Sale.branch_id == branch_id,
            func.date(Sale.created_at) == date.today()
        ).all()
        
        # Ventas por canal
        pos_sales = db.query(Sale).filter(Sale.sale_type == SaleType.POS).count()
        ecom_sales = db.query(Sale).filter(Sale.sale_type == SaleType.ECOMMERCE).count()
        
        # Órdenes pendientes (e-commerce)
        pending = db.query(Sale).filter(
            Sale.sale_type == SaleType.ECOMMERCE,
            Sale.order_status == OrderStatus.PENDING
        ).all()
    
    See Also:
        - SaleItem: Líneas de productos vendidos
        - app/models/enums: SaleType, OrderStatus
        - app/services/sales_service: Lógica de creación de ventas
    """
    __tablename__ = "sales"
    
    # ===== IDENTIFICACIÓN =====
    
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        doc="Identificador único autoincremental de la venta"
    )
    
    sale_number = Column(
        String(50), 
        unique=True,  # Constraint: Número de venta único en todo el sistema
        index=True,   # Índice para búsquedas rápidas por número
        nullable=False,
        doc="Número único de venta. Formato: V-{timestamp}-{id} (POS) o E-{timestamp}-{id} (E-commerce)"
    )
    
    sale_type = Column(
        Enum(SaleType), 
        nullable=False,
        index=True,  # Índice para filtrar por canal
        doc="Canal de venta: POS (presencial) o ECOMMERCE (online)"
    )
    
    # ===== CONTEXTO DE LA VENTA =====
    
    branch_id = Column(
        Integer, 
        ForeignKey("branches.id"),
        index=True,  # Índice para reportes por sucursal
        doc="ID de la sucursal donde se procesó la venta (POS) o desde donde se enviará (e-commerce)"
    )
    
    user_id = Column(
        Integer, 
        ForeignKey("users.id"),
        index=True,  # Índice para reportes por vendedor
        doc="ID del vendedor que atendió (POS) o NULL para ventas de e-commerce automáticas"
    )
    
    # ===== INFORMACIÓN DEL CLIENTE =====
    
    customer_name = Column(
        String(100),
        doc="Nombre completo del cliente (opcional para POS, obligatorio para e-commerce)"
    )
    
    customer_email = Column(
        String(100),
        index=True,  # Índice para búsqueda de clientes
        doc="Email del cliente para envío de factura y notificaciones (obligatorio para e-commerce)"
    )
    
    customer_phone = Column(
        String(20),
        doc="Teléfono de contacto del cliente (obligatorio para e-commerce con envío)"
    )
    
    # ===== MONTOS FINANCIEROS =====
    
    subtotal = Column(
        Numeric(10, 2),  # Hasta 99,999,999.99
        nullable=False,
        doc="Subtotal de la venta (suma de SaleItems.total_price) antes de impuestos y descuentos"
    )
    
    tax_amount = Column(
        Numeric(10, 2), 
        default=0,
        doc="Monto de impuestos aplicados (subtotal * tax_rate_percentage / 100)"
    )
    
    discount_amount = Column(
        Numeric(10, 2), 
        default=0,
        doc="Monto de descuento aplicado (cupones, promociones, descuento manual)"
    )
    
    total_amount = Column(
        Numeric(10, 2), 
        nullable=False,
        index=True,  # Índice para reportes de ventas por monto
        doc="Monto total final de la venta (subtotal + tax_amount - discount_amount)"
    )
    
    # ===== INFORMACIÓN DE PAGO =====
    
    payment_method = Column(
        String(50),
        index=True,  # Índice para reportes por método de pago
        doc="Método de pago utilizado: Efectivo, Tarjeta de Crédito, Tarjeta de Débito, "
            "Transferencia, MercadoPago, etc."
    )
    
    payment_method_id = Column(
        Integer,
        nullable=True,
        doc="Referencia a payment_methods.id (configuración del método de pago usado)"
    )
    
    payment_method_name = Column(
        String(100), 
        nullable=True,
        doc="Snapshot del nombre del método de pago al momento de la venta (trazabilidad)"
    )
    
    # ===== ESTADO DE ORDEN (SOLO E-COMMERCE) =====
    
    order_status = Column(
        Enum(OrderStatus), 
        default=OrderStatus.PENDING,
        index=True,  # Índice para filtrar órdenes por estado
        doc="Estado actual del pedido de e-commerce. NULL para ventas POS. "
            "Valores: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED"
    )
    
    # ===== IMPUESTOS (SNAPSHOT PARA TRAZABILIDAD) =====
    
    tax_rate_id = Column(
        Integer, 
        nullable=True,
        doc="Referencia a tax_rates.id (configuración de impuesto aplicada)"
    )
    
    tax_rate_name = Column(
        String(100), 
        nullable=True,
        doc="Snapshot del nombre de la tasa de impuesto al momento de la venta (ej: 'IVA 21%')"
    )
    
    tax_rate_percentage = Column(
        Numeric(5, 2),  # Hasta 999.99%
        nullable=True,
        doc="Snapshot del porcentaje de impuesto aplicado al momento de la venta (ej: 21.00)"
    )
    
    # ===== NOTAS Y OBSERVACIONES =====
    
    notes = Column(
        Text,
        doc="Notas adicionales de la venta: observaciones del vendedor, instrucciones de envío, "
            "detalles de devolución, etc."
    )
    
    # ===== AUDITORÍA =====
    
    created_at = Column(
        DateTime, 
        default=func.now(),
        index=True,  # Índice para reportes por fecha
        doc="Timestamp de creación de la venta (fecha y hora de la transacción)"
    )
    
    updated_at = Column(
        DateTime, 
        default=func.now(), 
        onupdate=func.now(),
        doc="Timestamp de última modificación (cambios de estado, correcciones, etc.)"
    )
    
    # ===== RELACIONES =====
    
    branch = relationship(
        "Branch", 
        back_populates="sales",
        doc="Sucursal donde se procesó la venta (POS) o desde donde se enviará (e-commerce)"
    )
    
    user = relationship(
        "User", 
        back_populates="sales",
        doc="Vendedor que atendió la venta (POS) o NULL para e-commerce automático"
    )
    
    sale_items = relationship(
        "SaleItem", 
        back_populates="sale",
        cascade="all, delete-orphan",  # Al eliminar Sale, eliminar sus SaleItems
        doc="Lista de productos vendidos en esta transacción (líneas de venta)"
    )
    
    # ===== MÉTODOS DE NEGOCIO =====
    
    def is_pos_sale(self) -> bool:
        """Verifica si es una venta POS (presencial)."""
        return self.sale_type == SaleType.POS
    
    def is_ecommerce_sale(self) -> bool:
        """Verifica si es una venta de e-commerce (online)."""
        return self.sale_type == SaleType.ECOMMERCE
    
    def is_pending(self) -> bool:
        """Verifica si es una orden pendiente de procesar."""
        return self.order_status == OrderStatus.PENDING
    
    def is_completed(self) -> bool:
        """Verifica si la orden fue entregada (estado final exitoso)."""
        return self.order_status == OrderStatus.DELIVERED
    
    def is_cancelled(self) -> bool:
        """Verifica si la orden fue cancelada."""
        return self.order_status == OrderStatus.CANCELLED
    
    def can_be_cancelled(self) -> bool:
        """
        Verifica si la orden puede ser cancelada.
        
        Reglas:
            - POS sales: NO se pueden cancelar (usar devolución)
            - E-commerce PENDING: Siempre cancelable
            - E-commerce PROCESSING: Cancelable con reembolso
            - E-commerce SHIPPED/DELIVERED: NO cancelable (usar devolución)
        """
        if self.is_pos_sale():
            return False
        
        if self.is_ecommerce_sale():
            return self.order_status in [
                OrderStatus.PENDING, 
                OrderStatus.PROCESSING
            ]
        
        return False
    
    def calculate_profit_margin(self) -> float:
        """
        Calcula el margen de ganancia de la venta.
        
        Requiere que los SaleItems tengan información de costo.
        
        Returns:
            float: Margen de ganancia en porcentaje (0-100)
        """
        total_cost = sum(
            item.quantity * (item.product.cost or 0) 
            for item in self.sale_items
        )
        
        if total_cost == 0:
            return 0.0
        
        profit = float(self.total_amount) - total_cost
        return (profit / total_cost) * 100
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        return (
            f"<Sale("
            f"number='{self.sale_number}', "
            f"type={self.sale_type.value}, "
            f"total={self.total_amount}, "
            f"status={self.order_status.value if self.order_status else 'N/A'}"
            f")>"
        )


class SaleItem(Base):
    """
    Línea individual de producto dentro de una venta.
    
    Cada SaleItem representa un producto específico vendido dentro de
    una transacción de venta, con su cantidad, precio unitario y talle.
    
    Relación con Sale:
        - Una Sale tiene múltiples SaleItems (1:N)
        - Al eliminar Sale, se eliminan sus SaleItems (cascade)
        - El subtotal de Sale = SUM(SaleItem.total_price)
    
    Snapshot de precios:
        Los precios se almacenan como snapshot al momento de la venta:
            - unit_price: Precio unitario al momento de venta (no cambia si Product.price cambia)
            - total_price: Precio total de la línea (quantity * unit_price)
        
        Esto garantiza que reportes históricos sean precisos incluso si
        los precios de productos cambian después de la venta.
    
    Attributes:
        id (int): Identificador único de la línea
        sale_id (int): ID de la venta padre (FK → sales.id)
        product_id (int): ID del producto vendido (FK → products.id)
        quantity (int): Cantidad vendida del producto
        unit_price (Decimal): Precio unitario al momento de venta (snapshot)
        total_price (Decimal): Precio total (quantity * unit_price)
        size (str): Talle específico si aplica (XS, S, M, L, 35, 36, etc.)
    
    Relationships:
        sale: Venta padre que contiene esta línea
        product: Producto vendido (para acceder a nombre, SKU, etc.)
    
    Business Rules:
        - unit_price es snapshot (NO reflejar Product.price actual)
        - total_price = quantity * unit_price (validar consistencia)
        - size es obligatorio si Product.has_sizes = True
        - Al crear SaleItem, descontar stock correspondiente
        - quantity debe ser > 0
        - unit_price debe ser > 0
    
    Manejo de stock:
        # Producto sin talles
        branch_stock = db.query(BranchStock).filter(
            BranchStock.product_id == product_id,
            BranchStock.branch_id == branch_id
        ).first()
        branch_stock.stock_quantity -= quantity
        
        # Producto con talles
        product_size = db.query(ProductSize).filter(
            ProductSize.product_id == product_id,
            ProductSize.branch_id == branch_id,
            ProductSize.size == size
        ).first()
        product_size.stock_quantity -= quantity
    
    Example (remera sin talle):
        >>> sale_item = SaleItem(
        ...     sale_id=1,
        ...     product_id=100,
        ...     quantity=2,
        ...     unit_price=1500.00,
        ...     total_price=3000.00,  # 2 * 1500
        ...     size=None  # No aplica
        ... )
        >>> db.add(sale_item)
        >>> db.commit()
    
    Example (zapatillas con talle):
        >>> sale_item = SaleItem(
        ...     sale_id=1,
        ...     product_id=200,
        ...     quantity=1,
        ...     unit_price=8500.00,
        ...     total_price=8500.00,
        ...     size="42"  # Talle obligatorio
        ... )
        >>> db.add(sale_item)
        >>> db.commit()
    
    Validaciones:
        # Antes de crear SaleItem
        if product.has_sizes and not size:
            raise ValueError("Talle obligatorio para este producto")
        
        if size and not product.has_sizes:
            raise ValueError("Este producto no maneja talles")
        
        if not has_sufficient_stock(product_id, branch_id, quantity, size):
            raise ValueError("Stock insuficiente")
    
    Reportes:
        # Productos más vendidos
        top_products = db.query(
            SaleItem.product_id,
            func.sum(SaleItem.quantity).label('total_qty')
        ).group_by(SaleItem.product_id).order_by(desc('total_qty')).limit(10).all()
        
        # Ventas por talle (calzado)
        size_sales = db.query(
            SaleItem.size,
            func.sum(SaleItem.quantity)
        ).filter(
            SaleItem.product_id == product_id
        ).group_by(SaleItem.size).all()
    
    See Also:
        - Sale: Venta padre que contiene este ítem
        - Product: Información del producto vendido
        - BranchStock/ProductSize: Gestión de stock
    """
    __tablename__ = "sale_items"
    
    # ===== IDENTIFICADORES =====
    
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        doc="Identificador único autoincremental de la línea de venta"
    )
    
    sale_id = Column(
        Integer, 
        ForeignKey("sales.id"),
        nullable=False,
        index=True,  # Índice para queries por venta
        doc="ID de la venta padre a la que pertenece esta línea"
    )
    
    product_id = Column(
        Integer, 
        ForeignKey("products.id"),
        nullable=False,
        index=True,  # Índice para reportes por producto
        doc="ID del producto vendido en esta línea"
    )
    
    # ===== CANTIDAD Y PRECIOS =====
    
    quantity = Column(
        Integer, 
        nullable=False,
        doc="Cantidad vendida del producto (debe ser > 0)"
    )
    
    unit_price = Column(
        Numeric(10, 2), 
        nullable=False,
        doc="Precio unitario al momento de la venta (snapshot, NO refleja Product.price actual)"
    )
    
    total_price = Column(
        Numeric(10, 2), 
        nullable=False,
        doc="Precio total de la línea (quantity * unit_price). "
            "Validar: total_price = quantity * unit_price"
    )
    
    # ===== VARIANTE (TALLE) =====
    
    size = Column(
        String(10),
        index=True,  # Índice para reportes por talle
        doc="Talle específico del producto si aplica (XS, S, M, L, XL, 35, 36, etc.). "
            "Obligatorio si Product.has_sizes = True, NULL si has_sizes = False"
    )
    
    # ===== RELACIONES =====
    
    sale = relationship(
        "Sale", 
        back_populates="sale_items",
        doc="Venta padre que contiene esta línea (permite acceder a Sale.sale_number, totales, etc.)"
    )
    
    product = relationship(
        "Product", 
        back_populates="sale_items",
        doc="Producto vendido en esta línea (permite acceder a Product.name, SKU, categoría, etc.)"
    )
    
    # ===== MÉTODOS DE NEGOCIO =====
    
    def validate_total_price(self) -> bool:
        """
        Valida que total_price = quantity * unit_price.
        
        Returns:
            bool: True si el cálculo es correcto
        
        Example:
            >>> item = SaleItem(quantity=3, unit_price=100.50, total_price=301.50)
            >>> item.validate_total_price()
            True
        """
        expected_total = float(self.quantity * self.unit_price)
        actual_total = float(self.total_price)
        # Comparar con tolerancia de 0.01 por redondeo
        return abs(expected_total - actual_total) < 0.01
    
    def get_profit(self) -> float:
        """
        Calcula la ganancia de esta línea.
        
        Requiere que Product.cost esté definido.
        
        Returns:
            float: Ganancia (total_price - costo_total)
        """
        if not self.product or not self.product.cost:
            return 0.0
        
        total_cost = self.quantity * float(self.product.cost)
        return float(self.total_price) - total_cost
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        size_info = f", size={self.size}" if self.size else ""
        return (
            f"<SaleItem("
            f"sale_id={self.sale_id}, "
            f"product_id={self.product_id}, "
            f"qty={self.quantity}, "
            f"price={self.unit_price}"
            f"{size_info}"
            f")>"
        )
