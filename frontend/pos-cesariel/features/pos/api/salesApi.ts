/**
 * Sales API
 *
 * Handles sales transactions, reports, and dashboard statistics
 */

import { apiClient } from '@/shared/api/client';

export interface SalesParams {
  start_date?: string;
  end_date?: string;
  branch_id?: number;
  status?: string;
  sale_type?: 'POS' | 'ECOMMERCE';
}

export interface UpdateStatusData {
  new_status: string;
}

/**
 * Sales API methods
 */
export const salesApi = {
  /**
   * Get all sales with optional filters
   * @param params - Filter parameters (dates, branch, status)
   * @returns List of sales
   */
  getSales: (params?: SalesParams) =>
    apiClient.get('/sales/', { params }),

  /**
   * Get single sale by ID
   * @param id - Sale ID
   * @returns Sale details with items
   */
  getSale: (id: number) =>
    apiClient.get(`/sales/${id}/`),

  /**
   * Create new sale
   * @param data - Sale data including items
   * @returns Created sale
   */
  createSale: (data: any) =>
    apiClient.post('/sales/', data),

  /**
   * Update sale status
   * @param id - Sale ID
   * @param status - New status (completed, cancelled, pending)
   * @returns Updated sale
   */
  updateSaleStatus: (id: number, status: string) =>
    apiClient.put(`/sales/${id}/status/`, { new_status: status }),

  /**
   * Cancel/delete sale
   * @param id - Sale ID
   * @returns Success response
   */
  cancelSale: (id: number) =>
    apiClient.delete(`/sales/${id}/`),

  /**
   * Get dashboard statistics
   * @returns Dashboard stats (today's sales, revenue, etc.)
   */
  getDashboardStats: () =>
    apiClient.get('/sales/reports/dashboard/'),

  /**
   * Get sales report for date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Sales report data
   */
  getSalesReport: (startDate: string, endDate: string) =>
    apiClient.get('/sales/reports/sales-report/', {
      params: { start_date: startDate, end_date: endDate }
    }),
};
