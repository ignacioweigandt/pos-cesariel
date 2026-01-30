/** API de gestión de sucursales/locales */

import { apiClient } from '@/shared/api/client';

export const branchesApi = {
  getBranches: () =>
    apiClient.get('/branches/'),

  getBranch: (id: number) =>
    apiClient.get(`/branches/${id}`),

  createBranch: (data: any) =>
    apiClient.post('/branches/', data),

  updateBranch: (id: number, data: any) =>
    apiClient.put(`/branches/${id}`, data),

  deleteBranch: (id: number) =>
    apiClient.delete(`/branches/${id}`),
};
