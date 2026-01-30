/** API de ventas: transacciones, reportes y estadísticas */

import { apiClient } from '@/shared/api/client';

export interface SalesParams {
  start_date?: string;
  end_date?: string;
  branch_id?: number;
  status?: string;
  sale_type?: 'POS' | 'ECOMMERCE';
  /** Filtro por asociación WhatsApp: true (con), false (sin), undefined (todas) */
  has_whatsapp_sale?: boolean;
}

export interface UpdateStatusData {
  new_status: string;
}

export const salesApi = {
  /** Obtener ventas con filtros opcionales */
  getSales: (params?: SalesParams) =>
    apiClient.get('/sales/', { params }),

  /** Obtener venta por ID con items */
  getSale: (id: number) =>
    apiClient.get(`/sales/${id}`),

  /** Crear nueva venta */
  createSale: (data: any) =>
    apiClient.post('/sales/', data),

  /** Actualizar estado de venta (completed, cancelled, pending) */
  updateSaleStatus: (id: number, status: string) =>
    apiClient.put(`/sales/${id}/status`, { new_status: status }),

  /** Cancelar/eliminar venta */
  cancelSale: (id: number) =>
    apiClient.delete(`/sales/${id}`),

  /** Obtener estadísticas del dashboard */
  getDashboardStats: () =>
    apiClient.get('/sales/reports/dashboard'),

  /** Obtener reporte de ventas por rango de fechas */
  getSalesReport: (startDate: string, endDate: string) =>
    apiClient.get('/sales/reports/sales-report', {
      params: { start_date: startDate, end_date: endDate }
    }),
};
