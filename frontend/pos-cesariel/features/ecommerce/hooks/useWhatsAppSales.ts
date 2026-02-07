/** Hook para gestión de ventas por WhatsApp con actualización de estado */

import { useState } from 'react';
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

// React 19: Type for API error response
interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export function useWhatsAppSales() {
  const [sales, setSales] = useState<WhatsAppSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React 19: No useCallback needed - React Compiler optimizes automatically
  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ecommerceAdvancedApi.getWhatsAppSales();
      const salesData = response.data || [];
      setSales(salesData);
      return salesData;
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.detail || 'Error al cargar ventas WhatsApp';
      setError(errorMessage);
      console.error('Error loading WhatsApp sales:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateSaleStatus = async (saleId: number, status: string) => {
    try {
      await ecommerceAdvancedApi.updateSaleStatus(saleId, status);
      await fetchSales();
      return true;
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.detail || 'Error actualizando estado';
      console.error('Error updating status:', errorMessage);
      throw err;
    }
  };

  return {
    sales,
    loading,
    error,
    fetchSales,
    updateSaleStatus,
  };
}
