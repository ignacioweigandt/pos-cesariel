/** API admin de e-commerce (productos, banners, WhatsApp, social media, reportes) */

import { apiClient } from '@/shared/api/client';

export const ecommerceAdvancedApi = {
  // Product Images
  getProductImages: (productId: number) =>
    apiClient.get(`/ecommerce-advanced/products/${productId}/images`),

  addProductImage: (productId: number, formData: FormData) =>
    apiClient.post(`/ecommerce-advanced/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateProductImage: (imageId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/products/images/${imageId}`, data),

  deleteProductImage: (imageId: number) =>
    apiClient.delete(`/ecommerce-advanced/products/images/${imageId}`),

  // Store Banners
  getStoreBanners: (activeOnly = false) =>
    apiClient.get('/ecommerce-advanced/banners', { params: { active_only: activeOnly } }),

  createStoreBanner: (formData: FormData) =>
    apiClient.post('/ecommerce-advanced/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateStoreBanner: (bannerId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/banners/${bannerId}`, data),

  updateStoreBannerWithImage: (bannerId: number, formData: FormData) =>
    apiClient.put(`/ecommerce-advanced/banners/${bannerId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  deleteStoreBanner: (bannerId: number) =>
    apiClient.delete(`/ecommerce-advanced/banners/${bannerId}`),

  // WhatsApp Sales
  getWhatsAppSales: () =>
    apiClient.get('/ecommerce-advanced/whatsapp-sales'),

  createWhatsAppSale: (data: any) =>
    apiClient.post('/ecommerce-advanced/whatsapp-sales', data),

  updateWhatsAppSale: (saleId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/whatsapp-sales/${saleId}`, data),

  fixWhatsAppSalesShipping: () =>
    apiClient.post('/ecommerce-advanced/fix-whatsapp-sales-shipping'),

  // WhatsApp Configuration
  getWhatsAppConfig: () =>
    apiClient.get('/ecommerce-advanced/whatsapp-config'),

  createOrUpdateWhatsAppConfig: (data: any) =>
    apiClient.post('/ecommerce-advanced/whatsapp-config', data),

  updateWhatsAppConfig: (configId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/whatsapp-config/${configId}`, data),

  deleteWhatsAppConfig: (configId: number) =>
    apiClient.delete(`/ecommerce-advanced/whatsapp-config/${configId}`),

  // Social Media
  getSocialMediaConfigs: (activeOnly = false) =>
    apiClient.get('/ecommerce-advanced/social-media', { params: { active_only: activeOnly } }),

  createSocialMediaConfig: (data: any) =>
    apiClient.post('/ecommerce-advanced/social-media', data),

  updateSocialMediaConfig: (configId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/social-media/${configId}`, data),

  deleteSocialMediaConfig: (configId: number) =>
    apiClient.delete(`/ecommerce-advanced/social-media/${configId}`),

  // Dashboard & Reports
  getDashboardStats: () =>
    apiClient.get('/ecommerce-advanced/dashboard/stats'),

  getStoreData: () =>
    apiClient.get('/ecommerce-advanced/store-data'),

  getSalesReport: () =>
    apiClient.get('/ecommerce-advanced/sales-report'),

  updateSaleStatus: (saleId: number, status: string) =>
    apiClient.put(`/ecommerce-advanced/sales/${saleId}/status`, { new_status: status }),
};
