import { useState } from 'react';
import { api } from '@/lib/api';
import type { Brand } from '../types/inventory.types';

type CreateBrandData = {
  name: string;
  description?: string;
};

type UpdateBrandData = Partial<CreateBrandData>;

/** Hook para gestión de marcas (CRUD) */
export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // React Compiler handles optimization
  const loadBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/brands/');
      setBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al cargar marcas');
      }
      
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // React Compiler handles optimization
  const createBrand = async (brandData: CreateBrandData) => {
    try {
      const response = await api.post('/brands/', brandData);
      await loadBrands();
      return response.data;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  };

  // React Compiler handles optimization
  const updateBrand = async (brandId: number, brandData: UpdateBrandData) => {
    try {
      const response = await api.put(`/brands/${brandId}`, brandData);
      await loadBrands();
      return response.data;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  };

  // React Compiler handles optimization
  const deleteBrand = async (brandId: number) => {
    try {
      await api.delete(`/brands/${brandId}`);
      await loadBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  };

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
