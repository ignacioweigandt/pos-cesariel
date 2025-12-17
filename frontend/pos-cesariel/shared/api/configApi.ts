/**
 * Configuration API
 *
 * Handles system, e-commerce, payment, and application configuration
 */

import { apiClient } from './client';

/**
 * Configuration API methods
 */
export const configApi = {
  // ===== E-commerce Configuration =====

  /**
   * Get e-commerce configuration
   * @returns E-commerce config
   */
  getEcommerceConfig: () =>
    apiClient.get('/config/ecommerce'),

  /**
   * Create e-commerce configuration
   * @param data - E-commerce config data
   * @returns Created config
   */
  createEcommerceConfig: (data: any) =>
    apiClient.post('/config/ecommerce', data),

  /**
   * Update e-commerce configuration
   * @param data - Updated config data
   * @returns Updated config
   */
  updateEcommerceConfig: (data: any) =>
    apiClient.put('/config/ecommerce', data),

  // ===== System Configuration =====

  /**
   * Get system configuration
   * @returns System config
   */
  getSystemConfig: () =>
    apiClient.get('/config/system'),

  /**
   * Update system configuration
   * @param data - Updated system config
   * @returns Updated config
   */
  updateSystemConfig: (data: any) =>
    apiClient.put('/config/system', data),

  // ===== Payment Methods =====

  /**
   * Get payment methods
   * @returns List of payment methods
   */
  getPaymentMethods: () =>
    apiClient.get('/config/payment-methods'),

  /**
   * Update payment method
   * @param id - Payment method ID
   * @param data - Updated payment method data
   * @returns Updated payment method
   */
  updatePaymentMethod: (id: number, data: any) =>
    apiClient.put(`/config/payment-methods/${id}`, data),

  // ===== Tax Rates =====

  /**
   * Get tax rates
   * @returns List of tax rates
   */
  getTaxRates: () =>
    apiClient.get('/config/tax-rates'),

  /**
   * Create tax rate
   * @param data - Tax rate data
   * @returns Created tax rate
   */
  createTaxRate: (data: any) =>
    apiClient.post('/config/tax-rates', data),

  /**
   * Update tax rate
   * @param id - Tax rate ID
   * @param data - Updated tax rate data
   * @returns Updated tax rate
   */
  updateTaxRate: (id: number, data: any) =>
    apiClient.put(`/config/tax-rates/${id}`, data),

  // ===== Other Configurations =====

  /**
   * Get printer configuration
   * @returns Printer config
   */
  getPrinterConfig: () =>
    apiClient.get('/config/printers'),

  /**
   * Get notification configuration
   * @returns Notification config
   */
  getNotificationConfig: () =>
    apiClient.get('/config/notifications'),

  /**
   * Get backup configuration
   * @returns Backup config
   */
  getBackupConfig: () =>
    apiClient.get('/config/backup'),

  // ===== Payment Configuration =====

  /**
   * Get payment configurations
   * @returns List of payment configs
   */
  getPaymentConfigs: () =>
    apiClient.get('/config/payment-config'),

  /**
   * Create payment configuration
   * @param data - Payment config data
   * @returns Created config
   */
  createPaymentConfig: (data: any) =>
    apiClient.post('/config/payment-config', data),

  /**
   * Update payment configuration
   * @param id - Config ID
   * @param data - Updated config data
   * @returns Updated config
   */
  updatePaymentConfig: (id: number, data: any) =>
    apiClient.put(`/config/payment-config/${id}`, data),

  /**
   * Delete payment configuration
   * @param id - Config ID
   * @returns Success response
   */
  deletePaymentConfig: (id: number) =>
    apiClient.delete(`/config/payment-config/${id}`),

  // ===== Custom Installments =====

  /**
   * Get custom installments for a card type
   * @param cardType - Optional filter for card type ('bancarizadas' or 'no_bancarizadas')
   * @returns List of custom installments
   */
  getCustomInstallments: (cardType?: string) => {
    const params = cardType ? { card_type: cardType } : {};
    return apiClient.get('/config/custom-installments', { params });
  },

  // ===== Logo Upload =====

  /**
   * Upload store logo
   * @param formData - Form data with logo file
   * @returns Uploaded logo URL
   */
  uploadLogo: (formData: FormData) =>
    apiClient.post('/config/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
