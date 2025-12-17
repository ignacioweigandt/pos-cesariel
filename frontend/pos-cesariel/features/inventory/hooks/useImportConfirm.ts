import { useState, useCallback } from 'react';
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
        const token = localStorage.getItem('token');
        const response = await fetch(
          'http://localhost:8000/products/import-confirm',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ products }),
          }
        );

        if (response.ok) {
          const importResult: ImportResult = await response.json();
          setResult(importResult);
          return importResult.successful_rows > 0;
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Error al importar productos');
          return false;
        }
      } catch (err) {
        setError('Error de conexión al servidor');
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
