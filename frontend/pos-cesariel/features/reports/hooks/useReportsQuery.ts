/**
 * useReportsQuery Hook
 *
 * React Query hooks for Reports module using new backend endpoints (/reports/*)
 * Replaces manual useEffect + fetch with automatic caching, refetching, and error handling
 *
 * Benefits:
 * - Automatic caching and deduplication
 * - Background refetching
 * - Loading and error states
 * - Optimistic updates support
 * - Retry logic
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

// ============================================================================
// Types (matching backend schemas from backend/app/schemas/reports.py)
// ============================================================================

export interface DashboardStats {
  total_sales: number;
  total_orders: number;
  average_ticket: number;
  total_products_sold: number;
  period_start: string;
  period_end: string;
}

export interface SalesReport {
  total_sales: number;
  total_orders: number;
  average_ticket: number;
  start_date: string;
  end_date: string;
}

export interface DailySale {
  date: string;
  total: number;
  orders_count: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface BranchSalesData {
  branch_id: number;
  branch_name: string;
  total_sales: number;
  orders_count: number;
}

// ============================================================================
// Query Keys (for cache management)
// ============================================================================

export const reportsKeys = {
  all: ['reports'] as const,
  dashboard: (branchId?: number) =>
    [...reportsKeys.all, 'dashboard', branchId] as const,
  sales: (startDate: string, endDate: string, branchId?: number) =>
    [...reportsKeys.all, 'sales', startDate, endDate, branchId] as const,
  dailySales: (startDate: string, endDate: string, branchId?: number) =>
    [...reportsKeys.all, 'daily-sales', startDate, endDate, branchId] as const,
  productsChart: (startDate: string, endDate: string, branchId?: number) =>
    [...reportsKeys.all, 'products-chart', startDate, endDate, branchId] as const,
  branchesChart: (startDate: string, endDate: string) =>
    [...reportsKeys.all, 'branches-chart', startDate, endDate] as const,
};

// ============================================================================
// API Functions (using NEW backend endpoints /reports/*)
// ============================================================================

async function fetchDashboardStats(
  branchId?: number
): Promise<DashboardStats> {
  const params = branchId ? { branch_id: branchId } : {};
  const response = await apiClient.get('/reports/dashboard', { params });
  return response.data;
}

async function fetchSalesReport(
  startDate: string,
  endDate: string,
  branchId?: number
): Promise<SalesReport> {
  const params: any = {
    start_date: startDate,
    end_date: endDate,
  };
  if (branchId) params.branch_id = branchId;

  const response = await apiClient.get('/reports/sales', { params });
  return response.data;
}

async function fetchDailySales(
  startDate: string,
  endDate: string,
  branchId?: number
): Promise<DailySale[]> {
  const params: any = {
    start_date: startDate,
    end_date: endDate,
  };
  if (branchId) params.branch_id = branchId;

  const response = await apiClient.get('/reports/daily-sales', { params });
  return response.data;
}

async function fetchProductsChart(
  startDate: string,
  endDate: string,
  branchId?: number
): Promise<TopProduct[]> {
  const params: any = {
    start_date: startDate,
    end_date: endDate,
  };
  if (branchId) params.branch_id = branchId;

  const response = await apiClient.get('/reports/products-chart', { params });
  return response.data;
}

async function fetchBranchesChart(
  startDate: string,
  endDate: string
): Promise<BranchSalesData[]> {
  const params = {
    start_date: startDate,
    end_date: endDate,
  };

  const response = await apiClient.get('/reports/branches-chart', { params });
  return response.data;
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Fetch dashboard statistics
 * @param branchId - Optional branch filter (Admin can see all, Manager sees own branch)
 */
export function useDashboardStats(
  branchId?: number
): UseQueryResult<DashboardStats, Error> {
  return useQuery({
    queryKey: reportsKeys.dashboard(branchId),
    queryFn: () => fetchDashboardStats(branchId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch sales report for date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param branchId - Optional branch filter
 * @param enabled - Whether to run the query (defaults to true)
 */
export function useSalesReport(
  startDate: string,
  endDate: string,
  branchId?: number,
  enabled = true
): UseQueryResult<SalesReport, Error> {
  return useQuery({
    queryKey: reportsKeys.sales(startDate, endDate, branchId),
    queryFn: () => fetchSalesReport(startDate, endDate, branchId),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch daily sales data for charts
 * @param startDate - Start date
 * @param endDate - End date
 * @param branchId - Optional branch filter
 * @param enabled - Whether to run the query
 */
export function useDailySales(
  startDate: string,
  endDate: string,
  branchId?: number,
  enabled = true
): UseQueryResult<DailySale[], Error> {
  return useQuery({
    queryKey: reportsKeys.dailySales(startDate, endDate, branchId),
    queryFn: () => fetchDailySales(startDate, endDate, branchId),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch top products data for pie chart
 * @param startDate - Start date
 * @param endDate - End date
 * @param branchId - Optional branch filter
 * @param enabled - Whether to run the query
 */
export function useProductsChart(
  startDate: string,
  endDate: string,
  branchId?: number,
  enabled = true
): UseQueryResult<TopProduct[], Error> {
  return useQuery({
    queryKey: reportsKeys.productsChart(startDate, endDate, branchId),
    queryFn: () => fetchProductsChart(startDate, endDate, branchId),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch branch comparison data (Admin only)
 * @param startDate - Start date
 * @param endDate - End date
 * @param enabled - Whether to run the query
 */
export function useBranchesChart(
  startDate: string,
  endDate: string,
  enabled = true
): UseQueryResult<BranchSalesData[], Error> {
  return useQuery({
    queryKey: reportsKeys.branchesChart(startDate, endDate),
    queryFn: () => fetchBranchesChart(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}
