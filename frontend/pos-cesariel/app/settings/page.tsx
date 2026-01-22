'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { configApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useRouteProtection } from '@/shared/hooks/useRouteProtection';
import toast from 'react-hot-toast';
import {
  CogIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  PrinterIcon,
  BellIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  PhotoIcon,
  RectangleGroupIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
}

const configSections: ConfigSection[] = [
  {
    id: 'payment',
    title: 'Métodos de Pago',
    description: 'Configurar formas de pago, tarjetas y comisiones',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500',
    path: '/settings/payment-methods',
  },
  {
    id: 'currency',
    title: 'Configurar la Moneda',
    description: 'Definir la moneda principal y formato de precios',
    icon: CurrencyDollarIcon,
    color: 'bg-blue-500',
    path: '/settings/currency',
  },
  {
    id: 'taxes',
    title: 'Impuestos',
    description: 'Configurar tasas de impuestos y tributos',
    icon: Cog6ToothIcon,
    color: 'bg-yellow-500',
    path: '/settings/tax-rates',
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Configurar alertas importantes del negocio',
    icon: BellIcon,
    color: 'bg-orange-500',
    path: '/settings/notifications',
  },
  {
    id: 'security-backup',
    title: 'Seguridad y Respaldos',
    description: 'Proteger datos y configurar copias de seguridad',
    icon: ShieldCheckIcon,
    color: 'bg-red-500',
    path: '/settings/security-backups',
  },
];

/**
 * Settings Page
 *
 * Protected route: Only accessible by admin and manager roles.
 */
export default function SettingsPage() {
  // Protección de ruta - redirige automáticamente si el usuario no tiene permisos
  useRouteProtection();

  const { user } = useAuth();
  const router = useRouter();
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSystemConfig();
  }, []);

  const loadSystemConfig = async () => {
    try {
      const response = await configApi.getSystemConfig();
      setSystemConfig(response.data);
    } catch (error: any) {
      console.error('Error cargando configuración del sistema:', error);
      toast.error('Error cargando configuración del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section: ConfigSection) => {
    router.push(section.path);
  };

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Configuración</h1>
            <p className="text-black mt-1">
              Configura los aspectos esenciales de tu negocio de forma simple
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </button>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Sistema Activo
            </div>
          </div>
        </div>
        
        {systemConfig && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-black">Aplicación</h3>
              <p className="text-lg font-semibold text-black">{systemConfig.app_name}</p>
              <p className="text-xs text-black">v{systemConfig.version}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-black">Entorno</h3>
              <p className="text-lg font-semibold text-black capitalize">{systemConfig.environment}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-black">Moneda</h3>
              <p className="text-lg font-semibold text-black">{systemConfig.default_currency}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-black">Sesión</h3>
              <p className="text-lg font-semibold text-black">{systemConfig.session_timeout} min</p>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configSections.map((section) => {
          const IconComponent = section.icon;
          
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section)}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className={`${section.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-black group-hover:text-blue-600 transition-colors duration-200">
                    {section.title}
                  </h3>
                  <p className="text-sm text-black mt-1 line-clamp-2">
                    {section.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                <span>Configurar</span>
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Features Status */}
      {systemConfig?.features && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-black mb-4">Estado de Funcionalidades</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(systemConfig.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${enabled ? 'text-black' : 'text-black'} capitalize`}>
                  {feature.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-black mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/settings/security-backups')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <CloudArrowUpIcon className="h-6 w-6 text-black mr-2" />
            <span className="text-black">Crear Respaldo</span>
          </button>
          
          <button
            onClick={() => router.push('/settings/notifications')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
          >
            <BellIcon className="h-6 w-6 text-black mr-2" />
            <span className="text-black">Ver Alertas</span>
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-6 w-6 text-black mr-2" />
            <span className="text-black">Volver al Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}