import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { MultiBranchProduct } from '../types/inventory.types';

/**
 * useMultiBranchStock Hook
 *
 * Manages multi-branch stock data
 */
export function useMultiBranchStock() {
  const [multiBranchProducts, setMultiBranchProducts] = useState<MultiBranchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMultiBranchStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/multi-branch-stock');
      setMultiBranchProducts(response.data);
    } catch (err: any) {
      console.error('Error fetching multi-branch products:', err);
      setError(err.message || 'Error al cargar stock multi-sucursal');
      setMultiBranchProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    multiBranchProducts,
    loading,
    error,
    loadMultiBranchStock,
  };
}
