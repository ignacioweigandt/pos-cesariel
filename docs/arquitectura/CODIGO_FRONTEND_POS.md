# Documentación Técnica del Frontend POS Administrativo - POS Cesariel

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
5. [Componentes Principales](#componentes-principales)
6. [Estado Global y Gestión](#estado-global-y-gestión)
7. [Autenticación y Rutas](#autenticación-y-rutas)
8. [API Client](#api-client)
9. [WebSockets y Tiempo Real](#websockets-y-tiempo-real)
10. [Testing y Calidad](#testing-y-calidad)

## Visión General

El frontend administrativo de POS Cesariel es una aplicación web desarrollada en **Next.js 15** con **React 19**, diseñada para proporcionar una interfaz completa de administración del sistema de punto de venta. Está optimizada para uso en tablets y computadoras de escritorio, con enfoque en productividad y experiencia de usuario.

### Características Principales

- **Framework**: Next.js 15 con App Router
- **UI Framework**: React 19 con TypeScript
- **Estilos**: Tailwind CSS con Headless UI
- **Estado**: Zustand con persistencia
- **API Client**: Axios con interceptores
- **Tiempo Real**: WebSockets para notificaciones
- **Testing**: Jest, React Testing Library, Cypress
- **Performance**: Lighthouse CI para auditorías

## Arquitectura del Sistema

### Patrón Arquitectónico

El frontend sigue una **arquitectura de componentes** con separación clara de responsabilidades:

```
┌─────────────────────────────────────┐
│           Capa de Vista             │
│     (React Components + Pages)      │
├─────────────────────────────────────┤
│         Capa de Estado              │
│        (Zustand Stores)             │
├─────────────────────────────────────┤
│         Capa de Servicios           │
│      (API Client + WebSockets)     │
├─────────────────────────────────────┤
│         Capa de Utilidades          │
│     (Helpers + Validadores)        │
└─────────────────────────────────────┘
```

### Principios de Diseño

1. **Componentes Reutilizables**: Componentes modulares y configurables
2. **Estado Inmutable**: Gestión predictible del estado con Zustand
3. **Tipado Fuerte**: TypeScript en todo el código
4. **Responsive Design**: Adaptable a diferentes tamaños de pantalla
5. **Accesibilidad**: Cumplimiento con estándares WCAG
6. **Performance**: Optimización de renderizado y carga

## Estructura de Archivos

```
frontend/pos-cesariel/
├── app/                              # App Router Next.js 15
│   ├── layout.tsx                    # Layout principal
│   ├── page.tsx                      # Página de inicio (login)
│   ├── globals.css                   # Estilos globales
│   ├── dashboard/
│   │   └── page.tsx                  # Panel principal
│   ├── pos/
│   │   └── page.tsx                  # Punto de venta
│   ├── inventory/
│   │   └── page.tsx                  # Gestión de inventario
│   ├── users/
│   │   ├── page.tsx                  # Lista de usuarios
│   │   ├── create/page.tsx           # Crear usuario
│   │   ├── edit/[id]/page.tsx        # Editar usuario
│   │   └── branches/                 # Gestión de sucursales
│   ├── reports/
│   │   └── page.tsx                  # Reportes y análisis
│   ├── settings/
│   │   ├── page.tsx                  # Configuraciones
│   │   ├── ecommerce/page.tsx        # Config e-commerce
│   │   ├── payment-methods/page.tsx  # Métodos de pago
│   │   └── ...                       # Otras configuraciones
│   └── ecommerce/
│       └── page.tsx                  # Gestión e-commerce
├── components/                       # Componentes reutilizables
│   ├── Layout.tsx                    # Layout con navegación
│   ├── FloatingCart.tsx              # Carrito flotante POS
│   ├── BarcodeScanner.tsx            # Escáner de códigos
│   ├── ImportModal.tsx               # Modal importación
│   ├── NotificationCenter.tsx        # Centro notificaciones
│   └── ...                          # Otros componentes
├── hooks/                           # Custom hooks
│   └── ...                          # Hooks reutilizables
├── lib/                             # Biblioteca de utilidades
│   ├── api.ts                       # Cliente API
│   ├── auth.ts                      # Funciones de autenticación
│   ├── websocket.ts                 # Cliente WebSocket
│   └── useBarcodeScanner.ts         # Hook escáner barras
├── types/                           # Definiciones TypeScript
│   └── index.ts                     # Tipos centralizados
├── utils/                           # Funciones utilitarias
│   └── index.ts                     # Helpers generales
├── __tests__/                       # Suite de pruebas
│   ├── components/                  # Tests de componentes
│   ├── lib/                        # Tests de utilidades
│   ├── pages/                      # Tests de páginas
│   └── utils/                      # Tests helpers
├── cypress/                         # Pruebas E2E
│   ├── e2e/                        # Tests end-to-end
│   └── support/                    # Configuración Cypress
├── package.json                     # Dependencias y scripts
├── tailwind.config.js              # Configuración Tailwind
├── next.config.js                  # Configuración Next.js
├── jest.config.js                  # Configuración Jest
└── tsconfig.json                   # Configuración TypeScript
```

## Tecnologías y Dependencias

### Stack Principal

```json
{
  "dependencies": {
    "next": "15.3.5",                    // Framework React
    "react": "^19.0.0",                  // Biblioteca UI
    "react-dom": "^19.0.0",              // DOM Virtual
    "typescript": "^5",                   // Tipado estático
    "@headlessui/react": "^1.7.17",      // Componentes UI accesibles
    "@heroicons/react": "^2.2.0",        // Iconos
    "axios": "^1.10.0",                  // Cliente HTTP
    "zustand": "^4.5.7",                 // Gestión de estado
    "react-hook-form": "^7.59.0",        // Formularios
    "react-hot-toast": "^2.5.2",         // Notificaciones
    "recharts": "^2.15.4",               // Gráficos
    "date-fns": "^2.30.0",               // Manejo de fechas
    "tailwindcss": "^4"                   // Framework CSS
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",     // Testing React
    "@testing-library/jest-dom": "^6.1.4",   // Matchers Jest
    "jest": "^29.7.0",                       // Framework testing
    "cypress": "^13.6.0",                    // Testing E2E
    "@lhci/cli": "^0.12.0",                  // Lighthouse CI
    "artillery": "^2.0.0"                    // Load testing
  }
}
```

### Configuración Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo estricto de React
  reactStrictMode: true,
  
  // Optimización de imágenes
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif']
  },
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Configuración experimental
  experimental: {
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack'],
      }
    }
  }
};

module.exports = nextConfig;
```

## Componentes Principales

### 1. Layout.tsx - Navegación Principal

```typescript
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Gestión de estado local para sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estado de autenticación
  const { user, logout } = useAuth();
  
  // WebSocket para notificaciones tiempo real
  const { notifications, isConnected } = usePOSWebSocket();
  
  // Navegación adaptativa según permisos de usuario
  const navigation = filterNavigationByPermissions(user?.role);
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar móvil */}
      <MobileSidebar open={sidebarOpen} onClose={setSidebarOpen} />
      
      {/* Sidebar desktop */}
      <DesktopSidebar navigation={navigation} />
      
      {/* Contenido principal */}
      <MainContent>
        {/* Header con notificaciones */}
        <Header user={user} notifications={notifications} />
        
        {/* Contenido de la página */}
        <main className="flex-1 relative overflow-y-auto">
          {children}
        </main>
      </MainContent>
    </div>
  );
}
```

### 2. FloatingCart.tsx - Carrito POS

```typescript
interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  discount?: number;
}

