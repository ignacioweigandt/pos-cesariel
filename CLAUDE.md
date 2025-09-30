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
make down               # Stop all services
make restart            # Restart all services
make clean              # Clean containers and volumes

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
# Testing
pytest                  # Run backend tests with coverage
pytest tests/unit/      # Unit tests only
pytest tests/integration/ # Integration tests only

# Database initialization
python init_data.py     # Create initial data (users, branches, products)

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
npm run test:e2e       # Cypress E2E tests
```

## System Architecture

### Backend Structure (FastAPI)
- **Models**: SQLAlchemy ORM models in `models.py`
- **Routers**: Modular API endpoints organized by functionality
  - `auth.py` - JWT authentication and session management
  - `users.py` - User management with role-based permissions
  - `branches.py` - Multi-branch management
  - `products.py` - Inventory management with size variants
  - `sales.py` - Sales processing and reporting
  - `ecommerce_advanced.py` - E-commerce admin functions
  - `ecommerce_public.py` - Public e-commerce API
  - `content_management.py` - CMS for banners and content
- **Database**: PostgreSQL with automated migrations
- **Configuration**: Environment-based settings in `config/settings.py`

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

## Development Workflow

### Initial Setup
1. Ensure Docker Desktop is running
2. Clone repository and navigate to project root
3. Run `make dev` to start all services
4. Initialize database: `make shell-backend` → `python init_data.py`
5. Access applications:
   - POS Admin: http://localhost:3000
   - E-commerce: http://localhost:3001
   - API Docs: http://localhost:8000/docs
   - Database Admin: http://localhost:8080

### Adding New Features
1. Backend changes: Update models, create/update routers, add tests
2. Frontend changes: Create components following existing patterns, update API types
3. Database changes: Use SQLAlchemy migrations if needed
4. Testing: Add unit tests, integration tests, and E2E tests as appropriate

### Working with Inventory
- Products must have `show_in_ecommerce = true` to appear in online store
- Size-based inventory is managed through `product_sizes` table
- Stock synchronization is handled at the API level between POS and e-commerce
- Use `init_data.py` scripts for seeding test data

### Testing Strategy
- **Backend**: pytest with unit and integration test separation
- **POS Frontend**: Jest for unit tests, Cypress for E2E, Lighthouse for performance
- **E-commerce**: Jest for unit tests, Cypress for E2E
- **Load Testing**: Artillery configuration for realistic traffic simulation

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