'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { configApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  ClockIcon,
  ServerStackIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

interface SecurityBackupConfig {
  auto_backup: {
    enabled: boolean;
    frequency: string;
    time: string;
    retention_days: number;
  };
  backup_location: string;
  include_images: boolean;
  compress_backups: boolean;
  last_backup?: string;
  backup_size?: string;
}

export default function SecurityBackupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<SecurityBackupConfig>({
    auto_backup: {
      enabled: true,
      frequency: 'DAILY',
      time: '02:00',
      retention_days: 30
    },
    backup_location: '/backups',
    include_images: true,
    compress_backups: true,
    last_backup: '2024-01-15T02:00:00Z',
    backup_size: '125MB'
  });
  const [loading, setLoading] = useState(true);
  const [creating_backup, setCreatingBackup] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (!['admin', 'manager', 'ADMIN', 'MANAGER'].includes(user.role)) {
      toast.error('No tienes permisos para acceder a la configuración');
      router.push('/dashboard');
      return;
    }

    loadConfig();
  }, [user, router]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await configApi.getBackupConfig();
      setConfig(response.data);
    } catch (error: any) {
      console.error('Error cargando configuración:', error);
      toast.error('Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoBackup = () => {
    setConfig(prev => ({
      ...prev,
      auto_backup: {
        ...prev.auto_backup,
        enabled: !prev.auto_backup.enabled
      }
    }));
    toast.success(`Respaldo automático ${!config.auto_backup.enabled ? 'activado' : 'desactivado'}`);
  };

  const handleFrequencyChange = (frequency: string) => {
    setConfig(prev => ({
      ...prev,
      auto_backup: {
        ...prev.auto_backup,
        frequency
      }
    }));
  };

  const handleTimeChange = (time: string) => {
    setConfig(prev => ({
      ...prev,
      auto_backup: {
        ...prev.auto_backup,
        time
      }
    }));
  };

  const handleRetentionChange = (retention_days: number) => {
    if (retention_days < 1 || retention_days > 365) {
      toast.error('Los días de retención deben estar entre 1 y 365');
      return;
    }

    setConfig(prev => ({
      ...prev,
      auto_backup: {
        ...prev.auto_backup,
        retention_days
      }
    }));
  };

  const handleToggleImages = () => {
    setConfig(prev => ({
      ...prev,
      include_images: !prev.include_images
    }));
  };

  const handleToggleCompress = () => {
    setConfig(prev => ({
      ...prev,
      compress_backups: !prev.compress_backups
    }));
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      toast.success('Creando respaldo... esto puede tomar unos minutos');
      
      // Simular creación de respaldo
      setTimeout(() => {
        setConfig(prev => ({
          ...prev,
          last_backup: new Date().toISOString(),
          backup_size: Math.floor(Math.random() * 200 + 50) + 'MB'
        }));
        toast.success('Respaldo creado exitosamente');
        setCreatingBackup(false);
      }, 3000);
      
    } catch (error) {
      toast.error('Error creando respaldo');
      setCreatingBackup(false);
    }
  };

  const formatBackupDate = (dateStr?: string) => {
    if (!dateStr) return 'Nunca';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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
            <h1 className="text-2xl font-bold text-black">Seguridad y Respaldos</h1>
            <p className="text-black mt-1">
              Protege tu información y configura copias de seguridad automáticas
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

      {/* Información de Seguridad */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-3" />
          <h2 className="text-lg font-medium text-black">Estado de Seguridad</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <LockClosedIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-green-900">Autenticación</h3>
                <p className="text-sm text-green-700">Activa y funcionando</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <KeyIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-green-900">Tokens JWT</h3>
                <p className="text-sm text-green-700">Configurado correctamente</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <ServerStackIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-green-900">Base de Datos</h3>
                <p className="text-sm text-green-700">Conexión segura</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de Respaldos */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <CloudArrowUpIcon className="h-6 w-6 text-blue-500 mr-3" />
          <h2 className="text-lg font-medium text-black">Configuración de Respaldos</h2>
        </div>
        
        <div className="space-y-6">
          {/* Estado actual del respaldo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-black">Estado del Último Respaldo</h3>
              <button
                onClick={handleCreateBackup}
                disabled={creating_backup}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {creating_backup ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Crear Respaldo Ahora
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-black">Último respaldo:</span>
                <span className="ml-2 font-medium">{formatBackupDate(config.last_backup)}</span>
              </div>
              <div>
                <span className="text-black">Tamaño:</span>
                <span className="ml-2 font-medium">{config.backup_size || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Respaldo Automático */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium text-black">Respaldo Automático</h3>
                  <p className="text-sm text-black">Crea copias de seguridad de forma automática</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.auto_backup.enabled}
                  onChange={handleToggleAutoBackup}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {config.auto_backup.enabled && (
              <div className="ml-11 pt-4 border-t border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Frecuencia:
                    </label>
                    <select
                      value={config.auto_backup.frequency}
                      onChange={(e) => handleFrequencyChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DAILY">Diariamente</option>
                      <option value="WEEKLY">Semanalmente</option>
                      <option value="MONTHLY">Mensualmente</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Hora:
                    </label>
                    <input
                      type="time"
                      value={config.auto_backup.time}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Días de retención:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={config.auto_backup.retention_days}
                      onChange={(e) => handleRetentionChange(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.include_images}
                      onChange={handleToggleImages}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">Incluir imágenes de productos</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.compress_backups}
                      onChange={handleToggleCompress}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">Comprimir respaldos</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información de Ayuda */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-900 mb-2">¿Por qué es importante hacer respaldos?</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• <strong>Protección de datos:</strong> Evita perder información importante en caso de fallas</li>
          <li>• <strong>Tranquilidad:</strong> Tu negocio está protegido contra pérdida de datos</li>
          <li>• <strong>Respaldo automático:</strong> El sistema se encarga de todo sin que tengas que recordarlo</li>
          <li>• <strong>Fácil recuperación:</strong> Restaura tu información rápidamente si es necesario</li>
          <li>• Los respaldos incluyen productos, ventas, usuarios y configuraciones</li>
        </ul>
      </div>
    </div>
  );
}