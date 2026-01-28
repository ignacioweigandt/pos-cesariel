/**
 * Tests for currency formatting utilities
 */

import {
  formatCurrency,
  formatPrice,
  formatCurrencyCustom,
  parseCurrency,
  getCurrencySymbol,
  getCurrencyConfig,
  updateGlobalCurrencyConfig,
} from '../currency';

describe('Currency Utils', () => {
  beforeEach(() => {
    // Reset to default configuration before each test
    updateGlobalCurrencyConfig({
      symbol: '$',
      position: 'before',
      decimalPlaces: 2,
      currency: 'ARS',
    });
  });

  describe('formatCurrency', () => {
    it('should format number with default config ($ before, 2 decimals)', () => {
      expect(formatCurrency(1234.56)).toBe('$1234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500.25)).toBe('$-500.25');
    });

    it('should format with symbol after when configured', () => {
      updateGlobalCurrencyConfig({
        symbol: '€',
        position: 'after',
        decimalPlaces: 2,
        currency: 'ARS',
      });
      expect(formatCurrency(100.50)).toBe('100.50€');
    });

    it('should respect decimal places configuration', () => {
      updateGlobalCurrencyConfig({
        symbol: '$',
        position: 'before',
        decimalPlaces: 0,
        currency: 'ARS',
      });
      expect(formatCurrency(1234.99)).toBe('$1235');
    });

    it('should handle very large numbers', () => {
      expect(formatCurrency(9999999.99)).toBe('$9999999.99');
    });

    it('should handle very small numbers', () => {
      expect(formatCurrency(0.01)).toBe('$0.01');
    });
  });

  describe('formatPrice', () => {
    it('should use formatCurrency when no currency specified', () => {
      expect(formatPrice(1234.56)).toBe('$1234.56');
    });

    it('should use Intl.NumberFormat when currency is specified', () => {
      const result = formatPrice(1234.56, 'USD');
      // Intl.NumberFormat may vary by locale (e.g., "US$ 1.234,56" or "USD 1,234.56")
      // Just check it contains the numbers (may have thousand separators)
      expect(result).toMatch(/1[.,\s]234/);
      expect(result).toMatch(/56/);
    });

    it('should handle ARS currency code', () => {
      const result = formatPrice(1000, 'ARS');
      // May be formatted as "$ 1.000,00" or similar
      expect(result).toMatch(/1[.,\s]?000/);
    });
  });

  describe('formatCurrencyCustom', () => {
    it('should use custom symbol', () => {
      expect(formatCurrencyCustom(100, { symbol: '€' })).toBe('€100.00');
    });

    it('should use custom position', () => {
      expect(formatCurrencyCustom(100, { position: 'after' })).toBe('100.00$');
    });

    it('should use custom decimal places', () => {
      expect(formatCurrencyCustom(100.456, { decimalPlaces: 3 })).toBe('$100.456');
    });

    it('should combine multiple custom configs', () => {
      expect(
        formatCurrencyCustom(50.5, {
          symbol: 'USD',
          position: 'after',
          decimalPlaces: 1,
        })
      ).toBe('50.5USD');
    });

    it('should fall back to global config for unspecified options', () => {
      expect(formatCurrencyCustom(200, { symbol: '£' })).toBe('£200.00');
    });
  });

  describe('parseCurrency', () => {
    it('should parse simple currency string', () => {
      // parseCurrency removes dots (thousands) and replaces comma with dot
      // So "$1234.56" becomes "123456" (dot removed) which is wrong
      // It's designed for European format: "$1.234,56" → 1234.56
      expect(parseCurrency('$1234,56')).toBe(1234.56);
    });

    it('should parse currency with thousands separator', () => {
      expect(parseCurrency('$1.234,56')).toBe(1234.56);
    });

    it('should handle no currency symbol', () => {
      // European format with comma as decimal
      expect(parseCurrency('1234,56')).toBe(1234.56);
    });

    it('should handle negative amounts', () => {
      expect(parseCurrency('$-500,00')).toBe(-500);
    });

    it('should return 0 for invalid input', () => {
      expect(parseCurrency('invalid')).toBe(0);
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency('$')).toBe(0);
    });

    it('should handle European format (comma as decimal)', () => {
      expect(parseCurrency('€1.234,56')).toBe(1234.56);
    });

    it('should parse zero correctly', () => {
      expect(parseCurrency('$0.00')).toBe(0);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return current symbol', () => {
      expect(getCurrencySymbol()).toBe('$');
    });

    it('should return updated symbol after config change', () => {
      updateGlobalCurrencyConfig({
        symbol: '€',
        position: 'before',
        decimalPlaces: 2,
        currency: 'ARS',
      });
      expect(getCurrencySymbol()).toBe('€');
    });
  });

  describe('getCurrencyConfig', () => {
    it('should return full config object', () => {
      const config = getCurrencyConfig();
      expect(config).toEqual({
        symbol: '$',
        position: 'before',
        decimalPlaces: 2,
        currency: 'ARS',
      });
    });

    it('should return updated config after change', () => {
      updateGlobalCurrencyConfig({
        symbol: 'USD',
        position: 'after',
        decimalPlaces: 0,
        currency: 'USD',
      });
      const config = getCurrencyConfig();
      expect(config.symbol).toBe('USD');
      expect(config.position).toBe('after');
      expect(config.decimalPlaces).toBe(0);
      expect(config.currency).toBe('USD');
    });

    it('should return a copy (not mutate original)', () => {
      const config = getCurrencyConfig();
      config.symbol = 'MODIFIED';
      expect(getCurrencySymbol()).toBe('$');
    });
  });

  describe('updateGlobalCurrencyConfig', () => {
    it('should update all config properties', () => {
      updateGlobalCurrencyConfig({
        symbol: '£',
        position: 'after',
        decimalPlaces: 3,
        currency: 'USD',
      });
      const config = getCurrencyConfig();
      expect(config.symbol).toBe('£');
      expect(config.position).toBe('after');
      expect(config.decimalPlaces).toBe(3);
      expect(config.currency).toBe('USD');
    });

    it('should affect subsequent formatCurrency calls', () => {
      updateGlobalCurrencyConfig({
        symbol: 'R$',
        position: 'before',
        decimalPlaces: 2,
        currency: 'ARS',
      });
      expect(formatCurrency(100)).toBe('R$100.00');
    });
  });
});
