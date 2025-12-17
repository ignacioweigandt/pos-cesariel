import { useState, useCallback } from 'react';
import { salesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Sale {
  id: number;
  sale_number: string;
  sale_type: string;
  customer_name?: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

/**
 * Hook para cargar ventas disponibles (e-commerce sin WhatsApp asociado)
 */
export function useAvailableSales(existingSaleIds: number[]) {
  const [availableSales, setAvailableSales] = useState<Sale[]>([]);

  const loadAvailableSales = useCallback(async () => {
    try {
      const response = await salesApi.getSales({ sale_type: 'ECOMMERCE', limit: 50 });
      const allSales = response.data;

      // Filtrar ventas que ya tienen registro WhatsApp
      const available = allSales.filter(
        (sale: Sale) => !existingSaleIds.includes(sale.id)
      );

      setAvailableSales(available);
    } catch (error) {
      console.error('Error loading available sales:', error);
      toast.error('Error cargando ventas disponibles');
    }
  }, [existingSaleIds]);

  return {
    availableSales,
    loadAvailableSales,
  };
}
