# 📁 Estructura Completa del Frontend - POS Cesariel (Admin)

## 🎯 Visión General

El frontend es una aplicación web construida con **Next.js 15** (App Router) + **React 18** + **TypeScript 5**, organizada siguiendo el patrón de **Feature-Based Architecture** con componentes reutilizables y separación de responsabilidades.

**Total de archivos: 305** (excluyendo `node_modules`, `.next`, `coverage`)

---

## 📂 Estructura de Directorios

```
frontend/pos-cesariel/
├── 📄 Archivos de Configuración Raíz (15 archivos)
├── 📁 app/                      # Next.js 15 App Router
│   ├── 📁 components/           # Componentes globales de app
│   ├── 📁 lib/                  # Utilidades específicas de app
│   ├── 📁 settings/             # Módulo de configuraciones (70+ archivos)
│   ├── 📁 users/                # Módulo de usuarios y sucursales
│   └── 📄 Páginas raíz (7 archivos)
├── 📁 features/                 # Feature-Based Architecture (140+ archivos)
│   ├── 📁 configuracion/        # Configuración del sistema
│   ├── 📁 dashboard/            # Dashboard principal
│   ├── 📁 ecommerce/            # Gestión e-commerce
│   ├── 📁 inventory/            # Gestión de inventario
│   ├── 📁 pos/                  # Punto de Venta (POS)
│   ├── 📁 reports/              # Reportes y analytics
│   └── 📁 users/                # Gestión de usuarios
├── 📁 shared/                   # Código compartido (35+ archivos)
│   ├── 📁 api/                  # Clientes API
│   ├── 📁 components/           # Componentes reutilizables
│   ├── 📁 contexts/             # React Contexts
│   ├── 📁 hooks/                # Custom Hooks
│   └── 📁 utils/                # Utilidades compartidas
├── 📁 lib/                      # Librerías y utilidades (9 archivos)
├── 📁 __tests__/                # Tests unitarios (12 archivos)
├── 📁 cypress/                  # Tests E2E (8 archivos)
├── 📁 types/                    # TypeScript type definitions
└── 📁 utils/                    # Utilidades legacy (1 archivo)
```

---

## 📊 Estadísticas del Proyecto

| Categoría | Cantidad |
|-----------|----------|
| **Archivos TypeScript/TSX** | ~270 |
| **Archivos de Configuración** | 15 |
| **Features (módulos)** | 7 |
| **Componentes Shared** | 35+ |
| **Custom Hooks** | 25+ |
| **Páginas (Routes)** | 25+ |
| **Tests** | 20 |
| **Total** | **305** |

---

## 📄 ARCHIVOS DE CONFIGURACIÓN RAÍZ (15 archivos)

### **Next.js y Build**

#### `next.config.js`
- **Ubicación**: `frontend/pos-cesariel/next.config.js`
- **Qué hace**: Configuración principal de Next.js
- **Contenido**:
  - Configuración de imágenes (dominios permitidos para Next Image)
  - Rewrites y redirects
  - Variables de entorno
  - Optimizaciones de build
  - Configuración de Webpack custom
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO - Sin esto Next.js no funciona

#### `next-env.d.ts`
- **Ubicación**: `frontend/pos-cesariel/next-env.d.ts`
- **Qué hace**: Type definitions de Next.js
- **Función**: Generado automáticamente por Next.js
- **⚠️ NO EDITAR**: Next.js lo regenera automáticamente

---

### **TypeScript**

#### `tsconfig.json`
- **Ubicación**: `frontend/pos-cesariel/tsconfig.json`
- **Qué hace**: Configuración de TypeScript
- **Contenido**:
  - Opciones del compilador (strict mode, target ES6)
  - Path aliases: `@/` → raíz del proyecto
  - Configuración de módulos
  - Include/exclude patterns
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO

---

### **Package Management**

#### `package.json`
- **Ubicación**: `frontend/pos-cesariel/package.json`
- **Qué hace**: Dependencias y scripts del proyecto
- **Scripts importantes**:
  - `dev`: Inicia servidor de desarrollo (puerto 3000)
  - `build`: Build de producción
  - `start`: Servidor de producción
  - `lint`: ESLint
  - `test`: Tests con Jest
  - `test:e2e`: Tests E2E con Cypress
- **Dependencias principales**:
  - next: 15.5.9
  - react: 18+
  - typescript: 5+
  - axios: Cliente HTTP
  - zustand: State management
  - @radix-ui: Componentes UI
  - tailwindcss: Estilos
  - heroicons: Íconos
- **Importancia**: ⭐⭐⭐⭐⭐

#### `package-lock.json`
- **Ubicación**: `frontend/pos-cesariel/package-lock.json`
- **Qué hace**: Lock file de dependencias
- **Función**: Asegura versiones exactas de dependencias
- **⚠️ NO EDITAR MANUALMENTE**

---

### **Styling**

#### `postcss.config.mjs`
- **Ubicación**: `frontend/pos-cesariel/postcss.config.mjs`
- **Qué hace**: Configuración de PostCSS
- **Función**: Procesa Tailwind CSS
- **Contenido**: Plugins de tailwindcss y autoprefixer

#### `tailwind.config.ts`
- **Ubicación**: `frontend/pos-cesariel/tailwind.config.ts` (si existe)
- **Qué hace**: Configuración de Tailwind CSS
- **Contenido**:
  - Theme personalizado (colores, fuentes)
  - Content paths
  - Plugins
  - Dark mode config

---

### **Linting**

#### `.eslintrc.json`
- **Ubicación**: `frontend/pos-cesariel/.eslintrc.json`
- **Qué hace**: Configuración de ESLint
- **Función**: Define reglas de linting de código
- **Contenido**:
  - Extends next/core-web-vitals
  - Reglas personalizadas
  - Configuración de TypeScript

---

### **Testing**

#### `jest.config.js`
- **Ubicación**: `frontend/pos-cesariel/jest.config.js`
- **Qué hace**: Configuración de Jest (unit testing)
- **Contenido**:
  - Test environment: jsdom
  - Setup files: jest.setup.js
  - Module name mapping para aliases
  - Coverage thresholds (70%)
  - Transform con babel-jest
- **Importancia**: ⭐⭐⭐⭐

#### `jest.setup.js`
- **Ubicación**: `frontend/pos-cesariel/jest.setup.js`
- **Qué hace**: Setup global de Jest
- **Función**: Configuración antes de correr tests
- **Contenido**:
  - Importa @testing-library/jest-dom
  - Setup de mocks globales
  - Configuración de fetch mock

#### `cypress.config.ts`
- **Ubicación**: `frontend/pos-cesariel/cypress.config.ts`
- **Qué hace**: Configuración de Cypress (E2E testing)
- **Contenido**:
  - Base URL para tests
  - Viewport default
  - Video/screenshot config
  - Timeouts
- **Importancia**: ⭐⭐⭐

---

### **Performance**

#### `lighthouserc.js`
- **Ubicación**: `frontend/pos-cesariel/lighthouserc.js`
- **Qué hace**: Configuración de Lighthouse CI
- **Función**: Tests de performance automáticos
- **Contenido**:
  - Umbrales de performance
  - Configuración de auditorías
  - Paths a auditar

---

### **Deployment**

#### `railway.json`
- **Ubicación**: `frontend/pos-cesariel/railway.json`
- **Qué hace**: Configuración para deploy en Railway
- **Contenido**:
  - Build command
  - Start command
  - Variables de entorno
  - Health checks

#### `Dockerfile`
- **Ubicación**: `frontend/pos-cesariel/Dockerfile`
- **Qué hace**: Imagen Docker para producción
- **Contenido**:
  - Multi-stage build
  - Node 18+ Alpine
  - npm install y build
  - Expone puerto 3000
  - CMD: npm start

---

### **Middleware**

#### `middleware.ts`
- **Ubicación**: `frontend/pos-cesariel/middleware.ts`
- **Qué hace**: Middleware de Next.js 15
- **Función**: Se ejecuta ANTES de cada request
- **Uso típico**:
  - Validación de autenticación
  - Redirects condicionales
  - Headers personalizados
  - Rate limiting
- **Importancia**: ⭐⭐⭐⭐

---

## 📁 APP/ - Next.js 15 App Router

### 📁 app/ - Estructura

