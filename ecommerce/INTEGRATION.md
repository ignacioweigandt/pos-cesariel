# 🔗 Integración E-commerce ↔ POS Backend

Este documento describe la integración entre tu página e-commerce existente y el backend del sistema POS Cesariel.

## 📋 Estado Actual

✅ **Completado:**
- API client configurado (`app/lib/api.ts`)
- Tipos TypeScript creados (`app/lib/api-types.ts`)
- Servicio de datos con fallback (`app/lib/data-service.ts`)
- Variables de entorno (`.env.local`)
- Puerto diferente configurado (3001)

🔄 **Pendiente de integración:**
- Actualizar componentes para usar datos reales
- Conectar carrito con sistema de ventas
- Implementar validación de stock en tiempo real

## 🛠️ Pasos para Completar la Integración

### 1. Instalar Dependencias

```bash
cd /Users/ignacioweigandt/Documentos/Tesis/ecommerce-pos
npm install axios
```

### 2. Verificar que el Backend POS esté funcionando

```bash
# En el directorio del POS
cd /Users/ignacioweigandt/Documentos/Tesis/pos-cesariel
make dev

# Verificar que esté corriendo en http://localhost:8000
curl http://localhost:8000/health
```

### 3. Iniciar el E-commerce

```bash
cd /Users/ignacioweigandt/Documentos/Tesis/ecommerce-pos
npm run dev
# Ahora correrá en http://localhost:3001
```

### 4. Próximos Archivos a Actualizar

Los siguientes archivos necesitan ser actualizados para usar los datos reales:

#### `app/page.tsx` - Página Principal
- Reemplazar `import { banners, products } from "./lib/data"` 
- Por `import { getBanners, getProducts } from "./lib/data-service"`

#### `app/productos/page.tsx` - Lista de Productos  
- Reemplazar importación de datos estáticos
- Usar `getProducts()` con filtros

#### `app/productos/[id]/page.tsx` - Detalles de Producto
- Usar `getProductById()`
- Implementar validación de stock real

#### `app/carrito/page.tsx` - Carrito de Compras
- Integrar con `salesApi.create()` para crear ventas
- Validar stock antes de confirmar

## 📁 Archivos Creados

### `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
PORT=3001
```

### `app/lib/api.ts`
Cliente Axios con endpoints del POS:
- `productsApi` - CRUD de productos
- `categoriesApi` - Gestión de categorías  
- `bannersApi` - Banners para homepage
- `salesApi` - Creación de ventas e-commerce
- `ecommerceApi` - Configuración de tienda

### `app/lib/api-types.ts`
Tipos TypeScript que coinciden con el backend:
- `ApiProduct`, `ApiCategory`, `ApiBanner`
- Funciones de mapeo: `mapApiProductToFrontend()`
- Interfaces de request/response

### `app/lib/data-service.ts`
Servicio principal con:
- Cache de 5 minutos para mejor performance
- Fallback a datos estáticos si hay errores
- Funciones: `getProducts()`, `getBanners()`, `getCategories()`

## 🔄 Flujo de Integración

```mermaid
graph LR
    A[E-commerce Frontend] -->|HTTP Requests| B[POS Backend API]
    B -->|JSON Response| A
    B <-->|PostgreSQL| C[Database]
    
    A1[Página Principal] -->|getBanners()| B1[/ecommerce-advanced/banners]
    A2[Lista Productos] -->|getProducts()| B2[/products?show_in_ecommerce=true]
    A3[Detalle Producto] -->|getProductById()| B3[/products/:id]
    A4[Carrito] -->|salesApi.create()| B4[/sales]
```

## 🎯 Funcionalidades por Implementar

### Integración Básica
1. **Página Principal** - Banners y productos destacados desde BD
2. **Catálogo** - Lista de productos con filtros en tiempo real
3. **Detalle de Producto** - Stock real, imágenes múltiples, talles disponibles
4. **Carrito** - Validación de stock, creación de ventas e-commerce

### Funcionalidades Avanzadas
1. **Sistema de Talles** - Stock específico por talle usando `/products/:id/available-sizes`
2. **Validación en Tiempo Real** - Verificar stock antes de agregar al carrito
3. **WebSockets** - Updates automáticos de stock
4. **Imágenes Múltiples** - Sistema de galería de imágenes por producto

## 🔧 Configuración del Backend

Asegúrate de que el backend POS tenga productos configurados para e-commerce:

```sql
-- Habilitar productos para e-commerce
UPDATE products SET show_in_ecommerce = true WHERE is_active = true;

-- Configurar precios específicos para e-commerce
UPDATE products SET ecommerce_price = price * 0.9 WHERE ecommerce_price IS NULL;
```

## 🐛 Troubleshooting

### Error de CORS
Si hay problemas de CORS, verificar que el backend tenga configurado:
```python
allow_origins=["http://localhost:3001"]
```

### Error de Conexión
1. Verificar que el backend esté corriendo en puerto 8000
2. Verificar que `NEXT_PUBLIC_API_URL` esté configurado correctamente
3. Revisar logs del backend con `make logs-backend`

### Productos no se muestran
1. Verificar que haya productos con `show_in_ecommerce = true`
2. Revisar que las categorías estén activas
3. Verificar en la API: `curl http://localhost:8000/products?show_in_ecommerce=true`

## 📞 Próximos Pasos

1. **Instalar axios**: `npm install axios`
2. **Actualizar app/page.tsx** para usar `getBanners()` y `getProducts()`
3. **Actualizar app/productos/page.tsx** para usar `getProducts()` con filtros
4. **Modificar app/productos/[id]/page.tsx** para `getProductById()`
5. **Integrar carrito con `salesApi.create()`**

Una vez completados estos pasos, tendrás un e-commerce completamente funcional conectado al sistema POS con inventario en tiempo real! 🚀