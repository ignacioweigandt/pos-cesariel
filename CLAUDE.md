# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

POS Cesariel is a comprehensive multi-branch point-of-sale system with integrated e-commerce. The system consists of:

- **Backend**: FastAPI (Python 3.9+) with PostgreSQL, running on port 8000
- **POS Admin Frontend**: Next.js 15 with React 19, running on port 3000
- **E-commerce Frontend**: Next.js 15 with React 19, running on port 3001
- **Database**: PostgreSQL 15 with SQLAlchemy ORM
- **Infrastructure**: Docker Compose for development and deployment

## Architecture

### Multi-Application Structure
- `backend/` - FastAPI REST API with JWT authentication
- `frontend/pos-cesariel/` - Administrative POS interface
- `ecommerce/` - Public-facing online store
- `docker-compose.yml` - Orchestrates all services

### Key Features
- Multi-branch management with role-based access control
- Shared inventory between POS and e-commerce
- Real-time stock synchronization
- WhatsApp integration for order management
- Cloudinary integration for product images
- Comprehensive testing setup across all applications

## Development Commands

### Primary Commands (via Makefile)
```bash
make dev                 # Start all services in development mode
make dev-pos            # Start only POS Admin and dependencies (db, backend, frontend)
make dev-ecommerce      # Start only E-commerce and dependencies (db, backend, ecommerce)
make down               # Stop all services
make restart            # Restart all services
make clean              # Clean containers and volumes
make clean-volumes      # Clean only volumes (preserve images)

# Individual service logs
make logs-backend       # Backend FastAPI logs
make logs-frontend      # POS Admin logs
make logs-ecommerce     # E-commerce frontend logs
make logs-db           # PostgreSQL logs

# Shell access
make shell-backend      # Access backend container
make shell-frontend     # Access POS frontend container
make shell-ecommerce    # Access e-commerce container
make shell-db          # PostgreSQL shell
```

### Service-Specific Commands

