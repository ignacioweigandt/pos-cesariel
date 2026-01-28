# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

POS Cesariel is a Point of Sale system with dual frontends: an administrative POS interface and a customer-facing e-commerce store. FastAPI backend with PostgreSQL, deployed using Docker.

**Applications:**
- **Backend**: FastAPI REST API (port 8000) - `backend/`
- **POS Admin**: Next.js 15 admin interface (port 3000) - `frontend/pos-cesariel/`
- **E-commerce**: Next.js 15 public storefront (port 3001) - `ecommerce/`

## Quick Reference

```bash
# Start all services
make dev

# Start specific services
make dev-pos          # POS Admin + backend only
make dev-ecommerce    # E-commerce + backend only

# Common operations
make logs-backend     # View backend logs
make shell-backend    # Access backend container
make shell-db         # Access PostgreSQL shell
make init-db          # Initialize database with test data
make backup-db        # Create database backup
make down             # Stop all services
make status           # View container status
make health           # Check service health via curl
make logs-all         # View all logs combined

# Database migrations (Alembic)
make migrate-create MSG="description"  # Create new migration
make migrate-upgrade                   # Apply pending migrations
make migrate-downgrade                 # Revert last migration
make migrate-history                   # View migration history
make migrate-current                   # Show current migration

# Production builds (individual services)
make build-backend    # Build backend only
make build-frontend   # Build POS frontend only
make build-ecommerce  # Build e-commerce only
make build-prod       # Build all production images
make deploy-prod      # Deploy to production (requires .env.production)
```

**Key URLs:**
- POS Admin: http://localhost:3000
- E-commerce: http://localhost:3001
- API Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Adminer (DB UI): http://localhost:8080

## Testing

```bash
# Backend (pytest) - run inside container
make test-backend
# Or directly: docker compose exec backend pytest

# Run specific test file
docker compose exec backend pytest tests/unit/test_specific.py

# Run by marker
docker compose exec backend pytest -m unit
docker compose exec backend pytest -m integration
docker compose exec backend pytest -m auth
docker compose exec backend pytest -m websocket
docker compose exec backend pytest -m slow

# Run with verbose output
docker compose exec backend pytest -v

# Run with coverage (80% minimum required)
docker compose exec backend pytest --cov=app

# Frontend (Jest/Cypress) - run from frontend directories
cd frontend/pos-cesariel && npm test
npm run test:e2e

# Frontend linting
cd frontend/pos-cesariel && npm run lint
cd ecommerce && npm run lint

# Performance testing (POS frontend only)
cd frontend/pos-cesariel && npm run test:lighthouse  # Lighthouse CI
cd frontend/pos-cesariel && npm run test:load        # Artillery load testing
```

**Test structure:**
```
backend/tests/
├── conftest.py           # Test fixtures (test DB, SQLite, users, products)
├── unit/                 # Unit tests for models, auth, database
└── integration/          # API endpoint tests
```

**Available test fixtures** (from `conftest.py`):
- `db_session` - Fresh SQLite session per test
- `client` - FastAPI TestClient with overridden DB
- `test_branch`, `test_branch_secondary` - Branch fixtures
- `test_admin_user`, `test_manager_user`, `test_seller_user` - User fixtures by role
- `test_category`, `test_clothing_category`, `test_footwear_category` - Category fixtures
- `test_product`, `test_product_with_sizes` - Product fixtures
- `test_import_log` - Import log fixture for testing imports
- `auth_headers_admin`, `auth_headers_manager`, `auth_headers_seller` - JWT headers
- `mock_websocket_manager` - Mocked WebSocket for isolated tests (patches global notification functions)

**Async test support**: `asyncio_mode = auto` in pytest.ini enables automatic async test detection.

## Architecture

### Backend (Clean Architecture)

```
backend/
├── main.py                 # FastAPI app, CORS config, router registration
├── database.py             # SQLAlchemy engine, SessionLocal, get_db()
├── auth.py                 # JWT auth, password hashing, get_current_user()
├── config/settings.py      # Application settings and environment vars
├── app/
│   ├── models/            # SQLAlchemy ORM models (organized by domain)
│   ├── schemas/           # Pydantic models (API contracts)
│   ├── repositories/      # Data access layer (CRUD operations)
│   └── services/          # Business logic layer
└── routers/               # FastAPI route handlers
```

**Key patterns:**
- **Repository Pattern**: All DB access via `app/repositories/`
- **Service Layer**: Business logic in `app/services/`
- **JWT Auth**: Use `get_current_user()` dependency for protected routes
- **Role-based access**: `require_admin()`, `require_manager_or_admin()`, `require_stock_management_permission()`
- **Multi-tenant**: Most models have `branch_id`, stock tracked per branch

**Model imports** - Always import from the package:
```python
from app.models import User, Product, Sale, UserRole, SaleType  # Correct
from app.models.user import User  # Avoid
```

