/** API de gestión de sucursales/locales */

import { apiClient } from '@/shared/api/client';
import type { Branch, BranchFormData } from '../types/users.types';

// React 19: Type-safe branch create/update data
export type BranchCreateData = BranchFormData;
export type BranchUpdateData = Partial<BranchFormData>;

export const branchesApi = {
  getBranches: () =>
    apiClient.get<Branch[]>('/branches/'),

  getBranch: (id: number) =>
    apiClient.get<Branch>(`/branches/${id}`),

  createBranch: (data: BranchCreateData) =>
    apiClient.post<Branch>('/branches/', data),

  updateBranch: (id: number, data: BranchUpdateData) =>
    apiClient.put<Branch>(`/branches/${id}`, data),

  deleteBranch: (id: number) =>
    apiClient.delete(`/branches/${id}`),
};
