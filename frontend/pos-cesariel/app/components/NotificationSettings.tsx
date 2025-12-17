'use client';

import { useState, useEffect } from 'react';
import notificationService, { NotificationSettings } from '@/app/lib/notification-service';
import { toast } from 'react-hot-toast';

export default function NotificationSettingsComponent() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await notificationService.updateSettings({
        low_stock_enabled: settings.low_stock_enabled,
        low_stock_threshold: settings.low_stock_threshold,
        daily_sales_enabled: settings.daily_sales_enabled,
        daily_sales_time: settings.daily_sales_time,
        backup_reminder_enabled: settings.backup_reminder_enabled,
        backup_reminder_frequency: settings.backup_reminder_frequency,
        backup_reminder_day: settings.backup_reminder_day,
        enabled: settings.enabled
      });
      toast.success('Configuración guardada exitosamente');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <div className="text-center py-8">
          <p className="text-red-600">No se pudo cargar la configuración</p>
          <button
            onClick={loadSettings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Notificaciones</h2>
        {hasChanges && (
          <span className="text-sm text-orange-600 font-medium">
            ● Cambios sin guardar
          </span>
        )}
      </div>

      {/* Habilitar/Deshabilitar todo */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <div className="ml-3">
            <span className="font-semibold text-gray-900">Habilitar todas las notificaciones</span>
            <p className="text-sm text-gray-600">
              Desactivar esta opción pausará todas las notificaciones automáticas
            </p>
          </div>
        </label>
      </div>

      <div className="space-y-8">
        {/* Alertas de Stock Bajo */}
        <div className="border-b pb-6">
          <div className="flex items-start mb-4">
            <span className="text-3xl mr-3">📦</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Alertas de Stock Bajo</h3>
              <p className="text-sm text-gray-600 mt-1">
                Recibe notificaciones cuando los productos alcancen un stock mínimo
              </p>
            </div>
          </div>

          <div className="ml-12 space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.low_stock_enabled}
                onChange={(e) => handleChange('low_stock_enabled', e.target.checked)}
                disabled={!settings.enabled}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="ml-3 text-gray-700">Recibir alertas de stock bajo</span>
            </label>

            {settings.low_stock_enabled && (
              <div className="pl-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Umbral de stock bajo (unidades):
                </label>
                <input
                  type="number"
                  value={settings.low_stock_threshold}
                  onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value))}
                  min="1"
                  max="1000"
                  disabled={!settings.enabled}
                  className="border border-gray-300 rounded-md px-3 py-2 w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se enviará alerta cuando el stock sea igual o menor a este valor
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reporte Diario */}
        <div className="border-b pb-6">
          <div className="flex items-start mb-4">
            <span className="text-3xl mr-3">📊</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Reporte Diario de Ventas</h3>
              <p className="text-sm text-gray-600 mt-1">
                Resumen automático de las ventas del día
              </p>
            </div>
          </div>

          <div className="ml-12 space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.daily_sales_enabled}
                onChange={(e) => handleChange('daily_sales_enabled', e.target.checked)}
                disabled={!settings.enabled}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="ml-3 text-gray-700">Recibir reporte diario de ventas</span>
            </label>

            {settings.daily_sales_enabled && (
              <div className="pl-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de envío:
                </label>
                <input
                  type="time"
                  value={settings.daily_sales_time}
                  onChange={(e) => handleChange('daily_sales_time', e.target.value)}
                  disabled={!settings.enabled}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato 24 horas (HH:MM)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recordatorio de Respaldo */}
        <div className="pb-6">
          <div className="flex items-start mb-4">
            <span className="text-3xl mr-3">💾</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Recordatorio de Respaldo</h3>
              <p className="text-sm text-gray-600 mt-1">
                No olvides realizar copias de seguridad del sistema
              </p>
            </div>
          </div>

          <div className="ml-12 space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backup_reminder_enabled}
                onChange={(e) => handleChange('backup_reminder_enabled', e.target.checked)}
                disabled={!settings.enabled}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="ml-3 text-gray-700">Recibir recordatorios de respaldo</span>
            </label>

            {settings.backup_reminder_enabled && (
              <div className="pl-7 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia:
                  </label>
                  <select
                    value={settings.backup_reminder_frequency}
                    onChange={(e) => handleChange('backup_reminder_frequency', e.target.value)}
                    disabled={!settings.enabled}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                  >
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {settings.backup_reminder_frequency === 'weekly'
                      ? 'Día de la semana:'
                      : settings.backup_reminder_frequency === 'monthly'
                      ? 'Día del mes:'
                      : 'No aplicable'}
                  </label>
                  {settings.backup_reminder_frequency !== 'daily' && (
                    <>
                      <input
                        type="number"
                        value={settings.backup_reminder_day}
                        onChange={(e) => handleChange('backup_reminder_day', parseInt(e.target.value))}
                        min="1"
                        max={settings.backup_reminder_frequency === 'weekly' ? '7' : '31'}
                        disabled={!settings.enabled}
                        className="border border-gray-300 rounded-md px-3 py-2 w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {settings.backup_reminder_frequency === 'weekly'
                          ? '1 = Lunes, 2 = Martes, ... 7 = Domingo'
                          : 'Día del mes (1-31)'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <button
          onClick={handleReset}
          disabled={!hasChanges || saving}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Descartar cambios
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            'Guardar Configuración'
          )}
        </button>
      </div>

      {/* Info adicional */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Nota:</strong> Los cambios en la configuración se aplicarán inmediatamente.
          Las notificaciones automáticas se generan según los horarios y frecuencias configuradas.
        </p>
      </div>
    </div>
  );
}
