/**
 * DateRangeFilter Component
 *
 * Provides date filtering UI for reports with:
 * - Quick filter buttons (Today, This Month, This Year, etc.)
 * - Month selector with year
 * - Full year selector
 * - Custom date range picker
 * - Validation and error handling
 *
 * FIXES:
 * - Timezone handling issues
 * - Incorrect date range calculations
 * - Race conditions with setTimeout
 * - Missing validations
 */

import { useState } from "react";
import {
  FunnelIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { MONTH_NAMES, getAvailableYears } from "@/lib/utils/date";
import type { QuickFilterPeriod, ReportType } from "../../hooks/useReportFilters";

interface Branch {
  id: number;
  name: string;
}

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  reportType: ReportType;
  selectedYear: number;
  selectedBranch?: number;
  branches: Branch[];
  error: { type: string | null; message: string };
  isApplying: boolean;
  isValid: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReportTypeChange: (type: ReportType) => void;
  onSelectedYearChange: (year: number) => void;
  onBranchChange: (branchId: number | undefined) => void;
  onQuickFilter: (period: QuickFilterPeriod) => void;
  onMonthFilter: (month: number) => void;
  onYearFilter: (year: number) => void;
  onApplyFilter: () => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  reportType,
  selectedYear,
  selectedBranch,
  branches,
  error,
  isApplying,
  isValid,
  onStartDateChange,
  onEndDateChange,
  onReportTypeChange,
  onSelectedYearChange,
  onBranchChange,
  onQuickFilter,
  onMonthFilter,
  onYearFilter,
  onApplyFilter,
}: DateRangeFilterProps) {
  const years = getAvailableYears(5);

  // Local states to track filter selections
  const [quickFilterValue, setQuickFilterValue] = useState<string>('');
  const [selectedMonthValue, setSelectedMonthValue] = useState<string>('');
  const [selectedFullYearValue, setSelectedFullYearValue] = useState<string>('');

  // Check if any quick filter is active
  const hasActiveFilters = quickFilterValue !== '' || selectedMonthValue !== '' || selectedFullYearValue !== '';

  // Clear all filter selections
  const handleClearFilters = () => {
    setQuickFilterValue('');
    setSelectedMonthValue('');
    setSelectedFullYearValue('');
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6 space-y-6">
        {/* Error Display */}
        {error.type && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error en el filtro
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Feedback */}
        {isApplying && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon
                  className="h-5 w-5 text-green-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Aplicando filtros...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compact Filter Selectors */}
        <div>
          {/* Header with Clear Button */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Filtros de Fecha
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                type="button"
              >
                <XMarkIcon className="h-3 w-3 mr-1" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros Rápidos
              </label>
              <select
                value={quickFilterValue}
                onChange={(e) => {
                  const value = e.target.value as QuickFilterPeriod;
                  if (value) {
                    setQuickFilterValue(value);
                    onQuickFilter(value);
                  }
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Seleccionar período...</option>
                <option value="today">Hoy</option>
                <option value="last7">Últimos 7 días</option>
                <option value="last30">Últimos 30 días</option>
                <option value="month">Este Mes</option>
                <option value="year">Este Año</option>
              </select>
            </div>

            {/* View by Specific Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ver por Mes Específico
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => onSelectedYearChange(Number(e.target.value))}
                  className="mt-1 block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedMonthValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== '') {
                      const monthIndex = Number(value);
                      setSelectedMonthValue(value);
                      onMonthFilter(monthIndex);
                    }
                  }}
                  className="mt-1 block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Mes...</option>
                  {MONTH_NAMES.map((monthName, index) => (
                    <option key={index} value={index}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Full Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ver Año Completo
              </label>
              <select
                value={selectedFullYearValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '') {
                    const year = Number(value);
                    setSelectedFullYearValue(value);
                    onYearFilter(year);
                  }
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Seleccionar año...</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filtro Personalizado
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  error.type === 'range' || error.type === 'validation'
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  error.type === 'range' || error.type === 'validation'
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal
              </label>
              <select
                value={selectedBranch || ''}
                onChange={(e) => onBranchChange(e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Todas las sucursales</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Reporte
              </label>
              <select
                value={reportType}
                onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="sales">Ventas</option>
                <option value="products">Productos</option>
                <option value="branches">Sucursales</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={onApplyFilter}
                disabled={!isValid || isApplying}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Aplicando...
                  </>
                ) : (
                  <>
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Aplicar Filtros
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
