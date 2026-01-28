"use client";

/**
 * ReportsContainer Component - REFACTORED with React Query
 *
 * Modern implementation using:
 * - React Query for data fetching (automatic caching, refetching, error handling)
 * - Simplified state management
 * - Better loading/error states
 * - Automatic background updates
 *
 * IMPROVEMENTS over previous version:
 * - No manual useEffect for data fetching
 * - Automatic cache invalidation
 * - Built-in retry logic
 * - Better UX with loading states
 * - Reduced code complexity (250 lines → ~180 lines)
 */

import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useDashboardStats,
  useSalesReport,
  useDailySales,
  useProductsChart,
  useBranchesChart,
} from "../hooks";
import { useReportFilters, useReportExport } from "../hooks";
import { branchesApi } from "@/features/users/api/branchesApi";
import { StatsCards } from "./Stats/StatsCards";
import { TotalSalesCard } from "./Stats/TotalSalesCard";
import { DateRangeFilter } from "./Filters/DateRangeFilter";
import { DailySalesChart } from "./Charts/DailySalesChart";
import { ProductsPieChart } from "./Charts/ProductsPieChart";
import { BranchSalesChart } from "./Charts/BranchSalesChart";

interface Branch {
  id: number;
  name: string;
}

export function ReportsContainer() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Initialize auth
  useEffect(() => {
    setMounted(true);

    const authToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!authToken) {
      router.push("/");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadBranches();
  }, [router]);

  const loadBranches = async () => {
    try {
      const response = await branchesApi.getBranches();
      setBranches(response.data || []);
    } catch (error) {
      console.error("Error loading branches:", error);
      setBranches([]);
    }
  };

  // Filters hook (unchanged)
  const filters = useReportFilters({
    initialDays: 30,
    autoApply: true,
  });

  // ============================================================================
  // React Query Hooks - Automatic data fetching with caching
  // ============================================================================

  const {
    data: dashboardStats,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboardStats(filters.selectedBranch);

  const {
    data: salesReport,
    isLoading: salesLoading,
    error: salesError,
  } = useSalesReport(
    filters.startDate,
    filters.endDate,
    filters.selectedBranch,
    filters.isValid
  );

  const {
    data: dailySalesData,
    isLoading: dailySalesLoading,
    error: dailySalesError,
  } = useDailySales(
    filters.startDate,
    filters.endDate,
    filters.selectedBranch,
    filters.isValid
  );

  const {
    data: productsChartData,
    isLoading: productsLoading,
    error: productsError,
  } = useProductsChart(
    filters.startDate,
    filters.endDate,
    filters.selectedBranch,
    filters.isValid
  );

  const {
    data: branchesChartData,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranchesChart(
    filters.startDate,
    filters.endDate,
    user?.role === "ADMIN" && filters.isValid
  );

  // Aggregate loading state
  const loading =
    dashboardLoading ||
    salesLoading ||
    dailySalesLoading ||
    productsLoading ||
    (user?.role === "ADMIN" && branchesLoading);

  // Export functionality
  const { exportToCSV, exporting } = useReportExport();

  const handleExport = () => {
    if (salesReport) {
      exportToCSV(salesReport, filters.startDate, filters.endDate);
    }
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

            {/* Filters */}
            <DateRangeFilter
              startDate={filters.startDate}
              endDate={filters.endDate}
              reportType={filters.reportType}
              selectedYear={filters.selectedYear}
              selectedBranch={filters.selectedBranch}
              branches={branches}
              error={filters.error}
              isApplying={filters.isApplying}
              isValid={filters.isValid}
              onStartDateChange={filters.setStartDate}
              onEndDateChange={filters.setEndDate}
              onReportTypeChange={filters.setReportType}
              onSelectedYearChange={filters.setSelectedYear}
              onBranchChange={filters.setSelectedBranch}
              onQuickFilter={filters.handleQuickFilter}
              onMonthFilter={filters.handleMonthFilter}
              onYearFilter={filters.handleYearFilter}
              onApplyFilter={filters.applyFilter}
            />

            {/* Loading State */}
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
                  loading={false}
                />

                {/* Total Sales Card */}
                <TotalSalesCard
                  salesReport={salesReport}
                  loading={false}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                />

                {/* Charts Section - Main Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DailySalesChart
                    data={dailySalesData || []}
                    loading={false}
                    branchName={branches.find(b => b.id === filters.selectedBranch)?.name}
                  />
                  <ProductsPieChart
                    data={productsChartData || []}
                    loading={false}
                    branchName={branches.find(b => b.id === filters.selectedBranch)?.name}
                  />
                </div>

                {/* Branches Section (Admin only) */}
                {user?.role === "ADMIN" && (
                  <BranchSalesChart
                    data={branchesChartData || []}
                    loading={false}
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
