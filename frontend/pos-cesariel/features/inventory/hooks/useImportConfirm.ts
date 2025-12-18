import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/api/client';
import type { PreviewProduct } from './useImportPreview';

export interface ImportError {
  row: number;
  error: string;
}

export interface ImportResult {
  import_log_id: number;
  message: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  errors: ImportError[];
  preview_data?: PreviewProduct[];
}

/**
 * Hook para confirmar e importar productos
 */
export function useImportConfirm() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmImport = useCallback(
    async (products: PreviewProduct[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(
          '/products/import-confirm',
          { products }
        );

        const importResult: ImportResult = response.data;
        setResult(importResult);
        return importResult.successful_rows > 0;
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Error de conexión al servidor';
        setError(errorMessage);
        console.error('Import error:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    confirmImport,
    clearResult,
  };
}
