# INFORME TÉCNICO - SISTEMA POS CESARIEL
## Sistema de Punto de Venta Multi-Sucursal con E-commerce Integrado

**Autor:** Ignacio Weigandt  
**Fecha:** Febrero 2026  
**Versión:** 1.0.0

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Seguridad y Autenticación](#4-seguridad-y-autenticación)
5. [Sistema de Auditoría](#5-sistema-de-auditoría)
6. [Comunicación en Tiempo Real](#6-comunicación-en-tiempo-real)
7. [Gestión de Datos](#7-gestión-de-datos)
8. [Deployment y DevOps](#8-deployment-y-devops)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Descripción del Sistema

POS Cesariel es un sistema integral de gestión comercial que combina un **Point of Sale (POS)** tradicional para operaciones en sucursales físicas con una **plataforma de e-commerce** para ventas online, todo integrado en un ecosistema unificado que permite:

- **Gestión Multi-Sucursal:** Control centralizado de múltiples puntos de venta con aislamiento de datos (multi-tenancy)
- **Inventario Unificado:** Stock sincronizado en tiempo real entre todas las sucursales y el e-commerce
- **Ventas Omnicanal:** POS físico, tienda online y ventas por WhatsApp desde un único backend
- **Reportes y Analytics:** Dashboard en tiempo real con métricas de ventas, stock y rendimiento
- **Administración Completa:** CRUD de productos, usuarios, categorías, configuración de pagos y más

### 1.2 Características Principales

**Gestión Operativa:**
- ✅ Control de inventario por sucursal con alertas de stock bajo
- ✅ Sistema de ventas con múltiples métodos de pago
- ✅ Gestión de productos con variantes (talles, colores)
- ✅ Importación masiva de productos desde Excel/CSV
- ✅ Sistema de roles y permisos granulares

**E-commerce:**
- ✅ Tienda online con catálogo sincronizado
- ✅ Carrito de compras con validación de stock en tiempo real
- ✅ Checkout con información de envío/retiro
- ✅ CMS para banners y contenido promocional
- ✅ Integración con redes sociales y WhatsApp

**Tecnología:**
- ✅ API REST con documentación interactiva (Swagger/OpenAPI)
- ✅ Comunicación en tiempo real vía WebSockets
- ✅ Rate limiting para prevención de abuso
- ✅ Sistema completo de auditoría y logs
- ✅ Arquitectura containerizada con Docker

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Arquitectura General

El sistema sigue una **arquitectura de microservicios containerizados** con separación clara entre backend (API), frontends (POS Admin + E-commerce) y base de datos:

```mermaid
graph TB
    subgraph "Clientes Externos"
        Browser1[Navegador - Admin POS]
        Browser2[Navegador - E-commerce]
        Mobile[Dispositivos Móviles]
    end

    subgraph "Docker Network - pos-cesariel-network"
        subgraph "Frontend Layer - Puerto 3000"
            FrontendPOS[Next.js 15 - POS Admin<br/>React 19 + TypeScript]
        end

        subgraph "Frontend Layer - Puerto 3001"
            FrontendEcom[Next.js 15 - E-commerce<br/>React 19 + shadcn/ui]
        end

        subgraph "Backend Layer - Puerto 8000"
            API[FastAPI Backend<br/>Python 3.11+]
            WS[WebSocket Manager<br/>Real-time Sync]
        end

        subgraph "Data Layer - Puerto 5432"
            DB[(PostgreSQL 15<br/>Relational Database)]
        end

        subgraph "Admin Tools - Puerto 8080"
            Adminer[Adminer<br/>Database UI]
        end
    end

    subgraph "External Services"
        Cloudinary[Cloudinary<br/>Image CDN]
    end

    Browser1 -->|HTTP/WS| FrontendPOS
    Browser2 -->|HTTP| FrontendEcom
    Mobile -->|HTTP| FrontendEcom
    
    FrontendPOS -->|REST API| API
    FrontendPOS -->|WebSocket| WS
    FrontendEcom -->|REST API| API
    
    API -->|SQLAlchemy ORM| DB
    WS -->|Notifications| FrontendPOS
    Adminer -->|SQL| DB
    API -->|Upload/CDN| Cloudinary

    style API fill:#4CAF50,color:#fff
    style DB fill:#336791,color:#fff
    style FrontendPOS fill:#000,color:#fff
    style FrontendEcom fill:#000,color:#fff
    style WS fill:#FF6B6B,color:#fff
```

### 2.2 Arquitectura Backend (Clean Architecture)

El backend implementa **Clean Architecture** con separación en capas bien definidas:

```mermaid
graph LR
    subgraph "Presentation Layer"
        Router[FastAPI Routers<br/>HTTP Endpoints]
        WS[WebSocket Endpoints<br/>Real-time]
        Middleware[Middleware<br/>CORS, Auth, Rate Limit]
    end

    subgraph "Business Logic Layer"
        Service[Services<br/>Business Rules]
        Repo[Repositories<br/>Data Access Pattern]
    end

    subgraph "Data Layer"
        Models[SQLAlchemy Models<br/>ORM Entities]
        Schemas[Pydantic Schemas<br/>Validation]
    end

    subgraph "Infrastructure"
        DB[(PostgreSQL)]
        Cache[In-Memory Cache]
        External[External APIs<br/>Cloudinary]
    end

    Router --> Service
    WS --> Service
    Middleware --> Router
    Service --> Repo
    Repo --> Models
    Models --> DB
    Router --> Schemas
    Service --> Schemas
    Service --> External
    Service --> Cache

    style Service fill:#4CAF50,color:#fff
    style Repo fill:#2196F3,color:#fff
    style Models fill:#FF9800,color:#fff
```

**Estructura de Directorios del Backend:**

```
backend/
├── main.py                    # FastAPI app initialization, CORS, middleware
├── database.py                # SQLAlchemy engine, session management
├── auth.py                    # JWT authentication, password hashing
├── websocket_manager.py       # WebSocket connection management
├── config/
│   ├── settings.py            # Environment variables, configuration
│   └── rate_limit.py          # Rate limiting configuration
├── app/
│   ├── models/                # SQLAlchemy ORM models (Domain entities)
│   │   ├── __init__.py        # Centralized model exports
│   │   ├── user.py            # User, Branch models
│   │   ├── product.py         # Product, Category models
│   │   ├── inventory.py       # BranchStock, ProductSize
│   │   ├── sales.py           # Sale, SaleItem models
│   │   ├── audit.py           # ConfigChangeLog, SecurityAuditLog
│   │   └── notification.py    # Notification system
│   ├── schemas/               # Pydantic models (API contracts)
│   ├── repositories/          # Data access layer (CRUD operations)
│   └── services/              # Business logic layer
└── routers/                   # FastAPI route handlers (Controllers)
    ├── auth.py                # /auth/* - Authentication
    ├── products.py            # /products/* - Product management
    ├── sales.py               # /sales/* - Sales operations
    ├── reports.py             # /reports/* - Analytics
    └── ecommerce_public.py    # /ecommerce/* - Public API
```

**Principios Aplicados:**

1. **Separation of Concerns:** Cada capa tiene una responsabilidad única
2. **Dependency Inversion:** Las capas externas dependen de las internas, no al revés
3. **Repository Pattern:** Abstracción de acceso a datos
4. **Service Layer:** Lógica de negocio centralizada
5. **Dependency Injection:** FastAPI Depends() para gestión de dependencias

### 2.3 Arquitectura Frontend (Feature-Based)

Ambos frontends (POS Admin y E-commerce) usan **Next.js 15 App Router** con estructura basada en features:

```mermaid
graph TB
    subgraph "POS Admin Frontend"
        AppRouter1[App Router<br/>Next.js 15]
        Features1[Features Modules<br/>products, sales, reports]
        Shared1[Shared Components<br/>Layout, Auth, UI]
        State1[State Management<br/>Zustand + React Query]
    end

    subgraph "E-commerce Frontend"
        AppRouter2[App Router<br/>Next.js 15]
        Context2[React Context<br/>Cart, Checkout]
        DataService[Data Service Layer<br/>Caching + Fallback]
        Components2[UI Components<br/>shadcn/ui]
    end

    subgraph "Backend API"
        API[FastAPI REST API<br/>Port 8000]
    end

    Features1 --> API
    State1 --> API
    DataService --> API
    Context2 --> API

    style Features1 fill:#000,color:#fff
    style DataService fill:#4CAF50,color:#fff
```

**Estructura Frontend POS Admin:**

```
frontend/pos-cesariel/
├── app/                       # Next.js 15 App Router
│   ├── layout.tsx             # Root layout (thin wrapper)
│   ├── page.tsx               # Home page (redirects to dashboard)
│   ├── login/                 # Login page
│   ├── dashboard/             # Dashboard feature
│   ├── products/              # Products management
│   ├── sales/                 # Sales operations
│   └── reports/               # Analytics and reports
├── features/                  # Feature modules (business logic)
│   └── <feature-name>/
│       ├── components/        # Feature-specific components
│       ├── hooks/             # Custom hooks (data fetching)
│       ├── types/             # TypeScript interfaces
│       └── api/               # Feature-specific API calls
└── shared/                    # Shared code across features
    ├── api/
    │   └── client.ts          # Axios client with JWT interceptors
    ├── components/
    │   ├── Layout/            # Main layout component
    │   └── ui/                # Reusable UI components
    └── hooks/
        └── useAuth.ts         # Auth state (Zustand)
```

**Estructura E-commerce Frontend:**

```
ecommerce/
├── app/
│   ├── (shop)/                # Shop pages group
│   │   ├── page.tsx           # Home page with banners
│   │   ├── productos/         # Product catalog
│   │   ├── carrito/           # Shopping cart
│   │   └── checkout/          # Checkout flow
│   ├── context/
│   │   └── EcommerceContext.tsx  # Cart + checkout state
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   ├── api-types.ts       # TypeScript interfaces
│   │   └── data-service.ts    # Caching layer + fallback
│   └── components/
│       ├── modals/            # Cart, checkout modals
│       └── ConnectionStatus.tsx  # Backend status indicator
└── components/ui/             # shadcn/ui components
```

### 2.4 Flujo de Datos

**Flujo de una Venta (POS):**

```mermaid
sequenceDiagram
    participant U as Usuario POS
    participant F as Frontend (Next.js)
    participant A as API (FastAPI)
    participant DB as PostgreSQL
    participant WS as WebSocket Manager

    U->>F: Agregar productos al carrito
    F->>A: GET /products/{id}/available-sizes
    A->>DB: Query stock por sucursal
    DB-->>A: Stock disponible
    A-->>F: Validar stock
    
    U->>F: Confirmar venta
    F->>A: POST /sales (items, payment, user_id)
    A->>DB: BEGIN TRANSACTION
    A->>DB: INSERT Sale
    A->>DB: INSERT SaleItems
    A->>DB: UPDATE BranchStock (restar stock)
    DB-->>A: COMMIT
    
    A->>WS: notify_new_sale(sale_id, total, branch_id)
    WS-->>F: WebSocket notification
    A-->>F: Sale created (200 OK)
    F-->>U: Mostrar comprobante
```

**Flujo de una Compra (E-commerce):**

```mermaid
sequenceDiagram
    participant C as Cliente Web
    participant E as E-commerce Frontend
    participant DS as Data Service (Cache)
    participant A as API Backend
    participant DB as Database

    C->>E: Navegar a tienda
    E->>DS: getProducts()
    DS->>DS: Check cache (5 min TTL)
    
    alt Cache hit
        DS-->>E: Productos desde cache
    else Cache miss
        DS->>A: GET /ecommerce/products
        A->>DB: Query productos (show_in_ecommerce=true)
        DB-->>A: Productos activos
        A-->>DS: JSON Response
        DS->>DS: Store in cache
        DS-->>E: Productos frescos
    end
    
    C->>E: Agregar al carrito
    E->>E: Validar stock (validateStock)
    E->>E: Actualizar context state
    
    C->>E: Checkout
    E->>A: POST /sales (sale_type='ecommerce')
    A->>DB: Create sale + reduce stock
    DB-->>A: Success
    A-->>E: Sale ID + confirmation
    E-->>C: Orden confirmada
```

---

## 3. STACK TECNOLÓGICO

### 3.1 Backend Stack

| Tecnología | Versión | Propósito | Justificación Técnica |
|------------|---------|-----------|----------------------|
| **Python** | 3.11+ | Lenguaje de programación | Ecosistema maduro para APIs, type hints, async/await nativo |
| **FastAPI** | Latest | Framework web | Performance excepcional (Starlette + Pydantic), documentación automática con OpenAPI, async support, type safety |
| **PostgreSQL** | 15 | Base de datos relacional | ACID compliance, constraints robustos, JSON support, escalabilidad vertical y horizontal |
| **SQLAlchemy** | 2.0+ | ORM | ORM maduro con soporte async, migrations con Alembic, type hints, relationships declarativas |
| **Pydantic** | Latest | Validación de datos | Validación automática, serialización, type safety, integración perfecta con FastAPI |
| **python-jose** | Latest | JWT tokens | Implementación estándar de JWT con múltiples algoritmos (HS256, RS256) |
| **passlib + bcrypt** | Latest | Hashing de passwords | Bcrypt es el estándar de industria para hashing de passwords (resistente a rainbow tables) |
| **uvicorn** | Latest | ASGI server | Server async con performance excelente, hot reload en desarrollo |
| **slowapi** | Latest | Rate limiting | Protección contra abuse y brute force attacks basado en SlowAPI |

**Librerías Adicionales:**
- **python-multipart:** Upload de archivos
- **cloudinary:** CDN para imágenes de productos
- **python-dotenv:** Gestión de environment variables
- **alembic:** Migraciones de base de datos

### 3.2 Frontend Stack

#### POS Admin Frontend

| Tecnología | Versión | Propósito | Justificación Técnica |
|------------|---------|-----------|----------------------|
| **Next.js** | 15.5.9 | Framework React | App Router, Server Components, optimizaciones automáticas, routing file-based |
| **React** | 19.0.0 | UI Library | Ecosystem maduro, React Compiler (no necesita useMemo/useCallback), performance excelente |
| **TypeScript** | 5 | Type system | Type safety end-to-end, autocomplete, refactoring seguro, menos bugs en runtime |
| **Zustand** | 4.5.7 | State management | Ligero (1KB), simple API, sin boilerplate, devtools integrados |
| **React Query** | 5.90.20 | Server state | Caching automático, refetch strategies, optimistic updates, devtools |
| **Axios** | 1.10.0 | HTTP client | Interceptors para JWT, request/response transformation, timeout handling |
| **React Hook Form** | 7.59.0 | Form management | Performance (uncontrolled inputs), validación flexible, menos re-renders |
| **Tailwind CSS** | 4 | Utility-first CSS | Productividad extrema, tree-shaking automático, mobile-first, dark mode support |
| **Recharts** | 2.15.4 | Charts library | Gráficos declarativos con React, responsive, customizable |
| **Lucide React** | Latest | Icon library | Iconos modernos, tree-shakeable, SVG optimizados |

#### E-commerce Frontend

| Tecnología | Versión | Propósito | Justificación Técnica |
|------------|---------|-----------|----------------------|
| **Next.js** | 15.5.9 | Framework React | SSR/SSG para SEO, Image optimization, API routes, ISR (Incremental Static Regeneration) |
| **React** | 19 | UI Library | Component-based architecture, Virtual DOM performance |
| **shadcn/ui** | Latest | Component library | Radix UI primitives + Tailwind, accesible (ARIA), customizable |
| **Radix UI** | Latest | Headless components | Accesibilidad completa (WCAG 2.1), keyboard navigation, focus management |
| **React Hook Form** | 7.54.1 | Forms | Validación de checkout, customer info forms |
| **Zod** | 3.24.1 | Schema validation | Type-safe validation, integración con React Hook Form |
| **date-fns** | 3.6.0 | Date utilities | Ligero, tree-shakeable, i18n support |
| **Sonner** | 1.7.1 | Toast notifications | Notificaciones elegantes, stacking, promise-based |

**Testing Stack (Ambos Frontends):**
- **Jest** 29.7.0 - Unit testing framework
- **Testing Library** 16.x - Component testing (user-centric)
- **Cypress** 13.6.x - E2E testing
- **Artillery** 2.0.0 - Load testing (solo POS)
- **Lighthouse CI** 0.12.0 - Performance auditing (solo POS)

### 3.3 Infrastructure & DevOps

| Tecnología | Versión | Propósito | Justificación Técnica |
|------------|---------|-----------|----------------------|
| **Docker** | Latest | Containerization | Consistency entre dev/prod, isolation, easy deployment |
| **Docker Compose** | 3.8 | Multi-container orchestration | Define toda la stack en YAML, networking automático, volumes management |
| **PostgreSQL** | 15 | Primary database | ACID, constraints, transactions, JSON support, extensiones (PostGIS futuro) |
| **Adminer** | Latest | DB admin tool | UI web para PostgreSQL, ligero, single PHP file |
| **Nginx** | Latest (Prod) | Reverse proxy | Load balancing, SSL termination, static file serving, rate limiting |
| **Make** | System | Task automation | Comandos simplificados (make dev, make migrate, make backup) |

**Variables de Entorno Requeridas:**

```bash
# Backend (.env)
DATABASE_URL=postgresql://postgres:password@db:5432/pos_cesariel
SECRET_KEY=<random-32-char-string>
JWT_EXPIRE_MINUTES=480
CLOUDINARY_CLOUD_NAME=<your-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
ENV=development  # o production
DEBUG=true       # false en production

# Frontend POS Admin (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# E-commerce Frontend (.env.local)
API_URL=http://backend:8000                    # Server-side (Docker internal)
NEXT_PUBLIC_API_URL=http://localhost:8000      # Client-side (browser)
PORT=3001
```

### 3.4 Justificación de Elecciones Tecnológicas

#### ¿Por qué FastAPI sobre Flask/Django?

**Ventajas de FastAPI:**
1. **Performance:** 2-3x más rápido que Flask gracias a Starlette (async I/O)
2. **Type Safety:** Pydantic + Type hints → validación automática + documentación
3. **Documentación Automática:** Swagger UI y ReDoc out-of-the-box
4. **Async Native:** Soporte nativo para operaciones asíncronas (WebSockets, database)
5. **Modern Python:** Aprovecha Python 3.7+ features (async/await, type hints)

**Comparación:**
```python
# FastAPI - Type-safe, auto-documented, validated
@app.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Pydantic valida automáticamente
    # Genera OpenAPI docs automáticamente
    return repository.create(db, product)

# Flask - Manual validation, manual documentation
@app.route("/products", methods=["POST"])
def create_product():
    # Validación manual
    data = request.get_json()
    if not data.get("name"):
        return {"error": "Name required"}, 400
    # Sin type hints, sin auto-docs
```

#### ¿Por qué Next.js 15 sobre Create React App?

**Ventajas de Next.js:**
1. **SSR/SSG:** SEO crítico para e-commerce
2. **App Router:** File-based routing, layouts anidados, loading/error states
3. **Image Optimization:** next/image con lazy loading automático
4. **Performance:** Code splitting automático, prefetching
5. **Developer Experience:** Hot reload rápido, TypeScript integrado

#### ¿Por qué PostgreSQL sobre MySQL/MongoDB?

**Ventajas de PostgreSQL:**
1. **ACID Compliance:** Transacciones robustas (crítico para ventas/stock)
2. **Constraints:** Foreign keys, check constraints, unique constraints
3. **JSON Support:** Columnas JSONB para datos flexibles (ProductImage.metadata)
4. **Extensibilidad:** PostGIS (futuro: geo-localización de sucursales)
5. **Performance:** Query planner avanzado, índices sofisticados

#### ¿Por qué Zustand sobre Redux?

**Ventajas de Zustand:**
1. **Simplicidad:** No boilerplate (actions, reducers, dispatch)
2. **Bundle Size:** 1KB vs 10KB+ de Redux
3. **TypeScript:** Type inference automático
4. **DevTools:** Integración con Redux DevTools

```typescript
// Zustand - Simple y directo
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null })
}))

// Redux - Mucho boilerplate
// actions.ts, reducers.ts, store.ts, types.ts...
```

---

## 4. SEGURIDAD Y AUTENTICACIÓN

### 4.1 Arquitectura de Seguridad

El sistema implementa múltiples capas de seguridad:

```mermaid
graph TB
    subgraph "Security Layers"
        RateLimit[Rate Limiting<br/>SlowAPI]
        CORS[CORS Middleware<br/>Origin Validation]
        JWT[JWT Authentication<br/>Bearer Token]
        RBAC[Role-Based Access Control<br/>Admin/Manager/Seller/Ecommerce]
        BranchIsolation[Branch Isolation<br/>Multi-tenant Security]
        Audit[Audit Logging<br/>Security Events]
    end

    Request[HTTP Request] --> RateLimit
    RateLimit --> CORS
    CORS --> JWT
    JWT --> RBAC
    RBAC --> BranchIsolation
    BranchIsolation --> Audit
    Audit --> Endpoint[Protected Endpoint]

    style JWT fill:#4CAF50,color:#fff
    style RBAC fill:#FF6B6B,color:#fff
    style Audit fill:#FFC107,color:#000
```

### 4.2 Autenticación JWT

**Flujo de Autenticación:**

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant A as API /auth/login
    participant DB as Database
    participant JWT as JWT Handler

    U->>F: Submit login form
    F->>A: POST /auth/login {username, password}
    A->>DB: Query user by username
    DB-->>A: User record (hashed_password)
    
    A->>A: verify_password(plain, hashed)
    
    alt Password correcto
        A->>JWT: create_access_token({"sub": username, "role": role})
        JWT-->>A: JWT Token (signed)
        A-->>F: {"access_token": "eyJhbG...", "token_type": "bearer"}
        F->>F: Store token (localStorage/cookie)
        F-->>U: Redirect to dashboard
    else Password incorrecto
        A->>DB: Log security event (LOGIN_FAILED)
        A-->>F: 401 Unauthorized
        F-->>U: Show error message
    end
```

**Implementación JWT:**

```python
# backend/auth.py

# Hashing de contraseñas con bcrypt (salt automático)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash password con bcrypt + salt random"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Verifica password de forma timing-safe"""
    return pwd_context.verify(plain, hashed)

# JWT con expiración de 8 horas
def create_access_token(data: dict, expires_delta: timedelta = None):
    """Crea JWT firmado con HS256"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=480))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

# Dependency injection para proteger endpoints
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Extrae y valida usuario desde JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(401, "Invalid token")
    except JWTError:
        raise HTTPException(401, "Could not validate credentials")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(401, "User not found")
    
    return user
```

**Uso en Endpoints:**

```python
# Endpoint protegido básico
@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

# Endpoint solo para Admin
@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: User = Depends(require_admin)):
    # Solo usuarios con role=ADMIN pueden acceder
    ...

# Endpoint con validación de sucursal
@router.get("/branches/{branch_id}/products")
def get_branch_products(
    branch_id: int,
    current_user: User = Depends(get_current_user)
):
    # Validar que usuario pertenezca a esa sucursal (o sea Admin)
    if current_user.role != UserRole.ADMIN and current_user.branch_id != branch_id:
        raise HTTPException(403, "Access denied to different branch")
    ...
```

### 4.3 Control de Acceso Basado en Roles (RBAC)

**Roles del Sistema:**

```python
class UserRole(str, enum.Enum):
    ADMIN = "admin"           # Acceso total multi-sucursal
    MANAGER = "manager"       # Gestión de sucursal + reportes
    SELLER = "seller"         # Operaciones POS + stock
    ECOMMERCE = "ecommerce"   # Solo operaciones de tienda online
```

**Matriz de Permisos:**

| Operación | ADMIN | MANAGER | SELLER | ECOMMERCE |
|-----------|-------|---------|--------|-----------|
| **Usuarios** |
| Crear usuarios | ✅ | ❌ | ❌ | ❌ |
| Ver usuarios sucursal | ✅ | ✅ | ❌ | ❌ |
| Editar roles | ✅ | ❌ | ❌ | ❌ |
| **Productos** |
| Crear productos | ✅ | ✅ | ❌ | ❌ |
| Editar productos | ✅ | ✅ | ✅* | ❌ |
| Importar productos | ✅ | ✅ | ❌ | ❌ |
| Ver catálogo público | ✅ | ✅ | ✅ | ✅ |
| **Inventario** |
| Ajustar stock | ✅ | ✅ | ✅ | ❌ |
| Ver stock multisucursal | ✅ | ❌ | ❌ | ❌ |
| Alertas de stock bajo | ✅ | ✅ | ✅ | ❌ |
| **Ventas** |
| Crear venta POS | ✅ | ✅ | ✅ | ❌ |
| Crear venta E-commerce | ✅ | ✅ | ✅ | ✅ |
| Ver ventas multisucursal | ✅ | ❌ | ❌ | ❌ |
| Ver ventas sucursal | ✅ | ✅ | ✅ | ❌ |
| **Reportes** |
| Reportes multisucursal | ✅ | ❌ | ❌ | ❌ |
| Reportes sucursal | ✅ | ✅ | ✅** | ❌ |
| **Configuración** |
| Sistema global | ✅ | ❌ | ❌ | ❌ |
| Configuración sucursal | ✅ | ✅ | ❌ | ❌ |
| E-commerce config | ✅ | ✅ | ❌ | ❌ |

\* Solo actualización de stock durante ventas  
\** Reportes limitados (ventas propias, stock básico)

**Implementación de Guards:**

```python
# backend/auth.py

def require_admin(current_user: User = Depends(get_current_active_user)):
    """Solo usuarios ADMIN"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Admin access required")
    return current_user

def require_manager_or_admin(current_user: User = Depends(get_current_active_user)):
    """ADMIN o MANAGER"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(403, "Manager or Admin access required")
    return current_user

def require_stock_management_permission(current_user: User = Depends(get_current_active_user)):
    """Permisos para modificar stock (ADMIN, MANAGER, SELLER)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER]:
        raise HTTPException(403, "Stock management permission required")
    return current_user

def require_same_branch_or_admin(branch_id: int, current_user: User = Depends(get_current_active_user)):
    """Validación multi-tenant: solo acceso a propia sucursal (excepto Admin)"""
    if current_user.role == UserRole.ADMIN:
        return current_user  # Admin puede acceder a todas las sucursales
    
    if current_user.branch_id != branch_id:
        raise HTTPException(403, "Access denied: different branch")
    
    return current_user
```

### 4.4 Rate Limiting

Protección contra abuso y ataques de fuerza bruta:

```python
# backend/config/rate_limit.py

class RateLimits:
    # Autenticación - límites estrictos
    AUTH_LOGIN = "5/minute"          # Prevenir brute force
    AUTH_REGISTER = "3/hour"         # Prevenir spam de cuentas
    
    # E-commerce público - límites generosos
    ECOMMERCE_READ = "100/minute"    # Navegar productos
    ECOMMERCE_WRITE = "10/minute"    # Crear órdenes
    
    # Admin - límites moderados
    ADMIN_READ = "60/minute"
    ADMIN_WRITE = "30/minute"
    
    # Operaciones pesadas - muy restrictivos
    BULK_IMPORT = "10/hour"          # Importar productos
    REPORT_GENERATION = "10/minute"  # Generar reportes
    FILE_UPLOAD = "20/hour"          # Subir imágenes

# Uso en endpoints
from config.rate_limit import limiter, RateLimits

@router.post("/auth/login")
@limiter.limit(RateLimits.AUTH_LOGIN)  # Solo 5 intentos por minuto
async def login(request: Request, ...):
    ...

@router.post("/products/import")
@limiter.limit(RateLimits.BULK_IMPORT)  # Solo 10 imports por hora
async def import_products(request: Request, ...):
    ...
```

**Respuesta cuando se excede el límite:**

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please slow down and try again later.",
  "retry_after": "60 seconds"
}
```

Headers HTTP incluidos:
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1675294800
Retry-After: 60
```

### 4.5 CORS (Cross-Origin Resource Sharing)

Configuración para permitir comunicación entre dominios diferentes (frontend en 3000/3001, backend en 8000):

```python
# backend/main.py

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Desarrollo local
        "http://localhost:3000",       # POS Admin
        "http://localhost:3001",       # E-commerce
        
        # Docker containers
        "http://frontend:3000",
        "http://ecommerce:3001",
        
        # Producción (agregar dominios reales)
        "https://pos.tuempresa.com",
        "https://tienda.tuempresa.com",
    ],
    allow_credentials=True,   # Permite cookies y Authorization header
    allow_methods=["*"],      # GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],      # Authorization, Content-Type, etc.
)
```

**CORS Preflight Handling:**

Para requests complejos (PUT, DELETE, custom headers), el navegador envía un request OPTIONS primero:

```python
# backend/main.py

class OptionsMiddleware(BaseHTTPMiddleware):
    """Maneja peticiones OPTIONS para CORS preflight"""
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return Response(
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers", "*"),
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "86400",  # Cache 24 horas
                }
            )
        
        response = await call_next(request)
        return response
