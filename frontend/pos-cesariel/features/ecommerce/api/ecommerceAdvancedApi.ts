/**
 * E-commerce Advanced API
 *
 * Handles administrative e-commerce operations including product management,
 * banners, WhatsApp sales, and social media configuration
 */

import { apiClient } from '@/shared/api/client';

/**
 * E-commerce Advanced API methods (Admin/Manager only)
 */
export const ecommerceAdvancedApi = {
  // ===== Product Images =====

  /**
   * Get all images for a product
   * @param productId - Product ID
   * @returns List of product images
   */
  getProductImages: (productId: number) =>
    apiClient.get(`/ecommerce-advanced/products/${productId}/images`),

  /**
   * Add new image to product
   * @param productId - Product ID
   * @param formData - Form data with image file
   * @returns Created image record
   */
  addProductImage: (productId: number, formData: FormData) =>
    apiClient.post(`/ecommerce-advanced/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /**
   * Update product image metadata
   * @param imageId - Image ID
   * @param data - Updated image data (order, alt text)
   * @returns Updated image
   */
  updateProductImage: (imageId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/products/images/${imageId}`, data),

  /**
   * Delete product image
   * @param imageId - Image ID
   * @returns Success response
   */
  deleteProductImage: (imageId: number) =>
    apiClient.delete(`/ecommerce-advanced/products/images/${imageId}`),

  // ===== Store Banners =====

  /**
   * Get store banners
   * @param activeOnly - Return only active banners
   * @returns List of banners
   */
  getStoreBanners: (activeOnly = false) =>
    apiClient.get('/ecommerce-advanced/banners', { params: { active_only: activeOnly } }),

  /**
   * Create new banner
   * @param formData - Form data with banner image and metadata
   * @returns Created banner
   */
  createStoreBanner: (formData: FormData) =>
    apiClient.post('/ecommerce-advanced/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /**
   * Update banner metadata
   * @param bannerId - Banner ID
   * @param data - Updated banner data (title, link, order, active)
   * @returns Updated banner
   */
  updateStoreBanner: (bannerId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/banners/${bannerId}`, data),

  /**
   * Update banner with new image
   * @param bannerId - Banner ID
   * @param formData - Form data with new image
   * @returns Updated banner
   */
  updateStoreBannerWithImage: (bannerId: number, formData: FormData) =>
    apiClient.put(`/ecommerce-advanced/banners/${bannerId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  /**
   * Delete banner
   * @param bannerId - Banner ID
   * @returns Success response
   */
  deleteStoreBanner: (bannerId: number) =>
    apiClient.delete(`/ecommerce-advanced/banners/${bannerId}`),

  // ===== WhatsApp Sales =====

  /**
   * Get all WhatsApp sales
   * @returns List of WhatsApp sales
   */
  getWhatsAppSales: () =>
    apiClient.get('/ecommerce-advanced/whatsapp-sales'),

  /**
   * Create new WhatsApp sale
   * @param data - WhatsApp sale data
   * @returns Created sale
   */
  createWhatsAppSale: (data: any) =>
    apiClient.post('/ecommerce-advanced/whatsapp-sales', data),

  /**
   * Update WhatsApp sale
   * @param saleId - Sale ID
   * @param data - Updated sale data
   * @returns Updated sale
   */
  updateWhatsAppSale: (saleId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/whatsapp-sales/${saleId}`, data),

  /**
   * Fix WhatsApp sales shipping data
   * @returns Success response
   */
  fixWhatsAppSalesShipping: () =>
    apiClient.post('/ecommerce-advanced/fix-whatsapp-sales-shipping'),

  // ===== WhatsApp Configuration =====

  /**
   * Get WhatsApp configuration
   * @returns WhatsApp config
   */
  getWhatsAppConfig: () =>
    apiClient.get('/ecommerce-advanced/whatsapp-config'),

  /**
   * Create or update WhatsApp config
   * @param data - WhatsApp config data
   * @returns Created/updated config
   */
  createOrUpdateWhatsAppConfig: (data: any) =>
    apiClient.post('/ecommerce-advanced/whatsapp-config', data),

  /**
   * Update WhatsApp configuration
   * @param configId - Config ID
   * @param data - Updated config data
   * @returns Updated config
   */
  updateWhatsAppConfig: (configId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/whatsapp-config/${configId}`, data),

  /**
   * Delete WhatsApp configuration
   * @param configId - Config ID
   * @returns Success response
   */
  deleteWhatsAppConfig: (configId: number) =>
    apiClient.delete(`/ecommerce-advanced/whatsapp-config/${configId}`),

  // ===== Social Media Configuration =====

  /**
   * Get social media configurations
   * @param activeOnly - Return only active configs
   * @returns List of social media configs
   */
  getSocialMediaConfigs: (activeOnly = false) =>
    apiClient.get('/ecommerce-advanced/social-media', { params: { active_only: activeOnly } }),

  /**
   * Create social media config
   * @param data - Social media config data
   * @returns Created config
   */
  createSocialMediaConfig: (data: any) =>
    apiClient.post('/ecommerce-advanced/social-media', data),

  /**
   * Update social media config
   * @param configId - Config ID
   * @param data - Updated config data
   * @returns Updated config
   */
  updateSocialMediaConfig: (configId: number, data: any) =>
    apiClient.put(`/ecommerce-advanced/social-media/${configId}`, data),

  /**
   * Delete social media config
   * @param configId - Config ID
   * @returns Success response
   */
  deleteSocialMediaConfig: (configId: number) =>
    apiClient.delete(`/ecommerce-advanced/social-media/${configId}`),

  // ===== Dashboard & Reports =====

  /**
   * Get e-commerce dashboard statistics
   * @returns Dashboard stats (products, sales, orders, conversion rate)
   */
  getDashboardStats: () =>
    apiClient.get('/ecommerce-advanced/dashboard/stats'),

  /**
   * Get e-commerce store data
   * @returns Store statistics and data
   */
  getStoreData: () =>
    apiClient.get('/ecommerce-advanced/store-data'),

  /**
   * Get e-commerce sales report
   * @returns Sales report data
   */
  getSalesReport: () =>
    apiClient.get('/ecommerce-advanced/sales-report'),

  /**
   * Update sale status
   * @param saleId - Sale ID
   * @param status - New status
   * @returns Updated sale
   */
  updateSaleStatus: (saleId: number, status: string) =>
    apiClient.put(`/ecommerce-advanced/sales/${saleId}/status`, { new_status: status }),
};
