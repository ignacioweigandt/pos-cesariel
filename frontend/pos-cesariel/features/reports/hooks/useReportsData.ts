import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        router.push("/");
        return;
      }

      const response = await fetch(
        "http://localhost:8000/sales/reports/dashboard",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchSalesReport = async (start: string, end: string) => {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        router.push("/");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/sales/reports/sales-report?start_date=${start}&end_date=${end}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSalesReport(data);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  };

  const fetchChartData = async (start: string, end: string) => {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return;

      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      const headers = {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json",
      };

      // Fetch daily sales data
      const dailySalesResponse = await fetch(
        `http://localhost:8000/sales/reports/daily-sales?start_date=${start}&end_date=${end}`,
        { headers }
      );

      if (dailySalesResponse.ok) {
        const dailyData = await dailySalesResponse.json();
        setDailySalesData(dailyData);
      }

      // Fetch products chart data
      const productsResponse = await fetch(
        `http://localhost:8000/sales/reports/products-chart?start_date=${start}&end_date=${end}&limit=10`,
        { headers }
      );

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProductsChartData(productsData);
      }

      // Fetch branches chart data (admin only)
      if (user?.role === "admin") {
        const branchesResponse = await fetch(
          `http://localhost:8000/sales/reports/branches-chart?start_date=${start}&end_date=${end}`,
          { headers }
        );

        if (branchesResponse.ok) {
          const branchesData = await branchesResponse.json();
          setBranchesChartData(branchesData);
        }
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
