// Frontend Domain Models

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
  has_sizes?: boolean;
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

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryMethod: 'pickup' | 'delivery';
}

export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface StoreConfig {
  store_name: string;
  store_description: string;
  store_logo: string | null;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  tax_percentage: number;
}

export interface SocialMedia {
  id: number;
  platform: string;
  username: string;
  url: string;
  display_order: number;
}
