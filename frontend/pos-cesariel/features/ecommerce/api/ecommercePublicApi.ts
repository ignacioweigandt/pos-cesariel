/** API pública de e-commerce (sin autenticación, para tienda online del cliente) */

import { publicApiClient } from '@/shared/api/client';

export interface PublicProductParams {
  category_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
}

export const ecommercePublicApi = {
  getProducts: (params?: PublicProductParams) =>
    publicApiClient.get('/ecommerce/products', { params }),

  getProduct: (id: number) =>
    publicApiClient.get(`/ecommerce/products/${id}`),

  getProductSizes: (id: number) =>
    publicApiClient.get(`/ecommerce/products/${id}/sizes`),

  getCategories: () =>
    publicApiClient.get('/ecommerce/categories'),

  getBanners: () =>
    publicApiClient.get('/ecommerce/banners'),

  getSocialMedia: () =>
    publicApiClient.get('/ecommerce/social-media'),

  getStoreConfig: () =>
    publicApiClient.get('/ecommerce/store-config'),

  createSale: (data: any) =>
    publicApiClient.post('/ecommerce/sales', data),
};
