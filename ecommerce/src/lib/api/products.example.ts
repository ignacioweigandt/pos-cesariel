/**
 * Products API - Example Implementation
 *
 * This file demonstrates how to implement API functions following
 * the new error handling pattern. Use this as a template for
 * creating other API endpoint functions.
 *
 * NOTE: This is an EXAMPLE file. The actual products API may be
 * in a different location (app/lib/api.ts or similar).
 */

import { apiFetch, apiFetchWithDefault } from './client';

// Types (should match your actual types)
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image_url?: string;
  show_in_ecommerce: boolean;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ProductFilters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
}

// Default fallback data (optional)
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 0,
    name: 'Producto de ejemplo',
    description: 'Conectándose al servidor...',
    price: 0,
    stock: 0,
    category_id: 1,
    show_in_ecommerce: true,
  },
];

/**
 * Get all products with optional filters
 *
 * Pattern: Returns empty array on error (graceful degradation)
 *
 * @param filters - Optional filters for products
 * @returns Promise with products array (never null)
 */
export async function getProducts(
  filters?: ProductFilters
): Promise<Product[]> {
  // Build query string
  const params = new URLSearchParams();
  if (filters?.category_id) params.set('category_id', String(filters.category_id));
  if (filters?.min_price) params.set('min_price', String(filters.min_price));
  if (filters?.max_price) params.set('max_price', String(filters.max_price));
  if (filters?.search) params.set('search', filters.search);
  params.set('show_in_ecommerce', 'true'); // E-commerce only

  const queryString = params.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

  const response = await apiFetch<ApiResponse<Product[]>>(endpoint, {
    revalidate: 300, // 5 minutes cache
    tags: ['products'],
  });

  // Backend unavailable - graceful degradation
  if (!response) {
    console.warn('[Products] Backend unavailable - returning empty array');
    return [];
  }

  // Return products data
  return response.data || [];
}

/**
 * Get products with default fallback data
 *
 * Pattern: Never returns empty, always shows something
 *
 * @param filters - Optional filters
 * @returns Promise with products (never empty if defaults provided)
 */
export async function getProductsWithDefaults(
  filters?: ProductFilters
): Promise<Product[]> {
  const products = await getProducts(filters);

  // Return defaults if empty (backend down or no products)
  return products.length > 0 ? products : DEFAULT_PRODUCTS;
}

/**
 * Get single product by ID
 *
 * Pattern: Returns null on error, caller handles not found
 *
 * @param id - Product ID
 * @returns Promise with product or null
 */
export async function getProductById(
  id: number | string
): Promise<Product | null> {
  const response = await apiFetch<ApiResponse<Product>>(
    `/products/${id}`,
    {
      revalidate: 600, // 10 minutes cache
      tags: ['products', `product-${id}`],
    }
  );

  // Backend unavailable or product not found
  if (!response) {
    return null;
  }

  return response.data;
}

/**
 * Get featured products (top sellers, promotions, etc.)
 *
 * Pattern: Uses apiFetchWithDefault for simplicity
 *
 * @returns Promise with featured products array
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return apiFetchWithDefault<ApiResponse<Product[]>>(
    '/products/featured',
    { data: [] }, // Default response structure
    {
      revalidate: 1800, // 30 minutes cache
      tags: ['products', 'featured'],
    }
  ).then(response => response.data || []);
}

/**
 * Search products by text query
 *
 * Pattern: Graceful degradation with empty results
 *
 * @param query - Search query
 * @returns Promise with matching products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) {
    return [];
  }

  const response = await apiFetch<ApiResponse<Product[]>>(
    `/products/search?q=${encodeURIComponent(query)}`,
    {
      revalidate: 60, // 1 minute cache for search
      tags: ['products', 'search'],
    }
  );

  if (!response) {
    console.warn(`[Products] Search failed for query: "${query}"`);
    return [];
  }

  return response.data || [];
}

/**
 * Get product stock availability
 *
 * Pattern: Returns object with availability info
 *
 * @param productId - Product ID
 * @returns Promise with stock info or null
 */
export async function getProductStock(
  productId: number
): Promise<{ available: boolean; quantity: number } | null> {
  const response = await apiFetch<ApiResponse<{ available: boolean; quantity: number }>>(
    `/products/${productId}/stock`,
    {
      revalidate: 0, // No cache - always fresh stock data
      tags: [`product-stock-${productId}`],
    }
  );

  if (!response) {
    // Can't verify stock - assume unavailable for safety
    return { available: false, quantity: 0 };
  }

  return response.data;
}

/**
 * Get related products
 *
 * Pattern: Empty array on error (related products are optional)
 *
 * @param productId - Base product ID
 * @param limit - Maximum number of related products
 * @returns Promise with related products
 */
export async function getRelatedProducts(
  productId: number,
  limit: number = 4
): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<Product[]>>(
    `/products/${productId}/related?limit=${limit}`,
    {
      revalidate: 3600, // 1 hour cache
      tags: ['products', 'related', `product-${productId}`],
    }
  );

  // Related products are optional - empty array is fine
  if (!response) {
    return [];
  }

  return response.data || [];
}

// ====================================================================
// USAGE EXAMPLES IN SERVER COMPONENTS
// ====================================================================

/**
 * Example 1: Products page with filters
 */
export async function ProductsPageExample() {
  const products = await getProducts({ category_id: 1 });

  return (
    <div>
      <h1>Products</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id}>{product.name}</div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p>No hay productos disponibles</p>
          <p className="text-sm text-gray-500">
            El servidor puede estar temporalmente no disponible
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Product detail page with error boundary
 */
export async function ProductDetailPageExample({ id }: { id: string }) {
  const product = await getProductById(id);

  // Not found - show 404
  if (!product) {
    return (
      <div className="text-center py-12">
        <h1>Producto no encontrado</h1>
        <p>El producto solicitado no existe o no está disponible</p>
      </div>
    );
  }

  // Load related products (optional, won't break if fails)
  const relatedProducts = await getRelatedProducts(product.id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>

      {relatedProducts.length > 0 && (
        <div>
          <h2>Productos relacionados</h2>
          {relatedProducts.map(p => (
            <div key={p.id}>{p.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Multiple parallel requests
 */
export async function DashboardPageExample() {
  // Fetch in parallel - all handle errors gracefully
  const [products, featured, searchResults] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
    searchProducts('popular'),
  ]);

  return (
    <div>
      <section>
        <h2>Featured Products</h2>
        {featured.length > 0 ? (
          <div>{featured.length} featured products</div>
        ) : (
          <div>No featured products available</div>
        )}
      </section>

      <section>
        <h2>All Products</h2>
        {products.length > 0 ? (
          <div>{products.length} products available</div>
        ) : (
          <div>No products available</div>
        )}
      </section>

      <section>
        <h2>Popular Searches</h2>
        {searchResults.length > 0 && (
          <div>{searchResults.length} results</div>
        )}
      </section>
    </div>
  );
}

// ====================================================================
// TESTING
// ====================================================================

/**
 * Test scenarios:
 *
 * 1. Backend running:
 *    - All functions return real data
 *    - Pages render normally
 *
 * 2. Backend down:
 *    - All functions return empty arrays or null
 *    - Pages show fallback content
 *    - No error overlays
 *
 * 3. Network timeout:
 *    - Requests abort after 10s
 *    - Functions return gracefully
 *    - User sees fallback quickly
 *
 * 4. HTTP errors (404, 500):
 *    - Functions return null/empty
 *    - Appropriate fallback shown
 *    - Errors logged for monitoring
 */
