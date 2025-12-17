/**
 * RolesTab Component
 *
 * Displays role information and permissions (read-only)
 */

"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import { RoleInfo } from "../../types/users.types";

const ROLES_DATA: RoleInfo[] = [
  {
    name: "Administrador",
    key: "admin",
    description: "Acceso completo a todas las funcionalidades del sistema",
    permissions: [
      "Gestión de usuarios",
      "Configuración del sistema",
      "Reportes avanzados",
      "Todas las sucursales",
    ],
    color: "bg-red-100 text-red-800",
  },
  {
    name: "Gerente",
    key: "manager",
    description: "Gestión de inventario, usuarios y reportes de sucursal",
    permissions: [
      "Gestión de inventario",
      "Gestión de usuarios",
      "Reportes de sucursal",
      "Configuración básica",
    ],
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Vendedor",
    key: "seller",
    description: "Operaciones de venta y consulta de inventario",
    permissions: ["Ventas POS", "Consulta de inventario", "Reportes básicos"],
    color: "bg-green-100 text-green-800",
  },
  {
    name: "E-commerce",
    key: "ecommerce",
    description: "Gestión específica de la tienda online",
    permissions: ["Gestión E-commerce", "Pedidos online", "Productos online"],
    color: "bg-purple-100 text-purple-800",
  },
];

/**
 * Roles and permissions information tab
 */
export function RolesTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Roles y Permisos</h2>
        <p className="mt-1 text-sm text-gray-600">
          Información sobre los roles disponibles en el sistema
        </p>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {ROLES_DATA.map((role) => (
          <div key={role.key} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}
              >
                {role.key}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">{role.description}</p>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Permisos:
              </h4>
              <ul className="space-y-1">
                {role.permissions.map((permission, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
