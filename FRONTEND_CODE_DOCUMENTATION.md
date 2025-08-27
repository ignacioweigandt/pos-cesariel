# Documentación Completa del Frontend - POS Cesariel

## Tabla de Contenidos
1. [Introducción y Arquitectura General](#introducción-y-arquitectura-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
4. [Páginas Principales](#páginas-principales)
5. [Componentes Reutilizables](#componentes-reutilizables)
6. [Utilidades y Servicios](#utilidades-y-servicios)
7. [Sistema de Autenticación](#sistema-de-autenticación)
8. [Gestión de Estado](#gestión-de-estado)
9. [Integración con Backend](#integración-con-backend)

## Introducción y Arquitectura General

El frontend de POS Cesariel es una aplicación web moderna construida con **Next.js 15** y **React 19**, diseñada como una Single Page Application (SPA) con múltiples módulos para la gestión completa de un punto de venta. La aplicación utiliza el App Router de Next.js para el manejo de rutas y está optimizada para funcionar tanto en desktop como en dispositivos móviles.

### Características Principales:
- **Interfaz de Usuario Responsiva**: Adaptable a diferentes tamaños de pantalla
- **Navegación por Teclado**: Optimizada para uso rápido en POS
- **Tiempo Real**: WebSockets para actualizaciones instantáneas
- **Gestión de Roles**: Sistema de permisos basado en roles de usuario
- **Integración E-commerce**: Conexión directa con tienda online
- **Escáner de Códigos de Barras**: Soporte nativo para lectores láser

### Arquitectura de Componentes:
```
frontend/pos-cesariel/
├── app/                    # App Router (Next.js 15)
├── components/             # Componentes reutilizables
├── lib/                    # Utilidades y servicios
├── hooks/                  # Hooks personalizados
├── types/                  # Definiciones TypeScript
└── utils/                  # Funciones auxiliares
```

## Estructura de Archivos

### Estructura Completa del Proyecto:
```
pos-cesariel/frontend/pos-cesariel/
├── app/                          # Páginas principales (App Router)
│   ├── layout.tsx               # Layout principal con navegación
│   ├── page.tsx                 # Página de login
│   ├── dashboard/page.tsx       # Panel principal del sistema
│   ├── pos/page.tsx            # Interfaz de punto de venta
│   ├── inventory/page.tsx       # Gestión de inventario
│   ├── reports/page.tsx         # Reportes y analytics
│   ├── users/page.tsx          # Gestión de usuarios
│   ├── settings/page.tsx        # Configuraciones del sistema
│   └── ecommerce/page.tsx      # Gestión e-commerce
├── components/                   # Componentes reutilizables
│   ├── FloatingCart.tsx        # Carrito flotante del POS
│   ├── Layout.tsx              # Layout con sidebar
│   ├── NotificationCenter.tsx   # Centro de notificaciones
│   ├── SaleConfirmation.tsx    # Modal de confirmación de venta
│   ├── ImportModal.tsx         # Modal para importar productos
│   └── [otros componentes]
├── lib/                         # Utilidades principales
│   ├── api.ts                  # Cliente API con Axios
│   ├── auth.ts                 # Sistema de autenticación
│   ├── websocket.ts            # Manager de WebSockets
│   └── useBarcodeScanner.ts    # Hook para escáner
├── __tests__/                   # Suite de pruebas
├── cypress/                     # Pruebas E2E
└── package.json                 # Dependencias y scripts
```

## Tecnologías y Dependencias

### Dependencias Principales (package.json):
```json
{
  "dependencies": {
    "next": "15.3.5",              // Framework React con App Router
    "react": "^19.0.0",            // Biblioteca principal
    "react-dom": "^19.0.0",        // DOM renderer
    "typescript": "^5",            // Tipado estático
    "tailwindcss": "^4",           // Framework CSS
    "@headlessui/react": "^1.7.17", // Componentes UI accesibles
    "@heroicons/react": "^2.2.0",   // Iconos SVG
    "axios": "^1.10.0",            // Cliente HTTP
    "zustand": "^4.5.7",           // Gestión de estado
    "react-hot-toast": "^2.5.2",   // Notificaciones toast
    "recharts": "^2.15.4",         // Gráficos y charts
    "date-fns": "^2.30.0"          // Manipulación de fechas
  }
}
```

### Herramientas de Desarrollo:
- **Testing**: Jest + React Testing Library + Cypress
- **Linting**: ESLint + Next.js config
- **Performance**: Lighthouse + Artillery (load testing)
- **Build**: Next.js con Turbopack para desarrollo

## Páginas Principales

### 1. Layout Principal (`app/layout.tsx`)

**Propósito**: Define la estructura HTML base y metadatos de la aplicación.

```typescript
// frontend/pos-cesariel/app/layout.tsx:4-21
export const metadata: Metadata = {
  title: "POS Cesariel",
  description: "Sistema de punto de venta multisucursal con e-commerce integrado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
```

**Características**:
- Configuración de idioma español
- Metadatos SEO optimizados
- Estilos base con Tailwind CSS

### 2. Página de Login (`app/page.tsx`)

**Propósito**: Autenticación de usuarios con manejo de errores y estados de carga.

**Funcionalidades Principales**:
- **Autenticación JWT**: Integración con backend FastAPI
- **Validación de Formularios**: Control de inputs y errores
- **Redirección Inteligente**: Verificación de tokens existentes
- **Usuarios de Prueba**: Información visual de credenciales de demo

**Código Clave**:
```typescript
// frontend/pos-cesariel/app/page.tsx:37-86
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Get user info
      const userResponse = await fetch('http://localhost:8000/users/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // Use the Zustand login method to update the store
        login(data.access_token, userData);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError('Error al obtener información del usuario');
      }
    } else {
      const errorData = await response.json();
      setError(errorData.detail || 'Usuario o contraseña incorrectos');
    }
  } catch (error) {
    setError('Error de conexión. Verifica que el backend esté funcionando en http://localhost:8000');
  } finally {
    setIsLoading(false);
  }
};
```

**Estados Manejados**:
- `username`, `password`: Credenciales del usuario
- `showPassword`: Toggle para mostrar/ocultar contraseña
- `isLoading`: Estado de carga durante autenticación
- `error`: Mensajes de error específicos
- `mounted`: Control de hidratación SSR

### 3. Dashboard (`app/dashboard/page.tsx`)

**Propósito**: Panel principal que muestra estadísticas del negocio y navegación a módulos.

**Funcionalidades Principales**:
- **Estadísticas en Tiempo Real**: Ventas del día, mes, inventario
- **Navegación Modular**: Acceso rápido a todas las funciones
- **WebSocket Integration**: Actualizaciones automáticas de datos
- **Control de Acceso**: Verificación de permisos por rol

**Componentes Clave**:

```typescript
// frontend/pos-cesariel/app/dashboard/page.tsx:118-155
const statCards = [
  {
    name: 'Ventas Hoy',
    value: `$${Number(stats?.total_sales_today || 0).toFixed(2)}`,
    icon: CurrencyDollarIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Ventas del Mes',
    value: `$${Number(stats?.total_sales_month || 0).toFixed(2)}`,
    icon: ChartBarIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Productos Totales',
    value: Number(stats?.total_products || 0),
    icon: CubeIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Stock Bajo',
    value: Number(stats?.low_stock_products || 0),
    icon: ExclamationTriangleIcon,
    color: 'bg-yellow-500',
  }
];
```

**Gestión de Estados**:
- `stats`: Estadísticas del dashboard
- `loading`: Estado de carga de datos
- `mounted`: Control de hidratación
- `lastMessage`: Mensajes de WebSocket

### 4. POS - Punto de Venta (`app/pos/page.tsx`)

**Propósito**: Interfaz principal para procesamiento de ventas con funcionalidades avanzadas.

**Funcionalidades Principales**:
- **Búsqueda de Productos**: Por nombre, SKU o código de barras
- **Gestión de Carrito**: Agregar, modificar, eliminar productos
- **Escáner de Códigos**: Integración con lectores láser
- **Navegación por Teclado**: Optimizada para uso rápido
- **Gestión de Talles**: Para productos de indumentaria
- **Carrito Flotante**: Modal avanzado para checkout

**Lógica de Escáner de Código de Barras**:
```typescript
// frontend/pos-cesariel/app/pos/page.tsx:82-134
const handleBarcodeDetected = useCallback(async (barcode: string) => {
  try {
    const token = localStorage.getItem('token');
    
    // Search for product by barcode
    const response = await fetch(`http://localhost:8000/products/barcode/${barcode}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const product = await response.json();
      
      // Add to cart logic
      if (product.stock_quantity <= 0) {
        toast.error('Producto sin stock');
        return;
      }

      const existingItem = cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toast.error('No hay suficiente stock');
          return;
        }
        
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, {
          id: Date.now(),
          product,
          quantity: 1,
          price: Number(product.price)
        }]);
      }

      toast.success(`📦 Producto encontrado: ${product.name}`);
    } else if (response.status === 404) {
      toast.error(`❌ No se encontró producto con código: ${barcode}`);
    } else {
      toast.error('Error al buscar el producto');
    }
  } catch (error) {
    console.error('Error searching product by barcode:', error);
    toast.error('Error de conexión al buscar el producto');
  }
}, [cart]);
```

**Gestión de Productos con Talles**:
```typescript
// frontend/pos-cesariel/app/pos/page.tsx:350-386
const addToCartWithSize = (product: Product, size: string) => {
  // Check if there's already an item with the same product and size
  const existingItem = cart.find(item => 
    item.product.id === product.id && item.size === size
  );
  
  // Get available stock for this size
  const sizeStock = availableSizes.find(s => s.size === size);
  if (!sizeStock) {
    toast.error(`Talle ${size} no disponible`);
    return;
  }
  
  if (existingItem) {
    if (existingItem.quantity >= sizeStock.stock_quantity) {
      toast.error(`No hay suficiente stock para talle ${size}`);
      return;
    }
    
    setCart(cart.map(item =>
      item.product.id === product.id && item.size === size
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  } else {
    setCart([...cart, {
      id: Date.now(),
      product,
      quantity: 1,
      price: Number(product.price),
      size: size
    }]);
  }

  toast.success(`${product.name} talle ${size} agregado al carrito`);
  setShowSizeModal(false);
};
```

**Procesamiento de Ventas**:
```typescript
// frontend/pos-cesariel/app/pos/page.tsx:443-546
const processSale = async (paymentData: any) => {
  if (cart.length === 0) {
    toast.error('El carrito está vacío');
    return;
  }

  setProcessingPayment(true);

  try {
    const saleData = {
      sale_type: "POS",
      payment_method: paymentData.payment_method,
      order_status: "PENDING",
      branch_id: user?.branch_id || 1,
      items: cart.map(item => {
        const itemData: any = {
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: Number(item.price)
        };
        
        if (item.size) {
          itemData.size = item.size;
        }
        
        return itemData;
      })
    };

    const response = await fetch('http://localhost:8000/sales/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(saleData)
    });

    if (response.ok) {
      const saleResult = await response.json();
      
      // Show success and clear cart
      toast.success(`🎉 Venta #${saleResult.id} completada exitosamente!`);
      setLastSaleData(saleConfirmationData);
      setShowSaleConfirmation(true);
      
      clearCart();
      setShowFloatingCart(false);
      fetchProducts(token!);
    } else {
      // Error handling
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        error = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      toast.error(`❌ Error al procesar la venta: ${error.detail || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error processing sale:', error);
    toast.error('Error de conexión al procesar la venta');
  } finally {
    setProcessingPayment(false);
  }
};
```

### 5. Inventario (`app/inventory/page.tsx`)

**Propósito**: Gestión completa de productos, categorías y stock con funcionalidades avanzadas.

**Funcionalidades Principales**:
- **CRUD de Productos**: Crear, leer, actualizar, eliminar
- **Gestión de Categorías**: Organización de productos
- **Ajuste de Stock**: Con trazabilidad de movimientos
- **Importación Masiva**: CSV/Excel con validación
- **Vista Multi-Sucursal**: Stock por sucursal
- **Búsqueda y Filtros**: Por nombre, SKU, categoría, stock

**Sistema de Filtros**:
```typescript
// frontend/pos-cesariel/app/inventory/page.tsx:542-552
const filteredProducts = products.filter(product => {
  const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.sku.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory === 'all' || 
                         product.category_id?.toString() === selectedCategory;
  const matchesStock = stockFilter === 'all' ||
                      (stockFilter === 'low' && product.stock_quantity <= product.min_stock && product.stock_quantity > 0) ||
                      (stockFilter === 'out' && product.stock_quantity === 0);
  
  return matchesSearch && matchesCategory && matchesStock;
});
```

**Gestión de Productos**:
```typescript
// frontend/pos-cesariel/app/inventory/page.tsx:423-457
const handleProductSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!token) return;
  
  setIsSubmitting(true);
  try {
    const productData = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      sku: productForm.sku,
      stock_quantity: parseInt(productForm.stock_quantity),
      min_stock: parseInt(productForm.min_stock),
      category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
      has_sizes: productForm.has_sizes
    };

    if (editingProduct) {
      await api.put(`/products/${editingProduct.id}`, productData);
    } else {
      await api.post('/products/', productData);
    }

    await fetchProducts();
    setShowProductModal(false);
    resetProductForm();
    alert(editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
  } catch (error: any) {
    console.error('Error submitting product:', error);
    const errorMessage = error.response?.data?.detail || error.message || 'Error de conexión';
    alert(`Error: ${errorMessage}`);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 6. Reportes (`app/reports/page.tsx`)

**Propósito**: Analytics y reportes visuales del negocio con gráficos interactivos.

**Funcionalidades Principales**:
- **Dashboard de Métricas**: KPIs principales del negocio
- **Gráficos Interactivos**: Recharts con múltiples tipos de visualización
- **Filtros de Fecha**: Reportes por períodos personalizados
- **Exportación CSV**: Descarga de datos para análisis externo
- **Reportes por Sucursal**: Para administradores

**Componentes de Gráficos**:
```typescript
// frontend/pos-cesariel/app/reports/page.tsx:515-547
{/* Daily Sales Chart */}
<div className="bg-white shadow rounded-lg">
  <div className="px-4 py-5 sm:p-6">
    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
      Ventas Diarias
    </h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dailySalesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Ventas']}
          />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
```

**Exportación de Datos**:
```typescript
// frontend/pos-cesariel/app/reports/page.tsx:283-306
const exportToCSV = () => {
  if (!salesReport) return;
  
  const csvContent = [
    ['Reporte de Ventas'],
    ['Período', salesReport.period],
    [''],
    ['Resumen'],
    ['Total Ventas', salesReport.total_sales],
    ['Total Transacciones', salesReport.total_transactions],
    ['Venta Promedio', salesReport.average_sale],
    [''],
    ['Productos Más Vendidos'],
    ['Producto', 'Cantidad', 'Ingresos'],
    ...salesReport.top_products.map(p => [p.name, p.quantity, p.revenue])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-ventas-${startDate}-${endDate}.csv`;
  a.click();
};
```

### 7. Usuarios (`app/users/page.tsx`)

**Propósito**: Administración de usuarios, roles y sucursales del sistema.

**Funcionalidades Principales**:
- **Gestión de Usuarios**: CRUD completo con validaciones
- **Sistema de Roles**: Admin, Manager, Seller, E-commerce
- **Gestión de Sucursales**: Asignación y configuración
- **Seguridad**: Validación de permisos y encriptación

**Validación de Formularios**:
```typescript
// frontend/pos-cesariel/app/users/page.tsx:170-197
const validateUserForm = (): boolean => {
  const errors: {[key: string]: string} = {};
  
  if (!userFormData.full_name.trim()) {
    errors.full_name = 'El nombre completo es requerido';
  }
  
  if (!userFormData.username.trim()) {
    errors.username = 'El nombre de usuario es requerido';
  } else if (userFormData.username.length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
  }
  
  if (!userFormData.email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!/\S+@\S+\.\S+/.test(userFormData.email)) {
    errors.email = 'El email no es válido';
  }
  
  if (!selectedUser && !userFormData.password) {
    errors.password = 'La contraseña es requerida';
  } else if (userFormData.password && userFormData.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
```

**Sistema de Roles**:
```typescript
// frontend/pos-cesariel/app/users/page.tsx:1026-1097
const roles = [
  {
    name: 'Administrador',
    key: 'admin',
    description: 'Acceso completo a todas las funcionalidades del sistema',
    permissions: ['Gestión de usuarios', 'Configuración del sistema', 'Reportes avanzados', 'Todas las sucursales'],
    color: 'bg-red-100 text-red-800'
  },
  {
    name: 'Gerente',
    key: 'manager', 
    description: 'Gestión de inventario, usuarios y reportes de sucursal',
    permissions: ['Gestión de inventario', 'Gestión de usuarios', 'Reportes de sucursal', 'Configuración básica'],
    color: 'bg-blue-100 text-blue-800'
  },
  {
    name: 'Vendedor',
    key: 'seller',
    description: 'Operaciones de venta y consulta de inventario',
    permissions: ['Ventas POS', 'Consulta de inventario', 'Reportes básicos'],
    color: 'bg-green-100 text-green-800'
  },
  {
    name: 'E-commerce',
    key: 'ecommerce',
    description: 'Gestión específica de la tienda online',
    permissions: ['Gestión E-commerce', 'Pedidos online', 'Productos online'],
    color: 'bg-purple-100 text-purple-800'
  }
];
```

### 8. Configuraciones (`app/settings/page.tsx`)

**Propósito**: Centro de configuración del sistema con acceso controlado por permisos.

**Funcionalidades Principales**:
- **Configuración de Pagos**: Métodos y comisiones
- **Gestión de Moneda**: Formato y tipo de moneda
- **Impuestos**: Configuración de tasas
- **Notificaciones**: Alertas del sistema
- **Seguridad y Backups**: Protección de datos

**Secciones de Configuración**:
```typescript
// frontend/pos-cesariel/app/settings/page.tsx:32-73
const configSections: ConfigSection[] = [
  {
    id: 'payment',
    title: 'Métodos de Pago',
    description: 'Configurar formas de pago, tarjetas y comisiones',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500',
    path: '/settings/payment-methods',
  },
  {
    id: 'currency',
    title: 'Configurar la Moneda',
    description: 'Definir la moneda principal y formato de precios',
    icon: CurrencyDollarIcon,
    color: 'bg-blue-500',
    path: '/settings/currency',
  },
  {
    id: 'taxes',
    title: 'Impuestos',
    description: 'Configurar tasas de impuestos y tributos',
    icon: Cog6ToothIcon,
    color: 'bg-yellow-500',
    path: '/settings/tax-rates',
  }
];
```

### 9. E-commerce (`app/ecommerce/page.tsx`)

**Propósito**: Gestión de la integración con la tienda online y pedidos digitales.

**Funcionalidades Principales**:
- **Gestión de Productos Online**: Visibilidad en e-commerce
- **Pedidos Digitales**: Procesamiento de ventas online
- **Integración WhatsApp**: Comunicación con clientes
- **Banners y Promociones**: Gestión de contenido visual

## Componentes Reutilizables

### 1. FloatingCart (`components/FloatingCart.tsx`)

**Propósito**: Carrito de compras modal con navegación por teclado y múltiples métodos de pago.

**Características Avanzadas**:
- **Navegación por Teclado**: Completa navegación con flechas y Enter
- **Métodos de Pago**: Efectivo, tarjeta, transferencia
- **Gestión de Cuotas**: Para tarjetas bancarizadas
- **Cálculo de Recargos**: Automático según configuración
- **Validación de Stock**: En tiempo real

**Navegación por Teclado**:
```typescript
// frontend/pos-cesariel/components/FloatingCart.tsx:116-301
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();

    switch (e.key) {
      case 'Escape':
        // ESC inteligente: navegar hacia atrás en los pasos
        if (currentSection === 'payment') {
          if (paymentStep === 'confirm') {
            setPaymentStep(selectedPayment === 'tarjeta' ? 'card_details' : 'method');
          } else if (paymentStep === 'card_details') {
            if (cardDetailStep === 'installments') {
              setCardDetailStep('type');
            } else {
              setPaymentStep('method');
            }
          } else {
            setCurrentSection('items');
          }
        } else {
          onClose();
        }
        break;
      
      case 'ArrowUp':
        if (currentSection === 'items') {
          setSelectedIndex(Math.max(0, selectedIndex - 1));
        }
        break;
      
      case 'ArrowDown':
        if (currentSection === 'items') {
          setSelectedIndex(Math.min(cart.length + 1, selectedIndex + 1));
        }
        break;
        
      // ... más casos de navegación
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, selectedIndex, currentSection, /* otras dependencias */]);
```

**Cálculo de Totales**:
```typescript
// frontend/pos-cesariel/components/FloatingCart.tsx:90-110
const calculateTotals = () => {
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  
  let surchargePercentage = 0;
  if (selectedPayment === 'tarjeta') {
    const config = paymentConfigs.find(c => 
      c.payment_type === 'tarjeta' && 
      c.card_type === selectedCardType && 
      c.installments === selectedInstallments
    );
    if (config) {
      surchargePercentage = Number(config.surcharge_percentage);
    }
  }
  
  const surcharge = subtotal * (surchargePercentage / 100);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + surcharge + tax;

  return { subtotal, surcharge, tax, total, surchargePercentage };
};
```

### 2. Layout (`components/Layout.tsx`)

**Propósito**: Layout principal con sidebar, navegación y sistema de notificaciones.

**Funcionalidades**:
- **Sidebar Responsivo**: Adaptable a móviles y desktop
- **Sistema de Navegación**: Con control de permisos
- **WebSocket Status**: Indicador de conexión en tiempo real
- **Centro de Notificaciones**: Integrado en la barra superior

**Sistema de Navegación**:
```typescript
// frontend/pos-cesariel/components/Layout.tsx:22-30
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, module: 'pos' },
  { name: 'POS-Ventas', href: '/pos', icon: ShoppingCartIcon, module: 'pos' },
  { name: 'Inventario', href: '/inventory', icon: CubeIcon, module: 'inventory' },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon, module: 'reports' },
  { name: 'E-commerce', href: '/ecommerce', icon: ComputerDesktopIcon, module: 'ecommerce' },
  { name: 'Usuarios', href: '/users', icon: UsersIcon, module: 'users' },
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon, module: 'settings' },
];
```

**Control de Permisos**:
```typescript
// frontend/pos-cesariel/components/Layout.tsx:55-57
const filteredNavigation = navigation.filter(item => 
  canAccessModule(user, item.module)
);
```

## Utilidades y Servicios

### 1. Cliente API (`lib/api.ts`)

**Propósito**: Cliente HTTP centralizado con interceptores para autenticación y manejo de errores.

**Configuración Base**:
```typescript
// frontend/pos-cesariel/lib/api.ts:6-12
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Interceptor de Request**:
```typescript
// frontend/pos-cesariel/lib/api.ts:24-35
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Interceptor de Response**:
```typescript
// frontend/pos-cesariel/lib/api.ts:38-54
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if we're not already there
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
```

**APIs Organizadas**:
- `authApi`: Autenticación y gestión de usuarios
- `productsApi`: CRUD de productos e inventario
- `categoriesApi`: Gestión de categorías
- `salesApi`: Procesamiento de ventas y reportes
- `branchesApi`: Gestión de sucursales
- `usersApi`: Administración de usuarios
- `configApi`: Configuraciones del sistema
- `ecommerceAdvancedApi`: Funciones avanzadas de e-commerce
- `ecommercePublicApi`: API pública para e-commerce

### 2. Sistema de Autenticación (`lib/auth.ts`)

**Propósito**: Gestión de estado de autenticación con Zustand y control de permisos.

**Store de Autenticación**:
```typescript
// frontend/pos-cesariel/lib/auth.ts:32-54
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },
      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

**Sistema de Permisos**:
```typescript
// frontend/pos-cesariel/lib/auth.ts:76-89
export const canAccessModule = (user: User | null, module: string): boolean => {
  if (!user) return false;
  
  const modulePermissions = {
    pos: ['admin', 'manager', 'seller', 'ADMIN', 'MANAGER', 'SELLER'],
    inventory: ['admin', 'manager', 'ADMIN', 'MANAGER'],
    reports: ['admin', 'manager', 'ADMIN', 'MANAGER'],
    ecommerce: ['admin', 'manager', 'ecommerce', 'ADMIN', 'MANAGER', 'ECOMMERCE'],
    users: ['admin', 'manager', 'ADMIN', 'MANAGER'],
    settings: ['admin', 'manager', 'ADMIN', 'MANAGER'],
  };
  
  return modulePermissions[module]?.includes(user.role) || false;
};
```

### 3. Hook de Escáner de Códigos (`lib/useBarcodeScanner.ts`)

**Propósito**: Hook personalizado para manejo de escáneres láser de códigos de barras.

**Funcionalidades**:
- **Buffer de Entrada**: Acumula caracteres rápidos del escáner
- **Detección Automática**: Identifica entrada de escáner vs. teclado manual
- **Timeout Configurable**: Maneja diferentes velocidades de escáner
- **Callback de Detección**: Ejecuta función cuando detecta código completo

### 4. WebSocket Manager (`lib/websocket.ts`)

**Propósito**: Gestión de conexiones WebSocket para actualizaciones en tiempo real.

**Funcionalidades**:
- **Conexión Automática**: Establece y mantiene conexión WebSocket
- **Reconexión Automática**: Maneja desconexiones de red
- **Gestión de Notificaciones**: Sistema de notificaciones en tiempo real
- **Estado de Conexión**: Indicador visual de estado

## Sistema de Autenticación

### Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales
2. **Validación Backend**: FastAPI valida y retorna JWT
3. **Almacenamiento**: Token se guarda en localStorage y Zustand
4. **Interceptores**: Axios agrega automáticamente token a requests
5. **Verificación**: Backend valida token en cada request protegido
6. **Renovación**: Manejo automático de expiración de tokens

### Control de Acceso

El sistema implementa control de acceso basado en roles:

```typescript
// Jerarquía de roles
admin > manager > seller > ecommerce
```

**Permisos por Módulo**:
- **POS**: Admin, Manager, Seller
- **Inventario**: Admin, Manager
- **Reportes**: Admin, Manager  
- **E-commerce**: Admin, Manager, E-commerce
- **Usuarios**: Admin, Manager
- **Configuración**: Admin, Manager

## Gestión de Estado

### Zustand para Estado Global

- **Autenticación**: Token y datos de usuario
- **Persistencia**: LocalStorage con middleware persist
- **Reactividad**: Actualizaciones automáticas en componentes

### Estado Local por Componente

- **React Hooks**: useState, useEffect, useCallback
- **Formularios**: Estado controlado con validación
- **Loading States**: Indicadores de carga y procesamiento

## Integración con Backend

### Comunicación HTTP

- **Axios Client**: Configuración centralizada
- **Base URL**: http://localhost:8000
- **Timeout**: 10 segundos
- **Interceptores**: Autenticación automática y manejo de errores

### WebSocket Integration

- **URL**: ws://localhost:8000/ws/{branch_id}
- **Notificaciones**: Tiempo real para inventario y ventas
- **Estado de Conexión**: Indicador visual
- **Reconexión**: Automática en caso de desconexión

### Tipos de Datos

**Interfaces TypeScript** definidas para:
- User, Branch, Product, Category
- Sale, SaleItem, CartItem
- PaymentConfig, DashboardStats
- WebSocket Messages, Notifications

## Conclusión

El frontend de POS Cesariel es una aplicación web moderna y robusta que combina las mejores prácticas de desarrollo con React/Next.js. Su arquitectura modular, sistema de permisos granular, y funcionalidades avanzadas como navegación por teclado y escáner de códigos de barras lo convierten en una solución completa para puntos de venta.

La integración con WebSockets, el manejo inteligente de estados y la interfaz responsiva garantizan una experiencia de usuario fluida tanto para vendedores como para administradores del sistema.