import { useState, useMemo } from 'react';
import type { WhatsAppSale } from './useWhatsAppSales';

export interface WhatsAppFilters {
  status: string;
  shipping: string;
  dateRange: string;
  search: string;
}

const DEFAULT_FILTERS: WhatsAppFilters = {
  status: 'all',
  shipping: 'all',
  dateRange: 'all',
  search: '',
};

/**
 * Hook para manejar filtrado de ventas WhatsApp
 */
export function useWhatsAppFilters(sales: WhatsAppSale[]) {
  const [filters, setFilters] = useState<WhatsAppFilters>(DEFAULT_FILTERS);

  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    // Filtro de estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(sale => sale.sale?.order_status === filters.status);
    }

    // Filtro de método de envío
    if (filters.shipping !== 'all') {
      filtered = filtered.filter(sale => sale.shipping_method === filters.shipping);
    }

    // Filtro de rango de fechas
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= filterDate;
      });
    }

    // Filtro de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        sale =>
          sale.customer_name?.toLowerCase().includes(searchTerm) ||
          sale.customer_whatsapp?.includes(searchTerm) ||
          sale.sale?.sale_number?.toLowerCase().includes(searchTerm) ||
          sale.sale?.id?.toString().includes(searchTerm)
      );
    }

    return filtered;
  }, [sales, filters]);

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.shipping !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.search !== '';

  return {
    filters,
    setFilters,
    filteredSales,
    clearFilters,
    hasActiveFilters,
  };
}
