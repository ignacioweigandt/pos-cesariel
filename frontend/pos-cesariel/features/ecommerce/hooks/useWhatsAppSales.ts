import { useState, useCallback } from 'react';
import { ecommerceAdvancedApi } from '@/lib/api';

export interface WhatsAppSale {
  id: number;
  customer_name: string;
  customer_whatsapp: string;
  customer_address?: string;
  shipping_method: 'pickup' | 'delivery';
  shipping_cost: number;
  whatsapp_chat_url?: string;
  created_at: string;
  notes?: string;
  sale?: {
    id: number;
    sale_number: string;
    total_amount: number;
    order_status: string;
    payment_method: string;
    customer_email?: string;
    sale_items?: Array<{
      product?: { name: string };
      quantity: number;
      unit_price: number;
      total_price: number;
      size?: string;
    }>;
  };
}

/**
 * Hook para manejar ventas de WhatsApp
 */
export function useWhatsAppSales() {
  const [sales, setSales] = useState<WhatsAppSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ecommerceAdvancedApi.getWhatsAppSales();
      const salesData = response.data || [];
      setSales(salesData);
      return salesData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al cargar ventas WhatsApp';
      setError(errorMessage);
      console.error('Error loading WhatsApp sales:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSaleStatus = useCallback(async (saleId: number, status: string) => {
    try {
      await ecommerceAdvancedApi.updateSaleStatus(saleId, status);
      await fetchSales(); // Refresh data
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error actualizando estado';
      console.error('Error updating status:', errorMessage);
      throw err;
    }
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    fetchSales,
    updateSaleStatus,
  };
}
