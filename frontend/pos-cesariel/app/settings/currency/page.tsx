'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { configApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useRouteProtection } from '@/shared/hooks/useRouteProtection';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
}

interface SystemConfig {
  default_currency: string;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  decimal_places: number;
}

// Solo monedas permitidas: ARS y USD
const commonCurrencies: Currency[] = [
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', country: 'Argentina' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$', country: 'Estados Unidos' },
];

export default function CurrencyPage() {
  // Protección de ruta - redirige automáticamente si el usuario no tiene permisos
  useRouteProtection();

  const { user } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<SystemConfig>({
    default_currency: 'ARS',
    currency_symbol: '$',
    currency_position: 'before',
    decimal_places: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    loadCurrencyConfig();
  }, [user]);

  const loadCurrencyConfig = async () => {
    try {
      setLoading(true);
      const response = await configApi.getSystemConfig();
      setConfig({
        default_currency: response.data.default_currency || 'ARS',
        currency_symbol: response.data.currency_symbol || '$',
        currency_position: response.data.currency_position || 'before',
        decimal_places: response.data.decimal_places || 2,
      });
    } catch (error: any) {
      console.error('Error cargando configuración de moneda:', error);
      toast.error('Error cargando configuración de moneda');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (currency: Currency) => {
    setConfig(prev => ({
      ...prev,
      default_currency: currency.code,
      currency_symbol: currency.symbol,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await configApi.updateSystemConfig(config);
      toast.success('Configuración de moneda actualizada correctamente');
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      toast.error('Error guardando configuración de moneda');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (amount: number) => {
    const formattedAmount = amount.toFixed(config.decimal_places);
    return config.currency_position === 'before' 
      ? `${config.currency_symbol}${formattedAmount}`
      : `${formattedAmount}${config.currency_symbol}`;
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
            <h1 className="text-2xl font-bold text-black">Configuración de Moneda</h1>
            <p className="text-black mt-1">
              Define la moneda principal de tu negocio
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

      {/* Selección de Moneda */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <GlobeAltIcon className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-lg font-medium text-black">Seleccionar Moneda</h2>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
            Solo ARS y USD disponibles
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {commonCurrencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency)}
              className={`border rounded-lg p-4 text-left transition-all hover:shadow-md ${
                config.default_currency === currency.code
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{currency.symbol}</span>
                  <div>
                    <h3 className="font-medium text-black">{currency.name}</h3>
                    <p className="text-sm text-black">{currency.code} - {currency.country}</p>
                  </div>
                </div>
                {config.default_currency === currency.code && (
                  <CheckIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuración de Formato */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-3" />
          <h2 className="text-lg font-medium text-black">Formato de Precios</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Posición del símbolo */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Posición del símbolo
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="currency_position"
                  value="before"
                  checked={config.currency_position === 'before'}
                  onChange={(e) => setConfig(prev => ({ ...prev, currency_position: e.target.value as 'before' | 'after' }))}
                  className="mr-2"
                />
                <span>Antes del número: {formatPrice(1234.56)}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="currency_position"
                  value="after"
                  checked={config.currency_position === 'after'}
                  onChange={(e) => setConfig(prev => ({ ...prev, currency_position: e.target.value as 'before' | 'after' }))}
                  className="mr-2"
                />
                <span>Después del número: {formatPrice(1234.56)}</span>
              </label>
            </div>
          </div>

          {/* Decimales */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Cantidad de decimales
            </label>
            <select
              value={config.decimal_places}
              onChange={(e) => setConfig(prev => ({ ...prev, decimal_places: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Sin decimales (1234)</option>
              <option value={1}>1 decimal (1234.5)</option>
              <option value={2}>2 decimales (1234.56)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vista Previa */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-black mb-4">Vista Previa</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-black">Precio simple:</span>
            <span className="font-medium">{formatPrice(99.99)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">Precio alto:</span>
            <span className="font-medium">{formatPrice(15499.50)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">Precio con descuento:</span>
            <span className="font-medium">{formatPrice(1299.99)}</span>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            'Guardar Configuración'
          )}
        </button>
      </div>

      {/* Información de Ayuda */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Información Importante</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Monedas disponibles:</strong> Solo Peso Argentino (ARS) y Dólar Estadounidense (USD)</li>
          <li>• La moneda afecta todos los precios mostrados en el sistema</li>
          <li>• Los cambios se aplicarán inmediatamente en nuevas ventas</li>
          <li>• Las ventas anteriores mantendrán su formato original</li>
          <li>• Asegúrate de configurar correctamente antes de comenzar a vender</li>
          <li>• Si necesitas otra moneda, contacta al administrador del sistema</li>
        </ul>
      </div>
    </div>
  );
}