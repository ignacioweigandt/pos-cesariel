# Documentación Completa del Backend - POS Cesariel

## Tabla de Contenidos
1. [Introducción y Arquitectura General](#introducción-y-arquitectura-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
4. [Configuración de la Aplicación](#configuración-de-la-aplicación)
5. [Modelos de Datos](#modelos-de-datos)
6. [Base de Datos y Conexiones](#base-de-datos-y-conexiones)
7. [Sistema de Autenticación](#sistema-de-autenticación)
8. [Routers y Endpoints](#routers-y-endpoints)
9. [Servicios y Lógica de Negocio](#servicios-y-lógica-de-negocio)
10. [WebSockets y Tiempo Real](#websockets-y-tiempo-real)
11. [Utilidades y Helpers](#utilidades-y-helpers)
12. [Manejo de Excepciones](#manejo-de-excepciones)
13. [Testing y Calidad](#testing-y-calidad)

## Introducción y Arquitectura General

El backend de POS Cesariel está construido con **FastAPI** como framework principal, siguiendo una arquitectura modular y escalable. Implementa un sistema RESTful con soporte para WebSockets, autenticación JWT y manejo avanzado de inventario multisucursal.

### Características Principales:
- **API RESTful**: Endpoints organizados por funcionalidad
- **Arquitectura por Capas**: Separación clara entre modelos, servicios, routers y utilidades
- **Multi-tenant**: Soporte para múltiples sucursales
- **Tiempo Real**: WebSockets para sincronización instantánea
- **Autenticación JWT**: Sistema de tokens con roles diferenciados
- **Base de Datos Relacional**: PostgreSQL con SQLAlchemy ORM
- **Testing Completo**: Suite de pruebas unitarias e integración

### Principios de Diseño:
- **Single Responsibility**: Cada módulo tiene una responsabilidad específica
- **Dependency Injection**: Inyección de dependencias para testing y flexibilidad
- **Consistent API**: Respuestas estandarizadas y manejo de errores coherente
- **Security First**: Validación de datos, autorización y encriptación

## Estructura de Archivos

### Arquitectura del Proyecto:
```
backend/
├── main.py                     # Punto de entrada de la aplicación FastAPI
├── database.py                 # Configuración de SQLAlchemy y conexión DB
├── models.py                   # Modelos SQLAlchemy ORM
├── schemas.py                  # Esquemas Pydantic para validación
├── auth.py                     # Sistema de autenticación JWT
├── auth_compat.py              # Compatibilidad de autenticación
├── websocket_manager.py        # Manager para WebSockets en tiempo real
├── cloudinary_config.py        # Configuración de Cloudinary para imágenes
├── init_data.py                # Script de inicialización de datos de prueba
├── init_content_data.py        # Script de inicialización de contenido
├── config/                     # Configuraciones centralizadas
│   ├── __init__.py
│   └── settings.py            # Settings principales de la aplicación
├── routers/                    # Endpoints organizados por funcionalidad
│   ├── __init__.py
│   ├── auth.py                # Autenticación y gestión de sesiones
│   ├── users.py               # CRUD de usuarios y permisos
│   ├── branches.py            # Gestión de sucursales multisede
│   ├── categories.py          # Categorización de productos
│   ├── products.py            # CRUD productos, inventario, importación
│   ├── sales.py               # Ventas, reportes y dashboard
│   ├── websockets.py          # Endpoints WebSocket
│   ├── config.py              # Configuración del sistema
│   ├── ecommerce_advanced.py  # Funcionalidades avanzadas e-commerce
│   ├── ecommerce_public.py    # API pública para tienda online
│   └── content_management.py  # Gestión de contenido y banners
├── services/                   # Lógica de negocio centralizada
│   ├── __init__.py
│   └── auth_service.py        # Servicio de autenticación
├── utils/                      # Utilidades compartidas
│   ├── __init__.py
│   ├── helpers.py             # Funciones auxiliares generales
│   └── validators.py          # Validadores personalizados
├── exceptions/                 # Manejo personalizado de excepciones
│   ├── __init__.py
│   └── custom_exceptions.py   # Excepciones específicas del dominio
├── tests/                      # Suite de pruebas completa
│   ├── __init__.py
│   ├── conftest.py            # Configuración de pruebas y fixtures
│   ├── unit/                  # Pruebas unitarias
│   │   ├── test_auth.py       # Tests de autenticación
│   │   ├── test_models.py     # Tests de modelos ORM
│   │   └── test_database.py   # Tests de conexión DB
│   └── integration/           # Pruebas de integración
│       ├── test_products_api.py        # Tests API productos
│       ├── test_sales_api.py           # Tests API ventas
│       ├── test_auth_endpoints.py      # Tests endpoints auth
│       ├── test_websocket_real_time.py # Tests WebSockets
│       └── test_ecommerce_endpoints.py # Tests e-commerce
├── requirements.txt            # Dependencias Python
├── pytest.ini                # Configuración de pytest
└── Dockerfile                # Containerización
```

## Tecnologías y Dependencias

### Framework Principal:
```python
fastapi[all]==0.115.14          # Framework web moderno y rápido
uvicorn[standard]==0.35.0        # Servidor ASGI de alto rendimiento
```

### Validación y Serialización:
```python
pydantic==2.11.7                # Validación de datos con tipos Python
pydantic-settings==2.10.1       # Gestión de configuraciones
python-multipart==0.0.20        # Soporte para formularios multipart
```

### Base de Datos:
```python
sqlalchemy==2.0.36              # ORM para Python con soporte async
psycopg2-binary==2.9.9          # Driver PostgreSQL
alembic==1.13.3                 # Migraciones de base de datos
```

### Autenticación y Seguridad:
```python
python-jose[cryptography]==3.3.0 # Manejo de tokens JWT
passlib[bcrypt]==1.7.4           # Encriptación de contraseñas
```

### Utilidades y Terceros:
```python
pandas==2.1.4                   # Manipulación de datos para importaciones
openpyxl==3.1.2                 # Lectura de archivos Excel
cloudinary==1.36.0              # Gestión de imágenes en la nube
redis==5.0.1                    # Cache y sesiones (opcional)
python-dotenv==1.1.1            # Variables de entorno
```

### Testing:
```python
pytest==7.4.3                   # Framework de testing
pytest-asyncio==0.21.1          # Soporte async para pytest
pytest-mock==3.12.0             # Mocking avanzado
pytest-cov==4.1.0               # Cobertura de código
httpx==0.28.1                   # Cliente HTTP para testing
```

## Configuración de la Aplicación

### Settings Centralizadas (`config/settings.py`)

El sistema utiliza un patrón de configuración centralizada que lee variables de entorno y proporciona defaults seguros:

```python
class Settings:
    # Configuración de la aplicación
    app_name: str = "Backend POS Cesariel"
    app_version: str = "1.0.0"
    app_description: str = "API para el sistema de punto de venta multisucursal con e-commerce"
    debug_mode: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Configuración del servidor
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    
    # Configuración de base de datos
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/pos_cesariel")
    
    # Configuración de CORS para desarrollo
    cors_origins: List[str] = [
        "http://localhost:3000",  # POS Frontend
        "http://frontend:3000",   # POS Frontend en Docker
        "http://localhost:3001",  # E-commerce
        "http://ecommerce:3001",  # E-commerce en Docker
        "*"  # Desarrollo: permitir todos los orígenes
    ]
    
    # Configuración JWT
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "tu_clave_secreta_super_segura_aqui")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", 30))
```

### Inicialización de la Aplicación (`main.py`)

```python
# Crear la instancia principal de FastAPI
app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    docs_url="/docs" if settings.debug_mode else None,
    redoc_url="/redoc" if settings.debug_mode else None,
    debug=settings.debug_mode
)

# Configuración de CORS para comunicación frontend-backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)
```

## Modelos de Datos

### Arquitectura de Entidades

El sistema utiliza SQLAlchemy ORM con modelos bien definidos que representan el dominio del negocio:

#### **1. Usuarios y Autenticación**

```python
class UserRole(enum.Enum):
    """Roles disponibles en el sistema"""
    ADMIN = "ADMIN"          # Acceso completo
    MANAGER = "MANAGER"      # Gestión de sucursal
    SELLER = "SELLER"        # Solo ventas
    ECOMMERCE = "ECOMMERCE"  # Gestión e-commerce

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

#### **2. Sucursales Multisede**

```python
class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(200))
    phone = Column(String(20))
    email = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    users = relationship("User", back_populates="branch")
    sales = relationship("Sale", back_populates="branch")
    inventory_movements = relationship("InventoryMovement", back_populates="branch")
```

#### **3. Productos e Inventario**

```python
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    barcode = Column(String(50), unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    # Precios
    price = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(10, 2))
    ecommerce_price = Column(Numeric(10, 2))
    
    # Inventario
    stock_quantity = Column(Integer, default=0)
    min_stock = Column(Integer, default=0)
    
    # Configuración
    is_active = Column(Boolean, default=True)
    show_in_ecommerce = Column(Boolean, default=True)
    has_sizes = Column(Boolean, default=False)
    
    # Multimedia
    image_url = Column(String(255))
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

#### **4. Ventas y Transacciones**

```python
class SaleType(enum.Enum):
    POS = "POS"              # Venta en punto físico
    ECOMMERCE = "ECOMMERCE"  # Venta online

class OrderStatus(enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    sale_number = Column(String(50), unique=True, index=True, nullable=False)
    sale_type = Column(Enum(SaleType), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Información del cliente
    customer_name = Column(String(100))
    customer_email = Column(String(100))
    customer_phone = Column(String(20))
    
    # Montos financieros
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Información de pago
    payment_method = Column(String(50))
    order_status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    notes = Column(Text)
    
    # Auditoría
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    branch = relationship("Branch", back_populates="sales")
    user = relationship("User", back_populates="sales")
    sale_items = relationship("SaleItem", back_populates="sale")
```

#### **5. Sistema de Talles Multisucursal**

```python
class ProductSize(Base):
    """Manejo granular de stock por talle y sucursal"""
    __tablename__ = "product_sizes"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    size = Column(String(10), nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relaciones
    product = relationship("Product", back_populates="product_sizes")
    branch = relationship("Branch")
```

#### **6. Trazabilidad de Inventario**

```python
class InventoryMovement(Base):
    """Auditoría completa de movimientos de stock"""
    __tablename__ = "inventory_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    branch_id = Column(Integer, ForeignKey("branches.id"))
    movement_type = Column(String(20), nullable=False)  # IN, OUT, ADJUSTMENT
    quantity = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    reference_id = Column(Integer)  # ID de la operación origen
    reference_type = Column(String(20))  # SALE, PURCHASE, ADJUSTMENT
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
```

## Base de Datos y Conexiones

### Configuración SQLAlchemy (`database.py`)

```python
# URL de conexión obtenida desde variables de entorno
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/pos_cesariel"
)

# Motor de base de datos con optimizaciones para PostgreSQL
engine = create_engine(
    DATABASE_URL,
    echo=False,                  # Debug SQL queries
    pool_pre_ping=True,          # Verificar conexiones válidas
    pool_recycle=3600,           # Reciclar conexiones cada hora
    pool_size=10,                # Tamaño del pool de conexiones
    max_overflow=20              # Conexiones adicionales permitidas
)

# Factory de sesiones SQLAlchemy
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Clase base declarativa
Base = declarative_base()
```

### Dependency Injection para FastAPI

```python
def get_db():
    """
    Generador de sesión de base de datos para dependency injection.
    
    Garantiza que cada request HTTP tenga su propia sesión
    y que se cierre correctamente al finalizar.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Uso en endpoints:
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()
```

### Inicialización y Migración de Datos

El sistema incluye scripts para inicializar datos de prueba y configuraciones por defecto:

```python
# init_data.py - Datos de prueba
def create_test_users():
    """Crea usuarios de prueba para desarrollo"""
    users = [
        {
            "username": "admin",
            "password": "admin123",
            "full_name": "Administrador",
            "email": "admin@poscerio.com",
            "role": UserRole.ADMIN,
            "branch_id": 1
        },
        {
            "username": "manager",
            "password": "manager123",
            "full_name": "Gerente",
            "email": "manager@poscerio.com",
            "role": UserRole.MANAGER,
            "branch_id": 1
        },
        {
            "username": "seller",
            "password": "seller123",
            "full_name": "Vendedor",
            "email": "seller@poscerio.com",
            "role": UserRole.SELLER,
            "branch_id": 1
        }
    ]
```

## Sistema de Autenticación

### Arquitectura de Seguridad

El sistema implementa autenticación JWT con múltiples capas de seguridad:

#### **1. Encriptación de Contraseñas (`auth.py`)**

```python
from passlib.context import CryptContext

# Configuración de encriptación bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica contraseña contra hash bcrypt"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera hash seguro para contraseña"""
    return pwd_context.hash(password)
```

#### **2. Generación y Validación de Tokens JWT**

```python
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea token JWT con expiración"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

#### **3. Middleware de Autenticación**

```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    """Extrae y valida usuario actual desde token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user
```

#### **4. Control de Acceso Basado en Roles**

```python
def require_role(allowed_roles: list[UserRole]):
    """Decorator para requerir roles específicos"""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your role"
            )
        return current_user
    return role_checker

def require_admin(current_user: User = Depends(get_current_active_user)):
    """Require admin access"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_same_branch_or_admin(branch_id: int, current_user: User = Depends(get_current_active_user)):
    """Control de acceso por sucursal"""
    if current_user.role == UserRole.ADMIN:
        return current_user
    if current_user.branch_id != branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: different branch"
        )
    return current_user
```

### Servicio de Autenticación Centralizado (`services/auth_service.py`)

```python
class AuthenticationService:
    """Servicio centralizado para operaciones de autenticación"""
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = settings.jwt_secret_key
        self.algorithm = settings.jwt_algorithm

    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[User]:
        """Autentica usuario con credenciales"""
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    def get_user_permissions(self, user: User) -> Dict[str, bool]:
        """Obtiene permisos basados en rol"""
        role_permissions = {
            UserRole.ADMIN: {
                'pos': True, 'inventory': True, 'reports': True,
                'users': True, 'settings': True, 'ecommerce': True
            },
            UserRole.MANAGER: {
                'pos': True, 'inventory': True, 'reports': True,
                'users': True, 'settings': False, 'ecommerce': True
            },
            UserRole.SELLER: {
                'pos': True, 'inventory': False, 'reports': False,
                'users': False, 'settings': False, 'ecommerce': False
            }
        }
        return role_permissions.get(user.role, {})
```

## Routers y Endpoints

### Organización Modular de APIs

El sistema organiza endpoints en routers modulares por funcionalidad:

#### **1. Router de Autenticación (`routers/auth.py`)**

```python
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Endpoint de login con form data (compatible con OAuth2)"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
async def login_json(user_login: UserLogin, db: Session = Depends(get_db)):
    """Endpoint de login con JSON (para frontend)"""
    # Implementación similar pero acepta JSON

@router.get("/me", response_model=User)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    """Obtiene información del usuario actual"""
    return current_user
```

#### **2. Router de Productos (`routers/products.py`)**

```python
router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductSchema])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    low_stock: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista productos con filtros avanzados"""
    query = db.query(Product).filter(Product.is_active == True)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                Product.barcode.ilike(f"%{search}%")
            )
        )
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if low_stock:
        query = query.filter(Product.stock_quantity <= Product.min_stock)
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/barcode/{barcode}", response_model=ProductSchema)
async def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Búsqueda de producto por código de barras (para escáner)"""
    product = db.query(Product).filter(
        Product.barcode == barcode,
        Product.is_active == True
    ).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/import", response_model=BulkImportResponse)
async def bulk_import_products(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Importación masiva de productos desde CSV/Excel"""
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(
            status_code=400,
            detail="File must be CSV or Excel format"
        )
    
    # Lógica de importación con pandas
    df = pd.read_excel(file.file) if file.filename.endswith('.xlsx') else pd.read_csv(file.file)
    
    # Procesamiento y validación...
```

#### **3. Router de Ventas (`routers/sales.py`)**

```python
router = APIRouter(prefix="/sales", tags=["sales"])

def generate_sale_number(sale_type: SaleType) -> str:
    """Genera número único de venta"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    prefix = "POS" if sale_type == SaleType.POS else "ECM"
    return f"{prefix}-{timestamp}-{str(uuid.uuid4())[:8].upper()}"

@router.post("/", response_model=SaleSchema)
async def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Crea nueva venta con validación de stock"""
    try:
        # Validar que todos los productos existan y tengan stock
        for item in sale.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product with ID {item.product_id} not found"
                )
            
            # Verificar stock basado en si el producto maneja talles
            if product.has_sizes:
                if not item.size:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Product {product.name} requires a size to be specified"
                    )
                
                # Verificar stock por talle
                branch_id = sale.branch_id if sale.branch_id else current_user.branch_id
                size_stock = db.query(ProductSize).filter(
                    ProductSize.product_id == item.product_id,
                    ProductSize.branch_id == branch_id,
                    ProductSize.size == item.size
                ).first()
                
                if not size_stock or size_stock.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for {product.name} size {item.size}"
                    )
            else:
                # Verificar stock general
                if product.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for {product.name}"
                    )
        
        # Crear venta...
        db_sale = Sale(
            sale_number=generate_sale_number(sale.sale_type),
            sale_type=sale.sale_type,
            branch_id=sale.branch_id if sale.branch_id else current_user.branch_id,
            user_id=current_user.id,
            subtotal=subtotal,
            total_amount=total,
            payment_method=sale.payment_method,
            order_status=sale.order_status,
            customer_name=sale.customer_name,
            customer_email=sale.customer_email,
            customer_phone=sale.customer_phone
        )
        
        db.add(db_sale)
        db.flush()
        
        # Crear items y actualizar stock...
        # Notificar via WebSocket...
        await notify_new_sale(db_sale.id, float(total), db_sale.branch_id, current_user.full_name)
        
        db.commit()
        return db_sale
        
    except Exception as e:
        db.rollback()
        raise e
```

#### **4. Router de Dashboard y Reportes**

```python
@router.get("/reports/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Estadísticas para el dashboard principal"""
    # Filtrar por sucursal si no es admin
    if current_user.role != UserRole.ADMIN:
        branch_id = current_user.branch_id
    
    today = datetime.now().date()
    start_of_month = today.replace(day=1)
    
    # Consultas base con filtros de sucursal
    sales_query = db.query(Sale)
    products_query = db.query(Product)
    
    if branch_id:
        sales_query = sales_query.filter(Sale.branch_id == branch_id)
    
    # Calcular estadísticas
    total_sales_today = sales_query.filter(
        func.date(Sale.created_at) == today
    ).with_entities(func.sum(Sale.total_amount)).scalar() or 0
    
    total_sales_month = sales_query.filter(
        Sale.created_at >= start_of_month
    ).with_entities(func.sum(Sale.total_amount)).scalar() or 0
    
    total_products = products_query.filter(Product.is_active == True).count()
    
    low_stock_products = products_query.filter(
        Product.stock_quantity <= Product.min_stock,
        Product.stock_quantity > 0,
        Product.is_active == True
    ).count()
    
    return DashboardStats(
        total_sales_today=total_sales_today,
        total_sales_month=total_sales_month,
        total_products=total_products,
        low_stock_products=low_stock_products
    )
```

## Servicios y Lógica de Negocio

### Patrón Service Layer

El sistema implementa un patrón de Service Layer para centralizar la lógica de negocio:

#### **Service de Autenticación (`services/auth_service.py`)**

```python
class AuthenticationService:
    """Centraliza toda la lógica de autenticación y autorización"""
    
    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[User]:
        """Proceso completo de autenticación"""
        user = db.query(User).filter(User.username == username).first()
        
        if not user or not user.is_active:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    def get_user_permissions(self, user: User) -> Dict[str, bool]:
        """Mapa de permisos por rol"""
        role_permissions = {
            UserRole.ADMIN: {
                'pos': True, 'inventory': True, 'reports': True,
                'users': True, 'settings': True, 'ecommerce': True, 'branches': True
            },
            UserRole.MANAGER: {
                'pos': True, 'inventory': True, 'reports': True,
                'users': True, 'settings': False, 'ecommerce': True, 'branches': False
            },
            UserRole.SELLER: {
                'pos': True, 'inventory': False, 'reports': False,
                'users': False, 'settings': False, 'ecommerce': False, 'branches': False
            },
            UserRole.ECOMMERCE: {
                'pos': False, 'inventory': False, 'reports': True,
                'users': False, 'settings': False, 'ecommerce': True, 'branches': False
            }
        }
        return role_permissions.get(user.role, {})

    def can_access_module(self, user: User, module: str) -> bool:
        """Verifica acceso a módulo específico"""
        permissions = self.get_user_permissions(user)
        return permissions.get(module, False)

# Instancia global del servicio
auth_service = AuthenticationService()
```

### Lógica de Negocio en Routers

Los routers implementan reglas de negocio específicas del dominio:

#### **Gestión de Stock con Talles**

```python
def update_product_stock(db: Session, product_id: int, branch_id: int, 
                        quantity_change: int, size: Optional[str] = None):
    """Actualiza stock con soporte para talles"""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if product.has_sizes and size:
        # Actualizar stock por talle
        size_stock = db.query(ProductSize).filter(
            ProductSize.product_id == product_id,
            ProductSize.branch_id == branch_id,
            ProductSize.size == size
        ).first()
        
        if size_stock:
            old_stock = size_stock.stock_quantity
            size_stock.stock_quantity = max(0, old_stock + quantity_change)
            new_stock = size_stock.stock_quantity
        else:
            # Crear nueva entrada de talle
            size_stock = ProductSize(
                product_id=product_id,
                branch_id=branch_id,
                size=size,
                stock_quantity=max(0, quantity_change)
            )
            db.add(size_stock)
            old_stock = 0
            new_stock = size_stock.stock_quantity
        
        # Actualizar stock total del producto
        total_stock = db.query(func.sum(ProductSize.stock_quantity)).filter(
            ProductSize.product_id == product_id
        ).scalar() or 0
        product.stock_quantity = total_stock
        
    else:
        # Actualizar stock general
        old_stock = product.stock_quantity
        product.stock_quantity = max(0, old_stock + quantity_change)
        new_stock = product.stock_quantity
    
    # Registrar movimiento de inventario
    movement = InventoryMovement(
        product_id=product_id,
        branch_id=branch_id,
        movement_type="IN" if quantity_change > 0 else "OUT",
        quantity=abs(quantity_change),
        previous_stock=old_stock,
        new_stock=new_stock,
        reference_type="ADJUSTMENT"
    )
    db.add(movement)
    
    return old_stock, new_stock
```

## WebSockets y Tiempo Real

### Manager de WebSocket (`websocket_manager.py`)

El sistema implementa un manager centralizado para comunicaciones en tiempo real:

```python
class ConnectionManager:
    """Gestiona conexiones WebSocket por sucursal"""
    
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}  # Por sucursal
        self.all_connections: List[WebSocket] = []                # Global
        self.connection_branch_map: Dict[WebSocket, int] = {}     # Mapeo WS->Branch

    async def connect(self, websocket: WebSocket, branch_id: int):
        """Acepta nueva conexión y la registra por sucursal"""
        await websocket.accept()
        
        # Agregar a listas globales y por sucursal
        self.all_connections.append(websocket)
        
        if branch_id not in self.active_connections:
            self.active_connections[branch_id] = []
        self.active_connections[branch_id].append(websocket)
        
        self.connection_branch_map[websocket] = branch_id
        
        # Mensaje de bienvenida
        await self.send_personal_message({
            "type": "connection_established",
            "message": f"Conectado a la sucursal {branch_id}",
            "timestamp": datetime.now().isoformat()
        }, websocket)

    async def broadcast_to_branch(self, message: Dict[str, Any], branch_id: int):
        """Envía mensaje a todas las conexiones de una sucursal"""
        if branch_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[branch_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    disconnected.append(connection)
            
            # Limpiar conexiones desconectadas
            for connection in disconnected:
                self._silent_disconnect(connection)

    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast global a todas las conexiones"""
        disconnected = []
        for connection in self.all_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                disconnected.append(connection)
        
        for connection in disconnected:
            self._silent_disconnect(connection)

# Instancia global
manager = ConnectionManager()
```

### Notificaciones Específicas del Dominio

```python
async def notify_inventory_change(product_id: int, old_stock: int, new_stock: int, 
                                 branch_id: int, user_name: str):
    """Notifica cambios de inventario a otras sucursales"""
    message = {
        "type": "inventory_change",
        "product_id": product_id,
        "old_stock": old_stock,
        "new_stock": new_stock,
        "branch_id": branch_id,
        "user_name": user_name,
        "timestamp": datetime.now().isoformat(),
        "message": f"Stock actualizado por {user_name}: {old_stock} → {new_stock}"
    }
    await manager.broadcast_to_other_branches(message, branch_id)

async def notify_new_sale(sale_id: int, total_amount: float, branch_id: int, user_name: str):
    """Notifica nuevas ventas en tiempo real"""
    message = {
        "type": "new_sale",
        "sale_id": sale_id,
        "total_amount": total_amount,
        "branch_id": branch_id,
        "user_name": user_name,
        "timestamp": datetime.now().isoformat(),
        "message": f"Nueva venta por ${total_amount:.2f} en sucursal {branch_id}"
    }
    await manager.broadcast_to_all(message)

async def notify_low_stock(product_id: int, product_name: str, 
                          current_stock: int, min_stock: int, branch_id: int):
    """Alerta de stock bajo"""
    message = {
        "type": "low_stock_alert",
        "product_id": product_id,
        "product_name": product_name,
        "current_stock": current_stock,
        "min_stock": min_stock,
        "branch_id": branch_id,
        "timestamp": datetime.now().isoformat(),
        "message": f"⚠️ Stock bajo: {product_name} ({current_stock} unidades)"
    }
    await manager.broadcast_to_all(message)
```

### Endpoints WebSocket

```python
# routers/websockets.py
router = APIRouter()

@router.websocket("/ws/{branch_id}")
async def websocket_endpoint(websocket: WebSocket, branch_id: int):
    """Endpoint WebSocket principal para conexiones por sucursal"""
    await manager.connect(websocket, branch_id)
    try:
        while True:
            # Mantener conexión viva y procesar mensajes
            data = await websocket.receive_text()
            
            # Procesar mensaje del cliente si es necesario
            try:
                message_data = json.loads(data)
                if message_data.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }))
            except json.JSONDecodeError:
                pass  # Ignorar mensajes mal formateados
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

## Utilidades y Helpers

### Funciones de Utilidad General (`utils/helpers.py`)

```python
def format_currency(amount: Union[int, float, Decimal], currency: str = "$") -> str:
    """Formatea montos como moneda con separadores"""
    try:
        decimal_amount = Decimal(str(amount))
        rounded_amount = decimal_amount.quantize(
            Decimal('0.01'), 
            rounding=ROUND_HALF_UP
        )
        formatted = f"{rounded_amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        return f"{currency} {formatted}"
    except (ValueError, TypeError):
        return f"{currency} 0,00"

def calculate_discount(original_price: Union[int, float, Decimal], 
                      discount_percentage: Union[int, float]) -> Dict[str, Decimal]:
    """Calcula descuentos con precisión decimal"""
    try:
        original = Decimal(str(original_price))
        discount = apply_percentage(original, discount_percentage)
        final_price = original - discount
        
        return {
            'precio_original': original.quantize(Decimal('0.01')),
            'descuento': discount.quantize(Decimal('0.01')),
            'precio_final': final_price.quantize(Decimal('0.01'))
        }
    except (ValueError, TypeError):
        return {
            'precio_original': Decimal('0.00'),
            'descuento': Decimal('0.00'),
            'precio_final': Decimal('0.00')
        }

def generate_barcode() -> str:
    """Genera código de barras único para productos internos"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"2{timestamp}"

def paginate_results(query_results: List[Any], page: int = 1, 
                    page_size: int = 20) -> Dict[str, Any]:
    """Paginación de resultados con metadata"""
    total_items = len(query_results)
    total_pages = (total_items + page_size - 1) // page_size
    
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    
    paginated_items = query_results[start_index:end_index]
    
    return {
        'items': paginated_items,
        'pagination': {
            'current_page': page,
            'page_size': page_size,
            'total_items': total_items,
            'total_pages': total_pages,
            'has_previous': page > 1,
            'has_next': page < total_pages
        }
    }
```

### Validadores Personalizados (`utils/validators.py`)

```python
def validate_sku(sku: str) -> bool:
    """Valida formato de SKU"""
    if not sku or len(sku) < 3:
        return False
    # SKU debe ser alfanumérico con guiones permitidos
    return re.match(r'^[A-Z0-9-]+$', sku.upper()) is not None

def validate_barcode(barcode: str) -> bool:
    """Valida código de barras"""
    if not barcode:
        return False
    # Debe ser numérico y tener longitud entre 8 y 13 dígitos
    return barcode.isdigit() and 8 <= len(barcode) <= 13

def validate_price(price: Union[int, float, str, Decimal]) -> bool:
    """Valida que el precio sea positivo y tenga formato correcto"""
    try:
        decimal_price = Decimal(str(price))
        return decimal_price > 0 and decimal_price < Decimal('999999.99')
    except (ValueError, TypeError, InvalidOperation):
        return False

def validate_stock_quantity(quantity: int) -> bool:
    """Valida cantidad de stock"""
    return isinstance(quantity, int) and quantity >= 0 and quantity <= 1000000
```

## Manejo de Excepciones

### Excepciones Personalizadas (`exceptions/custom_exceptions.py`)

```python
class PosBaseeException(Exception):
    """Excepción base para el sistema POS"""
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class InsufficientStockException(PosBaseeException):
    """Excepción para stock insuficiente"""
    def __init__(self, product_name: str, requested: int, available: int):
        message = f"Stock insuficiente para {product_name}. Solicitado: {requested}, Disponible: {available}"
        super().__init__(message, "INSUFFICIENT_STOCK")
        self.product_name = product_name
        self.requested = requested
        self.available = available

class InvalidUserPermissionsException(PosBaseeException):
    """Excepción para permisos insuficientes"""
    def __init__(self, user_role: str, required_permission: str):
        message = f"Usuario con rol {user_role} no tiene permiso para: {required_permission}"
        super().__init__(message, "INSUFFICIENT_PERMISSIONS")
        self.user_role = user_role
        self.required_permission = required_permission

class ProductNotFoundException(PosBaseeException):
    """Excepción para producto no encontrado"""
    def __init__(self, identifier: str, identifier_type: str = "ID"):
        message = f"Producto no encontrado con {identifier_type}: {identifier}"
        super().__init__(message, "PRODUCT_NOT_FOUND")
        self.identifier = identifier
        self.identifier_type = identifier_type
```

### Handlers de Excepciones Globales

```python
# main.py
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(InsufficientStockException)
async def insufficient_stock_exception_handler(request: Request, exc: InsufficientStockException):
    return JSONResponse(
        status_code=400,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "details": {
                "product_name": exc.product_name,
                "requested": exc.requested,
                "available": exc.available
            }
        }
    )

@app.exception_handler(ProductNotFoundException)
async def product_not_found_exception_handler(request: Request, exc: ProductNotFoundException):
    return JSONResponse(
        status_code=404,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "details": {
                "identifier": exc.identifier,
                "identifier_type": exc.identifier_type
            }
        }
    )
```

## Testing y Calidad

### Configuración de Testing (`pytest.ini`)

```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    --disable-warnings
    --cov=.
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-fail-under=80
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow running tests
    auth: Authentication tests
    websocket: WebSocket tests
asyncio_mode = auto
```

### Fixtures de Testing (`tests/conftest.py`)

```python
@pytest.fixture(scope="function")
def db_session():
    """Sesión de BD limpia para cada test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_admin_user(db_session, test_branch):
    """Usuario admin para testing"""
    user = User(
        email="admin@test.com",
        username="testadmin",
        full_name="Test Admin",
        hashed_password=get_password_hash("testpass123"),
        role="ADMIN",
        branch_id=test_branch.id,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers_admin(client, test_admin_user):
    """Headers de autenticación para admin"""
    response = client.post(
        "/auth/login-json",
        json={
            "username": test_admin_user.username,
            "password": "testpass123"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def mock_websocket_manager(mocker):
    """Mock del WebSocket manager para testing"""
    mock = mocker.patch("websocket_manager.manager")
    mock.connect = mocker.AsyncMock()
    mock.broadcast_to_all = mocker.AsyncMock()
    # Mock de funciones de notificación
    mocker.patch("websocket_manager.notify_inventory_change", new_callable=mocker.AsyncMock)
    mocker.patch("websocket_manager.notify_new_sale", new_callable=mocker.AsyncMock)
    return mock
```

### Estructura de Testing

#### **Tests Unitarios (`tests/unit/`)**
```python
# test_auth.py
@pytest.mark.unit
@pytest.mark.auth
class TestAuthenticationService:
    def test_password_hashing(self):
        """Test encriptación de contraseñas"""
        password = "test123"
        hashed = auth_service.get_password_hash(password)
        assert auth_service.verify_password(password, hashed)
        assert not auth_service.verify_password("wrong", hashed)

    def test_token_creation(self):
        """Test creación de tokens JWT"""
        data = {"sub": "testuser"}
        token = auth_service.create_access_token(data)
        assert isinstance(token, str)
        
        payload = auth_service.decode_access_token(token)
        assert payload["sub"] == "testuser"

# test_models.py
@pytest.mark.unit
class TestModels:
    def test_user_model_creation(self, db_session):
        """Test creación de modelo User"""
        user = User(
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            hashed_password="hashedpass",
            role=UserRole.SELLER
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.role == UserRole.SELLER
```

#### **Tests de Integración (`tests/integration/`)**
```python
# test_products_api.py
@pytest.mark.integration
class TestProductsAPI:
    def test_create_product(self, client, auth_headers_admin, test_category):
        """Test creación de producto via API"""
        product_data = {
            "name": "Test Product",
            "sku": "TEST001",
            "barcode": "1234567890",
            "price": 10.99,
            "stock_quantity": 100,
            "category_id": test_category.id
        }
        
        response = client.post(
            "/products/",
            json=product_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Product"
        assert data["sku"] == "TEST001"

    def test_search_products_by_barcode(self, client, auth_headers_admin, test_product):
        """Test búsqueda por código de barras"""
        response = client.get(
            f"/products/barcode/{test_product.barcode}",
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_product.id

# test_sales_api.py
@pytest.mark.integration
@pytest.mark.slow
class TestSalesAPI:
    def test_create_sale_with_stock_validation(self, client, auth_headers_admin, 
                                              test_product, mock_websocket_manager):
        """Test creación de venta con validación de stock"""
        sale_data = {
            "sale_type": "POS",
            "payment_method": "efectivo",
            "items": [
                {
                    "product_id": test_product.id,
                    "quantity": 2,
                    "unit_price": float(test_product.price)
                }
            ]
        }
        
        response = client.post(
            "/sales/",
            json=sale_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["sale_type"] == "POS"
        assert len(data["sale_items"]) == 1
        
        # Verificar que se llamó la notificación WebSocket
        mock_websocket_manager.notify_new_sale.assert_called_once()

# test_websocket_real_time.py
@pytest.mark.integration
@pytest.mark.websocket
@pytest.mark.asyncio
class TestWebSocketRealTime:
    async def test_websocket_connection(self):
        """Test conexión WebSocket básica"""
        with TestClient(app) as client:
            with client.websocket_connect("/ws/1") as websocket:
                # Recibir mensaje de bienvenida
                data = websocket.receive_json()
                assert data["type"] == "connection_established"
                assert "Conectado a la sucursal 1" in data["message"]

    async def test_inventory_notification(self, mock_websocket_manager):
        """Test notificación de cambio de inventario"""
        await notify_inventory_change(1, 10, 8, 1, "Test User")
        
        # Verificar que se llamó el broadcast
        mock_websocket_manager.broadcast_to_other_branches.assert_called_once()
        
        call_args = mock_websocket_manager.broadcast_to_other_branches.call_args
        message = call_args[0][0]
        branch_id = call_args[0][1]
        
        assert message["type"] == "inventory_change"
        assert message["old_stock"] == 10
        assert message["new_stock"] == 8
        assert branch_id == 1
```

### Métricas de Calidad

El sistema mantiene las siguientes métricas de calidad:

- **Cobertura de Código**: Mínimo 80% de cobertura
- **Tests por Funcionalidad**: Unit tests + Integration tests
- **Performance Testing**: Tests de carga para endpoints críticos
- **Security Testing**: Tests de autenticación y autorización
- **WebSocket Testing**: Tests específicos para tiempo real

## Conclusión

El backend de POS Cesariel es una API robusta y escalable que implementa las mejores prácticas de desarrollo con FastAPI. Su arquitectura modular, sistema de autenticación granular, soporte para tiempo real via WebSockets, y testing comprehensivo lo convierten en una solución sólida para puntos de venta multisucursal.

### Características Destacadas:

1. **Arquitectura Limpia**: Separación clara entre capas (routers, services, models, utils)
2. **Seguridad Primera**: JWT, encriptación bcrypt, control de acceso por roles
3. **Multi-tenant**: Soporte nativo para múltiples sucursales
4. **Tiempo Real**: WebSockets para sincronización instantánea
5. **Testing Robusto**: 80%+ cobertura con tests unitarios e integración
6. **Escalabilidad**: Pool de conexiones, paginación, índices de BD optimizados
7. **Mantenibilidad**: Código documentado, patrones consistentes, configuración centralizada

El sistema está preparado para crecer y adaptarse a nuevas necesidades del negocio manteniendo la calidad y performance del código.