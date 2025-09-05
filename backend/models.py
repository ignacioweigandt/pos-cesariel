"""
Modelos de base de datos para el sistema POS Cesariel.

Este módulo define todas las entidades del sistema utilizando SQLAlchemy ORM,
incluyendo usuarios, sucursales, productos, ventas y configuraciones.

Las relaciones entre entidades están claramente definidas para mantener
la integridad referencial y facilitar las consultas complejas.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(enum.Enum):
    """
    Roles de usuario disponibles en el sistema POS Cesariel.
    
    - ADMIN: Acceso completo al sistema, gestión de usuarios y configuración
    - MANAGER: Gestión de sucursal, inventario, reportes y usuarios de sucursal  
    - SELLER: Operaciones de punto de venta únicamente
    - ECOMMERCE: Gestión de e-commerce y reportes de ventas online
    """
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SELLER = "SELLER"
    ECOMMERCE = "ECOMMERCE"


class SaleType(enum.Enum):
    """
    Tipos de venta soportados por el sistema.
    
    - POS: Venta realizada en punto de venta físico
    - ECOMMERCE: Venta realizada a través del e-commerce
    """
    POS = "POS"
    ECOMMERCE = "ECOMMERCE"


class OrderStatus(enum.Enum):
    """
    Estados posibles de una orden en el sistema.
    
    - PENDING: Orden creada pero pendiente de procesamiento
    - PROCESSING: Orden en proceso de preparación
    - SHIPPED: Orden enviada al cliente
    - DELIVERED: Orden entregada exitosamente
    - CANCELLED: Orden cancelada
    """
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Branch(Base):
    """
    Modelo de Sucursal para el sistema multisucursal POS Cesariel.
    
    Representa una sucursal física donde se realizan operaciones de venta,
    gestión de inventario y administración de usuarios locales.
    
    Attributes:
        id (int): Identificador único de la sucursal
        name (str): Nombre descriptivo de la sucursal (máx. 100 caracteres)
        address (str): Dirección física de la sucursal (máx. 200 caracteres)
        phone (str): Número de teléfono de contacto (máx. 20 caracteres)
        email (str): Email de contacto de la sucursal (máx. 100 caracteres)
        is_active (bool): Indica si la sucursal está activa operativamente
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        users: Lista de usuarios asignados a esta sucursal
        sales: Lista de ventas realizadas en esta sucursal
    """
    __tablename__ = "branches"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True, 
                doc="Identificador único autoincremental de la sucursal")
    name = Column(String(100), nullable=False,
                  doc="Nombre descriptivo de la sucursal")
    address = Column(String(200), 
                     doc="Dirección física completa de la sucursal")
    phone = Column(String(20),
                   doc="Número de teléfono de contacto")
    email = Column(String(100),
                   doc="Email de contacto institucional")
    
    # Campos de control
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la sucursal")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    users = relationship("User", back_populates="branch",
                        doc="Usuarios asignados a esta sucursal")
    sales = relationship("Sale", back_populates="branch",
                        doc="Ventas realizadas en esta sucursal")
    inventory_movements = relationship("InventoryMovement", back_populates="branch",
                                     doc="Movimientos de inventario de esta sucursal")

class User(Base):
    """
    Modelo de Usuario del sistema POS Cesariel.
    
    Representa a todos los usuarios que pueden acceder al sistema,
    incluyendo administradores, gerentes, vendedores y usuarios de e-commerce.
    Cada usuario está asignado a una sucursal específica y tiene un rol definido
    que determina sus permisos y funcionalidades disponibles.
    
    Attributes:
        id (int): Identificador único del usuario
        email (str): Email único del usuario, usado para notificaciones y recuperación
        username (str): Nombre de usuario único para login (máx. 50 caracteres)
        full_name (str): Nombre completo del usuario (máx. 100 caracteres)
        hashed_password (str): Contraseña hasheada con bcrypt (máx. 255 caracteres)
        role (UserRole): Rol del usuario que determina permisos (ADMIN, MANAGER, SELLER, ECOMMERCE)
        branch_id (int): ID de la sucursal asignada (FK hacia branches.id)
        is_active (bool): Estado activo/inactivo del usuario
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        branch: Sucursal asignada al usuario
        sales: Lista de ventas realizadas por este usuario
    """
    __tablename__ = "users"
    
    # Campos principales de identificación
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental del usuario")
    email = Column(String(100), unique=True, index=True, nullable=False,
                   doc="Email único del usuario para autenticación y notificaciones")
    username = Column(String(50), unique=True, index=True, nullable=False,
                      doc="Nombre de usuario único para inicio de sesión")
    full_name = Column(String(100), nullable=False,
                       doc="Nombre completo del usuario para mostrar en interfaz")
    
    # Campos de seguridad y autorización
    hashed_password = Column(String(255), nullable=False,
                             doc="Contraseña encriptada usando bcrypt")
    role = Column(Enum(UserRole), nullable=False,
                  doc="Rol del usuario que define permisos del sistema")
    
    # Asignación de sucursal
    branch_id = Column(Integer, ForeignKey("branches.id"),
                       doc="ID de la sucursal asignada al usuario")
    
    # Campos de control
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo del usuario")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    branch = relationship("Branch", back_populates="users",
                         doc="Sucursal asignada al usuario")
    sales = relationship("Sale", back_populates="user",
                        doc="Ventas realizadas por este usuario")

class Category(Base):
    """
    Modelo de Categoría de productos del sistema POS Cesariel.
    
    Organiza los productos en categorías para facilitar la navegación,
    búsqueda y gestión del inventario tanto en el POS como en el e-commerce.
    Las categorías pueden ser usadas para filtros, reportes y organización visual.
    
    Attributes:
        id (int): Identificador único de la categoría
        name (str): Nombre descriptivo de la categoría (máx. 100 caracteres)
        description (str): Descripción detallada opcional de la categoría
        is_active (bool): Estado activo/inactivo de la categoría
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        products: Lista de productos que pertenecen a esta categoría
    """
    __tablename__ = "categories"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental de la categoría")
    name = Column(String(100), nullable=False,
                  doc="Nombre descriptivo de la categoría")
    description = Column(Text,
                        doc="Descripción detallada opcional de la categoría")
    
    # Campos de control
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la categoría")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    products = relationship("Product", back_populates="category",
                           doc="Productos que pertenecen a esta categoría")

class Product(Base):
    """
    Modelo de Producto del sistema POS Cesariel.
    
    Representa todos los productos/artículos disponibles para venta tanto en
    POS como en e-commerce. Maneja inventario centralizado con soporte para
    múltiples sucursales, talles/variantes, imágenes y precios diferenciados.
    
    Attributes:
        id (int): Identificador único del producto
        name (str): Nombre comercial del producto (máx. 200 caracteres)
        description (str): Descripción detallada del producto
        sku (str): Código SKU único del producto (máx. 50 caracteres)
        barcode (str): Código de barras único para escaneo (máx. 50 caracteres)
        category_id (int): ID de la categoría asignada (FK hacia categories.id)
        price (decimal): Precio de venta en POS (10 dígitos, 2 decimales)
        cost (decimal): Costo del producto para cálculo de margen
        stock_quantity (int): Stock general del producto (suma de todas las sucursales)
        min_stock (int): Stock mínimo para alertas de reposición
        is_active (bool): Estado activo/inactivo del producto
        show_in_ecommerce (bool): Visibilidad en tienda online
        ecommerce_price (decimal): Precio específico para e-commerce
        image_url (str): URL de imagen principal del producto
        has_sizes (bool): Indica si el producto maneja talles/variantes
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        category: Categoría asignada al producto
        sale_items: Items de venta que incluyen este producto
        inventory_movements: Movimientos de stock del producto
        branch_stocks: Stock específico por sucursal
        product_sizes: Talles/variantes disponibles del producto
        product_images: Imágenes adicionales del producto
    """
    __tablename__ = "products"
    
    # Campos principales de identificación
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental del producto")
    name = Column(String(200), nullable=False,
                  doc="Nombre comercial del producto")
    description = Column(Text,
                        doc="Descripción detallada del producto")
    
    # Códigos de identificación únicos
    sku = Column(String(50), unique=True, index=True, nullable=False,
                 doc="Código SKU único del producto")
    barcode = Column(String(50), unique=True, index=True,
                     doc="Código de barras único para escaneo POS")
    
    # Categorización
    category_id = Column(Integer, ForeignKey("categories.id"),
                         doc="ID de la categoría asignada al producto")
    
    # Precios y costos
    price = Column(Numeric(10, 2), nullable=False,
                   doc="Precio de venta en POS (con 2 decimales)")
    cost = Column(Numeric(10, 2),
                  doc="Costo del producto para cálculo de margen")
    ecommerce_price = Column(Numeric(10, 2),
                             doc="Precio específico para tienda online")
    
    # Control de inventario
    stock_quantity = Column(Integer, default=0,
                            doc="Stock global calculado (suma de todas las sucursales)")
    min_stock = Column(Integer, default=0,
                       doc="Stock mínimo global para alertas de reposición")
    
    # Configuración de producto
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo del producto")
    show_in_ecommerce = Column(Boolean, default=True,
                               doc="Visibilidad en tienda online")
    has_sizes = Column(Boolean, default=False,
                       doc="Indica si el producto maneja talles/variantes")
    
    # Recursos multimedia
    image_url = Column(String(255),
                       doc="URL de imagen principal del producto")
    
    # Campos de auditoría
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    category = relationship("Category", back_populates="products",
                           doc="Categoría asignada al producto")
    sale_items = relationship("SaleItem", back_populates="product",
                             doc="Items de venta que incluyen este producto")
    inventory_movements = relationship("InventoryMovement", back_populates="product",
                                     doc="Movimientos de stock del producto")
    branch_stocks = relationship("BranchStock", back_populates="product",
                                doc="Stock específico por sucursal")
    product_sizes = relationship("ProductSize", back_populates="product",
                                doc="Talles/variantes disponibles del producto")
    product_images = relationship("ProductImage", back_populates="product",
                                 doc="Imágenes adicionales del producto")
    
    def get_stock_for_branch(self, branch_id):
        """
        Obtiene el stock específico para una sucursal.
        Para productos con talles, suma ProductSize de esa sucursal.
        
        Args:
            branch_id (int): ID de la sucursal
            
        Returns:
            int: Cantidad en stock para la sucursal especificada
        """
        if self.has_sizes:
            # Para productos con talles, sumar stock de ProductSize de la sucursal
            from sqlalchemy.orm import Session
            from sqlalchemy import func as sqlalchemy_func
            from database import SessionLocal
            db = SessionLocal()
            try:
                total = db.query(sqlalchemy_func.sum(ProductSize.stock_quantity)).filter(
                    ProductSize.product_id == self.id,
                    ProductSize.branch_id == branch_id
                ).scalar() or 0
                return int(total)
            finally:
                db.close()
        else:
            # Para productos sin talles, usar BranchStock
            branch_stock = next((bs for bs in self.branch_stocks if bs.branch_id == branch_id), None)
            return branch_stock.stock_quantity if branch_stock else 0
    
    def get_available_stock_for_branch(self, branch_id):
        """
        Obtiene el stock disponible (no reservado) para una sucursal.
        Para productos con talles, usa ProductSize de esa sucursal.
        
        Args:
            branch_id (int): ID de la sucursal
            
        Returns:
            int: Cantidad disponible para venta en la sucursal especificada
        """
        if self.has_sizes:
            # Para productos con talles, usar el stock de ProductSize (mismo que get_stock_for_branch por ahora)
            return self.get_stock_for_branch(branch_id)
        else:
            # Para productos sin talles, usar BranchStock disponible
            branch_stock = next((bs for bs in self.branch_stocks if bs.branch_id == branch_id), None)
            return branch_stock.available_stock if branch_stock else 0
    
    def calculate_total_stock(self):
        """
        Calcula el stock total sumando todas las sucursales.
        Para productos con talles, suma ProductSize, sino suma BranchStock.
        
        Returns:
            int: Stock total del producto
        """
        if self.has_sizes:
            # Para productos con talles, sumar todo el stock de ProductSize
            from sqlalchemy.orm import Session
            from sqlalchemy import func as sqlalchemy_func
            from database import SessionLocal
            db = SessionLocal()
            try:
                total = db.query(sqlalchemy_func.sum(ProductSize.stock_quantity)).filter(
                    ProductSize.product_id == self.id
                ).scalar() or 0
                return int(total)
            finally:
                db.close()
        else:
            # Para productos sin talles, sumar BranchStock
            return sum(bs.stock_quantity for bs in self.branch_stocks)
    
    def calculate_total_available_stock(self):
        """
        Calcula el stock disponible total sumando todas las sucursales.
        Para productos con talles, suma ProductSize, sino suma BranchStock.
        
        Returns:
            int: Stock disponible total del producto
        """
        if self.has_sizes:
            # Para productos con talles, sumar todo el stock de ProductSize (sin reserved_stock por ahora)
            from sqlalchemy.orm import Session
            from sqlalchemy import func as sqlalchemy_func
            from database import SessionLocal
            db = SessionLocal()
            try:
                total = db.query(sqlalchemy_func.sum(ProductSize.stock_quantity)).filter(
                    ProductSize.product_id == self.id
                ).scalar() or 0
                return int(total)
            finally:
                db.close()
        else:
            # Para productos sin talles, sumar BranchStock disponible
            return sum(bs.available_stock for bs in self.branch_stocks)
    
    def has_stock_in_branch(self, branch_id, quantity=1):
        """
        Verifica si hay suficiente stock en una sucursal específica.
        
        Args:
            branch_id (int): ID de la sucursal
            quantity (int): Cantidad requerida (default: 1)
            
        Returns:
            bool: True si hay stock suficiente en la sucursal
        """
        return self.get_available_stock_for_branch(branch_id) >= quantity
    
    def get_branches_with_stock(self):
        """
        Obtiene lista de sucursales que tienen stock del producto.
        
        Returns:
            list: Lista de IDs de sucursales con stock > 0
        """
        return [bs.branch_id for bs in self.branch_stocks if bs.stock_quantity > 0]
    
    def get_allowed_sizes(self):
        """
        Obtiene los talles válidos para este producto basado en su categoría.
        
        Returns:
            list: Lista de talles válidos para este producto
        """
        from utils.size_validators import get_valid_sizes_for_category
        
        if not self.has_sizes or not self.category:
            return []
        
        return get_valid_sizes_for_category(self.category.name)
    
    def is_valid_size(self, size: str) -> bool:
        """
        Valida si un talle es válido para este producto.
        
        Args:
            size (str): Talle a validar
            
        Returns:
            bool: True si el talle es válido para este producto
        """
        allowed_sizes = self.get_allowed_sizes()
        return size in allowed_sizes
    
    def __repr__(self):
        return f"<Product(id={self.id}, sku='{self.sku}', name='{self.name}', stock={self.stock_quantity})>"

class Sale(Base):
    """
    Modelo de Venta del sistema POS Cesariel.
    
    Representa todas las transacciones de venta realizadas tanto en POS
    como en e-commerce. Incluye información del cliente, montos, impuestos,
    descuentos y estado de la orden para un seguimiento completo.
    
    Attributes:
        id (int): Identificador único de la venta
        sale_number (str): Número único de venta generado automáticamente
        sale_type (SaleType): Tipo de venta (POS o ECOMMERCE)
        branch_id (int): ID de la sucursal donde se realizó la venta
        user_id (int): ID del usuario que procesó la venta
        customer_name (str): Nombre del cliente (máx. 100 caracteres)
        customer_email (str): Email del cliente para notificaciones
        customer_phone (str): Teléfono del cliente para contacto
        subtotal (decimal): Subtotal de la venta sin impuestos ni descuentos
        tax_amount (decimal): Monto de impuestos aplicados
        discount_amount (decimal): Monto de descuento aplicado
        total_amount (decimal): Monto total final de la venta
        payment_method (str): Método de pago utilizado
        order_status (OrderStatus): Estado actual de la orden
        notes (str): Notas adicionales de la venta
        created_at (datetime): Fecha y hora de creación de la venta
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        branch: Sucursal donde se realizó la venta
        user: Usuario que procesó la venta
        sale_items: Lista de productos vendidos en esta transacción
    """
    __tablename__ = "sales"
    
    # Campos principales de identificación
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental de la venta")
    sale_number = Column(String(50), unique=True, index=True, nullable=False,
                         doc="Número único de venta generado automáticamente")
    sale_type = Column(Enum(SaleType), nullable=False,
                       doc="Tipo de venta (POS presencial o ECOMMERCE online)")
    
    # Asignación de sucursal y usuario
    branch_id = Column(Integer, ForeignKey("branches.id"),
                       doc="ID de la sucursal donde se realizó la venta")
    user_id = Column(Integer, ForeignKey("users.id"),
                     doc="ID del usuario que procesó la venta")
    
    # Información del cliente
    customer_name = Column(String(100),
                          doc="Nombre del cliente")
    customer_email = Column(String(100),
                           doc="Email del cliente para notificaciones")
    customer_phone = Column(String(20),
                           doc="Teléfono del cliente para contacto")
    
    # Montos financieros
    subtotal = Column(Numeric(10, 2), nullable=False,
                      doc="Subtotal de la venta sin impuestos ni descuentos")
    tax_amount = Column(Numeric(10, 2), default=0,
                        doc="Monto de impuestos aplicados")
    discount_amount = Column(Numeric(10, 2), default=0,
                             doc="Monto de descuento aplicado")
    total_amount = Column(Numeric(10, 2), nullable=False,
                          doc="Monto total final de la venta")
    
    # Información de pago y estado
    payment_method = Column(String(50),
                            doc="Método de pago utilizado (efectivo, tarjeta, etc.)")
    order_status = Column(Enum(OrderStatus), default=OrderStatus.PENDING,
                          doc="Estado actual de la orden")
    
    # Información adicional
    notes = Column(Text,
                   doc="Notas adicionales de la venta")
    
    # Campos de auditoría
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación de la venta")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    branch = relationship("Branch", back_populates="sales",
                         doc="Sucursal donde se realizó la venta")
    user = relationship("User", back_populates="sales",
                       doc="Usuario que procesó la venta")
    sale_items = relationship("SaleItem", back_populates="sale",
                             doc="Lista de productos vendidos en esta transacción")

class SaleItem(Base):
    """
    Modelo de Ítem de Venta del sistema POS Cesariel.
    
    Representa cada producto individual vendido dentro de una transacción.
    Permite manejar productos con talles específicos, precios unitarios
    y cantidades variables por cada línea de venta.
    
    Attributes:
        id (int): Identificador único del ítem de venta
        sale_id (int): ID de la venta padre (FK hacia sales.id)
        product_id (int): ID del producto vendido (FK hacia products.id)
        quantity (int): Cantidad vendida del producto
        unit_price (decimal): Precio unitario al momento de la venta
        total_price (decimal): Precio total de la línea (quantity * unit_price)
        size (str): Talle específico del producto (opcional, máx. 10 caracteres)
        
    Relationships:
        sale: Venta padre que contiene este ítem
        product: Producto vendido en esta línea
    """
    __tablename__ = "sale_items"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único del ítem de venta")
    sale_id = Column(Integer, ForeignKey("sales.id"),
                     doc="ID de la venta padre")
    product_id = Column(Integer, ForeignKey("products.id"),
                        doc="ID del producto vendido")
    
    # Cantidad y precios
    quantity = Column(Integer, nullable=False,
                      doc="Cantidad vendida del producto")
    unit_price = Column(Numeric(10, 2), nullable=False,
                        doc="Precio unitario al momento de la venta")
    total_price = Column(Numeric(10, 2), nullable=False,
                         doc="Precio total de la línea (quantity * unit_price)")
    
    # Información de variante
    size = Column(String(10),
                  doc="Talle específico del producto (para productos con talles)")
    
    # Relaciones con otras entidades
    sale = relationship("Sale", back_populates="sale_items",
                       doc="Venta padre que contiene este ítem")
    product = relationship("Product", back_populates="sale_items",
                          doc="Producto vendido en esta línea")

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

class EcommerceConfig(Base):
    """
    Modelo de Configuración de E-commerce del sistema POS Cesariel.
    
    Almacena toda la configuración general de la tienda online,
    incluyendo información de contacto, branding, impuestos y moneda.
    Esta configuración es utilizada por el frontend de e-commerce.
    
    Attributes:
        id (int): Identificador único de la configuración
        store_name (str): Nombre de la tienda online (máx. 100 caracteres)
        store_description (str): Descripción de la tienda para SEO y presentación
        store_logo (str): URL del logo de la tienda (máx. 255 caracteres)
        contact_email (str): Email de contacto de la tienda
        contact_phone (str): Teléfono de contacto de la tienda
        address (str): Dirección física de la tienda (máx. 200 caracteres)
        is_active (bool): Estado activo/inactivo del e-commerce
        tax_percentage (decimal): Porcentaje de impuesto por defecto (5 dígitos, 2 decimales)
        currency (str): Moneda utilizada en la tienda (ISO 4217, máx. 10 caracteres)
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    __tablename__ = "ecommerce_config"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración de e-commerce")
    store_name = Column(String(100), nullable=False,
                        doc="Nombre de la tienda online")
    store_description = Column(Text,
                              doc="Descripción de la tienda para SEO y presentación")
    store_logo = Column(String(255),
                        doc="URL del logo de la tienda (Cloudinary u otro CDN)")
    
    # Información de contacto
    contact_email = Column(String(100),
                          doc="Email de contacto de la tienda")
    contact_phone = Column(String(20),
                          doc="Teléfono de contacto de la tienda")
    address = Column(String(200),
                     doc="Dirección física de la tienda")
    
    # Configuración financiera
    tax_percentage = Column(Numeric(5, 2), default=0,
                            doc="Porcentaje de impuesto por defecto")
    currency = Column(String(10), default="USD",
                      doc="Moneda utilizada en la tienda (ISO 4217)")
    
    # Estado y auditoría
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo del e-commerce")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")

