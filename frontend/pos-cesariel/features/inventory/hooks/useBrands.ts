import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Brand } from '../types/inventory.types';

/**
 * useBrands Hook
 *
 * Manages brand data fetching from the backend using the brands table
 */
export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/brands/');
      setBrands(response.data || []);
    } catch (err: any) {
      console.error('Error fetching brands:', err);
      setError(err.message || 'Error al cargar marcas');
      // Set empty array if API fails
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBrand = useCallback(async (brandData: any) => {
    try {
      const response = await api.post('/brands/', brandData);
      await loadBrands(); // Reload brands after creating
      return response.data;
    } catch (err: any) {
      console.error('Error creating brand:', err);
      throw err;
    }
  }, [loadBrands]);

  const updateBrand = useCallback(async (brandId: number, brandData: any) => {
    try {
      const response = await api.put(`/brands/${brandId}`, brandData);
      await loadBrands(); // Reload brands after updating
      return response.data;
    } catch (err: any) {
      console.error('Error updating brand:', err);
      throw err;
    }
  }, [loadBrands]);

  const deleteBrand = useCallback(async (brandId: number) => {
    try {
      await api.delete(`/brands/${brandId}`);
      await loadBrands(); // Reload brands after deleting
    } catch (err: any) {
      console.error('Error deleting brand:', err);
      throw err;
    }
  }, [loadBrands]);

  return {
    brands,
    loading,
    error,
    loadBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}