**Enums** (see `backend/app/models/enums.py` and domain-specific model files):
```python
# User roles
UserRole.ADMIN      # Full system access
UserRole.MANAGER    # Branch management + reports
UserRole.SELLER     # POS operations + limited reports
UserRole.ECOMMERCE  # E-commerce frontend only

# Sale types
SaleType.POS        # Physical store sale
SaleType.ECOMMERCE  # Online store sale
SaleType.WHATSAPP   # WhatsApp order

# Order status (e-commerce)
OrderStatus.PENDING     # Awaiting processing
OrderStatus.CONFIRMED   # Order confirmed
OrderStatus.COMPLETED   # Order delivered/picked up
OrderStatus.CANCELLED   # Order cancelled

# Notifications
NotificationType.LOW_STOCK, .NEW_SALE, .ORDER_STATUS, .SYSTEM
NotificationPriority.LOW, .MEDIUM, .HIGH, .URGENT

# System config
CurrencyCode.ARS, .USD, .EUR, .BRL
CurrencyPosition.BEFORE, .AFTER

# Audit
ChangeAction.CREATE, .UPDATE, .DELETE
```

**Domain models by category** (see `backend/app/models/__init__.py`):
- **User**: `Branch`, `User`
- **Product**: `Category`, `Product`, `Brand`
- **Inventory**: `BranchStock`, `InventoryMovement`, `ProductSize`, `ImportLog`
- **Sales**: `Sale`, `SaleItem`
- **Ecommerce**: `EcommerceConfig`, `StoreBanner`, `ProductImage`
- **Payment**: `PaymentConfig`, `CustomInstallment`, `PaymentMethod`
- **WhatsApp**: `WhatsAppConfig`, `WhatsAppSale`, `SocialMediaConfig`
- **System**: `SystemConfig` (currency settings), `TaxRate`, `Notification`, `NotificationSetting`
- **Audit**: `ConfigChangeLog`, `SecurityAuditLog` (tracks config changes with `ChangeAction`)
- **Branch Config**: `BranchTaxRate`, `BranchPaymentMethod`

### Frontend (Feature-Based Architecture)

```
frontend/pos-cesariel/
├── app/                    # Next.js 15 App Router (thin pages)
├── features/              # Feature modules (main business logic)
│   └── <feature>/
│       ├── components/    # UI components
│       ├── hooks/         # Custom hooks (data fetching)
│       ├── types/         # TypeScript interfaces
│       └── api/           # Feature-specific API calls
└── shared/                # Shared code
    ├── api/client.ts      # Axios client with JWT interceptors
    ├── components/        # Reusable UI (Layout, shadcn/ui)
    └── hooks/useAuth.ts   # Auth state (Zustand)
```

**E-commerce** (`ecommerce/`) - See also `ecommerce/CLAUDE.md` for detailed e-commerce guidance:
- Data Service (`app/lib/data-service.ts`): Caching layer with 5-min cache, fallback to static data
- EcommerceContext (`app/context/EcommerceContext.tsx`): Cart management, stock validation, checkout flow
- API Layer (`app/lib/api.ts`): Public endpoints, no auth required
- Types (`app/lib/api-types.ts`): TypeScript interfaces matching backend schemas
- Dual URL config: `API_URL` (server-side, Docker internal) + `NEXT_PUBLIC_API_URL` (client-side)

### WebSockets (Real-time Updates)

The system uses WebSockets for real-time synchronization between branches and frontends.

**Backend** (`backend/websocket_manager.py`):
- `ConnectionManager`: Manages WebSocket connections per branch
- Utility functions: `notify_inventory_change()`, `notify_new_sale()`, `notify_low_stock()`, etc.
- Connections are branch-aware for targeted notifications

**Frontend** (`frontend/pos-cesariel/shared/hooks/useWebSocket.ts`):
- Hook for connecting to WebSocket endpoint
- Handles reconnection and message parsing

**WebSocket message types:**
```python
"inventory_change"    # Stock updates
"new_sale"           # New sale notification
"low_stock_alert"    # Stock below minimum
"product_update"     # Product CRUD events
"sale_status_change" # Order status changes
"dashboard_update"   # Real-time dashboard data
```

## Critical Constraints

### API Endpoints Without Trailing Slashes
```
✅ /products, /sales, /auth/login
❌ /products/, /sales/, /auth/login/
```

### Stock Management
- **Never modify `Product.stock_quantity` directly** - it's calculated from BranchStock
- Always update `BranchStock` table (stock per Branch + Product + Size)
- Use `ProductRepository.update_stock()` or `BranchStockRepository.adjust_stock()`
- Validate stock before sales: `BranchStock.quantity >= requested_quantity`
- For products with sizes (`has_sizes=True`), use `ProductSize` for size variants

```python
# Correct: Check stock via BranchStock
branch_stock = db.query(BranchStock).filter(
    BranchStock.product_id == product_id,
    BranchStock.branch_id == branch_id,
    BranchStock.size_id == size_id
).first()
if branch_stock and branch_stock.quantity >= requested:
    # proceed

# Also correct: Use product business methods
if product.has_stock_in_branch(branch_id, quantity):
    # proceed
```

