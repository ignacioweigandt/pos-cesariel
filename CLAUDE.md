# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

POS Cesariel is a complete point-of-sale system with a Next.js frontend, FastAPI backend, and PostgreSQL database. The entire stack runs in Docker containers for consistent development and deployment.

## Architecture

- **Frontend POS**: Next.js 15 with React 19 and TailwindCSS (port 3000)
- **Frontend E-commerce**: Next.js 15 with React 19, TailwindCSS, and Radix UI (port 3001)
- **Backend**: FastAPI with Python 3.9+ (port 8000)
- **Database**: PostgreSQL 15 (port 5432)
- **DB Admin**: Adminer (port 8080)

The project uses Docker Compose for orchestration with volume mounts for hot reloading during development.

### Key Backend Components
- **Models**: SQLAlchemy ORM models in `backend/models.py` with core entities: User, Branch, Product, Sale, Category, InventoryMovement, EcommerceConfig, PaymentConfig
- **Schemas**: Pydantic models in `backend/schemas.py` for API request/response validation
- **Routers**: Organized API endpoints in `backend/routers/` (auth, branches, users, categories, products, sales, websockets, config, content_management, ecommerce_advanced, ecommerce_public)
- **Services**: Business logic layer in `backend/services/` (auth_service.py)
- **Configuration**: Application settings and environment management in `backend/config/`
- **Exceptions**: Custom exception handling in `backend/exceptions/`
- **Utils**: Shared utilities and validators in `backend/utils/`
- **Authentication**: JWT-based auth with role-based access control (ADMIN, MANAGER, SELLER, ECOMMERCE)
- **WebSockets**: Real-time updates via WebSocket manager for inventory synchronization
- **Image Management**: Cloudinary integration for product images and store assets

### Key Frontend Components

#### POS Admin Frontend (`frontend/pos-cesariel/`)
- **State Management**: Zustand for global state with persistence middleware
- **API Client**: Axios with interceptors for authentication and error handling
- **Authentication**: JWT token stored in localStorage with automatic header injection
- **UI Framework**: Tailwind CSS with Headless UI components
- **Testing**: Jest + React Testing Library, Cypress E2E, Lighthouse performance

#### E-commerce Frontend (`ecommerce/`)
- **State Management**: React Context for cart and customer data
- **API Client**: Centralized API service layer in `ecommerce/services/` with 10s timeout and fallback data
- **UI Framework**: Tailwind CSS with shadcn/ui and Radix UI components
- **Architecture**: App Router with TypeScript, data service layer with caching
- **Integration**: Connects to POS backend, creates sales in POS system

## Development Commands

### Primary Development Workflow
```bash
# Start entire development environment
make dev

# View all available commands
make help

# Stop all services
make down

# Partial development environments
make dev-pos             # POS Admin + backend + database only
make dev-ecommerce       # E-commerce + backend + database only

# View logs
make logs                # All services
make logs-backend        # Backend only
make logs-frontend       # POS frontend only
make logs-ecommerce      # E-commerce frontend only
make logs-db             # Database only

# Access shells
make shell-backend       # Backend container bash
make shell-frontend      # POS frontend container shell
make shell-ecommerce     # E-commerce frontend container shell
make shell-db            # PostgreSQL shell

# System management
make status              # View service status
make clean               # Clean containers, images and volumes
make clean-volumes       # Clean volumes only

# Alternative commands
make up                  # Start all services (alias for make dev)
make up-build            # Build and start all services
make restart             # Restart all services
make build               # Build all images without starting
```

### POS Frontend (Next.js)
```bash
# Inside POS frontend container or locally
npm run dev              # Development server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run linting

# Testing
npm test                 # Run all tests (Jest + RTL)
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:e2e         # Cypress E2E tests
npm run test:lighthouse  # Performance audit
npm run test:load        # Load testing
```

### E-commerce Frontend (Next.js)
```bash
# Inside e-commerce container or locally
npm run dev              # Development server (port 3001)
npm run build            # Production build
npm run start            # Start production server (port 3001)
npm run lint             # Run linting

# Testing
npm test                 # Run all tests (Jest + RTL)
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:e2e         # Cypress E2E tests
```

### Backend (FastAPI)
```bash
# Inside backend container
python main.py           # Start FastAPI server
# Auto-reload enabled in development

# Run tests
pytest                   # Run all tests
pytest -v               # Verbose output
pytest -x               # Stop on first failure
pytest -m unit          # Unit tests only
pytest --cov=.          # With coverage report
```