El directorio `app/` usa el **App Router** de Next.js 15:
- Cada `page.tsx` es una ruta
- `layout.tsx` define layouts compartidos
- Carpetas con `()` son route groups (no afectan URL)
- `_components/` y `_lib/` son carpetas privadas (no son rutas)

---

### **Páginas Raíz (7 archivos)**

#### `app/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/page.tsx`
- **Qué hace**: **Página de LOGIN** (ruta `/`)
- **Función**:
  - Formulario de login (username + password)
  - Validación de credenciales
  - Redirect a `/dashboard` después de login exitoso
  - Manejo de errores de autenticación
- **Componente**: Client Component (`'use client'`)
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO - Primera página que ve el usuario

#### `app/layout.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/layout.tsx`
- **Qué hace**: **Layout raíz** de toda la aplicación
- **Función**:
  - Wrappea todas las páginas
  - Define `<html>`, `<head>`, `<body>`
  - Importa estilos globales (globals.css)
  - Configura metadata (título, descripción)
  - Providers de contextos globales
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO

#### `app/providers.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/providers.tsx`
- **Qué hace**: Providers de React Context
- **Función**:
  - Wrappea children con múltiples providers
  - CurrencyContext
  - SessionTimeoutWrapper
  - Otros contextos globales
- **Uso**: Importado por layout.tsx
- **Importancia**: ⭐⭐⭐⭐

#### `app/globals.css`
- **Ubicación**: `frontend/pos-cesariel/app/globals.css`
- **Qué hace**: **Estilos globales** CSS
- **Contenido**:
  - Imports de Tailwind (@tailwind base/components/utilities)
  - Custom CSS variables
  - Estilos de reset
  - Clases utility personalizadas
- **Importancia**: ⭐⭐⭐⭐

#### `app/dashboard/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/dashboard/page.tsx`
- **Qué hace**: Página del **Dashboard principal** (ruta `/dashboard`)
- **Función**:
  - Renderiza `<DashboardContainer />`
  - Dashboard con stats, gráficos, accesos rápidos
  - Primera página después de login
- **Componente**: Client Component
- **Importancia**: ⭐⭐⭐⭐⭐

#### `app/pos/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/pos/page.tsx`
- **Qué hace**: Página del **Punto de Venta** (ruta `/pos`)
- **Función**:
  - Renderiza `<POSContainer />`
  - Sistema POS completo (carrito, cobro, productos)
- **Componente**: Client Component
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO - Core del sistema

#### `app/inventory/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/inventory/page.tsx`
- **Qué hace**: Página de **Inventario** (ruta `/inventory`)
- **Función**:
  - Renderiza `<InventoryContainer />`
  - Gestión de productos, categorías, stock
- **Componente**: Client Component
- **Importancia**: ⭐⭐⭐⭐⭐

#### `app/reports/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/reports/page.tsx`
- **Qué hace**: Página de **Reportes** (ruta `/reports`)
- **Función**:
  - Renderiza `<ReportsContainer />`
  - Analytics, gráficos, reportes de ventas
- **Componente**: Client Component
- **Importancia**: ⭐⭐⭐⭐

#### `app/ecommerce/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/ecommerce/page.tsx`
- **Qué hace**: Página de **Gestión E-commerce** (ruta `/ecommerce`)
- **Función**:
  - Renderiza `<EcommerceContainer />`
  - Gestión de productos e-commerce, órdenes, banners
- **Componente**: Client Component
- **Importancia**: ⭐⭐⭐⭐

#### `app/documentation/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/documentation/page.tsx`
- **Qué hace**: Página de **Documentación** (ruta `/documentation`)
- **Función**:
  - Documentación de uso del sistema
  - Guías, tutoriales
- **Componente**: Server o Client Component

---

### 📁 app/components/ - Componentes Globales de App (2 archivos)

#### `app/components/NotificationCenter.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/components/NotificationCenter.tsx`
- **Qué hace**: Centro de notificaciones global
- **Función**:
  - Muestra notificaciones en tiempo real
  - Badge con contador de no leídas
  - Dropdown con lista de notificaciones
  - Botón "Marcar todas como leídas"
- **Uso**: Importado por Layout
- **Importancia**: ⭐⭐⭐

#### `app/components/NotificationSettings.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/components/NotificationSettings.tsx`
- **Qué hace**: Configuración de notificaciones
- **Función**:
  - Permite activar/desactivar tipos de notificaciones
  - Configurar sonidos
  - Preferencias de usuario
- **Importancia**: ⭐⭐

---

### 📁 app/lib/ - Utilidades Específicas de App (1 archivo)

#### `app/lib/notification-service.ts`
- **Ubicación**: `frontend/pos-cesariel/app/lib/notification-service.ts`
- **Qué hace**: Servicio de notificaciones del sistema
- **Funciones**:
  - `sendNotification(notification)`: Envía notificación
  - `markAsRead(id)`: Marca como leída
  - `getUnreadCount()`: Obtiene contador
  - `subscribeToNotifications(callback)`: Suscripción a actualizaciones
- **Importancia**: ⭐⭐⭐

---

### 📁 app/settings/ - Módulo de Configuraciones (70+ archivos)

> **El módulo más grande del proyecto**. Configuraciones de sistema, pagos, e-commerce, usuarios, etc.

#### **Documentación**

##### `app/settings/README.md`
- **Ubicación**: `frontend/pos-cesariel/app/settings/README.md`
- **Qué hace**: Documentación del módulo Settings
- **Contenido**:
  - Estructura de carpetas
  - Guía de uso
  - Convenciones

##### `app/settings/REFACTORING_COMPLETE.md`
- **Ubicación**: `frontend/pos-cesariel/app/settings/REFACTORING_COMPLETE.md`
- **Qué hace**: Documentación de refactoring completado
- **Contenido**:
  - Cambios realizados
  - Mejoras de arquitectura
  - Estado del refactoring

---

#### **Página Principal**

##### `app/settings/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/page.tsx`
- **Qué hace**: Página principal de configuraciones (ruta `/settings`)
- **Función**:
  - Muestra grid de tarjetas con todas las configuraciones
  - Enlaces a subsecciones:
    - Moneda
    - Métodos de pago
    - Tasas de impuestos
    - E-commerce
    - Redes sociales
    - Banners
    - Logo
    - Notificaciones
    - Seguridad y backups
- **Importancia**: ⭐⭐⭐⭐

---

#### **Currency Settings**

##### `app/settings/currency/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/currency/page.tsx`
- **Qué hace**: Configuración de **Moneda** (ruta `/settings/currency`)
- **Función**:
  - Selección de moneda (USD, ARS, EUR, etc.)
  - Formato de display
  - Símbolo y posición
  - Separadores decimales
- **Importancia**: ⭐⭐⭐

---

#### **Payment Configuration (8 archivos)**

##### `app/settings/payment-config/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-config/page.tsx`
- **Qué hace**: Página de **Configuración de Pagos** (ruta `/settings/payment-config`)
- **Función**:
  - Gestión de métodos de pago
  - Configuración de cuotas
  - Recargos por método
- **Componentes usados**:
  - `<PaymentConfigsList />`
  - `<PaymentConfigFormModal />`
  - `<PaymentConfigHelpSection />`

##### `app/settings/payment-config/_components/index.ts`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-config/_components/index.ts`
- **Qué hace**: Export point de componentes de payment-config
- **Función**: Simplifica imports

##### `app/settings/payment-config/_components/payment-configs-list.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-config/_components/payment-configs-list.tsx`
- **Qué hace**: Lista de configuraciones de pago
- **Función**:
  - Renderiza tabla con todos los payment configs
  - Acciones: Editar, Eliminar, Toggle activo
  - Filtros y búsqueda

##### `app/settings/payment-config/_components/payment-config-table.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-config/_components/payment-config-table.tsx`
- **Qué hace**: Tabla de payment configs
- **Función**:
  - Tabla con columnas: Método, Cuotas, Recargo, Estado
  - Responsive design

##### `app/settings/payment-config/_components/payment-config-group.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-config/_components/payment-config-group.tsx`
- **Qué hace**: Agrupa configs por método de pago
- **Función**:
  - Agrupa configs de tarjetas por tipo
  - Colapsa/expande grupos

##### `app/settings/payment-config/_components/payment-config-form-modal.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-config/_components/payment-config-form-modal.tsx`
- **Qué hace**: Modal de formulario para crear/editar payment config
- **Función**:
  - Form con validación
  - Campos: método, cuotas, recargo, activo
  - Submit a API

