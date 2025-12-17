/**
 * BranchViewModal Component
 *
 * Modal for viewing branch details with edit option
 */

"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { Branch } from "../../types/users.types";

interface BranchViewModalProps {
  branch: Branch;
  onClose: () => void;
}

/**
 * Modal to display branch details
 */
export function BranchViewModal({ branch, onClose }: BranchViewModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Detalles de la Sucursal
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">
                Nombre de la Sucursal
              </label>
              <p className="mt-1 text-sm text-black">{branch.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Dirección
              </label>
              <p className="mt-1 text-sm text-black">
                {branch.address || "No especificada"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Teléfono
              </label>
              <p className="mt-1 text-sm text-black">
                {branch.phone || "No especificado"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Email
              </label>
              <p className="mt-1 text-sm text-black">
                {branch.email || "No especificado"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Estado
              </label>
              <p className="mt-1 text-sm text-black">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    branch.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {branch.is_active ? "Activa" : "Inactiva"}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                ID de la Sucursal
              </label>
              <p className="mt-1 text-sm text-black">#{branch.id}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = `/users/branches/edit/${branch.id}`;
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Editar Sucursal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
