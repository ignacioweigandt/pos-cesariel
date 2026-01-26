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

# Run with verbose output
docker compose exec backend pytest -v

# Run with coverage
docker compose exec backend pytest --cov=app

# Frontend (Jest/Cypress)
cd frontend/pos-cesariel && npm test
npm run test:e2e
```

**Test structure:**
```
backend/tests/
├── conftest.py           # Test fixtures (test DB, users, products)
├── unit/                 # Unit tests for models, auth, database
└── integration/          # API endpoint tests
```

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

**User roles and enums:**
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
```

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

**E-commerce** (`ecommerce/`):
- Data Service (`app/lib/data-service.ts`): Caching layer with 5-min cache, fallback data
- EcommerceContext (`app/context/EcommerceContext.tsx`): Cart management, stock validation, checkout flow
- API Layer (`app/lib/api.ts`): Public endpoints, no auth required

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

## Common Workflows

### Adding a New Backend Model

1. Add model in `backend/app/models/<domain>.py`
2. Register in `backend/app/models/__init__.py` (import + add to `__all__`)
3. Create schemas in `backend/app/schemas/`
4. Create repository in `backend/app/repositories/`
5. Create router in `backend/routers/`
6. Register router in `backend/main.py`

Note: No Alembic migrations - use manual scripts (`backend/migrate_*.py`) or database recreation.

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
/products/          - Product CRUD, stock, imports
/sales/             - Sales records, POS operations
/ecommerce-advanced/ - Admin e-commerce features (banners, config)
/ecommerce/         - Public storefront API (no auth)
/config/            - System configuration
/notifications/     - Notification management
/content/           - Banner and CMS content management
/api/init/          - Database initialization endpoints
/ws/                - WebSocket endpoint for real-time updates
```

## Troubleshooting

- **Backend not starting**: Check `docker ps`, verify DATABASE_URL, `make logs-backend`
- **Frontend can't connect**: Verify NEXT_PUBLIC_API_URL, check CORS in `backend/main.py`
- **Products not in e-commerce**: Check `show_in_ecommerce = true`, verify stock in BranchStock
- **Auth errors**: Check SECRET_KEY consistency, token expires in 8 hours
- **Stock issues**: Remember stock is per-branch in BranchStock, not in Product table
- **WebSocket not connecting**: Ensure backend is running, check browser console for WS errors
- **CORS preflight failing**: Check `OptionsMiddleware` in `backend/main.py`, verify allowed origins