#### Backend (FastAPI)
```bash
# Testing (run inside backend container via `make shell-backend`)
pytest                  # Run all tests with coverage
pytest tests/unit/      # Unit tests only
pytest tests/integration/ # Integration tests only
pytest -v               # Verbose output
pytest -k "test_name"   # Run specific test by name
pytest -m unit          # Run only tests marked as @pytest.mark.unit
pytest -m integration   # Run only tests marked as @pytest.mark.integration
pytest -m auth          # Run authentication tests
pytest -m "not slow"    # Skip slow tests
pytest --cov=. --cov-report=html  # Generate HTML coverage report

# Database initialization
python init_data.py     # Create initial data (users, branches, products)
python init_content_data.py  # Initialize e-commerce content (banners, config)
python init_sportswear_data.py  # Load sportswear product catalog

# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### POS Admin Frontend
```bash
npm run dev            # Development server
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Jest unit tests
npm run test:coverage  # Jest with coverage
npm run cypress:open   # E2E tests (interactive)
npm run test:e2e       # E2E tests (headless)
npm run test:lighthouse # Performance testing
npm run test:load      # Artillery load testing
```

#### E-commerce Frontend
```bash
npm run dev            # Development server (port 3001)
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Jest unit tests
npm run test:watch     # Jest in watch mode
npm run test:coverage  # Jest with coverage
npm run test:e2e       # Cypress E2E tests (headless)
npm run test:e2e:open  # Cypress E2E tests (interactive)
```

## System Architecture

### Backend Structure (FastAPI)

**Modern Layered Architecture** (Phases 1 & 2 completed October 2025):

```
backend/
├── app/                          # Main application package (refactored structure)
│   ├── models/                   # SQLAlchemy models (split by domain) ✅ Phase 1 Complete
│   │   ├── __init__.py          # Re-exports all models (backward compatibility)
│   │   ├── base.py              # Base model classes
│   │   ├── enums.py             # Enums (UserRole, SaleType, OrderStatus)
│   │   ├── user.py              # User, Branch models
│   │   ├── product.py           # Product, Category models
│   │   ├── inventory.py         # BranchStock, ProductSize, InventoryMovement, ImportLog
│   │   ├── sales.py             # Sale, SaleItem
│   │   ├── ecommerce.py         # EcommerceConfig, StoreBanner, ProductImage
│   │   ├── payment.py           # PaymentConfig (legacy)
│   │   ├── payment_method.py    # PaymentMethod (new configuration system)
│   │   ├── system_config.py     # SystemConfig (centralized system configuration)
│   │   ├── tax_rate.py          # TaxRate (tax configuration)
│   │   ├── notification.py      # Notification (notification system)
│   │   └── whatsapp.py          # WhatsAppConfig, WhatsAppSale, SocialMediaConfig
│   │
│   ├── schemas/                 # Pydantic schemas (split by domain) ✅ Phase 1 Complete
│   │   ├── __init__.py          # Re-exports all schemas (backward compatibility)
│   │   ├── common.py            # Common enums and types
│   │   ├── auth.py              # Token, UserLogin schemas
│   │   ├── user.py              # User schemas
│   │   ├── branch.py            # Branch schemas
│   │   ├── category.py          # Category schemas
│   │   ├── product.py           # Product, ProductSize, ProductImage schemas
│   │   ├── inventory.py         # BranchStock, InventoryMovement, StockAdjustment
│   │   ├── sale.py              # Sale, SaleItem schemas
│   │   ├── ecommerce.py         # E-commerce config and banners
│   │   ├── payment.py           # Payment configuration (legacy)
│   │   ├── payment_method.py    # Payment method schemas (new)
│   │   ├── system_config.py     # System configuration schemas
│   │   ├── tax_rate.py          # Tax rate schemas
│   │   ├── notification.py      # Notification schemas
│   │   ├── whatsapp.py          # WhatsApp integration
│   │   └── dashboard.py         # Dashboard/reporting schemas
│   │
│   ├── repositories/            # Data access layer (repository pattern) ✅ Phase 2 Complete
│   │   ├── __init__.py          # Re-exports all repositories
│   │   ├── base.py              # BaseRepository with generic CRUD
│   │   ├── user.py              # UserRepository, BranchRepository
│   │   ├── product.py           # ProductRepository, CategoryRepository
│   │   ├── inventory.py         # BranchStockRepository, ProductSizeRepository, InventoryMovementRepository
│   │   ├── sale.py              # SaleRepository, SaleItemRepository
│   │   ├── ecommerce.py         # EcommerceConfigRepository, StoreBannerRepository, ProductImageRepository
│   │   ├── payment.py           # PaymentConfigRepository
│   │   ├── notification.py      # NotificationRepository
│   │   └── whatsapp.py          # WhatsAppConfigRepository, WhatsAppSaleRepository
│   │
│   ├── services/                # Business logic layer ✅ Phase 3 Complete
│   │   ├── __init__.py          # Re-exports all services
│   │   ├── inventory_service.py # Inventory and stock management (185 lines)
│   │   ├── product_service.py   # Product operations (100 lines)
│   │   ├── sale_service.py      # Sales processing (130 lines)
│   │   ├── user_service.py      # User management (80 lines)
│   │   ├── payment_service.py   # Payment processing and configuration
│   │   └── notification_service.py # Notification system
│   │
│   └── core/                    # Core configuration (future)
│
├── routers/                     # API route handlers (migration in progress)
│   ├── auth.py                  # Authentication endpoints
│   ├── users.py                 # User management
│   ├── branches.py              # Branch management
│   ├── categories.py            # Category management (migrated to repositories)
│   ├── products.py              # Product management (being migrated)
│   ├── sales.py                 # Sales endpoints (being migrated)
│   ├── ecommerce_public.py      # Public e-commerce API (being migrated)
│   ├── ecommerce_advanced.py    # Admin e-commerce endpoints
│   ├── config.py                # System configuration
│   ├── content_management.py    # Content management
│   ├── notifications.py         # Notification endpoints
│   └── websockets.py            # WebSocket connections
│
├── models.py                    # LEGACY - imports from app.models for compatibility
├── schemas.py                   # LEGACY - imports from app.schemas for compatibility
├── database.py                  # DB configuration and session management
├── auth.py                      # Authentication utilities (legacy)
├── auth_compat.py               # Authentication compatibility layer
├── services/                    # LEGACY - old auth_service.py (use app.services)
├── websocket_manager.py         # WebSocket connection manager
├── cloudinary_config.py         # Cloudinary integration
│
├── migrate_*.py                 # Database migration scripts
│   ├── migrate_notifications.py
│   ├── migrate_payment_methods.py
│   ├── migrate_system_config.py
│   ├── migrate_tax_rates.py
│   └── migrate_add_brand.py
│
└── notification_scheduler.py    # Background notification scheduler
```

**Key Architecture Layers**:
1. **Models** (`app/models/`) - Database schema and relationships
2. **Schemas** (`app/schemas/`) - Request/response validation
3. **Repositories** (`app/repositories/`) - Data access abstraction (✅ Phase 2 Complete)
4. **Services** (`app/services/`) - Business logic (✅ Phase 3 Complete)
5. **Routers** (`routers/`) - HTTP endpoints (delegates to services)

**Repository Pattern Benefits**:
- ✅ **Abstraction**: Routers don't need SQLAlchemy knowledge
- ✅ **Testability**: Easy to mock repositories in unit tests
- ✅ **Reusability**: Same repository methods across multiple endpoints
- ✅ **Maintainability**: Centralized data access logic
- ✅ **Type Safety**: Generic typing with `BaseRepository[ModelType]`
- ✅ **15 Repositories**: All domains covered (User, Product, Inventory, Sales, etc.)

**Available Repositories**:
```python
from app.repositories import (
    UserRepository, BranchRepository,           # User domain
    ProductRepository, CategoryRepository,       # Product domain
    BranchStockRepository, ProductSizeRepository, InventoryMovementRepository,  # Inventory
    SaleRepository, SaleItemRepository,         # Sales
    EcommerceConfigRepository, StoreBannerRepository, ProductImageRepository,  # E-commerce
    PaymentConfigRepository,                     # Payment
    NotificationRepository,                      # Notifications
    WhatsAppConfigRepository, WhatsAppSaleRepository  # WhatsApp
)
```

**Available Services** (✅ Phase 3 Complete):
```python
from app.services import (
    InventoryService,      # Stock management, stock validation, inventory movements
    ProductService,        # Product CRUD, search, low-stock alerts, e-commerce filtering
    SaleService,          # Complete sales flow, stock updates, tax calculation
    UserService,          # User management, authentication support
    PaymentService,       # Payment processing and configuration
    NotificationService   # Notification scheduling and management
)
```

**Service Layer Capabilities**:
- **InventoryService**: Stock validation, multi-branch stock queries, size-specific stock, inventory movements
- **ProductService**: SKU/barcode uniqueness validation, low-stock detection, e-commerce product filtering
- **SaleService**: Complete sale creation with stock validation, automatic inventory updates, tax/discount calculation
- **UserService**: Username/email uniqueness validation, branch-specific user queries, active user filtering
- **PaymentService**: Payment method configuration, transaction processing
- **NotificationService**: Notification scheduling, stock alerts, payment reminders

### Architectural Evolution

The backend has evolved through 3 major refactoring phases:

**Phase 0 (Original)**: `Routers → Models (with business logic) → Database`
- All logic mixed in routers and models
- Hard to test and maintain

**Phase 1 (Models/Schemas Split)**: `Routers → Models (organized) → Database`
- Models split by domain (user, product, inventory, sales, etc.)
- Schemas organized separately for validation
- Result: 9 model files, 13 schema files

**Phase 2 (Repository Layer)**: `Routers → Repositories → Models → Database`
- Data access abstracted into repositories
- 15 repositories with generic CRUD operations
- Result: Testable data layer, no SQLAlchemy in routers

**Phase 3 (Service Layer)**: `Routers → Services → Repositories → Models → Database` ✅ **CURRENT**
- Business logic extracted to services
- Services orchestrate multiple repositories
- 6 services with 513 lines of business logic
- Result: Thin routers, testable business logic, clear separation of concerns

### User Roles and Permissions
- **ADMIN**: Full system access, user management, multi-branch control
- **MANAGER**: Branch-level management, inventory, reports
- **SELLER**: POS operations only
- **ECOMMERCE**: E-commerce management and online sales

### Frontend Architecture

#### POS Admin (`frontend/pos-cesariel/`)
- **Framework**: Next.js 15 with App Router
- **UI**: TailwindCSS with Headless UI components
- **State**: Zustand for global state management
- **API**: Axios client with React Query for caching
- **Testing**: Jest + React Testing Library + Cypress
- **Key Features**: Real-time dashboard, POS interface, inventory management, reporting

#### E-commerce (`ecommerce/`)
- **Framework**: Next.js 15 with App Router
- **UI**: TailwindCSS with Radix UI (shadcn/ui)
- **State**: React Context for cart and customer management
- **API**: Custom data service layer with caching
- **Testing**: Jest + React Testing Library + Cypress
- **Key Features**: Product catalog, shopping cart, checkout with POS integration

### Database Schema

Key entities and relationships:
- `users` → `branches` (many-to-one)
- `products` → `categories` (many-to-one)
- `products` → `product_sizes` (one-to-many)
- `sales` → `sale_items` (one-to-many)
- `sales` → `users` (seller relationship)

**Model Organization**:
- User domain: `app/models/user.py` - User, Branch
- Product domain: `app/models/product.py` - Product, Category, ProductSize, ProductImage
- Inventory domain: `app/models/inventory.py` - BranchStock, InventoryMovement
- Sales domain: `app/models/sales.py` - Sale, SaleItem
- E-commerce domain: `app/models/ecommerce.py` - EcommerceConfig, StoreBanner
- Payment domain: `app/models/payment.py` - PaymentConfig (legacy)
- Payment methods: `app/models/payment_method.py` - PaymentMethod (new)
- System config: `app/models/system_config.py` - SystemConfig
- Tax rates: `app/models/tax_rate.py` - TaxRate
- Notifications: `app/models/notification.py` - Notification
- WhatsApp domain: `app/models/whatsapp.py` - WhatsAppConfig, WhatsAppSale
- Enums: `app/models/enums.py` - UserRole, SaleType, OrderStatus

## Development Workflow

### Initial Setup

**Setup Steps**
1. Ensure Docker Desktop is running
2. Clone repository and navigate to project root
3. Run `make dev` to start all services (builds and starts all containers)
4. Initialize database with test data:
   ```bash
   make shell-backend
   python init_data.py              # Core data (users, branches, categories, products)
   python init_content_data.py      # E-commerce banners and config (optional)
   python init_sportswear_data.py   # Sportswear catalog (optional)
   exit
   ```

**Access Points:**
- POS Admin: http://localhost:3000
- E-commerce: http://localhost:3001
- API Docs: http://localhost:8000/docs
- Database Admin (Adminer): http://localhost:8080
- Backend Health: http://localhost:8000/health

### Adding New Features
1. **Backend changes** (follow layered architecture):
   - **Models**: Add/update models in `app/models/{domain}.py` (e.g., `app/models/product.py`)
   - **Schemas**: Add/update schemas in `app/schemas/{domain}.py` (e.g., `app/schemas/product.py`)
   - **Repositories**: Add data access methods in `app/repositories/{domain}.py`
   - **Services**: Implement business logic in `app/services/{domain}_service.py`
   - **Routers**: Create/update API endpoints in `routers/` (delegates to services)
   - **Tests**: Write unit tests in `tests/unit/` and integration tests in `tests/integration/`

   **Import Pattern**:
   ```python
   # Correct (new structure)
   from app.models import User, Product, Sale
   from app.schemas import UserCreate, ProductCreate
   from app.repositories import ProductRepository, CategoryRepository
   from app.services import ProductService, InventoryService, SaleService

   # Legacy (still works but deprecated)
   from models import User, Product
   from schemas import UserCreate
   ```

   **Using Services in Routers** (✅ Recommended Pattern - Phase 3):
   ```python
   from fastapi import APIRouter, Depends, HTTPException
   from sqlalchemy.orm import Session
   from app.services import SaleService
   from app.schemas import SaleCreate
   from database import get_db
   from auth import get_current_user

   router = APIRouter()

   def get_sale_service(db: Session = Depends(get_db)):
       return SaleService(db)

   @router.post("/sales")
   async def create_sale(
       sale_data: SaleCreate,
       sale_service: SaleService = Depends(get_sale_service),
       current_user = Depends(get_current_user)
   ):
       try:
           # Service handles: stock validation, inventory updates, tax calculation
           sale = sale_service.create_sale(
               sale_data=sale_data,
               user_id=current_user.id,
               branch_id=current_user.branch_id
           )
           return sale
       except ValueError as e:
           raise HTTPException(status_code=400, detail=str(e))
   ```

   **Using Repositories Directly** (Alternative for simple CRUD):
   ```python
   from fastapi import APIRouter, Depends
   from sqlalchemy.orm import Session
   from app.repositories import ProductRepository
   from database import get_db

   router = APIRouter()

   def get_product_repo(db: Session = Depends(get_db)):
       return ProductRepository(db)

   @router.get("/products")
   async def list_products(
       skip: int = 0,
       limit: int = 100,
       product_repo: ProductRepository = Depends(get_product_repo)
   ):
       products = product_repo.get_all(skip=skip, limit=limit)
       return products
   ```
2. **Frontend changes**:
   - POS Admin: Components in `frontend/pos-cesariel/app/`
   - E-commerce: Components in `ecommerce/app/`
   - Follow existing patterns (hooks, context, API clients)
   - Update TypeScript types to match backend schemas
3. **Database changes**:
   - Modify SQLAlchemy models in `models.py`
   - Alembic migrations (if using migration system)
   - Run migrations via backend container
4. **Testing**:
   - Backend: Add pytest unit/integration tests
   - Frontend: Add Jest unit tests and Cypress E2E tests
   - Test backend changes inside container with `make shell-backend`

### Working with Inventory
- Products must have `show_in_ecommerce = true` to appear in online store
- Size-based inventory is managed through `product_sizes` table
- Stock synchronization is handled at the API level between POS and e-commerce
- Use `init_data.py` scripts for seeding test data

### Database Migrations
The system includes several migration scripts for upgrading existing databases:
```bash
# Run inside backend container (make shell-backend)
python migrate_notifications.py     # Migrate to notification system
python migrate_payment_methods.py   # Migrate to new payment method configuration
python migrate_system_config.py     # Migrate to centralized system config
python migrate_tax_rates.py         # Migrate to tax rate configuration
python migrate_add_brand.py         # Add brand field to products
```

**Migration order** (if migrating from old schema):
1. `migrate_system_config.py` - Core system settings
2. `migrate_tax_rates.py` - Tax configuration
3. `migrate_payment_methods.py` - Payment methods
4. `migrate_notifications.py` - Notification system
5. `migrate_add_brand.py` - Product brand support (optional)

### Notification System
The system includes a notification framework for scheduling and managing notifications:
- **Model**: `app/models/notification.py`
- **Service**: `app/services/notification_service.py`
- **Scheduler**: `backend/notification_scheduler.py` (background process)
- **Router**: `routers/notifications.py`

**Notification types**: Stock alerts, payment reminders, system updates

To run the notification scheduler:
```bash
# In production, run as a separate background service
python notification_scheduler.py
```

### Testing Strategy
- **Backend**: pytest with unit and integration test separation, run tests inside container
  - Unit tests: Authentication, models, database operations
  - Integration tests: API endpoints, WebSockets, sales flow, e-commerce
  - Configuration: `pytest.ini` at backend root
  - Test markers: `@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.auth`, `@pytest.mark.websocket`, `@pytest.mark.slow`
  - Coverage target: 80% minimum (enforced by pytest)
- **POS Frontend**: Jest for unit tests, Cypress for E2E, Lighthouse for performance
  - Jest config: `jest.config.js` with React Testing Library
  - Cypress config: `cypress.config.ts` for E2E testing
  - Performance: Lighthouse CI and Artillery load testing (`artillery.yml`)
- **E-commerce**: Jest for unit tests, Cypress for E2E
  - Jest config: `jest.config.js` with jsdom environment
  - Cypress for end-to-end user journey testing

## Environment Configuration

### Required Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://postgres:password@db:5432/pos_cesariel
SECRET_KEY=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontends
NEXT_PUBLIC_API_URL=http://localhost:8000
PORT=3000  # POS Admin
PORT=3001  # E-commerce
```

