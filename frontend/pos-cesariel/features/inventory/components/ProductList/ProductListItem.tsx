'use client';

import {
  CubeIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import type { Product, MultiBranchProduct } from '../../types/inventory.types';
import { getStockStatusLabel, getStockStatusColor, formatProductPrice } from '../../utils/stockCalculations';

interface ProductListItemProps {
  product: Product;
  multiBranchProduct?: MultiBranchProduct | null;
  showMultiBranchView: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onManageSizes: (product: Product) => void;
}

/**
 * ProductListItem Component
 *
 * Individual product row displaying:
 * - Product information (name, SKU, price, category)
 * - Stock information (current stock, multi-branch view)
 * - Stock status badge
 * - Action buttons (edit, delete, adjust stock, manage sizes)
 */
export function ProductListItem({
  product,
  multiBranchProduct,
  showMultiBranchView,
  onEdit,
  onDelete,
  onAdjustStock,
  onManageSizes,
}: ProductListItemProps) {
  const stockStatusLabel = getStockStatusLabel(product);
  const stockStatusColor = getStockStatusColor(product);

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Product Info */}
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <CubeIcon className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-900">
                  {product.name}
                </p>
                {product.category && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category.name}
                  </span>
                )}
                {stockStatusLabel && (
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatusColor}`}
                  >
                    {stockStatusLabel}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <p>SKU: {product.sku}</p>
                <span className="mx-2">•</span>
                <p>{formatProductPrice(product)}</p>
              </div>
            </div>
          </div>

          {/* Stock and Actions */}
          <div className="flex items-center space-x-4">
            {/* Stock Display */}
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <div>
                  {showMultiBranchView && multiBranchProduct ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        Stock Total: {multiBranchProduct.total_stock}
                      </p>
                      <div className="text-xs text-gray-500">
                        {multiBranchProduct.branch_stocks.length > 0 ? (
                          multiBranchProduct.branch_stocks.map((branch) => (
                            <div
                              key={branch.branch_id}
                              className="flex justify-between"
                            >
                              <span>{branch.branch_name}:</span>
                              <span className="ml-1 font-medium">
                                {branch.stock_quantity}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span>Sin stock por sucursales</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Stock: {product.stock_quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mín: {product.min_stock}
                      </p>
                    </div>
                  )}
                </div>
                {product.has_sizes && (
                  <div className="relative">
                    <button
                      onClick={() => onManageSizes(product)}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 flex items-center space-x-1"
                      title="Ver y gestionar stock por talles"
                    >
                      <Squares2X2Icon className="h-3 w-3" />
                      <span>Talles</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {product.has_sizes ? (
                <button
                  onClick={() => onManageSizes(product)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Gestionar Stock por Talles"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => onAdjustStock(product)}
                  className="text-green-600 hover:text-green-900"
                  title="Ajustar Stock"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onEdit(product)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Editar"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(product)}
                className="text-red-600 hover:text-red-900"
                title="Eliminar"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
