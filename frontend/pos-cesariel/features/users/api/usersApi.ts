/** API de gestión de usuarios y permisos */

import { apiClient } from '@/shared/api/client';

export interface UserParams {
  role?: string;
  branch_id?: number;
  is_active?: boolean;
}

export const usersApi = {
  getUsers: (params?: UserParams) =>
    apiClient.get('/users/', { params }),

  getUser: (id: number) =>
    apiClient.get(`/users/${id}`),

  createUser: (data: any) =>
    apiClient.post('/users/', data),

  updateUser: (id: number, data: any) =>
    apiClient.put(`/users/${id}`, data),

  deleteUser: (id: number) =>
    apiClient.delete(`/users/${id}`),

  resetPassword: (id: number) =>
    apiClient.post(`/users/${id}/reset-password`),
};
