/** API de configuración del sistema (pagos, moneda, impuestos, notificaciones, backups) */

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

export const configurationApi = {
  // System
  getSystemConfig: () =>
    apiClient.get<SystemConfig>('/config/system'),

  updateSystemConfig: (data: Partial<SystemConfig>) =>
    apiClient.put<SystemConfig>('/config/system', data),

  // Payment Methods
  getPaymentMethods: () =>
    apiClient.get<PaymentMethod[]>('/config/payment-methods'),

  updatePaymentMethod: (id: number, data: Partial<PaymentMethod>) =>
    apiClient.put<PaymentMethod>(`/config/payment-methods/${id}`, data),

  // Payment Configurations
  getPaymentConfigs: () =>
    apiClient.get<PaymentConfig[]>('/config/payment-config'),

  createPaymentConfig: (data: PaymentConfigCreate) =>
    apiClient.post<PaymentConfig>('/config/payment-config', data),

  updatePaymentConfig: (id: number, data: PaymentConfigUpdate) =>
    apiClient.put<PaymentConfig>(`/config/payment-config/${id}`, data),

  deletePaymentConfig: (id: number) =>
    apiClient.delete(`/config/payment-config/${id}`),

  // Custom Installments
  getCustomInstallments: (cardType?: string) => {
    const params = cardType ? { card_type: cardType } : {};
    return apiClient.get<CustomInstallment[]>('/config/custom-installments', { params });
  },

  createCustomInstallment: (data: CustomInstallmentCreate) =>
    apiClient.post<CustomInstallment>('/config/custom-installments', data),

  updateCustomInstallment: (id: number, data: Partial<CustomInstallmentCreate>) =>
    apiClient.put<CustomInstallment>(`/config/custom-installments/${id}`, data),

  deleteCustomInstallment: (id: number) =>
    apiClient.delete(`/config/custom-installments/${id}`),

  toggleCustomInstallment: (id: number) =>
    apiClient.patch<CustomInstallment>(`/config/custom-installments/${id}/toggle`),

  // Currency
  getCurrencyConfig: () =>
    apiClient.get<CurrencyConfig>('/config/currency'),

  updateCurrencyConfig: (data: Partial<CurrencyConfig>) =>
    apiClient.put<CurrencyConfig>('/config/currency', data),

  // Tax Rates
  getTaxRates: () =>
    apiClient.get<TaxRate[]>('/config/tax-rates'),

  createTaxRate: (data: TaxRateCreate) =>
    apiClient.post<TaxRate>('/config/tax-rates', data),

  updateTaxRate: (id: number, data: TaxRateUpdate) =>
    apiClient.put<TaxRate>(`/config/tax-rates/${id}`, data),

  deleteTaxRate: (id: number) =>
    apiClient.delete(`/config/tax-rates/${id}`),

  setDefaultTaxRate: (id: number) =>
    apiClient.patch<TaxRate>(`/config/tax-rates/${id}/set-default`),

  // Notifications
  getNotificationConfig: () =>
    apiClient.get<NotificationConfig>('/config/notifications'),

  updateNotificationConfig: (data: Partial<NotificationConfig>) =>
    apiClient.put<NotificationConfig>('/config/notifications', data),

  // Backup
  getBackupConfig: () =>
    apiClient.get<SecurityBackupConfig>('/config/backup'),

  updateBackupConfig: (data: Partial<SecurityBackupConfig>) =>
    apiClient.put<SecurityBackupConfig>('/config/backup', data),

  createBackup: () =>
    apiClient.post('/config/backup/create'),

  getBackupHistory: () =>
    apiClient.get('/config/backup/history'),
};
