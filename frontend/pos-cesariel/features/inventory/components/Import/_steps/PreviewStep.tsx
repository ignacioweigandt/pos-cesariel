'use client';

import { ClockIcon } from '@heroicons/react/24/outline';
import type { PreviewProduct } from '@/features/inventory/hooks/useImportPreview';

interface Category {
  id: number;
  name: string;
}

interface PreviewStats {
  total: number;
  withSizes: number;
  categorized: number;
  totalStock: number;
}

interface PreviewStepProps {
  previewData: PreviewProduct[];
  categories: Category[];
  stats: PreviewStats;
  isUploading: boolean;
  onUpdateProduct: (index: number, field: string, value: any) => void;
  onBack: () => void;
  onConfirm: () => void;
}

/**
 * Paso 2: Vista previa y edición
 */
export function PreviewStep({
  previewData,
  categories,
  stats,
  isUploading,
  onUpdateProduct,
  onBack,
  onConfirm,
}: PreviewStepProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          Vista Previa - {stats.total} productos
        </h4>
        <div className="text-sm text-gray-600">
          ✨ Revisa y ajusta antes de importar
        </div>
      </div>

      {/* Preview Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Talles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewData.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        SKU: {product.sku}
                      </div>
                      {product.detected_category && (
                        <div className="text-xs text-blue-600 mt-1">
                          🤖 {product.detected_category} detectado
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(e) =>
                        onUpdateProduct(
                          index,
                          'price',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={product.stock_quantity}
                      onChange={(e) =>
                        onUpdateProduct(
                          index,
                          'stock_quantity',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={product.category_id || ''}
                      onChange={(e) =>
                        onUpdateProduct(
                          index,
                          'category_id',
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                    >
                      <option value="">Sin categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={product.has_sizes}
                      onChange={(e) =>
                        onUpdateProduct(index, 'has_sizes', e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-blue-50 rounded-md mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-900">Total productos:</span>
            <span className="ml-2 text-blue-800">{stats.total}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Con talles:</span>
            <span className="ml-2 text-blue-800">{stats.withSizes}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900">
              Categorías detectadas:
            </span>
            <span className="ml-2 text-blue-800">{stats.categorized}</span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Stock total:</span>
            <span className="ml-2 text-blue-800">{stats.totalStock}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={isUploading}
        >
          Volver
        </button>
        <button
          onClick={onConfirm}
          disabled={isUploading || previewData.length === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
              Importando...
            </div>
          ) : (
            `Importar ${previewData.length} Productos`
          )}
        </button>
      </div>
    </>
  );
}
