/** API de reportes y analytics de ventas */

import { apiClient } from '@/shared/api/client';

export interface ReportParams {
  start_date: string;
  end_date: string;
  branch_id?: number;
}

export const reportsApi = {
  getSalesReport: (startDate: string, endDate: string) =>
    apiClient.get('/sales/reports/sales-report', {
      params: { start_date: startDate, end_date: endDate }
    }),

  getDailySales: (startDate: string, endDate: string) =>
    apiClient.get('/sales/reports/daily-sales', {
      params: { start_date: startDate, end_date: endDate }
    }),

  getTopProducts: (params: ReportParams) =>
    apiClient.get('/sales/reports/top-products', { params }),

  getBranchSales: (params: ReportParams) =>
    apiClient.get('/sales/reports/branch-sales', { params }),

  exportReportCSV: (reportType: string, params: ReportParams) =>
    apiClient.get(`/sales/reports/${reportType}/export`, {
      params,
      responseType: 'blob'
    }),
};
