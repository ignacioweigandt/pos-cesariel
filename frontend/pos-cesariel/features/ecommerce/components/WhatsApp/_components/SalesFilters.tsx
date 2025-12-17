import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { WhatsAppFilters } from '@/features/ecommerce/hooks/useWhatsAppFilters';

interface SalesFiltersProps {
  filters: WhatsAppFilters;
  onFiltersChange: (filters: WhatsAppFilters) => void;
  onClearFilters: () => void;
  totalSales: number;
  filteredCount: number;
  hasActiveFilters: boolean;
}

/**
 * Panel de filtros para ventas WhatsApp
 */
export function SalesFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  totalSales,
  filteredCount,
  hasActiveFilters,
}: SalesFiltersProps) {
  const updateFilter = (key: keyof WhatsAppFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center space-x-4 flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-900" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o número de venta..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="DELIVERED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        {/* Shipping Filter */}
        <div>
          <select
            value={filters.shipping}
            onChange={(e) => updateFilter('shipping', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="all">Todos los envíos</option>
            <option value="pickup">Retiro en Local</option>
            <option value="delivery">Envío a Domicilio</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="mt-3 text-sm text-gray-500">
        Mostrando {filteredCount} de {totalSales} ventas
      </div>
    </div>
  );
}