##### `app/settings/payment-config/_components/payment-config-help-section.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-config/_components/payment-config-help-section.tsx`
- **Qué hace**: Sección de ayuda
- **Función**:
  - Tips y guías
  - Ejemplos de configuración
  - FAQs

---

#### **Payment Methods (9 archivos)**

##### `app/settings/payment-methods/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/page.tsx`
- **Qué hace**: Página de **Métodos de Pago** (ruta `/settings/payment-methods`)
- **Función**:
  - Gestión de métodos de pago (Efectivo, Tarjeta, Transferencia)
  - Configuración de recargos por tarjeta
  - Cuotas y surcharges

##### `app/settings/payment-methods/_components/index.ts`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/_components/index.ts`
- **Qué hace**: Export point de componentes
- **Función**: Centraliza exports

##### `app/settings/payment-methods/_components/payment-methods-list.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/_components/payment-methods-list.tsx`
- **Qué hace**: Lista de métodos de pago
- **Función**:
  - Renderiza cards de cada método
  - Toggle activo/inactivo
  - Edición inline

##### `app/settings/payment-methods/_components/payment-method-card.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/_components/payment-method-card.tsx`
- **Qué hace**: Card individual de método de pago
- **Función**:
  - Muestra nombre, ícono, estado
  - Botones de acción
  - Visual distintivo por tipo

##### `app/settings/payment-methods/_components/card-config-item.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/_components/card-config-item.tsx`
- **Qué hace**: Item de configuración de tarjeta
- **Función**:
  - Muestra config de una tarjeta específica
  - Cuotas y recargos

##### `app/settings/payment-methods/_components/card-surcharges-section.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/_components/card-surcharges-section.tsx`
- **Qué hace**: Sección de recargos de tarjeta
- **Función**:
  - Lista de recargos por cuotas
  - Edición de percentages
  - Agregar/eliminar cuotas

##### `app/settings/payment-methods/_components/single-card-config.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/_components/single-card-config.tsx`
- **Qué hace**: Configuración de una tarjeta individual
- **Función**:
  - Form para editar una tarjeta
  - Validaciones

##### `app/settings/payment-methods/_components/changes-alert.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/_components/changes-alert.tsx`
- **Qué hace**: Alerta de cambios no guardados
- **Función**:
  - Warning cuando hay cambios pendientes
  - Botón "Guardar cambios"
  - Botón "Descartar"

##### `app/settings/payment-methods/_components/help-info.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/payment-methods/_components/help-info.tsx`
- **Qué hace**: Información de ayuda
- **Función**:
  - Tooltips
  - Guías inline
  - Documentación contextual

---

#### **Tax Rates**

##### `app/settings/tax-rates/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/tax-rates/page.tsx`
- **Qué hace**: Configuración de **Tasas de Impuestos** (ruta `/settings/tax-rates`)
- **Función**:
  - CRUD de tasas de impuestos (IVA, etc.)
  - Lista de impuestos activos
  - Cálculo de impuestos en ventas
- **Importancia**: ⭐⭐⭐

---

#### **E-commerce Settings**

##### `app/settings/ecommerce/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/ecommerce/page.tsx`
- **Qué hace**: Configuración de **E-commerce** (ruta `/settings/ecommerce`)
- **Función**:
  - Nombre de tienda
  - Descripción
  - Contacto (email, teléfono, WhatsApp)
  - SEO (meta tags)
  - Configuración de envíos
- **Importancia**: ⭐⭐⭐⭐

---

#### **Store Banners (9 archivos)**

##### `app/settings/store-banners/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/page.tsx`
- **Qué hace**: Gestión de **Banners de Tienda** (ruta `/settings/store-banners`)
- **Función**:
  - CRUD de banners promocionales
  - Reordenar banners (drag & drop)
  - Activar/desactivar
  - Preview de banners

##### `app/settings/store-banners/_components/index.ts`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/_components/index.ts`
- **Qué hace**: Export point de componentes de banners
- **Función**: Centraliza exports

##### `app/settings/store-banners/_components/banners-list.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/_components/banners-list.tsx`
- **Qué hace**: Lista de banners
- **Función**:
  - Grid de cards de banners
  - Botón "Agregar banner"
  - Reordenamiento drag & drop

##### `app/settings/store-banners/_components/banner-card.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/_components/banner-card.tsx`
- **Qué hace**: Card individual de banner
- **Función**:
  - Muestra imagen del banner
  - Título y subtítulo
  - Botones: Editar, Eliminar, Toggle activo
  - Indicador de orden

##### `app/settings/store-banners/_components/banner-form-dialog.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/_components/banner-form-dialog.tsx`
- **Qué hace**: Dialog de formulario de banner
- **Función**:
  - Modal para crear/editar banner
  - Form con validación
  - Submit a API

##### `app/settings/store-banners/_components/banner-form-fields.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/_components/banner-form-fields.tsx`
- **Qué hace**: Campos del formulario de banner
- **Función**:
  - Input: Título
  - Input: Subtítulo
  - Input: Link URL
  - Checkbox: Mostrar en home
  - Checkbox: Activo

##### `app/settings/store-banners/_components/banner-image-upload.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/_components/banner-image-upload.tsx`
- **Qué hace**: Componente de upload de imagen de banner
- **Función**:
  - Drag & drop de imagen
  - Preview de imagen
  - Upload a Cloudinary
  - Validación de formato y tamaño

##### `app/settings/store-banners/_components/banner-preview.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/_components/banner-preview.tsx`
- **Qué hace**: Preview del banner
- **Función**:
  - Muestra cómo se verá el banner en la tienda
  - Responsive preview

##### `app/settings/store-banners/_components/empty-banners-state.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-banners/_components/empty-banners-state.tsx`
- **Qué hace**: Estado vacío cuando no hay banners
- **Función**:
  - Ilustración/ícono
  - Mensaje "No hay banners"
  - Botón "Crear primer banner"

---

#### **Store Logo**

##### `app/settings/store-logo/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/store-logo/page.tsx`
- **Qué hace**: Configuración de **Logo de Tienda** (ruta `/settings/store-logo`)
- **Función**:
  - Upload de logo
  - Preview del logo
  - Uso en tienda online
- **Importancia**: ⭐⭐⭐

---

#### **Social Media (6 archivos)**

##### `app/settings/social-media/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/social-media/page.tsx`
- **Qué hace**: Configuración de **Redes Sociales** (ruta `/settings/social-media`)
- **Función**:
  - Enlaces a redes sociales (Facebook, Instagram, Twitter, WhatsApp)
  - Mostrar en footer de e-commerce
  - Configuración de WhatsApp Business

##### `app/settings/social-media/_components/index.ts`
- **Ubicación**: `frontend/pos-cesariel/app/settings/social-media/_components/index.ts`
- **Qué hace**: Export point de componentes
- **Función**: Centraliza exports

##### `app/settings/social-media/_components/social-config-list.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/social-media/_components/social-config-list.tsx`
- **Qué hace**: Lista de configuraciones de redes sociales
- **Función**:
  - Lista de todas las redes configuradas
  - Botón "Agregar red social"
  - Editar/eliminar

##### `app/settings/social-media/_components/platform-selector.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/social-media/_components/platform-selector.tsx`
- **Qué hace**: Selector de plataforma social
- **Función**:
  - Dropdown con logos de redes sociales
  - Facebook, Instagram, Twitter, TikTok, LinkedIn, YouTube, WhatsApp
  - Pre-fill de íconos y colores

##### `app/settings/social-media/_components/social-form-fields.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/social-media/_components/social-form-fields.tsx`
- **Qué hace**: Campos del formulario de red social
- **Función**:
  - Input: Plataforma
  - Input: URL
  - Checkbox: Mostrar en footer
  - Validación de URLs

##### `app/settings/social-media/_components/social-help-section.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/social-media/_components/social-help-section.tsx`
- **Qué hace**: Sección de ayuda para redes sociales
- **Función**:
  - Tips de cómo obtener URLs correctas
  - Ejemplos de URLs válidas
  - Mejores prácticas

---

#### **Notifications**

