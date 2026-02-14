import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import type { ChartData } from "../../types/reports.types";

interface BranchesBarChartProps {
  data: ChartData[];
  loading: boolean;
  isAdmin: boolean;
}

export function BranchesBarChart({
  data,
  loading,
  isAdmin,
}: BranchesBarChartProps) {
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
              Ventas por Sucursal
            </h3>
          </div>
          <div className="h-80 flex items-center justify-center">
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
              Ventas por Sucursal
            </h3>
          </div>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500">No hay datos de ventas por sucursal</p>
          </div>
        </div>
      </div>
    );
  }

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BuildingStorefrontIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Ventas por Sucursal
          </h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
                formatter={(value) => [formatCurrency(Number(value)), "Ventas"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#6366f1"
                radius={[8, 8, 0, 0]}
                name="Ventas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
