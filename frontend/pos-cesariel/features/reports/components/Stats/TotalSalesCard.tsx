import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import type { SalesReport } from "../../types/reports.types";

interface TotalSalesCardProps {
  salesReport: SalesReport | null;
  loading: boolean;
  startDate: string;
  endDate: string;
}

export function TotalSalesCard({
  salesReport,
  loading,
  startDate,
  endDate,
}: TotalSalesCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Total de Ventas</h3>
          <div className="bg-white/20 rounded-full p-3">
            <CurrencyDollarIcon className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-4">
          <p className="text-sm text-white/80">Período seleccionado</p>
          <p className="text-white font-medium">
            {formatDate(startDate)} - {formatDate(endDate)}
          </p>
        </div>

        {/* Main Stats */}
        <div className="space-y-4">
          {/* Total Sales */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Ventas Totales</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {salesReport
                    ? formatCurrency(salesReport.total_sales)
                    : "$0.00"}
                </p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-white/60" />
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Transactions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingCartIcon className="h-5 w-5 text-white/80" />
                <p className="text-xs text-white/80">Transacciones</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {salesReport?.total_transactions || 0}
              </p>
            </div>

            {/* Average Sale */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-white/80" />
                <p className="text-xs text-white/80">Ticket Promedio</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {salesReport
                  ? formatCurrency(salesReport.average_sale)
                  : "$0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