##### `app/settings/notifications/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/notifications/page.tsx`
- **Qué hace**: Configuración de **Notificaciones** (ruta `/settings/notifications`)
- **Función**:
  - Activar/desactivar tipos de notificaciones
  - Notificaciones de stock bajo
  - Notificaciones de ventas
  - Sonidos y badges
- **Importancia**: ⭐⭐⭐

---

#### **Security & Backups**

##### `app/settings/security-backups/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/settings/security-backups/page.tsx`
- **Qué hace**: **Seguridad y Backups** (ruta `/settings/security-backups`)
- **Función**:
  - Crear backup de BD
  - Restaurar backup
  - Historial de backups
  - Configuración de seguridad
- **Importancia**: ⭐⭐⭐⭐

---

### 📁 app/users/ - Gestión de Usuarios y Sucursales (6 archivos)

#### `app/users/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/users/page.tsx`
- **Qué hace**: Página de **Gestión de Usuarios** (ruta `/users`)
- **Función**:
  - Renderiza `<UsersContainer />`
  - Tabs: Usuarios, Sucursales, Roles
  - CRUD de usuarios
  - Asignación de roles
- **Importancia**: ⭐⭐⭐⭐⭐

#### `app/users/create/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/users/create/page.tsx`
- **Qué hace**: Página de **Crear Usuario** (ruta `/users/create`)
- **Función**:
  - Form de creación de usuario
  - Validación
  - Asignación de rol y sucursal
- **Importancia**: ⭐⭐⭐

#### `app/users/edit/[id]/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/users/edit/[id]/page.tsx`
- **Qué hace**: Página de **Editar Usuario** (ruta `/users/edit/[id]`)
- **Función**:
  - Form de edición de usuario
  - Pre-fill con datos existentes
  - Cambio de rol y sucursal
- **Dynamic route**: `[id]` es parámetro
- **Importancia**: ⭐⭐⭐

#### `app/users/branches/create/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/users/branches/create/page.tsx`
- **Qué hace**: Página de **Crear Sucursal** (ruta `/users/branches/create`)
- **Función**:
  - Form de creación de sucursal
  - Nombre, dirección, teléfono, email
- **Importancia**: ⭐⭐⭐

#### `app/users/branches/edit/[id]/page.tsx`
- **Ubicación**: `frontend/pos-cesariel/app/users/branches/edit/[id]/page.tsx`
- **Qué hace**: Página de **Editar Sucursal** (ruta `/users/branches/edit/[id]`)
- **Función**:
  - Form de edición de sucursal
  - Actualizar datos
- **Dynamic route**: `[id]` es parámetro
- **Importancia**: ⭐⭐⭐

---

## 📁 FEATURES/ - Feature-Based Architecture (140+ archivos)

> **Organización por características de negocio**. Cada feature contiene sus propios componentes, hooks, tipos, API calls, y utilidades.

### **Estructura de un Feature**:
```
features/nombre-feature/
├── components/          # Componentes UI del feature
├── hooks/              # Custom hooks
├── api/                # API calls
├── types/              # TypeScript types
├── utils/              # Utilidades específicas
├── styles/             # CSS específico (opcional)
├── index.ts            # Export point
└── README.md           # Documentación (opcional)
```

---

### 📁 features/configuracion/ - Configuración del Sistema (16 archivos)

#### `features/configuracion/README.md`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/README.md`
- **Qué hace**: Documentación del feature de configuración
- **Contenido**: Guía de uso, estructura, ejemplos

#### `features/configuracion/index.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/index.ts`
- **Qué hace**: Export point del feature
- **Función**: Re-exporta hooks, components, types

---

#### **API (3 archivos)**

##### `features/configuracion/api/configApi.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/api/configApi.ts`
- **Qué hace**: Cliente API para configuraciones
- **Funciones**:
  - `getCurrencyConfig()`: GET /config/currency
  - `updateCurrencyConfig(data)`: PUT /config/currency
  - `getTaxRates()`: GET /config/tax-rates
  - `createTaxRate(data)`: POST /config/tax-rates
  - `updateTaxRate(id, data)`: PUT /config/tax-rates/{id}
  - `deleteTaxRate(id)`: DELETE /config/tax-rates/{id}
- **Importancia**: ⭐⭐⭐⭐

##### `features/configuracion/api/index.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/api/index.ts`
- **Qué hace**: Export point de API
- **Función**: Re-exporta configApi

---

#### **Components (3 archivos)**

##### `features/configuracion/components/CustomInstallments/CustomInstallmentsManager.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/components/CustomInstallments/CustomInstallmentsManager.tsx`
- **Qué hace**: Gestor de cuotas personalizadas
- **Función**:
  - UI para configurar cuotas custom
  - Agregar/editar/eliminar cuotas
  - Validación de cuotas

##### `features/configuracion/components/CustomInstallments/index.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/components/CustomInstallments/index.ts`
- **Qué hace**: Export point de CustomInstallments
- **Función**: Re-exporta CustomInstallmentsManager

##### `features/configuracion/components/index.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/components/index.ts`
- **Qué hace**: Export point de todos los componentes
- **Función**: Re-exporta todos los componentes del feature

---

#### **Hooks (5 archivos)**

##### `features/configuracion/hooks/useCurrencyConfig.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/hooks/useCurrencyConfig.ts`
- **Qué hace**: Hook para gestionar configuración de moneda
- **Returns**:
  - `currencyConfig`: Configuración actual
  - `loading`: Estado de carga
  - `updateCurrency(data)`: Función para actualizar
  - `refresh()`: Refrescar datos
- **Importancia**: ⭐⭐⭐

##### `features/configuracion/hooks/usePaymentConfig.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/hooks/usePaymentConfig.ts`
- **Qué hace**: Hook para gestionar métodos de pago
- **Returns**:
  - `paymentMethods`: Lista de métodos
  - `createPaymentMethod(data)`: Crear
  - `updatePaymentMethod(id, data)`: Actualizar
  - `deletePaymentMethod(id)`: Eliminar
  - `loading`, `error`
- **Importancia**: ⭐⭐⭐⭐

##### `features/configuracion/hooks/useTaxRates.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/hooks/useTaxRates.ts`
- **Qué hace**: Hook para gestionar tasas de impuestos
- **Returns**:
  - `taxRates`: Lista de tasas
  - `createTaxRate(data)`: Crear
  - `updateTaxRate(id, data)`: Actualizar
  - `deleteTaxRate(id)`: Eliminar
  - `loading`, `error`
- **Importancia**: ⭐⭐⭐

##### `features/configuracion/hooks/useCustomInstallments.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/hooks/useCustomInstallments.ts`
- **Qué hace**: Hook para gestionar cuotas custom
- **Returns**:
  - `installments`: Lista de cuotas
  - `addInstallment(data)`: Agregar
  - `removeInstallment(id)`: Eliminar
  - `updateInstallment(id, data)`: Actualizar

##### `features/configuracion/hooks/index.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/hooks/index.ts`
- **Qué hace**: Export point de hooks
- **Función**: Re-exporta todos los hooks

---

#### **Types (2 archivos)**

##### `features/configuracion/types/config.types.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/types/config.types.ts`
- **Qué hace**: Type definitions de configuración
- **Types**:
  - `CurrencyConfig`: Configuración de moneda
  - `TaxRate`: Tasa de impuesto
  - `PaymentMethod`: Método de pago
  - `CustomInstallment`: Cuota personalizada

##### `features/configuracion/types/index.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/types/index.ts`
- **Qué hace**: Export point de types
- **Función**: Re-exporta todos los types

---

#### **Utils (3 archivos)**

##### `features/configuracion/utils/formatters.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/utils/formatters.ts`
- **Qué hace**: Formateadores de datos de config
- **Funciones**:
  - `formatCurrency(amount)`: Formatea moneda
  - `formatPercentage(value)`: Formatea porcentaje
  - `formatPaymentMethod(method)`: Formatea método de pago

##### `features/configuracion/utils/validators.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/utils/validators.ts`
- **Qué hace**: Validadores de datos de config
- **Funciones**:
  - `validateCurrencyConfig(data)`: Valida config de moneda
  - `validateTaxRate(data)`: Valida tasa de impuesto
  - `validatePaymentMethod(data)`: Valida método de pago

##### `features/configuracion/utils/index.ts`
- **Ubicación**: `frontend/pos-cesariel/features/configuracion/utils/index.ts`
- **Qué hace**: Export point de utils
- **Función**: Re-exporta todas las utilidades

