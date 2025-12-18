/**
 * Products API
 *
 * Handles all product-related operations including inventory management
 */

import { apiClient } from '@/shared/api/client';

export interface ProductParams {
  category_id?: number;
  show_in_ecommerce?: boolean;
  search?: string;
}

export interface AdjustStockData {
  new_stock: number;
  notes?: string;
}

/**
 * Products API methods
 */
export const productsApi = {
  /**
   * Get all products with optional filters
   * @param params - Filter parameters (category, visibility, search)
   * @returns List of products
   */
  getProducts: (params?: ProductParams) =>
    apiClient.get('/products', { params }),

  /**
   * Get single product by ID
   * @param id - Product ID
   * @returns Product details
   */
  getProduct: (id: number) =>
    apiClient.get(`/products/${id}`),

  /**
   * Create new product
   * @param data - Product data
   * @returns Created product
   */
  createProduct: (data: any) =>
    apiClient.post('/products', data),

  /**
   * Update existing product
   * @param id - Product ID
   * @param data - Updated product data
   * @returns Updated product
   */
  updateProduct: (id: number, data: any) =>
    apiClient.put(`/products/${id}`, data),

  /**
   * Delete product
   * @param id - Product ID
   * @returns Success response
   */
  deleteProduct: (id: number) =>
    apiClient.delete(`/products/${id}`),

  /**
   * Search products by query
   * @param query - Search query string
   * @returns Matching products
   */
  searchProducts: (query: string) =>
    apiClient.get('/products/search', { params: { q: query } }),

  /**
   * Get product by barcode
   * @param barcode - Product barcode
   * @returns Product matching the barcode
   */
  getProductByBarcode: (barcode: string) =>
    apiClient.get(`/products/barcode/${barcode}`),

  /**
   * Adjust product stock level
   * @param id - Product ID
   * @param newStock - New stock quantity
   * @param notes - Optional adjustment notes
   * @returns Updated product
   */
  adjustStock: (id: number, newStock: number, notes?: string) =>
    apiClient.post(`/products/${id}/adjust-stock`, { new_stock: newStock, notes }),
};
