# Documentación Completa del E-commerce Frontend - POS Cesariel

## Tabla de Contenidos
1. [Introducción y Arquitectura General](#introducción-y-arquitectura-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
4. [App Router y Páginas](#app-router-y-páginas)
5. [Servicios y API Layer](#servicios-y-api-layer)
6. [Data Service y Caching](#data-service-y-caching)
7. [Context y Estado Global](#context-y-estado-global)
8. [Componentes UI y shadcn/ui](#componentes-ui-y-shadcn-ui)
9. [Sistema de Carrito de Compras](#sistema-de-carrito-de-compras)
10. [Integración WhatsApp](#integración-whatsapp)
11. [Testing y Calidad](#testing-y-calidad)

## Introducción y Arquitectura General

El frontend E-commerce de POS Cesariel es una tienda online moderna construida con **Next.js 15** y **React 19**, que funciona como canal de ventas integrado al sistema POS principal. Utiliza shadcn/ui con Radix UI para componentes accesibles y Tailwind CSS para estilos.

### Características Principales:
- **Tienda Online Completa**: Catálogo de productos, carrito y checkout
- **Integración POS**: Conecta directamente con el backend del sistema POS
- **Data Service Layer**: Abstracción con caching y fallbacks
- **WhatsApp Checkout**: Proceso de compra via WhatsApp Business
- **Responsive Design**: Optimizada para móviles y desktop
- **Stock en Tiempo Real**: Validación contra inventario del POS
- **Fallback Offline**: Funciona con datos estáticos cuando el backend está offline

### Arquitectura de Capas:
```
Frontend E-commerce
├── App Router (Next.js 15)      # Rutas y páginas
├── Data Service Layer           # Abstracción + Cache
├── API Service Layer            # Comunicación HTTP
├── Context Layer               # Estado global
├── UI Components Layer         # shadcn/ui + custom
└── Backend Integration         # FastAPI POS System
```

## Estructura de Archivos

### Organización del Proyecto:
```
ecommerce/
├── app/                         # App Router de Next.js 15
│   ├── layout.tsx              # Layout principal con providers
│   ├── page.tsx                # Página de inicio (banners dinámicos)
│   ├── globals.css             # Estilos globales
│   ├── loading.tsx             # Loading UI global
│   ├── productos/              # Catálogo de productos
│   │   ├── page.tsx           # Lista de productos con filtros
│   │   ├── loading.tsx        # Loading específico
│   │   └── [id]/page.tsx      # Detalle de producto individual
│   ├── carrito/page.tsx        # Carrito y checkout completo
│   ├── contacto/page.tsx       # Información de contacto
│   ├── sobre-nosotros/page.tsx # Página institucional
│   ├── components/             # Componentes específicos del app
│   │   ├── Banner.tsx         # Carrusel de banners dinámico
│   │   ├── Header.tsx         # Header con navegación
│   │   ├── Footer.tsx         # Footer con links
│   │   ├── ProductCard.tsx    # Card de producto
│   │   ├── ConnectionStatus.tsx # Indicador de conexión
│   │   └── modals/            # Modales del sistema
│   │       ├── AddToCartModal.tsx      # Agregar al carrito
│   │       ├── SizeSelectionModal.tsx  # Selector de talles
│   │       ├── ColorSelectionModal.tsx # Selector de colores
│   │       ├── CheckoutErrorModal.tsx  # Errores de checkout
│   │       ├── RemoveFromCartModal.tsx # Confirmar eliminación
│   │       └── LoadingModal.tsx        # Estados de carga
│   ├── context/                # Estado global con React Context
│   │   ├── EcommerceContext.tsx # Context principal integrado
│   │   └── CartContext.tsx      # Context legacy del carrito
│   ├── lib/                    # Utilidades y servicios
│   │   ├── api.ts             # Cliente API con endpoints
│   │   ├── api-types.ts       # Tipos TypeScript para API
│   │   ├── data-service.ts    # Service layer con cache
│   │   ├── data.ts            # Datos estáticos fallback
│   │   └── types.ts           # Tipos del frontend
│   └── hooks/                  # Hooks personalizados
│       └── useProducts.ts      # Hook para productos
├── components/                 # Componentes globales
│   ├── theme-provider.tsx     # Provider de temas
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx         # Botones accesibles
│       ├── input.tsx          # Inputs de formulario
│       ├── card.tsx           # Cards de contenido
│       ├── dialog.tsx         # Modales y dialogs
│       ├── toast.tsx          # Notificaciones toast
│       ├── badge.tsx          # Badges y etiquetas
│       ├── separator.tsx      # Separadores visuales
│       ├── scroll-area.tsx    # Áreas scrolleables
│       ├── skeleton.tsx       # Placeholders de carga
│       └── [30+ más...]       # Componentes Radix UI
├── services/                   # Servicios centralizados
│   ├── api-service.ts         # Servicio HTTP principal
│   └── index.ts               # Exports de servicios
├── __tests__/                  # Suite de testing completa
│   ├── components/            # Tests de componentes
│   ├── context/               # Tests de contextos
│   ├── lib/                   # Tests de librerías
│   └── setup/                 # Configuración de tests
├── cypress/                    # E2E testing con Cypress
│   ├── e2e/                   # Tests end-to-end
│   └── support/               # Comandos personalizados
├── package.json               # Dependencias y scripts
├── next.config.mjs            # Configuración Next.js
├── tailwind.config.ts         # Configuración Tailwind
├── tsconfig.json              # Configuración TypeScript
└── CLAUDE.md                  # Guía específica para Claude Code
```

## Tecnologías y Dependencias

### Framework y Core:
```json
{
  "dependencies": {
    "next": "15.2.4",              // Next.js App Router con React 19
    "react": "^19",                // React con nuevas características
    "react-dom": "^19",            // DOM renderer
    "typescript": "^5",            // Tipado estático
    "tailwindcss": "^3.4.17",     // Framework CSS utility-first
  }
}
```

### UI y Componentes:
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "1.1.4",        // Modales accesibles
    "@radix-ui/react-toast": "1.2.4",         // Notificaciones
    "@radix-ui/react-select": "2.1.4",        // Selectores
    "@radix-ui/react-checkbox": "1.1.3",      // Checkboxes
    "@radix-ui/react-accordion": "1.2.2",     // Acordeones
    "@radix-ui/react-progress": "1.1.1",      // Barras de progreso
    "@radix-ui/react-separator": "1.1.1",     // Separadores
    "class-variance-authority": "^0.7.1",     // Variantes de clases
    "clsx": "^2.1.1",                         // Utilidad para clsx
    "tailwind-merge": "^2.5.5",               // Merge de clases Tailwind
    "tailwindcss-animate": "^1.0.7",          // Animaciones CSS
    "lucide-react": "^0.454.0",               // Iconos SVG
    "embla-carousel-react": "8.5.1",          // Carrusel de componentes
  }
}
```

### HTTP y Formularios:
```json
{
  "dependencies": {
    "axios": "^1.10.0",                       // Cliente HTTP
    "react-hook-form": "^7.54.1",             // Gestión de formularios
    "@hookform/resolvers": "^3.9.1",          // Resolvers para validación
    "zod": "^3.24.1",                         // Validación de esquemas
  }
}
```

### Testing:
```json
{
  "devDependencies": {
    "@testing-library/react": "^16.1.0",      // Testing library
    "@testing-library/jest-dom": "^6.6.3",    // Matchers Jest
    "@testing-library/user-event": "^14.5.2", // Eventos de usuario
    "jest": "^29.7.0",                        // Framework de testing
    "jest-environment-jsdom": "^29.7.0",      // Entorno JSDOM
    "cypress": "^13.6.2",                     // E2E testing
  }
}
```

## App Router y Páginas

### 1. Layout Principal (`app/layout.tsx`)

**Propósito**: Define la estructura base de la aplicación con providers y componentes globales.

```typescript
import { EcommerceProvider } from "./context/EcommerceContext"
import Header from "./components/Header"
import Footer from "./components/Footer"

export const metadata: Metadata = {
  title: "Mi Tienda Online - E-commerce",
  description: "Tienda online con productos de calidad y los mejores precios",
  keywords: "tienda, online, ropa, calzado, accesorios",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <EcommerceProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </EcommerceProvider>
      </body>
    </html>
  )
}
```

**Características**:
- **Providers**: EcommerceProvider envuelve toda la app
- **Layout Flexbox**: Header, main content, footer responsivos
- **Metadatos SEO**: Optimización para buscadores
- **Internacionalización**: Configurado en español

### 2. Página de Inicio (`app/page.tsx`)

**Propósito**: Landing page con banners dinámicos y navegación a categorías.

**Funcionalidades Principales**:
- **Banners Dinámicos**: Carrusel automático con datos del backend
- **Auto-slide**: Rotación automática cada 5 segundos
- **Navegación por Categorías**: Enlaces directos a productos
- **Loading States**: Skeleton loading para banners

**Lógica de Banners**:
```typescript
export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [isLoadingBanners, setIsLoadingBanners] = useState(true)

  // Cargar banners desde backend
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsLoadingBanners(true)
        const response = await ecommerceApi.getBanners()
        const bannersData = response.data.data
        
        if (bannersData && bannersData.length > 0) {
          setBanners(bannersData)
        }
      } catch (error) {
        console.error('Error cargando banners:', error)
      } finally {
        setIsLoadingBanners(false)
      }
    }

    loadBanners()
  }, [])

  // Auto-slide cada 5 segundos
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [banners.length])
```

**Enlaces de Categorías**:
```typescript
{/* Quick Links */}
<section className="bg-gray-50 py-16">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Link href="/productos?categoria=ropa" className="group">
        <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">👔</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Ropa</h3>
          <p className="text-gray-600">Encuentra la última moda</p>
        </div>
      </Link>
      {/* Más categorías... */}
    </div>
  </div>
</section>
```

### 3. Catálogo de Productos (`app/productos/page.tsx`)

**Propósito**: Lista de productos con filtros avanzados, búsqueda y paginación.

**Funcionalidades**:
- **Filtros Dinámicos**: Por categoría, precio, marca, stock
- **Búsqueda en Tiempo Real**: Con debouncing
- **Grid Responsivo**: Adaptable a diferentes pantallas
- **Loading States**: Skeletons durante carga

### 4. Detalle de Producto (`app/productos/[id]/page.tsx`)

**Propósito**: Página detallada de producto individual con selección de variantes.

**Características**:
- **Galería de Imágenes**: Carrusel de fotos del producto
- **Selector de Talles**: Modal con stock por talle
- **Selector de Colores**: Variantes de color disponibles
- **Información Detallada**: Descripción, precio, disponibilidad

## Servicios y API Layer

### 1. API Service (`services/api-service.ts`)

**Propósito**: Cliente HTTP centralizado con interceptors y manejo de errores.

```typescript
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
```

**Métodos HTTP**:
```typescript
  async get<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get(url);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'GET', url);
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
```

### 2. API Client (`app/lib/api.ts`)

**Propósito**: Define endpoints específicos del e-commerce con tipos TypeScript.

**Endpoints Principales**:
```typescript
export const ecommerceApi = {
  // Productos para e-commerce
  getProducts: () => axios.get('/products', { 
    params: { show_in_ecommerce: true, limit: 100 } 
  }),
  
  // Producto individual
  getProductById: (id: number) => axios.get(`/products/${id}`),
  
  // Búsqueda de productos
  searchProducts: (query: string) => axios.get('/products/search', { 
    params: { q: query } 
  }),
  
  // Categorías activas
  getCategories: () => axios.get('/categories'),
  
  // Banners del CMS
  getBanners: () => axios.get('/ecommerce-advanced/banners'),
  
  // Talles disponibles por producto
  getAvailableSizes: (productId: number) => 
    axios.get(`/products/${productId}/available-sizes`),
  
  // Crear venta desde e-commerce
  createSale: (saleData: any) => axios.post('/ecommerce/sales', saleData),
  
  // Configuración del e-commerce
  getEcommerceConfig: () => axios.get('/ecommerce-advanced/config'),
}
```

## Data Service y Caching

### Data Service Layer (`app/lib/data-service.ts`)

**Propósito**: Abstracción entre componentes y API con caching inteligente y fallbacks.

**Sistema de Cache**:
```typescript
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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
```

**Obtención de Productos con Filtros**:
```typescript
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

    // Parámetros para la API
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

    // Aplicar filtros del frontend
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
```

**Validación de Stock con Talles**:
```typescript
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
```

**Datos de Fallback**:
```typescript
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
    // Más productos fallback...
  ];
}
```

## Context y Estado Global

### 1. EcommerceContext (`app/context/EcommerceContext.tsx`)

**Propósito**: Context principal que maneja carrito, checkout y comunicación con backend.

**Interfaces Principales**:
```typescript
export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  productId: number // ID numérico para el backend
}