```

### 4.6 Seguridad de Contraseñas

**Bcrypt Hashing:**

```python
# Características de bcrypt:
# - Salt automático (22 caracteres random)
# - Cost factor configurable (10-12 rounds recomendado)
# - Timing-safe comparison (previene timing attacks)
# - Resistente a rainbow tables

# Ejemplo de hash generado:
# $2b$12$KIXqP0Zk8nWKjQv7XPzC5OXm3vZ8kW9... (60 chars)
#  ││ └─ Salt (22 chars) + Hash (31 chars)
#  │└─ Cost factor (12 = 2^12 = 4096 iterations)
#  └─ Algoritmo bcrypt versión 2b

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Crear hash (toma ~100-300ms intencionalmente para prevenir brute force)
hashed = get_password_hash("my_secure_password")

# Verificar (timing-safe comparison)
is_valid = verify_password("my_secure_password", hashed)  # True
```

**Políticas de Contraseñas (Recomendadas para Producción):**

```python
# Validación en Pydantic schema
class UserCreate(BaseModel):
    username: str = Field(min_length=4, max_length=50)
    password: str = Field(min_length=8, max_length=100)
    
    @validator('password')
    def validate_password_strength(cls, v):
        """Validar contraseña fuerte"""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        # Opcionalmente: verificar caracteres especiales
        return v
