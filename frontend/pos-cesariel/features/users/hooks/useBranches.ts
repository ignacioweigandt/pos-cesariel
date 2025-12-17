/**
 * useBranches Hook
 *
 * Custom hook for managing branch data and operations
 */

import { useState, useCallback } from "react";
import { branchesApi } from "@/lib/api";
import { Branch } from "../types/users.types";
import toast from "react-hot-toast";

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchesApi.getBranches();
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Error al cargar sucursales");
    }
  }, []);

  const createBranch = useCallback(async (branchData: any) => {
    try {
      await branchesApi.createBranch(branchData);
      toast.success("Sucursal creada exitosamente");
      await loadBranches();
      return true;
    } catch (error: any) {
      console.error("Error creating branch:", error);
      const errorMessage =
        error.response?.data?.detail || "Error al crear sucursal";
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadBranches]);

  const updateBranch = useCallback(async (id: number, branchData: any) => {
    try {
      await branchesApi.updateBranch(id, branchData);
      toast.success("Sucursal actualizada exitosamente");
      await loadBranches();
      return true;
    } catch (error: any) {
      console.error("Error updating branch:", error);
      const errorMessage =
        error.response?.data?.detail || "Error al actualizar sucursal";
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadBranches]);

  const deleteBranch = useCallback(async (id: number) => {
    try {
      const response = await branchesApi.deleteBranch(id);

      // Handle both soft delete and hard delete
      if (response.data?.soft_delete) {
        toast.success("Sucursal desactivada exitosamente (tiene registros asociados)");
      } else {
        toast.success("Sucursal eliminada exitosamente");
      }

      await loadBranches();
      return true;
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      const errorMessage =
        error.response?.data?.detail || "Error al eliminar sucursal";
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  }, [loadBranches]);

  return {
    branches,
    loadBranches,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}
