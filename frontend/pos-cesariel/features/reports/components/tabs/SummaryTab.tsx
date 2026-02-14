/**
 * SummaryTab Component
 * 
 * Overview dashboard with:
 * - 4 Metric Cards: Total Sales, Orders, Avg Ticket, Products Sold
 * - 4 Charts: Daily Sales, Top Products, Top Branches, Sales by Type
 * 
 * Uses React Query hooks for data fetching and caching.
 */

import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { MetricCard } from "../cards/MetricCard";
import { LoadingSkeleton, EmptyState } from "../shared";
import { LazyDailySalesChart as DailySalesChart } from "../Charts/LazyCharts";
import { LazyProductsPieChart as ProductsPieChart } from "../Charts/LazyCharts";
import { LazyBranchSalesChart as BranchSalesChart } from "../Charts/LazyCharts";
import {
  useDashboardStats,
  useSalesReport,
  useDailySales,
  useProductsChart,
  useBranchesChart,
  useDetailedSalesReport,
} from "../../hooks";

interface SummaryTabProps {
  startDate: string;
  endDate: string;
  branchId?: number;
  isAdmin: boolean;
  branchName?: string;
}

export function SummaryTab({
  startDate,
  endDate,
  branchId,
  isAdmin,
  branchName,
}: SummaryTabProps) {
  // Fetch all data using React Query hooks
  const {
    data: dashboardStats,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboardStats(branchId);

  const {
    data: salesReport,
    isLoading: salesLoading,
    error: salesError,
  } = useSalesReport(startDate, endDate, branchId);

  const {
    data: dailySalesData,
    isLoading: dailySalesLoading,
    error: dailySalesError,
  } = useDailySales(startDate, endDate, branchId);

  const {
    data: productsChartData,
    isLoading: productsLoading,
    error: productsError,
  } = useProductsChart(startDate, endDate, branchId);

  const {
    data: branchesChartData,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranchesChart(startDate, endDate, isAdmin);

  const {
    data: detailedSalesReport,
    isLoading: detailedLoading,
    error: detailedError,
  } = useDetailedSalesReport(startDate, endDate, branchId);

  // Aggregate loading state
  const loading =
    dashboardLoading ||
    salesLoading ||
    dailySalesLoading ||
    productsLoading ||
    detailedLoading ||
    (isAdmin && branchesLoading);

  // Check for errors
  const hasError =
    dashboardError || salesError || dailySalesError || productsError || detailedError;

  if (hasError) {
    return (
      <EmptyState
        title="Error al cargar datos"
        description="Ocurrió un error al cargar los datos del resumen. Por favor, intenta nuevamente."
      />
    );
  }

  // Calculate metrics from data
  const totalSales = salesReport?.total_sales || 0;
  const totalOrders = salesReport?.total_transactions || 0;
  const avgTicket = salesReport?.average_sale || 0;
  const totalProductsSold = dashboardStats?.total_products || 0;

  // Prepare Sales by Type data for chart
  const salesByTypeData =
    detailedSalesReport?.sales_by_type?.map((item) => ({
      name: item.sale_type === "POS" ? "POS" : item.sale_type === "ECOMMERCE" ? "E-commerce" : "WhatsApp",
      value: parseFloat(item.total_sales.toString()),
    })) || [];

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Ventas Totales"
            value={totalSales}
            prefix="$"
            icon={CurrencyDollarIcon}
            trend="up"
            change={12.5}
          />
          <MetricCard
            title="Total Pedidos"
            value={totalOrders}
            icon={ShoppingBagIcon}
            trend="up"
            change={8.3}
          />
          <MetricCard
            title="Ticket Promedio"
            value={avgTicket}
            prefix="$"
            icon={ChartBarIcon}
            trend="neutral"
            change={0}
          />
          <MetricCard
            title="Productos Vendidos"
            value={totalProductsSold}
            icon={CubeIcon}
            trend="down"
            change={-3.2}
          />
        </div>
      )}

      {/* Charts Row 1: Daily Sales + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dailySalesLoading ? (
          <LoadingSkeleton type="chart" />
        ) : dailySalesData && dailySalesData.length > 0 ? (
          <DailySalesChart
            data={dailySalesData}
            loading={false}
            branchName={branchName}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <EmptyState
              title="Sin datos de ventas diarias"
              description="No hay ventas registradas en el período seleccionado."
            />
          </div>
        )}

        {productsLoading ? (
          <LoadingSkeleton type="chart" />
        ) : productsChartData && productsChartData.length > 0 ? (
          <ProductsPieChart
            data={productsChartData}
            loading={false}
            branchName={branchName}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <EmptyState
              title="Sin datos de productos"
              description="No hay productos vendidos en el período seleccionado."
            />
          </div>
        )}
      </div>

      {/* Charts Row 2: Branches (Admin) + Sales by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branches Chart (Admin only) */}
        {isAdmin && (
          branchesLoading ? (
            <LoadingSkeleton type="chart" />
          ) : branchesChartData && branchesChartData.length > 0 ? (
            <BranchSalesChart
              data={branchesChartData}
              loading={false}
              isAdmin={true}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <EmptyState
                title="Sin datos de sucursales"
                description="No hay ventas por sucursal en el período seleccionado."
              />
            </div>
          )
        )}

        {/* Sales by Type Chart */}
        {detailedLoading ? (
          <LoadingSkeleton type="chart" />
        ) : salesByTypeData.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ventas por Canal
                </h3>
                <p className="text-sm text-gray-600">
                  Distribución POS vs E-commerce vs WhatsApp
                </p>
              </div>
            </div>
            <ProductsPieChart
              data={salesByTypeData}
              loading={false}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <EmptyState
              title="Sin datos de canales"
              description="No hay ventas por canal en el período seleccionado."
            />
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      {!loading && salesReport && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Resumen del Período
              </h3>
              <p className="text-indigo-100 text-sm">
                Del {startDate} al {endDate}
                {branchName && ` • ${branchName}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                ${totalSales.toLocaleString("es-AR")}
              </p>
              <p className="text-indigo-100 text-sm">
                en {totalOrders} pedidos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
