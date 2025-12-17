/**
 * DeleteBranchModal Component
 *
 * Confirmation modal for deleting a branch
 */

"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Branch } from "../../types/users.types";

interface DeleteBranchModalProps {
  branch: Branch;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation modal for branch deletion
 */
export function DeleteBranchModal({
  branch,
  loading,
  onConfirm,
  onCancel,
}: DeleteBranchModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600" />
          <h3 className="text-lg font-medium text-gray-900 mt-2">
            Confirmar Eliminación
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            ¿Estás seguro de que quieres eliminar la sucursal{" "}
            <strong>{branch.name}</strong>?
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Si la sucursal tiene usuarios, ventas o inventario asociado, será
            desactivada en lugar de eliminarse.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </div>
              ) : (
                "Eliminar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