```

---

## 5. SISTEMA DE AUDITORÍA

### 5.1 Arquitectura de Auditoría

El sistema implementa **auditoría completa** con dos subsistemas:

1. **Config Change Log:** Tracking de cambios en configuraciones
2. **Security Audit Log:** Tracking de eventos de seguridad

```mermaid
graph TB
    subgraph "Events Sources"
        Login[Login Attempts]
        Config[Config Changes]
        Perms[Permission Changes]
        Stock[Stock Adjustments]
        Sales[Sales Operations]
    end

    subgraph "Audit System"
        ConfigLog[(ConfigChangeLog<br/>Table)]
        SecurityLog[(SecurityAuditLog<br/>Table)]
    end

    subgraph "Audit Data"
        Who[Who: user_id, username]
        What[What: action, field, values]
        When[When: timestamp]
        Where[Where: IP, user_agent]
        Why[Why: notes, reason]
    end

    Login --> SecurityLog
    Config --> ConfigLog
    Perms --> SecurityLog
    Stock --> ConfigLog
    Sales --> ConfigLog

    ConfigLog --> Who
    ConfigLog --> What
    ConfigLog --> When
    ConfigLog --> Where
    ConfigLog --> Why

    SecurityLog --> Who
    SecurityLog --> What
    SecurityLog --> When
    SecurityLog --> Where

    style ConfigLog fill:#4CAF50,color:#fff
    style SecurityLog fill:#FF6B6B,color:#fff
