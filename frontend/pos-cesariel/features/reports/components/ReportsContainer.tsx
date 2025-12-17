"use client";

/**
 * ReportsContainer Component
 *
 * Main container for the reports module with:
 * - Improved date filter handling
 * - Fixed timezone issues
 * - Better validation and error handling
 * - Enhanced UX with loading states
 *
 * IMPROVEMENTS:
 * - Uses useReportFilters hook for robust filter management
 * - Eliminates race conditions
 * - Proper date validation
 * - Better feedback to users
 */

import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useReportsData, useReportExport, useReportFilters } from "../hooks";
import { StatsCards } from "./Stats/StatsCards";
import { TotalSalesCard } from "./Stats/TotalSalesCard";
import { DateRangeFilter } from "./Filters/DateRangeFilter";
import { DailySalesChart } from "./Charts/DailySalesChart";
import { ProductsPieChart } from "./Charts/ProductsPieChart";
import { BranchSalesChart } from "./Charts/BranchSalesChart";

export function ReportsContainer() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize auth
  useEffect(() => {
    setMounted(true);

    // Check authentication
    const authToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!authToken) {
      router.push("/");
      return;
    }

    setToken(authToken);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  // Use the improved filters hook
  const filters = useReportFilters({
    initialDays: 30,
    autoApply: true,
    onFilterChange: (startDate, endDate, reportType) => {
      // Refresh data when filters change
      refresh();
    }
  });

  // Fetch data with current filter dates
  const {
    salesReport,
    dashboardStats,
    dailySalesData,
    productsChartData,
    branchesChartData,
    loading,
    refresh,
  } = useReportsData(filters.startDate, filters.endDate);

  // Export functionality
  const { exportToCSV, exporting } = useReportExport();

  const handleExport = () => {
    exportToCSV(salesReport, filters.startDate, filters.endDate);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Reportes y Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.full_name} - {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Reportes y Analytics
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Análisis detallado de ventas, productos y rendimiento
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={!salesReport || exporting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exportando...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </>
                )}
              </button>
            </div>

            {/* Filters - Now using the improved hook */}
            <DateRangeFilter
              startDate={filters.startDate}
              endDate={filters.endDate}
              reportType={filters.reportType}
              selectedYear={filters.selectedYear}
              error={filters.error}
              isApplying={filters.isApplying}
              isValid={filters.isValid}
              onStartDateChange={filters.setStartDate}
              onEndDateChange={filters.setEndDate}
              onReportTypeChange={filters.setReportType}
              onSelectedYearChange={filters.setSelectedYear}
              onQuickFilter={filters.handleQuickFilter}
              onMonthFilter={filters.handleMonthFilter}
              onYearFilter={filters.handleYearFilter}
              onApplyFilter={filters.applyFilter}
            />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-600">Cargando datos del reporte...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <StatsCards
                  dashboardStats={dashboardStats}
                  salesReport={salesReport}
                  loading={loading}
                />

                {/* Total Sales Card */}
                <TotalSalesCard
                  salesReport={salesReport}
                  loading={loading}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                />

                {/* Charts Section - Main Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DailySalesChart data={dailySalesData} loading={loading} />
                  <ProductsPieChart
                    data={productsChartData}
                    loading={loading}
                  />
                </div>

                {/* Branches Section (Admin only) */}
                {user?.role === "ADMIN" && (
                  <BranchSalesChart
                    data={branchesChartData}
                    loading={loading}
                    isAdmin={true}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
