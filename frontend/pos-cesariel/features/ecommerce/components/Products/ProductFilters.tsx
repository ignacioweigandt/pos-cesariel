'use client';

import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ProductFilters as ProductFiltersType } from '../../hooks/useProductFilters';

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  categories: Category[];
  brands: Brand[];
}

/**
 * Componente de filtros para productos online en el panel admin
 */
export function ProductFilters({
  filters,
  onFiltersChange,
  categories,
  brands,
}: ProductFiltersProps) {
  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleCategoryChange = (selectedCategory: string) => {
    onFiltersChange({ ...filters, selectedCategory });
  };

  const handleBrandChange = (selectedBrand: string) => {
    onFiltersChange({ ...filters, selectedBrand });
  };

  const handleOnlineStatusChange = (onlineStatus: 'all' | 'online' | 'offline') => {
    onFiltersChange({ ...filters, onlineStatus });
  };

  const handleStockFilterChange = (stockFilter: 'all' | 'instock' | 'outofstock') => {
    onFiltersChange({ ...filters, stockFilter });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      selectedCategory: 'all',
      selectedBrand: 'all',
      onlineStatus: 'all',
      stockFilter: 'all',
    });
  };

  const hasActiveFilters =
    filters.searchTerm !== '' ||
    filters.selectedCategory !== 'all' ||
    filters.selectedBrand !== 'all' ||
    filters.onlineStatus !== 'all' ||
    filters.stockFilter !== 'all';

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filtros de Búsqueda</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {/* Búsqueda por texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Buscar
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Buscar productos..."
              />
            </div>
          </div>

          {/* Filtro por categoría */}
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
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Marca
            </label>
            <select
              value={filters.selectedBrand}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todas las marcas</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado online */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={filters.onlineStatus}
              onChange={(e) => handleOnlineStatusChange(e.target.value as 'all' | 'online' | 'offline')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Filtro por stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock
            </label>
            <select
              value={filters.stockFilter}
              onChange={(e) => handleStockFilterChange(e.target.value as 'all' | 'instock' | 'outofstock')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="instock">En stock</option>
              <option value="outofstock">Sin stock</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
