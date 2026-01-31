/** Cliente API centralizado con manejo de errores, timeouts y logging */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ecommerceApi } from '../app/lib/api';

class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: 'https://backend-production-c20a.up.railway.app',
      timeout: 30000, // 30 segundos para Railway cold starts
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

  async get<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get(url);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'GET', url);
      throw error;
    }
  }

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'POST', url);
      throw error;
    }
  }

  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'PUT', url);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'DELETE', url);
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  /** Manejo centralizado de errores - loggea y almacena últimos 50 errores en localStorage */
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

  getErrorStats(): any[] {
    if (typeof window === 'undefined') return [];
    
    try {
      return JSON.parse(localStorage.getItem('api-errors') || '[]');
    } catch {
      return [];
    }
  }

  clearErrorStats() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('api-errors');
    }
  }
}

export const apiService = new ApiService();

/** Funciones de utilidad específicas para e-commerce con delegación a ecommerceApi */
export const ecommerceApiService = {
  async getEcommerceProducts() {
    return await ecommerceApi.getProducts();
  },

  async getProductById(id: number) {
    return await ecommerceApi.getProductById(id);
  },

  async getCategories() {
    return await ecommerceApi.getCategories();
  },

  async getBanners() {
    return await ecommerceApi.getBanners();
  },

  async getAvailableSizes(productId: number) {
    return await ecommerceApi.getAvailableSizes(productId);
  },

  async createSale(saleData: any) {
    return await ecommerceApi.createSale(saleData);
  },

  async validateStock(productId: number, quantity: number) {
    try {
      const product = await this.getProductById(productId);
      return product.stock >= quantity;
    } catch (error) {
      console.error('Error validating stock:', error);
      return false;
    }
  },

  async getEcommerceConfig() {
    return await ecommerceApi.getEcommerceConfig();
  }
};