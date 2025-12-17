// Tipos que coinciden con el backend POS Cesariel

// ===== PRODUCTOS =====
export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  category_id: number;
  brand: string | null;
  price: number;
  cost: number | null;
  stock_quantity: number;
  stock?: number; // Campo adicional del endpoint de e-commerce
  min_stock: number;
  is_active: boolean;
  show_in_ecommerce: boolean;
  ecommerce_price: number | null;
  image_url: string | null;
  has_sizes: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  category?: ApiCategory;
  sizes?: ApiProductSize[];
  images?: ApiProductImage[];
}

export interface ApiProductSize {
  id: number;
  product_id: number;
  branch_id: number;
  size: string;
  stock_quantity: number;
}

export interface ApiProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  order: number;
}

// ===== CATEGORÍAS =====
export interface ApiCategory {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== BANNERS =====
export interface ApiBanner {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  order: number;
}

// ===== VENTAS =====
export interface ApiSale {
  id: number;
  sale_number: string;
  sale_type: 'pos' | 'ecommerce';
  branch_id: number;
  user_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  sale_items?: ApiSaleItem[];
}

export interface ApiSaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  size: string | null;
  // Relaciones
  product?: ApiProduct;
}

// ===== CONFIGURACIÓN E-COMMERCE =====
export interface ApiEcommerceConfig {
  id: number;
  store_name: string;
  store_description: string | null;
  store_email: string | null;
  store_phone: string | null;
  store_address: string | null;
  currency: string;
  tax_rate: number;
  shipping_cost: number;
  free_shipping_minimum: number;
  is_active: boolean;
}

// ===== SUCURSALES =====
export interface ApiBranch {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== USUARIOS =====
export interface ApiUser {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'manager' | 'seller' | 'ecommerce';
  branch_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  branch?: ApiBranch;
}

// ===== REQUESTS =====
export interface CreateSaleRequest {
  sale_type: 'ecommerce';
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  notes?: string;
  payment_method: string;
  items: CreateSaleItemRequest[];
}

export interface CreateSaleItemRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
  size?: string;
}

// ===== RESPONSES =====
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  detail?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

// ===== MAPEO DE TIPOS =====
// Funciones para convertir tipos de API a tipos del frontend

export const mapApiProductToFrontend = (apiProduct: ApiProduct): Product => {
  // Determinar categoría basada en category_id
  let category = 'otros';
  const brand = apiProduct.brand || 'Sin marca';
  
  if (apiProduct.category?.name) {
    const categoryName = apiProduct.category.name.toLowerCase();
    if (categoryName.includes('ropa') || categoryName.includes('indumentaria')) {
      category = 'ropa';
    } else if (categoryName.includes('calzado') || categoryName.includes('zapato')) {
      category = 'calzado';
    } else if (categoryName.includes('accesorio')) {
      category = 'accesorios';
    }
  }

  // Generar talles basados en categoría y si tiene talles
  let sizes: string[] = ['Único'];
  if (apiProduct.has_sizes) {
    if (category === 'calzado') {
      sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    } else if (category === 'ropa') {
      sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
  }

  // Generar imágenes
  const images = apiProduct.images && apiProduct.images.length > 0
    ? apiProduct.images.map(img => img.image_url)
    : [apiProduct.image_url || '/placeholder.svg?height=500&width=500'];

  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    description: apiProduct.description || 'Sin descripción disponible',
    price: apiProduct.ecommerce_price || apiProduct.price,
    originalPrice: apiProduct.ecommerce_price && apiProduct.ecommerce_price < apiProduct.price 
      ? apiProduct.price 
      : undefined,
    images: images.slice(0, 3), // Máximo 3 imágenes
    category,
    brand,
    sizes,
    colors: ['Negro', 'Blanco'], // Por defecto, se puede expandir más tarde
    featured: false, // Se puede determinar basado en algún criterio
    inStock: (apiProduct.stock_quantity || apiProduct.stock || 0) > 0,
    rating: 4.5, // Valor por defecto, se puede implementar sistema de reviews
    reviews: Math.floor(Math.random() * 100) + 10 // Temporal
  };
};

export const mapApiBannerToFrontend = (apiBanner: ApiBanner): Banner => ({
  id: apiBanner.id.toString(),
  title: apiBanner.title,
  subtitle: apiBanner.subtitle || '',
  image: apiBanner.image_url,
  link: apiBanner.link_url || '#',
  active: apiBanner.is_active,
});

export const mapApiCategoryToFrontend = (apiCategory: ApiCategory): Category => ({
  id: apiCategory.id.toString(),
  name: apiCategory.name,
  slug: apiCategory.name.toLowerCase().replace(/\s+/g, '-'),
  subcategories: [], // Se puede expandir más tarde
});

// Importar tipos del frontend existente
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  inStock: boolean;
  rating: number;
  reviews: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  active: boolean;
}