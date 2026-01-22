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

# Common operations
make logs-backend        # View backend logs
make shell-backend       # Access backend container
make init-db            # Initialize database with test data
make test-backend       # Run backend tests
make down               # Stop all services
```

**Key locations:**
- Backend routes: `backend/routers/`
- Backend models: `backend/app/models/`
- POS features: `frontend/pos-cesariel/features/`
- E-commerce pages: `ecommerce/app/(shop)/`

## Testing

```bash
# Backend (pytest)
make test-backend
# Or: pytest tests/unit/test_specific.py
# Markers: pytest -m unit|integration|slow|auth

# Frontend (Jest/Cypress)
cd frontend/pos-cesariel && npm test
npm run test:e2e
```

## Architecture

### Backend (Clean Architecture)

```
backend/
├── main.py                 # FastAPI app, CORS config, router registration
├── database.py             # SQLAlchemy engine, SessionLocal, get_db()
├── auth.py                 # JWT auth, password hashing, get_current_user()
├── app/
│   ├── models/            # SQLAlchemy ORM models (organized by domain)
│   ├── schemas/           # Pydantic models (API contracts)
│   ├── repositories/      # Data access layer (CRUD operations)
│   └── services/          # Business logic layer
└── routers/               # FastAPI route handlers
```

**Key patterns:**
- Repository Pattern: All DB access via `app/repositories/`
- Service Layer: Business logic in `app/services/`
- JWT Auth: Use `get_current_user()` dependency for protected routes
- Multi-tenant: Most models have `branch_id`, stock tracked per branch

**Model imports** - Always import from the package:
```python
from app.models import User, Product, Sale  # Correct
from app.models.user import User            # Avoid
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
- Data Service (`app/lib/data-service.ts`): Caching layer with 5-min cache
- EcommerceContext: Cart management, stock validation, checkout flow

## Critical Constraints

### API Endpoints Without Trailing Slashes
```
✅ /products, /sales, /auth/login
❌ /products/, /sales/, /auth/login/
```

### Stock Management
- **Never modify `Product.stock` directly** - it's calculated
- Always update `BranchStock` table (stock per Branch + Product + Size)
- Use `ProductRepository.update_stock()` or `BranchStockRepository.adjust_stock()`
- Validate stock before sales: `BranchStock.quantity >= requested_quantity`

### Multi-tenant (Branch-based)
- Most models have `branch_id` foreign key
- Queries filter by user's branch (except Admin role)
- When creating entities, always set appropriate `branch_id`

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

## Environment Variables

**Backend** (`.env` or docker-compose):
```
DATABASE_URL=postgresql://postgres:password@db:5432/pos_cesariel
SECRET_KEY=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

**Frontends** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
# E-commerce also needs:
API_URL=http://backend:8000  # Server-side (Docker)
PORT=3001
```

## Troubleshooting

- **Backend not starting**: Check `docker ps`, verify DATABASE_URL, `make logs-backend`
- **Frontend can't connect**: Verify NEXT_PUBLIC_API_URL, check CORS in `backend/main.py`
- **Products not in e-commerce**: Check `show_in_ecommerce = true`, verify stock in BranchStock
- **Auth errors**: Check SECRET_KEY consistency, token expires in 8 hours
