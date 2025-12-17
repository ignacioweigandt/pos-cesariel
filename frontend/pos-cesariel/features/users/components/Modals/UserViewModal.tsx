/**
 * UserViewModal Component
 *
 * Modal for viewing user details (read-only)
 */

"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { User } from "../../types/users.types";

interface UserViewModalProps {
  user: User;
  onClose: () => void;
  getRoleLabel: (role: string) => string;
}

/**
 * Modal to display user details
 */
export function UserViewModal({
  user,
  onClose,
  getRoleLabel,
}: UserViewModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Detalles del Usuario
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
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.full_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <p className="mt-1 text-sm text-gray-900">@{user.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {getRoleLabel(user.role)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sucursal
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.branch?.name || "Todas las sucursales"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <p className="mt-1 text-sm text-gray-900">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_active ? "Activo" : "Inactivo"}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Creación
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Última Actualización
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
