/** API de gestión de categorías de productos */

import { apiClient } from '@/shared/api/client';
import type { Category, CategoryFormData } from '../types/inventory.types';

// React 19: Type-safe category create/update data
export type CategoryCreateData = CategoryFormData;
export type CategoryUpdateData = Partial<CategoryFormData>;

export const categoriesApi = {
  getCategories: () =>
    apiClient.get<Category[]>('/categories/'),

  getCategory: (id: number) =>
    apiClient.get<Category>(`/categories/${id}`),

  createCategory: (data: CategoryCreateData) =>
    apiClient.post<Category>('/categories/', data),

  updateCategory: (id: number, data: CategoryUpdateData) =>
    apiClient.put<Category>(`/categories/${id}`, data),

  deleteCategory: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};
