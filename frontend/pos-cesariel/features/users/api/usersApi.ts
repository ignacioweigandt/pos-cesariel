/**
 * Users API
 *
 * Handles user management and permissions
 */

import { apiClient } from '@/shared/api/client';

export interface UserParams {
  role?: string;
  branch_id?: number;
  is_active?: boolean;
}

/**
 * Users API methods
 */
export const usersApi = {
  /**
   * Get all users with optional filters
   * @param params - Filter parameters (role, branch, active status)
   * @returns List of users
   */
  getUsers: (params?: UserParams) =>
    apiClient.get('/users', { params }),

  /**
   * Get single user by ID
   * @param id - User ID
   * @returns User details
   */
  getUser: (id: number) =>
    apiClient.get(`/users/${id}`),

  /**
   * Create new user
   * @param data - User data including credentials
   * @returns Created user
   */
  createUser: (data: any) =>
    apiClient.post('/users', data),

  /**
   * Update existing user
   * @param id - User ID
   * @param data - Updated user data
   * @returns Updated user
   */
  updateUser: (id: number, data: any) =>
    apiClient.put(`/users/${id}`, data),

  /**
   * Delete user
   * @param id - User ID
   * @returns Success response
   */
  deleteUser: (id: number) =>
    apiClient.delete(`/users/${id}`),

  /**
   * Reset user password
   * @param id - User ID
   * @returns New temporary password
   */
  resetPassword: (id: number) =>
    apiClient.post(`/users/${id}/reset-password`),
};
