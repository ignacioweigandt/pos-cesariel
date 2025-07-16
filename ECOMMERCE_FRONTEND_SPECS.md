# 🛍️ E-commerce Frontend Development Specifications

## 📋 Descripción General

Este documento describe las especificaciones completas para desarrollar el frontend del E-commerce de POS Cesariel. El sistema debe ser una aplicación web moderna que se conecte con el backend existente y proporcione una experiencia de compra fluida para los clientes.

## 🏗️ Arquitectura y Tecnologías

### **Stack Tecnológico**
- **Framework**: Next.js 15 con App Router
- **React**: React 19
- **TypeScript**: Tipado estricto
- **Styling**: TailwindCSS 4.0
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **State Management**: Zustand (para carrito y estado global)
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Forms**: React Hook Form
- **Date Handling**: date-fns

### **Estructura del Proyecto**
```
ecommerce-frontend/
├── app/                     # App Router de Next.js
│   ├── (pages)/            # Grupo de rutas principales
│   │   ├── page.tsx        # Página principal
│   │   ├── productos/      # Catálogo de productos
│   │   ├── categoria/      # Productos por categoría
│   │   ├── producto/       # Detalle de producto
│   │   ├── carrito/        # Carrito de compras
│   │   └── buscar/         # Búsqueda de productos
│   ├── layout.tsx          # Layout principal
│   ├── globals.css         # Estilos globales
│   └── loading.tsx         # Componente de carga
├── components/             # Componentes reutilizables
│   ├── ui/                 # Componentes UI base
│   ├── layout/             # Componentes de layout
│   ├── product/            # Componentes de producto
│   ├── cart/               # Componentes del carrito
│   └── forms/              # Componentes de formularios
├── lib/                    # Utilidades y configuración
│   ├── api.ts              # Cliente API
│   ├── types.ts            # Tipos TypeScript
│   ├── utils.ts            # Funciones utilitarias
│   └── store.ts            # Store de Zustand
├── hooks/                  # Custom hooks
├── public/                 # Archivos estáticos
│   ├── images/             # Imágenes del sitio
│   └── icons/              # Iconos personalizados
└── styles/                 # Estilos adicionales
```

## 🔌 Integración con Backend

### **API Base URL**
```typescript
const API_BASE_URL = 'http://localhost:8000'
```

### **Endpoints Principales a Utilizar**

#### **Productos**
- `GET /products` - Listar productos con filtros
- `GET /products/{id}` - Obtener producto específico
- `GET /products/search` - Buscar productos
- `GET /products/category/{category_id}` - Productos por categoría
- `GET /products/{id}/available-sizes` - Talles disponibles (si aplica)

#### **Categorías**
- `GET /categories` - Listar todas las categorías
- `GET /categories/{id}` - Obtener categoría específica

#### **Configuración de Tienda**
- `GET /config/ecommerce` - Configuración de la tienda
- `GET /config/payment-methods` - Métodos de pago disponibles
- `GET /config/tax-rates` - Tasas de impuestos

#### **Banners y Contenido**
- `GET /ecommerce/banners` - Banners de la tienda
- `GET /ecommerce/store-config` - Configuración de redes sociales

#### **Ventas y WhatsApp**
- `POST /ecommerce/whatsapp-sales` - Crear venta para WhatsApp
- `GET /ecommerce/whatsapp-url` - Generar URL de WhatsApp

#### **Imágenes**
- `GET /ecommerce/products/{id}/images` - Imágenes del producto

### **Tipos de Datos Principales**

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  ecommerce_price?: number;
  sku: string;
  barcode?: string;
  stock_quantity: number;
  show_in_ecommerce: boolean;
  category_id: number;
  category: Category;
  has_sizes: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
  children: Category[];
}

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  order: number;
}

interface StoreBanner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  is_active: boolean;
  order: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  price: number;
}

