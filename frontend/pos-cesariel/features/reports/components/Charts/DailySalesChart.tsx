import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailySales } from "../../types/reports.types";

interface DailySalesChartProps {
  data: DailySales[];
  loading: boolean;
  branchName?: string;
}

export function DailySalesChart({ data, loading, branchName }: DailySalesChartProps) {
  const title = branchName ? `Ventas Diarias - ${branchName}` : 'Ventas Diarias';

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {title}
          </h3>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {title}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString()
                }
              />
              <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString()
                }
                formatter={(value) => [
                  `$${Number(value).toFixed(2)}`,
                  "Ventas",
                ]}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
