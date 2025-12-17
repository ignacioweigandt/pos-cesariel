import { useState, useEffect } from "react";
import { salesApi } from "@/lib/api";
import type { DashboardStats } from "../types/dashboard.types";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await salesApi.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Error al cargar las estadísticas");

      // Set default stats if API fails
      setStats({
        total_sales_today: 0,
        total_sales_month: 0,
        total_products: 0,
        low_stock_products: 0,
        active_branches: 1,
        total_users: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
