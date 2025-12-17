/**
 * BranchesTab Component
 *
 * Displays and manages branches in a grid layout
 */

"use client";

import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Branch } from "../../types/users.types";

interface BranchesTabProps {
  branches: Branch[];
  onView: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;
  onCreate: () => void;
  onDelete: (branch: Branch) => void;
}

/**
 * Branches management tab component
 */
export function BranchesTab({
  branches,
  onView,
  onEdit,
  onCreate,
  onDelete,
}: BranchesTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sucursales</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona las sucursales del sistema
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/users/branches/create")}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nueva Sucursal
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {branch.name}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  branch.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {branch.is_active ? "Activa" : "Inactiva"}
              </span>
            </div>

            {branch.address && (
              <p className="text-sm text-gray-600 mb-2">{branch.address}</p>
            )}

            {branch.phone && (
              <p className="text-sm text-gray-600 mb-2">📞 {branch.phone}</p>
            )}

            {branch.email && (
              <p className="text-sm text-gray-600 mb-4">✉️ {branch.email}</p>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() =>
                  (window.location.href = `/users/branches/edit/${branch.id}`)
                }
                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                title="Editar sucursal"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onView(branch)}
                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                title="Ver detalles"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(branch)}
                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                title="Eliminar sucursal"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