interface WhatsAppSale {
  customer_name: string;
  customer_whatsapp: string;
  customer_address: string;
  delivery_method: string;
  items: CartItem[];
  total_amount: number;
  notes?: string;
}
```

## 🎨 Páginas y Componentes

### **1. Página Principal (app/page.tsx)**

#### **Características:**
- Hero section con banners principales (hasta 3)
- Productos destacados/más vendidos
- Categorías principales
- Información de la tienda
- Footer con redes sociales y contacto

#### **Componentes:**
```typescript
// components/layout/Header.tsx
- Logo de la tienda
- Menú de navegación
- Buscador
- Carrito (contador de items)
- Menú desplegable de categorías

// components/home/HeroSection.tsx
- Carrusel de banners
- Auto-play con controles
- Responsive design

// components/home/FeaturedProducts.tsx
- Grid de productos destacados
- Lazy loading
- Precio con descuentos

// components/home/CategoriesGrid.tsx
- Grid de categorías principales
- Imágenes representativas
- Contador de productos por categoría

// components/layout/Footer.tsx
- Información de contacto
- Redes sociales
- Políticas de la tienda
```

### **2. Catálogo de Productos (app/productos/page.tsx)**

#### **Características:**
- Lista/grid de todos los productos
- Filtros avanzados (precio, categoría, marca)
- Ordenamiento (precio, nombre, fecha)
- Paginación o scroll infinito
- Búsqueda en tiempo real

#### **Componentes:**
```typescript
// components/product/ProductGrid.tsx
- Grid responsivo de productos
- Lazy loading de imágenes
- Hover effects

// components/product/ProductCard.tsx
- Imagen principal del producto
- Precio con descuentos
- Botón "Agregar al carrito"
- Indicador de stock
- Badge de "Nuevo" o "Oferta"

// components/product/ProductFilters.tsx
- Filtros por precio (slider)
- Filtros por categoría
- Filtros por marca
- Filtros por disponibilidad

// components/product/ProductSort.tsx
- Dropdown de ordenamiento
- Opciones: precio, nombre, fecha, popularidad
```

### **3. Productos por Categoría (app/categoria/[slug]/page.tsx)**

#### **Características:**
- Productos filtrados por categoría específica
- Breadcrumbs de navegación
- Subcategorías si existen
- Mismos filtros que el catálogo general

#### **Componentes:**
```typescript
// components/layout/Breadcrumbs.tsx
- Navegación jerárquica
- Enlaces a categorías padre

// components/category/CategoryHeader.tsx
- Título de la categoría
- Descripción de la categoría
- Contador de productos

// components/category/SubcategoriesNav.tsx
- Navegación entre subcategorías
- Tabs o botones de filtro
```

### **4. Detalle de Producto (app/producto/[id]/page.tsx)**

#### **Características:**
- Galería de imágenes (hasta 3)
- Información detallada del producto
- Selector de talle (si aplica)
- Selector de cantidad
- Botón "Agregar al carrito"
- Productos relacionados
- Información de envío

#### **Componentes:**
```typescript
// components/product/ProductGallery.tsx
- Imagen principal grande
- Thumbnails de imágenes
- Zoom en hover
- Navegación con flechas

// components/product/ProductInfo.tsx
- Nombre del producto
- Precio con descuentos
- Descripción completa
- SKU y información técnica

// components/product/ProductActions.tsx
- Selector de talle (si aplica)
- Selector de cantidad
- Botón "Agregar al carrito"
- Indicador de stock

// components/product/SizeSelector.tsx
- Botones de talles disponibles
- Indicador de stock por talle
- Guía de talles

// components/product/RelatedProducts.tsx
- Carrusel de productos relacionados
- Misma categoría o marca
```

### **5. Carrito de Compras (app/carrito/page.tsx)**

#### **Características:**
- Lista de productos en el carrito
- Modificación de cantidades
- Eliminación de productos
- Cálculo de totales
- Formulario de datos del cliente
- Botón "Finalizar compra" (WhatsApp)

#### **Componentes:**
```typescript
// components/cart/CartSummary.tsx
- Resumen de productos
- Cálculo de subtotal
- Impuestos y recargos
- Total final

// components/cart/CartItem.tsx
- Imagen del producto
- Nombre y detalles
- Selector de cantidad
- Botón eliminar
- Precio por item

