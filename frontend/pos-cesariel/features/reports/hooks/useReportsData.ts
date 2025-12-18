import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/shared/api/client";
import type {
  SalesReport,
  DashboardStats,
  DailySales,
  ChartData,
} from "../types/reports.types";

export function useReportsData(startDate: string, endDate: string) {
  const router = useRouter();
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [dailySalesData, setDailySalesData] = useState<DailySales[]>([]);
  const [productsChartData, setProductsChartData] = useState<ChartData[]>([]);
  const [branchesChartData, setBranchesChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startDate && endDate) {
      loadData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const loadData = async (start: string, end: string) => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchSalesReport(start, end),
        fetchChartData(start, end),
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get("/sales/reports/dashboard");
      setDashboardStats(response.data);
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      }
    }
  };

  const fetchSalesReport = async (start: string, end: string) => {
    try {
      const response = await apiClient.get(
        `/sales/reports/sales-report?start_date=${start}&end_date=${end}`
      );
      setSalesReport(response.data);
    } catch (error: any) {
      console.error("Error fetching sales report:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      }
    }
  };

  const fetchChartData = async (start: string, end: string) => {
    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      // Fetch daily sales data
      const dailySalesResponse = await apiClient.get(
        `/sales/reports/daily-sales?start_date=${start}&end_date=${end}`
      );
      setDailySalesData(dailySalesResponse.data);

      // Fetch products chart data
      const productsResponse = await apiClient.get(
        `/sales/reports/products-chart?start_date=${start}&end_date=${end}&limit=10`
      );
      setProductsChartData(productsResponse.data);

      // Fetch branches chart data (admin only)
      if (user?.role === "admin") {
        const branchesResponse = await apiClient.get(
          `/sales/reports/branches-chart?start_date=${start}&end_date=${end}`
        );
        setBranchesChartData(branchesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  return {
    salesReport,
    dashboardStats,
    dailySalesData,
    productsChartData,
    branchesChartData,
    loading,
    error,
    refresh: () => loadData(startDate, endDate),
  };
}