---

### 📁 features/dashboard/ - Dashboard Principal (18 archivos)

#### **API**

##### `features/dashboard/api/dashboardApi.ts`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/api/dashboardApi.ts`
- **Qué hace**: Cliente API para dashboard
- **Funciones**:
  - `getDashboardStats()`: GET /dashboard/stats
  - `getSalesChart(filters)`: GET /dashboard/sales-chart
  - `getTopProducts(filters)`: GET /dashboard/top-products
  - `getLowStockProducts()`: GET /dashboard/low-stock
- **Importancia**: ⭐⭐⭐⭐

---

#### **Components (18 archivos)**

##### `features/dashboard/components/DashboardContainer.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/components/DashboardContainer.tsx`
- **Qué hace**: **Contenedor principal** del dashboard
- **Función**:
  - Orquesta todos los componentes del dashboard
  - Fetch de datos
  - Layout del dashboard
  - WebSocket para actualizaciones en tiempo real
- **Componentes usados**:
  - `<StatsGrid />`
  - `<ModuleGrid />`
  - `<QuickActionsPanel />`
  - `<LowStockAlert />`
- **Importancia**: ⭐⭐⭐⭐⭐

##### `features/dashboard/components/Stats/StatsGrid.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/components/Stats/StatsGrid.tsx`
- **Qué hace**: Grid de estadísticas principales
- **Función**:
  - Muestra cards con stats principales:
    - Ventas del día
    - Ventas del mes
    - Total de productos
    - Productos con stock bajo
    - Sucursales activas
  - Responsive grid (1-4 columnas según tamaño)

##### `features/dashboard/components/ModuleCards/ModuleGrid.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/components/ModuleCards/ModuleGrid.tsx`
- **Qué hace**: Grid de módulos del sistema
- **Función**:
  - Muestra cards de acceso rápido a módulos:
    - POS - Ventas
    - Inventario
    - Reportes
    - E-commerce
    - Usuarios
    - Configuración
  - **Evaluación dinámica de permisos** usando `canAccessModule()`
  - Módulos SIN ACCESO se muestran en gris con badge "Sin Acceso"
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO - Control de acceso visual

##### `features/dashboard/components/ModuleCards/ModuleCard.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/components/ModuleCards/ModuleCard.tsx`
- **Qué hace**: Card individual de módulo
- **Función**:
  - Card con ícono, título, descripción
  - Link al módulo (si tiene acceso)
  - Div deshabilitado (si NO tiene acceso)
  - Badge "🔒 Sin Acceso" para módulos restringidos
  - Mensaje "Acceso restringido para tu rol"
  - Cursor pointer vs cursor not-allowed
- **Props**: `module` (ModuleCardData con `available`)
- **Importancia**: ⭐⭐⭐⭐ CRÍTICO - Control visual de acceso

##### `features/dashboard/components/QuickActions/QuickActionsPanel.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/components/QuickActions/QuickActionsPanel.tsx`
- **Qué hace**: Panel de acciones rápidas
- **Función**:
  - Botones de acceso rápido:
    - Nueva venta
    - Nuevo producto
    - Ver reportes
    - Ver inventario

##### `features/dashboard/components/Alerts/LowStockAlert.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/components/Alerts/LowStockAlert.tsx`
- **Qué hace**: Alerta de productos con stock bajo
- **Función**:
  - Muestra alerta si hay productos con stock bajo
  - Contador de productos
  - Link a inventario

(Continuará con más componentes del dashboard...)

##### `features/dashboard/components/Charts/DailySalesChart.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/components/Charts/DailySalesChart.tsx`
- **Qué hace**: Gráfico de ventas diarias
- **Función**:
  - Chart de líneas con ventas por día
  - Librería: Recharts o Victory
  - Filtros de rango de fechas

##### `features/dashboard/components/Charts/ProductsPieChart.tsx`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/components/Charts/ProductsPieChart.tsx`
- **Qué hace**: Gráfico de torta de productos más vendidos
- **Función**:
  - Pie chart con distribución de ventas por producto
  - Top 5-10 productos
  - Colores distintivos

(Se documentarían los ~10 componentes restantes del dashboard)

---

#### **Hooks**

##### `features/dashboard/hooks/useDashboardStats.ts`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/hooks/useDashboardStats.ts`
- **Qué hace**: Hook para cargar estadísticas del dashboard
- **Returns**:
  - `stats`: Objeto con todas las estadísticas
  - `loading`: Estado de carga
  - `error`: Error si hay
  - `refresh()`: Refrescar datos
- **Importancia**: ⭐⭐⭐⭐

##### `features/dashboard/hooks/useRealTimeUpdates.ts`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/hooks/useRealTimeUpdates.ts`
- **Qué hace**: Hook para actualizaciones en tiempo real via WebSocket
- **Returns**:
  - `isConnected`: Estado de conexión WS
  - `notifications`: Notificaciones recibidas
- **Importancia**: ⭐⭐⭐

---

#### **Types**

##### `features/dashboard/types/dashboard.types.ts`
- **Ubicación**: `frontend/pos-cesariel/features/dashboard/types/dashboard.types.ts`
- **Qué hace**: Type definitions del dashboard
- **Types**:
  - `DashboardStats`: Estadísticas
  - `StatCard`: Card de estadística
  - `ModuleCardData`: Card de módulo (con campo `module` y `available`)
  - `QuickAction`: Acción rápida
- **Importancia**: ⭐⭐⭐⭐

---

### 📁 features/ecommerce/ - Gestión E-commerce (20+ archivos)

(Se documentarían todos los archivos del feature ecommerce: componentes, hooks, API, types)

---

### 📁 features/inventory/ - Gestión de Inventario (35+ archivos)

(Se documentarían todos los archivos del feature inventory: componentes, hooks, API, types)

---

### 📁 features/pos/ - Punto de Venta (30+ archivos)

(Se documentarían todos los archivos del feature POS: componentes, hooks, API, types, thermal ticket, etc.)

---

### 📁 features/reports/ - Reportes (15+ archivos)

(Se documentarían todos los archivos del feature reports: componentes, hooks, API, types)

---

### 📁 features/users/ - Gestión de Usuarios (15+ archivos)

(Se documentarían todos los archivos del feature users: componentes, hooks, API, types)

---

## 📁 SHARED/ - Código Compartido (35+ archivos)

### 📁 shared/api/ - Clientes API (3 archivos)

#### `shared/api/client.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/api/client.ts`
- **Qué hace**: **Cliente Axios configurado**
- **Función**:
  - Instancia de Axios con baseURL
  - Interceptors de request (agrega token JWT)
  - Interceptors de response (maneja errores 401)
  - Timeout configurado
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO - Usado por TODA la app

#### `shared/api/authApi.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/api/authApi.ts`
- **Qué hace**: API calls de autenticación
- **Funciones**:
  - `login(username, password)`: POST /auth/login
  - `getCurrentUser()`: GET /auth/me
  - `logout()`: Limpia token local
- **Importancia**: ⭐⭐⭐⭐⭐

#### `shared/api/configApi.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/api/configApi.ts`
- **Qué hace**: API calls de configuración compartidas
- **Funciones**:
  - Wrapper sobre `features/configuracion/api/configApi.ts`

---

### 📁 shared/components/ - Componentes Reutilizables (20+ archivos)

#### **Layout**

##### `shared/components/layout/Layout.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/layout/Layout.tsx`
- **Qué hace**: **Layout principal** de la aplicación
- **Función**:
  - Sidebar de navegación
  - Top bar con usuario y logout
  - Content area para children
  - Responsive (mobile menu)
  - Filtra navegación según permisos del usuario
  - WebSocket connection indicator
  - Notification Center
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO

---

#### **Auth**

##### `shared/components/auth/SessionTimeoutWrapper.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/auth/SessionTimeoutWrapper.tsx`
- **Qué hace**: Wrapper para timeout de sesión
- **Función**:
  - Detecta inactividad del usuario
  - Logout automático después de 4 horas
  - Toast de aviso antes de cerrar sesión
- **Importancia**: ⭐⭐⭐⭐

---

#### **Feedback**

##### `shared/components/feedback/NotificationCenter.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/feedback/NotificationCenter.tsx`
- **Qué hace**: Centro de notificaciones global
- **Función**:
  - Bell icon con badge de contador
  - Dropdown con notificaciones
  - WebSocket para actualizaciones en tiempo real
  - Marcar como leída