interface CustomerInfo {
  name: string
  phone: string
  email?: string
  address?: {
    street: string
    number: string
    floor?: string
    city: string
    province: string
    postalCode: string
  }
  notes?: string
}

interface CartState {
  items: CartItem[]
  total: number
  customerInfo: CustomerInfo | null
  deliveryMethod: 'pickup' | 'delivery'
}
```

**Context Provider**:
```typescript
export function EcommerceProvider({ children }: { children: ReactNode }) {
  const [cartState, setCartState] = useState<CartState>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cálculo de totales
  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Buscar item en carrito
  const findItem = (items: CartItem[], id: string, size?: string, color?: string) => {
    return items.find(item => 
      item.id === id && 
      item.size === size && 
      item.color === color
    )
  }
```

**Agregar Items al Carrito**:
```typescript
  const addItem = useCallback(async (newItem: CartItem): Promise<boolean> => {
    try {
      setError(null)
      
      // Para e-commerce no validamos stock aquí (se valida en checkout)
      // La validación de stock requiere autenticación que e-commerce no tiene

      setCartState(prev => {
        const existingItem = findItem(prev.items, newItem.id, newItem.size, newItem.color)
        
        let newItems: CartItem[]
        
        if (existingItem) {
          // Actualizar cantidad de item existente
          newItems = prev.items.map(item =>
            findItem([item], newItem.id, newItem.size, newItem.color)
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        } else {
          // Agregar nuevo item
          newItems = [...prev.items, newItem]
        }

        return {
          ...prev,
          items: newItems,
          total: calculateTotal(newItems)
        }
      })

      return true
    } catch (err) {
      console.error('Error adding item to cart:', err)
      setError('Error al agregar producto al carrito')
      return false
    }
  }, [])
```

**Proceso de Checkout**:
```typescript
  const processCheckout = useCallback(async (): Promise<{ success: boolean; saleId?: number; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // Validar datos requeridos
      if (cartState.items.length === 0) {
        return { success: false, error: 'El carrito está vacío' }
      }

      if (!cartState.customerInfo?.name || !cartState.customerInfo?.phone) {
        return { success: false, error: 'Información del cliente incompleta' }
      }

      // Validar dirección si es envío a domicilio
      if (cartState.deliveryMethod === 'delivery') {
        const { address } = cartState.customerInfo
        if (!address?.street || !address?.number || !address?.city || !address?.province || !address?.postalCode) {
          return { success: false, error: 'Dirección de entrega incompleta' }
        }
      }

      // Preparar notas de entrega
      let deliveryNotes = `Entrega: ${cartState.deliveryMethod === 'pickup' ? 'Retiro en local' : 'Domicilio'}`
      if (cartState.deliveryMethod === 'delivery' && cartState.customerInfo.address) {
        const addr = cartState.customerInfo.address
        deliveryNotes += `\nDirección: ${addr.street} ${addr.number}${addr.floor ? `, Piso ${addr.floor}` : ''}, ${addr.city}, ${addr.province}, CP: ${addr.postalCode}`
      }
      if (cartState.customerInfo.notes) {
        deliveryNotes += `\nNotas: ${cartState.customerInfo.notes}`
      }

      // Preparar datos de venta para backend
      const saleData = {
        sale_type: 'ECOMMERCE' as const,
        customer_name: cartState.customerInfo.name,
        customer_phone: cartState.customerInfo.phone,
        notes: deliveryNotes,
        payment_method: 'WHATSAPP', // Se coordina por WhatsApp
        items: cartState.items.map(item => ({
          product_id: item.productId || parseInt(item.id),
          quantity: item.quantity,
          unit_price: item.price,
          size: item.size || undefined
        }))
      }

      console.log('Making API call to /ecommerce/sales with:', saleData)
      const response = await salesApi.create(saleData)
      console.log('API Response:', response)
      
      if (response.data) {
        clearCart()
        return { 
          success: true, 
          saleId: response.data.id || response.data.sale_id 
        }
      }

      return { success: false, error: 'Error al procesar la venta' }

    } catch (err) {
      console.error('Error processing checkout:', err)
      const errorInfo = handleApiError(err)
      
      let errorMessage = errorInfo.message || 'Error al procesar la compra'
      if (errorInfo.errors && errorInfo.errors.length > 0) {
        errorMessage += '\n\nDetalles:\n' + errorInfo.errors.join('\n')
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [cartState, clearCart])
```

## Componentes UI y shadcn/ui

### Sistema de Componentes Accesibles

El e-commerce utiliza **shadcn/ui** que combina **Radix UI** primitives con **Tailwind CSS**:

#### **Componentes Base**:
```
components/ui/
├── button.tsx          # Botones con variantes (primary, secondary, outline)
├── input.tsx           # Inputs de formulario con validación
├── card.tsx            # Cards de contenido
├── dialog.tsx          # Modales y dialogs accesibles
├── toast.tsx           # Sistema de notificaciones
├── badge.tsx           # Badges para estados y etiquetas
├── separator.tsx       # Líneas separadoras
├── skeleton.tsx        # Placeholders de carga
├── progress.tsx        # Barras de progreso
├── scroll-area.tsx     # Áreas con scroll personalizado
└── [25+ más...]        # Componentes Radix UI completos
```

#### **Ejemplo de Componente - Button**:
```typescript
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Modales del Sistema

#### **1. AddToCartModal**:
- Confirmación de agregado al carrito
- Selector de talles si aplica
- Selector de colores si aplica
- Validación de stock en tiempo real

#### **2. CheckoutErrorModal**:
- Manejo centralizado de errores
- Lista de campos faltantes
- Mensajes descriptivos

#### **3. LoadingModal**:
- Estados de carga durante procesamiento
- Indicadores de progreso
- Mensajes contextuales

## Sistema de Carrito de Compras

### Página de Carrito (`app/carrito/page.tsx`)

**Funcionalidades Completas**:

#### **1. Gestión de Items**:
```typescript
const handleUpdateQuantity = async (id: string, newQuantity: number, size?: string, color?: string) => {
  if (newQuantity <= 0) {
    removeItem(id, size, color)
  } else {
    await updateQuantity(id, newQuantity, size, color)
  }
}

const handleRemoveClick = (item: any) => {
  setProductToRemove(item)
  setShowRemoveModal(true)
}

const confirmRemoveItem = () => {
  if (productToRemove) {
    removeItem(productToRemove.id, productToRemove.size, productToRemove.color)
    setShowRemoveModal(false)
    setProductToRemove(null)
  }
}
```

#### **2. Información del Cliente**:
```typescript
// Información básica
<Input
  type="text"
  value={cartState.customerInfo?.name || ""}
  onChange={(e) => updateCustomerInfo({ name: e.target.value })}
  placeholder="Tu nombre completo"
  required
/>

<Input
  type="tel"
  value={cartState.customerInfo?.phone || ""}
  onChange={(e) => updateCustomerInfo({ phone: e.target.value })}
  placeholder="Tu número de teléfono"
  required
/>
```

#### **3. Métodos de Entrega**:
```typescript
{/* Selección de método */}
<div className="flex items-center">
  <input
    type="radio"
    id="pickup"
    name="deliveryMethod"
    value="pickup"
    checked={cartState.deliveryMethod === "pickup"}
    onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
  />
  <label htmlFor="pickup">
    <span className="font-medium">Retiro en Local</span>
    <span className="block text-gray-500 text-xs">Gratis - Retirá tu pedido en nuestro local</span>
  </label>
</div>

<div className="flex items-center">
  <input
    type="radio"
    id="delivery"
    name="deliveryMethod"
    value="delivery"
    checked={cartState.deliveryMethod === "delivery"}
    onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
  />
  <label htmlFor="delivery">
    <span className="font-medium">Envío a Domicilio</span>
    <span className="block text-gray-500 text-xs">
      {cartState.total >= 10000 ? "Gratis" : "$1.500"} - Recibí tu pedido en tu casa
    </span>
  </label>
</div>
```

#### **4. Dirección Condicional**:
```typescript
{cartState.deliveryMethod === "delivery" && (
  <div className="space-y-4 border-t pt-4">
    <h4 className="font-medium text-gray-800">Dirección de Entrega</h4>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        value={cartState.customerInfo?.address?.street || ""}
        onChange={(e) => updateAddress({ street: e.target.value })}
        placeholder="Nombre de la calle"
        required
      />
      
      <Input
        value={cartState.customerInfo?.address?.number || ""}
        onChange={(e) => updateAddress({ number: e.target.value })}
        placeholder="1234"
        required
      />
    </div>
    
    <select
      value={cartState.customerInfo?.address?.province || ""}
      onChange={(e) => updateAddress({ province: e.target.value })}
      required
    >
      <option value="">Seleccionar provincia</option>
      <option value="Buenos Aires">Buenos Aires</option>
      <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
      {/* Todas las provincias argentinas... */}
    </select>
  </div>
)}
```

#### **5. Resumen de Pedido**:
```typescript
<div className="space-y-2 mb-4">
  <div className="flex justify-between">
    <span>Subtotal ({cartState.items.reduce((sum, item) => sum + item.quantity, 0)} productos)</span>
    <span>${cartState.total.toLocaleString()}</span>
  </div>
  <div className="flex justify-between">
    <span>Envío</span>
    <span className="text-green-600">
      {cartState.deliveryMethod === "pickup" ? "Gratis (Retiro)" : cartState.total >= 10000 ? "Gratis" : "$1.500"}
    </span>
  </div>
</div>

<div className="flex justify-between text-lg font-bold">
  <span>Total</span>
  <span>
    ${(cartState.total + (cartState.deliveryMethod === "pickup" ? 0 : cartState.total >= 10000 ? 0 : 1500)).toLocaleString()}
  </span>
</div>
```

## Integración WhatsApp

### Checkout via WhatsApp

**Propósito**: Después de procesar el pedido en el backend, redirige a WhatsApp para coordinación.

#### **1. Configuración Dinámica**:
```typescript
const generateWhatsAppMessage = async (saleId?: number) => {
  try {
    // Obtener configuración desde backend
    const configResponse = await whatsappConfigApi.getConfig()
    let whatsappPhone = "5491123456789" // Fallback number
    
    if (configResponse.data && configResponse.data.data) {
      const config = configResponse.data.data
      if (config.is_active && config.business_phone) {
        // Limpiar número (remover + y espacios)
        whatsappPhone = config.business_phone.replace(/[\+\s\-]/g, "")
      }
    }
```

#### **2. Generación de Mensaje**:
```typescript
    const orderDetails = cartState.items
      .map(
        (item) =>
          `• ${item.name} (${item.color}, Talle: ${item.size}) - Cantidad: ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`,
      )
      .join("\n")

    const deliveryInfo =
      cartState.deliveryMethod === "pickup"
        ? "*RETIRO EN LOCAL*\nAv. Corrientes 1234, CABA\nHorarios: Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
        : `*ENVÍO A DOMICILIO*\n${cartState.customerInfo?.address?.street} ${cartState.customerInfo?.address?.number}${cartState.customerInfo?.address?.floor ? `, ${cartState.customerInfo?.address?.floor}` : ""}\n${cartState.customerInfo?.address?.city}, ${cartState.customerInfo?.address?.province}\nCP: ${cartState.customerInfo?.address?.postalCode}`

    const shippingCost = cartState.deliveryMethod === "pickup" ? 0 : cartState.total >= 10000 ? 0 : 1500
    const finalTotal = cartState.total + shippingCost

    const message = `¡Hola! Quiero realizar el siguiente pedido:

*PEDIDO #${saleId || 'CONFIRMADO'}* ✅

*PRODUCTOS:*
${orderDetails}

*MÉTODO DE ENTREGA:*
${deliveryInfo}

*RESUMEN:*
Subtotal: $${cartState.total.toLocaleString()}
${cartState.deliveryMethod === "delivery" ? `Envío: ${shippingCost === 0 ? "Gratis" : "$" + shippingCost.toLocaleString()}` : "Envío: Gratis (Retiro en local)"}
*TOTAL: $${finalTotal.toLocaleString()}*

*DATOS DEL CLIENTE:*
Nombre: ${cartState.customerInfo?.name}
Teléfono: ${cartState.customerInfo?.phone}

${cartState.customerInfo?.notes ? `*NOTAS:*\n${cartState.customerInfo?.notes}` : ""}

El pedido ya está registrado en el sistema ✅
¡Gracias!`

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
```

#### **3. Flujo Completo**:
1. **Usuario llena carrito** → Agrega productos con talles/colores
2. **Completa información** → Datos personales + dirección (si aplica)
3. **Procesa checkout** → Crea venta en backend POS
4. **Genera mensaje WhatsApp** → Con número dinámico del backend
5. **Abre WhatsApp** → Chat pre-llenado para coordinar pago/entrega

## Testing y Calidad

### Estructura de Testing

#### **Jest + Testing Library**:
```
__tests__/
├── components/
│   └── ProductCard.test.tsx    # Tests de componentes
├── context/
│   └── EcommerceContext.test.tsx # Tests de contextos
├── lib/
│   ├── api.test.ts             # Tests de API
│   └── data-service.test.ts    # Tests de data service
└── setup/
    └── test-utils.tsx          # Utilidades de testing
```

#### **Cypress E2E**:
```
cypress/
├── e2e/
│   ├── homepage.cy.ts          # Tests de página principal
│   └── product-browsing.cy.ts  # Tests de navegación
└── support/
    ├── commands.ts             # Comandos personalizados
    └── e2e.ts                  # Configuración E2E
```

#### **Scripts de Testing**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

### Configuración de Testing

#### **Jest Config (`jest.config.js`)**:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

## Conclusión

El frontend E-commerce de POS Cesariel es una aplicación web moderna que implementa las mejores prácticas de desarrollo con Next.js 15 y React 19. Su integración directa con el sistema POS, sistema de caching inteligente, checkout via WhatsApp y componentes accesibles lo convierten en una solución e-commerce robusta y user-friendly.

### Características Destacadas:

1. **Integración POS Total**: Conecta directamente con inventario y ventas del sistema principal
2. **Data Service Layer**: Abstracción con cache y fallbacks para funcionar offline
3. **WhatsApp Business**: Proceso de checkout integrado con WhatsApp
4. **UI/UX Moderna**: shadcn/ui + Radix UI para máxima accesibilidad
5. **Sistema de Talles**: Gestión avanzada de variantes por producto
6. **Responsive Design**: Optimizada para móviles y desktop
7. **Testing Comprensivo**: Jest, Testing Library y Cypress E2E
8. **Caching Inteligente**: 5 minutos de cache con invalidación automática

El sistema está diseñado para brindar una experiencia de usuario fluida mientras mantiene sincronización en tiempo real con el sistema POS, garantizando consistencia de datos y una operación comercial eficiente.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "1", "content": "Analyze complete e-commerce frontend structure and architecture", "status": "completed"}, {"id": "2", "content": "Document app/ directory - Next.js App Router structure", "status": "completed"}, {"id": "3", "content": "Document components/ - E-commerce UI components", "status": "completed"}, {"id": "4", "content": "Document services/ - API service layer", "status": "completed"}, {"id": "5", "content": "Document lib/ - Data service and utilities", "status": "completed"}, {"id": "6", "content": "Document context/ - React Context for state management", "status": "completed"}, {"id": "7", "content": "Document components/ui/ - shadcn/ui components", "status": "completed"}, {"id": "8", "content": "Document product catalog and filtering system", "status": "completed"}, {"id": "9", "content": "Document shopping cart and checkout flow", "status": "completed"}, {"id": "10", "content": "Document WhatsApp integration", "status": "completed"}, {"id": "11", "content": "Document configuration and dependencies", "status": "completed"}, {"id": "12", "content": "Create comprehensive ECOMMERCE_CODE_DOCUMENTATION.md file", "status": "completed"}]