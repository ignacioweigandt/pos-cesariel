# Server-Side API Client - Error Handling Guide

## Overview

This API client is designed for **Next.js 15 Server Components** with comprehensive error handling that prevents page crashes when the backend is unavailable.

## Key Features

- **Graceful Degradation**: Returns `null` instead of throwing errors when backend is down
- **Network Error Handling**: Catches fetch failures, timeouts, and DNS issues
- **Type Safety**: Full TypeScript support with generic types
- **Next.js Caching**: Built-in support for ISR and tag-based revalidation
- **Timeout Protection**: 10-second timeout prevents hanging requests
- **Structured Logging**: Detailed error logs for debugging

## Core Principles

### 1. Never Throw Network Errors in Server Components

```typescript
// ❌ BAD - Will crash the page
export async function getBanners() {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed'); // Page crash!
  return response.json();
}

// ✅ GOOD - Graceful degradation
export async function getBanners(): Promise<Banner[]> {
  const response = await apiFetch<ApiResponse<Banner[]>>('/banners');

  if (!response) {
    return []; // Fallback to empty state
  }

  return response.data;
}
```

### 2. Handle Null Returns

The `apiFetch` function returns `T | null`, so always check for null:

```typescript
const response = await apiFetch<Product[]>('/products');

if (!response) {
  // Backend unavailable - use fallback
  return defaultProducts;
}

// Backend available - use response
return response;
```

## API Reference

### `apiFetch<T>(endpoint, options): Promise<T | null>`

Primary fetch function with error handling.

**Parameters:**
- `endpoint` (string): API endpoint path (e.g., `/products`)
- `options` (FetchOptions): Configuration options

**Options:**
- `revalidate` (number): ISR revalidation time in seconds (default: 3600)
- `tags` (string[]): Cache tags for on-demand revalidation
- `throwOnError` (boolean): Throw on HTTP errors (default: false)
- Standard fetch options (method, headers, body, etc.)

**Returns:** `Promise<T | null>`
- `T` when successful
- `null` when backend unavailable or error occurs

**Error Behavior:**
- Network errors (backend down): Returns `null`, logs error
- HTTP errors (4xx, 5xx): Returns `null` by default (unless `throwOnError: true`)
- Timeout (>10s): Returns `null`
- Unexpected errors: Returns `null`, logs error

**Example:**
```typescript
const products = await apiFetch<Product[]>('/products', {
  revalidate: 300, // 5 minutes
  tags: ['products'],
});

if (!products) {
  return []; // Graceful fallback
}
```

### `apiFetchWithDefault<T>(endpoint, defaultValue, options): Promise<T>`

Convenience function that automatically provides fallback value.

**Parameters:**
- `endpoint` (string): API endpoint
- `defaultValue` (T): Fallback value if fetch fails
- `options` (FetchOptions): Same as apiFetch

**Returns:** `Promise<T>` (never null)

**Example:**
```typescript
const banners = await apiFetchWithDefault<Banner[]>(
  '/banners',
  [], // Default to empty array
  { revalidate: 3600 }
);

// banners is always Banner[], never null
```

### `ApiError`

Custom error class for structured error handling.

**Properties:**
- `message` (string): Error description
- `status` (number | undefined): HTTP status code
- `endpoint` (string | undefined): Failed endpoint

**Example:**
```typescript
try {
  const data = await apiFetch('/products', { throwOnError: true });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Failed to fetch ${error.endpoint}: ${error.status}`);
  }
}
```

## Usage Patterns

### Pattern 1: Server Component with Fallback UI

```typescript
// app/(shop)/page.tsx
import { getBanners } from '@/src/lib/api';

export default async function HomePage() {
  const banners = await getBanners(); // Returns [] if backend down

  return (
    <div>
      {banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : (
        <FallbackHero /> // Show when no banners or backend down
      )}
    </div>
  );
}
```

### Pattern 2: With Default Data

```typescript
// src/lib/api/products.ts
const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: 'Demo Product', price: 10 },
];