- **Importancia**: ⭐⭐⭐⭐

##### `shared/components/feedback/Toast.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/feedback/Toast.tsx`
- **Qué hace**: Componente de toast notifications
- **Función**:
  - Muestra mensajes temporales
  - Tipos: success, error, warning, info
  - Auto-dismiss después de X segundos
- **Importancia**: ⭐⭐⭐

---

#### **Product**

##### `shared/components/product/SizeSelectorModal.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/product/SizeSelectorModal.tsx`
- **Qué hace**: Modal para seleccionar talle
- **Función**:
  - Muestra talles disponibles del producto
  - Muestra stock por talle
  - Selección de talle antes de agregar al carrito
- **Importancia**: ⭐⭐⭐⭐

---

#### **UI Components (shadcn/ui) - 8 archivos**

##### `shared/components/ui/button.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/ui/button.tsx`
- **Qué hace**: Componente Button reutilizable
- **Función**: Botón con variantes (primary, secondary, outline, ghost)
- **Base**: shadcn/ui + Radix UI

##### `shared/components/ui/card.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/ui/card.tsx`
- **Qué hace**: Componente Card reutilizable
- **Función**: Card con header, content, footer

##### `shared/components/ui/dialog.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/ui/dialog.tsx`
- **Qué hace**: Componente Dialog/Modal reutilizable
- **Función**: Modal con overlay, close button
- **Base**: Radix Dialog

##### `shared/components/ui/input.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/ui/input.tsx`
- **Qué hace**: Componente Input reutilizable
- **Función**: Input con estilos consistentes

##### `shared/components/ui/label.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/ui/label.tsx`
- **Qué hace**: Componente Label reutilizable
- **Función**: Label para forms

##### `shared/components/ui/switch.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/ui/switch.tsx`
- **Qué hace**: Componente Switch/Toggle reutilizable
- **Función**: Toggle switch on/off
- **Base**: Radix Switch

##### `shared/components/ui/textarea.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/components/ui/textarea.tsx`
- **Qué hace**: Componente Textarea reutilizable
- **Función**: Textarea multi-línea

##### `shared/components/ui/index.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/components/ui/index.ts`
- **Qué hace**: Export point de componentes UI
- **Función**: Re-exporta todos los componentes UI

##### `shared/components/index.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/components/index.ts`
- **Qué hace**: Export point de componentes compartidos
- **Función**: Re-exporta todos los componentes shared

---

### 📁 shared/contexts/ - React Contexts (1 archivo)

#### `shared/contexts/CurrencyContext.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/contexts/CurrencyContext.tsx`
- **Qué hace**: Context de configuración de moneda global
- **Función**:
  - Provider de moneda (USD, ARS, etc.)
  - Formato de display
  - Funciones de formateo
- **Uso**: `const { currency, formatCurrency } = useCurrency()`
- **Importancia**: ⭐⭐⭐⭐

---

### 📁 shared/hooks/ - Custom Hooks (4 archivos)

#### `shared/hooks/useAuth.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/hooks/useAuth.ts`
- **Qué hace**: **Hook de autenticación** (usando Zustand)
- **Función**:
  - State management de usuario y token
  - `login(token, user)`: Guarda token y user
  - `logout(reason)`: Limpia token y user
  - `isAuthenticated`: Boolean de estado
  - `user`: Usuario actual
  - `logoutReason`: Razón del logout (manual, inactivity, expired)
  - Persistencia en localStorage
- **Functions exportadas**:
  - `hasPermission(user, requiredRole)`: Verifica permisos
  - `canAccessModule(user, module)`: Verifica acceso a módulo
- **Importancia**: ⭐⭐⭐⭐⭐ CRÍTICO - Usado en TODA la app

#### `shared/hooks/useSessionTimeout.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/hooks/useSessionTimeout.ts`
- **Qué hace**: Hook para detectar inactividad
- **Función**:
  - Detecta movimiento de mouse, clicks, teclas
  - Después de 4 horas de inactividad → logout automático
  - Toast de aviso 5 minutos antes
- **Importancia**: ⭐⭐⭐⭐

#### `shared/hooks/useRouteProtection.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/hooks/useRouteProtection.ts`
- **Qué hace**: Hook para proteger rutas
- **Función**:
  - Valida si el usuario tiene acceso a la ruta actual
  - Si NO tiene acceso → toast de error + redirect a dashboard
  - Usa `canAccessModule()` para validar
- **Importancia**: ⭐⭐⭐⭐

#### `shared/hooks/useWebSocket.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/hooks/useWebSocket.ts`
- **Qué hace**: Hook para conexión WebSocket
- **Función**:
  - Conecta a WebSocket del backend
  - Recibe notificaciones en tiempo real
  - Maneja reconexión automática
- **Returns**:
  - `isConnected`: Estado de conexión
  - `notifications`: Notificaciones recibidas
  - `sendMessage(message)`: Enviar mensaje
- **Importancia**: ⭐⭐⭐

---

### 📁 shared/utils/ - Utilidades Compartidas (20+ archivos)

#### **Constants**

##### `shared/utils/constants/config.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/constants/config.ts`
- **Qué hace**: Constantes de configuración
- **Contenido**:
  - `API_URL`: URL del backend
  - `TIMEOUT`: Timeout de requests
  - `MAX_FILE_SIZE`: Tamaño máximo de archivos
  - Otras constantes globales

##### `shared/utils/constants/roles.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/constants/roles.ts`
- **Qué hace**: Constantes de roles de usuario
- **Contenido**:
  - `ROLES`: { ADMIN, MANAGER, SELLER, ECOMMERCE }
  - `ROLE_LABELS`: Labels amigables
  - `ROLE_PERMISSIONS`: Permisos por rol

##### `shared/utils/constants/routes.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/constants/routes.ts`
- **Qué hace**: Constantes de rutas de la aplicación
- **Contenido**:
  - `ROUTES`: Objeto con todas las rutas
  - Ejemplo: `ROUTES.DASHBOARD`, `ROUTES.POS`, etc.

---

#### **Format**

##### `shared/utils/format/currency.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/format/currency.ts`
- **Qué hace**: Formateadores de moneda
- **Funciones**:
  - `formatCurrency(amount, currency?)`: Formatea cantidad como moneda
  - `parseCurrency(str)`: Parse string a número
  - `getCurrencySymbol(currency)`: Obtiene símbolo

##### `shared/utils/format/date.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/format/date.ts`
- **Qué hace**: Formateadores de fecha
- **Funciones**:
  - `formatDate(date, format?)`: Formatea fecha
  - `formatDateTime(date)`: Fecha y hora
  - `formatRelative(date)`: "Hace 5 minutos"
  - `parseDate(str)`: Parse string a Date

##### `shared/utils/format/numbers.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/format/numbers.ts`
- **Qué hace**: Formateadores de números
- **Funciones**:
  - `formatNumber(num, decimals?)`: Formatea número
  - `formatPercentage(num)`: Formatea como porcentaje
  - `formatCompactNumber(num)`: "1.5K", "2.3M"

##### `shared/utils/format/status.tsx`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/format/status.tsx`
- **Qué hace**: Formateadores de estados con badges
- **Funciones**:
  - `StatusBadge({ status })`: Componente badge con color
  - `formatOrderStatus(status)`: Formatea estado de orden
  - `getStatusColor(status)`: Obtiene color según estado

---

#### **Helpers**

##### `shared/utils/helpers/classNames.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/helpers/classNames.ts`
- **Qué hace**: Helper para combinar clases CSS
- **Función**:
  - `cn(...classes)`: Combina clases con clsx + tailwind-merge
  - Elimina conflictos de Tailwind
- **Uso**: `cn('text-sm', 'font-bold', isActive && 'text-blue-500')`
- **Importancia**: ⭐⭐⭐⭐

##### `shared/utils/helpers/color.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/helpers/color.ts`
- **Qué hace**: Helpers de color
- **Funciones**:
  - `hexToRgb(hex)`: Convierte hex a RGB
  - `rgbToHex(r, g, b)`: Convierte RGB a hex
  - `darken(color, amount)`: Oscurece color

