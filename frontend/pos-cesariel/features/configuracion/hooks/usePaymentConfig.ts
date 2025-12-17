/**
 * usePaymentConfig Hook
 *
 * Custom hook for managing payment configurations
 */

import { useState, useEffect } from 'react';
import { configurationApi } from '../api';
import type { PaymentConfig, PaymentConfigCreate, PaymentConfigUpdate } from '../types';
import toast from 'react-hot-toast';

export function usePaymentConfig() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configurationApi.getPaymentConfigs();
      setConfigs(response.data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Error cargando configuraciones de pago');
      console.error('Error loading payment configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async (data: PaymentConfigCreate) => {
    try {
      const response = await configurationApi.createPaymentConfig(data);
      setConfigs(prev => [...prev, response.data]);
      toast.success('Configuración creada exitosamente');
      return response.data;
    } catch (err) {
      toast.error('Error creando configuración');
      throw err;
    }
  };

  const updateConfig = async (id: number, data: PaymentConfigUpdate) => {
    try {
      const response = await configurationApi.updatePaymentConfig(id, data);
      setConfigs(prev => prev.map(c => c.id === id ? response.data : c));
      toast.success('Configuración actualizada exitosamente');
      return response.data;
    } catch (err) {
      toast.error('Error actualizando configuración');
      throw err;
    }
  };

  const deleteConfig = async (id: number) => {
    try {
      await configurationApi.deletePaymentConfig(id);
      setConfigs(prev => prev.filter(c => c.id !== id));
      toast.success('Configuración eliminada exitosamente');
    } catch (err) {
      toast.error('Error eliminando configuración');
      throw err;
    }
  };

  const toggleActive = async (id: number) => {
    const config = configs.find(c => c.id === id);
    if (!config) return;

    try {
      const updatedConfig = { is_active: !config.is_active };
      await updateConfig(id, updatedConfig);
    } catch (err) {
      console.error('Error toggling config:', err);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return {
    configs,
    loading,
    error,
    reload: loadConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleActive,
  };
}
