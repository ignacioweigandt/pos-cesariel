/**
 * Servicio centralizado de API para el e-commerce POS Cesariel.
 * 
 * Este módulo maneja todas las comunicaciones con el backend API,
 * incluyendo manejo de errores, timeouts y fallbacks.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ecommerceApi } from '../app/lib/api';

/**
 * Configuración del cliente API para e-commerce
 */
class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 10000, // 10 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para requests
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para responses
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} - ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error);
        
        if (error.code === 'ECONNABORTED') {
          console.warn('⚠️ Request timeout - using fallback data');
        } else if (!error.response) {
          console.warn('⚠️ Network error - backend may be offline');
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Realiza una petición GET con manejo de errores
   */
  async get<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get(url);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'GET', url);
      throw error;
    }
  }

  /**
   * Realiza una petición POST con manejo de errores
   */
  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'POST', url);
      throw error;
    }
  }

  /**
   * Realiza una petición PUT con manejo de errores
   */
  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'PUT', url);
      throw error;
    }
  }

  /**
   * Realiza una petición DELETE con manejo de errores
   */
  async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'DELETE', url);
      throw error;
    }
  }

  /**
   * Verifica la conectividad con el backend
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Maneja errores de API de forma centralizada
   */
  private handleApiError(error: any, method: string, url: string) {
    const errorInfo = {
      method,
      url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    };

    // Log detallado del error
    console.group(`❌ API Error - ${method} ${url}`);
    console.error('Status:', errorInfo.status);
    console.error('Message:', errorInfo.message);
    console.error('Full Error:', error);
    console.groupEnd();

    // Almacenar error para debugging (opcional)
    if (typeof window !== 'undefined') {
      const errors = JSON.parse(localStorage.getItem('api-errors') || '[]');
      errors.push(errorInfo);
      
      // Mantener solo los últimos 50 errores
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('api-errors', JSON.stringify(errors));
    }
  }

  /**
   * Obtiene estadísticas de errores almacenados
   */
  getErrorStats(): any[] {
    if (typeof window === 'undefined') return [];
    
    try {
      return JSON.parse(localStorage.getItem('api-errors') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Limpia los errores almacenados
   */
  clearErrorStats() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('api-errors');
    }
  }
}

/**
 * Instancia singleton del servicio API
 */
export const apiService = new ApiService();

/**
 * Funciones de utilidad específicas para el e-commerce
 */
export const ecommerceApiService = {
  /**
   * Obtiene productos visibles en e-commerce con manejo de caché
   */
  async getEcommerceProducts() {
    return await ecommerceApi.getProducts();
  },

  /**
   * Obtiene detalles de un producto específico
   */
  async getProductById(id: number) {
    return await ecommerceApi.getProductById(id);
  },

  /**
   * Obtiene categorías activas
   */
  async getCategories() {
    return await ecommerceApi.getCategories();
  },

  /**
   * Obtiene banners para la página principal
   */
  async getBanners() {
    return await ecommerceApi.getBanners();
  },

  /**
   * Obtiene talles disponibles para un producto
   */
  async getAvailableSizes(productId: number) {
    return await ecommerceApi.getAvailableSizes(productId);
  },

  /**
   * Crea una venta desde el e-commerce
   */
  async createSale(saleData: any) {
    return await ecommerceApi.createSale(saleData);
  },

  /**
   * Valida stock disponible para un producto
   */
  async validateStock(productId: number, quantity: number) {
    try {
      const product = await this.getProductById(productId);
      return product.stock >= quantity;
    } catch (error) {
      console.error('Error validating stock:', error);
      return false;
    }
  },

  /**
   * Obtiene configuración del e-commerce
   */
  async getEcommerceConfig() {
    return await ecommerceApi.getEcommerceConfig();
  }
};