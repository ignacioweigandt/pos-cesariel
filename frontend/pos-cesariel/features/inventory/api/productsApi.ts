/** API de productos y gestión de inventario */

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

export const productsApi = {
  getProducts: (params?: ProductParams) =>
    apiClient.get('/products/', { params }),

  getProduct: (id: number) =>
    apiClient.get(`/products/${id}`),

  createProduct: (data: any) =>
    apiClient.post('/products/', data),

  updateProduct: (id: number, data: any) =>
    apiClient.put(`/products/${id}`, data),

  deleteProduct: (id: number) =>
    apiClient.delete(`/products/${id}`),

  searchProducts: (query: string) =>
    apiClient.get('/products/search', { params: { q: query } }),

  getProductByBarcode: (barcode: string) =>
    apiClient.get(`/products/barcode/${barcode}`),

  adjustStock: (id: number, newStock: number, notes?: string) =>
    apiClient.post(`/products/${id}/adjust-stock`, { new_stock: newStock, notes }),

  getCategories: () =>
    apiClient.get('/categories/'),

  getBrands: () =>
    apiClient.get('/brands/'),
};
