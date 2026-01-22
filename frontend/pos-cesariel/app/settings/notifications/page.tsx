'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useRouteProtection } from '@/shared/hooks/useRouteProtection';
import toast from 'react-hot-toast';
import NotificationSettingsComponent from '@/app/components/NotificationSettings';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  // Protección de ruta - redirige automáticamente si el usuario no tiene permisos
  useRouteProtection();

  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
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
            <h1 className="text-2xl font-bold text-black">Notificaciones</h1>
            <p className="text-black mt-1">
              Configura cómo y cuándo recibir notificaciones del sistema
            </p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a Configuración
          </button>
        </div>
      </div>

      {/* Componente de Configuración */}
      <NotificationSettingsComponent />

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">¿Para qué sirven las notificaciones?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Stock Bajo:</strong> Evita quedarte sin productos populares</li>
          <li>• <strong>Reporte Diario:</strong> Resume las ventas del día automáticamente</li>
          <li>• <strong>Recordatorio de Respaldo:</strong> Protege tus datos con copias de seguridad regulares</li>
          <li>• Los cambios se guardan cuando presionas el botón &quot;Guardar Configuración&quot;</li>
        </ul>
      </div>

      {/* Información adicional con íconos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="font-semibold text-black mb-2">Stock Bajo</h3>
          <p className="text-sm text-black">
            Recibe alertas automáticas cuando tus productos necesiten ser reabastecidos.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-black mb-2">Reportes Diarios</h3>
          <p className="text-sm text-black">
            Resumen automático de las ventas y estadísticas de tu negocio.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl mb-2">💾</div>
          <h3 className="font-semibold text-black mb-2">Respaldos</h3>
          <p className="text-sm text-black">
            Recordatorios periódicos para mantener tus datos seguros.
          </p>
        </div>
      </div>
    </div>
  );
}
