'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import type { ImportResult } from '@/features/inventory/hooks/useImportConfirm';

interface ResultStepProps {
  result: ImportResult;
  onReset: () => void;
  onClose: () => void;
}

/**
 * Paso 3: Resultados de importación
 */
export function ResultStep({ result, onReset, onClose }: ResultStepProps) {
  return (
    <>
      {/* Success Message */}
      <div className="p-4 bg-green-50 rounded-md mb-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
          <div className="text-sm text-green-800 font-medium">
            {result.message}
          </div>
        </div>
      </div>

      {/* Import Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-md text-center">
          <div className="text-2xl font-bold text-blue-600">
            {result.total_rows}
          </div>
          <div className="text-xs text-blue-800">Total Filas</div>
        </div>
        <div className="bg-green-50 p-3 rounded-md text-center">
          <div className="text-2xl font-bold text-green-600">
            {result.successful_rows}
          </div>
          <div className="text-xs text-green-800">Exitosos</div>
        </div>
        <div className="bg-red-50 p-3 rounded-md text-center">
          <div className="text-2xl font-bold text-red-600">
            {result.failed_rows}
          </div>
          <div className="text-xs text-red-800">Fallidos</div>
        </div>
      </div>

      {/* Error Details */}
      {result.errors && result.errors.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-md mb-6">
          <h5 className="text-sm font-medium text-yellow-800 mb-2">
            Errores encontrados:
          </h5>
          <div className="max-h-32 overflow-y-auto">
            {result.errors.map((error, index) => (
              <div key={index} className="text-xs text-yellow-700 mb-1">
                Fila {error.row}: {error.error}
              </div>
            ))}
          </div>
          {result.failed_rows > result.errors.length && (
            <div className="text-xs text-yellow-600 mt-2">
              ... y {result.failed_rows - result.errors.length} errores más
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onReset}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Importar Otro Archivo
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Finalizar
        </button>
      </div>
    </>
  );
}