##### `shared/utils/helpers/storage.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/helpers/storage.ts`
- **Qué hace**: Helpers de localStorage
- **Funciones**:
  - `setItem(key, value)`: Guarda en localStorage con serialización
  - `getItem(key)`: Obtiene y deserializa
  - `removeItem(key)`: Elimina
  - `clear()`: Limpia todo
- **Importancia**: ⭐⭐⭐

##### `shared/utils/helpers/string.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/helpers/string.ts`
- **Qué hace**: Helpers de strings
- **Funciones**:
  - `capitalize(str)`: Primera letra mayúscula
  - `truncate(str, length)`: Trunca con "..."
  - `slugify(str)`: Convierte a slug
  - `sanitize(str)`: Sanitiza HTML

---

#### **Validation**

##### `shared/utils/validation/validators.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/validation/validators.ts`
- **Qué hace**: Validadores de datos
- **Funciones**:
  - `isEmail(email)`: Valida email
  - `isPhone(phone)`: Valida teléfono
  - `isURL(url)`: Valida URL
  - `isRequired(value)`: Valida campo requerido
  - `minLength(value, min)`: Valida longitud mínima
- **Importancia**: ⭐⭐⭐

##### `shared/utils/index.ts`
- **Ubicación**: `frontend/pos-cesariel/shared/utils/index.ts`
- **Qué hace**: Export point de todas las utilidades
- **Función**: Re-exporta todas las utils

---

## 📁 LIB/ - Librerías y Utilidades (9 archivos)

#### `lib/api.ts`
- **Ubicación**: `frontend/pos-cesariel/lib/api.ts`
- **Qué hace**: Cliente API legacy (DEPRECATED)
- **Estado**: Usar `shared/api/client.ts` en su lugar
- **Mantener por**: Backwards compatibility

#### `lib/auth.ts`
- **Ubicación**: `frontend/pos-cesariel/lib/auth.ts`
- **Qué hace**: Auth utilities legacy (DEPRECATED)
- **Estado**: Re-exporta `shared/hooks/useAuth`
- **Mantener por**: Backwards compatibility

#### `lib/websocket.ts`
- **Ubicación**: `frontend/pos-cesariel/lib/websocket.ts`
- **Qué hace**: WebSocket manager
- **Función**:
  - Clase `WebSocketManager` para gestionar WS
  - Conectar, desconectar, enviar mensajes
  - Event listeners
- **Uso**: Usado por `shared/hooks/useWebSocket.ts`
- **Importancia**: ⭐⭐⭐

#### `lib/useBarcodeScanner.ts`
- **Ubicación**: `frontend/pos-cesariel/lib/useBarcodeScanner.ts`
- **Qué hace**: Hook para scanner de código de barras
- **Función**:
  - Detecta input de scanner (secuencia rápida de teclas + Enter)
  - Callback cuando se escanea código
- **Uso**: Feature POS
- **Importancia**: ⭐⭐⭐

#### `lib/upload-utils.ts`
- **Ubicación**: `frontend/pos-cesariel/lib/upload-utils.ts`
- **Qué hace**: Utilidades para upload de archivos
- **Funciones**:
  - `uploadImage(file)`: Upload a Cloudinary
  - `resizeImage(file, maxWidth, maxHeight)`: Resize antes de upload
  - `validateImageFile(file)`: Valida formato y tamaño
- **Importancia**: ⭐⭐⭐

#### `lib/validation-utils.ts`
- **Ubicación**: `frontend/pos-cesariel/lib/validation-utils.ts`
- **Qué hace**: Utilidades de validación
- **Funciones**: Similar a `shared/utils/validation/validators.ts`

#### `lib/utils/date.ts`
- **Ubicación**: `frontend/pos-cesariel/lib/utils/date.ts`
- **Qué hace**: Utilidades de fecha (legacy)
- **Estado**: Usar `shared/utils/format/date.ts` en su lugar

---

## 📁 __TESTS__/ - Tests Unitarios (12 archivos)

#### **Components**

##### `__tests__/components/FloatingCart.test.tsx`
- **Ubicación**: `frontend/pos-cesariel/__tests__/components/FloatingCart.test.tsx`
- **Qué hace**: Tests del componente FloatingCart
- **Tests**:
  - Renderiza correctamente
  - Muestra contador de items
  - Abre/cierra al hacer click
  - Calcula total correctamente

##### `__tests__/components/ImportModal.test.tsx`
- **Ubicación**: `frontend/pos-cesariel/__tests__/components/ImportModal.test.tsx`
- **Qué hace**: Tests del modal de importación
- **Tests**:
  - Abre/cierra modal
  - Upload de archivo CSV
  - Validación de formato
  - Muestra errores

##### `__tests__/components/NotificationCenter.test.tsx`
- **Ubicación**: `frontend/pos-cesariel/__tests__/components/NotificationCenter.test.tsx`
- **Qué hace**: Tests del centro de notificaciones
- **Tests**:
  - Muestra contador de no leídas
  - Marca como leída al hacer click
  - Marca todas como leídas

##### `__tests__/components/SizeStockModal.test.tsx`
- **Ubicación**: `frontend/pos-cesariel/__tests__/components/SizeStockModal.test.tsx`
- **Qué hace**: Tests del modal de stock por talle
- **Tests**:
  - Muestra talles disponibles
  - Actualiza stock
  - Validación de cantidades

---

#### **Lib/API**

##### `__tests__/lib/api.test.ts`
- **Ubicación**: `frontend/pos-cesariel/__tests__/lib/api.test.ts`
- **Qué hace**: Tests del cliente API
- **Tests**:
  - Agrega token JWT a requests
  - Maneja errores 401
  - Retry en errores de red

##### `__tests__/lib/auth.test.ts`
- **Ubicación**: `frontend/pos-cesariel/__tests__/lib/auth.test.ts`
- **Qué hace**: Tests de autenticación
- **Tests**:
  - Login exitoso guarda token
  - Logout limpia token
  - hasPermission() valida correctamente
  - canAccessModule() valida acceso

##### `__tests__/lib/websocket.test.ts`
- **Ubicación**: `frontend/pos-cesariel/__tests__/lib/websocket.test.ts`
- **Qué hace**: Tests de WebSocket
- **Tests**:
  - Conecta correctamente
  - Recibe mensajes
  - Reconecta automáticamente

---

#### **Pages**

##### `__tests__/pages/pos.test.tsx`
- **Ubicación**: `frontend/pos-cesariel/__tests__/pages/pos.test.tsx`
- **Qué hace**: Tests de la página POS
- **Tests**:
  - Renderiza productos
  - Agrega al carrito
  - Procesa venta
  - Descuenta stock

---

#### **Utils**

##### `__tests__/utils/helpers.test.ts`
- **Ubicación**: `frontend/pos-cesariel/__tests__/utils/helpers.test.ts`
- **Qué hace**: Tests de helpers
- **Tests**:
  - formatCurrency() formatea correctamente
  - formatDate() formatea fechas
  - capitalize() primera letra mayúscula

##### `__tests__/utils/test-utils.tsx`
- **Ubicación**: `frontend/pos-cesariel/__tests__/utils/test-utils.tsx`
- **Qué hace**: Utilidades para testing
- **Funciones**:
  - `renderWithProviders(component)`: Renderiza con providers
  - `mockAuth(user)`: Mock de autenticación
  - `waitForLoadingToFinish()`: Espera que termine loading
- **Importancia**: ⭐⭐⭐⭐ Usado por TODOS los tests

---

## 📁 CYPRESS/ - Tests E2E (8 archivos)

#### **Config**

##### `cypress.config.ts`
- **Ubicación**: `frontend/pos-cesariel/cypress.config.ts`
- **Qué hace**: Configuración de Cypress (ya documentado arriba)

---

#### **E2E Tests**

##### `cypress/e2e/auth.cy.ts`
- **Ubicación**: `frontend/pos-cesariel/cypress/e2e/auth.cy.ts`
- **Qué hace**: Tests E2E de autenticación
- **Tests**:
  - Login con credenciales válidas → redirect a dashboard
  - Login con credenciales inválidas → muestra error
  - Logout → redirect a login
  - Sesión persiste en refresh

##### `cypress/e2e/dashboard.cy.ts`
- **Ubicación**: `frontend/pos-cesariel/cypress/e2e/dashboard.cy.ts`
- **Qué hace**: Tests E2E del dashboard
- **Tests**:
  - Muestra estadísticas correctamente
  - Navega a módulos
  - Muestra notificaciones

