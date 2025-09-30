# POS Cesariel - Sistema Completo

## 🏗️ Arquitectura Principal

### Frontend Applications
- **POS Admin Frontend**
  - Next.js 15 + React 19
  - Puerto: 3000
  - TailwindCSS + Headless UI
  - Zustand (State Management)
  - React Query (API Caching)
- **E-commerce Store**
  - Next.js 15 + React 19
  - Puerto: 3001
  - TailwindCSS + Radix UI
  - React Context (Cart/Customer)
  - Custom Data Service

### Backend API
- **FastAPI Framework**
  - Puerto: 8000
  - Python 3.9+
  - JWT Authentication
  - Role-based Access Control
- **11 Router Modules**
  - auth.py (Authentication)
  - users.py (User Management)
  - branches.py (Multi-branch)
  - products.py (Inventory)
  - sales.py (Sales & Reports)
  - categories.py (Product Categories)
  - config.py (System Configuration)
  - ecommerce_advanced.py (Admin E-commerce)
  - ecommerce_public.py (Public Store API)
  - content_management.py (CMS & Banners)
  - websockets.py (Real-time Updates)

### Database Layer
- **PostgreSQL 15**
  - Puerto: 5432
  - SQLAlchemy ORM
  - Automated Migrations
- **Core Models**
  - User (Admin/Manager/Seller/Ecommerce)
  - Branch (Multi-location)
  - Product (Inventory + Variants)
  - Category (Product Organization)
  - Sale (POS + E-commerce)
  - SaleItem (Line Items)
  - ProductSize (Size-based Stock)
  - EcommerceConfig (Store Settings)

### External Integrations
- **Cloudinary**
  - Image Upload & Optimization
  - CDN Delivery
  - Dynamic Transformations
- **WhatsApp Business API**
  - Order Notifications
  - Customer Communication
  - Sales Coordination
- **WebSocket Manager**
  - Real-time Stock Updates
  - Sales Notifications
  - Dashboard Updates
  - Low Stock Alerts

## 🎯 Funcionalidades Principales

### Sistema Multi-sucursal
- **Gestión de Sucursales**
  - Creación y configuración
  - Usuarios por sucursal
  - Stock por ubicación
- **Control de Acceso**
  - Roles diferenciados
  - Permisos granulares
  - Autenticación JWT

### Inventario Centralizado
- **Productos**
  - Código de barras
  - Categorización
  - Imágenes (Cloudinary)
  - Variantes (talles/colores)
- **Stock Management**
  - Stock por sucursal
  - Movimientos de inventario
  - Alertas de stock bajo
  - Importación masiva (CSV/Excel)
- **Sincronización**
  - POS ↔ E-commerce
  - Tiempo real
  - Validación de stock

### Sistema de Ventas
- **POS Physical**
  - Interface táctil
  - Búsqueda rápida
  - Múltiples métodos de pago
  - Carrito interactivo
- **E-commerce Online**
  - Catálogo público
  - Carrito de compras
  - Checkout integrado
  - Órdenes → POS system
- **Reporting**
  - Dashboard en tiempo real
  - Reportes por período
  - Productos más vendidos
  - Análisis por sucursal

## 📱 POS Admin Frontend

### Páginas Principales
- **Dashboard**
  - Métricas en tiempo real
  - Ventas del día/mes
  - Stock alerts
  - Acciones rápidas
- **POS System**
  - Interface de ventas
  - Búsqueda de productos
  - Carrito de compras
  - Procesamiento de pagos
- **Inventory Management**
  - CRUD de productos
  - Gestión de categorías
  - Control de stock
  - Importación masiva
- **Reports & Analytics**
  - Dashboard de métricas
  - Reportes personalizables
  - Gráficos interactivos
  - Exportación de datos
- **User Management**
  - CRUD usuarios
  - Asignación de roles
  - Gestión de sucursales
  - Control de permisos
- **System Settings**
  - Configuración general
  - Métodos de pago
  - Configuración e-commerce
  - Redes sociales
  - Banners de tienda

### Componentes Clave
- **Layout System**
  - Navigation sidebar
  - Header with user info
  - Responsive design
- **Modals & Forms**
  - ImportModal (CSV/Excel)
  - SizeStockModal (Inventory)
  - User forms with validation
- **Data Visualization**
  - Charts (Recharts)
  - Real-time updates
  - Interactive dashboards

## 🛍️ E-commerce Frontend

### Páginas Públicas
- **Homepage**
  - Hero banners
  - Featured products
  - Categories showcase
  - Store information
- **Product Catalog**
  - Product grid/list
  - Category filtering
  - Search functionality
  - Pagination
- **Product Details**
  - Image gallery
  - Size/color selection
  - Stock validation
  - Add to cart
- **Shopping Cart**
  - Cart items management
  - Quantity updates
  - Stock validation
  - Checkout process
- **Customer Pages**
  - About us
  - Contact information
  - Store policies

