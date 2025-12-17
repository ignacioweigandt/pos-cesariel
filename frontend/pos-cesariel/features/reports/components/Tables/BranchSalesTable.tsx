import type { BranchSales } from "../../types/reports.types";

interface BranchSalesTableProps {
  branches: BranchSales[];
  isAdmin: boolean;
}

export function BranchSalesTable({ branches, isAdmin }: BranchSalesTableProps) {
  if (!isAdmin || !branches || branches.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Ventas por Sucursal
        </h3>
        <div className="space-y-4">
          {branches.map((branch, index) => (
            <div
              key={branch.branch_name}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{branch.branch_name}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  ${Number(branch.total_sales).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {branch.total_transactions} transacciones
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
