/** React Query hooks para reportes con cache automático y refetch (usa /reports/*) */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { BranchData } from '../types/reports.types';

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

export type BranchSalesData = BranchData;

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
): Promise<BranchData[]> {
  const params = {
    start_date: startDate,
    end_date: endDate,
  };

  const response = await apiClient.get('/reports/branches-chart', { params });
  
  return response.data.map((branch: any) => ({
    branch_id: branch.branch_id,
    branch_name: branch.branch_name,
    total_sales: Number(branch.total_sales || 0),
    orders_count: branch.orders_count,
  }));
}

export function useDashboardStats(
  branchId?: number
): UseQueryResult<DashboardStats, Error> {
  return useQuery({
    queryKey: reportsKeys.dashboard(branchId),
    queryFn: () => fetchDashboardStats(branchId),
    staleTime: 2 * 60 * 1000,
  });
}

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
    staleTime: 5 * 60 * 1000,
  });
}

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

export function useBranchesChart(
  startDate: string,
  endDate: string,
  enabled = true
): UseQueryResult<BranchData[], Error> {
  return useQuery({
    queryKey: reportsKeys.branchesChart(startDate, endDate),
    queryFn: () => fetchBranchesChart(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrandsChart(
  startDate: string,
  endDate: string,
  branchId?: number,
  enabled = true,
  limit = 10
): UseQueryResult<TopProduct[], Error> {
  return useQuery({
    queryKey: [...reportsKeys.all, 'brands-chart', startDate, endDate, branchId, limit] as const,
    queryFn: async () => {
      const params: any = {
        start_date: startDate,
        end_date: endDate,
        limit,
      };
      if (branchId) params.branch_id = branchId;

      const response = await apiClient.get('/reports/brands-chart', { params });
      return response.data;
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDetailedSalesReport(
  startDate: string,
  endDate: string,
  branchId?: number,
  enabled = true
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: [...reportsKeys.all, 'detailed-sales', startDate, endDate, branchId] as const,
    queryFn: async () => {
      const params: any = {
        start_date: startDate,
        end_date: endDate,
      };
      if (branchId) params.branch_id = branchId;

      const response = await apiClient.get('/reports/sales/detailed', { params });
      return response.data;
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}
