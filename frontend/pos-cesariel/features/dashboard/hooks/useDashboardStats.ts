/** 
 * Hook para stats de dashboard con SWR 
 * 
 * Optimizaciones:
 * - Cache con SWR (evita requests duplicadas)
 * - Revalidación automática cada 30s
 * - Fallback a datos por defecto en caso de error
 * - Prefetch en hover de links
 */

import useSWR from "swr";
import { salesApi } from "@/lib/api";
import type { DashboardStats } from "../types/dashboard.types";

const FALLBACK_STATS: DashboardStats = {
  total_sales_today: 0,
  total_sales_month: 0,
  total_products: 0,
  low_stock_products: 0,
  active_branches: 1,
  total_users: 1,
};

const fetcher = async () => {
  try {
    const response = await salesApi.getDashboardStats();
    return response.data;
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return FALLBACK_STATS;
  }
};

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    "/sales/reports/dashboard",
    fetcher,
    {
      refreshInterval: 30000, // Auto-refresh cada 30s
      revalidateOnFocus: true, // Revalidar al enfocar ventana
      revalidateOnReconnect: true, // Revalidar al reconectar
      dedupingInterval: 5000, // Evitar requests duplicadas en 5s
      fallbackData: FALLBACK_STATS, // Datos por defecto mientras carga
    }
  );

  return {
    stats: data || FALLBACK_STATS,
    loading: isLoading,
    error: error ? "Error al cargar las estadísticas" : null,
    refresh: mutate, // Forzar re-fetch manual
  };
}