### Multi-tenant (Branch-based)
- Most models have `branch_id` foreign key
- Queries filter by user's branch (except Admin role)
- When creating entities, always set appropriate `branch_id`

```python
# Pattern for branch filtering
if current_user.role != UserRole.ADMIN:
    query = query.filter(Model.branch_id == current_user.branch_id)
```

### E-commerce Product Visibility
Products must have `show_in_ecommerce = true` to appear in storefront.

### Foreign Key Constraints
When deleting branches, categories, or products, check for dependent records:
- Branch → Users, Products, Sales, BranchStock
- Product → SaleItems, BranchStock, ProductSizes
- Category → Products

### Database Migrations (Alembic)
**CRITICAL**: We use Alembic for schema migrations, NOT `Base.metadata.create_all()`.

**Creating migrations after model changes:**
```bash
# 1. Modify models in backend/app/models/
# 2. Generate migration
make migrate-create MSG="add user avatar field"

# 3. Review generated migration in backend/alembic/versions/
# 4. Apply migration
make migrate-upgrade
```

**Common migration commands:**
```bash
make migrate-current      # Show current migration
make migrate-history      # View all migrations
make migrate-upgrade      # Apply pending migrations
make migrate-downgrade    # Rollback last migration
```

**First-time setup (if DB already has tables):**
```bash
# Mark current schema as migration baseline without applying
docker compose exec backend alembic stamp head
```

**Important notes:**
- Always review auto-generated migrations before applying
- Never edit applied migrations (create new one instead)
- Always test in development first
- Backup before migrating in production: `make backup-db`
- See `backend/MIGRATIONS.md` for detailed guide

## Common Workflows

### Adding a New Backend Model

1. Add model in `backend/app/models/<domain>.py`
2. Register in `backend/app/models/__init__.py` (import + add to `__all__`)
3. Create schemas in `backend/app/schemas/`
4. Create repository in `backend/app/repositories/`
5. Create router in `backend/routers/`
6. Register router in `backend/main.py`

Note: No Alembic migrations - use manual scripts (`backend/migrate_*.py`) or database recreation.

```bash
# Run a migration script inside the container
docker compose exec backend python migrate_add_brand.py
```

### Adding a New Frontend Feature

1. Create `features/<name>/` with components, hooks, types, api subdirs
2. Add container component (`<Name>Container.tsx`)
3. Add route in `app/<name>/page.tsx`
4. Update navigation in `shared/components/layout/Layout.tsx`
5. Configure permissions in `shared/hooks/useAuth.ts` (`canAccessModule()`)

### Adding E-commerce Pages

1. Add page in `ecommerce/app/(shop)/<route>/page.tsx`
2. Use data service layer (`app/lib/data-service.ts`) for API calls
3. Types go in `app/lib/api-types.ts`
4. Use EcommerceContext for cart/checkout integration

## Environment Variables

**Backend** (`.env` or docker-compose):
```
DATABASE_URL=postgresql://postgres:password@db:5432/pos_cesariel
SECRET_KEY=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
DEBUG=False
ENV=development|production
```

**Frontends** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
# E-commerce also needs:
API_URL=http://backend:8000  # Server-side (Docker internal)
PORT=3001
```

## API Endpoints Overview

```
/auth/              - Login, logout, token validation
/branches/          - Branch management (Admin)
/users/             - User management
/categories/        - Category CRUD
/brands/            - Brand management
/products/          - Product CRUD, stock, imports, available-sizes
/sales/             - Sales records, POS operations
/ecommerce-advanced/ - Admin e-commerce features (banners, config, WhatsApp)
/ecommerce/         - Public storefront API (no auth required)
/config/            - System configuration (currency, tax rates, payment methods)
/notifications/     - Notification management and settings
/content/           - Banner, logo, and social media content management
/api/init/          - Database initialization endpoints
/ws/{branch_id}     - WebSocket endpoint for real-time updates (branch-aware)
```

**Public vs Protected Endpoints:**
- `/ecommerce/*` - Public (no auth), used by e-commerce frontend
- All other endpoints require JWT auth via `Authorization: Bearer <token>`

## Troubleshooting

- **Backend not starting**: Check `docker ps`, verify DATABASE_URL, `make logs-backend`
- **Frontend can't connect**: Verify NEXT_PUBLIC_API_URL, check CORS in `backend/main.py`
- **Products not in e-commerce**: Check `show_in_ecommerce = true`, verify stock in BranchStock
- **Auth errors**: Check SECRET_KEY consistency, token expires in 8 hours
- **Stock issues**: Remember stock is per-branch in BranchStock, not in Product table
- **WebSocket not connecting**: Ensure backend is running, check browser console for WS errors
- **CORS preflight failing**: Check `OptionsMiddleware` in `backend/main.py`, verify allowed origins
- **E-commerce server-side fetch fails**: Use `API_URL` (Docker internal: `http://backend:8000`), not `NEXT_PUBLIC_API_URL`
- **Tests failing with WebSocket errors**: Use `mock_websocket_manager` fixture to isolate tests
- **Docker cleanup**: Run `make prune` to clean unused Docker resources (images, containers, volumes)
