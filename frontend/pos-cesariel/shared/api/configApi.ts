/** API de configuración del sistema: e-commerce, pagos, impuestos y preferencias */

import { apiClient } from './client';

export const configApi = {
  // Configuración E-commerce
  getEcommerceConfig: () => apiClient.get('/config/ecommerce'),
  createEcommerceConfig: (data: any) => apiClient.post('/config/ecommerce', data),
  updateEcommerceConfig: (data: any) => apiClient.put('/config/ecommerce', data),

  // Configuración del Sistema
  getSystemConfig: () => apiClient.get('/config/system'),
  updateSystemConfig: (data: any) => apiClient.put('/config/system', data),

  // Métodos de Pago
  getPaymentMethods: () => apiClient.get('/config/payment-methods'),
  updatePaymentMethod: (id: number, data: any) => apiClient.put(`/config/payment-methods/${id}`, data),

  // Tasas de Impuestos
  getTaxRates: () => apiClient.get('/config/tax-rates'),
  createTaxRate: (data: any) => apiClient.post('/config/tax-rates', data),
  updateTaxRate: (id: number, data: any) => apiClient.put(`/config/tax-rates/${id}`, data),

  // Otras Configuraciones
  getPrinterConfig: () => apiClient.get('/config/printers'),
  getNotificationConfig: () => apiClient.get('/config/notifications'),
  getBackupConfig: () => apiClient.get('/config/backup'),

  // Configuraciones de Pago (Payment Config)
  getPaymentConfigs: () => apiClient.get('/config/payment-config'),
  createPaymentConfig: (data: any) => apiClient.post('/config/payment-config', data),
  updatePaymentConfig: (id: number, data: any) => apiClient.put(`/config/payment-config/${id}`, data),
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
