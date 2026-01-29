/**
 * BranchSelector Component
 * 
 * Dropdown selector for branches using shadcn/ui Select.
 * Only shows for admin users.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Branch } from "../../types/reports.types";

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch?: number;
  onBranchChange: (branchId: number | undefined) => void;
  disabled?: boolean;
  showAllOption?: boolean;
}

export function BranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
  disabled = false,
  showAllOption = true,
}: BranchSelectorProps) {
  const handleValueChange = (value: string) => {
    if (value === "all") {
      onBranchChange(undefined);
    } else {
      onBranchChange(parseInt(value, 10));
    }
  };

  const currentValue = selectedBranch ? selectedBranch.toString() : "all";

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">
        Sucursal:
      </label>
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar sucursal" />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">Todas las sucursales</SelectItem>
          )}
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id.toString()}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
