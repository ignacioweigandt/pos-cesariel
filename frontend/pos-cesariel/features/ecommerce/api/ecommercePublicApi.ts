/**
 * E-commerce Public API
 *
 * Public-facing e-commerce endpoints (no authentication required)
 * Used by the customer-facing e-commerce site
 */

import { publicApiClient } from '@/shared/api/client';

export interface PublicProductParams {
  category_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
}

/**
 * E-commerce Public API methods (No authentication required)
 */
export const ecommercePublicApi = {
  /**
   * Get all public products (visible in e-commerce)
   * @param params - Filter parameters
   * @returns List of products
   */
  getProducts: (params?: PublicProductParams) =>
    publicApiClient.get('/ecommerce/products', { params }),

  /**
   * Get single product by ID
   * @param id - Product ID
   * @returns Product details
   */
  getProduct: (id: number) =>
    publicApiClient.get(`/ecommerce/products/${id}`),

  /**
   * Get available sizes for a product
   * @param id - Product ID
   * @returns Product sizes with availability
   */
  getProductSizes: (id: number) =>
    publicApiClient.get(`/ecommerce/products/${id}/sizes`),

  /**
   * Get all public categories
   * @returns List of categories
   */
  getCategories: () =>
    publicApiClient.get('/ecommerce/categories'),

  /**
   * Get active store banners
   * @returns List of active banners
   */
  getBanners: () =>
    publicApiClient.get('/ecommerce/banners'),

  /**
   * Get active social media links
   * @returns List of social media configs
   */
  getSocialMedia: () =>
    publicApiClient.get('/ecommerce/social-media'),

  /**
   * Get store configuration
   * @returns Store config (name, description, contact)
   */
  getStoreConfig: () =>
    publicApiClient.get('/ecommerce/store-config'),

  /**
   * Create public sale (customer purchase)
   * @param data - Sale data with customer info and items
   * @returns Created sale
   */
  createSale: (data: any) =>
    publicApiClient.post('/ecommerce/sales', data),
};
