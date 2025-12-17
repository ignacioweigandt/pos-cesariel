/**
 * Configuration Validators
 *
 * Validation functions for configuration forms
 */

import type { CurrencyCode } from '../types';

/**
 * Validate currency code (only ARS and USD allowed)
 */
export function validateCurrencyCode(code: string): code is CurrencyCode {
  return code === 'ARS' || code === 'USD';
}

/**
 * Validate decimal places
 */
export function validateDecimalPlaces(places: number): boolean {
  return Number.isInteger(places) && places >= 0 && places <= 2;
}

/**
 * Validate surcharge percentage
 */
export function validateSurcharge(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100;
}

/**
 * Validate installments number
 */
export function validateInstallments(installments: number): boolean {
  return Number.isInteger(installments) && installments >= 1 && installments <= 60;
}

/**
 * Validate tax rate
 */
export function validateTaxRate(rate: number): boolean {
  return rate >= 0 && rate <= 100;
}

/**
 * Validate stock threshold
 */
export function validateStockThreshold(threshold: number): boolean {
  return Number.isInteger(threshold) && threshold >= 1 && threshold <= 100;
}

/**
 * Validate retention days
 */
export function validateRetentionDays(days: number): boolean {
  return Number.isInteger(days) && days >= 1 && days <= 365;
}

/**
 * Validate time format (HH:MM)
 */
export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Get validation error message for surcharge
 */
export function getSurchargeError(percentage: number): string | null {
  if (percentage < 0) return 'El recargo no puede ser negativo';
  if (percentage > 100) return 'El recargo no puede superar 100%';
  return null;
}

/**
 * Get validation error message for installments
 */
export function getInstallmentsError(installments: number): string | null {
  if (!Number.isInteger(installments)) return 'Las cuotas deben ser un número entero';
  if (installments < 1) return 'Debe haber al menos 1 cuota';
  if (installments > 60) return 'No se permiten más de 60 cuotas';
  return null;
}

/**
 * Get validation error message for tax rate
 */
export function getTaxRateError(rate: number): string | null {
  if (rate < 0) return 'La tasa no puede ser negativa';
  if (rate > 100) return 'La tasa no puede superar 100%';
  return null;
}

/**
 * Get validation error message for currency
 */
export function getCurrencyError(code: string): string | null {
  if (!validateCurrencyCode(code)) {
    return 'Solo se permite Peso Argentino (ARS) o Dólar Estadounidense (USD)';
  }
  return null;
}
