import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Category } from '../types/inventory.types';

/**
 * useCategories Hook
 *
 * Manages category data and CRUD operations
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Error al cargar categorías');
      // Set demo categories if API fails
      setCategories([
        {
          id: 1,
          name: 'Categoría Demo',
          description: 'Categoría de demostración',
        },
        {
          id: 2,
          name: 'Otra Categoría',
          description: 'Otra categoría de ejemplo',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData: any) => {
    try {
      await api.post('/categories/', categoryData);
      await loadCategories();
      alert('Categoría creada exitosamente');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Error de conexión';
      alert(`Error: ${errorMessage}`);
      throw err;
    }
  }, [loadCategories]);

  const updateCategory = useCallback(async (id: number, categoryData: any) => {
    try {
      await api.put(`/categories/${id}`, categoryData);
      await loadCategories();
      alert('Categoría actualizada exitosamente');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Error de conexión';
      alert(`Error: ${errorMessage}`);
      throw err;
    }
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
  };
}
