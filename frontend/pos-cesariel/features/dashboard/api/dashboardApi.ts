/** API de dashboard con stats, alertas de stock y actividad reciente */

import { apiClient } from '@/shared/api/client';

export const dashboardApi = {
  getDashboardStats: () =>
    apiClient.get('/sales/reports/dashboard'),

  getTodaySales: () =>
    apiClient.get('/sales', {
      params: {
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      }
    }),

  getLowStockAlerts: () =>
    apiClient.get('/products/low-stock'),

  getRecentActivity: () =>
    apiClient.get('/dashboard/recent-activity'),
};
