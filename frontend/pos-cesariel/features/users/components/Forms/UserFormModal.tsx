/**
 * UserFormModal Component
 *
 * Modal form for creating and editing users
 */

"use client";

import {
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { User, UserFormData, Branch, FormErrors } from "../../types/users.types";

interface UserFormModalProps {
  user: User | null;
  formData: UserFormData;
  branches: Branch[];
  formErrors: FormErrors;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  submittingUser: boolean;
  onFormChange: (data: UserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  getRoleLabel: (role: string) => string;
}

/**
 * User creation/edit form modal
 */
export function UserFormModal({
  user,
  formData,
  branches,
  formErrors,
  showPassword,
  setShowPassword,
  submittingUser,
  onFormChange,
  onSubmit,
  onClose,
  getRoleLabel,
}: UserFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={onSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {user ? "Editar Usuario" : "Nuevo Usuario"}
                </h3>
                <button type="button" onClick={onClose}>
                  <XMarkIcon className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) =>
                      onFormChange({ ...formData, full_name: e.target.value })
                    }
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.full_name
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                    placeholder="Ej: Juan Pérez García"
                  />
                  {formErrors.full_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <InformationCircleIcon className="h-4 w-4 mr-1" />
                      {formErrors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      onFormChange({ ...formData, username: e.target.value })
                    }
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.username
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                    placeholder="Ej: jperez"
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <InformationCircleIcon className="h-4 w-4 mr-1" />
                      {formErrors.username}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 3 caracteres, sin espacios
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      onFormChange({ ...formData, email: e.target.value })
                    }
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.email
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    }`}
                    placeholder="Ej: jperez@empresa.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <InformationCircleIcon className="h-4 w-4 mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {user ? "Nueva contraseña (opcional)" : "Contraseña"}
                    {!user && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!user}
                      value={formData.password}
                      onChange={(e) =>
                        onFormChange({ ...formData, password: e.target.value })
                      }
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                        formErrors.password
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      }`}
                      placeholder={
                        user
                          ? "Dejar vacío para mantener contraseña actual"
                          : "Mínimo 6 caracteres"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <InformationCircleIcon className="h-4 w-4 mr-1" />
                      {formErrors.password}
                    </p>
                  )}
                  {!user && (
                    <p className="mt-1 text-xs text-gray-500">
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      onFormChange({ ...formData, role: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:border-indigo-500 transition-colors"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="MANAGER">Gerente</option>
                    <option value="SELLER">Vendedor</option>
                    <option value="ECOMMERCE">E-commerce</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Los permisos se asignan automáticamente según el rol
                    seleccionado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sucursal
                  </label>
                  <select
                    value={formData.branch_id || ""}
                    onChange={(e) =>
                      onFormChange({
                        ...formData,
                        branch_id: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sin asignar</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      onFormChange({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Usuario activo
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={submittingUser}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors ${
                  submittingUser
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                }`}
              >
                {submittingUser ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : user ? (
                  "Actualizar Usuario"
                ) : (
                  "Crear Usuario"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submittingUser}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
