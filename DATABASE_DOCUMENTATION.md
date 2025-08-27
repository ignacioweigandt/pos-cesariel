# Documentación Completa de la Base de Datos - POS Cesariel

## Tabla de Contenidos
1. [Introducción y Arquitectura General](#introducción-y-arquitectura-general)
2. [Configuración y Conexión](#configuración-y-conexión)
3. [Entidades Principales y Relaciones](#entidades-principales-y-relaciones)
4. [Sistema de Usuarios y Autenticación](#sistema-de-usuarios-y-autenticación)
5. [Arquitectura Multisucursal](#arquitectura-multisucursal)
6. [Gestión de Productos e Inventario](#gestión-de-productos-e-inventario)
7. [Sistema de Ventas y Transacciones](#sistema-de-ventas-y-transacciones)
8. [Gestión Avanzada de Talles](#gestión-avanzada-de-talles)
9. [Trazabilidad de Inventario](#trazabilidad-de-inventario)
10. [Configuración del E-commerce](#configuración-del-e-commerce)
11. [Sistema de Contenidos CMS](#sistema-de-contenidos-cms)
12. [Integraciones Sociales y WhatsApp](#integraciones-sociales-y-whatsapp)
13. [Índices y Optimizaciones](#índices-y-optimizaciones)
14. [Diagramas de Relaciones](#diagramas-de-relaciones)

## Introducción y Arquitectura General

La base de datos de POS Cesariel es un sistema relacional robusto diseñado con **PostgreSQL 15** como motor principal. Utiliza **SQLAlchemy ORM** para la definición de modelos y gestión de relaciones, implementando un diseño normalizado que garantiza integridad referencial y escalabilidad.

### Principios de Diseño:
- **Normalización Completa**: Eliminación de redundancia de datos
- **Integridad Referencial**: Constraints y foreign keys estrictos
- **Auditoría Temporal**: Timestamps automáticos en todas las entidades
- **Escalabilidad Horizontal**: Soporte para múltiples sucursales
- **Flexibilidad**: Extensible para nuevas funcionalidades
- **Performance**: Índices optimizados y consultas eficientes

### Características de la Arquitectura:
- **Multi-tenant por Sucursal**: Datos aislados por branch_id
- **Versionado de Stock**: Control granular por producto y talle
- **Trazabilidad Completa**: Log de todos los movimientos
- **Configuración Dinámica**: Sistema flexible de configuraciones
- **Integración E-commerce**: Datos compartidos entre POS y tienda online

## Configuración y Conexión

### Configuración del Motor PostgreSQL (`database.py`)

```python
# URL de conexión con variables de entorno
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/pos_cesariel"
)

# Motor SQLAlchemy optimizado para producción
engine = create_engine(
    DATABASE_URL,
    echo=False,              # Debug SQL queries (False en producción)
    pool_pre_ping=True,      # Verificar conexiones antes de usar
    pool_recycle=3600,       # Reciclar conexiones cada hora
    pool_size=10,            # Conexiones base en el pool
    max_overflow=20          # Conexiones adicionales bajo demanda
)

# Factory de sesiones con control manual
SessionLocal = sessionmaker(
    autocommit=False,        # Transacciones manuales
    autoflush=False,         # Flush manual para performance
    bind=engine
)

# Clase base declarativa
Base = declarative_base()
```

### Dependency Injection para FastAPI

```python
def get_db():
    """
    Generador de sesión para cada request HTTP.
    Garantiza limpieza automática de recursos.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Uso en endpoints
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()
```

### Parámetros de Optimización:
- **pool_size=10**: Pool base de 10 conexiones simultaneas
- **max_overflow=20**: Hasta 30 conexiones totales bajo carga
- **pool_recycle=3600**: Renovación cada hora para evitar timeouts
- **pool_pre_ping=True**: Validación automática de conexiones

## Entidades Principales y Relaciones

### Diagrama Conceptual de Entidades

```
┌─────────────────┐    1:N    ┌─────────────────┐    1:N    ┌─────────────────┐
│     Branch      │◄─────────►│     User        │◄─────────►│     Sale        │
│   (Sucursales)  │           │   (Usuarios)    │           │   (Ventas)      │
└─────────────────┘           └─────────────────┘           └─────────────────┘
         │                             │                             │
         │1:N                         │1:N                          │1:N
         ▼                             ▼                             ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│InventoryMovement│           │   BranchStock   │           │   SaleItem      │
│   (Movimientos) │           │(Stock/Sucursal) │           │ (Items Venta)   │
└─────────────────┘           └─────────────────┘           └─────────────────┘
         │                             │                             │
         │M:1                         │M:1                          │M:1
         ▼                             ▼                             ▼
┌─────────────────┐    1:N    ┌─────────────────┐    1:N    ┌─────────────────┐
│    Product      │◄─────────►│  ProductSize    │           │    Category     │
│  (Productos)    │           │   (Talles)      │           │ (Categorías)    │
└─────────────────┘           └─────────────────┘           └─────────────────┘
         │                                                           │
         │1:N                                                       │1:N
         ▼                                                           ▼
┌─────────────────┐                                         ┌─────────────────┐
│ ProductImage    │                                         │ EcommerceConfig │
│ (Imágenes Prod) │                                         │(Config E-comm)  │
└─────────────────┘                                         └─────────────────┘
```

### Jerarquía de Relaciones:
1. **Branch** → Base de la arquitectura multisucursal
2. **User** → Conecta con Branch, genera Sales
3. **Product** → Núcleo del inventario, se relaciona con categorías
4. **Sale** → Transacciones que conectan usuarios, sucursales y productos
5. **Configuration Tables** → Metadata del sistema y e-commerce

## Sistema de Usuarios y Autenticación

### Modelo User

```python
class UserRole(enum.Enum):
    """Jerarquía de roles con permisos específicos"""
    ADMIN = "ADMIN"          # Acceso completo al sistema
    MANAGER = "MANAGER"      # Gestión de sucursal e inventario  
    SELLER = "SELLER"        # Solo operaciones de venta
    ECOMMERCE = "ECOMMERCE"  # Gestión específica de tienda online

class User(Base):
    __tablename__ = "users"
    
    # Identificación única
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    
    # Seguridad
    hashed_password = Column(String(255), nullable=False)  # bcrypt hash
    role = Column(Enum(UserRole), nullable=False)
    
    # Asignación multisucursal
    branch_id = Column(Integer, ForeignKey("branches.id"))
    
    # Control de acceso
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    branch = relationship("Branch", back_populates="users")
    sales = relationship("Sale", back_populates="user")
```

### Características del Sistema de Usuarios:

#### **Seguridad Avanzada:**
- **Contraseñas bcrypt**: Hash seguro con salt automático
- **Emails únicos**: Validación a nivel de base de datos
- **Usernames únicos**: Prevención de duplicados
- **Índices optimizados**: Búsquedas rápidas por email/username

#### **Sistema de Roles Jerárquico:**
```python
# Jerarquía de permisos
ADMIN > MANAGER > SELLER > ECOMMERCE

# Módulos por rol
ADMIN: ['pos', 'inventory', 'users', 'reports', 'settings', 'ecommerce', 'branches']
MANAGER: ['pos', 'inventory', 'users', 'reports', 'ecommerce']
SELLER: ['pos']
ECOMMERCE: ['ecommerce', 'reports']
```

#### **Asociación Multisucursal:**
- Cada usuario pertenece a una sucursal específica
- ADMIN puede acceder a todas las sucursales
- Otros roles limitados a su sucursal asignada

## Arquitectura Multisucursal

### Modelo Branch

```python
class Branch(Base):
    """Sucursal - Entidad central de la arquitectura multisucursal"""
    __tablename__ = "branches"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    
    # Información de contacto
    address = Column(String(200))
    phone = Column(String(20))
    email = Column(String(100))
    
    # Estado operativo
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones dependientes
    users = relationship("User", back_populates="branch")
    sales = relationship("Sale", back_populates="branch")
    inventory_movements = relationship("InventoryMovement", back_populates="branch")
```

### Arquitectura Multi-tenant:

#### **Aislamiento por Sucursal:**
```sql
-- Todas las consultas incluyen filtro por sucursal
SELECT * FROM sales WHERE branch_id = :current_user_branch_id;
SELECT * FROM inventory_movements WHERE branch_id = :branch_id;
SELECT * FROM users WHERE branch_id = :branch_id;
```

#### **Ventajas del Diseño:**
- **Escalabilidad Horizontal**: Agregar sucursales sin reestructurar
- **Aislamiento de Datos**: Cada sucursal ve solo sus datos
- **Reportes Centralizados**: Admin puede ver todas las sucursales
- **Backup Selectivo**: Respaldo por sucursal individual

#### **Casos de Uso:**
- **Retail Chains**: Múltiples locales con inventarios independientes
- **Franchising**: Gestión centralizada con datos separados
- **Multi-location**: Empresas con sedes en diferentes ciudades

## Gestión de Productos e Inventario

### Modelo Product

```python
class Product(Base):
    """Producto - Centro del sistema de inventario"""
    __tablename__ = "products"
    
    # Identificación principal
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Códigos únicos para identificación
    sku = Column(String(50), unique=True, index=True, nullable=False)
    barcode = Column(String(50), unique=True, index=True)
    
    # Categorización
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    # Sistema de precios dual
    price = Column(Numeric(10, 2), nullable=False)           # Precio POS
    cost = Column(Numeric(10, 2))                            # Costo para margen
    ecommerce_price = Column(Numeric(10, 2))                # Precio específico e-commerce
    
    # Inventario centralizado
    stock_quantity = Column(Integer, default=0)              # Stock total
    min_stock = Column(Integer, default=0)                   # Umbral de reposición
    
    # Configuración de producto
    is_active = Column(Boolean, default=True)                # Activo/Inactivo
    show_in_ecommerce = Column(Boolean, default=True)        # Visibilidad online
    has_sizes = Column(Boolean, default=False)               # Manejo de talles
    
    # Multimedia
    image_url = Column(String(255))                          # Imagen principal
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones complejas
    category = relationship("Category", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
    inventory_movements = relationship("InventoryMovement", back_populates="product")
    branch_stocks = relationship("BranchStock", back_populates="product")
    product_sizes = relationship("ProductSize", back_populates="product")
    product_images = relationship("ProductImage", back_populates="product")
```

### Características del Sistema de Productos:

#### **Identificación Triple:**
```python
# 3 formas de identificar productos
product.id           # ID numérico interno
product.sku         # SKU alfanumérico único
product.barcode     # Código de barras para escáner
```

#### **Sistema de Precios Inteligente:**
- **price**: Precio base para POS
- **ecommerce_price**: Precio específico para tienda online
- **cost**: Costo para cálculo de margen y reportes

#### **Gestión de Stock Multi-nivel:**
```python
# Niveles de stock
1. stock_quantity    # Stock total consolidado
2. branch_stocks     # Stock específico por sucursal
3. product_sizes     # Stock por talle y sucursal
```

### Modelo Category

```python
class Category(Base):
    """Categoría - Organización jerárquica de productos"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relación con productos
    products = relationship("Product", back_populates="category")
```

#### **Casos de Uso de Categorías:**
- **Filtrado**: Búsqueda de productos por tipo
- **Reportes**: Analytics por categoría
- **E-commerce**: Navegación organizada
- **Pricing**: Estrategias de precios por categoría

## Sistema de Ventas y Transacciones

### Modelo Sale

```python
class SaleType(enum.Enum):
    """Canal de venta"""
    POS = "POS"              # Venta presencial en sucursal
    ECOMMERCE = "ECOMMERCE"  # Venta online desde e-commerce

class OrderStatus(enum.Enum):
    """Estados del ciclo de vida de la orden"""
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Sale(Base):
    """Venta - Transacción completa del sistema"""
    __tablename__ = "sales"
    
    # Identificación única
    id = Column(Integer, primary_key=True, index=True)
    sale_number = Column(String(50), unique=True, index=True, nullable=False)
    sale_type = Column(Enum(SaleType), nullable=False)
    
    # Contexto organizacional
    branch_id = Column(Integer, ForeignKey("branches.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Información del cliente
    customer_name = Column(String(100))
    customer_email = Column(String(100))
    customer_phone = Column(String(20))
    
    # Estructura financiera
    subtotal = Column(Numeric(10, 2), nullable=False)         # Base sin impuestos
    tax_amount = Column(Numeric(10, 2), default=0)            # Impuestos aplicados
    discount_amount = Column(Numeric(10, 2), default=0)       # Descuentos aplicados
    total_amount = Column(Numeric(10, 2), nullable=False)     # Total final
    
    # Información de pago y logística
    payment_method = Column(String(50))
    order_status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    notes = Column(Text)
    
    # Auditoría temporal
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    branch = relationship("Branch", back_populates="sales")
    user = relationship("User", back_populates="sales")
    sale_items = relationship("SaleItem", back_populates="sale")
```

### Modelo SaleItem

```python
class SaleItem(Base):
    """Item de Venta - Línea individual dentro de transacción"""
    __tablename__ = "sale_items"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    
    # Cantidades y precios en el momento de venta
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)       # Precio momento de venta
    total_price = Column(Numeric(10, 2), nullable=False)      # quantity * unit_price
    
    # Variante específica
    size = Column(String(10))                                 # Talle si aplica
    
    # Relaciones
    sale = relationship("Sale", back_populates="sale_items")
    product = relationship("Product", back_populates="sale_items")
```

### Características del Sistema de Ventas:

#### **Generación Automática de Sale Numbers:**
```python
def generate_sale_number(sale_type: SaleType) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    prefix = "POS" if sale_type == SaleType.POS else "ECM"
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"{prefix}-{timestamp}-{unique_id}"

# Ejemplos:
# "POS-20241201143022-A1B2C3D4"
# "ECM-20241201143045-E5F6G7H8"
```

#### **Integridad Transaccional:**
```python
# Todas las operaciones de venta son atómicas
try:
    # 1. Crear venta
    sale = create_sale(sale_data)
    
    # 2. Agregar items
    for item in items:
        create_sale_item(sale.id, item)
        
    # 3. Actualizar stock
    update_inventory(item.product_id, -item.quantity)
    
    # 4. Registrar movimiento
    log_inventory_movement(product_id, quantity, 'OUT', 'SALE')
    
    db.commit()
except Exception:
    db.rollback()
    raise
```

#### **Trazabilidad Completa:**
- **sale_number**: ID único legible
- **timestamps**: created_at, updated_at automáticos
- **user tracking**: Usuario responsable de la venta
- **customer info**: Datos del cliente para seguimiento

## Gestión Avanzada de Talles

### Modelo ProductSize

```python
class ProductSize(Base):
    """Talle de Producto - Control granular de stock por variante"""
    __tablename__ = "product_sizes"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    
    # Información del talle
    size = Column(String(10), nullable=False)                 # XS, S, M, L, 35, 36, etc.
    stock_quantity = Column(Integer, default=0, nullable=False)
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    product = relationship("Product", back_populates="product_sizes")
    branch = relationship("Branch")
    
    # Constraint único: producto + sucursal + talle
    __table_args__ = (
        UniqueConstraint('product_id', 'branch_id', 'size', name='unique_product_branch_size'),
    )
```

### Características del Sistema de Talles:

#### **Arquitectura Triple Dimensión:**
```python
# Estructura: Product -> Branch -> Size -> Stock
product_id + branch_id + size = stock_quantity único
```

#### **Casos de Uso:**
- **Indumentaria**: XS, S, M, L, XL, XXL
- **Calzado**: 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45
- **Accesorios**: ÚNICO (sin talles)

#### **Lógica de Stock Consolidado:**
```python
def calculate_total_stock(product_id: int) -> int:
    """Calcula stock total sumando todos los talles"""
    return db.query(func.sum(ProductSize.stock_quantity))\
             .filter(ProductSize.product_id == product_id)\
             .scalar() or 0

def get_available_sizes(product_id: int, branch_id: int) -> List[Dict]:
    """Obtiene talles con stock disponible"""
    return db.query(ProductSize)\
             .filter(ProductSize.product_id == product_id)\
             .filter(ProductSize.branch_id == branch_id)\
             .filter(ProductSize.stock_quantity > 0)\
             .all()
```

#### **Integración E-commerce:**
```python
# Endpoint para e-commerce
GET /products/{product_id}/available-sizes
Response: {
    "available_sizes": [
        {"size": "M", "stock": 15},
        {"size": "L", "stock": 8},
        {"size": "XL", "stock": 3}
    ]
}
```

### Modelo BranchStock

```python
class BranchStock(Base):
    """Stock por Sucursal - Inventario distribuido"""
    __tablename__ = "branch_stock"
    
    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    min_stock = Column(Integer, default=0)                    # Mínimo por sucursal
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    branch = relationship("Branch")
    product = relationship("Product", back_populates="branch_stocks")
    
    # Constraint único por sucursal-producto
    __table_args__ = (
        UniqueConstraint('branch_id', 'product_id', name='unique_branch_product'),
    )
```

## Trazabilidad de Inventario

### Modelo InventoryMovement

```python
class InventoryMovement(Base):
    """Movimiento de Inventario - Auditoría completa de stock"""
    __tablename__ = "inventory_movements"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    branch_id = Column(Integer, ForeignKey("branches.id"))
    
    # Información del movimiento
    movement_type = Column(String(20), nullable=False)        # IN, OUT, ADJUSTMENT
    quantity = Column(Integer, nullable=False)                # +/- según tipo
    previous_stock = Column(Integer, nullable=False)          # Stock antes
    new_stock = Column(Integer, nullable=False)               # Stock después
    
    # Trazabilidad de origen
    reference_id = Column(Integer)                            # ID operación origen
    reference_type = Column(String(20))                       # SALE, PURCHASE, ADJUSTMENT
    
    # Información adicional
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relaciones
    product = relationship("Product", back_populates="inventory_movements")
    branch = relationship("Branch", back_populates="inventory_movements")
```

### Sistema de Trazabilidad Completa:

#### **Tipos de Movimientos:**
```python
MOVEMENT_TYPES = {
    'IN': 'Entrada de mercadería (compras, ajustes positivos)',
    'OUT': 'Salida de mercadería (ventas, ajustes negativos)', 
    'ADJUSTMENT': 'Ajuste de inventario (correcciones)'
}

REFERENCE_TYPES = {
    'SALE': 'Venta POS o E-commerce',
    'PURCHASE': 'Compra a proveedor',
    'ADJUSTMENT': 'Ajuste manual de stock',
    'TRANSFER': 'Transferencia entre sucursales',
    'RETURN': 'Devolución de cliente'
}
```

#### **Funciones de Auditoria:**
```python
def log_inventory_movement(
    product_id: int, 
    branch_id: int,
    quantity_change: int,
    movement_type: str,
    reference_type: str,
    reference_id: int = None,
    notes: str = None
):
    """Registra movimiento de inventario con auditoría completa"""
    
    # Obtener stock actual
    current_stock = get_product_stock(product_id, branch_id)
    new_stock = current_stock + quantity_change
    
    # Crear registro de movimiento
    movement = InventoryMovement(
        product_id=product_id,
        branch_id=branch_id,
        movement_type=movement_type,
        quantity=quantity_change,
        previous_stock=current_stock,
        new_stock=new_stock,
        reference_id=reference_id,
        reference_type=reference_type,
        notes=notes
    )
    
    db.add(movement)
    
    # Actualizar stock del producto
    update_product_stock(product_id, new_stock)
    
    return movement
```

#### **Consultas de Auditoría:**
```sql
-- Historial completo de un producto
SELECT im.*, p.name, p.sku, b.name as branch_name
FROM inventory_movements im
JOIN products p ON im.product_id = p.id
JOIN branches b ON im.branch_id = b.id
WHERE im.product_id = :product_id
ORDER BY im.created_at DESC;

-- Movimientos por período
SELECT DATE(created_at) as date, 
       SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE 0 END) as inbound,
       SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END) as outbound
FROM inventory_movements
WHERE created_at BETWEEN :start_date AND :end_date
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Configuración del E-commerce

### Modelo EcommerceConfig

```python
class EcommerceConfig(Base):
    """Configuración E-commerce - Metadata de la tienda online"""
    __tablename__ = "ecommerce_config"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    
    # Branding de la tienda
    store_name = Column(String(100), nullable=False)
    store_description = Column(Text)
    store_logo = Column(String(255))                          # URL Cloudinary
    
    # Contacto y ubicación
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    address = Column(String(200))
    
    # Configuración financiera
    tax_percentage = Column(Numeric(5, 2), default=0)         # % impuesto default
    currency = Column(String(10), default="USD")              # ISO 4217
    
    # Control de estado
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

### Modelo PaymentConfig

```python
class PaymentConfig(Base):
    """Configuración de Pagos - Métodos y recargos dinámicos"""
    __tablename__ = "payment_config"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    
    # Tipo de pago
    payment_type = Column(String(50), nullable=False)         # efectivo, tarjeta, etc.
    card_type = Column(String(50))                            # bancarizadas, no_bancarizadas
    
    # Configuración financiera
    installments = Column(Integer, default=1)                 # Cuotas disponibles
    surcharge_percentage = Column(Numeric(5, 2), default=0)   # % recargo
    
    # Metadata
    description = Column(String(200))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

### Casos de Uso de Configuración:

#### **Métodos de Pago Dinámicos:**
```python
PAYMENT_METHODS = [
    {
        "payment_type": "efectivo",
        "installments": 1,
        "surcharge_percentage": 0.0,
        "description": "Pago en efectivo"
    },
    {
        "payment_type": "tarjeta",
        "card_type": "bancarizadas", 
        "installments": 1,
        "surcharge_percentage": 3.5,
        "description": "Tarjeta bancarizada 1 pago"
    },
    {
        "payment_type": "tarjeta",
        "card_type": "bancarizadas",
        "installments": 3,
        "surcharge_percentage": 8.0,
        "description": "Tarjeta bancarizada 3 cuotas"
    }
]
```

#### **Cálculo de Recargos:**
```python
def calculate_payment_surcharge(subtotal: Decimal, payment_config: PaymentConfig) -> Decimal:
    """Calcula recargo según configuración de pago"""
    if payment_config.surcharge_percentage > 0:
        return subtotal * (payment_config.surcharge_percentage / 100)
    return Decimal('0.00')

def get_final_amount(subtotal: Decimal, payment_config: PaymentConfig) -> Decimal:
    """Calcula monto final con recargos"""
    surcharge = calculate_payment_surcharge(subtotal, payment_config)
    return subtotal + surcharge
```

## Sistema de Contenidos CMS

### Modelo StoreBanner

```python
class StoreBanner(Base):
    """Banner de Tienda - Carrusel dinámico homepage"""
    __tablename__ = "store_banners"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    
    # Contenido del banner
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300))
    image_url = Column(String(500), nullable=False)           # Cloudinary URL
    
    # Navegación
    link_url = Column(String(500))                            # URL destino
    button_text = Column(String(100))                         # Texto del CTA
    
    # Configuración de visualización
    banner_order = Column(Integer, default=1)                 # Orden en carrusel
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

### Modelo ProductImage

```python
class ProductImage(Base):
    """Imagen de Producto - Galería multimedia"""
    __tablename__ = "product_images"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Información de imagen
    image_url = Column(String(500), nullable=False)           # Cloudinary URL
    image_order = Column(Integer, default=1)                  # Orden en galería
    alt_text = Column(String(255))                            # Texto alternativo
    is_main = Column(Boolean, default=False)                  # Imagen principal
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    product = relationship("Product", back_populates="product_images")
```

### Características del CMS:

#### **Gestión de Banners:**
- **Carrusel dinámico**: Múltiples banners con auto-slide
- **Orden configurable**: banner_order para secuencia
- **CTAs personalizados**: button_text y link_url
- **Activación selectiva**: is_active para control de visibilidad

#### **Gestión de Imágenes:**
- **Galería por producto**: Múltiples imágenes ordenadas
- **Imagen principal**: is_main para destacar
- **SEO friendly**: alt_text para accesibilidad
- **CDN Integration**: URLs de Cloudinary optimizadas

## Integraciones Sociales y WhatsApp

### Modelo WhatsAppConfig

```python
class WhatsAppConfig(Base):
    """Configuración WhatsApp - Integración Business API"""
    __tablename__ = "whatsapp_config"
    
    # Identificación del negocio
    id = Column(Integer, primary_key=True, index=True)
    business_phone = Column(String(20), nullable=False)       # +54911234567890
    business_name = Column(String(100), nullable=False)
    
    # Mensajería automatizada
    welcome_message = Column(Text)                            # Mensaje bienvenida
    business_hours = Column(String(200))                      # Horarios atención
    auto_response_enabled = Column(Boolean, default=False)
    
    # Control de estado
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

### Modelo WhatsAppSale

```python
class WhatsAppSale(Base):
    """Venta WhatsApp - Tracking de pedidos coordinados"""
    __tablename__ = "whatsapp_sales"
    
    # Conexión con venta principal
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    
    # Información del cliente
    customer_whatsapp = Column(String(20), nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_address = Column(Text)
    
    # Logística
    shipping_method = Column(String(50))                      # pickup, delivery, shipping
    shipping_cost = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    
    # URL generada
    whatsapp_chat_url = Column(String(500))                   # https://wa.me/...
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    sale = relationship("Sale")
```

### Modelo SocialMediaConfig

```python
class SocialMediaConfig(Base):
    """Configuración Redes Sociales - Footer e-commerce"""
    __tablename__ = "social_media_config"
    
    # Identificación de plataforma
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)            # facebook, instagram, etc.
    username = Column(String(100))
    url = Column(String(500))
    
    # Configuración de visualización
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

### Integración WhatsApp Business:

#### **Flujo de Pedidos:**
```python
def generate_whatsapp_url(sale: Sale, config: WhatsAppConfig) -> str:
    """Genera URL WhatsApp con mensaje pre-formateado"""
    
    message_template = f"""
    ¡Hola! Quiero realizar el siguiente pedido:
    
    *PEDIDO #{sale.sale_number}* ✅
    
    *PRODUCTOS:*
    {format_sale_items(sale.sale_items)}
    
    *TOTAL: ${sale.total_amount}*
    
    *DATOS DEL CLIENTE:*
    Nombre: {sale.customer_name}
    Teléfono: {sale.customer_phone}
    
    El pedido ya está registrado en el sistema ✅
    ¡Gracias!
    """
    
    encoded_message = urllib.parse.quote(message_template)
    clean_phone = config.business_phone.replace('+', '').replace('-', '').replace(' ', '')
    
    return f"https://wa.me/{clean_phone}?text={encoded_message}"
```

#### **Casos de Uso:**
- **Checkout E-commerce**: Redirección automática después del pedido
- **Coordinación de entrega**: Cliente contacta para acordar envío
- **Soporte al cliente**: Canal directo de comunicación
- **Marketing directo**: Promociones y novedades

## Índices y Optimizaciones

### Índices Principales

```python
# Índices automáticos por Primary Keys
users.id (PRIMARY KEY, UNIQUE, INDEXED)
branches.id (PRIMARY KEY, UNIQUE, INDEXED) 
products.id (PRIMARY KEY, UNIQUE, INDEXED)
sales.id (PRIMARY KEY, UNIQUE, INDEXED)

# Índices por campos únicos
users.email (UNIQUE, INDEXED)
users.username (UNIQUE, INDEXED)
products.sku (UNIQUE, INDEXED)
products.barcode (UNIQUE, INDEXED)
sales.sale_number (UNIQUE, INDEXED)

# Índices por Foreign Keys
users.branch_id (INDEXED)
sales.branch_id (INDEXED)
sales.user_id (INDEXED)
sale_items.sale_id (INDEXED)
sale_items.product_id (INDEXED)
products.category_id (INDEXED)
inventory_movements.product_id (INDEXED)
inventory_movements.branch_id (INDEXED)
```

### Constraints de Integridad

```python
# Unique Constraints compuestos
ProductSize: (product_id, branch_id, size) UNIQUE
BranchStock: (branch_id, product_id) UNIQUE

# Foreign Key Constraints
users.branch_id → branches.id
sales.branch_id → branches.id  
sales.user_id → users.id
sale_items.sale_id → sales.id
sale_items.product_id → products.id
products.category_id → categories.id
inventory_movements.product_id → products.id
inventory_movements.branch_id → branches.id
product_sizes.product_id → products.id
product_sizes.branch_id → branches.id
```

### Optimizaciones de Performance

#### **Pool de Conexiones:**
```python
# Configuración optimizada para producción
engine = create_engine(
    DATABASE_URL,
    pool_size=10,           # 10 conexiones base
    max_overflow=20,        # hasta 30 conexiones total
    pool_recycle=3600,      # renovar cada hora
    pool_pre_ping=True      # validar antes de usar
)
```

#### **Consultas Optimizadas:**
```python
# Eager loading para evitar N+1 queries
def get_sales_with_items(branch_id: int):
    return db.query(Sale)\
             .options(joinedload(Sale.sale_items))\
             .filter(Sale.branch_id == branch_id)\
             .all()

# Consultas agregadas para dashboards  
def get_sales_stats(branch_id: int, date_from: date, date_to: date):
    return db.query(
        func.count(Sale.id).label('total_sales'),
        func.sum(Sale.total_amount).label('total_revenue'),
        func.avg(Sale.total_amount).label('average_sale')
    ).filter(
        Sale.branch_id == branch_id,
        Sale.created_at.between(date_from, date_to)
    ).first()
```

#### **Particionado Temporal (Futuro):**
```sql
-- Para grandes volúmenes, particionar por fecha
CREATE TABLE sales_2024_q1 PARTITION OF sales
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE sales_2024_q2 PARTITION OF sales  
FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
```

## Diagramas de Relaciones

### Diagrama ERD Completo

```
                    ┌─────────────────┐
                    │     Branch      │
                    │ (Sucursales)    │
                    │  - id (PK)      │
                    │  - name         │
                    │  - address      │
                    │  - phone        │
                    │  - email        │
                    │  - is_active    │
                    └─────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
    ┌─────────────────┐ ┌────────────┐ ┌──────────────────┐
    │      User       │ │    Sale    │ │ InventoryMovement│
    │  - id (PK)      │ │ - id (PK)  │ │  - id (PK)       │
    │  - username     │ │ - number   │ │  - movement_type │
    │  - email        │ │ - type     │ │  - quantity      │
    │  - password     │ │ - subtotal │ │  - prev_stock    │
    │  - role         │ │ - total    │ │  - new_stock     │
    │  - branch_id FK │ │ - branch FK│ │  - branch_id FK  │
    │  - is_active    │ │ - user FK  │ │  - product_id FK │
    └─────────────────┘ └────────────┘ └──────────────────┘
            │                │                    │
            ▼                ▼                    ▼
    ┌─────────────────┐ ┌────────────┐ ┌──────────────────┐
    │   Category      │ │ SaleItem   │ │    Product       │
    │  - id (PK)      │ │ - id (PK)  │ │  - id (PK)       │
    │  - name         │ │ - sale FK  │ │  - name          │
    │  - description  │ │ - prod FK  │ │  - sku (UNIQUE)  │
    │  - is_active    │ │ - quantity │ │  - barcode (UQ)  │
    └─────────────────┘ │ - u_price  │ │  - price         │
            │           │ - t_price  │ │  - cost          │
            ▼           │ - size     │ │  - stock_qty     │
    ┌─────────────────┐ └────────────┘ │  - min_stock     │
    │  ProductSize    │                │  - has_sizes     │
    │  - id (PK)      │                │  - show_ecomm    │
    │  - product FK   │◄───────────────│  - category FK   │
    │  - branch FK    │                │  - is_active     │
    │  - size         │                └──────────────────┘
    │  - stock_qty    │                          │
    └─────────────────┘                          ▼
                                       ┌──────────────────┐
                                       │  ProductImage    │
                                       │  - id (PK)       │
                                       │  - product FK    │
                                       │  - image_url     │
                                       │  - image_order   │
                                       │  - is_main       │
                                       └──────────────────┘
```

### Flujo de Datos en Transacciones

```
    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
    │   Usuario   │ ──── │    Venta    │ ──── │ Items Venta │
    │   Activo    │ crea │  Pendiente  │ con  │ Específicos │
    └─────────────┘      └─────────────┘      └─────────────┘
           │                     │                     │
           │validates            │updates              │affects
           ▼                     ▼                     ▼
    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
    │  Sucursal   │      │   Stock     │      │ Movimiento  │
    │   Origen    │      │ Productos   │      │ Inventario  │
    └─────────────┘      └─────────────┘      └─────────────┘
```

### Arquitectura de Stock Multi-nivel

```
                    Product (Master)
                    stock_quantity = SUM(all branches)
                           │
                ┌──────────┼──────────┐
                │          │          │
                ▼          ▼          ▼
         Branch Stock  Branch Stock  Branch Stock
           Sucursal A   Sucursal B   Sucursal C
         stock_qty=100  stock_qty=50  stock_qty=30
                │          │          │
        ┌───────┼───────┐  │   ┌──────┼──────┐
        ▼       ▼       ▼  ▼   ▼      ▼      ▼
    Size XS  Size M  Size L      Size S   Size XL
    qty=20  qty=50  qty=30      qty=25   qty=25
```

## Conclusión

La base de datos de POS Cesariel implementa un diseño robusto y escalable que soporta:

### **Funcionalidades Clave:**
1. **Arquitectura Multisucursal**: Aislamiento de datos por sucursal con consolidación central
2. **Gestión Avanzada de Stock**: Control por producto, sucursal y talle
3. **Trazabilidad Completa**: Auditoría de todos los movimientos de inventario
4. **Integración E-commerce**: Datos compartidos entre POS y tienda online
5. **Configuración Dinámica**: Sistema flexible de métodos de pago y configuraciones
6. **CMS Integrado**: Gestión de contenido para banners e imágenes
7. **WhatsApp Business**: Integración nativa para coordinación de pedidos

### **Garantías de Calidad:**
- **Integridad Referencial**: Foreign keys y constraints estrictos
- **Normalización**: Eliminación de redundancia de datos
- **Performance**: Índices optimizados y pool de conexiones configurado
- **Escalabilidad**: Diseño preparado para crecimiento horizontal
- **Auditabilidad**: Timestamps automáticos y logs de movimientos
- **Flexibilidad**: Extensible para nuevas funcionalidades

La arquitectura está diseñada para soportar el crecimiento del negocio manteniendo consistencia de datos, performance óptima y facilidad de mantenimiento.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "1", "content": "Analyze complete database structure and models", "status": "completed"}, {"id": "2", "content": "Document core entities and relationships", "status": "completed"}, {"id": "3", "content": "Document user and authentication system", "status": "completed"}, {"id": "4", "content": "Document multi-branch architecture", "status": "completed"}, {"id": "5", "content": "Document product and inventory management", "status": "completed"}, {"id": "6", "content": "Document sales and transactions system", "status": "completed"}, {"id": "7", "content": "Document size management system", "status": "completed"}, {"id": "8", "content": "Document inventory tracking and movements", "status": "completed"}, {"id": "9", "content": "Document e-commerce configuration", "status": "completed"}, {"id": "10", "content": "Document content management system", "status": "completed"}, {"id": "11", "content": "Document database indexes and constraints", "status": "completed"}, {"id": "12", "content": "Create comprehensive DATABASE_DOCUMENTATION.md file", "status": "completed"}]