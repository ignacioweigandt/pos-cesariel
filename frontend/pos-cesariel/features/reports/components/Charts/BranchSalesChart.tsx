import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BuildingStorefrontIcon, TrophyIcon } from "@heroicons/react/24/outline";
import type { ChartData } from "../../types/reports.types";

interface BranchSalesChartProps {
  data: ChartData[];
  loading: boolean;
  isAdmin: boolean;
}

export function BranchSalesChart({
  data,
  loading,
  isAdmin,
}: BranchSalesChartProps) {
  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BuildingStorefrontIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Análisis de Ventas por Sucursal
            </h3>
          </div>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BuildingStorefrontIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Análisis de Ventas por Sucursal
            </h3>
          </div>
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500">
              No hay datos de ventas por sucursal para el período seleccionado
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSales = data.reduce((sum, branch) => sum + branch.value, 0);
  const maxSales = Math.max(...data.map((b) => b.value));
  const minSales = Math.min(...data.map((b) => b.value));
  const avgSales = totalSales / data.length;
  const topBranch = data.find((b) => b.value === maxSales);
  const bottomBranch = data.find((b) => b.value === minSales);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate percentage
  const calculatePercentage = (value: number) => {
    return ((value / totalSales) * 100).toFixed(1);
  };

  // Color gradient for bars
  const getBarColor = (value: number, index: number) => {
    const colors = [
      "#6366f1", // Indigo
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#f59e0b", // Amber
      "#10b981", // Green
      "#3b82f6", // Blue
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BuildingStorefrontIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Análisis de Ventas por Sucursal
            </h3>
          </div>
          <div className="text-sm text-gray-500">
            {data.length} {data.length === 1 ? "sucursal" : "sucursales"}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Sales */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
            <p className="text-xs text-indigo-600 font-medium mb-1">
              Total Ventas
            </p>
            <p className="text-xl font-bold text-indigo-900">
              {formatCurrency(totalSales)}
            </p>
          </div>

          {/* Top Branch */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center space-x-1 mb-1">
              <TrophyIcon className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Mejor</p>
            </div>
            <p className="text-sm font-bold text-green-900 truncate">
              {topBranch?.name}
            </p>
            <p className="text-xs text-green-700">
              {formatCurrency(maxSales)}
            </p>
          </div>

          {/* Bottom Branch */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
            <p className="text-xs text-amber-600 font-medium mb-1">
              Menor Venta
            </p>
            <p className="text-sm font-bold text-amber-900 truncate">
              {bottomBranch?.name}
            </p>
            <p className="text-xs text-amber-700">
              {formatCurrency(minSales)}
            </p>
          </div>

          {/* Average Sales */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-1">Promedio</p>
            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(avgSales)}
            </p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-80 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={{ stroke: "#d1d5db" }}
              />
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Ventas",
                ]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar dataKey="value" name="Ventas" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value, index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Details Table */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Detalle por Sucursal
          </h4>
          <div className="space-y-2">
            {data
              .sort((a, b) => b.value - a.value)
              .map((branch, index) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: getBarColor(branch.value, index) }}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">
                      {branch.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(branch.value)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calculatePercentage(branch.value)}% del total
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
