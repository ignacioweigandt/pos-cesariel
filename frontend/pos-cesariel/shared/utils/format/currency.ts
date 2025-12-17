/**
 * Currency formatting utilities
 *
 * Provides functions for formatting numbers as currency based on system configuration.
 *
 * IMPORTANT: These are standalone utilities. For React components, use the useCurrency hook instead.
 */

// Global currency configuration (will be set by the CurrencyProvider)
let globalCurrencyConfig = {
  symbol: '$',
  position: 'before' as 'before' | 'after',
  decimalPlaces: 2,
  currency: 'ARS' as 'ARS' | 'USD',
};

/**
 * Update global currency configuration
 * Called by CurrencyProvider when config changes
 * @internal
 */
export function updateGlobalCurrencyConfig(config: {
  symbol: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  currency: 'ARS' | 'USD';
}) {
  globalCurrencyConfig = config;
}

/**
 * Format number as currency using global configuration
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  const formattedAmount = amount.toFixed(globalCurrencyConfig.decimalPlaces);
  return globalCurrencyConfig.position === 'before'
    ? `${globalCurrencyConfig.symbol}${formattedAmount}`
    : `${formattedAmount}${globalCurrencyConfig.symbol}`;
}

/**
 * Format number with currency symbol (alias for formatCurrency)
 * @param amount - Amount to format
 * @param currency - Currency code (optional, uses global config if not provided)
 * @returns Formatted currency string
 */
export function formatPrice(amount: number, currency?: string): string {
  // If a specific currency is provided, use Intl.NumberFormat
  if (currency) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: globalCurrencyConfig.decimalPlaces,
      maximumFractionDigits: globalCurrencyConfig.decimalPlaces
    }).format(amount);
  }

  // Otherwise use global config
  return formatCurrency(amount);
}

/**
 * Format currency with custom configuration
 * @param amount - Amount to format
 * @param config - Custom configuration
 * @returns Formatted currency string
 */
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

/**
 * Parse currency string to number
 * @param value - Currency string to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols, dots (thousands separator), and replace comma with dot
  const cleaned = value.replace(/[^\d,-]/g, '').replace('.', '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get current currency symbol
 * @returns Current currency symbol
 */
export function getCurrencySymbol(): string {
  return globalCurrencyConfig.symbol;
}

/**
 * Get current currency configuration
 * @returns Current currency config
 */
export function getCurrencyConfig() {
  return { ...globalCurrencyConfig };
}
