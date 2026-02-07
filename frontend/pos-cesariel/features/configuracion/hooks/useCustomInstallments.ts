/** Hook para planes de cuotas personalizadas (bancarizadas/no_bancarizadas, 1-60 cuotas, 0-100% recargo) */

import { useState, useEffect } from 'react';
import { configurationApi } from '../api';
import type { CustomInstallment, CustomInstallmentCreate, CardType } from '../types';
import toast from 'react-hot-toast';

interface UseCustomInstallmentsOptions {
  cardType?: CardType;
  autoLoad?: boolean;
}

export function useCustomInstallments(options: UseCustomInstallmentsOptions = {}) {
  const { cardType, autoLoad = true } = options;

  const [installments, setInstallments] = useState<CustomInstallment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // React 19: No useCallback needed - React Compiler optimizes automatically
  const loadInstallments = async (filterCardType?: CardType) => {
    try {
      setLoading(true);
      setError(null);
      const response = await configurationApi.getCustomInstallments(filterCardType || cardType);
      setInstallments(response.data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Error cargando cuotas personalizadas');
      console.error('Error loading custom installments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInstallment = async (data: CustomInstallmentCreate) => {
    try {
      if (data.installments < 1 || data.installments > 60) {
        toast.error('Las cuotas deben estar entre 1 y 60');
        throw new Error('Invalid installments number');
      }

      if (data.surcharge_percentage < 0 || data.surcharge_percentage > 100) {
        toast.error('El recargo debe estar entre 0% y 100%');
        throw new Error('Invalid surcharge percentage');
      }

      const response = await configurationApi.createCustomInstallment(data);
      setInstallments(prev => [...prev, response.data]);
      toast.success('Cuota personalizada creada exitosamente');
      return response.data;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid')) {
        throw err;
      }
      toast.error('Error creando cuota personalizada');
      throw err;
    }
  };

  const updateInstallment = async (id: number, data: Partial<CustomInstallmentCreate>) => {
    try {
      if (data.surcharge_percentage !== undefined) {
        if (data.surcharge_percentage < 0 || data.surcharge_percentage > 100) {
          toast.error('El recargo debe estar entre 0% y 100%');
          throw new Error('Invalid surcharge percentage');
        }
      }

      const response = await configurationApi.updateCustomInstallment(id, data);
      setInstallments(prev => prev.map(i => i.id === id ? response.data : i));
      toast.success('Cuota personalizada actualizada');
      return response.data;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid')) {
        throw err;
      }
      toast.error('Error actualizando cuota');
      throw err;
    }
  };

  const deleteInstallment = async (id: number) => {
    try {
      await configurationApi.deleteCustomInstallment(id);
      setInstallments(prev => prev.filter(i => i.id !== id));
      toast.success('Cuota personalizada eliminada');
    } catch (err) {
      toast.error('Error eliminando cuota');
      throw err;
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const response = await configurationApi.toggleCustomInstallment(id);
      setInstallments(prev => prev.map(i => i.id === id ? response.data : i));
      const installment = installments.find(i => i.id === id);
      toast.success(`Cuota ${response.data.is_active ? 'activada' : 'desactivada'}`);
    } catch (err) {
      toast.error('Error cambiando estado de la cuota');
      throw err;
    }
  };

  // React 19: No useCallback needed - React Compiler optimizes automatically
  const getInstallmentsByCardType = (type: CardType) => {
    return installments.filter(i => i.card_type === type);
  };

  const getActiveInstallments = (type?: CardType) => {
    const filtered = type ? getInstallmentsByCardType(type) : installments;
    return filtered.filter(i => i.is_active);
  };

  useEffect(() => {
    if (autoLoad) {
      loadInstallments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  return {
    installments,
    loading,
    error,
    reload: loadInstallments,
    createInstallment,
    updateInstallment,
    deleteInstallment,
    toggleActive,
    getInstallmentsByCardType,
    getActiveInstallments,
  };
}
