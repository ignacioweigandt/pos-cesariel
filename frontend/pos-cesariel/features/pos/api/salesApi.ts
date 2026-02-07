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

// React 19: Type-safe sale structures
export interface SaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  size?: string;
}

export interface CreateSaleData {
  sale_type: 'POS' | 'ECOMMERCE' | 'WHATSAPP';
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  items: SaleItem[];
  payment_method: string;
  notes?: string;
  delivery_address?: string;
  branch_id?: number;
}

export interface Sale {
  id: number;
  sale_number: string;
  sale_type: 'POS' | 'ECOMMERCE' | 'WHATSAPP';
  total_amount: number;
  order_status: string;
  payment_method: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  branch_id?: number;
  sale_items?: Array<{
    id: number;
    product_id: number;
    product?: { name: string };
    quantity: number;
    unit_price: number;
    total_price: number;
    size?: string;
  }>;
}

export const salesApi = {
  /** Obtener ventas con filtros opcionales */
  getSales: (params?: SalesParams) =>
    apiClient.get<Sale[]>('/sales/', { params }),

  /** Obtener venta por ID con items */
  getSale: (id: number) =>
    apiClient.get<Sale>(`/sales/${id}`),

  /** Crear nueva venta */
  createSale: (data: CreateSaleData) =>
    apiClient.post<Sale>('/sales/', data),

  /** Actualizar estado de venta (completed, cancelled, pending) */
  updateSaleStatus: (id: number, status: string) =>
    apiClient.put<Sale>(`/sales/${id}/status`, { new_status: status }),

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