export async function getProducts(): Promise<Product[]> {
  return apiFetchWithDefault('/products', DEFAULT_PRODUCTS, {
    revalidate: 300,
    tags: ['products'],
  });
}
```

### Pattern 3: Multiple Data Sources

```typescript
export default async function DashboardPage() {
  // Fetch in parallel
  const [products, categories, banners] = await Promise.all([
    getProducts(),      // Returns [] if fails
    getCategories(),    // Returns [] if fails
    getBanners(),       // Returns [] if fails
  ]);

  // All gracefully handle backend downtime
  return (
    <Dashboard
      products={products}
      categories={categories}
      banners={banners}
    />
  );
}
```

### Pattern 4: Critical Data with Error Boundary

For critical data where you want to show an error page:

```typescript
// app/(shop)/products/[id]/page.tsx
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await apiFetch<Product>(`/products/${params.id}`, {
    throwOnError: true, // Will trigger error.tsx if fails
  });

  if (!product) {
    notFound(); // Show 404 page
  }

  return <ProductDetail product={product} />;
}

// app/(shop)/products/[id]/error.tsx will catch thrown errors
```

## Error Boundary Setup

Every route group should have an `error.tsx` file:

```typescript
// app/(shop)/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
```

## Logging and Debugging

### Log Format

All errors are logged with structured information:

```typescript
// Network errors
[API] Network error for /products: {
  message: 'fetch failed',
  backend: 'http://localhost:8000',
  suggestion: 'Verify backend is running and accessible'
}

// HTTP errors
[API] API Error: 404 Not Found

// Unexpected errors
[API] Unexpected error for /products: <error details>
```

### Debugging Tips

1. **Check server logs**: `docker logs backend` or console in terminal
2. **Verify backend health**: `curl http://localhost:8000/health`
3. **Check environment**: `echo $NEXT_PUBLIC_API_URL`
4. **Monitor Network tab**: Browser DevTools > Network
5. **Enable verbose logging**: Add debug logs in your API functions

## Best Practices

### ✅ DO

- Always handle `null` returns from `apiFetch`
- Use `apiFetchWithDefault` for simple fallback cases
- Add meaningful fallback UI components
- Test with backend offline to verify graceful degradation
- Use error boundaries for critical pages
- Log errors for monitoring and debugging

### ❌ DON'T

- Don't throw errors in Server Components unless handled by error boundary
- Don't ignore `null` returns without providing fallbacks
- Don't use `apiFetch` in Client Components (use React Query or SWR instead)
- Don't disable error logging in production
- Don't set extremely long timeouts (>30s)

## Testing

### Test Backend Unavailable Scenario

```bash
# Stop backend
docker stop backend

# Visit http://localhost:3001
# Page should load with fallback content, no error overlay

# Start backend
docker start backend
```

### Test Error Boundary

```typescript
// Force an error
export async function getProducts(): Promise<Product[]> {
  const response = await apiFetch<Product[]>('/products', {
    throwOnError: true, // Will trigger error boundary
  });

  if (!response) {
    throw new Error('Products unavailable'); // Caught by error.tsx
  }

  return response;
}
```

## Migration Guide

### From Old Pattern

```typescript
// OLD - Would crash page
export async function getBanners(): Promise<Banner[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    console.error(error);
    return []; // Error still propagates to browser!
  }
}
```

### To New Pattern

```typescript
// NEW - Graceful degradation
export async function getBanners(): Promise<Banner[]> {
  const response = await apiFetch<ApiResponse<Banner[]>>('/banners', {
    revalidate: 3600,
    tags: ['banners'],
  });

  if (!response) {
    console.warn('Backend unavailable - using fallback');
    return [];
  }

  return response.data;
}
```

## Troubleshooting

### Issue: Page shows error overlay

**Cause:** Error is being thrown instead of handled
**Solution:** Ensure you're checking for `null` returns

```typescript
// Add null check
const data = await apiFetch('/endpoint');
if (!data) return fallbackData; // Must handle null
```

### Issue: Console shows many error logs

**Cause:** Backend is down and being called frequently
**Solution:** This is expected - errors are logged but don't break the page. Start backend to resolve.

### Issue: Type errors with null returns

**Cause:** TypeScript expects non-null value
**Solution:** Use type narrowing or `apiFetchWithDefault`

```typescript
// Option 1: Type narrowing
const data = await apiFetch<Product[]>('/products');
if (!data) return;
// data is Product[] here

// Option 2: Default value
const data = await apiFetchWithDefault<Product[]>('/products', []);
// data is always Product[]
```

## Related Documentation

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## Support

If you encounter issues:
1. Check this documentation
2. Review server logs: `make logs-backend`
3. Test backend connectivity: `curl http://localhost:8000/health`
4. Check environment variables in `.env.local`
5. Consult the main CLAUDE.md in the project root