### Default Test Users
- `admin` / `admin123` - Full system access
- `manager` / `manager123` - Branch management
- `seller` / `seller123` - POS operations only

## Integration Points

### POS ↔ E-commerce Synchronization
- Shared inventory through backend API
- Real-time stock validation before sales
- E-commerce orders create entries in POS sales system
- WhatsApp integration for order coordination

### Third-party Services
- **Cloudinary**: Product image management and optimization
- **WhatsApp Business API**: Order notifications and customer communication

## Performance Considerations

### Backend Optimization
- Database connection pooling via SQLAlchemy
- Async endpoints where appropriate
- Pagination for large data sets
- Response caching for frequently accessed data

### Frontend Optimization
- Next.js Image optimization
- Code splitting and lazy loading
- React Query caching with 5-minute TTL
- Fallback data for offline scenarios

## Security

### Authentication
- JWT tokens with configurable expiration
- Role-based access control at API level
- Password hashing with bcrypt
- CORS configuration for specific origins

### Data Protection
- Environment variables for sensitive data
- API key management for third-party services
- Input validation and sanitization
- SQL injection prevention through ORM

## Troubleshooting

### Common Issues

**Services won't start**
```bash
make clean && make dev  # Reset all containers
```

**Database connection issues**
```bash
make logs-db           # Check PostgreSQL logs
make shell-db          # Direct database access
```

