# Mapa Visual del Sistema POS Cesariel

Este documento presenta la arquitectura completa del sistema POS Cesariel mediante diagramas visuales que muestran las relaciones entre componentes, flujos de datos e integraciones.

## 1. Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Cliente/Usuario"
        A[Administrador POS]
        B[Cliente E-commerce]
    end
    
    subgraph "Frontend Applications"
        C[POS Admin Frontend<br/>Next.js :3000]
        D[E-commerce Store<br/>Next.js :3001]
    end
    
    subgraph "Backend API"
        E[FastAPI Backend<br/>:8000]
        F[11 Router Modules]
        G[JWT Authentication]
        H[WebSocket Manager]
    end
    
    subgraph "Database Layer"
        I[(PostgreSQL<br/>:5432)]
        J[SQLAlchemy ORM]
        K[Database Models]
    end
    
    subgraph "External Services"
        L[Cloudinary<br/>Image Management]
        M[WhatsApp Business API]
        N[Docker Compose<br/>Orchestration]
    end
    
    A --> C
    B --> D
    C --> E
    D --> E
    E --> F
    F --> G
    E --> H
    E --> J
    J --> K
    K --> I
    E --> L
    E --> M
    
    N -.-> C
    N -.-> D
    N -.-> E
    N -.-> I
```

## 2. Arquitectura del Backend (FastAPI)

```mermaid
graph LR
    subgraph "API Routers"
        A1[auth.py<br/>Authentication]
        A2[users.py<br/>User Management]
        A3[branches.py<br/>Branch Management]
        A4[products.py<br/>Inventory]
        A5[sales.py<br/>Sales & Reports]
        A6[categories.py<br/>Product Categories]
        A7[config.py<br/>System Config]
        A8[ecommerce_advanced.py<br/>Admin E-commerce]
        A9[ecommerce_public.py<br/>Public Store API]
        A10[content_management.py<br/>CMS & Banners]
        A11[websockets.py<br/>Real-time Updates]
    end
    
    subgraph "Core Services"
        B1[JWT Authentication]
        B2[Role-based Access]
        B3[WebSocket Manager]
        B4[Cloudinary Integration]
        B5[Database Session]
    end
    
    subgraph "Database Models"
        C1[User, Branch, Role]
        C2[Product, Category, Stock]
        C3[Sale, SaleItem, OrderStatus]
        C4[EcommerceConfig, Banner]
        C5[WhatsApp, SocialMedia]
    end
    
    A1 --> B1
    A2 --> B2
    A4 --> B4
    A11 --> B3
    A1 -.-> C1
    A4 -.-> C2
    A5 -.-> C3
    A8 -.-> C4
    A10 -.-> C5
    B5 --> C1
    B5 --> C2
    B5 --> C3
    B5 --> C4
    B5 --> C5