```

### 5.2 Config Change Log

**Propósito:** Rastrear TODOS los cambios en configuraciones críticas del sistema.

**Modelo de Datos:**

```python
# backend/app/models/audit.py

class ChangeAction(str, enum.Enum):
    """Tipos de acciones auditables"""
    CREATE = "CREATE"             # Nuevo registro creado
    UPDATE = "UPDATE"             # Registro modificado
    DELETE = "DELETE"             # Registro eliminado
    ACTIVATE = "ACTIVATE"         # Registro reactivado
    DEACTIVATE = "DEACTIVATE"     # Registro desactivado temporalmente

class ConfigChangeLog(Base):
    """
    Registro inmutable de cambios en configuraciones.
    
    Rastreado en tablas:
    - system_config (moneda, impuestos)
    - tax_rates (alícuotas impositivas)
    - payment_methods (medios de pago)
    - ecommerce_config (configuración tienda)
    - branch_config (configuración por sucursal)
    """
    __tablename__ = "config_change_log"
    
    id = Column(Integer, primary_key=True)
    
    # QUÉ se cambió
    table_name = Column(String(100), nullable=False, index=True)
    record_id = Column(Integer, nullable=False, index=True)
    action = Column(SQLEnum(ChangeAction), nullable=False)
    
    # Detalle del cambio
    field_name = Column(String(100), nullable=True)      # Campo específico
    old_value = Column(Text, nullable=True)              # Valor anterior
    new_value = Column(Text, nullable=True)              # Valor nuevo
    
    # QUIÉN y CUÁNDO
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), index=True)
    changed_at = Column(DateTime, default=func.now(), index=True)
    
    # DÓNDE y CONTEXTO
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)                  # Justificación
    
    # Relationship
    changed_by = relationship("User", backref="config_changes")
```

**Ejemplo de Uso:**

```python
# Registrar cambio en configuración de moneda
from app.models import ConfigChangeLog, ChangeAction

# Usuario admin cambió moneda de USD a ARS
log = ConfigChangeLog(
    table_name="system_config",
    record_id=1,
    action=ChangeAction.UPDATE,
    field_name="currency_code",
    old_value="USD",
    new_value="ARS",
    changed_by_user_id=current_user.id,
    ip_address=request.client.host,
    user_agent=request.headers.get("user-agent"),
    notes="Cambio de moneda para operación en Argentina"
)
db.add(log)
db.commit()

# Query: ¿Quién cambió la moneda?
recent_changes = db.query(ConfigChangeLog)\
    .filter(ConfigChangeLog.table_name == "system_config")\
    .filter(ConfigChangeLog.field_name == "currency_code")\
    .order_by(ConfigChangeLog.changed_at.desc())\
    .limit(10).all()

for change in recent_changes:
    print(f"{change.changed_at}: {change.changed_by.username} cambió {change.field_name} de {change.old_value} a {change.new_value}")
```

**Property Helper:**

```python
@property
def summary(self) -> str:
    """Resumen legible en español del cambio"""
    action_text = {
        ChangeAction.CREATE: "creó",
        ChangeAction.UPDATE: "actualizó",
        ChangeAction.DELETE: "eliminó",
        ChangeAction.ACTIVATE: "activó",
        ChangeAction.DEACTIVATE: "desactivó"
    }
    
    base = f"{action_text[self.action]} registro {self.record_id} en {self.table_name}"
    
    if self.field_name:
        base += f", campo '{self.field_name}'"
        if self.old_value:
            base += f": '{self.old_value}' → '{self.new_value}'"
        else:
            base += f" = '{self.new_value}'"
    
    return base

