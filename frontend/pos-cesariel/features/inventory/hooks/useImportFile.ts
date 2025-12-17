import { useState, useCallback } from 'react';

/**
 * Hook para manejar selección y validación de archivos
 */
export function useImportFile() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const VALID_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = useCallback((file: File): string | null => {
    const fileName = file.name.toLowerCase();
    const isValidExtension = VALID_EXTENSIONS.some(ext => fileName.endsWith(ext));

    if (!isValidExtension) {
      return 'Formato de archivo no válido. Use archivos CSV o Excel (.xlsx, .xls)';
    }

    if (file.size > MAX_FILE_SIZE) {
      return `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    return null;
  }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setError(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  }, [validateFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return {
    selectedFile,
    error,
    handleFileSelect,
    clearFile,
    validExtensions: VALID_EXTENSIONS,
  };
}
