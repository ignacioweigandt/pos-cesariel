/**
 * useCurrencyConfig Hook
 *
 * Custom hook for managing currency configuration
 * RESTRICTED to ARS and USD only as per requirements
 */

import { useState, useEffect, useMemo } from 'react';
import { configurationApi } from '../api';
import type { Currency, CurrencyConfig, CurrencyCode } from '../types';
import toast from 'react-hot-toast';

// ONLY ARS and USD are allowed
const ALLOWED_CURRENCIES: Currency[] = [
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', country: 'Argentina' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', country: 'Estados Unidos' },
];

export function useCurrencyConfig() {
  const [config, setConfig] = useState<CurrencyConfig>({
    default_currency: 'ARS',
    currency_symbol: '$',
    currency_position: 'before',
    decimal_places: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Available currencies (only ARS and USD)
  const availableCurrencies = useMemo(() => ALLOWED_CURRENCIES, []);

  // Format price helper
  const formatPrice = (amount: number, customConfig?: Partial<CurrencyConfig>) => {
    const activeConfig = customConfig ? { ...config, ...customConfig } : config;
    const formattedAmount = amount.toFixed(activeConfig.decimal_places);

    return activeConfig.currency_position === 'before'
      ? `${activeConfig.currency_symbol}${formattedAmount}`
      : `${formattedAmount}${activeConfig.currency_symbol}`;
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configurationApi.getCurrencyConfig();

      // Validate that currency is ARS or USD
      if (response.data.default_currency !== 'ARS' && response.data.default_currency !== 'USD') {
        console.warn('Invalid currency detected, defaulting to ARS');
        response.data.default_currency = 'ARS';
        response.data.currency_symbol = '$';
      }

      setConfig(response.data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Error cargando configuración de moneda');
      console.error('Error loading currency config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (data: Partial<CurrencyConfig>) => {
    // Validate currency code
    if (data.default_currency && data.default_currency !== 'ARS' && data.default_currency !== 'USD') {
      toast.error('Solo se permite Peso Argentino (ARS) o Dólar Estadounidense (USD)');
      throw new Error('Invalid currency code');
    }

    // Validate decimal places
    if (data.decimal_places !== undefined) {
      if (data.decimal_places < 0 || data.decimal_places > 2) {
        toast.error('Los decimales deben estar entre 0 y 2');
        throw new Error('Invalid decimal places');
      }
    }

    try {
      setSaving(true);
      const response = await configurationApi.updateCurrencyConfig(data);
      setConfig(response.data);
      toast.success('Configuración de moneda actualizada');
      return response.data;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid')) {
        throw err;
      }
      toast.error('Error actualizando configuración de moneda');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const changeCurrency = async (currencyCode: CurrencyCode) => {
    const currency = availableCurrencies.find(c => c.code === currencyCode);

    if (!currency) {
      toast.error('Moneda no válida');
      return;
    }

    await updateConfig({
      default_currency: currency.code,
      currency_symbol: currency.symbol,
    });
  };

  const getCurrentCurrency = () => {
    return availableCurrencies.find(c => c.code === config.default_currency);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    availableCurrencies,
    currentCurrency: getCurrentCurrency(),
    loading,
    saving,
    error,
    reload: loadConfig,
    updateConfig,
    changeCurrency,
    formatPrice,
  };
}