# Uso:
# log.summary → "actualizó registro 1 en system_config, campo 'currency_code': 'USD' → 'ARS'"
```

### 5.3 Security Audit Log

**Propósito:** Rastrear eventos de seguridad y autenticación.

**Modelo de Datos:**

```python
# backend/app/models/audit.py

class SecurityAuditLog(Base):
    """
    Registro de eventos de seguridad.
    
    Eventos rastreados:
    - LOGIN: Intentos de autenticación (exitosos y fallidos)
    - LOGOUT: Cierre de sesión
    - PERMISSION_CHANGE: Cambios de roles/permisos
    - ACCESS_DENIED: Intentos de acceso denegados
    - SUSPICIOUS_ACTIVITY: Actividad sospechosa detectada
    """
    __tablename__ = "security_audit_log"
    
    id = Column(Integer, primary_key=True)
    
    # Tipo de evento
    event_type = Column(String(50), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    username = Column(String(100), nullable=True, index=True)  # Para login fallidos
    success = Column(String(10), nullable=False, default="SUCCESS")  # SUCCESS/FAILED
    
    # Contexto
    ip_address = Column(String(50), nullable=True, index=True)
    user_agent = Column(String(500), nullable=True)
    details = Column(Text, nullable=True)  # JSON con detalles adicionales
    
    # Timestamp
    created_at = Column(DateTime, default=func.now(), index=True)
    
    # Relationship
    user = relationship("User", backref="security_events")
```

**Ejemplo de Uso:**

```python
# 1. Login exitoso
security_log = SecurityAuditLog(
    event_type="LOGIN",
    user_id=user.id,
    username=user.username,
    success="SUCCESS",
    ip_address=request.client.host,
    user_agent=request.headers.get("user-agent"),
    details=json.dumps({"method": "jwt", "role": user.role.value})
)
db.add(security_log)

# 2. Login fallido (password incorrecto)
security_log = SecurityAuditLog(
    event_type="LOGIN",
    user_id=None,  # Usuario no autenticado
    username=form_data.username,  # Username intentado
    success="FAILED",
    ip_address=request.client.host,
    user_agent=request.headers.get("user-agent"),
    details=json.dumps({"reason": "invalid_password", "attempts": 3})
)
db.add(security_log)

# 3. Acceso denegado (intentó acceder a otra sucursal)
security_log = SecurityAuditLog(
    event_type="ACCESS_DENIED",
    user_id=current_user.id,
    username=current_user.username,
    success="FAILED",
    ip_address=request.client.host,
    details=json.dumps({
        "reason": "different_branch",
        "attempted_branch_id": branch_id,
        "user_branch_id": current_user.branch_id
    })
)
db.add(security_log)

# 4. Cambio de permisos
security_log = SecurityAuditLog(
    event_type="PERMISSION_CHANGE",
    user_id=target_user.id,
    username=target_user.username,
    success="SUCCESS",
    ip_address=request.client.host,
    details=json.dumps({
        "changed_by": current_user.username,
        "old_role": old_role,
        "new_role": new_role
    })
)
db.add(security_log)
```

**Queries de Análisis:**

```python
# Detectar ataques de fuerza bruta: múltiples login failures desde misma IP
failed_logins = db.query(SecurityAuditLog)\
    .filter(SecurityAuditLog.event_type == "LOGIN")\
    .filter(SecurityAuditLog.success == "FAILED")\
    .filter(SecurityAuditLog.ip_address == suspicious_ip)\
    .filter(SecurityAuditLog.created_at >= datetime.now() - timedelta(hours=1))\
    .count()

if failed_logins > 10:
    # Bloquear IP temporalmente
    ...

# Actividad de un usuario específico
user_activity = db.query(SecurityAuditLog)\
    .filter(SecurityAuditLog.user_id == user_id)\
    .order_by(SecurityAuditLog.created_at.desc())\
    .limit(50).all()

# IPs sospechosas (múltiples usuarios desde misma IP)
suspicious_ips = db.query(
    SecurityAuditLog.ip_address,
    func.count(func.distinct(SecurityAuditLog.user_id)).label("user_count")
)\
    .filter(SecurityAuditLog.event_type == "LOGIN")\
    .filter(SecurityAuditLog.success == "SUCCESS")\
    .group_by(SecurityAuditLog.ip_address)\
    .having(func.count(func.distinct(SecurityAuditLog.user_id)) > 5)\
    .all()
```

### 5.4 Retención de Logs

**Políticas de Retención:**

| Tipo de Log | Retención Mínima | Retención Recomendada | Justificación |
|-------------|------------------|----------------------|---------------|
| ConfigChangeLog | 2 años | 5 años | Auditorías fiscales, troubleshooting histórico |
| SecurityAuditLog | 1 año | 3 años | Cumplimiento normativo, análisis forense |
| Application Logs | 30 días | 90 días | Debugging, monitoreo |

**Implementación de Archivado:**

```python
# Script de archivado automático (ejecutar mensualmente)
from datetime import datetime, timedelta

def archive_old_logs(db: Session, table: Base, retention_days: int):
    """
    Archiva logs antiguos a tabla histórica o archivo
    """
    cutoff_date = datetime.now() - timedelta(days=retention_days)
    
    # Logs a archivar
    old_logs = db.query(table)\
        .filter(table.created_at < cutoff_date)\
        .all()
    
    if old_logs:
        # Exportar a archivo JSON/CSV
        export_to_archive(old_logs, f"archive_{table.__tablename__}_{cutoff_date.strftime('%Y%m%d')}.json")
        
        # Eliminar de tabla principal (opcional, si se confirma archivo)
        db.query(table).filter(table.created_at < cutoff_date).delete()
        db.commit()
        
        print(f"Archived {len(old_logs)} logs from {table.__tablename__}")

# Ejecutar mensualmente
archive_old_logs(db, SecurityAuditLog, retention_days=365)  # 1 año
archive_old_logs(db, ConfigChangeLog, retention_days=730)   # 2 años
```

### 5.5 Alertas de Seguridad

**Alertas Automáticas:**

```python
# backend/app/services/security_alerts.py

async def check_security_threats(db: Session):
    """
    Análisis de logs para detectar amenazas
    """
    now = datetime.now()
    one_hour_ago = now - timedelta(hours=1)
    
    # 1. Brute force attacks (>10 failed logins en 1 hora desde misma IP)
    failed_login_counts = db.query(
        SecurityAuditLog.ip_address,
        func.count(SecurityAuditLog.id).label("count")
    )\
        .filter(SecurityAuditLog.event_type == "LOGIN")\
        .filter(SecurityAuditLog.success == "FAILED")\
        .filter(SecurityAuditLog.created_at >= one_hour_ago)\
        .group_by(SecurityAuditLog.ip_address)\
        .having(func.count(SecurityAuditLog.id) > 10)\
        .all()
    
    for ip, count in failed_login_counts:
        # Enviar alerta a admin
        await notify_admin(
            f"⚠️ Posible brute force attack desde IP {ip}: {count} intentos fallidos en 1 hora"
        )
        # Bloquear IP temporalmente
        await block_ip_temporarily(ip, hours=24)
    
    # 2. Multiple access denied (usuario intentando acceder sin permisos)
    denied_counts = db.query(
        SecurityAuditLog.user_id,
        func.count(SecurityAuditLog.id).label("count")
    )\
        .filter(SecurityAuditLog.event_type == "ACCESS_DENIED")\
        .filter(SecurityAuditLog.created_at >= one_hour_ago)\
        .group_by(SecurityAuditLog.user_id)\
        .having(func.count(SecurityAuditLog.id) > 5)\
        .all()
    
    for user_id, count in denied_counts:
        user = db.query(User).filter(User.id == user_id).first()
        await notify_admin(
            f"⚠️ Usuario {user.username} intentó {count} accesos no autorizados en 1 hora"
        )
    
    # 3. Suspicious IP (múltiples usuarios desde misma IP)
    multi_user_ips = db.query(
        SecurityAuditLog.ip_address,
        func.count(func.distinct(SecurityAuditLog.user_id)).label("user_count")
    )\
        .filter(SecurityAuditLog.event_type == "LOGIN")\
        .filter(SecurityAuditLog.success == "SUCCESS")\
        .filter(SecurityAuditLog.created_at >= one_hour_ago)\
        .group_by(SecurityAuditLog.ip_address)\
        .having(func.count(func.distinct(SecurityAuditLog.user_id)) > 3)\
        .all()
    
    for ip, user_count in multi_user_ips:
        await notify_admin(
            f"⚠️ IP sospechosa {ip}: {user_count} usuarios diferentes en 1 hora"
        )
```

---

## 6. COMUNICACIÓN EN TIEMPO REAL

### 6.1 Arquitectura WebSocket

El sistema implementa **WebSockets** para sincronización en tiempo real entre sucursales:

```mermaid
sequenceDiagram
    participant Admin as Admin POS<br/>(Sucursal A)
    participant Seller as Seller POS<br/>(Sucursal B)
    participant WS as WebSocket Manager
    participant Backend as Backend API
    participant DB as Database

    Admin->>WS: Connect WebSocket /ws/1
    WS-->>Admin: Connection established (branch 1)
    
    Seller->>WS: Connect WebSocket /ws/2
    WS-->>Seller: Connection established (branch 2)
    
    Admin->>Backend: POST /sales (create sale)
    Backend->>DB: Create sale + reduce stock
    DB-->>Backend: Success
    
    Backend->>WS: notify_new_sale(sale_id, total, branch_id=1)
    WS-->>Admin: New sale notification
    WS-->>Seller: New sale notification (from branch 1)
    
    Admin->>Backend: PATCH /products/5/stock (adjust stock)
    Backend->>DB: Update BranchStock
    DB-->>Backend: Success
    
    Backend->>WS: notify_inventory_change(product_id, old, new, branch=1)
    WS-->>Seller: Stock updated (Product 5: 50 → 45)
```

### 6.2 Implementación WebSocket Manager

```python
# backend/websocket_manager.py

class ConnectionManager:
    """
    Gestor de conexiones WebSocket con routing por sucursal.
    
    Permite:
    - Broadcast a todas las conexiones
    - Broadcast a una sucursal específica
    - Broadcast a todas excepto una sucursal
    - Mensajes personales a conexión específica
    """
    def __init__(self):
        # Conexiones por sucursal: {branch_id: [websocket1, websocket2, ...]}
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Todas las conexiones para broadcast global
        self.all_connections: List[WebSocket] = []
        # Mapeo de websocket a branch_id
        self.connection_branch_map: Dict[WebSocket, int] = {}

    async def register_connection(self, websocket: WebSocket, branch_id: int, username: str = None):
        """Registra conexión ya aceptada"""
        if websocket not in self.all_connections:
            self.all_connections.append(websocket)
        
        if branch_id not in self.active_connections:
            self.active_connections[branch_id] = []
        if websocket not in self.active_connections[branch_id]:
            self.active_connections[branch_id].append(websocket)
        
        self.connection_branch_map[websocket] = branch_id
        logger.info(f"WebSocket registered: user={username}, branch={branch_id}")

    def disconnect(self, websocket: WebSocket):
        """Desconecta y limpia referencias"""
        if websocket in self.all_connections:
            self.all_connections.remove(websocket)
        
        branch_id = self.connection_branch_map.get(websocket)
        if branch_id and branch_id in self.active_connections:
            if websocket in self.active_connections[branch_id]:
                self.active_connections[branch_id].remove(websocket)
            
            if not self.active_connections[branch_id]:
                del self.active_connections[branch_id]
        
        if websocket in self.connection_branch_map:
            del self.connection_branch_map[websocket]

    async def broadcast_to_branch(self, message: Dict[str, Any], branch_id: int):
        """Envía mensaje a todas las conexiones de una sucursal"""
        if branch_id in self.active_connections:
            for connection in self.active_connections[branch_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.debug(f"Error sending to branch {branch_id}: {e}")

    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Envía mensaje a todas las conexiones activas"""
        for connection in self.all_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.debug(f"Error broadcasting: {e}")

# Instancia global
manager = ConnectionManager()
```

### 6.3 Funciones de Notificación

```python
# backend/websocket_manager.py

async def notify_inventory_change(product_id: int, old_stock: int, new_stock: int, branch_id: int, user_name: str):
    """Notifica cambios en inventario"""
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
    # Enviar a todas las sucursales EXCEPTO la que hizo el cambio
    await manager.broadcast_to_other_branches(message, branch_id)

async def notify_new_sale(sale_id: int, total_amount: float, branch_id: int, user_name: str):
    """Notifica nuevas ventas"""
    message = {
        "type": "new_sale",
        "sale_id": sale_id,
        "total_amount": total_amount,
        "branch_id": branch_id,
        "user_name": user_name,
        "timestamp": datetime.now().isoformat(),
        "message": f"Nueva venta por ${total_amount:.2f} en sucursal {branch_id}"
    }
    # Broadcast a todas las sucursales (para dashboard global)
    await manager.broadcast_to_all(message)

async def notify_low_stock(product_id: int, product_name: str, current_stock: int, min_stock: int, branch_id: int):
    """Notifica stock bajo"""
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

async def notify_product_update(product_id: int, product_name: str, action: str, user_name: str, branch_id: int):
    """Notifica actualizaciones de productos"""
    message = {
        "type": "product_update",
        "product_id": product_id,
        "product_name": product_name,
        "action": action,  # created, updated, deleted
        "user_name": user_name,
        "branch_id": branch_id,
        "timestamp": datetime.now().isoformat(),
        "message": f"Producto {product_name}: {action} por {user_name}"
    }
    await manager.broadcast_to_all(message)
```

### 6.4 Endpoint WebSocket

```python
# backend/routers/websockets.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from websocket_manager import manager
from auth import get_current_user
import jwt

router = APIRouter()

@router.websocket("/ws/{branch_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    branch_id: int,
    token: str = Query(...)  # JWT token como query param
):
    """
    WebSocket endpoint para comunicación en tiempo real.
    
    URL: ws://localhost:8000/ws/{branch_id}?token={jwt_token}
    
    Autenticación via JWT token en query string (ya que WebSocket no soporta headers custom).
    """
    try:
        # Validar JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")
        
        if not username:
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        # Aceptar conexión
        await websocket.accept()
        
        # Registrar conexión
        await manager.register_connection(websocket, branch_id, username)
        
        # Mantener conexión abierta
        while True:
            # Recibir mensajes del cliente (ping/pong para keep-alive)
            data = await websocket.receive_text()
            
            # Opcional: Procesar comandos del cliente
            # {"type": "ping"} → responder con {"type": "pong"}
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    
    except WebSocketDisconnect:
        # Cliente desconectó
        manager.disconnect(websocket)
        logger.info(f"WebSocket disconnected: branch={branch_id}, user={username}")
    
    except jwt.JWTError:
        # Token inválido
        await websocket.close(code=1008, reason="Invalid or expired token")
    
    except Exception as e:
        # Error inesperado
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
        await websocket.close(code=1011, reason="Internal server error")
```

### 6.5 Cliente WebSocket (Frontend)

```typescript
// frontend/pos-cesariel/shared/hooks/useWebSocket.ts

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from './useAuth';

export type WebSocketMessage = {
  type: 'inventory_change' | 'new_sale' | 'low_stock_alert' | 'product_update' | 'pong';
  message: string;
  timestamp: string;
  [key: string]: any;
};

export function useWebSocket(branchId: number) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token || !branchId) return;

    // Crear conexión WebSocket con JWT token
    const wsUrl = `ws://localhost:8000/ws/${branchId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Enviar ping cada 30 segundos para keep-alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 30000);

      // Guardar interval para limpieza
      (ws as any)._pingInterval = pingInterval;
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        setLastMessage(message);

        // Manejar notificaciones según tipo
        switch (message.type) {
          case 'new_sale':
            // Actualizar dashboard de ventas
            toast.success(message.message);
            break;

          case 'inventory_change':
            // Actualizar lista de productos
            toast.info(message.message);
            break;

          case 'low_stock_alert':
            // Alerta crítica de stock
            toast.error(message.message);
            break;

          case 'product_update':
            // Refetch productos
            queryClient.invalidateQueries(['products']);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);

      // Limpiar ping interval
      if ((ws as any)._pingInterval) {
        clearInterval((ws as any)._pingInterval);
      }

      // Reconectar después de 5 segundos
      setTimeout(() => {
        console.log('Attempting WebSocket reconnection...');
        // Trigger re-render para reconectar
      }, 5000);
    };

    wsRef.current = ws;

    // Cleanup al desmontar
    return () => {
      if (wsRef.current) {
        if ((wsRef.current as any)._pingInterval) {
          clearInterval((wsRef.current as any)._pingInterval);
        }
        wsRef.current.close();
      }
    };
  }, [token, branchId]);

  return { isConnected, lastMessage };
}
```

**Uso en Componente:**

```typescript
// frontend/pos-cesariel/features/dashboard/DashboardContainer.tsx

import { useWebSocket } from '@/shared/hooks/useWebSocket';

export function DashboardContainer() {
  const { user } = useAuthStore();
  const { isConnected, lastMessage } = useWebSocket(user.branch_id);

  useEffect(() => {
    if (lastMessage?.type === 'new_sale') {
      // Refetch dashboard stats
      queryClient.invalidateQueries(['dashboard-stats']);
    }
  }, [lastMessage]);

  return (
    <div>
      {/* Indicator de conexión */}
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 En vivo' : '🔴 Desconectado'}
      </div>

      {/* Dashboard content */}
      <DashboardStats />
    </div>
  );
}
```

### 6.6 Tipos de Mensajes WebSocket

| Tipo | Trigger | Destinatario | Payload |
|------|---------|-------------|---------|
| `inventory_change` | Stock ajustado en sucursal A | Todas EXCEPTO A | product_id, old_stock, new_stock, branch_id, user_name |
| `new_sale` | Venta creada en cualquier sucursal | Todas | sale_id, total_amount, branch_id, user_name |
| `low_stock_alert` | Stock cae bajo umbral mínimo | Todas | product_id, product_name, current_stock, min_stock, branch_id |
| `product_update` | Producto creado/editado/eliminado | Todas | product_id, product_name, action, user_name, branch_id |
| `sale_status_change` | Estado de venta cambiado (e-commerce) | Todas | sale_id, sale_number, old_status, new_status, branch_id |
| `dashboard_update` | Actualización de métricas en tiempo real | Todas | update_type, branch_id, data |

---

## 7. GESTIÓN DE DATOS

### 7.1 Modelo de Datos

**Estructura de Base de Datos:**

```mermaid
erDiagram
    Branch ||--o{ User : "tiene"
    Branch ||--o{ BranchStock : "gestiona"
    Branch ||--o{ Sale : "registra"
    
    User ||--o{ Sale : "crea"
    User ||--o{ ConfigChangeLog : "modifica"
    User ||--o{ SecurityAuditLog : "genera"
    User ||--o{ Notification : "recibe"
    
    Category ||--o{ Product : "clasifica"
    Brand ||--o{ Product : "manufactura"
    
    Product ||--o{ ProductSize : "tiene"
    Product ||--o{ BranchStock : "stock_en"
    Product ||--o{ SaleItem : "vendido_como"
    Product ||--o{ ProductImage : "muestra"
    
    Sale ||--o{ SaleItem : "contiene"
    
    BranchStock }o--|| Product : "trackea"
    BranchStock }o--|| Branch : "en_sucursal"
    BranchStock }o--o| ProductSize : "para_talle"
    
    SystemConfig ||--|| EcommerceConfig : "configura"
    
    Branch {
        int id PK
        string name
        string address
        string phone
        boolean is_active
        datetime created_at
    }
    
    User {
        int id PK
        string username UK
        string hashed_password
        enum role
        int branch_id FK
        boolean is_active
        datetime created_at
    }
    
    Product {
        int id PK
        string name
        decimal price
        int category_id FK
        int brand_id FK
        boolean has_sizes
        boolean show_in_ecommerce
        datetime created_at
    }
    
    BranchStock {
        int id PK
        int product_id FK
        int branch_id FK
        int size_id FK nullable
        int quantity
        int min_stock
        datetime updated_at
    }
    
    Sale {
        int id PK
        string sale_number UK
        int branch_id FK
        int user_id FK
        enum sale_type
        decimal total_amount
        string payment_method
        datetime created_at
    }
    
    SaleItem {
        int id PK
        int sale_id FK
        int product_id FK
        int size_id FK nullable
        int quantity
        decimal unit_price
        decimal subtotal
    }
```

**Dominios de Modelos:**

| Dominio | Modelos | Propósito |
|---------|---------|-----------|
| **User Management** | Branch, User | Gestión de sucursales y usuarios |
| **Product Catalog** | Category, Product, Brand, ProductImage | Catálogo de productos |
| **Inventory** | BranchStock, ProductSize, InventoryMovement, ImportLog | Control de stock por sucursal |
| **Sales** | Sale, SaleItem | Registro de ventas POS/E-commerce/WhatsApp |
| **E-commerce** | EcommerceConfig, StoreBanner | Configuración tienda online |
| **Payment** | PaymentConfig, CustomInstallment, PaymentMethod | Medios de pago |
| **System** | SystemConfig, TaxRate | Configuración global (moneda, impuestos) |
| **Notifications** | Notification, NotificationSetting | Alertas y notificaciones |
| **Audit** | ConfigChangeLog, SecurityAuditLog | Trazabilidad y seguridad |

### 7.2 Gestión de Stock Multi-Sucursal

**CRÍTICO:** El stock NO se guarda en `Product.stock_quantity` (es un campo calculado/readonly). El stock REAL está en la tabla `BranchStock`:

```python
# ❌ INCORRECTO - No modificar Product.stock_quantity directamente
product.stock_quantity = 50  # Esto se sobrescribirá

# ✅ CORRECTO - Usar BranchStock
branch_stock = db.query(BranchStock).filter(
    BranchStock.product_id == product_id,
    BranchStock.branch_id == branch_id,
    BranchStock.size_id == size_id  # NULL si no tiene talles
).first()

if branch_stock:
    branch_stock.quantity -= quantity_sold
    db.commit()
```

**Business Logic para Productos con Talles:**

```python
# Producto SIN talles (has_sizes = False)
# → Un solo registro en BranchStock por sucursal (size_id = NULL)

branch_stock = BranchStock(
    product_id=10,
    branch_id=1,
    size_id=None,  # No tiene talles
    quantity=100,
    min_stock=10
)

# Producto CON talles (has_sizes = True)
# → Un registro en BranchStock por cada (product, branch, size)

for size in ["S", "M", "L", "XL"]:
    product_size = ProductSize(product_id=20, size_name=size)
    db.add(product_size)
    db.flush()  # Obtener product_size.id
    
    branch_stock = BranchStock(
        product_id=20,
        branch_id=1,
        size_id=product_size.id,
        quantity=50,
        min_stock=5
    )
    db.add(branch_stock)

db.commit()
```

**Validación de Stock antes de Venta:**

```python
# backend/routers/sales.py

def validate_stock_availability(
    db: Session,
    items: List[SaleItemCreate],
    branch_id: int
) -> Tuple[bool, List[str]]:
    """
    Valida que haya stock suficiente para todos los items.
    
    Returns:
        (is_valid, error_messages)
    """
    errors = []
    
    for item in items:
        # Buscar stock en sucursal
        branch_stock = db.query(BranchStock).filter(
            BranchStock.product_id == item.product_id,
            BranchStock.branch_id == branch_id,
            BranchStock.size_id == item.size_id  # Puede ser NULL
        ).first()
        
        if not branch_stock:
            errors.append(f"Producto {item.product_id} no disponible en sucursal")
            continue
        
        if branch_stock.quantity < item.quantity:
            errors.append(
                f"Stock insuficiente para producto {item.product_id}: "
                f"disponible {branch_stock.quantity}, solicitado {item.quantity}"
            )
    
    return (len(errors) == 0, errors)

# Uso en endpoint
@router.post("/sales")
async def create_sale(sale_data: SaleCreate, db: Session = Depends(get_db)):
    # Validar stock
    is_valid, errors = validate_stock_availability(db, sale_data.items, sale_data.branch_id)
    if not is_valid:
        raise HTTPException(400, detail={"errors": errors})
    
    # Crear venta y reducir stock en transacción
    sale = ...
    db.commit()
```

### 7.3 Migraciones de Base de Datos

**Alembic para Control de Versiones del Schema:**

```bash
# Crear nueva migración después de cambios en models
docker compose exec backend alembic revision --autogenerate -m "add user avatar field"

# Aplicar migraciones pendientes
docker compose exec backend alembic upgrade head

# Ver historial de migraciones
docker compose exec backend alembic history

# Rollback última migración
docker compose exec backend alembic downgrade -1

# Ver migración actual
docker compose exec backend alembic current
```

**Estructura de Migraciones:**

```
backend/alembic/
├── env.py                 # Configuración de Alembic
├── script.py.mako         # Template para nuevas migraciones
└── versions/              # Migraciones versionadas
    ├── 001_initial_schema.py
    ├── 002_add_brand_table.py
    ├── 003_add_ecommerce_config.py
    └── 004_add_audit_tables.py
```

**Ejemplo de Migración:**

```python
# backend/alembic/versions/004_add_audit_tables.py

"""add audit tables

Revision ID: abc123def456
Revises: 003_add_ecommerce_config
Create Date: 2026-02-03 10:30:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'abc123def456'
down_revision = '003_add_ecommerce_config'
branch_labels = None
depends_on = None

def upgrade():
    # ConfigChangeLog table
    op.create_table(
        'config_change_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('table_name', sa.String(length=100), nullable=False),
        sa.Column('record_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.Enum('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE', name='changeaction'), nullable=False),
        sa.Column('field_name', sa.String(length=100), nullable=True),
        sa.Column('old_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=True),
        sa.Column('changed_by_user_id', sa.Integer(), nullable=True),
        sa.Column('changed_at', sa.DateTime(), nullable=False),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['changed_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Indexes
    op.create_index('ix_config_change_log_table_name', 'config_change_log', ['table_name'])
    op.create_index('ix_config_change_log_record_id', 'config_change_log', ['record_id'])
    op.create_index('ix_config_change_log_changed_at', 'config_change_log', ['changed_at'])

def downgrade():
    op.drop_index('ix_config_change_log_changed_at', 'config_change_log')
    op.drop_index('ix_config_change_log_record_id', 'config_change_log')
    op.drop_index('ix_config_change_log_table_name', 'config_change_log')
    op.drop_table('config_change_log')
```

---

## 8. DEPLOYMENT Y DEVOPS

### 8.1 Arquitectura Docker

**Docker Compose Orchestration:**

```yaml
# docker-compose.yml

version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: pos_cesariel
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pos-cesariel-network

  # Backend FastAPI
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/pos_cesariel
      - ENV=development
      - DEBUG=true
    depends_on:
      - db
    networks:
      - pos-cesariel-network

  # POS Admin Frontend (Next.js)
  frontend:
    build: ./frontend/pos-cesariel
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/pos-cesariel:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
    networks:
      - pos-cesariel-network

  # E-commerce Frontend (Next.js)
  ecommerce:
    build: ./ecommerce
    ports:
      - "3001:3001"
    volumes:
      - ./ecommerce:/app
      - /app/node_modules
    environment:
      - API_URL=http://backend:8000           # Server-side (Docker internal)
      - NEXT_PUBLIC_API_URL=http://localhost:8000  # Client-side (browser)
      - PORT=3001
    depends_on:
      - backend
    networks:
      - pos-cesariel-network

  # Adminer (Database UI)
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db
    networks:
      - pos-cesariel-network

volumes:
  postgres_data:

networks:
  pos-cesariel-network:
    driver: bridge
```

### 8.2 Comandos Make

**Makefile para Operaciones Comunes:**

```makefile
# Makefile

# Iniciar todos los servicios
dev:
	docker compose up -d

# Iniciar solo POS Admin + Backend
dev-pos:
	docker compose up -d db backend frontend

# Iniciar solo E-commerce + Backend
dev-ecommerce:
	docker compose up -d db backend ecommerce

# Ver logs del backend
logs-backend:
	docker compose logs -f backend

# Ver todos los logs
logs-all:
	docker compose logs -f

# Detener todos los servicios
down:
	docker compose down

# Reiniciar servicio específico
restart-backend:
	docker compose restart backend

# Shell dentro del contenedor backend
shell-backend:
	docker compose exec backend bash

# Shell de PostgreSQL
shell-db:
	docker compose exec db psql -U postgres -d pos_cesariel

# Ejecutar migraciones
migrate-upgrade:
	docker compose exec backend alembic upgrade head

# Crear nueva migración
migrate-create:
	docker compose exec backend alembic revision --autogenerate -m "$(MSG)"

# Ver estado de migraciones
migrate-current:
	docker compose exec backend alembic current

# Backup de base de datos
backup-db:
	docker compose exec db pg_dump -U postgres pos_cesariel > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Restaurar backup
restore-db:
	cat $(FILE) | docker compose exec -T db psql -U postgres pos_cesariel

# Rebuild contenedores
rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

# Ver estado de servicios
status:
	docker compose ps

# Limpiar recursos Docker
prune:
	docker system prune -a --volumes -f
```

**Uso:**

```bash
# Desarrollo diario
make dev               # Levantar todo
make logs-backend      # Ver logs en tiempo real
make shell-backend     # Acceder al contenedor

# Migraciones
make migrate-create MSG="add notifications"
make migrate-upgrade

# Base de datos
make backup-db         # Backup automático con timestamp
make restore-db FILE=backup_20260203_103000.sql

# Troubleshooting
make down
make rebuild
make dev
```

### 8.3 Deployment a Producción

**Consideraciones de Producción:**

1. **Environment Variables:**
```bash
# .env.production
ENV=production
DEBUG=False
SECRET_KEY=<random-64-char-string>
DATABASE_URL=postgresql://user:pass@prod-db:5432/pos_prod
CLOUDINARY_CLOUD_NAME=<prod-cloud>
CLOUDINARY_API_KEY=<prod-key>
CLOUDINARY_API_SECRET=<prod-secret>
RATE_LIMIT_ENABLED=true
```

2. **Docker Compose para Producción:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    command: gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
    environment:
      - ENV=production
      - DEBUG=False
    env_file:
      - .env.production

  frontend:
    build:
      context: ./frontend/pos-cesariel
      dockerfile: Dockerfile.prod
    restart: always
    command: npm run start
    environment:
      - NODE_ENV=production

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
      - ecommerce
```

3. **Nginx Reverse Proxy:**
```nginx
# nginx/nginx.conf
upstream backend_api {
    server backend:8000;
}

upstream frontend_pos {
    server frontend:3000;
}

upstream frontend_ecommerce {
    server ecommerce:3001;
}

server {
    listen 80;
    server_name api.tuempresa.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tuempresa.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Backend API
    location / {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

server {
    listen 443 ssl http2;
    server_name pos.tuempresa.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # POS Admin Frontend
    location / {
        proxy_pass http://frontend_pos;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name tienda.tuempresa.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # E-commerce Frontend
    location / {
        proxy_pass http://frontend_ecommerce;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **CI/CD Pipeline (GitHub Actions):**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Backend Tests
        run: |
          cd backend
          docker compose exec backend pytest
      
      - name: Run Frontend Tests
        run: |
          cd frontend/pos-cesariel
          npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/pos-cesariel
            git pull origin main
            docker compose -f docker-compose.prod.yml down
            docker compose -f docker-compose.prod.yml build
            docker compose -f docker-compose.prod.yml up -d
            docker compose exec backend alembic upgrade head
```

### 8.4 Monitoreo y Logs

**Logging Centralizado:**

```python
# backend/main.py - Configuración de logging

import logging
from logging.handlers import RotatingFileHandler

# Configurar logger
logger = logging.getLogger("pos_cesariel")
logger.setLevel(logging.DEBUG if settings.debug_mode else logging.INFO)

# Handler para archivo (rotación automática)
file_handler = RotatingFileHandler(
    "logs/pos_cesariel.log",
    maxBytes=10_000_000,  # 10MB
    backupCount=5          # Mantener 5 archivos
)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

# Handler para consola
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(
    '%(levelname)s: %(message)s'
))

logger.addHandler(file_handler)
logger.addHandler(console_handler)
```

**Health Checks:**

```python
# backend/main.py

@app.get("/health")
async def health_check():
    """Health check endpoint para monitoring"""
    return {
        "status": "healthy",
        "service": "Backend POS Cesariel",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "database": await check_db_connection()
    }

async def check_db_connection():
    """Verificar conexión a BD"""
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        return "connected"
    except Exception:
        return "disconnected"
```

**Prometheus Metrics (Futuro):**

```python
# Integración con Prometheus para métricas
from prometheus_client import Counter, Histogram, generate_latest

# Contadores
requests_total = Counter('requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
sales_total = Counter('sales_total', 'Total sales created', ['branch_id', 'sale_type'])

# Histogramas
request_duration = Histogram('request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])

@app.get("/metrics")
async def metrics():
    """Endpoint de métricas para Prometheus"""
    return Response(content=generate_latest(), media_type="text/plain")
```

---

## CONCLUSIONES

### Resumen de Características Técnicas

1. **Arquitectura Moderna:** Clean Architecture + Feature-based + Microservicios containerizados
2. **Stack Tecnológico Actualizado:** FastAPI + Next.js 15 + React 19 + PostgreSQL 15
3. **Seguridad Robusta:** JWT + RBAC + Rate Limiting + Auditoría completa
4. **Multi-tenancy:** Aislamiento de datos por sucursal con validaciones estrictas
5. **Tiempo Real:** WebSockets para sincronización entre sucursales
6. **Escalabilidad:** Docker + Docker Compose + posibilidad de Kubernetes
7. **Observabilidad:** Logging centralizado + Audit trails + Health checks

### Ventajas Competitivas

- ✅ **Open Source:** Sin costos de licencias, código auditable
- ✅ **Arquitectura Limpia:** Fácil de mantener y extender
- ✅ **Type Safety:** TypeScript + Pydantic + SQLAlchemy = menos bugs
- ✅ **Developer Experience:** Hot reload, documentación automática, testing integrado
- ✅ **Performance:** FastAPI async + React 19 compiler + caching inteligente
- ✅ **Seguridad:** Cumple estándares de industria (OWASP Top 10)

### Trabajo Futuro

**Features Planeadas:**
- [ ] Notificaciones push (Firebase Cloud Messaging)
- [ ] Reportes avanzados con ML (predicción de ventas)
- [ ] Geo-localización de sucursales (PostGIS)
- [ ] App móvil (React Native)
- [ ] Integración con AFIP (facturación electrónica Argentina)
- [ ] Sistema de fidelización de clientes
- [ ] Análisis de sentimiento de reviews

**Mejoras Técnicas:**
- [ ] Kubernetes para orquestación en producción
- [ ] Redis para caching distribuido
- [ ] Elasticsearch para búsquedas avanzadas
- [ ] GraphQL API como alternativa a REST
- [ ] Event Sourcing para auditoría granular

---

**Documentación Técnica Completa - POS Cesariel v1.0.0**  
**Fecha de Elaboración:** Febrero 2026  
**Autor:** Ignacio Weigandt
