import { useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Product } from '../types/inventory.types';

// Type-safe product data based on backend schema
type CreateProductData = {
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  cost?: number;
  category_id: number;
  brand_id?: number;
  min_stock: number;
  has_sizes: boolean;
  show_in_ecommerce: boolean;
  description?: string;
};

type UpdateProductData = Partial<CreateProductData>;

type StockAdjustmentData = {
  new_stock: number;
  notes: string;
};

/** Hook principal para CRUD de productos con fallback a datos demo */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // React Compiler handles optimization - no useCallback needed
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/', {
        params: { limit: 10000 },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al cargar productos');
      }
      
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
  };

  // React Compiler handles optimization
  const createProduct = async (productData: CreateProductData) => {
    try {
      await api.post('/products/', productData);
      await loadProducts();
      toast.success('Producto creado exitosamente');
      return true;
    } catch (error) {
      let errorMessage = 'Error de conexión';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = axiosError.response?.data?.detail || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };

  // React Compiler handles optimization
  const updateProduct = async (id: number, productData: UpdateProductData) => {
    try {
      await api.put(`/products/${id}`, productData);
      await loadProducts();
      toast.success('Producto actualizado exitosamente');
      return true;
    } catch (error) {
      let errorMessage = 'Error de conexión';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = axiosError.response?.data?.detail || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };

  // React Compiler handles optimization
  const deleteProduct = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
      toast.success('Producto eliminado exitosamente');
      return true;
    } catch (error) {
      let errorMessage = 'Error de conexión';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = axiosError.response?.data?.detail || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };

  // React Compiler handles optimization
  const adjustStock = async (id: number, stockData: StockAdjustmentData) => {
    try {
      await api.post(`/products/${id}/adjust-stock`, stockData);
      await loadProducts();
      toast.success('Stock actualizado exitosamente');
      return true;
    } catch (error) {
      let errorMessage = 'Error de conexión';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = axiosError.response?.data?.detail || axiosError.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };

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
