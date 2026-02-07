/** API de configuración del sistema: e-commerce, pagos, impuestos y preferencias */

import { apiClient } from './client';
import type {
  PaymentMethod,
  PaymentConfig,
  PaymentConfigCreate,
  PaymentConfigUpdate,
  TaxRate,
  TaxRateCreate,
  TaxRateUpdate,
  SystemConfig,
  NotificationConfig,
  SecurityBackupConfig,
} from '@/features/configuracion/types';
import type { StoreConfig } from '@/features/ecommerce/types/ecommerce.types';

// React 19: Type-safe config API data types
export interface PrinterConfig {
  enabled: boolean;
  printer_name: string;
  paper_width: number;
  auto_print: boolean;
}

export const configApi = {
  // Configuración E-commerce
  getEcommerceConfig: () => apiClient.get<StoreConfig>('/config/ecommerce'),
  createEcommerceConfig: (data: Partial<StoreConfig>) => apiClient.post<StoreConfig>('/config/ecommerce', data),
  updateEcommerceConfig: (data: Partial<StoreConfig>) => apiClient.put<StoreConfig>('/config/ecommerce', data),

  // Configuración del Sistema
  getSystemConfig: () => apiClient.get<SystemConfig>('/config/system'),
  updateSystemConfig: (data: Partial<SystemConfig>) => apiClient.put<SystemConfig>('/config/system', data),

  // Métodos de Pago
  getPaymentMethods: () => apiClient.get<PaymentMethod[]>('/config/payment-methods'),
  updatePaymentMethod: (id: number, data: Partial<PaymentMethod>) => 
    apiClient.put<PaymentMethod>(`/config/payment-methods/${id}`, data),

  // Tasas de Impuestos
  getTaxRates: () => apiClient.get<TaxRate[]>('/config/tax-rates'),
  createTaxRate: (data: TaxRateCreate) => apiClient.post<TaxRate>('/config/tax-rates', data),
  updateTaxRate: (id: number, data: TaxRateUpdate) => apiClient.put<TaxRate>(`/config/tax-rates/${id}`, data),

  // Otras Configuraciones
  getPrinterConfig: () => apiClient.get<PrinterConfig>('/config/printers'),
  getNotificationConfig: () => apiClient.get<NotificationConfig>('/config/notifications'),
  getBackupConfig: () => apiClient.get<SecurityBackupConfig>('/config/backup'),

  // Configuraciones de Pago (Payment Config)
  getPaymentConfigs: () => apiClient.get<PaymentConfig[]>('/config/payment-config'),
  createPaymentConfig: (data: PaymentConfigCreate) => apiClient.post<PaymentConfig>('/config/payment-config', data),
  updatePaymentConfig: (id: number, data: PaymentConfigUpdate) => 
    apiClient.put<PaymentConfig>(`/config/payment-config/${id}`, data),
  deletePaymentConfig: (id: number) => apiClient.delete(`/config/payment-config/${id}`),

  /** Obtener cuotas personalizadas. cardType: 'bancarizadas' | 'no_bancarizadas' */
  getCustomInstallments: (cardType?: string) => {
    const params = cardType ? { card_type: cardType } : {};
    return apiClient.get('/config/custom-installments', { params });
  },

  /** Subir logo de la tienda */
  uploadLogo: (formData: FormData) =>
    apiClient.post('/config/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
