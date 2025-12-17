/**
 * Reports API
 *
 * Handles reporting and analytics endpoints
 */

import { apiClient } from '@/shared/api/client';

export interface ReportParams {
  start_date: string;
  end_date: string;
  branch_id?: number;
}

/**
 * Reports API methods
 */
export const reportsApi = {
  /**
   * Get sales report for date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Comprehensive sales report
   */
  getSalesReport: (startDate: string, endDate: string) =>
    apiClient.get('/sales/reports/sales-report', {
      params: { start_date: startDate, end_date: endDate }
    }),

  /**
   * Get daily sales data
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Daily sales breakdown
   */
  getDailySales: (startDate: string, endDate: string) =>
    apiClient.get('/sales/reports/daily-sales', {
      params: { start_date: startDate, end_date: endDate }
    }),

  /**
   * Get top selling products
   * @param params - Report parameters
   * @returns Top products by revenue/quantity
   */
  getTopProducts: (params: ReportParams) =>
    apiClient.get('/sales/reports/top-products', { params }),

  /**
   * Get branch sales comparison
   * @param params - Report parameters
   * @returns Sales data by branch
   */
  getBranchSales: (params: ReportParams) =>
    apiClient.get('/sales/reports/branch-sales', { params }),

  /**
   * Export report as CSV
   * @param reportType - Type of report to export
   * @param params - Report parameters
   * @returns CSV file download
   */
  exportReportCSV: (reportType: string, params: ReportParams) =>
    apiClient.get(`/sales/reports/${reportType}/export`, {
      params,
      responseType: 'blob'
    }),
};
