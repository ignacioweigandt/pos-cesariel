/**
 * Utilidades de formateo de moneda basadas en configuración del sistema.
 * Para componentes React, usar el hook useCurrency en su lugar.
 */

let globalCurrencyConfig = {
  symbol: '$',
  position: 'before' as 'before' | 'after',
  decimalPlaces: 2,
  currency: 'ARS' as 'ARS' | 'USD',
};

/** Actualizar config global (llamado por CurrencyProvider) */
export function updateGlobalCurrencyConfig(config: {
  symbol: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  currency: 'ARS' | 'USD';
}) {
  globalCurrencyConfig = config;
}

/** Formatear número como moneda usando configuración global */
export function formatCurrency(amount: number): string {
  const formattedAmount = amount.toFixed(globalCurrencyConfig.decimalPlaces);
  return globalCurrencyConfig.position === 'before'
    ? `${globalCurrencyConfig.symbol}${formattedAmount}`
    : `${formattedAmount}${globalCurrencyConfig.symbol}`;
}

/** Formatear precio con símbolo de moneda. Si se especifica currency, usa Intl.NumberFormat */
export function formatPrice(amount: number, currency?: string): string {
  if (currency) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: globalCurrencyConfig.decimalPlaces,
      maximumFractionDigits: globalCurrencyConfig.decimalPlaces
    }).format(amount);
  }

  return formatCurrency(amount);
}

/** Formatear moneda con configuración personalizada */
export function formatCurrencyCustom(
  amount: number,
  config: {
    symbol?: string;
    position?: 'before' | 'after';
    decimalPlaces?: number;
  }
): string {
  const symbol = config.symbol ?? globalCurrencyConfig.symbol;
  const position = config.position ?? globalCurrencyConfig.position;
  const decimalPlaces = config.decimalPlaces ?? globalCurrencyConfig.decimalPlaces;

  const formattedAmount = amount.toFixed(decimalPlaces);
  return position === 'before'
    ? `${symbol}${formattedAmount}`
    : `${formattedAmount}${symbol}`;
}

/** Parsear string de moneda a número (ej: "$1.234,56" -> 1234.56) */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,-]/g, '').replace('.', '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/** Obtener símbolo de moneda actual */
export function getCurrencySymbol(): string {
  return globalCurrencyConfig.symbol;
}

/** Obtener configuración actual de moneda */
export function getCurrencyConfig() {
  return { ...globalCurrencyConfig };
}
