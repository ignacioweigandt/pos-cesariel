/**
 * Configuration API
 *
 * Handles all configuration-related API calls
 * Extended with custom installments functionality
 */

import { apiClient } from '@/shared/api/client';
import type {
  PaymentMethod,
  PaymentConfig,
  PaymentConfigCreate,
  PaymentConfigUpdate,
  CustomInstallment,
  CustomInstallmentCreate,
  TaxRate,
  TaxRateCreate,
  TaxRateUpdate,
  CurrencyConfig,
  NotificationConfig,
  SecurityBackupConfig,
  SystemConfig,
} from '../types';

/**
 * Configuration API methods
 */
export const configurationApi = {
  // ===== System Configuration =====

  /**
   * Get system configuration
   * @returns System config
   */
  getSystemConfig: () =>
    apiClient.get<SystemConfig>('/config/system'),

  /**
   * Update system configuration
   * @param data - Updated system config
   * @returns Updated config
   */
  updateSystemConfig: (data: Partial<SystemConfig>) =>
    apiClient.put<SystemConfig>('/config/system', data),

  // ===== Payment Methods =====

  /**
   * Get payment methods
   * @returns List of payment methods
   */
  getPaymentMethods: () =>
    apiClient.get<PaymentMethod[]>('/config/payment-methods'),

  /**
   * Update payment method
   * @param id - Payment method ID
   * @param data - Updated payment method data
   * @returns Updated payment method
   */
  updatePaymentMethod: (id: number, data: Partial<PaymentMethod>) =>
    apiClient.put<PaymentMethod>(`/config/payment-methods/${id}`, data),

  // ===== Payment Configurations =====

  /**
   * Get payment configurations
   * @returns List of payment configs
   */
  getPaymentConfigs: () =>
    apiClient.get<PaymentConfig[]>('/config/payment-config'),

  /**
   * Create payment configuration
   * @param data - Payment config data
   * @returns Created config
   */
  createPaymentConfig: (data: PaymentConfigCreate) =>
    apiClient.post<PaymentConfig>('/config/payment-config', data),

  /**
   * Update payment configuration
   * @param id - Config ID
   * @param data - Updated config data
   * @returns Updated config
   */
  updatePaymentConfig: (id: number, data: PaymentConfigUpdate) =>
    apiClient.put<PaymentConfig>(`/config/payment-config/${id}`, data),

  /**
   * Delete payment configuration
   * @param id - Config ID
   * @returns Success response
   */
  deletePaymentConfig: (id: number) =>
    apiClient.delete(`/config/payment-config/${id}`),

  // ===== Custom Installments (NEW) =====

  /**
   * Get custom installments for a card type
   * @param cardType - Type of card (bancarizadas or no_bancarizadas)
   * @returns List of custom installments
   */
  getCustomInstallments: (cardType?: string) => {
    const params = cardType ? { card_type: cardType } : {};
    return apiClient.get<CustomInstallment[]>('/config/custom-installments', { params });
  },

  /**
   * Create custom installment
   * @param data - Custom installment data
   * @returns Created custom installment
   */
  createCustomInstallment: (data: CustomInstallmentCreate) =>
    apiClient.post<CustomInstallment>('/config/custom-installments', data),

  /**
   * Update custom installment
   * @param id - Installment ID
   * @param data - Updated installment data
   * @returns Updated installment
   */
  updateCustomInstallment: (id: number, data: Partial<CustomInstallmentCreate>) =>
    apiClient.put<CustomInstallment>(`/config/custom-installments/${id}`, data),

  /**
   * Delete custom installment
   * @param id - Installment ID
   * @returns Success response
   */
  deleteCustomInstallment: (id: number) =>
    apiClient.delete(`/config/custom-installments/${id}`),

  /**
   * Toggle custom installment active status
   * @param id - Installment ID
   * @returns Updated installment
   */
  toggleCustomInstallment: (id: number) =>
    apiClient.patch<CustomInstallment>(`/config/custom-installments/${id}/toggle`),

  // ===== Currency Configuration =====

  /**
   * Get currency configuration
   * @returns Currency config
   */
  getCurrencyConfig: () =>
    apiClient.get<CurrencyConfig>('/config/currency'),

  /**
   * Update currency configuration
   * @param data - Updated currency config
   * @returns Updated config
   */
  updateCurrencyConfig: (data: Partial<CurrencyConfig>) =>
    apiClient.put<CurrencyConfig>('/config/currency', data),

  // ===== Tax Rates =====

  /**
   * Get tax rates
   * @returns List of tax rates
   */
  getTaxRates: () =>
    apiClient.get<TaxRate[]>('/config/tax-rates'),

  /**
   * Create tax rate
   * @param data - Tax rate data
   * @returns Created tax rate
   */
  createTaxRate: (data: TaxRateCreate) =>
    apiClient.post<TaxRate>('/config/tax-rates', data),

  /**
   * Update tax rate
   * @param id - Tax rate ID
   * @param data - Updated tax rate data
   * @returns Updated tax rate
   */
  updateTaxRate: (id: number, data: TaxRateUpdate) =>
    apiClient.put<TaxRate>(`/config/tax-rates/${id}`, data),

  /**
   * Delete tax rate
   * @param id - Tax rate ID
   * @returns Success response
   */
  deleteTaxRate: (id: number) =>
    apiClient.delete(`/config/tax-rates/${id}`),

  /**
   * Set default tax rate
   * @param id - Tax rate ID
   * @returns Updated tax rate
   */
  setDefaultTaxRate: (id: number) =>
    apiClient.patch<TaxRate>(`/config/tax-rates/${id}/set-default`),

  // ===== Notification Configuration =====

  /**
   * Get notification configuration
   * @returns Notification config
   */
  getNotificationConfig: () =>
    apiClient.get<NotificationConfig>('/config/notifications'),

  /**
   * Update notification configuration
   * @param data - Updated notification config
   * @returns Updated config
   */
  updateNotificationConfig: (data: Partial<NotificationConfig>) =>
    apiClient.put<NotificationConfig>('/config/notifications', data),

  // ===== Security & Backup Configuration =====

  /**
   * Get backup configuration
   * @returns Backup config
   */
  getBackupConfig: () =>
    apiClient.get<SecurityBackupConfig>('/config/backup'),

  /**
   * Update backup configuration
   * @param data - Updated backup config
   * @returns Updated config
   */
  updateBackupConfig: (data: Partial<SecurityBackupConfig>) =>
    apiClient.put<SecurityBackupConfig>('/config/backup', data),

  /**
   * Create manual backup
   * @returns Backup result
   */
  createBackup: () =>
    apiClient.post('/config/backup/create'),

  /**
   * Get backup history
   * @returns List of backups
   */
  getBackupHistory: () =>
    apiClient.get('/config/backup/history'),
};
