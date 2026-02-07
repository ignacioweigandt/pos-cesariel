/** API admin de e-commerce (productos, banners, WhatsApp, social media, reportes) */

import { apiClient } from '@/shared/api/client';

// React 19: Type-safe data structures for e-commerce API
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductImageUpdate {
  display_order?: number;
  is_primary?: boolean;
}

export interface StoreBanner {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface StoreBannerUpdate {
  title?: string;
  description?: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface WhatsAppSaleCreate {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  shipping_method: 'pickup' | 'delivery';
  shipping_cost?: number;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    size?: string;
  }>;
}

export interface WhatsAppSaleUpdate {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  shipping_method?: 'pickup' | 'delivery';
  shipping_cost?: number;
  notes?: string;
}

export interface WhatsAppConfig {
  id: number;
  phone_number: string;
  business_name: string;
  welcome_message: string;
  is_active: boolean;
  created_at: string;
}

export interface WhatsAppConfigCreate {
  phone_number: string;
  business_name: string;
  welcome_message: string;
  is_active?: boolean;
}

export interface SocialMediaConfig {
  id: number;
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube';
  profile_url: string;
  is_active: boolean;
  created_at: string;
}

export interface SocialMediaConfigCreate {
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube';
  profile_url: string;
  is_active?: boolean;
}

export const ecommerceAdvancedApi = {
  // Product Images
  getProductImages: (productId: number) =>
    apiClient.get<ProductImage[]>(`/ecommerce-advanced/products/${productId}/images`),

  addProductImage: (productId: number, formData: FormData) =>
    apiClient.post<ProductImage>(`/ecommerce-advanced/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateProductImage: (imageId: number, data: ProductImageUpdate) =>
    apiClient.put<ProductImage>(`/ecommerce-advanced/products/images/${imageId}`, data),

  deleteProductImage: (imageId: number) =>
    apiClient.delete(`/ecommerce-advanced/products/images/${imageId}`),

  // Store Banners
  getStoreBanners: (activeOnly = false) =>
    apiClient.get<StoreBanner[]>('/ecommerce-advanced/banners', { params: { active_only: activeOnly } }),

  createStoreBanner: (formData: FormData) =>
    apiClient.post<StoreBanner>('/ecommerce-advanced/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateStoreBanner: (bannerId: number, data: StoreBannerUpdate) =>
    apiClient.put<StoreBanner>(`/ecommerce-advanced/banners/${bannerId}`, data),

  updateStoreBannerWithImage: (bannerId: number, formData: FormData) =>
    apiClient.put<StoreBanner>(`/ecommerce-advanced/banners/${bannerId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  deleteStoreBanner: (bannerId: number) =>
    apiClient.delete(`/ecommerce-advanced/banners/${bannerId}`),

  // WhatsApp Sales
  getWhatsAppSales: () =>
    apiClient.get('/ecommerce-advanced/whatsapp-sales'),

  createWhatsAppSale: (data: WhatsAppSaleCreate) =>
    apiClient.post('/ecommerce-advanced/whatsapp-sales', data),

  updateWhatsAppSale: (saleId: number, data: WhatsAppSaleUpdate) =>
    apiClient.put(`/ecommerce-advanced/whatsapp-sales/${saleId}`, data),

  fixWhatsAppSalesShipping: () =>
    apiClient.post('/ecommerce-advanced/fix-whatsapp-sales-shipping'),

  // WhatsApp Configuration
  getWhatsAppConfig: () =>
    apiClient.get<WhatsAppConfig[]>('/ecommerce-advanced/whatsapp-config'),

  createOrUpdateWhatsAppConfig: (data: WhatsAppConfigCreate) =>
    apiClient.post<WhatsAppConfig>('/ecommerce-advanced/whatsapp-config', data),

  updateWhatsAppConfig: (configId: number, data: Partial<WhatsAppConfigCreate>) =>
    apiClient.put<WhatsAppConfig>(`/ecommerce-advanced/whatsapp-config/${configId}`, data),

  deleteWhatsAppConfig: (configId: number) =>
    apiClient.delete(`/ecommerce-advanced/whatsapp-config/${configId}`),

  // Social Media
  getSocialMediaConfigs: (activeOnly = false) =>
    apiClient.get<SocialMediaConfig[]>('/ecommerce-advanced/social-media', { params: { active_only: activeOnly } }),

  createSocialMediaConfig: (data: SocialMediaConfigCreate) =>
    apiClient.post<SocialMediaConfig>('/ecommerce-advanced/social-media', data),

  updateSocialMediaConfig: (configId: number, data: Partial<SocialMediaConfigCreate>) =>
    apiClient.put<SocialMediaConfig>(`/ecommerce-advanced/social-media/${configId}`, data),

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