class PaymentConfig(Base):
    """
    Modelo de Configuración de Métodos de Pago del sistema POS Cesariel.
    
    Define los diferentes métodos de pago disponibles en el sistema,
    incluyendo recargos por tipo de tarjeta, cuotas disponibles y
    configuraciones específicas para cada método.
    
    Attributes:
        id (int): Identificador único de la configuración de pago
        payment_type (str): Tipo de pago (efectivo, tarjeta, transferencia, etc.)
        card_type (str): Subtipo de tarjeta (bancarizadas, no_bancarizadas, tarjeta_naranja)
        installments (int): Número de cuotas disponibles
        surcharge_percentage (decimal): Porcentaje de recargo aplicado
        is_active (bool): Estado activo/inactivo del método de pago
        description (str): Descripción del método de pago
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    __tablename__ = "payment_config"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración de pago")
    payment_type = Column(String(50), nullable=False,
                          doc="Tipo de pago (efectivo, tarjeta, transferencia, etc.)")
    card_type = Column(String(50),
                       doc="Subtipo de tarjeta (bancarizadas, no_bancarizadas, etc.)")
    
    # Configuración financiera
    installments = Column(Integer, default=1,
                          doc="Número de cuotas disponibles")
    surcharge_percentage = Column(Numeric(5, 2), default=0,
                                  doc="Porcentaje de recargo aplicado")
    
    # Información adicional
    description = Column(String(200),
                        doc="Descripción del método de pago")
    
    # Estado y auditoría
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo del método de pago")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")

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

class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    image_order = Column(Integer, default=1)  # 1, 2, 3 for ordering
    alt_text = Column(String(255))
    is_main = Column(Boolean, default=False)  # Primary product image
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="product_images")
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )

class StoreBanner(Base):
    __tablename__ = "store_banners"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300))
    image_url = Column(String(500), nullable=False)
    link_url = Column(String(500))
    button_text = Column(String(100))
    banner_order = Column(Integer, default=1)  # 1, 2, 3 for ordering
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )

class WhatsAppSale(Base):
    __tablename__ = "whatsapp_sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    customer_whatsapp = Column(String(20), nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_address = Column(Text)
    shipping_method = Column(String(50))  # pickup, delivery, shipping
    shipping_cost = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    whatsapp_chat_url = Column(String(500))  # Generated WhatsApp chat URL
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    sale = relationship("Sale")
    
    # Constraints
    __table_args__ = (
        {"extend_existing": True},
    )

class SocialMediaConfig(Base):
    """
    Modelo de Configuración de Redes Sociales del sistema POS Cesariel.
    
    Almacena los enlaces y configuración de redes sociales de la tienda
    que se mostrarán en el e-commerce para conectar con los clientes
    a través de diferentes plataformas sociales.
    
    Attributes:
        id (int): Identificador único de la configuración de red social
        platform (str): Nombre de la plataforma (facebook, instagram, twitter, etc.)
        username (str): Nombre de usuario en la plataforma (opcional)
        url (str): URL completa del perfil de la red social
        is_active (bool): Estado activo/inactivo de la red social
        display_order (int): Orden de visualización en el frontend
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    __tablename__ = "social_media_config"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración de red social")
    platform = Column(String(50), nullable=False,
                      doc="Nombre de la plataforma (facebook, instagram, twitter, whatsapp, etc.)")
    username = Column(String(100),
                      doc="Nombre de usuario en la plataforma (opcional)")
    url = Column(String(500),
                 doc="URL completa del perfil de la red social")
    
    # Configuración de visualización
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la red social")
    display_order = Column(Integer, default=1,
                           doc="Orden de visualización en el frontend")
    
    # Campos de auditoría
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Restricciones de tabla
    __table_args__ = (
        {"extend_existing": True},
    )