### Database Access
```bash
# Direct PostgreSQL access
make shell-db
# Or via connection string
psql -h localhost -p 5432 -U postgres -d pos_cesariel
```

### Initial Setup
```bash
# Automated setup (recommended)
./setup.sh                   # Handles full system setup, data initialization, and dependency installation

# System health verification
./check_system.sh            # Complete system status check - use when troubleshooting issues

# Manual setup (if automated setup fails)
make dev
make shell-backend
python init_data.py          # Creates test users and sample data
python init_content_data.py  # Creates default content and configurations (if available)
```

## Key Configuration

### Database Connection
- Host: `localhost` (from host) / `db` (from containers)
- Port: 5432
- Database: `pos_cesariel`
- User: `postgres`
- Password: `password`

### Environment Variables
- **Backend**: `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **POS Frontend**: `NEXT_PUBLIC_API_URL`, `WATCHPACK_POLLING`, `CHOKIDAR_USEPOLLING`
- **E-commerce Frontend**: `NEXT_PUBLIC_API_URL` (http://localhost:8000), `PORT` (3001)

### Test Users (created by init_data.py)
- Admin: `admin` / `admin123` (full system access)
- Manager: `manager` / `manager123` (branch management, inventory, reports)
- Seller: `seller` / `seller123` (POS operations only)

## Data Architecture

### Core Entities
- **Branch**: Multi-location support with users and sales tied to branches
- **User**: Role-based access (ADMIN, MANAGER, SELLER, ECOMMERCE) with branch assignment
- **Product**: Inventory items with SKU, barcode, stock tracking, and e-commerce visibility
- **Category**: Product organization with hierarchical structure
- **Sale**: Transactions with line items, supporting both POS and e-commerce channels
- **InventoryMovement**: Audit trail for all stock changes

### Business Rules
- Stock validation occurs before sales completion
- All sales operations are transactional to maintain data integrity
- E-commerce and POS share the same inventory pool
- User permissions are enforced at the API level based on roles and branch assignments

## API Structure

### Key Endpoints
- **Authentication**: `/auth/login`, `/auth/login-json` (JWT-based)
- **Products**: `/products` (CRUD), `/products/search`, `/products/barcode/{barcode}`, `/products/import` (CSV/Excel), `/products/{id}/available-sizes`
- **Sales**: `/sales` (CRUD), `/sales/reports/dashboard`
- **Users**: `/users` (CRUD), `/users/me` (current user)
- **Branches**: `/branches` (CRUD)
- **Categories**: `/categories` (CRUD)
- **Configuration**: `/config` (system, e-commerce, payment, tax rates, printers, notifications)
- **Content Management**: `/content` (banners, store content)
- **E-commerce Public**: `/ecommerce` (public product catalog, checkout)
- **E-commerce Advanced**: `/ecommerce-advanced` (admin features)
- **WebSockets**: `/ws` (real-time updates)
- **Health**: `/health`, `/db-test` (health checks)

### Error Handling
- Backend uses FastAPI exception handlers
- Frontend Axios interceptors handle auth errors and token refresh
- All API responses follow consistent schema structure

## Development Practices

### Code Organization
- Backend follows FastAPI best practices with layered architecture: models, schemas, routers, services, utils, config, exceptions
- Frontend uses TypeScript with strict typing
- State management via Zustand with persistence for auth and app state
- API clients centralized in `frontend/pos-cesariel/lib/api.ts` and `ecommerce/services/`

### Authentication Flow
1. User logs in via `/auth/login` endpoint
2. JWT token stored in localStorage and Zustand state
3. Token automatically added to requests via Axios interceptor
4. Backend validates token on protected routes using dependency injection

## Testing and Quality

### Testing Framework
- **Backend**: pytest with pytest-asyncio, pytest-mock, pytest-cov
- **Test Structure**: Unit tests in `backend/tests/unit/`, integration tests in `backend/tests/integration/`
- **Test Configuration**: `backend/pytest.ini` with coverage reporting and markers
- **Coverage Requirements**: 80% minimum for backend
- **Test Markers**: `unit`, `integration`, `auth`, `websocket`, `slow`

### Running Tests
```bash
# Backend tests (inside backend container)
make shell-backend
pytest                   # Run all tests
pytest -v               # Verbose output
pytest -x               # Stop on first failure
pytest --tb=short       # Short traceback format

# Test by category
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m auth          # Authentication tests
pytest -m websocket     # WebSocket tests
pytest -m slow          # Slow running tests

