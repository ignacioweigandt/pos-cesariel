/**
 * Number formatting utilities
 *
 * Provides functions for formatting numbers
 */

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @returns Formatted number string (e.g., "1.234.567")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value);
}

/**
 * Format number as percentage
 * @param value - Number to format (0-1 range)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "45,67%")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Round number to specified decimal places
 * @param num - Number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 */
export function roundToDecimals(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Calculate percentage of value relative to total
 * @param value - Value to calculate percentage for
 * @param total - Total value
 * @returns Percentage (0-100)
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Apply discount percentage to amount
 * @param amount - Original amount
 * @param discountPercentage - Discount percentage (0-100)
 * @returns Discounted amount
 */
export function applyDiscount(amount: number, discountPercentage: number): number {
  return amount * (1 - discountPercentage / 100);
}

/**
 * Calculate tax amount for given base amount
 * @param amount - Base amount
 * @param taxRate - Tax rate percentage (e.g., 21 for 21%)
 * @returns Tax amount
 */
export function calculateTax(amount: number, taxRate: number): number {
  return amount * (taxRate / 100);
}

/**
 * Format number with compact notation (e.g., 1.5K, 2.3M)
 * @param value - Number to format
 * @returns Compact notation string
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);
}

/**
 * Validate if string is a valid number
 * @param value - String to validate
 * @returns True if valid number
 */
export function isValidNumber(value: string): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}
