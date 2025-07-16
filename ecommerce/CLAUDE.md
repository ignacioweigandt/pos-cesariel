# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 e-commerce application integrated with a POS (Point of Sale) system backend. The frontend runs on port 3001 and connects to a FastAPI backend running on port 8000. The project uses TypeScript, Tailwind CSS, and Radix UI components with shadcn/ui.

## Development Commands

```bash
# Development
npm run dev                # Start development server (runs on port 3001)

# Building
npm run build             # Build for production

# Code Quality
npm run lint              # Run ESLint

# Production
npm start                 # Start production server
```

## Architecture Overview

### Frontend Structure
- **App Router**: Next.js 13+ app directory structure
- **Components**: Located in both `app/components/` and root `components/` directories
- **Context**: State management via React Context (`app/context/`)
- **API Layer**: Axios-based API client in `app/lib/api.ts`
- **Data Service**: Abstraction layer with caching in `app/lib/data-service.ts`

### Key Integration Points

#### API Integration (`app/lib/api.ts`)
- Axios client configured for POS backend at `http://localhost:8000`
- Endpoints for products, categories, banners, sales, and e-commerce configuration
- Error handling and timeout configuration (10s)

#### Data Service (`app/lib/data-service.ts`)  
- Caching layer (5-minute cache duration)
- Fallback to static data when backend is unavailable
- Product validation and stock checking functions

#### E-commerce Context (`app/context/EcommerceContext.tsx`)
- Cart management with stock validation
- Customer information handling
- Checkout processing with backend sale creation
- Integration with POS sales API

### Component Structure
- **UI Components**: shadcn/ui components in `components/ui/`
- **App Components**: Business logic components in `app/components/`
- **Modals**: Cart, checkout, and product selection modals in `app/components/modals/`

## Environment Configuration

Required environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
PORT=3001
```

## Backend Integration

### POS System Connection
- Backend must be running on port 8000 (`make dev` in pos-cesariel directory)
- Products must have `show_in_ecommerce = true` to appear in frontend
- Real-time stock validation through API calls
- Sales created in frontend are stored in POS system

### API Endpoints Used
- `GET /products?show_in_ecommerce=true` - Product catalog
- `GET /products/{id}` - Product details
- `GET /categories` - Product categories  
- `GET /ecommerce-advanced/banners` - Homepage banners
- `POST /sales` - Create e-commerce sales
- `GET /products/{id}/available-sizes` - Size/stock information

## Development Workflow

### Working with Products
1. Products are fetched from POS backend in real-time
2. Static fallback data exists for offline development
3. Stock validation happens before adding items to cart
4. Size-specific stock checking for products with variants

### Adding New Features
1. Check existing patterns in similar components
2. Use TypeScript types from `app/lib/api-types.ts`
3. Integrate with data service layer rather than direct API calls
4. Add appropriate error handling and loading states

### Testing Integration
1. Ensure POS backend is running before testing
2. Verify connection status via `ConnectionStatus` component
3. Test fallback behavior when backend is down
4. Validate checkout flow creates sales in POS system

## Special Considerations

### Stock Management
- Real-time stock validation through `validateStock()` function
- Size-specific stock tracking for apparel products
- Cart automatically validates stock before allowing purchases

### Sales Flow
- E-commerce sales are created in POS system with `sale_type: 'ecommerce'`
- Customer information collected during checkout
- WhatsApp integration for order coordination

### Caching Strategy  
- 5-minute cache for product data to improve performance
- Cache invalidation on error or timeout
- Fallback data ensures application works offline

## Troubleshooting

### Backend Connection Issues
- Verify POS backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` environment variable
- Look for CORS issues in browser console

### Products Not Loading
- Ensure products have `show_in_ecommerce = true` in database
- Check API response in Network tab
- Verify categories are active in POS system

### Build Issues
- ESLint errors are ignored during builds (`ignoreDuringBuilds: true`)
- TypeScript errors are ignored (`ignoreBuildErrors: true`)
- Use `npm run lint` to check code quality manually