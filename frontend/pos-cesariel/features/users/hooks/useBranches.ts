/** Hook para CRUD de sucursales con soporte de soft delete */

import { useState } from "react";
import { branchesApi } from "@/lib/api";
import { Branch } from "../types/users.types";
import toast from "react-hot-toast";

// Type-safe branch data based on backend schema
type CreateBranchData = {
  name: string;
  address?: string;
  phone?: string;
  is_active?: boolean;
};

type UpdateBranchData = Partial<CreateBranchData>;

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);

  // React Compiler handles optimization
  const loadBranches = async () => {
    try {
      const response = await branchesApi.getBranches();
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Error al cargar sucursales");
    }
  };

  // React Compiler handles optimization
  const createBranch = async (branchData: CreateBranchData) => {
    try {
      await branchesApi.createBranch(branchData);
      toast.success("Sucursal creada exitosamente");
      await loadBranches();
      return true;
    } catch (error) {
      console.error("Error creating branch:", error);
      
      let errorMessage = "Error al crear sucursal";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  };

  // React Compiler handles optimization
  const updateBranch = async (id: number, branchData: UpdateBranchData) => {
    try {
      await branchesApi.updateBranch(id, branchData);
      toast.success("Sucursal actualizada exitosamente");
      await loadBranches();
      return true;
    } catch (error) {
      console.error("Error updating branch:", error);
      
      let errorMessage = "Error al actualizar sucursal";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  };

  // React Compiler handles optimization
  const deleteBranch = async (id: number) => {
    try {
      const response = await branchesApi.deleteBranch(id);

      if (response.data?.soft_delete) {
        toast.success("Sucursal desactivada exitosamente (tiene registros asociados)");
      } else {
        toast.success("Sucursal eliminada exitosamente");
      }

      await loadBranches();
      return true;
    } catch (error) {
      console.error("Error deleting branch:", error);
      
      let errorMessage = "Error al eliminar sucursal";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  };

  return {
    branches,
    loadBranches,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}
