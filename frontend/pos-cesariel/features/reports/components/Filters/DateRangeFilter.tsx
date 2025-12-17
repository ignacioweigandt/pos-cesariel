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

import {
  FunnelIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { MONTH_NAMES, getAvailableYears } from "@/lib/utils/date";
import type { QuickFilterPeriod, ReportType } from "../../hooks/useReportFilters";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  reportType: ReportType;
  selectedYear: number;
  error: { type: string | null; message: string };
  isApplying: boolean;
  isValid: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReportTypeChange: (type: ReportType) => void;
  onSelectedYearChange: (year: number) => void;
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
  error,
  isApplying,
  isValid,
  onStartDateChange,
  onEndDateChange,
  onReportTypeChange,
  onSelectedYearChange,
  onQuickFilter,
  onMonthFilter,
  onYearFilter,
  onApplyFilter,
}: DateRangeFilterProps) {
  const years = getAvailableYears(5);

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

        {/* Quick Filter Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="h-4 w-4 inline mr-1" />
            Filtros Rápidos
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onQuickFilter("today")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="button"
            >
              Hoy
            </button>
            <button
              onClick={() => onQuickFilter("last7")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="button"
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => onQuickFilter("last30")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="button"
            >
              Últimos 30 días
            </button>
            <button
              onClick={() => onQuickFilter("month")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="button"
            >
              Este Mes
            </button>
            <button
              onClick={() => onQuickFilter("year")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              type="button"
            >
              Este Año
            </button>
          </div>
        </div>

        {/* View by Month */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ver por Mes Específico
          </label>
          <div className="space-y-3">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Año:</span>
              <select
                value={selectedYear}
                onChange={(e) => onSelectedYearChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {MONTH_NAMES.map((monthName, index) => (
                <button
                  key={index}
                  onClick={() => onMonthFilter(index)}
                  className="px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  type="button"
                >
                  {monthName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Full Year */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ver Año Completo
          </label>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => onYearFilter(year)}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                type="button"
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filtro Personalizado
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
