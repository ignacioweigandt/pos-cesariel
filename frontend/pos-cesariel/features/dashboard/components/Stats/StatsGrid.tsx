import {
  BuildingStorefrontIcon,
  ChartBarIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { StatsCard } from "./StatsCard";
import type { DashboardStats } from "../../types/dashboard.types";

interface StatsGridProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function StatsGrid({ stats, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white pt-5 px-4 pb-12 shadow rounded-lg animate-pulse"
          >
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      name: "Ventas Hoy",
      value: `$${Number(stats.total_sales_today || 0).toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: "bg-blue-500",
    },
    {
      name: "Ventas del Mes",
      value: `$${Number(stats.total_sales_month || 0).toFixed(2)}`,
      icon: ChartBarIcon,
      color: "bg-green-500",
    },
    {
      name: "Productos Totales",
      value: Number(stats.total_products || 0),
      icon: CubeIcon,
      color: "bg-purple-500",
    },
    {
      name: "Stock Bajo",
      value: Number(stats.low_stock_products || 0),
      icon: ExclamationTriangleIcon,
      color: "bg-yellow-500",
    },
    {
      name: "Sucursales Activas",
      value: stats.active_branches || 0,
      icon: BuildingStorefrontIcon,
      color: "bg-indigo-500",
    },
    {
      name: "Usuarios Totales",
      value: stats.total_users || 0,
      icon: UsersIcon,
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <StatsCard key={stat.name} stat={stat} />
      ))}
    </div>
  );
}
