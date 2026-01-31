/** Capa de servicio con cache (5 min) y fallback a datos estáticos para e-commerce */

import { productsApi, categoriesApi, bannersApi } from './api';
import { 
  mapApiProductToFrontend, 
  mapApiBannerToFrontend, 
  mapApiCategoryToFrontend,
  type Product,
  type Category,
  type Banner,
  type Brand,
  type ApiProduct,
  type ApiBanner,
  type ApiCategory
} from './api-types';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

function getCache<T>(key: string): T | null {
  const item: CacheItem<T> = cache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

export async function getProducts(filters?: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}): Promise<Product[]> {
  try {
    const cacheKey = `products_${JSON.stringify(filters || {})}`;
    const cached = getCache<Product[]>(cacheKey);
    if (cached) return cached;

    const params: any = {
      show_in_ecommerce: true,
      limit: 100
    };

    if (filters?.search) {
      params.search = filters.search;
    }

    if (filters?.category && filters.category !== 'all') {
      const categories = await getCategories();
      const category = categories.find(c => c.slug === filters.category);
      if (category) {
        params.category_id = parseInt(category.id);
      }
    }

    const response = await productsApi.getAll(params);
    const apiProducts: ApiProduct[] = response.data.data;

    let products = apiProducts.map(mapApiProductToFrontend);

    if (filters) {
      products = products.filter(product => {
        if (filters.brand && filters.brand !== 'all' && 
            product.brand.toLowerCase() !== filters.brand.toLowerCase()) {
          return false;
        }

        if (filters.minPrice && product.price < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice && product.price > filters.maxPrice) {
          return false;
        }

        if (filters.inStock && !product.inStock) {
          return false;
        }

        return true;
      });
    }

    setCache(cacheKey, products);
    return products;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return getFallbackProducts();
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const cacheKey = `product_${id}`;
    const cached = getCache<Product>(cacheKey);
    if (cached) return cached;

    const response = await productsApi.getById(parseInt(id));
    const apiProduct: ApiProduct = response.data;
    
    const product = mapApiProductToFrontend(apiProduct);
    setCache(cacheKey, product);
    return product;
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error);
    return null;
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    if (!query.trim()) return [];

    const response = await productsApi.search(query);
    const apiProducts: ApiProduct[] = response.data;
    
    return apiProducts
      .filter(p => p.show_in_ecommerce)
      .map(mapApiProductToFrontend);
  } catch (error) {
    console.error('Error en búsqueda de productos:', error);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const cacheKey = 'categories';
    const cached = getCache<Category[]>(cacheKey);
    if (cached) return cached;

    const response = await categoriesApi.getAll();
    const apiCategories: ApiCategory[] = response.data.data;
    
    const categories = apiCategories
      .filter(c => c.is_active)
      .map(mapApiCategoryToFrontend);

    setCache(cacheKey, categories);
    return categories;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return getFallbackCategories();
  }
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const cacheKey = 'banners';
    const cached = getCache<Banner[]>(cacheKey);
    if (cached) return cached;

    const response = await bannersApi.getActive();
    const apiBanners: ApiBanner[] = response.data.data;
    
    const banners = apiBanners
      .filter(b => b.active)
      .map(mapApiBannerToFrontend)
      .slice(0, 3);

    setCache(cacheKey, banners);
    return banners;
  } catch (error) {
    console.error('Error al obtener banners:', error);
    return getFallbackBanners();
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const cacheKey = 'brands';
    const cached = getCache<Brand[]>(cacheKey);
    if (cached) return cached;

    const brands = getFallbackBrands();
    setCache(cacheKey, brands);
    return brands;
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return getFallbackBrands();
  }
}

export async function getProductSizes(productId: string): Promise<{ size: string; stock: number }[]> {
  try {
    const response = await productsApi.getAvailableSizes(parseInt(productId));
    const data = response.data;
    
    if (data && data.available_sizes && Array.isArray(data.available_sizes)) {
      return data.available_sizes;
    }
    
    return [];
  } catch (error) {
    console.error(`Error al obtener talles del producto ${productId}:`, error);
    return [];
  }
}

export async function validateStock(productId: string, size: string, quantity: number): Promise<boolean> {
  try {
    const sizes = await getProductSizes(productId);
    const sizeInfo = sizes.find(s => s.size === size);
    return sizeInfo ? sizeInfo.stock >= quantity : false;
  } catch (error) {
    console.error('Error al validar stock:', error);
    return false;
  }
}

function getFallbackProducts(): Product[] {
  return [
    {
      id: "1",
      name: "Remera Básica Algodón",
      description: "Remera de algodón 100% con corte clásico. Perfecta para el uso diario.",
      price: 2500,
      originalPrice: 3000,
      images: ["/placeholder.svg?height=500&width=500"],
      category: "ropa",
      brand: "Nike",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Blanco", "Gris", "Azul"],
      featured: true,
      inStock: true,
      rating: 4.5,
      reviews: 128,
    },
    {
      id: "2",
      name: "Zapatillas Running Pro",
      description: "Zapatillas de running con tecnología de amortiguación avanzada.",
      price: 15000,
      originalPrice: 18000,
      images: ["/placeholder.svg?height=500&width=500"],
      category: "calzado",
      brand: "Adidas",
      sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
      colors: ["Negro", "Blanco", "Azul"],
      featured: true,
      inStock: true,
      rating: 4.8,
      reviews: 89,
    }
  ];
}

function getFallbackCategories(): Category[] {
  return [
    {
      id: "1",
      name: "Ropa",
      slug: "ropa",
      subcategories: [],
    },
    {
      id: "2",
      name: "Calzado",
      slug: "calzado",
      subcategories: [],
    },
    {
      id: "3",
      name: "Accesorios",
      slug: "accesorios",
      subcategories: [],
    },
  ];
}

function getFallbackBanners(): Banner[] {
  return [
    {
      id: "1",
      title: "Nueva Colección Primavera",
      subtitle: "Hasta 50% de descuento en toda la colección",
      image: "/placeholder.svg?height=400&width=800",
      link: "/productos?categoria=ropa",
      active: true,
    },
    {
      id: "2",
      title: "Calzado Deportivo",
      subtitle: "Las mejores marcas al mejor precio",
      image: "/placeholder.svg?height=400&width=800",
      link: "/productos?categoria=calzado",
      active: true,
    },
  ];
}

function getFallbackBrands(): Brand[] {
  return [
    { id: "1", name: "Nike", slug: "nike" },
    { id: "2", name: "Adidas", slug: "adidas" },
    { id: "3", name: "Puma", slug: "puma" },
    { id: "4", name: "Converse", slug: "converse" },
    { id: "5", name: "Vans", slug: "vans" },
  ];
}

export function clearCache(): void {
  cache.clear();
}

export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/health');
    return response.ok;
  } catch {
    return false;
  }
}