import { useMemo } from 'react';
import type { WhatsAppSale } from './useWhatsAppSales';

export interface WhatsAppStats {
  total_sales: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
}

/**
 * Hook para calcular estadísticas de ventas WhatsApp
 */
export function useWhatsAppStats(sales: WhatsAppSale[]): WhatsAppStats {
  return useMemo(() => {
    const totalSales = sales.length;

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.sale?.total_amount?.toString() || '0'),
      0
    );

    const pendingOrders = sales.filter(
      sale => sale.sale?.order_status === 'PENDING'
    ).length;

    const completedOrders = sales.filter(
      sale => sale.sale?.order_status === 'DELIVERED'
    ).length;

    return {
      total_sales: totalSales,
      total_revenue: totalRevenue,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
    };
  }, [sales]);
}
