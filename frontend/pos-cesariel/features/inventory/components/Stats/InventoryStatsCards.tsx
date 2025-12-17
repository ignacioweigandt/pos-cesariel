'use client';

import {
  CubeIcon,
  ExclamationTriangleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import type { InventoryStats } from '../../types/inventory.types';

interface InventoryStatsCardsProps {
  stats: InventoryStats;
}

/**
 * InventoryStatsCards Component
 *
 * Displays summary statistics for inventory management:
 * - Total products
 * - Low stock alerts
 * - Out of stock count
 * - Total categories
 */
export function InventoryStatsCards({ stats }: InventoryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
      {/* Total Products */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CubeIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Productos
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalProducts}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Stock Bajo
                </dt>
                <dd className="text-lg font-medium text-yellow-600">
                  {stats.lowStockCount}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Out of Stock */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Sin Stock
                </dt>
                <dd className="text-lg font-medium text-red-600">
                  {stats.outOfStockCount}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Total Categories */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TagIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Categorías
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.categoriesCount}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
