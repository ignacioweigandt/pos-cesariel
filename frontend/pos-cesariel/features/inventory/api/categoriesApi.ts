/** API de gestión de categorías de productos */

import { apiClient } from '@/shared/api/client';

export const categoriesApi = {
  getCategories: () =>
    apiClient.get('/categories/'),

  getCategory: (id: number) =>
    apiClient.get(`/categories/${id}`),

  createCategory: (data: any) =>
    apiClient.post('/categories/', data),

  updateCategory: (id: number, data: any) =>
    apiClient.put(`/categories/${id}`, data),

  deleteCategory: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};
