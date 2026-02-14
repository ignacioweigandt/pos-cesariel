/** 
 * Hook para stats de dashboard con React Query
 * 
 * Optimizaciones:
 * - Cache con React Query (evita requests duplicadas)
 * - Revalidación automática cada 30s
 * - Fallback a datos por defecto en caso de error
 * - Prefetch en hover de links
 */

import { useQuery } from "@tanstack/react-query";
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

export function useDashboardStats() {
  const { data, error, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ["/sales/reports/dashboard"],
    queryFn: async () => {
      try {
        const response = await salesApi.getDashboardStats();
        return response.data;
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        return FALLBACK_STATS;
      }
    },
    refetchInterval: 30000, // Auto-refresh cada 30s
    refetchOnWindowFocus: true, // Revalidar al enfocar ventana
    refetchOnReconnect: true, // Revalidar al reconectar
    staleTime: 5000, // Considerar datos frescos por 5s
    placeholderData: FALLBACK_STATS, // Datos por defecto mientras carga
  });

  return {
    stats: data || FALLBACK_STATS,
    loading: isLoading,
    error: error ? "Error al cargar las estadísticas" : null,
    refresh: refetch, // Forzar re-fetch manual
  };
}
