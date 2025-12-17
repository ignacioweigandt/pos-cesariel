'use client';

import type { MultiBranchSizeData } from '@/features/inventory/hooks/useProductBranchStock';

interface MultiBranchStockViewProps {
  multiBranchData: MultiBranchSizeData | null;
  loading: boolean;
  isShoeCategory: boolean;
  onClose: () => void;
}

/**
 * Vista de stock multi-sucursal
 * Muestra el stock de cada talle distribuido por sucursal
 */
export function MultiBranchStockView({
  multiBranchData,
  loading,
  isShoeCategory,
  onClose,
}: MultiBranchStockViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!multiBranchData || !multiBranchData.has_sizes) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Este producto no tiene talles configurados</p>
      </div>
    );
  }

  const allSizes = multiBranchData.all_sizes || [];
  const sizeTotals = multiBranchData.size_totals || {};

  return (
    <div className="space-y-6">
      {/* Total Summary */}
      <div className="bg-indigo-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-600">Stock Total Sistema</p>
            <p className="text-2xl font-bold text-indigo-900">
              {multiBranchData.total_stock}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {multiBranchData.branches.length} Sucursales
            </p>
          </div>
        </div>
      </div>

      {/* Size Totals */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Totales por Talle
        </h4>
        <div
          className={`grid gap-2 ${
            isShoeCategory ? 'grid-cols-5' : 'grid-cols-6'
          }`}
        >
          {allSizes.map((size) => (
            <div
              key={size}
              className="border rounded-lg p-2 bg-white text-center"
            >
              <div className="text-xs text-gray-600">{size}</div>
              <div className="text-lg font-semibold text-gray-900">
                {sizeTotals[size] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Stock por Sucursal
        </h4>
        <div className="space-y-4">
          {multiBranchData.branches.map((branch) => {
            const branchTotal = Object.values(branch.sizes || {}).reduce(
              (sum, sizeData) => sum + (sizeData.stock_quantity || 0),
              0
            );

            return (
              <div key={branch.branch_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">
                    {branch.branch_name}
                  </h5>
                  <span className="text-sm font-semibold text-indigo-600">
                    Total: {branchTotal}
                  </span>
                </div>

                <div
                  className={`grid gap-2 ${
                    isShoeCategory ? 'grid-cols-5' : 'grid-cols-6'
                  }`}
                >
                  {allSizes.map((size) => {
                    const sizeData = branch.sizes?.[size];
                    const stock = sizeData?.stock_quantity || 0;

                    return (
                      <div
                        key={size}
                        className={`border rounded p-2 text-center ${
                          stock > 0
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="text-xs text-gray-600">{size}</div>
                        <div
                          className={`text-sm font-medium ${
                            stock > 0 ? 'text-green-700' : 'text-gray-400'
                          }`}
                        >
                          {stock}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
