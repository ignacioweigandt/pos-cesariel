/**
 * ResetPasswordModal Component
 *
 * Confirmation modal for resetting user password
 */

"use client";

import { KeyIcon } from "@heroicons/react/24/outline";
import { User } from "../../types/users.types";

interface ResetPasswordModalProps {
  user: User;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation modal for password reset
 */
export function ResetPasswordModal({
  user,
  loading,
  onConfirm,
  onCancel,
}: ResetPasswordModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <KeyIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 mt-2">
            Restablecer Contraseña
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            ¿Estás seguro de que quieres restablecer la contraseña de{" "}
            <strong>{user.full_name}</strong>? Se generará una nueva contraseña
            temporal para el usuario.
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Restableciendo...
                </div>
              ) : (
                "Restablecer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
