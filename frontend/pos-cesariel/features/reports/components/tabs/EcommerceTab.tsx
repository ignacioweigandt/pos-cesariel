/**
 * EcommerceTab Component
 * 
 * Channel comparison analysis: POS vs E-commerce vs WhatsApp
 * - Pie chart showing distribution by sale type
 * - Bar chart for comparison
 * - Detailed table with metrics per channel
 * - Key insights: Dominant channel, growth opportunities
 * 
 * Uses React Query for data fetching via useDetailedSalesReport hook.
 */

import { useState } from "react";
import {
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartPieIcon,
  ChartBarIcon as ChartBarIconOutline,
} from "@heroicons/react/24/outline";
import {
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { LoadingSkeleton, EmptyState } from "../shared";
import { useDetailedSalesReport } from "../../hooks";
import { MetricCard } from "../cards/MetricCard";

interface EcommerceTabProps {
  startDate: string;
  endDate: string;
  branchId?: number;
  branchName?: string;
}

type SortField = "channel" | "sales" | "transactions" | "avgTicket";
type SortDirection = "asc" | "desc";

const COLORS = {
  POS: "#3B82F6", // Blue
  ECOMMERCE: "#10B981", // Green
  WHATSAPP: "#8B5CF6", // Purple
};

const CHANNEL_LABELS = {
  POS: "POS (Tienda Física)",
  ECOMMERCE: "E-commerce",
  WHATSAPP: "WhatsApp",
};

const CHANNEL_ICONS = {
  POS: BuildingStorefrontIcon,
  ECOMMERCE: ShoppingCartIcon,
  WHATSAPP: ChatBubbleLeftRightIcon,
};

export function EcommerceTab({
  startDate,
  endDate,
  branchId,
  branchName,
}: EcommerceTabProps) {
  const [sortField, setSortField] = useState<SortField>("sales");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  // Fetch detailed sales report (includes sale types data)
  const {
    data: detailedReport,
    isLoading,
    error,
  } = useDetailedSalesReport(startDate, endDate, branchId);

  if (error) {
    return (
      <EmptyState
        title="Error al cargar datos"
        description="Ocurrió un error al cargar los datos de canales de venta. Por favor, intenta nuevamente."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" count={3} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  const saleTypesData = detailedReport?.sales_by_type || [];

  if (saleTypesData.length === 0) {
    return (
      <EmptyState
        title="Sin datos de canales"
        description="No hay ventas registradas en el período seleccionado."
      />
    );
  }

  // Transform data for table with average ticket calculation
  const tableData = saleTypesData.map((type) => ({
    channel: type.sale_type,
    sales: parseFloat(type.total_sales.toString()),
    transactions: type.transaction_count,
    avgTicket:
      type.transaction_count > 0
        ? parseFloat(type.total_sales.toString()) / type.transaction_count
        : 0,
  }));

  // Calculate key metrics
  const totalSales = tableData.reduce((sum, item) => sum + item.sales, 0);
  const totalTransactions = tableData.reduce(
    (sum, item) => sum + item.transactions,
    0
  );
  const dominantChannel = [...tableData].sort(
    (a, b) => b.sales - a.sales
  )[0];
  const highestAvgChannel = [...tableData].sort(
    (a, b) => b.avgTicket - a.avgTicket
  )[0];

  // Sorting logic
  const sortedData = [...tableData].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "channel":
        return multiplier * a.channel.localeCompare(b.channel);
      case "sales":
        return multiplier * (a.sales - b.sales);
      case "transactions":
        return multiplier * (a.transactions - b.transactions);
      case "avgTicket":
        return multiplier * (a.avgTicket - b.avgTicket);
      default:
        return 0;
    }
  });

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort indicator component
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 inline ml-1" />
    );
  };

  // Prepare chart data (sorted by sales descending)
  const chartData = [...tableData]
    .sort((a, b) => b.sales - a.sales)
    .map((item) => ({
      name: CHANNEL_LABELS[item.channel as keyof typeof CHANNEL_LABELS] || item.channel,
      value: item.sales,
      transactions: item.transactions,
      channel: item.channel,
    }));

  // Get icon for channel
  const getChannelIcon = (channel: string) => {
    const Icon = CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Ventas"
          value={totalSales}
          prefix="$"
          icon={ShoppingCartIcon}
          trend="neutral"
        />
        <MetricCard
          title="Canal Dominante"
          value={CHANNEL_LABELS[dominantChannel?.channel as keyof typeof CHANNEL_LABELS] || "-"}
          subtitle={`${((dominantChannel?.sales / totalSales) * 100).toFixed(1)}% del total`}
          icon={CHANNEL_ICONS[dominantChannel?.channel as keyof typeof CHANNEL_ICONS] || ShoppingCartIcon}
          trend="up"
        />
        <MetricCard
          title="Mayor Ticket Promedio"
          value={highestAvgChannel?.avgTicket || 0}
          prefix="$"
          subtitle={CHANNEL_LABELS[highestAvgChannel?.channel as keyof typeof CHANNEL_LABELS] || "-"}
          icon={CHANNEL_ICONS[highestAvgChannel?.channel as keyof typeof CHANNEL_ICONS] || ShoppingCartIcon}
          trend="up"
        />
      </div>

      {/* Chart Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Comparación de Canales de Venta
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {branchName && `${branchName} • `}
              {startDate} al {endDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType("pie")}
              className={`p-2 rounded transition-colors ${
                chartType === "pie"
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Gráfico de torta"
            >
              <ChartPieIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`p-2 rounded transition-colors ${
                chartType === "bar"
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Gráfico de barras"
            >
              <ChartBarIconOutline className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="h-96">
          {chartType === "pie" ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`pie-${entry.channel}-${index}`}
                      fill={COLORS[entry.channel as keyof typeof COLORS] || "#94A3B8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `$${value.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `$${value.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
                <Legend />
                <Bar dataKey="value" name="Ventas">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`bar-${entry.channel}-${index}`}
                      fill={COLORS[entry.channel as keyof typeof COLORS] || "#94A3B8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Table Header */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Análisis Detallado por Canal
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold w-16">Rank</TableHead>
                <TableHead
                  className="font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("channel")}
                >
                  Canal de Venta <SortIndicator field="channel" />
                </TableHead>
                <TableHead
                  className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("sales")}
                >
                  Total Ventas <SortIndicator field="sales" />
                </TableHead>
                <TableHead
                  className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("transactions")}
                >
                  Transacciones <SortIndicator field="transactions" />
                </TableHead>
                <TableHead
                  className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("avgTicket")}
                >
                  Ticket Promedio <SortIndicator field="avgTicket" />
                </TableHead>
                <TableHead className="text-right font-semibold">
                  % del Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((channel, index) => {
                const percentage = (channel.sales / totalSales) * 100;
                const channelLabel = CHANNEL_LABELS[channel.channel as keyof typeof CHANNEL_LABELS] || channel.channel;

                return (
                  <TableRow
                    key={`channel-${channel.channel}-${index}`}
                    className={index === 0 ? "bg-gradient-to-r from-blue-50 to-indigo-50" : ""}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          index === 0
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(channel.channel)}
                        <span>{channelLabel}</span>
                        {index === 0 && (
                          <span className="ml-2 text-xs text-blue-600 font-semibold">
                            🏆 Líder
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      $
                      {channel.sales.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {channel.transactions.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      $
                      {channel.avgTicket.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <Badge variant="secondary" className="min-w-[60px] justify-center">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dominant Channel Insight */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              {getChannelIcon(dominantChannel?.channel)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">
                Canal Dominante
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                <strong>{CHANNEL_LABELS[dominantChannel?.channel as keyof typeof CHANNEL_LABELS]}</strong> es tu canal principal, representando el{" "}
                <strong>{((dominantChannel?.sales / totalSales) * 100).toFixed(1)}%</strong> de tus ventas totales.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Ventas</p>
                  <p className="font-bold text-blue-600">
                    ${dominantChannel?.sales.toLocaleString("es-AR")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Transacciones</p>
                  <p className="font-bold text-blue-600">
                    {dominantChannel?.transactions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Growth Opportunity Insight */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ChartBarIconOutline className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">
                Oportunidad de Crecimiento
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                Los canales digitales ({" "}
                <strong>E-commerce + WhatsApp</strong>) representan un{" "}
                <strong>
                  {(
                    ((tableData.find((t) => t.channel === "ECOMMERCE")?.sales || 0) +
                      (tableData.find((t) => t.channel === "WHATSAPP")?.sales || 0)) /
                    totalSales *
                    100
                  ).toFixed(1)}
                  %
                </strong>{" "}
                de tus ventas totales.
              </p>
              <p className="text-xs text-gray-600">
                💡 Considera invertir en marketing digital para potenciar estos canales.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Total Recaudado</p>
            <p className="text-2xl font-bold">
              ${totalSales.toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Total Transacciones</p>
            <p className="text-2xl font-bold">
              {totalTransactions.toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Canales Activos</p>
            <p className="text-2xl font-bold">{tableData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