export default function FloatingCart() {
  // Estado del carrito desde Zustand
  const { items, total, addItem, removeItem, clear } = useCartStore();
  
  // Estado local del modal
  const [isOpen, setIsOpen] = useState(false);
  
  // Función para procesar venta
  const handleCheckout = async (customerData: CustomerData) => {
    try {
      const sale = await salesApi.createSale({
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        customer_name: customerData.name,
        customer_email: customerData.email,
        total: total,
        payment_method: customerData.paymentMethod
      });
      
      // Limpiar carrito y mostrar confirmación
      clear();
      toast.success(`Venta #${sale.sale_number} procesada exitosamente`);
      
    } catch (error) {
      toast.error('Error al procesar la venta');
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón flotante con badge */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg"
      >
        <ShoppingCartIcon className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1">
            {items.length}
          </span>
        )}
      </button>
      
      {/* Modal del carrito */}
      <CartModal 
        open={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        total={total}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
```

### 3. BarcodeScanner.tsx - Escáner de Códigos

```typescript
interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isActive: boolean;
}

export default function BarcodeScanner({ onScan, isActive }: BarcodeScannerProps) {
  // Hook personalizado para gestionar el escáner
  const { 
    startScanner, 
    stopScanner, 
    error,
    isSupported 
  } = useBarcodeScanner({
    onDetected: (barcode) => {
      onScan(barcode);
      // Retroalimentación visual/sonora
      playBeepSound();
      showScanFeedback();
    },
    constraints: {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment' // Cámara trasera
      }
    }
  });
  
  // Efectos para controlar el escáner
  useEffect(() => {
    if (isActive && isSupported) {
      startScanner();
    } else {
      stopScanner();
    }
    
    return () => stopScanner();
  }, [isActive, isSupported]);
  
  if (!isSupported) {
    return <ManualBarcodeInput onSubmit={onScan} />;
  }
  
  return (
    <div className="relative">
      {/* Video feed */}
      <video 
        ref={videoRef}
        className="w-full h-64 bg-black rounded-lg"
        autoPlay
        muted
        playsInline
      />
      
      {/* Overlay con guías de escaneo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="border-2 border-green-400 w-64 h-32 rounded-lg opacity-70">
          <div className="w-full h-full border-dashed border-2 border-green-300" />
        </div>
      </div>
      
      {/* Estado y controles */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-center">
          {error ? (
            <span className="text-red-400">Error: {error}</span>
          ) : (
            <span>Apunta la cámara hacia el código de barras</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Estado Global y Gestión

### Zustand Store - Autenticación

```typescript
interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Acción de login
      login: async (credentials) => {
        set({ isLoading: true });
        
        try {
          const response = await authApi.login(credentials);
          const { user, access_token } = response;
          
          // Configurar token en cliente HTTP
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false
          });
          
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Acción de logout
      logout: () => {
        // Limpiar token del cliente HTTP
        delete apiClient.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      },
      
      // Renovar token
      refreshToken: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const response = await authApi.refreshToken(token);
          set({ token: response.access_token });
          
          // Actualizar cliente HTTP
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
          
        } catch (error) {
          // Token inválido, cerrar sesión
          get().logout();
        }
      },
      
      setUser: (user) => set({ user })
    }),
    {
      name: 'pos-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```

### Cart Store - Carrito POS

```typescript
interface CartState {
  items: CartItem[];
  customer: CustomerData | null;
  
  // Cálculos
  subtotal: number;
  taxAmount: number;
  total: number;
  
  // Acciones
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  applyDiscount: (productId: number, discount: number) => void;
  setCustomer: (customer: CustomerData) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  
  // Getters calculados
  get subtotal() {
    return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
  },
  
  get taxAmount() {
    return get().subtotal * 0.21; // IVA 21%
  },
  
  get total() {
    return get().subtotal + get().taxAmount;
  },
  
  // Agregar producto al carrito
  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existingItem = items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Actualizar cantidad
      set({
        items: items.map(item =>
          item.product.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitPrice
              }
            : item
        )
      });
    } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        product,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        discount: 0
      };
      
      set({ items: [...items, newItem] });
    }
  },
  
  // Otras acciones...
  removeItem: (productId) => {
    set({
      items: get().items.filter(item => item.product.id !== productId)
    });
  },
  
  clear: () => {
    set({ 
      items: [], 
      customer: null 
    });
  }
}));
```

## Autenticación y Rutas

### Middleware de Autenticación

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const isAuthPage = request.nextUrl.pathname === '/';
  const isProtectedRoute = !isAuthPage;
  
  // Redirigir a login si no está autenticado
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirigir al dashboard si ya está autenticado
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Hook de Autenticación

```typescript
export function useAuth() {
  const { 
    user, 
    token, 
    isAuthenticated, 
    login, 
    logout 
  } = useAuthStore();
  
  // Verificar permisos para módulos
  const canAccessModule = (module: string): boolean => {
    if (!user) return false;
    
    const permissions = {
      [UserRole.ADMIN]: ['pos', 'inventory', 'reports', 'users', 'settings', 'ecommerce', 'branches'],
      [UserRole.MANAGER]: ['pos', 'inventory', 'reports', 'users', 'ecommerce'],
      [UserRole.SELLER]: ['pos'],
      [UserRole.ECOMMERCE]: ['reports', 'ecommerce']
    };
    
    return permissions[user.role]?.includes(module) ?? false;
  };
  
  // Auto-renovar token
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      useAuthStore.getState().refreshToken();
    }, 15 * 60 * 1000); // Cada 15 minutos
    
    return () => clearInterval(interval);
  }, [token]);
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
    canAccessModule
  };
}
```

## API Client

### Cliente HTTP Configurado

```typescript
// lib/api.ts
import axios from 'axios';

// Crear instancia de axios
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para desarrollo
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} - ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    // Manejar error 401 (no autorizado)
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Servicios API específicos
export const authApi = {
  login: (credentials: LoginCredentials) => 
    apiClient.post('/auth/login-json', credentials),
  
  refreshToken: (token: string) =>
    apiClient.post('/auth/refresh', { token }),
  
  getCurrentUser: () =>
    apiClient.get('/auth/me')
};

export const productsApi = {
  getAll: (params?: SearchFilters) =>
    apiClient.get('/products', { params }),
  
  getById: (id: number) =>
    apiClient.get(`/products/${id}`),
  
  create: (product: CreateProductData) =>
    apiClient.post('/products', product),
  
  update: (id: number, product: UpdateProductData) =>
    apiClient.put(`/products/${id}`, product),
  
  delete: (id: number) =>
    apiClient.delete(`/products/${id}`),
  
  searchByBarcode: (barcode: string) =>
    apiClient.get(`/products/barcode/${barcode}`)
};

export const salesApi = {
  getAll: (params?: SearchFilters) =>
    apiClient.get('/sales', { params }),
  
  create: (sale: CreateSaleData) =>
    apiClient.post('/sales', sale),
  
  getDashboardStats: () =>
    apiClient.get('/sales/reports/dashboard')
};
```

## WebSockets y Tiempo Real

### Cliente WebSocket

```typescript
// lib/websocket.ts
export function usePOSWebSocket(branchId: number, token: string, enabled: boolean = true) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (!enabled || !token || !branchId) return;
    
    // Crear conexión WebSocket
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/pos_${branchId}/${branchId}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
      
      // Enviar token de autenticación
      ws.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'notification':
            setNotifications(prev => [data.payload, ...prev]);
            
            // Mostrar toast notification
            toast.info(data.payload.message, {
              duration: 5000,
              icon: getNotificationIcon(data.payload.type)
            });
            break;
            
          case 'inventory_update':
            // Actualizar estado de productos
            queryClient.invalidateQueries(['products']);
            break;
            
          case 'new_sale':
            // Actualizar estadísticas en tiempo real
            queryClient.invalidateQueries(['dashboard-stats']);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('❌ WebSocket desconectado');
      setIsConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsConnected(false);
    };
    
    setSocket(ws);
    
    // Cleanup
    return () => {
      ws.close();
    };
  }, [branchId, token, enabled]);
  
  // Funciones de utilidad
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    isConnected,
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications
  };
}
```

## Testing y Calidad

### Configuración Jest

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
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
};

module.exports = createJestConfig(customJestConfig);
```

### Test de Componente

```typescript
// __tests__/components/FloatingCart.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useCartStore } from '@/stores/cart';
import FloatingCart from '@/components/FloatingCart';

// Mock del store
jest.mock('@/stores/cart');
const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>;

describe('FloatingCart', () => {
  beforeEach(() => {
    mockUseCartStore.mockReturnValue({
      items: [],
      total: 0,
      addItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    });
  });

  it('renders cart button with correct item count', () => {
    mockUseCartStore.mockReturnValue({
      items: [{ id: 1, name: 'Test Product' }],
      total: 100,
      addItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    });

    render(<FloatingCart />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens cart modal when button is clicked', () => {
    render(<FloatingCart />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Carrito de Compras')).toBeInTheDocument();
  });
});
```

### Test E2E con Cypress

```typescript
// cypress/e2e/pos.cy.ts
describe('POS Workflow', () => {
  beforeEach(() => {
    // Login como seller
    cy.login('seller', 'seller123');
    cy.visit('/pos');
  });

  it('should complete a sale workflow', () => {
    // Buscar producto por código de barras
    cy.get('[data-cy=barcode-input]').type('1234567890');
    cy.get('[data-cy=search-button]').click();
    
    // Verificar que el producto se agregó al carrito
    cy.get('[data-cy=cart-items]').should('contain', 'Producto Test');
    
    // Abrir carrito y proceder al checkout
    cy.get('[data-cy=cart-button]').click();
    cy.get('[data-cy=checkout-button]').click();
    
    // Llenar datos del cliente
    cy.get('[data-cy=customer-name]').type('Cliente Test');
    cy.get('[data-cy=customer-email]').type('test@example.com');
    
    // Seleccionar método de pago
    cy.get('[data-cy=payment-cash]').click();
    
    // Confirmar venta
    cy.get('[data-cy=confirm-sale]').click();
    
    // Verificar confirmación
    cy.get('[data-cy=sale-success]').should('be.visible');
    cy.get('[data-cy=sale-number]').should('contain', 'RC');
  });

  it('should handle barcode scanner', () => {
    // Activar escáner
    cy.get('[data-cy=scanner-toggle]').click();
    
    // Simular escaneo de código
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('barcode-scanned', {
        detail: '1234567890'
      }));
    });
    
    // Verificar que el producto se agregó
    cy.get('[data-cy=cart-items]').should('not.be.empty');
  });
});
```

### Auditoría de Performance con Lighthouse

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/pos',
      ],
      startServerCommand: 'npm run build && npm run start',
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## Conclusiones

El frontend administrativo de POS Cesariel implementa una interfaz moderna y robusta que proporciona:

- ✅ **Experiencia de Usuario**: Interface intuitiva optimizada para productividad
- ✅ **Performance**: Carga rápida y renderizado optimizado 
- ✅ **Tiempo Real**: Notificaciones instantáneas vía WebSockets
- ✅ **Responsiveness**: Adaptable a tablets y escritorio
- ✅ **Accesibilidad**: Cumplimiento con estándares WCAG
- ✅ **Calidad**: Suite completa de testing automatizado
- ✅ **Mantenibilidad**: Código TypeScript bien estructurado

Esta documentación técnica facilita el entendimiento, mantenimiento y presentación académica del frontend administrativo del sistema POS Cesariel.