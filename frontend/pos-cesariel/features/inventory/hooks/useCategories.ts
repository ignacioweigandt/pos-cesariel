import { useState } from 'react';
import { api } from '@/lib/api';
import type { Category } from '../types/inventory.types';

type CreateCategoryData = {
  name: string;
  description?: string;
};

type UpdateCategoryData = Partial<CreateCategoryData>;

/** Hook para gestión de categorías con fallback a datos demo */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // React Compiler handles optimization
  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al cargar categorías');
      }
      
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
  };

  // React Compiler handles optimization
  const createCategory = async (categoryData: CreateCategoryData) => {
    try {
      await api.post('/categories/', categoryData);
      await loadCategories();
      alert('Categoría creada exitosamente');
    } catch (error) {
      let errorMessage = 'Error de conexión';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = axiosError.response?.data?.detail || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
      throw error;
    }
  };

  // React Compiler handles optimization
  const updateCategory = async (id: number, categoryData: UpdateCategoryData) => {
    try {
      await api.put(`/categories/${id}`, categoryData);
      await loadCategories();
      alert('Categoría actualizada exitosamente');
    } catch (error) {
      let errorMessage = 'Error de conexión';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = axiosError.response?.data?.detail || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
      throw error;
    }
  };

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
  };
}
