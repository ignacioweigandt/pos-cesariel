/**
 * BranchesComparisonTable Component
 * 
 * Comparison table between branches (Admin only)
 * Shows sales, orders, average ticket, and % of total for each branch
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

export interface BranchComparison {
  branch_id: number;
  branch_name: string;
  total_sales: number;
  orders_count: number;
  average_ticket: number;
  percentage_of_total: number;
}

interface BranchesComparisonTableProps {
  data: BranchComparison[];
  totalSales: number;
}

export function BranchesComparisonTable({
  data,
  totalSales,
}: BranchesComparisonTableProps) {
  // Calculate percentages and rankings
  const dataWithPercentage = data.map((branch) => ({
    ...branch,
    percentage_of_total: totalSales > 0 ? (branch.total_sales / totalSales) * 100 : 0,
  }));

  // Sort by total_sales descending
  const sortedData = [...dataWithPercentage].sort(
    (a, b) => b.total_sales - a.total_sales
  );

  const getBadgeColor = (rank: number) => {
    if (rank === 0) return "bg-green-100 text-green-800 border-green-300";
    if (rank === 1) return "bg-blue-100 text-blue-800 border-blue-300";
    if (rank === 2) return "bg-purple-100 text-purple-800 border-purple-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getPerformanceIndicator = (percentage: number) => {
    if (percentage >= 40)
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowUpIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Excelente</span>
        </div>
      );
    if (percentage >= 25)
      return (
        <div className="flex items-center gap-1 text-blue-600">
          <ArrowUpIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Bueno</span>
        </div>
      );
    if (percentage >= 15)
      return (
        <div className="flex items-center gap-1 text-gray-600">
          <span className="text-sm font-medium">Normal</span>
        </div>
      );
    return (
      <div className="flex items-center gap-1 text-orange-600">
        <ArrowDownIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Mejorar</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Ranking</TableHead>
              <TableHead className="font-semibold">Sucursal</TableHead>
              <TableHead className="text-right font-semibold">Ventas Totales</TableHead>
              <TableHead className="text-right font-semibold">Pedidos</TableHead>
              <TableHead className="text-right font-semibold">Ticket Promedio</TableHead>
              <TableHead className="text-right font-semibold">% del Total</TableHead>
              <TableHead className="text-center font-semibold">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((branch, index) => (
              <TableRow
                key={`${branch.branch_id}-${index}`}
                className={index === 0 ? "bg-green-50" : ""}
              >
                <TableCell>
                  <Badge variant="outline" className={getBadgeColor(index)}>
                    #{index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {branch.branch_name}
                  {index === 0 && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">
                      🏆 Mejor Sucursal
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900">
                  ${(branch.total_sales || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right text-gray-700">
                  {(branch.orders_count || 0).toLocaleString("es-AR")}
                </TableCell>
                <TableCell className="text-right text-gray-700">
                  ${(branch.average_ticket || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-indigo-600">
                    {(branch.percentage_of_total || 0).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {getPerformanceIndicator(branch.percentage_of_total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total consolidado:</span>
          <span className="font-semibold text-gray-900">
            ${(totalSales || 0).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