```

## 3. Frontend POS Admin - Estructura de Páginas

```mermaid
graph TD
    A[Root Layout<br/>Authentication]
    
    A --> B[Dashboard<br/>/:page.tsx]
    A --> C[POS System<br/>/pos/page.tsx]
    A --> D[Inventory<br/>/inventory/page.tsx]
    A --> E[Reports<br/>/reports/page.tsx]
    A --> F[Users Management<br/>/users/*]
    A --> G[Settings<br/>/settings/*]
    A --> H[E-commerce Admin<br/>/ecommerce/page.tsx]
    
    F --> F1[Users List<br/>/users/page.tsx]
    F --> F2[Create User<br/>/users/create/page.tsx]
    F --> F3[Edit User<br/>/users/edit/[id]/page.tsx]
    F --> F4[Branches<br/>/users/branches/*]
    
    G --> G1[Payment Config<br/>/settings/payment-config/]
    G --> G2[E-commerce Config<br/>/settings/ecommerce/]
    G --> G3[Store Banners<br/>/settings/store-banners/]
    G --> G4[Social Media<br/>/settings/social-media/]
    G --> G5[Currency & Tax<br/>/settings/currency/]
```

## 4. Frontend E-commerce - Estructura de Páginas

```mermaid
graph TD
    A[Root Layout<br/>E-commerce Theme]
    
    A --> B[Homepage<br/>/page.tsx<br/>Banners + Featured Products]
    A --> C[Product Catalog<br/>/productos/page.tsx]
    A --> D[Product Details<br/>/productos/[id]/page.tsx]
    A --> E[Shopping Cart<br/>/carrito/page.tsx]
    A --> F[About Us<br/>/sobre-nosotros/page.tsx]
    A --> G[Contact<br/>/contacto/page.tsx]
    
    subgraph "Components & Context"
        H[EcommerceContext<br/>Cart Management]
        I[CartContext<br/>Shopping Cart State]
        J[ProductCard<br/>Product Display]
        K[Header/Footer<br/>Navigation]
        L[Modals<br/>Size/Color/Checkout]
    end
    
    B --> H
    C --> J
    D --> L
    E --> I
    H -.-> I
```

## 5. Flujo de Datos - Sistema de Ventas

```mermaid
sequenceDiagram
    participant U as Usuario
    participant POS as POS Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant WS as WebSocket
    participant EC as E-commerce
    
    Note over U, EC: Venta en POS
    U->>POS: Buscar productos
    POS->>API: GET /products
    API->>DB: Query products with stock
    DB-->>API: Products data
    API-->>POS: Products with stock
    
    U->>POS: Agregar productos al carrito
    POS->>API: Validate stock
    API->>DB: Check available stock
    DB-->>API: Stock validation
    API-->>POS: Stock confirmed
    
    U->>POS: Procesar venta
    POS->>API: POST /sales (create sale)
    API->>DB: BEGIN transaction
    API->>DB: Create sale record
    API->>DB: Create sale_items
    API->>DB: Update product stock
    API->>DB: Create inventory_movement
    API->>DB: COMMIT transaction
    API->>WS: notify_new_sale()
    API->>WS: notify_inventory_change()
    WS-->>EC: Real-time stock update
    API-->>POS: Sale confirmation
    
    Note over U, EC: Stock sincronizado en E-commerce
```

## 6. Flujo de Datos - E-commerce Integration

```mermaid
sequenceDiagram
    participant C as Cliente
    participant EC as E-commerce
    participant API as FastAPI
    participant DB as Database
    participant WA as WhatsApp
    
    Note over C, WA: Compra en E-commerce
    C->>EC: Ver productos
    EC->>API: GET /ecommerce/products
    API->>DB: Query products WHERE show_in_ecommerce=true
    DB-->>API: E-commerce products
    API-->>EC: Product catalog
    
    C->>EC: Agregar al carrito
    EC->>API: Validate stock
    API->>DB: Check real-time stock
    DB-->>API: Stock available
    API-->>EC: Add to cart confirmed
    
    C->>EC: Checkout
    EC->>API: POST /sales (sale_type='ECOMMERCE')
    API->>DB: Create e-commerce sale
    API->>DB: Update stock
    API->>WA: Send order notification
    API-->>EC: Order created
    EC-->>C: Order confirmation
    
    Note over C, WA: Pedido procesado e integrado en POS
```

## 7. Modelo de Base de Datos - Relaciones Principales

```mermaid
erDiagram
    User {
        int id PK
        string username
        string email
        string password_hash
        enum role
        int branch_id FK
        datetime created_at
        boolean is_active
    }
    
    Branch {
        int id PK
        string name
        string address
        string phone
        string email
        boolean is_active
        datetime created_at
    }
    
    Product {
        int id PK
        string name
        string code
        string barcode
        decimal price
        int stock
        int category_id FK
        boolean show_in_ecommerce
        datetime created_at
    }
    
    Category {
        int id PK
        string name
        string description
        boolean is_active
    }
    
    Sale {
        int id PK
        string sale_number
        decimal total_amount
        enum sale_type
        enum payment_method
        int seller_id FK
        int branch_id FK
        datetime sale_date
        enum order_status
    }
    
    SaleItem {
        int id PK
        int sale_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
        string size
    }
    
    ProductSize {
        int id PK
        int product_id FK
        int branch_id FK
        string size
        int stock
        datetime updated_at
    }
    
    EcommerceConfig {
        int id PK
        string store_name
        string store_description
        string whatsapp_number
        boolean store_active
        datetime updated_at
    }
    
    StoreBanner {
        int id PK
        string title
        string description
        string image_url
        string link_url
        boolean active
        int display_order
    }
    
    User ||--o{ Sale : "seller_id"
    Branch ||--o{ User : "branch_id"
    Branch ||--o{ Sale : "branch_id"
    Category ||--o{ Product : "category_id"
    Product ||--o{ SaleItem : "product_id"
    Product ||--o{ ProductSize : "product_id"
    Sale ||--o{ SaleItem : "sale_id"
    Branch ||--o{ ProductSize : "branch_id"
```

## 8. Sistema de Roles y Permisos

```mermaid
graph TD
    A[UserRole Enum]
    A --> B[ADMIN<br/>Acceso completo]
    A --> C[MANAGER<br/>Gestión sucursal]
    A --> D[SELLER<br/>Solo POS]
    A --> E[ECOMMERCE<br/>Solo E-commerce]
    
    B --> B1[Users Management]
    B --> B2[All Branches]
    B --> B3[System Config]
    B --> B4[All Reports]
    
    C --> C1[Branch Users]
    C --> C2[Inventory Management]
    C --> C3[Sales Reports]
    C --> C4[Branch Config]
    
    D --> D1[POS Operations]
    D --> D2[Product Search]
    D --> D3[Process Sales]
    
    E --> E1[E-commerce Config]
    E --> E2[Online Orders]
    E --> E3[Store Management]
```

## 9. Integraciones Externas

```mermaid
graph LR
    subgraph "POS Cesariel System"
        A[Backend API]
        B[Product Images]
        C[WhatsApp Sales]
        D[Real-time Updates]
    end
    
    subgraph "Cloudinary Service"
        E[Image Upload]
        F[Image Optimization]
        G[CDN Delivery]
        H[Image Transformations]
    end
    
    subgraph "WhatsApp Business"
        I[Order Notifications]
        J[Customer Communication]
        K[Sales Coordination]
    end
    
    subgraph "WebSocket Connections"
        L[Stock Updates]
        M[Sales Notifications]
        N[Dashboard Updates]
        O[Low Stock Alerts]
    end
    
    A --> E
    B --> F
    F --> G
    G --> H
    
    A --> I
    C --> J
    J --> K
    
    A --> L
    D --> M
    M --> N
    N --> O
```

## 10. Deployment y Docker Compose Architecture

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Network: pos-cesariel-network"
            A[Frontend Container<br/>pos-cesariel-frontend<br/>:3000]
            B[E-commerce Container<br/>pos-cesariel-ecommerce<br/>:3001]
            C[Backend Container<br/>pos-cesariel-backend<br/>:8000]
            D[Database Container<br/>pos-cesariel-db<br/>PostgreSQL :5432]
            E[Adminer Container<br/>pos-cesariel-adminer<br/>:8080]
        end
        
        subgraph "Volumes"
            F[postgres_data<br/>Database Persistence]
            G[./backend → /app<br/>Backend Code]
            H[./frontend/pos-cesariel → /app<br/>Frontend Code]
            I[./ecommerce → /app<br/>E-commerce Code]
        end
    end
    
    subgraph "External Ports"
        J[localhost:3000<br/>POS Admin]
        K[localhost:3001<br/>E-commerce Store]
        L[localhost:8000<br/>API & Docs]
        M[localhost:5432<br/>Database Direct]
        N[localhost:8080<br/>Database Admin]
    end
    
    A --> J
    B --> K
    C --> L
    D --> M
    E --> N
    
    D -.-> F
    C -.-> G
    A -.-> H
    B -.-> I
```

## 11. Testing Architecture

```mermaid
graph TD
    subgraph "Backend Testing (Python)"
        A1[pytest<br/>Unit Tests]
        A2[Integration Tests]
        A3[API Endpoint Tests]
        A4[Database Tests]
        A5[Authentication Tests]
    end
    
    subgraph "POS Frontend Testing"
        B1[Jest<br/>Unit Tests]
        B2[React Testing Library<br/>Component Tests]
        B3[Cypress<br/>E2E Tests]
        B4[Lighthouse<br/>Performance Tests]
        B5[Artillery<br/>Load Tests]
    end
    
    subgraph "E-commerce Testing"
        C1[Jest<br/>Unit Tests]
        C2[Cypress<br/>E2E Tests]
        C3[Shopping Flow Tests]
        C4[Integration Tests]
    end
    
    subgraph "Test Data & Setup"
        D1[init_data.py<br/>Test Data Seeding]
        D2[Test Users<br/>admin/manager/seller]
        D3[Sample Products]
        D4[Mock Services]
    end
    
    A1 --> D1
    B3 --> D2
    C3 --> D3
    A2 --> D4
```

## Comandos de Desarrollo Principales

```bash
# Desarrollo
make dev                 # Iniciar todo el sistema
make logs-backend        # Ver logs del backend
make logs-frontend       # Ver logs POS admin
make logs-ecommerce      # Ver logs e-commerce

# Testing
pytest                   # Backend tests
npm test                 # Frontend unit tests
npm run test:e2e         # E2E tests
npm run test:lighthouse  # Performance tests

# Database
make shell-backend && python init_data.py  # Inicializar datos
make shell-db            # Acceso directo a PostgreSQL

# Acceso a servicios
http://localhost:3000    # POS Admin
http://localhost:3001    # E-commerce Store
http://localhost:8000/docs # API Documentation
http://localhost:8080    # Database Admin (Adminer)
```

---

Este mapa visual proporciona una comprensión completa del sistema POS Cesariel, desde la arquitectura de alto nivel hasta los detalles de implementación, flujos de datos, y estructura de deployment.