/**
 * Branches API
 *
 * Handles branch/store location management
 */

import { apiClient } from '@/shared/api/client';

/**
 * Branches API methods
 */
export const branchesApi = {
  /**
   * Get all branches
   * @returns List of all branches
   */
  getBranches: () =>
    apiClient.get('/branches/'),

  /**
   * Get single branch by ID
   * @param id - Branch ID
   * @returns Branch details
   */
  getBranch: (id: number) =>
    apiClient.get(`/branches/${id}`),

  /**
   * Create new branch
   * @param data - Branch data (name, address, contact info)
   * @returns Created branch
   */
  createBranch: (data: any) =>
    apiClient.post('/branches/', data),

  /**
   * Update existing branch
   * @param id - Branch ID
   * @param data - Updated branch data
   * @returns Updated branch
   */
  updateBranch: (id: number, data: any) =>
    apiClient.put(`/branches/${id}`, data),

  /**
   * Delete branch
   * @param id - Branch ID
   * @returns Success response
   */
  deleteBranch: (id: number) =>
    apiClient.delete(`/branches/${id}`),
};