// components/cart/CustomerForm.tsx
- Datos del cliente (nombre, WhatsApp, dirección)
- Método de entrega
- Notas adicionales
- Validación de formulario

// components/cart/CheckoutButton.tsx
- Botón para finalizar compra
- Genera URL de WhatsApp
- Manejo de estados de carga
```

### **6. Búsqueda de Productos (app/buscar/page.tsx)**

#### **Características:**
- Resultados de búsqueda
- Filtros aplicados
- Sugerencias de búsqueda
- Búsqueda por voz (opcional)

#### **Componentes:**
```typescript
// components/search/SearchResults.tsx
- Grid de resultados
- Mensaje de "sin resultados"
- Paginación de resultados

// components/search/SearchSuggestions.tsx
- Sugerencias de búsqueda
- Búsquedas populares
- Autocomplete
```

## 🛒 Gestión del Carrito

### **Store de Zustand**
```typescript
// lib/store.ts
interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  
  addItem: (product: Product, quantity: number, size?: string) => void;
  removeItem: (productId: number, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string) => void;
  clearCart: () => void;
  
  // Persistencia en localStorage
  hydrate: () => void;
}
```

### **Funcionalidades del Carrito:**
- Persistencia en localStorage
- Validación de stock en tiempo real
- Cálculo automático de totales
- Soporte para productos con talles
- Sincronización entre pestañas

## 📱 Responsive Design

### **Breakpoints (TailwindCSS)**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Consideraciones Móviles:**
- Menú hamburguesa en mobile
- Carrito como overlay/drawer
- Búsqueda expandible
- Galería de imágenes touch-friendly
- Formularios optimizados para mobile

## 🔍 SEO y Performance

### **Optimización SEO:**
- Metadata dinámico por página
- Open Graph tags
- Structured data para productos
- URLs amigables
- Sitemap automático

### **Performance:**
- Lazy loading de imágenes
- Code splitting por rutas
- Optimización de imágenes (Next.js Image)
- Prefetching de rutas críticas
- Caching de API responses

## 🎯 Flujo de Compra (WhatsApp Integration)

### **Proceso de Compra:**
1. **Selección de productos** → Agregar al carrito
2. **Revisión del carrito** → Modificar cantidades
3. **Datos del cliente** → Formulario de información
4. **Finalizar compra** → Generar mensaje de WhatsApp
5. **Redirección a WhatsApp** → Completar venta con vendedor

### **Mensaje de WhatsApp Generado:**
```typescript
const generateWhatsAppMessage = (sale: WhatsAppSale): string => {
  return `
🛍️ *Nueva Compra - ${storeName}*

👤 *Cliente:* ${sale.customer_name}
📱 *WhatsApp:* ${sale.customer_whatsapp}
📍 *Dirección:* ${sale.customer_address}
🚚 *Entrega:* ${sale.delivery_method}

📦 *Productos:*
${sale.items.map(item => 
  `• ${item.product.name}${item.size ? ` (Talle: ${item.size})` : ''} - Cantidad: ${item.quantity} - $${item.price}`
).join('\n')}

💰 *Total: $${sale.total_amount}*

${sale.notes ? `📝 *Notas:* ${sale.notes}` : ''}

¡Gracias por tu compra! 🎉
  `.trim();
};
```

## 🚀 Configuración Inicial

### **Instalación de Next.js:**
```bash
# Crear nueva aplicación Next.js
npx create-next-app@latest ecommerce-frontend --typescript --tailwind --app --use-pnpm

# Instalar dependencias adicionales
cd ecommerce-frontend
pnpm install @headlessui/react @heroicons/react axios zustand react-hook-form react-hot-toast date-fns
```

### **Configuración de Tailwind (tailwind.config.ts):**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        }
      }
    },
  },
  plugins: [],
}
export default config
```

