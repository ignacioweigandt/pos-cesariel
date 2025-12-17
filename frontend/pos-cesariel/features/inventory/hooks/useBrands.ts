import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

/**
 * useBrands Hook
 *
 * Manages brand data fetching from the backend
 */
export function useBrands() {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/brands');
      setBrands(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching brands:', err);
      setError(err.message || 'Error al cargar marcas');
      // Set empty array if API fails
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    brands,
    loading,
    error,
    loadBrands,
  };
}
