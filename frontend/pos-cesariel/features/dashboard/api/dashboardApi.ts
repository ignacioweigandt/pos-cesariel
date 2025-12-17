/**
 * Dashboard API
 *
 * Handles dashboard statistics and real-time data
 */

import { apiClient } from '@/shared/api/client';

/**
 * Dashboard API methods
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @returns Dashboard stats (today's revenue, sales count, trends)
   */
  getDashboardStats: () =>
    apiClient.get('/sales/reports/dashboard'),

  /**
   * Get today's sales
   * @returns List of today's sales
   */
  getTodaySales: () =>
    apiClient.get('/sales', {
      params: {
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      }
    }),

  /**
   * Get low stock alerts
   * @returns Products with low stock levels
   */
  getLowStockAlerts: () =>
    apiClient.get('/products/low-stock'),

  /**
   * Get recent activity
   * @returns Recent sales and inventory changes
   */
  getRecentActivity: () =>
    apiClient.get('/dashboard/recent-activity'),
};
