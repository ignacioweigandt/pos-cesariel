import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/api/client';

export interface PreviewProduct {
  id?: number;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock_quantity: number;
  category_id?: number;
  category_name?: string;
  detected_category?: string;
  min_stock: number;
  has_sizes: boolean;
}

/**
 * Hook para manejar la vista previa de productos
 */
export function useImportPreview() {
  const [previewData, setPreviewData] = useState<PreviewProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async (file: File): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/products/import-preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      setPreviewData(result.preview_data || []);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error de conexión al servidor';
      setError(errorMessage);
      console.error('Preview error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(
    (index: number, field: string, value: any) => {
      setPreviewData((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const enhancePreviewData = useCallback(
    (
      data: PreviewProduct[],
      fileCategory: string | null,
      detectCategory: (name: string) => string | null,
      hasSize: (name: string) => boolean,
      getCategoryId: (name: string | null) => number | null
    ) => {
      const enhanced = data.map((product) => {
        const productCategory = detectCategory(product.name);
        const detectedCategory = productCategory || fileCategory;

        return {
          ...product,
          stock_quantity: 0, // Stock inicial en 0
          min_stock: 1,
          category_id: getCategoryId(detectedCategory),
          detected_category: detectedCategory,
          has_sizes: hasSize(product.name),
        };
      });

      setPreviewData(enhanced);
    },
    []
  );

  const clearPreview = useCallback(() => {
    setPreviewData([]);
    setError(null);
  }, []);

  const stats = {
    total: previewData.length,
    withSizes: previewData.filter((p) => p.has_sizes).length,
    categorized: previewData.filter((p) => p.detected_category).length,
    totalStock: previewData.reduce((sum, p) => sum + p.stock_quantity, 0),
  };

  return {
    previewData,
    loading,
    error,
    stats,
    loadPreview,
    updateProduct,
    enhancePreviewData,
    clearPreview,
  };
}
