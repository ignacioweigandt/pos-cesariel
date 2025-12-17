'use client';

import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import type { SizeStock } from '@/features/inventory/hooks/useSizeStock';

interface EditSizeStockViewProps {
  sizes: SizeStock[];
  availableSizes: string[];
  isShoeCategory: boolean;
  loading: boolean;
  saving: boolean;
  getSizeStock: (size: string) => number;
  updateSizeStock: (size: string, change: number) => void;
  setSizeStock: (size: string, stock: number) => void;
  bulkAdjustStock: (adjustment: number) => void;
  resetAllStock: () => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Vista de edición de stock por talles
 * Permite modificar cantidades individualmente o en bulk
 */
export function EditSizeStockView({
  sizes,
  availableSizes,
  isShoeCategory,
  loading,
  saving,
  getSizeStock,
  updateSizeStock,
  setSizeStock,
  bulkAdjustStock,
  resetAllStock,
  onSave,
  onCancel,
}: EditSizeStockViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalStock = sizes.reduce((sum, size) => sum + size.stock_quantity, 0);

  return (
    <div className="space-y-6">
      {/* Stock Summary */}
      <div className="bg-indigo-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-600">Stock Total</p>
            <p className="text-2xl font-bold text-indigo-900">{totalStock}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => bulkAdjustStock(1)}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              +1 Todos
            </button>
            <button
              onClick={() => bulkAdjustStock(5)}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              +5 Todos
            </button>
            <button
              onClick={() => bulkAdjustStock(-1)}
              className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
            >
              -1 Todos
            </button>
            <button
              onClick={resetAllStock}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              Resetear
            </button>
          </div>
        </div>
      </div>

      {/* Size Grid */}
      <div
        className={`grid gap-3 ${
          isShoeCategory ? 'grid-cols-5' : 'grid-cols-6'
        }`}
      >
        {availableSizes.map((size) => {
          const stock = getSizeStock(size);
          return (
            <div
              key={size}
              className="border rounded-lg p-3 bg-white hover:border-indigo-300 transition-colors"
            >
              <div className="text-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {size}
                </span>
              </div>

              <div className="flex items-center justify-center space-x-1">
                <button
                  onClick={() => updateSizeStock(size, -1)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                  disabled={stock === 0}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>

                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) =>
                    setSizeStock(size, parseInt(e.target.value) || 0)
                  }
                  className="w-16 text-center border rounded px-2 py-1 text-sm text-gray-900"
                />

                <button
                  onClick={() => updateSizeStock(size, 1)}
                  className="p-1 text-gray-400 hover:text-green-500 rounded"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
