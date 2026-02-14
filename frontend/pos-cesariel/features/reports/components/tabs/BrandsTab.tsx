/**
 * BrandsTab Component
 * 
 * Brand analytics dashboard
 * - Brands table with sorting and pagination
 * - Top brands chart (bar + pie)
 * - Key metrics: Total brands, top brand, concentration
 */

import {
  TagIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { MetricCard } from "../cards/MetricCard";
import { LoadingSkeleton, EmptyState } from "../shared";
import { LazyProductsPieChart as ProductsPieChart } from "../Charts/LazyCharts";
import { useBrandsChart } from "../../hooks";
import { BrandsTable } from "../Tables/BrandsTable";

interface BrandsTabProps {
  startDate: string;
  endDate: string;
  branchId?: number;
  branchName?: string;
}

export function BrandsTab({
  startDate,
  endDate,
  branchId,
  branchName,
}: BrandsTabProps) {
  // Fetch brands data
  const {
    data: brandsData,
    isLoading: brandsLoading,
    error: brandsError,
  } = useBrandsChart(startDate, endDate, branchId, true, 50); // Get top 50 brands

  if (brandsError) {
    return (
      <EmptyState
        title="Error al cargar datos"
        description="Ocurrió un error al cargar los datos de marcas. Por favor, intenta nuevamente."
      />
    );
  }

  if (brandsLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" count={3} />
        <LoadingSkeleton type="table" count={10} />
        <LoadingSkeleton type="chart" />
      </div>
    );
  }

  // Calculate metrics
  const totalBrands = brandsData?.length || 0;
  const topBrand = brandsData && brandsData.length > 0 ? brandsData[0] : null;

  // Calculate total revenue
  const totalRevenue = brandsData?.reduce((sum, brand) => {
    const revenue = typeof brand.total_revenue === "string" 
      ? parseFloat(brand.total_revenue) 
      : brand.total_revenue;
    return sum + revenue;
  }, 0) || 0;

  // Calculate top 3 concentration
  const top3Revenue = brandsData?.slice(0, 3).reduce((sum, brand) => {
    const revenue = typeof brand.total_revenue === "string" 
      ? parseFloat(brand.total_revenue) 
      : brand.total_revenue;
    return sum + revenue;
  }, 0) || 0;
  const concentration = totalRevenue > 0 ? (top3Revenue / totalRevenue) * 100 : 0;

  // Prepare data for pie chart (top 10)
  const chartData =
    brandsData?.slice(0, 10).map((brand) => ({
      name: brand.brand_name,
      value: typeof brand.total_revenue === "string" 
        ? parseFloat(brand.total_revenue) 
        : brand.total_revenue,
    })) || [];

  const topBrandRevenue = topBrand 
    ? (typeof topBrand.total_revenue === "string" 
        ? parseFloat(topBrand.total_revenue) || 0
        : topBrand.total_revenue || 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Marcas"
          value={totalBrands}
          icon={TagIcon}
          trend="neutral"
          change={0}
        />
        <MetricCard
          title="Marca Top"
          value={topBrandRevenue}
          prefix="$"
          subtitle={topBrand?.brand_name}
          icon={TrophyIcon}
          trend="up"
          change={18.5}
        />
        <MetricCard
          title="Concentración Top 3"
          value={concentration}
          suffix="%"
          icon={ChartBarIcon}
          trend="neutral"
          change={0}
        />
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-purple-600"
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
            <h4 className="text-sm font-semibold text-purple-900 mb-1">
              Análisis de Marcas
              {branchName && ` - ${branchName}`}
            </h4>
            <p className="text-sm text-purple-800">
              Las top 3 marcas representan el{" "}
              <span className="font-bold">{concentration.toFixed(1)}%</span> del
              revenue total.{" "}
              {concentration > 60
                ? "Alta concentración en pocas marcas."
                : "Diversificación balanceada de marcas."}
            </p>
          </div>
        </div>
      </div>

      {/* Brands Table */}
      {brandsData && brandsData.length > 0 ? (
        <BrandsTable data={brandsData} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12">
          <EmptyState
            title="Sin datos de marcas"
            description="No hay marcas vendidas en el período seleccionado."
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Brands Pie Chart */}
        {chartData.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top 10 Marcas
              </h3>
              <p className="text-sm text-gray-600">
                Distribución de revenue por marca
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

        {/* Top Brand Highlight Card */}
        {topBrand && (
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrophyIcon className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Marca Líder</h3>
                </div>
                <p className="text-pink-100 text-sm">
                  Del {startDate} al {endDate}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold mb-1">{topBrand.brand_name}</p>
                <p className="text-pink-100 text-sm">
                  {topBrand.products_count} productos diferentes
                </p>
              </div>

              <div className="border-t border-pink-400 pt-3">
                <p className="text-pink-100 text-sm mb-1">Revenue total</p>
                <p className="text-3xl font-bold">
                  ${(topBrandRevenue || 0).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="border-t border-pink-400 pt-3">
                <p className="text-pink-100 text-sm mb-1">Unidades vendidas</p>
                <p className="text-xl font-semibold">
                  {(topBrand.quantity_sold || 0).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="border-t border-pink-400 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-pink-100 text-xs mb-1">% del total</p>
                  <p className="text-lg font-semibold">
                    {totalRevenue > 0 
                      ? ((topBrandRevenue / totalRevenue) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-pink-100 text-xs mb-1">Precio promedio</p>
                  <p className="text-lg font-semibold">
                    $
                    {(topBrand.quantity_sold || 0) > 0
                      ? ((topBrandRevenue || 0) / (topBrand.quantity_sold || 1)).toFixed(0)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {brandsData && brandsData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen de Marcas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalBrands}</p>
              <p className="text-sm text-gray-600">Marcas Activas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                ${totalBrands > 0 
                  ? (totalRevenue / totalBrands).toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  : "0"}
              </p>
              <p className="text-sm text-gray-600">Revenue Promedio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {totalBrands > 0 
                  ? (brandsData.reduce((sum, b) => sum + (b.quantity_sold || 0), 0) / totalBrands).toFixed(0)
                  : 0}
              </p>
              <p className="text-sm text-gray-600">Unidades por Marca</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {totalBrands > 0 
                  ? (brandsData.reduce((sum, b) => sum + (b.products_count || 0), 0) / totalBrands).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-gray-600">Productos por Marca</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
