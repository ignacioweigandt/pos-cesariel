/** API de gestión de usuarios y permisos */

import { apiClient } from '@/shared/api/client';
import type { User, UserFormData } from '../types/users.types';

export interface UserParams {
  role?: string;
  branch_id?: number;
  is_active?: boolean;
}

// React 19: Type-safe user create/update data
export type UserCreateData = Omit<UserFormData, 'is_active'> & { is_active?: boolean };
export type UserUpdateData = Partial<UserCreateData>;

export const usersApi = {
  getUsers: (params?: UserParams) =>
    apiClient.get<User[]>('/users/', { params }),

  getUser: (id: number) =>
    apiClient.get<User>(`/users/${id}`),

  createUser: (data: UserCreateData) =>
    apiClient.post<User>('/users/', data),

  updateUser: (id: number, data: UserUpdateData) =>
    apiClient.put<User>(`/users/${id}`, data),

  deleteUser: (id: number) =>
    apiClient.delete(`/users/${id}`),

  resetPassword: (id: number) =>
    apiClient.post(`/users/${id}/reset-password`),
};
