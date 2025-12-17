'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ecommerceAdvancedApi } from '@/lib/api';

interface WhatsAppConfig {
  id?: number;
  business_phone: string;
  business_name: string;
  welcome_message: string;
  is_active: boolean;
}

interface WhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export default function WhatsAppConfigModal({
  isOpen,
  onClose,
  onConfigUpdated
}: WhatsAppConfigModalProps) {
  const [config, setConfig] = useState<WhatsAppConfig>({
    business_phone: '',
    business_name: 'POS Cesariel',
    welcome_message: 'Hola {customer_name}, gracias por tu compra en nuestro e-commerce. Tu pedido #{sale_number} está siendo procesado.',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await ecommerceAdvancedApi.getWhatsAppConfig();
      if (response.data && response.data.length > 0) {
        const configData = response.data[0];
        setConfig({
          id: configData.id,
          business_phone: configData.business_phone || '',
          business_name: configData.business_name || 'POS Cesariel',
          welcome_message: configData.welcome_message || 'Hola {customer_name}, gracias por tu compra en nuestro e-commerce. Tu pedido #{sale_number} está siendo procesado.',
          is_active: configData.is_active !== false
        });
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error);
      setMessage({
        type: 'info',
        text: 'No se encontró configuración previa. Se creará una nueva.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.business_phone.trim()) {
      setMessage({
        type: 'error',
        text: 'El número de teléfono es obligatorio'
      });
      return;
    }

    // Validate phone number format
    const phonePattern = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = config.business_phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phonePattern.test(cleanPhone)) {
      setMessage({
        type: 'error',
        text: 'Formato de teléfono inválido. Use formato internacional (+54911234567)'
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const configData = {
        business_phone: cleanPhone,
        business_name: config.business_name.trim(),
        welcome_message: config.welcome_message.trim(),
        is_active: config.is_active
      };

      if (config.id) {
        // Update existing config
        await ecommerceAdvancedApi.updateWhatsAppConfig(config.id, configData);
      } else {
        // Create new config
        await ecommerceAdvancedApi.createOrUpdateWhatsAppConfig(configData);
      }

      setMessage({
        type: 'success',
        text: 'Configuración guardada exitosamente'
      });

      if (onConfigUpdated) {
        onConfigUpdated();
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      setMessage({
        type: 'error',
        text: 'Error al guardar la configuración'
      });
    } finally {
      setSaving(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setConfig(prev => ({ ...prev, business_phone: formatted }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Configuración WhatsApp
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              {/* Business Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-1" />
                  Número de WhatsApp Business *
                </label>
                <input
                  type="tel"
                  value={config.business_phone}
                  onChange={handlePhoneChange}
                  placeholder="+54911234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato internacional: +[código país][número] (ej: +54911234567)
                </p>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={config.business_name}
                  onChange={(e) => setConfig(prev => ({ ...prev, business_name: e.target.value }))}
                  placeholder="POS Cesariel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de Bienvenida
                </label>
                <textarea
                  value={config.welcome_message}
                  onChange={(e) => setConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables disponibles: {'{customer_name}'}, {'{sale_number}'}
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={config.is_active}
                  onChange={(e) => setConfig(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Configuración activa
                </label>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`p-3 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : message.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center">
                    {message.type === 'success' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <ExclamationTriangleIcon className={`w-5 h-5 mr-2 ${
                        message.type === 'error' ? 'text-red-500' : 'text-blue-500'
                      }`} />
                    )}
                    <p className={`text-sm ${
                      message.type === 'success' 
                        ? 'text-green-800' 
                        : message.type === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}