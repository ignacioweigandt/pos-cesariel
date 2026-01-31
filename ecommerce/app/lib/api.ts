/** Cliente API para tienda e-commerce pública (sin autenticación, endpoints /ecommerce/*) */

import axios from 'axios';

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname !== 'localhost' &&
                        window.location.hostname !== '127.0.0.1';
    if (isProduction) {
      return 'https://backend-production-c20a.up.railway.app';
    }
  }

  return 'http://localhost:8000';
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const productsApi = {
  getAll: (params?: {
    offset?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    in_stock?: boolean;
  }) => api.get('/ecommerce/products', { params }),

  getById: (id: number) => api.get(`/ecommerce/products/${id}`),

  search: (query: string) => api.get(`/products/search`, { params: { q: query } }),

  getAvailableSizes: (productId: number) => api.get(`/ecommerce/products/${productId}/sizes`),

  getImages: (productId: number) => api.get(`/ecommerce/products/${productId}/images`),

  getSizeStock: (productId: number, branchId: number = 1) => 
    api.get(`/products/${productId}/sizes-by-branch`, { params: { branch_id: branchId } }),
};

export const categoriesApi = {
  getAll: () => api.get('/ecommerce/categories'),

  getById: (id: number) => api.get(`/categories/${id}`),
};

export const brandsApi = {
  getAll: () => api.get('/ecommerce/brands'),
};

export const bannersApi = {
  getActive: () => api.get('/ecommerce/banners'),
};

export const socialMediaApi = {
  getActive: () => api.get('/ecommerce/social-media'),
};

export const storeConfigApi = {
  get: () => api.get('/ecommerce/store-config'),
};

export const salesApi = {
  create: (saleData: {
    sale_type: 'ECOMMERCE';
    customer_name: string;
    customer_email?: string;
    customer_phone: string;
    items: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
      size?: string;
    }>;
    payment_method: string;
    notes?: string;
    delivery_address?: string;
  }) => api.post('/ecommerce/sales', saleData),

  getById: (id: number) => api.get(`/sales/${id}`),
};

export const ecommerceApi = {
  getConfig: () => api.get('/ecommerce/store-config'),

  getBanners: () => api.get('/ecommerce/banners'),

  getSystemInfo: () => api.get('/config/system'),
};

export const whatsappConfigApi = {
  getConfig: () => api.get('/ecommerce/whatsapp-config'),
};

export const websocketApi = {
  getStatus: () => api.get('/ws/status'),
};

export const utilsApi = {
  health: () => api.get('/health'),

  dbTest: () => api.get('/db-test'),
};

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface WhatsAppConfig {
  id: number;
  business_phone: string;
  business_name: string;
  welcome_message: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

export const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    
    let message = 'Error del servidor';
    let errors: string[] = [];
    
    if (typeof data === 'string') {
      message = data;
    } else if (data?.detail) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = 'Error de validación';
        errors = data.detail.map((err: any) => {
          if (typeof err === 'string') return err;
          if (err.msg && err.loc) {
            const location = Array.isArray(err.loc) ? err.loc.join('.') : err.loc;
            return `${location}: ${err.msg}`;
          }
          return err.msg || 'Error de validación';
        });
      }
    } else if (data?.message) {
      message = data.message;
    } else if (data?.errors) {
      errors = Array.isArray(data.errors) ? data.errors : [];
    }
    
    return {
      status,
      message,
      errors
    };
  } else if (error.request) {
    return {
      status: 0,
      message: 'Error de conexión. Verifica que el servidor esté funcionando.',
      errors: []
    };
  } else {
    return {
      status: -1,
      message: error.message || 'Error desconocido',
      errors: []
    };
  }
};

export default api;