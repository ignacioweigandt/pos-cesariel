/**
 * useTaxRates Hook
 *
 * Custom hook for managing tax rates configuration
 */

import { useState, useEffect } from 'react';
import { configurationApi } from '../api';
import type { TaxRate, TaxRateCreate, TaxRateUpdate } from '../types';
import toast from 'react-hot-toast';

export function useTaxRates() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTaxRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configurationApi.getTaxRates();
      setTaxRates(response.data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Error cargando tasas de impuestos');
      console.error('Error loading tax rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTaxRate = async (data: TaxRateCreate) => {
    // Validations
    if (data.rate < 0 || data.rate > 100) {
      toast.error('La tasa debe estar entre 0% y 100%');
      throw new Error('Invalid tax rate');
    }

    try {
      const response = await configurationApi.createTaxRate(data);
      setTaxRates(prev => [...prev, response.data]);
      toast.success('Tasa de impuesto creada exitosamente');
      return response.data;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid')) {
        throw err;
      }
      toast.error('Error creando tasa de impuesto');
      throw err;
    }
  };

  const updateTaxRate = async (id: number, data: TaxRateUpdate) => {
    if (data.rate !== undefined && (data.rate < 0 || data.rate > 100)) {
      toast.error('La tasa debe estar entre 0% y 100%');
      throw new Error('Invalid tax rate');
    }

    try {
      const response = await configurationApi.updateTaxRate(id, data);
      setTaxRates(prev => prev.map(t => t.id === id ? response.data : t));
      toast.success('Tasa de impuesto actualizada');
      return response.data;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid')) {
        throw err;
      }
      toast.error('Error actualizando tasa');
      throw err;
    }
  };

  const deleteTaxRate = async (id: number) => {
    const rate = taxRates.find(t => t.id === id);
    if (rate?.is_default) {
      toast.error('No puedes eliminar la tasa por defecto');
      return;
    }

    try {
      await configurationApi.deleteTaxRate(id);
      setTaxRates(prev => prev.filter(t => t.id !== id));
      toast.success('Tasa de impuesto eliminada');
    } catch (err) {
      toast.error('Error eliminando tasa');
      throw err;
    }
  };

  const setDefaultTaxRate = async (id: number) => {
    try {
      const response = await configurationApi.setDefaultTaxRate(id);

      // Update all tax rates to reflect the new default
      setTaxRates(prev =>
        prev.map(t => ({
          ...t,
          is_default: t.id === id
        }))
      );

      const rate = taxRates.find(t => t.id === id);
      toast.success(`${rate?.name} establecido como impuesto por defecto`);
    } catch (err) {
      toast.error('Error estableciendo impuesto por defecto');
      throw err;
    }
  };

  const toggleActive = async (id: number) => {
    const rate = taxRates.find(t => t.id === id);
    if (!rate) return;

    if (rate.is_default && rate.is_active) {
      toast.error('No puedes desactivar el impuesto por defecto');
      return;
    }

    try {
      await updateTaxRate(id, { is_active: !rate.is_active });
    } catch (err) {
      console.error('Error toggling tax rate:', err);
    }
  };

  const getDefaultTaxRate = () => {
    return taxRates.find(t => t.is_default);
  };

  const getActiveTaxRates = () => {
    return taxRates.filter(t => t.is_active);
  };

  useEffect(() => {
    loadTaxRates();
  }, []);

  return {
    taxRates,
    loading,
    error,
    reload: loadTaxRates,
    createTaxRate,
    updateTaxRate,
    deleteTaxRate,
    setDefaultTaxRate,
    toggleActive,
    getDefaultTaxRate,
    getActiveTaxRates,
  };
}
