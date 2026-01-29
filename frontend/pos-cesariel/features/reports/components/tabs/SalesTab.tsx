/**
 * SalesTab Component
 * 
 * Detailed table of all individual sales with:
 * - Full sale details (number, date, branch, customer, items, total, payment, status)
 * - Server-side pagination
 * - Column sorting
 * - Filters: sale type, payment method
 * - Export functionality
 * 
 * Uses React Query for data fetching with automatic refetching.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
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
import { apiClient } from "@/shared/api/client";
import { LoadingSkeleton, EmptyState } from "../shared";

interface SalesTabProps {
  startDate: string;
  endDate: string;
  branchId?: number;
  branchName?: string;
}

interface SaleItem {
  id: number;
  sale_number: string;
  sale_type: string;
  branch_name: string;
  customer_name: string | null;
  items_count: number;
  total_amount: string;
  payment_method: string;
  order_status: string | null;
  created_at: string;
}

interface SalesListResponse {
  items: SaleItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

type SortField = "created_at" | "total_amount" | "sale_number";
type SortDirection = "asc" | "desc";

export function SalesTab({
  startDate,
  endDate,
  branchId,
  branchName,
}: SalesTabProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [saleTypeFilter, setSaleTypeFilter] = useState<string | undefined>(undefined);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | undefined>(undefined);

  // Fetch sales list
  const {
    data: salesData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<SalesListResponse>({
    queryKey: [
      "sales-list",
      startDate,
      endDate,
      branchId,
      page,
      pageSize,
      sortField,
      sortDirection,
      saleTypeFilter,
      paymentMethodFilter,
    ],
    queryFn: async () => {
      const params: any = {
        start_date: startDate,
        end_date: endDate,
        page,
        page_size: pageSize,
        order_by: sortField,
        order_dir: sortDirection,
      };

      if (branchId) params.branch_id = branchId;
      if (saleTypeFilter) params.sale_type = saleTypeFilter;
      if (paymentMethodFilter) params.payment_method = paymentMethodFilter;

      const response = await apiClient.get("/reports/sales-list", { params });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(1); // Reset to first page
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

  // Format date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get badge color for sale type
  const getSaleTypeBadge = (saleType: string) => {
    const colors = {
      POS: "bg-blue-100 text-blue-800 border-blue-300",
      ECOMMERCE: "bg-green-100 text-green-800 border-green-300",
    };
    return colors[saleType as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Get badge color for order status
  const getStatusBadge = (status: string | null) => {
    if (!status) return null;

    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      DELIVERED: "bg-green-100 text-green-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    const labels = {
      PENDING: "Pendiente",
      PROCESSING: "Procesando",
      DELIVERED: "Entregado",
      SHIPPED: "Enviado",
      CANCELLED: "Cancelado",
    };

    return (
      <Badge variant="secondary" className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (error) {
    return (
      <EmptyState
        title="Error al cargar datos"
        description="Ocurrió un error al cargar la lista de ventas. Por favor, intenta nuevamente."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="table" count={10} />
      </div>
    );
  }

  const sales = salesData?.items || [];
  const totalSales = salesData?.total || 0;
  const totalPages = salesData?.total_pages || 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Total de Ventas</p>
            <p className="text-3xl font-bold">{totalSales.toLocaleString("es-AR")}</p>
            <p className="text-indigo-100 text-sm mt-1">
              Del {startDate} al {endDate}
              {branchName && ` • ${branchName}`}
            </p>
          </div>
          <CurrencyDollarIcon className="h-16 w-16 text-indigo-200" />
        </div>
      </Card>

      {/* Filters Row */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Sale Type Filter */}
            <Select
              value={saleTypeFilter || "all"}
              onValueChange={(value) => {
                setSaleTypeFilter(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo de venta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="POS">POS</SelectItem>
                <SelectItem value="ECOMMERCE">E-commerce</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select
              value={paymentMethodFilter || "all"}
              onValueChange={(value) => {
                setPaymentMethodFilter(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="MercadoPago">MercadoPago</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              title="Actualizar"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Table Header Controls */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Ventas ({totalSales.toLocaleString("es-AR")})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead
                  className="font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("sale_number")}
                >
                  N° Venta <SortIndicator field="sale_number" />
                </TableHead>
                <TableHead
                  className="font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("created_at")}
                >
                  Fecha/Hora <SortIndicator field="created_at" />
                </TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Sucursal</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="text-right font-semibold">Items</TableHead>
                <TableHead
                  className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("total_amount")}
                >
                  Total <SortIndicator field="total_amount" />
                </TableHead>
                <TableHead className="font-semibold">Pago</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No hay ventas para mostrar con los filtros seleccionados
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      {sale.sale_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {formatDate(sale.created_at)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(sale.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSaleTypeBadge(sale.sale_type)}>
                        {sale.sale_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{sale.branch_name}</TableCell>
                    <TableCell className="text-sm">
                      {sale.customer_name || (
                        <span className="text-gray-400 italic">Sin cliente</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {sale.items_count}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      $
                      {parseFloat(sale.total_amount).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-sm">{sale.payment_method}</TableCell>
                    <TableCell>{getStatusBadge(sale.order_status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, totalSales)} de {totalSales} ventas
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
