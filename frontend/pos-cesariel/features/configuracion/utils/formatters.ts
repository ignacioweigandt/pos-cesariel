/**
 * Configuration Formatters
 *
 * Utility functions for formatting configuration values
 */

import type { CurrencyConfig } from '../types';

/**
 * Format price with currency config
 */
export function formatPrice(
  amount: number,
  config: CurrencyConfig
): string {
  const formattedAmount = amount.toFixed(config.decimal_places);

  return config.currency_position === 'before'
    ? `${config.currency_symbol}${formattedAmount}`
    : `${formattedAmount}${config.currency_symbol}`;
}

/**
 * Format surcharge percentage
 */
export function formatSurcharge(percentage: number): string {
  if (percentage === 0) return 'Sin recargo';
  return `+${percentage}%`;
}

/**
 * Format installments text
 */
export function formatInstallments(installments: number): string {
  if (installments === 1) return '1 cuota';
  return `${installments} cuotas`;
}

/**
 * Calculate price with surcharge
 */
export function calculatePriceWithSurcharge(
  basePrice: number,
  surchargePercentage: number
): number {
  return basePrice * (1 + surchargePercentage / 100);
}

/**
 * Format card type display name
 */
export function formatCardType(cardType?: string): string {
  const types: Record<string, string> = {
    bancarizadas: 'Tarjetas Bancarizadas',
    no_bancarizadas: 'Tarjetas No Bancarizadas',
    tarjeta_naranja: 'Tarjeta Naranja',
  };

  return cardType ? types[cardType] || cardType : 'General';
}

/**
 * Format payment type display name
 */
export function formatPaymentType(paymentType: string): string {
  const types: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
  };

  return types[paymentType] || paymentType;
}

/**
 * Format backup frequency
 */
export function formatBackupFrequency(frequency: string): string {
  const frequencies: Record<string, string> = {
    DAILY: 'Diariamente',
    WEEKLY: 'Semanalmente',
    MONTHLY: 'Mensualmente',
  };

  return frequencies[frequency] || frequency;
}

/**
 * Format date for backup display
 */
export function formatBackupDate(dateStr?: string): string {
  if (!dateStr) return 'Nunca';

  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