### **Variables de Entorno (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STORE_NAME=POS Cesariel
NEXT_PUBLIC_WHATSAPP_NUMBER=+5491112345678
```

## 📦 Dependencias Requeridas

### **Principales:**
- `next@15.3.5`
- `react@19.0.0`
- `react-dom@19.0.0`
- `typescript@5`
- `tailwindcss@4`

### **UI y Componentes:**
- `@headlessui/react@1.7.17`
- `@heroicons/react@2.2.0`
- `clsx`
- `tailwind-merge`

### **Estado y Datos:**
- `zustand@4.5.7`
- `axios@1.10.0`
- `react-hook-form@7.59.0`
- `react-hot-toast@2.5.2`

### **Utilidades:**
- `date-fns@2.30.0`
- `react-intersection-observer` (lazy loading)
- `swiper` (carruseles)

## 🔧 Configuración de Desarrollo

### **Scripts de package.json:**
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### **Puerto de Desarrollo:**
- **E-commerce Frontend**: Puerto 3001
- **Backend API**: Puerto 8000 (ya configurado)
- **Admin Frontend**: Puerto 3000 (ya configurado)

## 🎨 Diseño Visual

### **Paleta de Colores:**
- **Primario**: Azul (#3b82f6)
- **Secundario**: Gris (#64748b)
- **Éxito**: Verde (#10b981)
- **Advertencia**: Amarillo (#f59e0b)
- **Error**: Rojo (#ef4444)

### **Tipografía:**
- **Familia**: Inter (Google Fonts)
- **Títulos**: 24px-32px, font-bold
- **Subtítulos**: 18px-20px, font-semibold
- **Texto**: 14px-16px, font-normal

### **Espaciado:**
- **Contenedores**: max-width: 1200px
- **Padding**: 16px (mobile), 24px (tablet), 32px (desktop)
- **Gap**: 16px entre elementos, 24px entre secciones

## 🔒 Seguridad

### **Validación del Frontend:**
- Sanitización de inputs
- Validación de formularios
- Protección XSS
- Validación de archivos subidos

### **Comunicación con Backend:**
- HTTPS en producción
- Headers de seguridad
- Validación de responses
- Manejo de errores

## 📱 PWA (Opcional)

### **Características:**
- Manifest.json
- Service Worker
- Offline support básico
- Installable app
- Push notifications

## 🚀 Deployment

### **Opciones de Hosting:**
- **Vercel** (recomendado para Next.js)
- **Netlify**
- **Docker** (para hosting propio)

### **Configuración de Producción:**
```bash
# Build para producción
pnpm run build

# Configurar variables de entorno de producción
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_STORE_NAME=Tu Tienda
NEXT_PUBLIC_WHATSAPP_NUMBER=+5491112345678
```

## 📋 Checklist de Desarrollo

### **Fase 1: Configuración Inicial**
- [ ] Crear proyecto Next.js
- [ ] Configurar TailwindCSS
- [ ] Instalar dependencias
- [ ] Configurar variables de entorno
- [ ] Crear estructura de carpetas

### **Fase 2: Componentes Base**
- [ ] Layout principal
- [ ] Header con navegación
- [ ] Footer
- [ ] Componentes UI base

### **Fase 3: Gestión de Estado**
- [ ] Store de Zustand
- [ ] API client
- [ ] Tipos TypeScript
- [ ] Hooks personalizados

### **Fase 4: Páginas Principales**
- [ ] Página principal
- [ ] Catálogo de productos
- [ ] Detalle de producto
- [ ] Carrito de compras

### **Fase 5: Funcionalidades Avanzadas**
- [ ] Búsqueda
- [ ] Filtros
- [ ] Integración WhatsApp
- [ ] Responsive design

### **Fase 6: Optimización**
- [ ] SEO
- [ ] Performance
- [ ] Testing
- [ ] Deployment

## 🔄 Próximos Pasos

1. **Crear el proyecto Next.js** en una nueva carpeta
2. **Configurar la conexión con el backend existente**
3. **Desarrollar los componentes base**
4. **Implementar las páginas principales**
5. **Integrar con WhatsApp**
6. **Testing y optimización**
7. **Deployment**

---

**Nota importante**: El backend ya está completamente desarrollado y funcional. Solo necesitas crear el frontend e-commerce siguiendo estas especificaciones para tener un sistema completo de e-commerce integrado con WhatsApp.