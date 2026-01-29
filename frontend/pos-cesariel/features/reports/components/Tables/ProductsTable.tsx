/**
 * ProductsTable Component
 * 
 * Detailed table of top-selling products with sorting and pagination
 * Shows product name, quantity sold, revenue, and average price
 */

import { useState } from "react";
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
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

export interface ProductData {
  name: string;
  quantity: number;
  revenue: number;
}

interface ProductsTableProps {
  data: ProductData[];
}

type SortField = "name" | "quantity" | "revenue" | "avgPrice";
type SortDirection = "asc" | "desc";

export function ProductsTable({ data }: ProductsTableProps) {
  const [sortField, setSortField] = useState<SortField>("revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Calculate average price
  const dataWithAvgPrice = data.map((product) => ({
    ...product,
    avgPrice: product.quantity > 0 ? product.revenue / product.quantity : 0,
  }));

  // Sorting logic
  const sortedData = [...dataWithAvgPrice].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "name":
        return multiplier * a.name.localeCompare(b.name);
      case "quantity":
        return multiplier * (a.quantity - b.quantity);
      case "revenue":
        return multiplier * (a.revenue - b.revenue);
      case "avgPrice":
        return multiplier * (a.avgPrice - b.avgPrice);
      default:
        return 0;
    }
  });

  // Pagination logic
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

  // Ranking badge color
  const getRankBadgeColor = (index: number) => {
    if (index === 0) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (index === 1) return "bg-gray-100 text-gray-800 border-gray-300";
    if (index === 2) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Table Header Controls */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Productos Más Vendidos
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
              <TableHead className="font-semibold w-16">Rank</TableHead>
              <TableHead
                className="font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                Producto <SortIndicator field="name" />
              </TableHead>
              <TableHead
                className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("quantity")}
              >
                Cantidad <SortIndicator field="quantity" />
              </TableHead>
              <TableHead
                className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("revenue")}
              >
                Revenue <SortIndicator field="revenue" />
              </TableHead>
              <TableHead
                className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("avgPrice")}
              >
                Precio Promedio <SortIndicator field="avgPrice" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No hay productos para mostrar
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((product, index) => {
                const globalRank = currentPage * pageSize + index;
                return (
                  <TableRow
                    key={`${product.name}-${index}`}
                    className={globalRank < 3 ? "bg-yellow-50" : ""}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRankBadgeColor(globalRank)}
                      >
                        #{globalRank + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                      {globalRank === 0 && (
                        <span className="ml-2 text-xs text-yellow-600 font-semibold">
                          🏆 Más Vendido
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {(product.quantity || 0).toLocaleString("es-AR")} unidades
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      $
                      {(product.revenue || 0).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      $
                      {(product.avgPrice || 0).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {currentPage * pageSize + 1} -{" "}
            {Math.min((currentPage + 1) * pageSize, sortedData.length)} de{" "}
            {sortedData.length} productos
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
  );
}
