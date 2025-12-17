'use client';

import {
  MagnifyingGlassIcon,
  QrCodeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import type { Category, ProductFilters as ProductFiltersType } from '../../types/inventory.types';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  categories: Category[];
  scannerEnabled?: boolean;
  onScannerToggle?: () => void;
  isScanning?: boolean;
  currentBuffer?: string;
}

/**
 * ProductFilters Component
 *
 * Search and filter controls for products:
 * - Search by name/SKU
 * - Category filter
 * - Stock status filter
 * - Barcode scanner toggle (optional)
 */
export function ProductFilters({
  filters,
  onFiltersChange,
  categories,
  scannerEnabled = false,
  onScannerToggle,
  isScanning = false,
  currentBuffer,
}: ProductFiltersProps) {
  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleCategoryChange = (selectedCategory: string) => {
    onFiltersChange({ ...filters, selectedCategory });
  };

  const handleStockFilterChange = (stockFilter: 'all' | 'low' | 'out') => {
    onFiltersChange({ ...filters, stockFilter });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      selectedCategory: 'all',
      stockFilter: 'all',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Buscar productos
            </label>
            <div className="mt-1 flex gap-2">
              <div className="relative flex-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nombre o SKU..."
                />
              </div>

              {/* Scanner Toggle (optional) */}
              {onScannerToggle && (
                <button
                  onClick={onScannerToggle}
                  className={`flex items-center justify-center px-3 py-2 border rounded-md shadow-sm transition-colors ${
                    scannerEnabled
                      ? 'border-green-300 bg-green-50 hover:bg-green-100'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                  title={
                    scannerEnabled
                      ? 'Desactivar escáner'
                      : 'Activar escáner'
                  }
                >
                  <div className="flex items-center">
                    <QrCodeIcon
                      className={`h-5 w-5 mr-2 ${
                        scannerEnabled
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <div className="text-xs">
                      {scannerEnabled ? (
                        isScanning ? (
                          <div className="flex items-center text-green-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                            Escaneando...
                            {currentBuffer && (
                              <span className="ml-1 font-mono">
                                ({currentBuffer})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-green-700">
                            Escáner ON
                          </span>
                        )
                      ) : (
                        <span className="text-gray-500">Escáner OFF</span>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              value={filters.selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id.toString()}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado de Stock
            </label>
            <select
              value={filters.stockFilter}
              onChange={(e) => handleStockFilterChange(e.target.value as 'all' | 'low' | 'out')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="low">Stock bajo</option>
              <option value="out">Sin stock</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
