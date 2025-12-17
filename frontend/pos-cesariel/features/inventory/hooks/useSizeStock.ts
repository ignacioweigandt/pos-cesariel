import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface SizeStock {
  size: string;
  stock_quantity: number;
}

export interface AvailableSizesResponse {
  product_id: number;
  product_name: string;
  has_sizes: boolean;
  category_name?: string;
  category_type?: string;
  size_type_label?: string;
  available_sizes: SizeStock[];
  all_valid_sizes: string[];
}

// Talles disponibles según categoría (fallback)
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = Array.from({ length: 11 }, (_, i) => (35 + i).toString());

/**
 * Hook para manejar stock de talles de un producto
 */
export function useSizeStock(productId: number | null, categoryName?: string) {
  const [sizes, setSizes] = useState<SizeStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSizesData, setAvailableSizesData] =
    useState<AvailableSizesResponse | null>(null);

  const getAvailableSizes = useCallback(() => {
    if (availableSizesData && availableSizesData.all_valid_sizes) {
      return availableSizesData.all_valid_sizes;
    }

    // Fallback
    if (!categoryName) return CLOTHING_SIZES;

    const name = categoryName.toLowerCase();
    if (
      name.includes('calzado') ||
      name.includes('zapato') ||
      name.includes('zapatilla')
    ) {
      return SHOE_SIZES;
    }
    return CLOTHING_SIZES;
  }, [availableSizesData, categoryName]);

  const loadSizes = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/products/${productId}/available-sizes`);
      const availableData = response.data;
      setAvailableSizesData(availableData);

      if (availableData.has_sizes && availableData.available_sizes) {
        setSizes(availableData.available_sizes);
      } else if (availableData.has_sizes && availableData.all_valid_sizes) {
        setSizes(
          availableData.all_valid_sizes.map((size: string) => ({
            size,
            stock_quantity: 0,
          }))
        );
      } else {
        setSizes([]);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Error al cargar los talles del producto';
      setError(errorMessage);
      console.error('Load sizes error:', err);

      // Fallback
      try {
        const response = await api.get(`/products/${productId}/sizes`);
        const data = response.data;

        if (data.has_sizes) {
          setSizes(data.sizes || []);
        } else {
          const availableSizes = getAvailableSizes();
          setSizes(
            availableSizes.map((size) => ({ size, stock_quantity: 0 }))
          );
        }
      } catch (fallbackErr) {
        console.error('Fallback load error:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [productId, getAvailableSizes]);

  const updateSizeStock = useCallback((size: string, change: number) => {
    setSizes((prevSizes) => {
      const existingIndex = prevSizes.findIndex((s) => s.size === size);

      if (existingIndex >= 0) {
        const newSizes = [...prevSizes];
        newSizes[existingIndex] = {
          ...newSizes[existingIndex],
          stock_quantity: Math.max(
            0,
            newSizes[existingIndex].stock_quantity + change
          ),
        };
        return newSizes;
      } else {
        return [...prevSizes, { size, stock_quantity: Math.max(0, change) }];
      }
    });
  }, []);

  const setSizeStockValue = useCallback((size: string, stock: number) => {
    setSizes((prevSizes) => {
      const existingIndex = prevSizes.findIndex((s) => s.size === size);

      if (existingIndex >= 0) {
        const newSizes = [...prevSizes];
        newSizes[existingIndex] = {
          ...newSizes[existingIndex],
          stock_quantity: Math.max(0, stock),
        };
        return newSizes;
      } else {
        return [...prevSizes, { size, stock_quantity: Math.max(0, stock) }];
      }
    });
  }, []);

  const getSizeStock = useCallback(
    (size: string): number => {
      const sizeData = sizes.find((s) => s.size === size);
      return sizeData ? sizeData.stock_quantity : 0;
    },
    [sizes]
  );

  const bulkAdjustStock = useCallback((adjustment: number) => {
    setSizes((prevSizes) =>
      prevSizes.map((size) => ({
        ...size,
        stock_quantity: Math.max(0, size.stock_quantity + adjustment),
      }))
    );
  }, []);

  const resetAllStock = useCallback(() => {
    setSizes((prevSizes) =>
      prevSizes.map((size) => ({
        ...size,
        stock_quantity: 0,
      }))
    );
  }, []);

  const saveSizes = useCallback(async () => {
    if (!productId) return false;

    setSaving(true);
    setError(null);

    try {
      await api.post(`/products/${productId}/sizes`, {
        sizes: sizes.filter((s) => s.stock_quantity > 0),
      });

      alert('Stock de talles actualizado correctamente');
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Error al actualizar stock de talles';
      setError(errorMessage);
      console.error('Save sizes error:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [productId, sizes]);

  const reset = useCallback(() => {
    setSizes([]);
    setError(null);
    setAvailableSizesData(null);
  }, []);

  return {
    sizes,
    loading,
    saving,
    error,
    availableSizesData,
    loadSizes,
    updateSizeStock,
    setSizeStockValue,
    getSizeStock,
    bulkAdjustStock,
    resetAllStock,
    saveSizes,
    reset,
    getAvailableSizes,
  };
}
