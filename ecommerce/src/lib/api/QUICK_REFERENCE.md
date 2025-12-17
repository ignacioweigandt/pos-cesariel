# API Client - Quick Reference Card

## Import

```typescript
import { apiFetch, apiFetchWithDefault, ApiError } from '@/src/lib/api';
```

## Basic Usage

### Simple Request (Graceful Degradation)

```typescript
const response = await apiFetch<Product[]>('/products');

if (!response) {
  return []; // Backend down - use fallback
}

return response; // Backend up - use data
```

### With Default Value (Never Null)

```typescript
const products = await apiFetchWithDefault<Product[]>(
  '/products',
  [] // Default value
);

// products is always Product[], never null
```

## Common Patterns

### Pattern 1: List with Empty Fallback

```typescript
export async function getItems(): Promise<Item[]> {
  const response = await apiFetch<ApiResponse<Item[]>>('/items', {
    revalidate: 3600,
    tags: ['items'],
  });

  return response?.data || [];
}
```

### Pattern 2: Single Item with Null

```typescript
export async function getItem(id: string): Promise<Item | null> {
  const response = await apiFetch<ApiResponse<Item>>(`/items/${id}`, {
    revalidate: 600,
    tags: ['items', `item-${id}`],
  });

  return response?.data ?? null;
}
```

### Pattern 3: Multiple Parallel Requests

```typescript
const [products, categories, banners] = await Promise.all([
  getProducts(),    // Returns []
  getCategories(),  // Returns []
  getBanners(),     // Returns []
]);

// All handle failures gracefully
```

### Pattern 4: Critical Data (Use Error Boundary)

```typescript
const data = await apiFetch('/critical', { throwOnError: true });
// error.tsx catches thrown errors
```

## Server Component Examples

### List Page

```typescript
export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState message="No products available" />
      )}
    </div>
  );
}
```

### Detail Page

```typescript
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound(); // Shows 404 page
  }

  return <ProductDetail product={product} />;
}
```

### With Loading State

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductList />
    </Suspense>
  );
}

async function ProductList() {
  const products = await getProducts();
  return <div>{/* render products */}</div>;
}
```

## Options Reference

```typescript
interface FetchOptions {
  // Next.js caching
  revalidate?: number;      // ISR: seconds until revalidate
  tags?: string[];          // Cache tags for revalidation

  // Error handling
  throwOnError?: boolean;   // Throw on HTTP errors (default: false)

  // Standard fetch options
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}
```

## Error Handling

### What Returns Null

- Network errors (backend down)
- HTTP errors (4xx, 5xx) when `throwOnError: false`
- Timeout (>10s)
- Unexpected errors

### What Throws

- HTTP errors when `throwOnError: true`
- Errors in your code (not from apiFetch)

### Logging

All errors are logged automatically:

```
[API] Network error for /products: {
  message: 'fetch failed',
  backend: 'http://localhost:8000',
  suggestion: 'Verify backend is running'
}
```

## Caching Strategies

### Static (1 hour)
```typescript
{ revalidate: 3600 }  // Good for: banners, categories
```

### Dynamic (5 minutes)
```typescript
{ revalidate: 300 }   // Good for: products, content
```

### Fresh (no cache)
```typescript
{ revalidate: 0 }     // Good for: stock, cart
```

### On-demand
```typescript
{ tags: ['products'] }
// Revalidate with: revalidateTag('products')
```

## Testing Checklist

- [ ] Test with backend running (normal flow)
- [ ] Test with backend stopped (graceful degradation)
- [ ] Test with slow network (timeout handling)
- [ ] Check console for error logs
- [ ] Verify fallback UI shows
- [ ] Confirm no error overlays

## Common Mistakes

### ❌ Don't Throw in Server Components

```typescript
// BAD
const response = await fetch(url);
if (!response.ok) throw new Error(); // Page crash!
```

### ❌ Don't Ignore Null Returns

```typescript
// BAD
const products = await apiFetch('/products');
return products.map(p => p.id); // Error if null!
```

### ❌ Don't Use in Client Components

```typescript
// BAD - apiFetch is for Server Components only
'use client'
function ClientComponent() {
  const data = await apiFetch('/api'); // Wrong!
}
```

### ✅ Do Handle Null

```typescript
// GOOD
const products = await apiFetch('/products');
if (!products) return [];
return products.map(p => p.id);
```

### ✅ Do Use Fallbacks

```typescript
// GOOD
const products = await getProducts();
return products.length > 0 ? <List /> : <Empty />;
```

### ✅ Do Use Client-side Tools for Client Components

```typescript
// GOOD - use React Query, SWR, or useSWR
'use client'
function ClientComponent() {
  const { data } = useSWR('/api/products');
}
```

## Need Help?

1. **Full docs**: `src/lib/api/README.md`
2. **Examples**: `src/lib/api/products.example.ts`
3. **Tests**: `src/lib/api/__tests__/client.test.ts`
4. **Applied fixes**: `FIXES_APPLIED.md`

## Quick Debug

```bash
# Check backend
curl http://localhost:8000/health

# Check logs
docker logs backend

# Test timeout
time curl http://localhost:8000/products

# Restart services
make restart
```