### Context & State Management
- **EcommerceContext**
  - Store configuration
  - Product catalog
  - API integration
- **CartContext**
  - Shopping cart state
  - Customer information
  - Checkout process
- **API Integration**
  - Real-time stock checks
  - Order creation
  - POS system sync

## 🗄️ Database Schema

### User Management
- **User Model**
  - id, username, email
  - password_hash, role
  - branch_id (FK)
  - created_at, is_active
- **Branch Model**
  - id, name, address
  - phone, email
  - is_active, created_at
- **Roles**
  - ADMIN (Full access)
  - MANAGER (Branch management)
  - SELLER (POS only)
  - ECOMMERCE (Online store)

### Product Management
- **Product Model**
  - id, name, code, barcode
  - price, stock, category_id
  - show_in_ecommerce
  - created_at, updated_at
- **Category Model**
  - id, name, description
  - is_active, created_at
- **ProductSize Model**
  - id, product_id, branch_id
  - size, stock
  - updated_at

### Sales System
- **Sale Model**
  - id, sale_number
  - total_amount, sale_type
  - payment_method
  - seller_id, branch_id
  - sale_date, order_status
- **SaleItem Model**
  - id, sale_id, product_id
  - quantity, unit_price
  - subtotal, size

### E-commerce Configuration
- **EcommerceConfig Model**
  - store_name, description
  - whatsapp_number
  - store_active
- **StoreBanner Model**
  - title, description
  - image_url, link_url
  - active, display_order

## 🔄 Flujos de Datos

### Venta POS
1. **Búsqueda de Productos**
   - Usuario → POS Frontend
   - API: GET /products
   - Database query with stock
   - Response with available products
2. **Agregar al Carrito**
   - Stock validation
   - Real-time availability check
   - Cart state update
3. **Procesar Venta**
   - API: POST /sales
   - Database transaction
   - Stock update
   - Inventory movement record
   - WebSocket notification
   - E-commerce sync

### Compra E-commerce
1. **Catálogo de Productos**
   - Cliente → E-commerce Store
   - API: GET /ecommerce/products
   - Filter: show_in_ecommerce=true
   - Product display with stock
2. **Agregar al Carrito**
   - Stock validation API call
   - Cart context update
   - Size/color selection
3. **Checkout Process**
   - Customer information
   - API: POST /sales (type=ECOMMERCE)
   - POS system integration
   - WhatsApp notification
   - Order confirmation

## 🚀 Deployment & DevOps

### Docker Compose Architecture
- **Services**
  - frontend (POS Admin :3000)
  - ecommerce (Store :3001)
  - backend (FastAPI :8000)
  - db (PostgreSQL :5432)
  - adminer (DB Admin :8080)
- **Networks**
  - pos-cesariel-network (bridge)
- **Volumes**
  - postgres_data (persistence)
  - Code volumes for development

### Development Commands
- **Primary Commands**
  - `make dev` (Start all services)
  - `make down` (Stop all services)
  - `make logs-*` (Service logs)
  - `make shell-*` (Container access)
- **Database Setup**
  - `python init_data.py` (Seed data)
  - Test users: admin/manager/seller
- **Service URLs**
  - POS Admin: localhost:3000
  - E-commerce: localhost:3001
  - API Docs: localhost:8000/docs
  - DB Admin: localhost:8080

## 🧪 Testing Strategy

### Backend Testing (Python)
- **pytest Framework**
  - Unit tests
  - Integration tests
  - API endpoint tests
  - Database tests
  - Authentication tests
- **Coverage**
  - 80%+ code coverage
  - HTML reports
  - CI/CD integration

### Frontend Testing
- **POS Admin**
  - Jest (Unit tests)
  - React Testing Library
  - Cypress (E2E tests)
  - Lighthouse (Performance)
  - Artillery (Load tests)
- **E-commerce**
  - Jest (Unit tests)
  - Cypress (E2E tests)
  - Shopping flow tests
  - Integration tests

### Test Data
- **Automated Seeding**
  - init_data.py script
  - Sample products/categories
  - Test users with roles
  - Realistic data volumes

## 🔧 Technical Stack Summary

### Languages & Frameworks
- **Backend**: Python 3.9+ (FastAPI, SQLAlchemy, Pydantic)
- **Frontend**: TypeScript (Next.js 15, React 19)
- **Database**: PostgreSQL 15
- **Styling**: TailwindCSS
- **Testing**: pytest, Jest, Cypress

### Key Libraries
- **Backend**
  - fastapi, uvicorn, sqlalchemy
  - python-jose (JWT)
  - passlib (Password hashing)
  - cloudinary (Image management)
  - pandas (Data processing)
- **Frontend**
  - axios (HTTP client)
  - react-query (Caching)
  - zustand (State management)
  - recharts (Data visualization)
  - react-hook-form (Forms)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Development**: Hot reload, live updates
- **Production**: Nginx, SSL, monitoring
- **CI/CD**: Automated testing, deployment