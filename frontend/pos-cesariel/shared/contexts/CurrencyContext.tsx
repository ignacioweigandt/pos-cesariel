'use client';

/**
 * Contexto global de configuración de moneda.
 * Carga config del API y proporciona funciones de formateo.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { configurationApi } from '@/features/configuracion/api';
import { updateGlobalCurrencyConfig } from '@/shared/utils/format/currency';
import type { CurrencyConfig } from '@/features/configuracion/types';
import { useAuth } from '@/shared/hooks/useAuth';

interface CurrencyContextType {
  config: CurrencyConfig;
  loading: boolean;
  error: Error | null;
  formatPrice: (amount: number) => string;
  reload: () => Promise<void>;
}

const defaultConfig: CurrencyConfig = {
  default_currency: 'ARS',
  currency_symbol: '$',
  currency_position: 'before',
  decimal_places: 2,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CurrencyConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  const updateConfig = (newConfig: CurrencyConfig) => {
    setConfig(newConfig);

    updateGlobalCurrencyConfig({
      symbol: newConfig.currency_symbol,
      position: newConfig.currency_position,
      decimalPlaces: newConfig.decimal_places,
      currency: newConfig.default_currency,
    });
  };

  const loadConfig = async () => {
    if (!isAuthenticated) {
      updateConfig(defaultConfig);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await configurationApi.getCurrencyConfig();
      updateConfig(response.data);
    } catch (err) {
      console.error('Error loading currency config:', err);
      setError(err as Error);
      updateConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [isAuthenticated]);

  const formatPrice = (amount: number): string => {
    const formattedAmount = amount.toFixed(config.decimal_places);
    return config.currency_position === 'before'
      ? `${config.currency_symbol}${formattedAmount}`
      : `${formattedAmount}${config.currency_symbol}`;
  };

  const value: CurrencyContextType = {
    config,
    loading,
    error,
    formatPrice,
    reload: loadConfig,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
