"use client";

import { useEffect, useState } from "react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ShoppingBagIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ecommerceAdvancedApi } from "../../api/ecommerceAdvancedApi";
import type { StoreConfig, DetailedDashboardData } from "../../types/ecommerce.types";

interface DashboardTabProps {
  stats: any; // Legacy prop, not used anymore
  storeConfig: StoreConfig | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PROCESSING: "#3b82f6",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

/**
 * Dashboard E-commerce completo con métricas, gráficos y últimas ventas
 */
export default function DashboardTab({ storeConfig }: DashboardTabProps) {
  const [dashboardData, setDashboardData] = useState<DetailedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await ecommerceAdvancedApi.getDetailedDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { stats, recent_sales, sales_by_day, orders_by_status, top_products, low_stock_alerts } = dashboardData;

  // Stat cards configuration
  const statCards = [
    {
      name: "Productos Online",
      value: stats.total_online_products,
      icon: ShoppingBagIcon,
      color: "bg-blue-500",
      description: "Productos activos en tienda",
    },
    {
      name: "Ventas Totales",
      value: `$${stats.total_online_sales.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: "bg-green-500",
      description: `${stats.total_online_orders || 0} órdenes totales`,
    },
    {
      name: "Tasa de Conversión",
      value: `${stats.conversion_rate}%`,
      icon: ChartBarIcon,
      color: "bg-purple-500",
      description: `${stats.delivered_orders || 0} órdenes completadas`,
    },
    {
      name: "Pedidos Pendientes",
      value: stats.pending_orders || 0,
      icon: TruckIcon,
      color: "bg-orange-500",
      description: "Requieren atención",
    },
  ];

  // Format date for chart
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", { month: "short", day: "numeric" });
  };

  // Prepare chart data
  const salesChartData = sales_by_day.map((item) => ({
    date: formatDate(item.date),
    ventas: item.count,
    ingresos: item.total,
  }));

  const statusChartData = orders_by_status.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || "#6b7280",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard E-commerce</h2>
          <p className="mt-1 text-sm text-gray-600">Vista completa de tu tienda online</p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              storeConfig?.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <GlobeAltIcon className="w-3 h-3 mr-1" />
            {storeConfig?.is_active ? "Tienda Activa" : "Tienda Inactiva"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex flex-col sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Day Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas (Últimos 7 días)</h3>
          {salesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ventas"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Cantidad"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Ingresos ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Sin datos de ventas recientes</p>
          )}
        </div>

        {/* Orders by Status Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Pedidos</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Sin pedidos registrados</p>
          )}
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Últimas Ventas</h3>
          {recent_sales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nº Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recent_sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.sale_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sale.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={{
                            backgroundColor: `${STATUS_COLORS[sale.order_status]}20`,
                            color: STATUS_COLORS[sale.order_status],
                          }}
                        >
                          {STATUS_LABELS[sale.order_status] || sale.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.created_at).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.is_whatsapp ? (
                          <span className="inline-flex items-center text-green-600">
                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                            WhatsApp
                          </span>
                        ) : (
                          <span className="text-blue-600">Web</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No hay ventas recientes</p>
          )}
        </div>
      </div>

      {/* Bottom Row: Top Products + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Productos Más Vendidos (30 días)</h3>
          {top_products.length > 0 ? (
            <div className="space-y-4">
              {top_products.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                      <p className="text-xs text-gray-500">{product.total_sold} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${product.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Ingresos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Sin datos de productos</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
            Alertas de Stock Bajo
          </h3>
          {low_stock_alerts.length > 0 ? (
            <div className="space-y-3">
              {low_stock_alerts.map((alert) => (
                <div
                  key={alert.product_id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.product_name}</p>
                    <p className="text-xs text-gray-500">
                      Stock mínimo: {alert.min_stock} unidades
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{alert.current_stock}</p>
                    <p className="text-xs text-gray-500">Disponible</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Stock en niveles óptimos</p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time update indicator */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>Actualización automática cada 30 segundos</span>
        </div>
      </div>
    </div>
  );
}