**Frontend API errors**
- Verify backend is running on port 8000
- Check CORS configuration in `main.py`
- Validate environment variables

**E-commerce products not showing**
- Ensure products have `show_in_ecommerce = true`
- Check category visibility settings
- Verify API connectivity via `/health` endpoint

**VS Code showing Python import errors**
- See `backend/QUICK_FIX_VSCODE.md` for 2-minute fix
- Install Pylance extension
- Select Python interpreter
- Errors are visual only - code runs fine in Docker

**Import errors after refactoring**
- Use `from app.models import Model` instead of `from models import Model`
- Use `from app.schemas import Schema` instead of `from schemas import Schema`
- Use `from app.services import Service` for business logic
- Old imports still work but are deprecated (backward compatibility maintained)
- Phase 1 (models/schemas split) is ✅ COMPLETE - see `backend/PHASE_1_COMPLETION.md`
- Phase 2 (repository layer) is ✅ COMPLETE - see `backend/PHASE2_COMPLETE.md`
- Phase 3 (service layer) is ✅ COMPLETE - see `backend/PHASE3_COMPLETE.md`
- 15 repositories available with full CRUD operations via `BaseRepository`
- 6 services available for business logic (Inventory, Product, Sale, User, Payment, Notification)

### Performance Issues
- Monitor database query performance
- Check bundle sizes: `npm run build`
- Use Lighthouse for frontend performance auditing
- Run load tests with Artillery before deployment

## Deployment Notes

### Production Considerations
- Set `DEBUG_MODE = false` for backend
- Use external PostgreSQL instance
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Implement monitoring and logging
- Configure backup strategies
- Set up CI/CD pipelines with comprehensive testing

### Scaling
- Backend: Horizontal scaling with load balancer
- Database: Read replicas for reporting queries
- Frontend: CDN deployment with caching
- Images: Cloudinary automatic optimization
