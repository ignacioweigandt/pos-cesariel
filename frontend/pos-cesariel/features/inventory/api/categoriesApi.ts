/**
 * Categories API
 *
 * Handles product category management
 */

import { apiClient } from '@/shared/api/client';

/**
 * Categories API methods
 */
export const categoriesApi = {
  /**
   * Get all categories
   * @returns List of all categories
   */
  getCategories: () =>
    apiClient.get('/categories/'),

  /**
   * Get single category by ID
   * @param id - Category ID
   * @returns Category details
   */
  getCategory: (id: number) =>
    apiClient.get(`/categories/${id}`),

  /**
   * Create new category
   * @param data - Category data
   * @returns Created category
   */
  createCategory: (data: any) =>
    apiClient.post('/categories/', data),

  /**
   * Update existing category
   * @param id - Category ID
   * @param data - Updated category data
   * @returns Updated category
   */
  updateCategory: (id: number, data: any) =>
    apiClient.put(`/categories/${id}`, data),

  /**
   * Delete category
   * @param id - Category ID
   * @returns Success response
   */
  deleteCategory: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};
