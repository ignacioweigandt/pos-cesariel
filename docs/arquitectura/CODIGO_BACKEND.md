# Documentación Técnica del Backend - POS Cesariel

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Modelos de Datos](#modelos-de-datos)
5. [API Endpoints](#api-endpoints)
6. [Servicios y Lógica de Negocio](#servicios-y-lógica-de-negocio)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [Base de Datos](#base-de-datos)
9. [WebSockets y Tiempo Real](#websockets-y-tiempo-real)
10. [Configuración y Despliegue](#configuración-y-despliegue)

## Visión General

El backend de POS Cesariel es una aplicación desarrollada en **Python** utilizando el framework **FastAPI**, diseñada para proporcionar una API REST robusta y escalable que soporta operaciones de punto de venta, gestión de inventario, e-commerce integrado y administración multisucursal.

### Características Principales

- **Framework**: FastAPI 0.104+ con Python 3.9+
- **Base de Datos**: PostgreSQL 15 con SQLAlchemy ORM
- **Autenticación**: JWT (JSON Web Tokens) con roles y permisos
- **Tiempo Real**: WebSockets para notificaciones instantáneas
- **Documentación**: OpenAPI/Swagger automática
- **Validación**: Pydantic para validación de datos
- **Imágenes**: Integración con Cloudinary
- **Arquitectura**: Patrón de Repository con separación de responsabilidades

## Arquitectura del Sistema

### Patrón Arquitectónico

El backend sigue una **arquitectura en capas** con separación clara de responsabilidades:

```
┌─────────────────────────────────────┐
│          Capa de Presentación       │
│         (FastAPI Routers)           │
├─────────────────────────────────────┤
│         Capa de Servicios           │
│       (Lógica de Negocio)           │
├─────────────────────────────────────┤
│         Capa de Acceso a Datos      │
│        (SQLAlchemy ORM)             │
├─────────────────────────────────────┤
│         Capa de Persistencia        │
│         (PostgreSQL)                │
└─────────────────────────────────────┘
```

### Componentes Principales

#### 1. **Routers (Controladores)**
- Manejan las peticiones HTTP
- Validan datos de entrada con Pydantic
- Llaman a servicios de negocio
- Retornan respuestas formateadas

#### 2. **Services (Servicios de Negocio)**
- Contienen la lógica de negocio principal
- Gestionan transacciones complejas
- Coordinan entre múltiples repositorios

#### 3. **Models (Modelos ORM)**
- Definen la estructura de la base de datos
- Establecen relaciones entre entidades
- Configuran índices y constrains

#### 4. **Schemas (Validadores Pydantic)**
- Validan datos de entrada (requests)
- Serializan datos de salida (responses)
- Documentan automáticamente la API

## Estructura de Archivos

```
backend/
├── main.py                    # Aplicación principal FastAPI
├── database.py                # Configuración de base de datos
├── auth.py                    # Funciones de autenticación (legacy)
├── models.py                  # Modelos ORM SQLAlchemy
├── schemas.py                 # Esquemas Pydantic
├── websocket_manager.py       # Gestor de WebSockets
├── cloudinary_config.py       # Configuración Cloudinary
├── init_data.py              # Datos iniciales y demo
├── init_content_data.py      # Contenido inicial (banners, config)
├── config/                   # Configuración centralizada
│   ├── __init__.py
│   └── settings.py           # Configuraciones del sistema
├── services/                 # Servicios de negocio
│   ├── __init__.py
│   └── auth_service.py       # Servicio de autenticación
├── utils/                    # Utilidades generales
│   ├── __init__.py
│   ├── validators.py         # Validadores de datos
│   └── helpers.py           # Funciones de ayuda
├── exceptions/               # Excepciones personalizadas
│   ├── __init__.py
│   └── custom_exceptions.py  # Excepciones del dominio
├── routers/                  # Endpoints API organizados
│   ├── __init__.py
│   ├── auth.py              # Autenticación y autorización
│   ├── branches.py          # Gestión de sucursales
│   ├── users.py             # Administración de usuarios
│   ├── categories.py        # Categorías de productos
│   ├── products.py          # Gestión de inventario
│   ├── sales.py             # Procesamiento de ventas
│   ├── websockets.py        # Comunicación tiempo real
│   ├── config.py            # Configuración del sistema
│   ├── content_management.py # Gestión de contenido
│   ├── ecommerce_advanced.py # E-commerce administrativo
│   └── ecommerce_public.py   # E-commerce público
└── tests/                   # Suite de pruebas
    ├── unit/                # Pruebas unitarias
    ├── integration/         # Pruebas de integración
    └── conftest.py         # Configuración de pytest
```

## Modelos de Datos

### Entidades Principales

#### 1. **User (Usuario)**
```python
class User(Base):
    id: int                    # PK autoincremental
    username: str              # Nombre de usuario único
    email: str                 # Email único
    full_name: str             # Nombre completo
    hashed_password: str       # Contraseña hasheada (bcrypt)
    role: UserRole            # ADMIN, MANAGER, SELLER, ECOMMERCE
    branch_id: int            # FK a sucursal
    is_active: bool           # Estado activo/inactivo
    created_at: datetime      # Fecha de creación
    updated_at: datetime      # Última modificación
```

#### 2. **Branch (Sucursal)**
```python
class Branch(Base):
    id: int                   # PK autoincremental
    name: str                 # Nombre de la sucursal
    address: str              # Dirección física
    phone: str                # Teléfono de contacto
    email: str                # Email institucional
    is_active: bool           # Estado operativo
    created_at: datetime      # Fecha de creación
    updated_at: datetime      # Última modificación
```

#### 3. **Product (Producto)**
```python
class Product(Base):
    id: int                   # PK autoincremental
    name: str                 # Nombre del producto
    description: str          # Descripción detallada
    sku: str                  # Código SKU único
    barcode: str              # Código de barras
    price: Decimal            # Precio de venta
    cost: Decimal             # Costo de adquisición
    stock: int                # Cantidad en stock
    min_stock: int            # Stock mínimo (alerta)
    category_id: int          # FK a categoría
    brand: str                # Marca del producto
    size: str                 # Talle/tamaño
    color: str                # Color
    image_url: str            # URL de imagen (Cloudinary)
    show_in_ecommerce: bool   # Visible en e-commerce
    is_active: bool           # Estado activo/inactivo
    created_at: datetime      # Fecha de creación
    updated_at: datetime      # Última modificación
```

#### 4. **Sale (Venta)**
```python
class Sale(Base):
    id: int                   # PK autoincremental
    sale_number: str          # Número de venta único
    sale_type: SaleType       # POS o ECOMMERCE
    status: str               # PENDING, COMPLETED, CANCELLED
    customer_name: str        # Nombre del cliente
    customer_email: str       # Email del cliente
    customer_phone: str       # Teléfono del cliente
    subtotal: Decimal         # Subtotal sin impuestos
    tax_amount: Decimal       # Monto de impuestos
    discount_amount: Decimal  # Monto de descuento
    total: Decimal           # Total final
    payment_method: str       # Método de pago
    notes: str               # Observaciones
    branch_id: int           # FK a sucursal
    user_id: int             # FK a usuario vendedor
    created_at: datetime     # Fecha de venta
    updated_at: datetime     # Última modificación
```

### Relaciones Entre Entidades

```
Branch (1) ←→ (N) User
Branch (1) ←→ (N) Sale
Branch (1) ←→ (N) InventoryMovement

User (1) ←→ (N) Sale
User (1) ←→ (N) InventoryMovement

Category (1) ←→ (N) Product
Product (1) ←→ (N) SaleItem
Product (1) ←→ (N) InventoryMovement

Sale (1) ←→ (N) SaleItem
```

## API Endpoints

### Estructura de URLs

La API sigue el patrón RESTful con recursos claramente definidos:

```
/api/v1/auth/              # Autenticación
/api/v1/branches/          # Gestión de sucursales
/api/v1/users/             # Administración de usuarios
/api/v1/categories/        # Categorías de productos
/api/v1/products/          # Gestión de inventario
/api/v1/sales/             # Procesamiento de ventas
/api/v1/config/            # Configuración del sistema
/api/v1/content/           # Gestión de contenido
/api/v1/ecommerce/         # E-commerce público
/api/v1/ecommerce-advanced/ # E-commerce administrativo
/ws/                       # WebSockets
```

### Endpoints Principales

#### Autenticación
```http
POST   /auth/login                    # Iniciar sesión
POST   /auth/login-json              # Iniciar sesión (JSON response)
GET    /auth/me                      # Obtener usuario actual
POST   /auth/refresh                 # Renovar token
POST   /auth/logout                  # Cerrar sesión
```

#### Productos
```http
GET    /products/                    # Listar productos (paginado)
POST   /products/                    # Crear producto
GET    /products/{id}                # Obtener producto específico
PUT    /products/{id}                # Actualizar producto
DELETE /products/{id}                # Eliminar producto
GET    /products/search              # Buscar productos
GET    /products/barcode/{barcode}   # Buscar por código de barras
POST   /products/import              # Importar desde CSV/Excel
GET    /products/{id}/available-sizes # Obtener talles disponibles
```

#### Ventas
```http
GET    /sales/                       # Listar ventas
POST   /sales/                       # Crear venta
GET    /sales/{id}                   # Obtener venta específica
PUT    /sales/{id}                   # Actualizar venta
DELETE /sales/{id}                   # Cancelar venta
GET    /sales/reports/dashboard      # Estadísticas del dashboard
GET    /sales/reports/daily          # Reporte diario
GET    /sales/reports/monthly        # Reporte mensual
```

### Respuestas de API

Todas las respuestas siguen un formato consistente:

```json
{
  "data": { ... },           // Datos solicitados
  "message": "string",       // Mensaje descriptivo
  "status": "success|error", // Estado de la operación
  "pagination": { ... }      // Info de paginación (cuando aplica)
}
```

### Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en datos de entrada
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos suficientes
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto de datos (ej: duplicados)
- `422 Unprocessable Entity`: Error de validación
- `500 Internal Server Error`: Error interno del servidor

## Servicios y Lógica de Negocio

### AuthenticationService

Maneja toda la lógica de autenticación y autorización:

```python
class AuthenticationService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool
    def get_password_hash(self, password: str) -> str
    def create_access_token(self, data: Dict[str, Any]) -> str
    def authenticate_user(self, db: Session, username: str, password: str) -> User
    def get_user_permissions(self, user: User) -> Dict[str, bool]
    def can_access_module(self, user: User, module: str) -> bool
```

### Funciones de Utilidad

#### Validadores (utils/validators.py)
```python
def validate_email(email: str) -> bool
def validate_phone_number(phone: str) -> bool
def validate_price(price: Any) -> bool
def validate_barcode(barcode: str) -> bool
def validate_stock_quantity(quantity: Any) -> bool
def validate_password_strength(password: str) -> dict
```

#### Helpers (utils/helpers.py)
```python
def format_currency(amount: Union[int, float, Decimal]) -> str
def calculate_percentage(part: Union[int, float], total: Union[int, float]) -> float
def apply_percentage(amount: Union[int, float, Decimal], percentage: Union[int, float]) -> Decimal
def generate_receipt_number() -> str
def generate_barcode() -> str
```

## Autenticación y Autorización

### Sistema de Autenticación JWT

El sistema utiliza **JSON Web Tokens (JWT)** para la autenticación:

1. **Login**: Usuario envía credenciales
2. **Validación**: Se verifica username/password en BD
3. **Token**: Se genera JWT con información del usuario
4. **Autorización**: Token se incluye en header `Authorization: Bearer <token>`
5. **Validación**: Cada request protegido valida el token

### Estructura del Token JWT

```json
{
  "sub": "username",           // Subject (nombre de usuario)
  "user_id": 123,             // ID del usuario
  "role": "MANAGER",          // Rol del usuario
  "branch_id": 1,             // ID de sucursal asignada
  "permissions": { ... },      // Permisos específicos
  "exp": 1640995200           // Timestamp de expiración
}
```

### Matriz de Permisos por Rol

| Módulo    | ADMIN | MANAGER | SELLER | ECOMMERCE |
|-----------|-------|---------|--------|-----------|
| POS       | ✅     | ✅       | ✅      | ❌         |
| Inventory | ✅     | ✅       | ❌      | ❌         |
| Reports   | ✅     | ✅       | ❌      | ✅         |
| Users     | ✅     | ✅       | ❌      | ❌         |
| Settings  | ✅     | ❌       | ❌      | ❌         |
| E-commerce| ✅     | ✅       | ❌      | ✅         |
| Branches  | ✅     | ❌       | ❌      | ❌         |

## Base de Datos

### Configuración PostgreSQL

```python
# database.py
DATABASE_URL = "postgresql://user:password@localhost:5432/pos_cesariel"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### Migraciones y Esquema

El sistema utiliza SQLAlchemy para crear y gestionar el esquema:

```python
# Crear todas las tablas
Base.metadata.create_all(bind=engine)
```

### Índices Importantes

- `users.username` - Único, para login rápido
- `users.email` - Único, para validación
- `products.sku` - Único, para identificación
- `products.barcode` - Para búsqueda por código
- `sales.sale_number` - Único, para referencias
- `sales.created_at` - Para reportes por fecha

## WebSockets y Tiempo Real

### Gestor de WebSockets

```python
class WebSocketManager:
    def __init__(self)
    async def connect(self, websocket: WebSocket, client_id: str)
    async def disconnect(self, websocket: WebSocket)
    async def send_personal_message(self, message: str, websocket: WebSocket)
    async def broadcast_to_branch(self, message: str, branch_id: int)
    async def broadcast_system(self, message: str)
```

### Notificaciones en Tiempo Real

- **Stock bajo**: Alerta cuando stock < min_stock
- **Nueva venta**: Notifica ventas a gerentes
- **Sincronización**: Actualiza inventario entre sucursales
- **Sistema**: Mantenimiento y actualizaciones

### Endpoints WebSocket

```http
WS /ws/{client_id}/{branch_id}    # Conexión por sucursal
```

## Configuración y Despliegue

### Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/pos_cesariel
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_cesariel
DB_USER=postgres
DB_PASSWORD=password

# Autenticación
JWT_SECRET_KEY=your-secret-key-here
JWT_EXPIRE_MINUTES=480

# Cloudinary (imágenes)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Aplicación
ENV=development
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### Docker

```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Comandos de Inicio

```bash
# Desarrollo local
python main.py

# Con uvicorn directo
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Docker
docker-compose up backend

# Inicializar datos de prueba
python init_data.py
python init_content_data.py
```

## Conclusiones

El backend de POS Cesariel implementa una arquitectura robusta y escalable que soporta:

- ✅ **Multisucursal**: Gestión centralizada con operación distribuida
- ✅ **Tiempo Real**: Sincronización instantánea vía WebSockets  
- ✅ **Seguridad**: Autenticación JWT con control de acceso por roles
- ✅ **Escalabilidad**: Arquitectura en capas con separación de responsabilidades
- ✅ **Integración**: API REST completa para múltiples frontends
- ✅ **Calidad**: Validación robusta y manejo de errores centralizado

Esta documentación técnica proporciona una visión completa del sistema backend, facilitando el mantenimiento, extensión y presentación académica del proyecto.