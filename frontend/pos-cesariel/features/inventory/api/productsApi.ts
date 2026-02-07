/** API de productos y gestión de inventario */

import { apiClient } from '@/shared/api/client';
import type { Product, Category, Brand, ProductFormData } from '../types/inventory.types';

export interface ProductParams {
  category_id?: number;
  show_in_ecommerce?: boolean;
  search?: string;
}

export interface AdjustStockData {
  new_stock: number;
  notes?: string;
}

// React 19: Type-safe product create/update data
export type ProductCreateData = Omit<ProductFormData, 'price' | 'stock_quantity' | 'category_id' | 'brand_id'> & {
  price: number;
  stock_quantity: number;
  category_id?: number;
  brand_id?: number;
};

export type ProductUpdateData = Partial<ProductCreateData>;

export const productsApi = {
  getProducts: (params?: ProductParams) =>
    apiClient.get<Product[]>('/products/', { params }),

  getProduct: (id: number) =>
    apiClient.get<Product>(`/products/${id}`),

  createProduct: (data: ProductCreateData) =>
    apiClient.post<Product>('/products/', data),

  updateProduct: (id: number, data: ProductUpdateData) =>
    apiClient.put<Product>(`/products/${id}`, data),

  deleteProduct: (id: number) =>
    apiClient.delete(`/products/${id}`),

  searchProducts: (query: string) =>
    apiClient.get<Product[]>('/products/search', { params: { q: query } }),

  getProductByBarcode: (barcode: string) =>
    apiClient.get<Product>(`/products/barcode/${barcode}`),

  adjustStock: (id: number, newStock: number, notes?: string) =>
    apiClient.post(`/products/${id}/adjust-stock`, { new_stock: newStock, notes }),

  getCategories: () =>
    apiClient.get<Category[]>('/categories/'),

  getBrands: () =>
    apiClient.get<Brand[]>('/brands/'),
};
