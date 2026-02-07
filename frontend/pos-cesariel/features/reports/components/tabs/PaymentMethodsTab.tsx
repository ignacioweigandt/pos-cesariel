/**
 * PaymentMethodsTab Component
 * 
 * Comprehensive analysis of sales by payment method:
 * - Pie chart showing distribution
 * - Bar chart for comparison
 * - Detailed table with sorting and pagination
 * - Key metrics: Most used method, highest average ticket
 * 
 * Uses React Query for data fetching via useDetailedSalesReport hook.
 */

import { useState } from "react";
import {
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartPieIcon,
  ChartBarIcon as ChartBarIconOutline,
} from "@heroicons/react/24/outline";
// ✅ OPTIMIZATION: Dynamic imports for recharts (~150KB saved from initial bundle)
import {
  DynamicBarChart as BarChart,
  DynamicBar as Bar,
  DynamicPieChart as PieChart,
  DynamicPie as Pie,
  DynamicCell as Cell,
  DynamicXAxis as XAxis,
  DynamicYAxis as YAxis,
  DynamicCartesianGrid as CartesianGrid,
  DynamicTooltip as Tooltip,
  DynamicLegend as Legend,
  DynamicResponsiveContainer as ResponsiveContainer,
} from "../Charts/LazyCharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { LoadingSkeleton, EmptyState } from "../shared";
import { useDetailedSalesReport } from "../../hooks";
import { MetricCard } from "../cards/MetricCard";

interface PaymentMethodsTabProps {
  startDate: string;
  endDate: string;
  branchId?: number;
  branchName?: string;
}

type SortField = "method" | "sales" | "transactions" | "avgTicket";
type SortDirection = "asc" | "desc";

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export function PaymentMethodsTab({
  startDate,
  endDate,
  branchId,
  branchName,
}: PaymentMethodsTabProps) {
  const [sortField, setSortField] = useState<SortField>("sales");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  // Fetch detailed sales report (includes payment methods data)
  const {
    data: detailedReport,
    isLoading,
    error,
  } = useDetailedSalesReport(startDate, endDate, branchId);

  if (error) {
    return (
      <EmptyState
        title="Error al cargar datos"
        description="Ocurrió un error al cargar los datos de métodos de pago. Por favor, intenta nuevamente."
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

  const paymentMethodsData = detailedReport?.sales_by_payment_method || [];

  if (paymentMethodsData.length === 0) {
    return (
      <EmptyState
        title="Sin datos de métodos de pago"
        description="No hay ventas registradas en el período seleccionado."
      />
    );
  }

  // Transform data for table with average ticket calculation
  const tableData = paymentMethodsData.map((method) => ({
    method: method.payment_method,
    sales: parseFloat(method.total_sales.toString()),
    transactions: method.transaction_count,
    avgTicket:
      method.transaction_count > 0
        ? parseFloat(method.total_sales.toString()) / method.transaction_count
        : 0,
  }));

  // Calculate key metrics
  const totalSales = tableData.reduce((sum, item) => sum + item.sales, 0);
  const totalTransactions = tableData.reduce(
    (sum, item) => sum + item.transactions,
    0
  );
  const mostUsedMethod = [...tableData].sort(
    (a, b) => b.transactions - a.transactions
  )[0];
  const highestAvgMethod = [...tableData].sort(
    (a, b) => b.avgTicket - a.avgTicket
  )[0];

  // Sorting logic
  const sortedData = [...tableData].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "method":
        return multiplier * a.method.localeCompare(b.method);
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

  // Pagination
  const paginatedData = sortedData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const totalPages = Math.ceil(sortedData.length / pageSize);

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
      name: item.method,
      value: item.sales,
      transactions: item.transactions,
    }));

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Ventas"
          value={totalSales}
          prefix="$"
          icon={CreditCardIcon}
          trend="neutral"
        />
        <MetricCard
          title="Método Más Usado"
          value={mostUsedMethod?.method || "-"}
          subtitle={`${mostUsedMethod?.transactions || 0} transacciones`}
          icon={CreditCardIcon}
          trend="up"
        />
        <MetricCard
          title="Mayor Ticket Promedio"
          value={highestAvgMethod?.avgTicket || 0}
          prefix="$"
          subtitle={highestAvgMethod?.method || "-"}
          icon={CreditCardIcon}
          trend="up"
        />
      </div>

      {/* Chart Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Distribución de Ventas por Método de Pago
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
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
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
                <Bar dataKey="value" name="Ventas" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Table Header Controls */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalle por Método de Pago
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(0);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold w-16">Rank</TableHead>
                <TableHead
                  className="font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("method")}
                >
                  Método de Pago <SortIndicator field="method" />
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
              {paginatedData.map((method, index) => {
                const globalRank = currentPage * pageSize + index;
                const percentage = (method.sales / totalSales) * 100;

                return (
                  <TableRow
                    key={`method-${method.method}-${index}`}
                    className={globalRank === 0 ? "bg-blue-50" : ""}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          globalRank === 0
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        #{globalRank + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {method.method}
                      {globalRank === 0 && (
                        <span className="ml-2 text-xs text-blue-600 font-semibold">
                          🏆 Top
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      $
                      {method.sales.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {method.transactions.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      $
                      {method.avgTicket.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {currentPage * pageSize + 1} -{" "}
              {Math.min((currentPage + 1) * pageSize, sortedData.length)} de{" "}
              {sortedData.length} métodos
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Recaudado</p>
            <p className="text-2xl font-bold">
              ${totalSales.toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Transacciones</p>
            <p className="text-2xl font-bold">
              {totalTransactions.toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Métodos Activos</p>
            <p className="text-2xl font-bold">{tableData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
