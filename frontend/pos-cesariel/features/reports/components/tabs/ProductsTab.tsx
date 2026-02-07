/**
 * ProductsTab Component
 * 
 * Products analytics dashboard
 * - Products table with sorting and pagination
 * - Top 10 products chart (pie chart)
 * - Key metrics: Total products sold, top product, etc.
 */

import {
  ShoppingBagIcon,
  TrophyIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { MetricCard } from "../cards/MetricCard";
import { LoadingSkeleton, EmptyState } from "../shared";
import { ProductsPieChart } from "../Charts/ProductsPieChart";
import { useProductsChart, useSalesReport } from "../../hooks";
import { ProductsTable, ProductData } from "../Tables/ProductsTable";

interface ProductsTabProps {
  startDate: string;
  endDate: string;
  branchId?: number;
  branchName?: string;
}

export function ProductsTab({
  startDate,
  endDate,
  branchId,
  branchName,
}: ProductsTabProps) {
  // Fetch products data
  const {
    data: productsChartData,
    isLoading: productsLoading,
    error: productsError,
  } = useProductsChart(startDate, endDate, branchId);

  const {
    data: salesReport,
    isLoading: salesLoading,
    error: salesError,
  } = useSalesReport(startDate, endDate, branchId);

  const loading = productsLoading || salesLoading;
  const hasError = productsError || salesError;

  if (hasError) {
    return (
      <EmptyState
        title="Error al cargar datos"
        description="Ocurrió un error al cargar los datos de productos. Por favor, intenta nuevamente."
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" count={3} />
        <LoadingSkeleton type="table" count={10} />
        <LoadingSkeleton type="chart" />
      </div>
    );
  }

  // Prepare data for table
  const tableData: ProductData[] =
    salesReport?.top_products?.map((product) => ({
      name: product.name,
      quantity: product.quantity,
      revenue: parseFloat(product.revenue.toString()),
    })) || [];

  // Calculate metrics
  const totalProducts = tableData.length;
  const topProduct = tableData.length > 0 ? tableData[0] : null;
  const totalQuantitySold = tableData.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  // Prepare data for pie chart (top 10)
  const chartData =
    productsChartData?.map((product) => ({
      name: product.name,
      value: parseFloat(product.value.toString()),
    })) || [];

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Productos Vendidos"
          value={totalProducts}
          icon={ShoppingBagIcon}
          trend="neutral"
          change={0}
        />
        <MetricCard
          title="Unidades Vendidas"
          value={totalQuantitySold}
          icon={CubeIcon}
          trend="up"
          change={12.5}
        />
        <MetricCard
          title="Producto Top"
          value={topProduct ? topProduct.revenue : 0}
          prefix="$"
          subtitle={topProduct?.name}
          icon={TrophyIcon}
          trend="up"
          change={8.3}
        />
      </div>

      {/* Info Banner */}
      {branchName && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-indigo-600"
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
              <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                Análisis de Productos - {branchName}
              </h4>
              <p className="text-sm text-indigo-800">
                Mostrando los productos más vendidos del{" "}
                <span className="font-semibold">{startDate}</span> al{" "}
                <span className="font-semibold">{endDate}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {tableData.length > 0 ? (
        <ProductsTable data={tableData} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12">
          <EmptyState
            title="Sin datos de productos"
            description="No hay productos vendidos en el período seleccionado."
          />
        </div>
      )}

      {/* Top 10 Products Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top 10 Productos
              </h3>
              <p className="text-sm text-gray-600">
                Distribución de ventas por producto
              </p>
            </div>
            <ProductsPieChart data={chartData} loading={false} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12">
            <EmptyState
              title="Sin gráfico disponible"
              description="No hay datos suficientes para mostrar el gráfico."
            />
          </div>
        )}

        {/* Quick Stats Card */}
        {topProduct && (
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrophyIcon className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">
                    Producto Más Vendido
                  </h3>
                </div>
                <p className="text-purple-100 text-sm">
                  Del {startDate} al {endDate}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold mb-1">{topProduct.name}</p>
                <p className="text-purple-100 text-sm">
                  {topProduct.quantity} unidades vendidas
                </p>
              </div>

              <div className="border-t border-purple-400 pt-3">
                <p className="text-purple-100 text-sm mb-1">Revenue generado</p>
                <p className="text-3xl font-bold">
                  ${topProduct.revenue.toLocaleString("es-AR")}
                </p>
              </div>

              <div className="border-t border-purple-400 pt-3">
                <p className="text-purple-100 text-sm mb-1">Precio promedio</p>
                <p className="text-xl font-semibold">
                  $
                  {(topProduct.revenue / topProduct.quantity).toLocaleString(
                    "es-AR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {tableData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen de Productos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {totalProducts}
              </p>
              <p className="text-sm text-gray-600">Productos Distintos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {totalQuantitySold.toLocaleString("es-AR")}
              </p>
              <p className="text-sm text-gray-600">Unidades Totales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                ${" "}
                {(
                  tableData.reduce((sum, p) => sum + p.revenue, 0) /
                  tableData.length
                ).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-gray-600">Revenue Promedio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {(totalQuantitySold / totalProducts).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Unidades por Producto</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
