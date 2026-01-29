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
  MagnifyingGlassIcon,
  XMarkIcon,
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
import { Input } from "@/shared/components/ui/input";
import { apiClient } from "@/shared/api/client";
import { LoadingSkeleton, EmptyState } from "../shared";
import { useDebounce } from "@/shared/hooks/useDebounce";

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
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  // Debounce search and amounts to avoid hammering backend and losing focus
  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedMinAmount = useDebounce(minAmount, 500);
  const debouncedMaxAmount = useDebounce(maxAmount, 500);

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
      orderStatusFilter,
      debouncedSearch, // Use debounced values to avoid losing focus
      debouncedMinAmount,
      debouncedMaxAmount,
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
      if (orderStatusFilter) params.order_status = orderStatusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      if (debouncedMinAmount) params.min_amount = parseFloat(debouncedMinAmount);
      if (debouncedMaxAmount) params.max_amount = parseFloat(debouncedMaxAmount);

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

  // Clear all filters
  const clearAllFilters = () => {
    setSaleTypeFilter(undefined);
    setPaymentMethodFilter(undefined);
    setOrderStatusFilter(undefined);
    setSearchQuery("");
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters =
    saleTypeFilter ||
    paymentMethodFilter ||
    orderStatusFilter ||
    searchQuery ||
    minAmount ||
    maxAmount;

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

    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      DELIVERED: "bg-green-100 text-green-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    const labels: Record<string, string> = {
      PENDING: "Pendiente",
      PROCESSING: "Procesando",
      DELIVERED: "Entregado",
      SHIPPED: "Enviado",
      CANCELLED: "Cancelado",
    };

    return (
      <Badge variant="secondary" className={colors[status] || "bg-gray-100 text-gray-800"}>
        {labels[status] || status}
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
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                  Filtros activos
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Limpiar filtros
                </button>
              )}
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

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por N° de venta o nombre de cliente..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Sale Type Filter */}
            <Select
              value={saleTypeFilter || "all"}
              onValueChange={(value) => {
                setSaleTypeFilter(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>

            {/* Order Status Filter */}
            <Select
              value={orderStatusFilter || "all"}
              onValueChange={(value) => {
                setOrderStatusFilter(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PROCESSING">Procesando</SelectItem>
                <SelectItem value="SHIPPED">Enviado</SelectItem>
                <SelectItem value="DELIVERED">Entregado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* Min Amount Filter */}
            <Input
              type="number"
              placeholder="Monto mínimo"
              value={minAmount}
              onChange={(e) => {
                setMinAmount(e.target.value);
                setPage(1);
              }}
              min="0"
              step="0.01"
            />

            {/* Max Amount Filter */}
            <Input
              type="number"
              placeholder="Monto máximo"
              value={maxAmount}
              onChange={(e) => {
                setMaxAmount(e.target.value);
                setPage(1);
              }}
              min="0"
              step="0.01"
            />
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
