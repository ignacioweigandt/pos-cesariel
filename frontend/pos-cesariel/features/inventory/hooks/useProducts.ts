import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Product } from '../types/inventory.types';

/**
 * useProducts Hook
 *
 * Manages product data and CRUD operations
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Solicitar un límite alto para obtener todos los productos
      // 10000 es suficiente para la mayoría de los casos de uso
      const response = await api.get('/products/', {
        params: {
          limit: 10000,
        },
      });
      setProducts(response.data);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error al cargar productos');
      // Set demo products if API fails
      setProducts([
        {
          id: 1,
          name: 'Producto Demo 1',
          price: 10.99,
          sku: 'DEMO001',
          stock_quantity: 50,
          min_stock: 10,
          category_id: 1,
          category: { id: 1, name: 'Categoría Demo' },
          is_active: true,
          has_sizes: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData: any) => {
    try {
      await api.post('/products/', productData);
      await loadProducts();
      toast.success('Producto creado exitosamente');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Error de conexión';
      toast.error(`Error: ${errorMessage}`);
      throw err;
    }
  }, [loadProducts]);

  const updateProduct = useCallback(async (id: number, productData: any) => {
    try {
      await api.put(`/products/${id}`, productData);
      await loadProducts();
      toast.success('Producto actualizado exitosamente');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Error de conexión';
      toast.error(`Error: ${errorMessage}`);
      throw err;
    }
  }, [loadProducts]);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
      toast.success('Producto eliminado exitosamente');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Error de conexión';
      toast.error(`Error: ${errorMessage}`);
      throw err;
    }
  }, [loadProducts]);

  const adjustStock = useCallback(async (id: number, stockData: { new_stock: number; notes: string }) => {
    try {
      await api.post(`/products/${id}/adjust-stock`, stockData);
      await loadProducts();
      toast.success('Stock actualizado exitosamente');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Error de conexión';
      toast.error(`Error: ${errorMessage}`);
      throw err;
    }
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
  };
}