class WhatsAppConfig(Base):
    """
    Modelo de Configuración de WhatsApp del sistema POS Cesariel.
    
    Gestiona la configuración de WhatsApp Business para la integración
    con el e-commerce, permitiendo la comunicación directa con clientes
    para coordinar pedidos, consultas y servicio al cliente.
    
    Attributes:
        id (int): Identificador único de la configuración de WhatsApp
        business_phone (str): Número de WhatsApp empresarial (con código de país)
        business_name (str): Nombre del negocio mostrado en WhatsApp
        welcome_message (str): Mensaje de bienvenida personalizado
        business_hours (str): Horarios de atención del negocio
        auto_response_enabled (bool): Activación de respuesta automática
        is_active (bool): Estado activo/inactivo de la integración WhatsApp
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
    """
    __tablename__ = "whatsapp_config"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único de la configuración de WhatsApp")
    business_phone = Column(String(20), nullable=False,
                            doc="Número de WhatsApp empresarial (con código de país)")
    business_name = Column(String(100), nullable=False,
                           doc="Nombre del negocio mostrado en WhatsApp")
    
    # Mensajería y comunicación
    welcome_message = Column(Text,
                            doc="Mensaje de bienvenida personalizado para nuevos contactos")
    business_hours = Column(String(200),
                           doc="Horarios de atención del negocio")
    auto_response_enabled = Column(Boolean, default=False,
                                   doc="Activación de respuesta automática")
    
    # Estado y auditoría
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la integración WhatsApp")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")