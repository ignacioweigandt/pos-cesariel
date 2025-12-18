import axios from 'axios';

// Base URL del backend POS - Hardcoded for Railway production
const API_BASE_URL = 'https://backend-production-c20a.up.railway.app';

// Cliente API principal
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for Railway cold starts
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== PRODUCTOS PÚBLICOS =====
export const productsApi = {
  // Obtener todos los productos para e-commerce (endpoint público)
  getAll: (params?: {
    offset?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    in_stock?: boolean;
  }) => api.get('/ecommerce/products', { params }),

  // Obtener producto por ID (endpoint público)
  getById: (id: number) => api.get(`/ecommerce/products/${id}`),

  // Buscar productos
  search: (query: string) => api.get(`/products/search`, { params: { q: query } }),

  // Obtener talles disponibles de un producto para e-commerce (endpoint público)
  getAvailableSizes: (productId: number) => api.get(`/ecommerce/products/${productId}/sizes`),

  // Obtener imágenes de un producto para e-commerce (endpoint público)
  getImages: (productId: number) => api.get(`/ecommerce/products/${productId}/images`),

  // Obtener stock por talle
  getSizeStock: (productId: number, branchId: number = 1) => 
    api.get(`/products/${productId}/sizes-by-branch`, { params: { branch_id: branchId } }),
};

// ===== CATEGORÍAS =====
export const categoriesApi = {
  // Obtener todas las categorías (endpoint público)
  getAll: () => api.get('/ecommerce/categories'),

  // Obtener categoría por ID
  getById: (id: number) => api.get(`/categories/${id}`),
};

// ===== MARCAS =====
export const brandsApi = {
  // Obtener todas las marcas (endpoint público)
  getAll: () => api.get('/ecommerce/brands'),
};

// ===== BANNERS =====
export const bannersApi = {
  // Obtener banners activos (endpoint público)
  getActive: () => api.get('/ecommerce/banners'),
};

// ===== REDES SOCIALES =====
export const socialMediaApi = {
  // Obtener redes sociales activas (endpoint público)
  getActive: () => api.get('/ecommerce/social-media'),
};

// ===== CONFIGURACIÓN DE TIENDA =====
export const storeConfigApi = {
  // Obtener configuración de la tienda (endpoint público)
  get: () => api.get('/ecommerce/store-config'),
};

// ===== VENTAS E-COMMERCE =====
export const salesApi = {
  // Crear venta desde e-commerce
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

  // Obtener venta por ID
  getById: (id: number) => api.get(`/sales/${id}`),
};

// ===== CONFIGURACIÓN E-COMMERCE =====
export const ecommerceApi = {
  // Obtener configuración de la tienda (endpoint público)
  getConfig: () => api.get('/ecommerce/store-config'),

  // Obtener banners activos (endpoint público)
  getBanners: () => api.get('/ecommerce/banners'),

  // Obtener información del sistema
  getSystemInfo: () => api.get('/config/system'),
};

// ===== CONFIGURACIÓN WHATSAPP =====
export const whatsappConfigApi = {
  // Obtener configuración de WhatsApp activa (endpoint público)
  getConfig: () => api.get('/ecommerce/whatsapp-config'),
};

// ===== WEBSOCKETS =====
export const websocketApi = {
  // Obtener estado de WebSocket
  getStatus: () => api.get('/ws/status'),
};

// ===== UTILIDADES =====
export const utilsApi = {
  // Health check
  health: () => api.get('/health'),

  // Test de base de datos
  dbTest: () => api.get('/db-test'),
};

// Tipos de respuesta de la API
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

// Manejo de errores API
export const handleApiError = (error: any) => {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    
    // Handle different error formats
    let message = 'Error del servidor';
    let errors: string[] = [];
    
    if (typeof data === 'string') {
      message = data;
    } else if (data?.detail) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Pydantic validation errors format
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
    // Error de red
    return {
      status: 0,
      message: 'Error de conexión. Verifica que el servidor esté funcionando.',
      errors: []
    };
  } else {
    // Error de configuración
    return {
      status: -1,
      message: error.message || 'Error desconocido',
      errors: []
    };
  }
};

export default api;