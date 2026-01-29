/**
 * BrandsTable Component
 * 
 * Detailed table of top-selling brands with sorting and pagination
 * Shows brand name, products count, quantity sold, and revenue
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
import { TopBrand } from "../../types/reports.types";

interface BrandsTableProps {
  data: TopBrand[];
}

type SortField = "brand_name" | "products_count" | "quantity_sold" | "total_revenue";
type SortDirection = "asc" | "desc";

export function BrandsTable({ data }: BrandsTableProps) {
  const [sortField, setSortField] = useState<SortField>("total_revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Sorting logic
  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortField) {
      case "brand_name":
        return multiplier * a.brand_name.localeCompare(b.brand_name);
      case "products_count":
        return multiplier * (a.products_count - b.products_count);
      case "quantity_sold":
        return multiplier * (a.quantity_sold - b.quantity_sold);
      case "total_revenue":
        const aRevenue = typeof a.total_revenue === "string" ? parseFloat(a.total_revenue) : a.total_revenue;
        const bRevenue = typeof b.total_revenue === "string" ? parseFloat(b.total_revenue) : b.total_revenue;
        return multiplier * (aRevenue - bRevenue);
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
          Marcas Más Vendidas
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
                onClick={() => handleSort("brand_name")}
              >
                Marca <SortIndicator field="brand_name" />
              </TableHead>
              <TableHead
                className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("products_count")}
              >
                Productos <SortIndicator field="products_count" />
              </TableHead>
              <TableHead
                className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("quantity_sold")}
              >
                Unidades <SortIndicator field="quantity_sold" />
              </TableHead>
              <TableHead
                className="text-right font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("total_revenue")}
              >
                Revenue <SortIndicator field="total_revenue" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No hay marcas para mostrar
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((brand, index) => {
                const globalRank = currentPage * pageSize + index;
                const revenue = typeof brand.total_revenue === "string" 
                  ? parseFloat(brand.total_revenue) || 0
                  : brand.total_revenue || 0;

                return (
                  <TableRow
                    key={`${brand.brand_id}-${index}`}
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
                      {brand.brand_name || "Sin nombre"}
                      {globalRank === 0 && (
                        <span className="ml-2 text-xs text-yellow-600 font-semibold">
                          🏆 Marca Top
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {(brand.products_count || 0).toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {(brand.quantity_sold || 0).toLocaleString("es-AR")} unidades
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      $
                      {revenue.toLocaleString("es-AR", {
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
            {sortedData.length} marcas
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
