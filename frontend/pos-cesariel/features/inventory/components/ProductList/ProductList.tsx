'use client';

import { CubeIcon } from '@heroicons/react/24/outline';
import { ProductListItem } from './ProductListItem';
import type { Product, MultiBranchProduct } from '../../types/inventory.types';

interface ProductListProps {
  products: Product[];
  multiBranchProducts: MultiBranchProduct[];
  showMultiBranchView: boolean;
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onManageSizes: (product: Product) => void;
  userRole?: string;
  isSeller: boolean;
}

/**
 * ProductList Component
 *
 * Main product listing container that displays all products in a list format
 * Handles loading and empty states
 */
export function ProductList({
  products,
  multiBranchProducts,
  showMultiBranchView,
  loading,
  onEdit,
  onDelete,
  onAdjustStock,
  onManageSizes,
  userRole,
  isSeller,
}: ProductListProps) {
  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Productos ({products.length})
        </h3>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay productos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza agregando un nuevo producto.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {products.map((product) => {
            const multiBranchProduct = multiBranchProducts.find(
              (p) => p.id === product.id
            );

            return (
              <ProductListItem
                key={product.id}
                product={product}
                multiBranchProduct={multiBranchProduct}
                showMultiBranchView={showMultiBranchView}
                onEdit={onEdit}
                onDelete={onDelete}
                onAdjustStock={onAdjustStock}
                onManageSizes={onManageSizes}
                userRole={userRole}
                isSeller={isSeller}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
