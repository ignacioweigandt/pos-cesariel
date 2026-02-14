/**
 * BranchesTab Component
 * 
 * Branch comparison dashboard (Admin only)
 * - Comparison table between branches
 * - Branch sales chart
 * - Key metrics: best branch, growth, distribution
 */

import { BuildingStorefrontIcon, TrophyIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { MetricCard } from "../cards/MetricCard";
import { LoadingSkeleton, EmptyState } from "../shared";
import { LazyBranchSalesChart as BranchSalesChart } from "../Charts/LazyCharts";
import { useBranchesChart, useSalesReport } from "../../hooks";
import { BranchesComparisonTable, BranchComparison } from "../Tables/BranchesComparisonTable";

interface BranchesTabProps {
  startDate: string;
  endDate: string;
  isAdmin: boolean;
}

export function BranchesTab({ startDate, endDate, isAdmin }: BranchesTabProps) {
  // Fetch branches data
  const {
    data: branchesChartData,
    isLoading: branchesLoading,
    error: branchesError,
  } = useBranchesChart(startDate, endDate, isAdmin);

  const {
    data: salesReport,
    isLoading: salesLoading,
    error: salesError,
  } = useSalesReport(startDate, endDate, undefined); // No branch filter for admin

  // Security check: Only admins can access this tab
  if (!isAdmin) {
    return (
      <EmptyState
        title="Acceso Denegado"
        description="Solo los administradores pueden ver la comparación de sucursales."
      />
    );
  }

  const loading = branchesLoading || salesLoading;
  const hasError = branchesError || salesError;

  if (hasError) {
    return (
      <EmptyState
        title="Error al cargar datos"
        description="Ocurrió un error al cargar los datos de sucursales. Por favor, intenta nuevamente."
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" count={3} />
        <LoadingSkeleton type="table" count={5} />
        <LoadingSkeleton type="chart" />
      </div>
    );
  }

  // Calculate total sales from branches data
  const totalSales = branchesChartData?.reduce(
    (sum, branch) => sum + Number(branch.total_sales || 0), 
    0
  ) || 0;
  const totalBranches = branchesChartData?.length || 0;

  // Prepare data for comparison table
  const tableData: BranchComparison[] =
    branchesChartData?.map((branch) => ({
      branch_id: branch.branch_id,
      branch_name: branch.branch_name,
      total_sales: Number(branch.total_sales || 0),
      orders_count: branch.orders_count,
      average_ticket:
        branch.orders_count > 0 ? Number(branch.total_sales || 0) / branch.orders_count : 0,
      percentage_of_total:
        totalSales > 0 ? (Number(branch.total_sales || 0) / totalSales) * 100 : 0,
    })) || [];

  // Find best branch
  const bestBranch =
    tableData.length > 0
      ? tableData.reduce((max, branch) =>
          branch.total_sales > max.total_sales ? branch : max
        )
      : null;

  // Calculate average sales per branch
  const avgSalesPerBranch = totalBranches > 0 ? totalSales / totalBranches : 0;

  // Calculate concentration (% top 3 branches)
  const top3Sales = tableData
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 3)
    .reduce((sum, branch) => sum + branch.total_sales, 0);
  const concentration = totalSales > 0 ? (top3Sales / totalSales) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Sucursales"
          value={totalBranches}
          icon={BuildingStorefrontIcon}
          trend="neutral"
          change={0}
        />
        <MetricCard
          title="Mejor Sucursal"
          value={bestBranch ? bestBranch.total_sales : 0}
          prefix="$"
          subtitle={bestBranch?.branch_name}
          icon={TrophyIcon}
          trend="up"
          change={15.2}
        />
        <MetricCard
          title="Promedio por Sucursal"
          value={avgSalesPerBranch}
          prefix="$"
          icon={ChartBarIcon}
          trend="neutral"
          change={0}
        />
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Análisis de Concentración
            </h4>
            <p className="text-sm text-blue-800">
              Las top 3 sucursales representan el{" "}
              <span className="font-bold">{concentration.toFixed(1)}%</span> de
              las ventas totales. {concentration > 70
                ? "Alta concentración - considera estrategias para equilibrar."
                : "Distribución balanceada entre sucursales."}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      {tableData.length > 0 ? (
        <BranchesComparisonTable data={tableData} totalSales={totalSales} />
      ) : (
        <EmptyState
          title="Sin datos de sucursales"
          description="No hay datos de sucursales en el período seleccionado."
        />
      )}

      {/* Branch Sales Chart */}
      {branchesChartData && branchesChartData.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Comparación Visual de Ventas
            </h3>
            <p className="text-sm text-gray-600">
              Ventas totales por sucursal en el período seleccionado
            </p>
          </div>
          <BranchSalesChart
            data={branchesChartData}
            loading={false}
            isAdmin={true}
          />
        </div>
      ) : (
        <EmptyState
          title="Sin gráfico de sucursales"
          description="No hay datos suficientes para mostrar el gráfico."
        />
      )}

      {/* Insights Card */}
      {bestBranch && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrophyIcon className="h-6 w-6" />
                <h3 className="text-lg font-semibold">
                  Sucursal Destacada del Período
                </h3>
              </div>
              <p className="text-green-100 text-sm mb-3">
                Del {startDate} al {endDate}
              </p>
              <p className="text-2xl font-bold mb-1">{bestBranch.branch_name || "N/A"}</p>
              <p className="text-green-100 text-sm">
                {bestBranch.orders_count || 0} pedidos •{" "}
                {(bestBranch.percentage_of_total || 0).toFixed(1)}% del total
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">
                ${(bestBranch.total_sales || 0).toLocaleString("es-AR")}
              </p>
              <p className="text-green-100 text-sm mt-1">
                Ticket promedio: ${(bestBranch.average_ticket || 0).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
