// Products API - Server-side data fetching
import { apiFetch } from './client';
import type { ApiPublicProduct, ApiResponse, Product } from '@/types';
import { mapApiPublicProductToFrontend } from '../mappers';

export interface GetProductsParams {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
  skip?: number;
}

/**
 * Fetch products from backend (Server Component compatible)
 *
 * Supports filtering by category, brand, search, price range, and stock
 * Uses Next.js fetch cache with 5-minute revalidation
 */
export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  // Build query string
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append('category', params.category);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.search) queryParams.append('search', params.search);
  if (params.minPrice !== undefined) queryParams.append('min_price', params.minPrice.toString());
  if (params.maxPrice !== undefined) queryParams.append('max_price', params.maxPrice.toString());
  if (params.inStock) queryParams.append('in_stock', 'true');
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.skip) queryParams.append('skip', params.skip.toString());

  const queryString = queryParams.toString();
  const endpoint = `/ecommerce/products${queryString ? `?${queryString}` : ''}`;

  const response = await apiFetch<ApiResponse<ApiPublicProduct[]>>(
    endpoint,
    {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ['products'],
    }
  );

  // Backend unavailable or error occurred
  if (!response || !response.data) {
    console.info('[Products] ℹ️  Using fallback mode - No products available');
    return [];
  }

  // Filter only products that should be shown in ecommerce and are active
  const ecommerceProducts = response.data.filter(
    product => product.show_in_ecommerce && product.is_active
  );

  // Map to frontend format
  return ecommerceProducts.map(mapApiPublicProductToFrontend);
}

/**
 * Fetch single product by ID (Server Component compatible)
 *
 * Fetches product details including images and sizes from separate endpoints
 * Note: Backend inconsistency - main endpoint returns product directly,
 * not wrapped in { data: ... } like /ecommerce/products does
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    // Fetch product, images, and sizes in parallel
    const [productResponse, imagesResponse, sizesResponse] = await Promise.all([
      apiFetch<ApiPublicProduct | ApiResponse<ApiPublicProduct>>(
        `/ecommerce/products/${id}`,
        {
          revalidate: 300,
          tags: ['products', `product-${id}`],
        }
      ),
      apiFetch<ApiResponse<Array<{ id: number; image_url: string; order: number }>>>(
        `/ecommerce/products/${id}/images`,
        {
          revalidate: 300,
          tags: ['products', `product-${id}-images`],
        }
      ),
      apiFetch<{ available_sizes: Array<{ size: string; stock: number }> }>(
        `/ecommerce/products/${id}/sizes`,
        {
          revalidate: 300,
          tags: ['products', `product-${id}-sizes`],
        }
      ),
    ]);

    if (!productResponse) {
      return null;
    }

    // Handle both response formats for product
    const product = 'data' in productResponse ? productResponse.data : productResponse;

    if (!product || typeof product !== 'object') {
      return null;
    }

    // Map product to frontend format
    const mappedProduct = mapApiPublicProductToFrontend(product as ApiPublicProduct);

    // Add real images if available
    if (imagesResponse?.data && imagesResponse.data.length > 0) {
      mappedProduct.images = imagesResponse.data
        .sort((a, b) => a.order - b.order)
        .map(img => img.image_url)
        .slice(0, 3); // Max 3 images
    }

    // Add real sizes if available
    if (sizesResponse?.available_sizes && sizesResponse.available_sizes.length > 0) {
      mappedProduct.sizes = sizesResponse.available_sizes.map(s => s.size);
      // Calculate total stock from all sizes
      const totalStock = sizesResponse.available_sizes.reduce((sum, s) => sum + s.stock, 0);
      mappedProduct.inStock = totalStock > 0;
    }

    return mappedProduct;
  } catch (error) {
    console.error(`[Products] Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Fetch available categories from backend
 * Gets real categories from the database
 */
export async function getCategories(): Promise<Array<{ id: number; name: string }>> {
  const response = await apiFetch<ApiResponse<Array<{ id: number; name: string; is_active: boolean }>>>(
    '/ecommerce/categories',
    {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ['categories'],
    }
  );

  if (!response || !response.data) {
    return [];
  }

  // Filter active categories and return sorted by name
  return response.data
    .filter(cat => cat.is_active)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Fetch available brands from backend
 * Gets unique brands from products in the database
 */
export async function getBrands(): Promise<Array<{ name: string }>> {
  const response = await apiFetch<ApiResponse<Array<{ name: string }>>>(
    '/ecommerce/brands',
    {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ['brands'],
    }
  );

  if (!response || !response.data) {
    return [];
  }

  // Return brands sorted alphabetically
  return response.data.sort((a, b) => a.name.localeCompare(b.name));
}
