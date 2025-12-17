import {
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { DashboardStats, SalesReport } from "../../types/reports.types";

interface StatsCardsProps {
  dashboardStats: DashboardStats | null;
  salesReport: SalesReport | null;
  loading: boolean;
}

export function StatsCards({
  dashboardStats,
  salesReport,
  loading,
}: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
          >
            <div className="p-5">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!dashboardStats) return null;

  const stats = [
    {
      name: "Ventas Hoy",
      value: `$${Number(dashboardStats.total_sales_today).toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: "text-green-400",
    },
    {
      name: "Ventas del Mes",
      value: `$${Number(dashboardStats.total_sales_month).toFixed(2)}`,
      icon: ShoppingCartIcon,
      color: "text-blue-400",
    },
    {
      name: "Transacciones",
      value: salesReport?.total_transactions || 0,
      icon: UserGroupIcon,
      color: "text-purple-400",
    },
    {
      name: "Venta Promedio",
      value: `$${Number(salesReport?.average_sale || 0).toFixed(2)}`,
      icon: ArrowTrendingUpIcon,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
