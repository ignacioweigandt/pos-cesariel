import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

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

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/products/import-preview', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setPreviewData(result.preview_data || []);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al procesar el archivo');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al servidor');
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
