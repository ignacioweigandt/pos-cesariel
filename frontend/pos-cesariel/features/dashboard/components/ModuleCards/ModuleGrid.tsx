import {
  ChartBarIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { ModuleCard } from "./ModuleCard";

export function ModuleGrid() {
  const modules = [
    {
      title: "POS - Ventas",
      description: "Procesar ventas, gestionar carrito y cobros",
      icon: ShoppingCartIcon,
      href: "/pos",
      color: "bg-green-500",
      available: true,
    },
    {
      title: "Inventario",
      description: "Gestión de productos, categorías y stock",
      icon: CubeIcon,
      href: "/inventory",
      color: "bg-blue-500",
      available: true,
    },
    {
      title: "Reportes",
      description: "Analytics, métricas y reportes de ventas",
      icon: ChartBarIcon,
      href: "/reports",
      color: "bg-purple-500",
      available: true,
    },
    {
      title: "E-commerce",
      description: "Gestión de tienda online y pedidos",
      icon: ComputerDesktopIcon,
      href: "/ecommerce",
      color: "bg-indigo-500",
      available: true,
    },
    {
      title: "Usuarios",
      description: "Gestión de usuarios, roles y sucursales",
      icon: UsersIcon,
      href: "/users",
      color: "bg-orange-500",
      available: true,
    },
    {
      title: "Configuración",
      description: "Ajustes del sistema, sucursales y usuarios",
      icon: Cog6ToothIcon,
      href: "/settings",
      color: "bg-gray-500",
      available: true,
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Módulos del Sistema
          </h3>
          <p className="text-sm text-gray-500">
            Accede a todas las funcionalidades del POS
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard key={module.title} module={module} />
          ))}
        </div>
      </div>
    </div>
  );
}
