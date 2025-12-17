/**
 * usePaymentMethods Hook
 *
 * Fetches available payment methods from the API and filters only active ones.
 * Ensures the POS only shows enabled payment methods from Settings.
 */

import { useState, useEffect } from 'react';
import { configurationApi } from '@/features/configuracion/api';

export type PaymentMethodCode = 'efectivo' | 'tarjeta' | 'transferencia';

export interface PaymentMethodConfig {
  id: number;
  name: string;
  code: string; // DB code: CASH, CARD, TRANSFER
  icon: string;
  is_active: boolean;
  requires_change: boolean;
  description?: string;
}

export interface POSPaymentMethod {
  code: PaymentMethodCode;
  name: string;
  icon: string;
  color: string; // For UI styling
  requires_change: boolean;
}

/**
 * Map DB codes to POS codes
 */
const DB_TO_POS_CODE: Record<string, PaymentMethodCode> = {
  'CASH': 'efectivo',
  'CARD': 'tarjeta',
  'TRANSFER': 'transferencia',
};

/**
 * Color scheme for each payment method
 */
const PAYMENT_COLORS: Record<PaymentMethodCode, string> = {
  'efectivo': 'green',
  'tarjeta': 'blue',
  'transferencia': 'purple',
};

export function usePaymentMethods() {
  const [methods, setMethods] = useState<POSPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await configurationApi.getPaymentMethods();
      const dbMethods: PaymentMethodConfig[] = response.data;

      // Filter only active methods and map to POS format
      const activeMethods = dbMethods
        .filter(method => method.is_active)
        .map(method => {
          const posCode = DB_TO_POS_CODE[method.code];
          if (!posCode) {
            console.warn(`Unknown payment method code: ${method.code}`);
            return null;
          }

          return {
            code: posCode,
            name: method.name,
            icon: method.icon,
            color: PAYMENT_COLORS[posCode],
            requires_change: method.requires_change,
          };
        })
        .filter((method): method is POSPaymentMethod => method !== null);

      setMethods(activeMethods);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      setError(err as Error);
      // Fallback to default methods if API fails
      setMethods([
        {
          code: 'efectivo',
          name: 'Efectivo',
          icon: '💵',
          color: 'green',
          requires_change: true,
        },
        {
          code: 'tarjeta',
          name: 'Tarjetas',
          icon: '💳',
          color: 'blue',
          requires_change: false,
        },
        {
          code: 'transferencia',
          name: 'Transferencia',
          icon: '🏦',
          color: 'purple',
          requires_change: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if a specific payment method is available
   */
  const isMethodAvailable = (code: PaymentMethodCode): boolean => {
    return methods.some(method => method.code === code);
  };

  /**
   * Get method by code
   */
  const getMethod = (code: PaymentMethodCode): POSPaymentMethod | undefined => {
    return methods.find(method => method.code === code);
  };

  return {
    methods,
    loading,
    error,
    isMethodAvailable,
    getMethod,
    reload: loadPaymentMethods,
  };
}
