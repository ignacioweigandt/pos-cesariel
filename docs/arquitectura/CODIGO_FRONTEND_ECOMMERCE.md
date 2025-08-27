# Documentación Técnica del Frontend E-commerce - POS Cesariel

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Integración con Backend POS](#integración-con-backend-pos)
5. [Gestión de Estado](#gestión-de-estado)
6. [Servicios y API](#servicios-y-api)
7. [Componentes Principales](#componentes-principales)
8. [Experiencia de Usuario](#experiencia-de-usuario)
9. [Performance y Optimización](#performance-y-optimización)
10. [Integración WhatsApp](#integración-whatsapp)

## Visión General

El frontend de e-commerce de POS Cesariel es una aplicación web desarrollada en **Next.js 15** con **React 19**, diseñada para proporcionar una experiencia de compra online integrada directamente con el sistema POS. Los clientes pueden navegar productos, realizar compras, y las ventas se registran automáticamente en el sistema central.

### Características Principales

- **Framework**: Next.js 15 con App Router
- **UI Framework**: React 19 con TypeScript
- **Estilos**: Tailwind CSS con shadcn/ui y Radix UI
- **Estado**: React Context API para gestión local
- **API Integration**: Servicio de datos con caché inteligente
- **Performance**: SSR/SSG optimizado para SEO
- **Responsive**: Diseño mobile-first adaptativo
- **Integration**: Conexión directa con backend POS

## Arquitectura del Sistema

### Patrón Arquitectónico

El e-commerce sigue una **arquitectura de servicios** con integración POS:

```
┌─────────────────────────────────────┐
│         Capa de Presentación        │
│      (Pages + Components)           │
├─────────────────────────────────────┤
│          Capa de Estado             │
│       (React Context)               │
├─────────────────────────────────────┤
│       Capa de Servicios             │
│    (Data Service + API Client)      │
├─────────────────────────────────────┤
│       Backend POS Integration       │
│      (FastAPI + PostgreSQL)         │
└─────────────────────────────────────┘
```

### Principios de Diseño

1. **Integración POS**: Productos y ventas sincronizadas en tiempo real
2. **Performance First**: Optimización para carga rápida
3. **Mobile Experience**: Diseñado principalmente para móviles
4. **Fallback Strategy**: Datos estáticos cuando backend no disponible
5. **SEO Optimized**: Estructura para indexación por buscadores
6. **Conversion Focused**: UX optimizada para conversión

## Estructura de Archivos

```
ecommerce/
├── app/                              # App Router Next.js 15
│   ├── layout.tsx                    # Layout principal
│   ├── page.tsx                      # Página de inicio
│   ├── loading.tsx                   # Componente de carga global
│   ├── globals.css                   # Estilos globales
│   ├── productos/
│   │   ├── page.tsx                  # Catálogo de productos
│   │   ├── loading.tsx               # Loading del catálogo
│   │   └── [id]/
│   │       └── page.tsx              # Detalle de producto
│   ├── carrito/
│   │   └── page.tsx                  # Página del carrito
│   ├── contacto/
│   │   └── page.tsx                  # Página de contacto
│   ├── sobre-nosotros/
│   │   └── page.tsx                  # Página about
│   ├── components/                   # Componentes específicos
│   │   ├── Banner.tsx                # Carrusel de banners
│   │   ├── ConnectionStatus.tsx      # Indicador conectividad
│   │   ├── Footer.tsx                # Footer del sitio
│   │   ├── Header.tsx                # Header con navegación
│   │   ├── HomeContent.tsx           # Contenido homepage
│   │   ├── ProductCard.tsx           # Tarjeta de producto
│   │   └── modals/                   # Modales del sistema
│   │       ├── AddToCartModal.tsx    # Agregar al carrito
│   │       ├── CheckoutErrorModal.tsx # Error en checkout
│   │       ├── ColorSelectionModal.tsx # Selección de colores
│   │       ├── SizeSelectionModal.tsx # Selección de talles
│   │       └── ...                   # Otros modales
│   ├── context/                      # Context providers
│   │   ├── CartContext.tsx           # Estado del carrito
│   │   └── EcommerceContext.tsx      # Estado general
│   ├── hooks/                        # Custom hooks
│   │   └── useProducts.ts            # Hook de productos
│   └── lib/                         # Utilidades y servicios
│       ├── api.ts                    # Cliente API
│       ├── api-types.ts              # Tipos de API
│       ├── data-service.ts           # Servicio de datos con caché
│       ├── data.ts                   # Datos estáticos fallback
│       └── types.ts                  # Tipos del e-commerce
├── services/                         # Servicios organizados
│   ├── api-service.ts                # Servicio API centralizado
│   ├── cart-service.ts               # Lógica del carrito
│   └── product-service.ts            # Lógica de productos
├── utils/                           # Utilidades e-commerce
│   └── index.ts                     # Helpers específicos
├── components/                       # Componentes UI shadcn/ui
│   ├── ui/                          # Componentes base
│   └── theme-provider.tsx           # Proveedor de tema
├── __tests__/                       # Suite de pruebas
│   ├── components/                  # Tests componentes
│   ├── context/                     # Tests context
│   └── lib/                        # Tests utilidades
├── cypress/                         # Pruebas E2E
│   └── e2e/                        # Tests end-to-end
├── public/                          # Recursos estáticos
│   └── placeholder-*                # Imágenes placeholder
├── package.json                     # Dependencias
├── next.config.mjs                  # Configuración Next.js
├── tailwind.config.ts              # Configuración Tailwind
└── tsconfig.json                   # Configuración TypeScript
```

## Integración con Backend POS

### Arquitectura de Integración

El e-commerce está completamente integrado con el sistema POS:

```
E-commerce Frontend → POS Backend API → PostgreSQL Database
                                    ↓
                              POS Admin Frontend
```

### Endpoints Utilizados

```typescript
// Endpoints del backend POS utilizados por e-commerce
const API_ENDPOINTS = {
  // Productos visibles en e-commerce
  products: '/products?show_in_ecommerce=true',
  productDetail: '/products/{id}',
  productSizes: '/products/{id}/available-sizes',
  
  // Categorías activas
  categories: '/categories?is_active=true',
  
  // Configuración del e-commerce
  config: '/ecommerce-advanced/config',
  
  // Banners para homepage
  banners: '/ecommerce-advanced/banners',
  
  // Crear venta desde e-commerce
  createSale: '/sales',
  
  // Health check
  health: '/health'
};
```

### Flujo de Datos

1. **Productos**: Se obtienen del inventario POS con flag `show_in_ecommerce=true`
2. **Stock**: Validación en tiempo real contra inventario POS
3. **Ventas**: Se crean directamente en sistema POS con `sale_type: 'ECOMMERCE'`
4. **Configuración**: Colores, logo, información de tienda desde configuración POS

## Gestión de Estado

### Cart Context - Carrito de Compras

```typescript
interface CartContextType {
  // Estado del carrito
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  
  // Datos del cliente
  customerInfo: CustomerInfo | null;
  
  // Acciones
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  
  // Estado del checkout
  isProcessing: boolean;
  processCheckout: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Agregar producto al carrito con validación de stock
  const addToCart = async (product: Product, size?: string, color?: string) => {
    try {
      // Validar stock disponible
      const hasStock = await validateStock(product.id, 1);
      if (!hasStock) {
        toast.error('Producto sin stock disponible');
        return;
      }
      
      const existingItem = items.find(item => 
        item.product.id === product.id && 
        item.size === size && 
        item.color === color
      );
      
      if (existingItem) {
        // Verificar stock para cantidad incrementada
        const newQuantity = existingItem.quantity + 1;
        const hasEnoughStock = await validateStock(product.id, newQuantity);
        
        if (!hasEnoughStock) {
          toast.error('No hay suficiente stock disponible');
          return;
        }
        
        setItems(prev => prev.map(item =>
          item === existingItem
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        // Agregar nuevo item
        const newItem: CartItem = {
          id: generateId(),
          product,
          quantity: 1,
          size,
          color,
          unitPrice: product.price,
          totalPrice: product.price
        };
        
        setItems(prev => [...prev, newItem]);
      }
      
      toast.success('Producto agregado al carrito');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al agregar producto al carrito');
    }
  };
  
  // Procesar checkout creando venta en POS
  const processCheckout = async () => {
    if (!customerInfo || items.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Preparar datos de venta para POS
      const saleData = {
        sale_type: 'ECOMMERCE',
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          size: item.size,
          color: item.color
        })),
        subtotal: totalPrice,
        tax_amount: totalPrice * 0.21, // IVA 21%
        total: totalPrice * 1.21,
        payment_method: 'PENDING', // Pendiente hasta confirmación
        notes: `Pedido e-commerce - ${new Date().toISOString()}`
      };
      
      // Crear venta en sistema POS
      const sale = await ecommerceApi.createSale(saleData);
      
      // Limpiar carrito
      setItems([]);
      setCustomerInfo(null);
      
      // Mostrar confirmación
      toast.success(`¡Pedido #${sale.sale_number} creado exitosamente!`);
      
      // Redirigir a WhatsApp para coordinación
      const whatsappMessage = generateWhatsAppMessage(sale, customerInfo);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Valores calculados
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      customerInfo,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setCustomerInfo,
      isProcessing,
      processCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
}
```

### E-commerce Context - Estado Global

```typescript
interface EcommerceContextType {
  // Configuración de la tienda
  storeConfig: StoreConfig | null;
  
  // Estado de conectividad
  isOnline: boolean;
  
  // Productos y categorías
  products: Product[];
  categories: Category[];
  banners: Banner[];
  
  // Estados de carga
  loading: {
    products: boolean;
    config: boolean;
    banners: boolean;
  };
  
  // Funciones
  refreshData: () => Promise<void>;
  searchProducts: (query: string) => Product[];
  filterByCategory: (categoryId: number) => Product[];
}

export function EcommerceProvider({ children }: { children: ReactNode }) {
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
    
    // Verificar conectividad periódicamente
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadInitialData = async () => {
    try {
      // Cargar datos en paralelo
      const [
        productsData,
        configData,
        bannersData,
        categoriesData
      ] = await Promise.allSettled([
        dataService.getProducts(),
        dataService.getEcommerceConfig(),
        dataService.getBanners(),
        dataService.getCategories()
      ]);
      
      // Procesar resultados
      if (productsData.status === 'fulfilled') {
        setProducts(productsData.value);
      }
      
      if (configData.status === 'fulfilled') {
        setStoreConfig(configData.value);
      }
      
      if (bannersData.status === 'fulfilled') {
        setBanners(bannersData.value);
      }
      
      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
      }
      
      setIsOnline(true);
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Usar datos fallback
      setProducts(FALLBACK_PRODUCTS);
      setStoreConfig(FALLBACK_CONFIG);
      setIsOnline(false);
    }
  };
  
  return (
    <EcommerceContext.Provider value={{
      storeConfig,
      isOnline,
      products,
      categories,
      banners,
      loading,
      refreshData: loadInitialData,
      searchProducts,
      filterByCategory
    }}>
      {children}
    </EcommerceContext.Provider>
  );
}
```

## Servicios y API

### Data Service - Servicio con Caché

```typescript
/**
 * Servicio de datos con caché inteligente y fallback
 */
class DataService {
  private cache = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  /**
   * Obtiene productos con caché
   */
  async getProducts(): Promise<Product[]> {
    const cacheKey = 'products';
    
    // Verificar caché
    if (this.hasValidCache(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }
    
    try {
      const response = await ecommerceApi.getProducts();
      
      // Guardar en caché
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      
      return response;
      
    } catch (error) {
      console.warn('API unavailable, using fallback data');
      return FALLBACK_PRODUCTS;
    }
  }
  
  /**
   * Obtiene configuración del e-commerce
   */
  async getEcommerceConfig(): Promise<StoreConfig> {
    const cacheKey = 'config';
    
    if (this.hasValidCache(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }
    
    try {
      const response = await ecommerceApi.getEcommerceConfig();
      
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      
      return response;
      
    } catch (error) {
      console.warn('Config unavailable, using defaults');
      return FALLBACK_CONFIG;
    }
  }
  
  /**
   * Valida stock de producto
   */
  async validateStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const response = await ecommerceApi.validateStock(productId, quantity);
      return response.available;
    } catch (error) {
      // En caso de error, asumir que no hay stock
      console.error('Stock validation failed:', error);
      return false;
    }
  }
  
  /**
   * Obtiene talles disponibles
   */
  async getAvailableSizes(productId: number): Promise<ProductSize[]> {
    try {
      const response = await ecommerceApi.getAvailableSizes(productId);
      return response.sizes;
    } catch (error) {
      console.error('Error getting sizes:', error);
      return [];
    }
  }
  
  /**
   * Verifica si el caché es válido
   */
  private hasValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    return !isExpired;
  }
  
  /**
   * Limpia el caché
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const dataService = new DataService();
```

### API Client E-commerce

```typescript
// app/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Cliente HTTP configurado
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptores para logging y manejo de errores
apiClient.interceptors.request.use(
  config => {
    console.log(`🚀 E-commerce API: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => {
    console.log(`✅ Success: ${response.status} - ${response.config.url}`);
    return response;
  },
  error => {
    console.error(`❌ API Error: ${error.message}`);
    return Promise.reject(error);
  }
);

export const ecommerceApi = {
  // Obtener productos visibles en e-commerce
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products', {
      params: { show_in_ecommerce: true, is_active: true }
    });
    return response.data;
  },
  
  // Obtener producto por ID
  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  
  // Obtener categorías activas
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories', {
      params: { is_active: true }
    });
    return response.data;
  },
  
  // Obtener banners activos
  async getBanners(): Promise<Banner[]> {
    const response = await apiClient.get('/ecommerce-advanced/banners');
    return response.data.filter((banner: Banner) => banner.active);
  },
  
  // Obtener configuración e-commerce
  async getEcommerceConfig(): Promise<StoreConfig> {
    const response = await apiClient.get('/ecommerce-advanced/config');
    return response.data;
  },
  
  // Obtener talles disponibles
  async getAvailableSizes(productId: number): Promise<{ sizes: ProductSize[] }> {
    const response = await apiClient.get(`/products/${productId}/available-sizes`);
    return response.data;
  },
  
  // Validar stock
  async validateStock(productId: number, quantity: number): Promise<{ available: boolean }> {
    const product = await this.getProductById(productId);
    return { available: product.stock >= quantity };
  },
  
  // Crear venta
  async createSale(saleData: CreateSaleData): Promise<Sale> {
    const response = await apiClient.post('/sales', saleData);
    return response.data;
  },
  
  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  }
};
```

## Componentes Principales

### ProductCard - Tarjeta de Producto

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }
    
    onAddToCart?.(product);
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageError ? '/placeholder.svg' : product.image_url}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          onError={() => setImageError(true)}
        />
        
        {/* Badge de stock */}
        {product.stock <= 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Sin Stock
          </div>
        )}
        
        {/* Badge de descuento */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            -{product.discount_percentage}%
          </div>
        )}
      </div>
      
      {/* Información del producto */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Descripción */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* Atributos del producto */}
        <div className="flex flex-wrap gap-2 mb-3">
          {product.brand && (
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {product.brand}
            </span>
          )}
          {product.color && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
              {product.color}
            </span>
          )}
          {product.size && (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
              Talle {product.size}
            </span>
          )}
        </div>
        
        {/* Precio */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.discount_percentage > 0 ? (
              <div>
                <span className="text-lg font-bold text-green-600">
                  ${formatPrice(product.discounted_price)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-800">
                ${formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {/* Stock disponible */}
          <span className="text-sm text-gray-500">
            Stock: {product.stock}
          </span>
        </div>
        
        {/* Botón de agregar al carrito */}
        <Button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full"
          variant={product.stock <= 0 ? "outline" : "default"}
        >
          {product.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
        </Button>
      </div>
    </div>
  );
}
```

### AddToCartModal - Modal Agregar al Carrito

```typescript
interface AddToCartModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, options: ProductOptions) => void;
}

export default function AddToCartModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}: AddToCartModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Cargar talles disponibles al abrir modal
  useEffect(() => {
    if (isOpen && product.id) {
      loadAvailableSizes();
    }
  }, [isOpen, product.id]);
  
  const loadAvailableSizes = async () => {
    setLoading(true);
    try {
      const sizesData = await dataService.getAvailableSizes(product.id);
      setAvailableSizes(sizesData);
    } catch (error) {
      console.error('Error loading sizes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = async () => {
    // Validar selecciones requeridas
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error('Selecciona un talle');
      return;
    }
    
    // Validar stock para la cantidad seleccionada
    const hasStock = await dataService.validateStock(product.id, quantity);
    if (!hasStock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }
    
    // Agregar al carrito
    onAddToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity
    });
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar al Carrito</DialogTitle>
          <DialogDescription>
            Configura las opciones para {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Imagen del producto */}
          <div className="flex items-center space-x-4">
            <Image
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-lg font-bold text-green-600">
                ${formatPrice(product.price)}
              </p>
            </div>
          </div>
          
          {/* Selección de talle */}
          {availableSizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Talle *
              </label>
              {loading ? (
                <div className="grid grid-cols-4 gap-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      disabled={size.stock <= 0}
                      className={`p-2 border rounded text-sm font-medium transition-colors ${
                        selectedSize === size.size
                          ? 'bg-primary text-white border-primary'
                          : size.stock <= 0
                          ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {size.size}
                      {size.stock <= 0 && (
                        <span className="block text-xs">Sin stock</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Selección de cantidad */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cantidad
            </label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="text-lg font-medium min-w-[3rem] text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Stock disponible: {product.stock}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAddToCart}>
            Agregar al Carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Experiencia de Usuario

### Mobile-First Design

El e-commerce está diseñado con enfoque mobile-first:

```css
/* Responsive breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }

/* Grid adaptativo para productos */
.products-grid {
  @apply grid gap-4;
  @apply grid-cols-2; /* Mobile: 2 columnas */
  @apply sm:grid-cols-2; /* Small: 2 columnas */
  @apply md:grid-cols-3; /* Medium: 3 columnas */
  @apply lg:grid-cols-4; /* Large: 4 columnas */
  @apply xl:grid-cols-5; /* XL: 5 columnas */
}
```

### Navegación Intuitiva

```typescript
// Header con navegación adaptativa
export default function Header() {
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Store Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          
          {/* Navegación desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary">
              Inicio
            </Link>
            <Link href="/productos" className="text-gray-700 hover:text-primary">
              Productos
            </Link>
            <Link href="/sobre-nosotros" className="text-gray-700 hover:text-primary">
              Sobre Nosotros
            </Link>
            <Link href="/contacto" className="text-gray-700 hover:text-primary">
              Contacto
            </Link>
          </nav>
          
          {/* Carrito y menú móvil */}
          <div className="flex items-center space-x-4">
            {/* Carrito */}
            <Link href="/carrito" className="relative p-2">
              <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Menú hamburguesa móvil */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MenuIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
        
        {/* Menú móvil */}
        {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} />}
      </div>
    </header>
  );
}
```

### Indicador de Conectividad

```typescript
export default function ConnectionStatus() {
  const { isOnline } = useEcommerce();
  const [showStatus, setShowStatus] = useState(false);
  
  useEffect(() => {
    setShowStatus(!isOnline);
    
    if (!isOnline) {
      const timer = setTimeout(() => setShowStatus(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);
  
  if (!showStatus) return null;
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-white ${
      isOnline ? 'bg-green-500' : 'bg-yellow-500'
    }`}>
      {isOnline ? (
        <span>✅ Conectado - Datos actualizados</span>
      ) : (
        <span>⚠️ Modo offline - Mostrando datos guardados</span>
      )}
    </div>
  );
}
```

## Performance y Optimización

### Next.js Optimizations

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimización de imágenes
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 días
  },
  
  // Compresión
  compress: true,
  
  // Optimización de bundle
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    return config;
  },
  
  // Headers de caché
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Lazy Loading de Componentes

```typescript
// Lazy loading de componentes pesados
const AddToCartModal = lazy(() => import('./modals/AddToCartModal'));
const SizeSelectionModal = lazy(() => import('./modals/SizeSelectionModal'));
const CheckoutModal = lazy(() => import('./modals/CheckoutModal'));

// Uso con Suspense
<Suspense fallback={<ModalSkeleton />}>
  <AddToCartModal
    product={selectedProduct}
    isOpen={modalOpen}
    onClose={() => setModalOpen(false)}
    onAddToCart={handleAddToCart}
  />
</Suspense>
```

### Image Optimization

```typescript
// Componente de imagen optimizada
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className 
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton mientras carga */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <Image
        src={imageError ? '/placeholder.svg' : src}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        priority={false} // Lazy loading por defecto
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    </div>
  );
}
```

## Integración WhatsApp

### Generación de Mensaje WhatsApp

```typescript
function generateWhatsAppMessage(sale: Sale, customer: CustomerInfo): string {
  const orderDetails = sale.items.map(item => 
    `• ${item.product.name} ${item.size ? `(Talle ${item.size})` : ''} - Cantidad: ${item.quantity} - $${formatPrice(item.total_price)}`
  ).join('\n');
  
  return `
🛒 *NUEVO PEDIDO E-COMMERCE* 

📋 *Pedido:* #${sale.sale_number}
👤 *Cliente:* ${customer.name}
📧 *Email:* ${customer.email}
📱 *Teléfono:* ${customer.phone}

🛍️ *Productos:*
${orderDetails}

💰 *Total:* $${formatPrice(sale.total)}

📅 *Fecha:* ${formatDate(new Date())}

¡Por favor confirma la disponibilidad y coordina la entrega!
  `.trim();
}

// Uso en checkout
const redirectToWhatsApp = (sale: Sale, customer: CustomerInfo) => {
  const message = generateWhatsAppMessage(sale, customer);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  
  // Abrir en nueva ventana
  window.open(whatsappUrl, '_blank');
};
```

## Conclusiones

El frontend de e-commerce de POS Cesariel implementa una solución integral que proporciona:

- ✅ **Integración Completa**: Sincronización total con sistema POS
- ✅ **Experiencia Mobile**: Diseño optimizado para dispositivos móviles
- ✅ **Performance**: Carga rápida con caché inteligente y fallbacks
- ✅ **Conversión**: UX optimizada para maximizar ventas
- ✅ **Confiabilidad**: Funciona offline con datos estáticos
- ✅ **Escalabilidad**: Arquitectura preparada para crecimiento
- ✅ **SEO**: Optimizado para motores de búsqueda

Esta documentación técnica facilita el entendimiento, mantenimiento y presentación académica del frontend de e-commerce del sistema POS Cesariel.