# Coverage reporting
pytest --cov=.          # With coverage report
pytest --cov=. --cov-report=html:htmlcov  # HTML coverage report

# Specific test files
pytest tests/unit/test_auth.py              # Auth unit tests
pytest tests/integration/test_products_api.py  # Product API tests
```

### Frontend Testing (POS Admin)
```bash
# Unit/Integration tests (Jest + React Testing Library)
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage (70% threshold)

# End-to-end tests (Cypress)
npm run cypress:open     # Interactive mode
npm run test:e2e         # Headless mode
npm run test:e2e:headed  # Headed mode

# Performance tests (Lighthouse)
npm run test:lighthouse  # Performance audit
npm run test:performance # Alias for lighthouse

# Load tests (Artillery)
npm run test:load        # Load testing with artillery.yml
```

### E-commerce Frontend Testing
```bash
# Inside e-commerce container or locally
npm test                 # Run all tests (Jest + React Testing Library)
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage reporting

# End-to-end tests (Cypress)
npm run test:e2e         # Headless mode
npm run test:e2e:open    # Interactive mode
```

### Test Configuration Notes
- Backend tests use fixtures for database sessions and test data
- Frontend tests mock API calls using axios-mock-adapter
- E2E tests use test users created by `init_data.py`
- See `TESTING.md` for comprehensive testing documentation

## Important Notes

- Hot reloading is enabled for both frontend and backend via volume mounts
- PostgreSQL data persists in a Docker volume
- API documentation is available at http://localhost:8000/docs
- The backend includes basic health check endpoints at `/health` and `/db-test`
- CORS is configured for development allowing all origins
- WebSocket connection manages real-time inventory updates across POS and e-commerce

## E-commerce Integration

### Dual Frontend Architecture
The system operates with two separate Next.js frontends:
- **POS Admin** (port 3000): Staff interface for inventory, sales, users, and administration
- **E-commerce** (port 3001): Customer-facing online store integrated with POS inventory

### Shared Backend Integration
Both frontends connect to the same FastAPI backend:
- Products with `show_in_ecommerce = true` appear in e-commerce
- E-commerce sales are created with `sale_type: 'ECOMMERCE'` in POS system
- Real-time stock validation prevents overselling
- WebSocket updates synchronize inventory changes

### E-commerce Specific Features
- **Data Service Layer**: 5-minute caching with fallback to static data (`app/lib/data-service.ts`)
- **Size Management**: Products can have size variants with individual stock tracking via `/products/{id}/available-sizes`
- **Cart Integration**: Real-time stock validation through `validateStock()` function before adding items
- **Checkout Flow**: Creates sales in POS system with `sale_type: 'ECOMMERCE'` via `/sales` endpoint
- **Connection Status**: Visual indicator of backend connectivity with automatic fallback to static data
- **WhatsApp Integration**: Order coordination through WhatsApp for customer communication

### Development Workflow for E-commerce
1. Start full environment: `make dev` (includes both frontends)
2. POS Admin available at http://localhost:3000
3. E-commerce available at http://localhost:3001
4. Both share backend at http://localhost:8000
5. Configure products in POS Admin, enable for e-commerce
6. Test customer flow in e-commerce frontend

## Configuration Management

The system includes comprehensive configuration management accessible through the POS Admin interface and API:

### Available Configurations
- **E-commerce Settings**: Store name, description, logo, tax rates, currency
- **Payment Methods**: Configurable payment types with surcharge rules
- **System Settings**: Application features, session timeouts, upload limits
- **Tax Rates**: Multiple tax rate configurations with default settings
- **Printer Configuration**: Thermal printer setup for receipts
- **Notification Settings**: Email, alerts, and reporting configuration
- **Backup Settings**: Automated backup configuration and scheduling

### Image Management
- **Cloudinary Integration**: Automatic image optimization and CDN delivery
- **Supported Formats**: JPG, PNG, GIF, WebP with automatic format optimization
- **Upload Limits**: 5MB maximum file size with validation
- **Storage Organization**: Organized folder structure (products/, store-logo/, banners/)

## Additional Documentation

For comprehensive information, refer to:
- `TESTING.md` - Complete testing guide and best practices
- `ARQUITECTURA.md` - Detailed system architecture documentation
- `TODOLIST.md` - Current development tasks and roadmap
- `README.md` - General project overview and setup instructions
- `ecommerce/CLAUDE.md` - E-commerce frontend specific guidance
- `ECOMMERCE_FRONTEND_SPECS.md` - Detailed e-commerce frontend specifications
- `INTEGRATION.md`, `INTEGRATION_STATUS.md` - Integration status and troubleshooting
- `docs/` directory - Comprehensive project documentation including:
  - `docs/arquitectura/` - Detailed architecture documentation for each component
  - `docs/metricas/` - Project statistics and metrics
  - `docs/presentacion/` - Executive summary and demonstration guide

## Project Structure

```
pos-cesariel/
├── backend/                     # FastAPI application
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic validation schemas
│   ├── database.py             # Database configuration
│   ├── auth.py                 # Authentication utilities
│   ├── websocket_manager.py    # WebSocket real-time updates
│   ├── init_data.py            # Test data initialization
│   ├── config/                 # Application configuration
│   │   ├── __init__.py
│   │   └── settings.py        # Environment and app settings
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   └── auth_service.py    # Authentication business logic
│   ├── exceptions/             # Custom exception handling
│   │   ├── __init__.py
│   │   └── custom_exceptions.py
│   ├── utils/                  # Shared utilities
│   │   ├── __init__.py
│   │   ├── helpers.py         # General helper functions
│   │   └── validators.py      # Data validation utilities
│   ├── routers/                # API endpoint routers
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── products.py        # Product CRUD + import
│   │   ├── sales.py           # Sales and reporting
│   │   ├── users.py           # User management
│   │   ├── branches.py        # Multi-branch support
│   │   ├── categories.py      # Product categorization
│   │   ├── websockets.py      # WebSocket connections
│   │   ├── ecommerce_*.py     # E-commerce specific endpoints
│   │   └── content_management.py # CMS functionality
│   ├── tests/                  # Comprehensive test suite
│   │   ├── unit/              # Unit tests
│   │   ├── integration/       # Integration tests
│   │   └── conftest.py        # Test fixtures
│   ├── pytest.ini             # Test configuration
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
├── frontend/                    # POS Admin Interface
│   ├── pos-cesariel/           # Actual Next.js app
│   │   ├── app/               # App router structure
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── pos/          # Point of sale interface
│   │   │   ├── inventory/    # Inventory management
│   │   │   ├── users/        # User administration
│   │   │   ├── reports/      # Sales reporting
│   │   │   └── settings/     # System configuration
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/              # API client and utilities
│   │   ├── __tests__/        # Jest + RTL tests
│   │   ├── cypress/          # E2E tests
│   │   ├── package.json
│   │   └── TESTING.md
│   └── Dockerfile
├── ecommerce/                   # Customer E-commerce Frontend
│   ├── app/                    # Next.js app directory
│   │   ├── components/        # E-commerce UI components
│   │   ├── context/          # React Context for state
│   │   ├── lib/              # API integration + data service
│   │   ├── productos/        # Product catalog pages
│   │   └── carrito/          # Shopping cart
│   ├── components/ui/         # shadcn/ui components
│   ├── services/              # Centralized API service layer
│   │   ├── api-service.ts    # API client and data service
│   │   └── index.ts          # Service exports
│   ├── package.json
│   ├── CLAUDE.md             # E-commerce specific guidance
│   └── Dockerfile
├── docs/                        # Comprehensive project documentation
│   ├── arquitectura/           # Architecture documentation
│   │   ├── CODIGO_BACKEND.md  # Backend code architecture
│   │   ├── CODIGO_FRONTEND_ECOMMERCE.md # E-commerce frontend
│   │   ├── CODIGO_FRONTEND_POS.md # POS frontend architecture
│   │   └── FLUJOS_DE_TRABAJO.md # Workflow documentation
│   ├── casos-de-uso/           # Use case documentation
│   ├── diagramas/              # System diagrams
│   ├── manual-usuario/         # User manual
│   ├── metricas/               # Project metrics
│   │   └── ESTADISTICAS_PROYECTO.md # Project statistics
│   └── presentacion/          # Presentation materials
│       ├── GUION_DEMOSTRACION.md # Demo script
│       └── RESUMEN_EJECUTIVO_TESIS.md # Executive summary
├── docker-compose.yml           # Multi-service orchestration
├── Makefile                    # Development commands
├── setup.sh                    # Automated setup script
├── CLAUDE.md                   # This file
├── TESTING.md                  # Comprehensive testing guide
├── ARQUITECTURA.md             # Detailed architecture docs
└── README.md                   # Project overview
```