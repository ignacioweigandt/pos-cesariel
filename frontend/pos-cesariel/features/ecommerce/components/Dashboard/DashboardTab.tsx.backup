"use client";

import {
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { EcommerceStats, StoreConfig } from "../../types/ecommerce.types";

interface DashboardTabProps {
  stats: EcommerceStats;
  storeConfig: StoreConfig | null;
}

/**
 * Dashboard tab component for e-commerce overview
 * Displays key metrics and store status with real-time data
 */
export default function DashboardTab({ stats, storeConfig }: DashboardTabProps) {
  const statCards = [
    {
      name: "Productos Online",
      value: stats.total_online_products,
      icon: ShoppingBagIcon,
      color: "bg-blue-500",
      description: "Productos activos en tienda",
    },
    {
      name: "Ventas Totales",
      value: `$${stats.total_online_sales.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: "bg-green-500",
      description: "Ingresos de e-commerce",
    },
    {
      name: "Tasa de Conversión",
      value: `${stats.conversion_rate}%`,
      icon: ChartBarIcon,
      color: "bg-purple-500",
      description: "Pedidos completados vs totales",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard E-commerce
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Resumen de tu tienda online
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              storeConfig?.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <GlobeAltIcon className="w-3 h-3 mr-1" />
            {storeConfig?.is_active ? "Tienda Activa" : "Tienda Inactiva"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex flex-col sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Real-time update indicator */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>Actualización automática cada 30 segundos</span>
        </div>
      </div>

      {/* Store Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Estado de la Tienda
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {storeConfig?.store_name}
                </h4>
                <p className="text-sm text-gray-500">
                  {storeConfig?.store_description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">URL:</span>
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  tienda.ejemplo.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
