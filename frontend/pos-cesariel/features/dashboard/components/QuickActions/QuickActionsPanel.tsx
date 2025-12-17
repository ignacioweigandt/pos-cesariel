import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { QuickActionButton } from "./QuickActionButton";

export function QuickActionsPanel() {
  const quickActions = [
    {
      title: "Nueva Venta",
      description: "Procesar una nueva venta",
      href: "/pos",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Gestionar Inventario",
      description: "Ver y gestionar productos",
      href: "/inventory",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Ver Reportes",
      description: "Análisis y métricas",
      href: "/reports",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Configuración",
      description: "Ajustes del sistema",
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600",
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Acciones Rápidas
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionButton key={action.title} action={action} />
          ))}
        </div>
      </div>
    </div>
  );
}
