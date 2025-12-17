'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { configApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface EcommerceConfig {
  id?: number;
  store_name: string;
  store_description: string;
  store_logo?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  tax_percentage: number;
  currency: string;
}

export default function EcommerceConfigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<EcommerceConfig>({
    store_name: '',
    store_description: '',
    store_logo: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    is_active: true,
    tax_percentage: 0,
    currency: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

    loadEcommerceConfig();
  }, [user, router]);

  const loadEcommerceConfig = async () => {
    try {
      setLoading(true);
      const response = await configApi.getEcommerceConfig();
      setConfig(response.data);
    } catch (error: any) {
      console.error('Error cargando configuración de e-commerce:', error);
      if (error.response?.status === 404) {
        // No existe configuración, usar valores por defecto
        toast.info('No se encontró configuración existente. Creando nueva configuración.');
        setIsEditing(true);
      } else {
        toast.error('Error cargando configuración de e-commerce');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (config.id) {
        // Actualizar configuración existente
        await configApi.updateEcommerceConfig(config);
        toast.success('Configuración de e-commerce actualizada exitosamente');
      } else {
        // Crear nueva configuración
        const response = await configApi.createEcommerceConfig(config);
        setConfig(response.data);
        toast.success('Configuración de e-commerce creada exitosamente');
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      toast.error(error.response?.data?.detail || 'Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EcommerceConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-black" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <ShoppingCartIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Configuración E-commerce</h1>
                <p className="text-black">Gestiona la configuración de tu tienda online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Editar
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadEcommerceConfig(); // Reload original data
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-black mb-4">Información de la Tienda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Nombre de la Tienda
                  </label>
                  <input
                    type="text"
                    value={config.store_name}
                    onChange={(e) => handleInputChange('store_name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                    placeholder="Mi Tienda Online"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Moneda
                  </label>
                  <select
                    value={config.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                  >
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="ARS">ARS - Peso Argentino</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="BRL">BRL - Real Brasileño</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Descripción de la Tienda
                  </label>
                  <textarea
                    value={config.store_description}
                    onChange={(e) => handleInputChange('store_description', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black resize-none"
                    placeholder="Describe tu tienda online, productos que vendes, tu propuesta de valor..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={config.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                    placeholder="contacto@mitienda.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <PhoneIcon className="h-4 w-4 inline mr-1" />
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={config.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={config.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                    placeholder="Calle 123, Ciudad, País"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-black mb-4">Configuración Financiera</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                    Porcentaje de Impuestos (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={config.tax_percentage}
                    onChange={(e) => handleInputChange('tax_percentage', parseFloat(e.target.value) || 0)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-black mt-1">Impuesto aplicado a los productos de e-commerce</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-black mb-4">Estado de la Tienda</h2>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={config.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-black">
                  <GlobeAltIcon className="h-4 w-4 inline mr-1" />
                  Tienda Online Activa
                </label>
              </div>
              <p className="text-xs text-black mt-1">
                Cuando está activa, los clientes pueden realizar compras en la tienda online
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-black mb-4">Logo de la Tienda</h3>
              <div className="text-center">
                {config.store_logo ? (
                  <img
                    src={config.store_logo}
                    alt="Logo de la tienda"
                    className="mx-auto h-32 w-32 object-cover rounded-lg border border-gray-300"
                  />
                ) : (
                  <div className="mx-auto h-32 w-32 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                    <PhotoIcon className="h-8 w-8 text-black" />
                  </div>
                )}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    URL del Logo
                  </label>
                  <input
                    type="url"
                    value={config.store_logo || ''}
                    onChange={(e) => handleInputChange('store_logo', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-black text-sm"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Estado Actual</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Tienda:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    config.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {config.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Moneda:</span>
                  <span className="text-sm font-medium text-blue-900">{config.currency}</span>
                </div>
                {config.tax_percentage > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Impuestos:</span>
                    <span className="text-sm font-medium text-blue-900">{config.tax_percentage}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-900 mb-2">Información</h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• La configuración afecta a toda la tienda online</li>
                <li>• Los cambios se aplican inmediatamente</li>
                <li>• Los productos deben tener el campo &quot;show_in_ecommerce&quot; activo</li>
                <li>• El inventario se comparte entre POS y e-commerce</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}