'use client';

/**
 * Currency Context
 *
 * Provides global access to currency configuration across the application.
 * Loads currency config from API and provides formatting functions.
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

    // Update global currency utilities
    updateGlobalCurrencyConfig({
      symbol: newConfig.currency_symbol,
      position: newConfig.currency_position,
      decimalPlaces: newConfig.decimal_places,
      currency: newConfig.default_currency,
    });
  };

  const loadConfig = async () => {
    // Solo cargar si el usuario está autenticado
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
      // Use default config on error
      updateConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [isAuthenticated]); // Recargar cuando cambia el estado de autenticación

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
