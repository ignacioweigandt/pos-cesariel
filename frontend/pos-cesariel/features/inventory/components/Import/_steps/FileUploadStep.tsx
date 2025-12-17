'use client';

import { DocumentArrowUpIcon, ClockIcon } from '@heroicons/react/24/outline';

interface FileUploadStepProps {
  selectedFile: File | null;
  isUploading: boolean;
  detectedCategory: string | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
  onCancel: () => void;
}

/**
 * Paso 1: Carga de archivo
 */
export function FileUploadStep({
  selectedFile,
  isUploading,
  detectedCategory,
  onFileSelect,
  onPreview,
  onCancel,
}: FileUploadStepProps) {
  return (
    <>
      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Instrucciones para la importación:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • El archivo debe ser CSV o Excel (.xlsx, .xls)
          </li>
          <li>
            • Debe contener las columnas: <strong>codigo_barra</strong>,{' '}
            <strong>modelo</strong>, <strong>efectivo</strong>
          </li>
          <li>• Los códigos de barras deben ser únicos</li>
          <li>
            • ✨ <strong>Nuevo:</strong> Podrás ajustar stock y categorías antes
            de importar
          </li>
          <li>
            • 🤖 <strong>Detección inteligente:</strong> Las categorías se
            detectan automáticamente
          </li>
          <li>
            • 👕 <strong>Talles automáticos:</strong> Se detectan productos con
            talles
          </li>
        </ul>
      </div>

      {/* File Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar archivo
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Subir archivo</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".csv,.xlsx,.xls"
                  onChange={onFileSelect}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">o arrastrar y soltar</p>
            </div>
            <p className="text-xs text-gray-500">CSV, XLSX, XLS hasta 10MB</p>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentArrowUpIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-900">
                  {selectedFile.name}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              {detectedCategory && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  📁 {detectedCategory} detectado
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={isUploading}
        >
          Cancelar
        </button>
        <button
          onClick={onPreview}
          disabled={!selectedFile || isUploading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </div>
          ) : (
            'Vista Previa'
          )}
        </button>
      </div>
    </>
  );
}