##### `cypress/e2e/pos.cy.ts`
- **Ubicación**: `frontend/pos-cesariel/cypress/e2e/pos.cy.ts`
- **Qué hace**: Tests E2E del POS
- **Tests**:
  - Flujo completo de venta
  - Agregar producto al carrito
  - Seleccionar método de pago
  - Procesar venta
  - Imprimir ticket

---

#### **Fixtures**

##### `cypress/fixtures/users.json`
- **Ubicación**: `frontend/pos-cesariel/cypress/fixtures/users.json`
- **Qué hace**: Datos de prueba para tests
- **Contenido**:
  - Usuarios de ejemplo
  - Credenciales de test
  - Datos mock

---

#### **Support**

##### `cypress/support/commands.ts`
- **Ubicación**: `frontend/pos-cesariel/cypress/support/commands.ts`
- **Qué hace**: Custom commands de Cypress
- **Commands**:
  - `cy.login(username, password)`: Login automático
  - `cy.selectProduct(productId)`: Selecciona producto
  - `cy.completeCheckout()`: Completa checkout

##### `cypress/support/component.ts`
- **Ubicación**: `frontend/pos-cesariel/cypress/support/component.ts`
- **Qué hace**: Support para component testing
- **Función**: Setup de component tests

##### `cypress/support/e2e.ts`
- **Ubicación**: `frontend/pos-cesariel/cypress/support/e2e.ts`
- **Qué hace**: Setup global de E2E tests
- **Función**:
  - Importa commands
  - Setup de mocks
  - Configuración global

---

## 📁 TYPES/ - TypeScript Definitions (1 archivo)

#### `types/index.ts`
- **Ubicación**: `frontend/pos-cesariel/types/index.ts`
- **Qué hace**: Type definitions globales
- **Contenido**:
  - Types compartidos entre múltiples features
  - Interfaces globales
  - Type utilities

---

## 📁 UTILS/ - Utilidades Legacy (1 archivo)

#### `utils/index.ts`
- **Ubicación**: `frontend/pos-cesariel/utils/index.ts`
- **Qué hace**: Export point de utilidades legacy
- **Estado**: DEPRECATED - Usar `shared/utils/` en su lugar

---

## 🎯 Flujo de una Página/Feature

```
1. Usuario navega a ruta → app/ruta/page.tsx
                             ↓
2. Page renderiza Container del feature → features/xxx/components/XXXContainer.tsx
                             ↓
3. Container usa custom hooks → features/xxx/hooks/useXXX.ts
                             ↓
4. Hooks llaman a API → features/xxx/api/xxxApi.ts
                             ↓
5. API usa client configurado → shared/api/client.ts
                             ↓
6. Cliente envía request con token → Backend API
                             ↓
7. Backend retorna datos → Client
                             ↓
8. Hooks actualizan state → Container re-renderiza
                             ↓
9. Container renderiza componentes → features/xxx/components/
                             ↓
10. Componentes usan shared components → shared/components/
                             ↓
11. Componentes usan utils → shared/utils/
                             ↓
12. Usuario ve UI actualizada
```

---

## 🔑 Archivos MÁS IMPORTANTES

### **Top 15 Archivos Críticos**:

1. **`app/layout.tsx`** ⭐⭐⭐⭐⭐
   - Layout raíz de toda la aplicación

2. **`app/page.tsx`** ⭐⭐⭐⭐⭐
   - Página de login (primera página)

3. **`shared/hooks/useAuth.ts`** ⭐⭐⭐⭐⭐
   - Autenticación y autorización global

4. **`shared/api/client.ts`** ⭐⭐⭐⭐⭐
   - Cliente HTTP para TODA la app

5. **`shared/components/layout/Layout.tsx`** ⭐⭐⭐⭐⭐
   - Layout principal con sidebar y navigation

6. **`features/dashboard/components/DashboardContainer.tsx`** ⭐⭐⭐⭐⭐
   - Dashboard principal

7. **`features/dashboard/components/ModuleCards/ModuleGrid.tsx`** ⭐⭐⭐⭐⭐
   - Control de acceso visual a módulos

8. **`features/dashboard/components/ModuleCards/ModuleCard.tsx`** ⭐⭐⭐⭐⭐
   - Card de módulo con restricciones visuales

9. **`features/pos/components/POSContainer.tsx`** ⭐⭐⭐⭐⭐
   - Punto de Venta (core del negocio)

10. **`features/inventory/components/InventoryContainer.tsx`** ⭐⭐⭐⭐⭐
    - Gestión de inventario

11. **`next.config.js`** ⭐⭐⭐⭐⭐
    - Configuración de Next.js

12. **`middleware.ts`** ⭐⭐⭐⭐
    - Middleware para protección de rutas

13. **`shared/hooks/useRouteProtection.ts`** ⭐⭐⭐⭐
    - Protección de rutas por rol

14. **`tsconfig.json`** ⭐⭐⭐⭐
    - Configuración de TypeScript

15. **`package.json`** ⭐⭐⭐⭐
    - Dependencias y scripts

---

## 📊 Resumen por Categoría

| Categoría | Cantidad | Ubicación |
|-----------|----------|-----------|
| **Archivos de Config Raíz** | 15 | `frontend/pos-cesariel/` |
| **App Router Pages** | 15+ | `app/` |
| **App Settings** | 70+ | `app/settings/` |
| **Features** | 140+ | `features/` |
| **Shared Components** | 20+ | `shared/components/` |
| **Shared Hooks** | 4 | `shared/hooks/` |
| **Shared Utils** | 20+ | `shared/utils/` |
| **Tests** | 20 | `__tests__/`, `cypress/` |
| **Lib** | 9 | `lib/` |
| **Types** | 1 | `types/` |
| **TOTAL** | **305** | - |

---

## 🎓 Conceptos Clave

### **Feature-Based Architecture**
- Cada feature es autónomo
- Contiene: components, hooks, API, types, utils
- Reduce acoplamiento
- Fácil de mantener y escalar

### **App Router (Next.js 15)**
- File-system based routing
- Server Components por defecto
- Client Components con `'use client'`
- Layouts anidados

### **State Management**
- Zustand para auth global
- React Context para currency
- Local state en features (useState, custom hooks)

### **Type Safety**
- TypeScript estricto
- Types por feature
- Interfaces compartidas en `shared/`

### **Component Patterns**
- Container/Presentational pattern
- Shared UI components (shadcn/ui)
- Custom hooks para lógica

---

## ✅ Checklist para Agregar Nueva Funcionalidad

1. ✅ Crear feature en `features/nueva-feature/`
2. ✅ Crear estructura: components, hooks, api, types, utils
3. ✅ Crear `index.ts` export point
4. ✅ Agregar tipos en `types/feature.types.ts`
5. ✅ Crear API calls en `api/featureApi.ts`
6. ✅ Crear custom hooks en `hooks/useFeature.ts`
7. ✅ Crear Container component
8. ✅ Crear page en `app/feature/page.tsx`
9. ✅ Agregar ruta a navegación en Layout
10. ✅ Configurar permisos en `useAuth.ts`
11. ✅ Escribir tests en `__tests__/`
12. ✅ Actualizar documentación

---

**Documento generado automáticamente**
**Total de archivos documentados: 305**
**Fecha: 2026-01-20**

---

# 🔗 Referencias Cruzadas

## Feature → Components → Hooks → API

**Ejemplo: Dashboard**
```
Page: app/dashboard/page.tsx
  ↓ renderiza
Container: features/dashboard/components/DashboardContainer.tsx
  ↓ usa hooks
Hooks: features/dashboard/hooks/useDashboardStats.ts
  ↓ llama API
API: features/dashboard/api/dashboardApi.ts
  ↓ usa client
Client: shared/api/client.ts
  ↓ HTTP request
Backend: backend/routers/dashboard.py (ver BACKEND_STRUCTURE.md)
```

---

# 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia dev server (puerto 3000)

# Build
npm run build            # Build de producción
npm start               # Servidor de producción

# Testing
npm test                # Tests unitarios (Jest)
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con coverage
npm run test:e2e        # Tests E2E (Cypress)
cypress open            # Cypress en modo interactivo

# Linting
npm run lint            # ESLint
npm run lint:fix        # Fix automático

# Type checking
tsc --noEmit            # Verificar tipos sin build
