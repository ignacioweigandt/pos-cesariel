import { useState } from 'react';
import { ecommerceAdvancedApi } from '@/lib/api';
import toast from 'react-hot-toast';

export interface WhatsAppConfig {
  business_phone: string;
  business_name: string;
  welcome_message?: string;
  business_hours?: string;
  auto_response_enabled?: boolean;
}

/**
 * Hook para manejar configuración de WhatsApp
 */
export function useWhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const loadConfig = async () => {
    try {
      const response = await ecommerceAdvancedApi.getWhatsAppConfig();
      setConfig(response.data);
    } catch (error) {
      console.error('Error loading WhatsApp config:', error);
    }
  };

  const saveConfig = async (): Promise<boolean> => {
    if (!config?.business_phone?.trim()) {
      toast.error('El número de WhatsApp empresarial es requerido');
      return false;
    }

    if (!config?.business_name?.trim()) {
      toast.error('El nombre del negocio es requerido');
      return false;
    }

    try {
      await ecommerceAdvancedApi.createOrUpdateWhatsAppConfig(config);
      toast.success('Configuración de WhatsApp guardada exitosamente');
      setShowConfigModal(false);
      await loadConfig();
      return true;
    } catch (error: any) {
      console.error('Error saving WhatsApp config:', error);
      const errorMessage =
        error.response?.data?.detail || 'Error guardando configuración';
      toast.error(errorMessage);
      return false;
    }
  };

  const openConfigModal = () => setShowConfigModal(true);
  const closeConfigModal = () => setShowConfigModal(false);

  return {
    config,
    setConfig,
    showConfigModal,
    loadConfig,
    saveConfig,
    openConfigModal,
    closeConfigModal,
  };
}
