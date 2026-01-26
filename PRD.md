# Product Requirements Document (PRD)
# POS Cesariel - Sistema de Punto de Venta con E-commerce

**Versión:** 1.0
**Fecha:** Enero 2025
**Autor:** Equipo POS Cesariel
**Estado:** En desarrollo activo

---

## 1. Resumen Ejecutivo

### 1.1 Descripción del Producto

POS Cesariel es un sistema integral de Punto de Venta (POS) con tienda e-commerce integrada, diseñado para negocios minoristas con múltiples sucursales. El sistema permite gestionar ventas presenciales, inventario multi-sucursal, y una tienda online conectada al mismo catálogo de productos.

### 1.2 Problema que Resuelve

Los negocios minoristas con múltiples sucursales enfrentan desafíos significativos:

- **Fragmentación de datos:** Inventario desconectado entre sucursales y canales de venta
- **Duplicación de esfuerzos:** Gestión separada de tienda física y online
- **Falta de visibilidad:** Dificultad para obtener reportes consolidados
- **Complejidad operativa:** Múltiples sistemas que no se comunican entre sí
- **Pérdida de ventas:** Stock no sincronizado genera ventas perdidas

### 1.3 Solución Propuesta

Un sistema unificado que integra:
- Terminal de punto de venta para ventas presenciales
- E-commerce público conectado al mismo inventario
- Control de stock en tiempo real por sucursal y talla
- Reportes consolidados de todas las operaciones
- Integración con WhatsApp para coordinar ventas online

### 1.4 Propuesta de Valor

| Para | Que necesitan | POS Cesariel ofrece |
|------|---------------|---------------------|
| Vendedores | Procesar ventas rápidamente | Terminal POS intuitivo con scanner de código de barras |
| Gerentes | Controlar inventario | Vista multi-sucursal con alertas de stock bajo |
| Dueños | Visibilidad del negocio | Dashboard con KPIs y reportes consolidados |
| Clientes | Comprar online | E-commerce con stock en tiempo real |

---

## 2. Visión del Producto

### 2.1 Visión

Ser la solución integral de gestión comercial para negocios minoristas, unificando ventas presenciales y online en una plataforma moderna, accesible y escalable.

### 2.2 Misión

Empoderar a los comerciantes con herramientas tecnológicas que simplifiquen sus operaciones diarias, mejoren la experiencia de sus clientes, y proporcionen información valiosa para la toma de decisiones.

### 2.3 Principios de Diseño

1. **Simplicidad sobre complejidad:** Interfaces limpias y flujos intuitivos
2. **Tiempo real:** Información actualizada al instante
3. **Móvil primero:** Diseño responsive para todos los dispositivos
4. **Confiabilidad:** Sistema robusto con fallbacks ante fallos
5. **Escalabilidad:** Arquitectura preparada para crecimiento

---

## 3. Usuarios y Personas

### 3.1 Persona 1: Vendedor (Seller)

**Perfil:**
- Empleado de tienda física
- Conocimiento tecnológico básico-medio
- Usa el sistema 8+ horas diarias

**Necesidades:**
- Procesar ventas rápidamente
- Buscar productos fácilmente
- Aplicar descuentos según políticas
- Imprimir tickets para clientes

**Frustraciones:**
- Sistemas lentos o complicados
- Búsquedas de productos ineficientes
- Errores de stock que generan conflictos

**Funcionalidades clave:**
- POS con búsqueda por nombre/SKU/código de barras
- Carrito flotante con resumen instantáneo
- Múltiples métodos de pago configurados
- Impresión de tickets térmicos

### 3.2 Persona 2: Gerente de Sucursal (Manager)

**Perfil:**
- Responsable de una o más sucursales
- Conocimiento tecnológico medio
- Toma decisiones operativas diarias

**Necesidades:**
- Controlar stock de su sucursal
- Ver reportes de ventas
- Gestionar equipo de vendedores
- Identificar productos de baja rotación

**Frustraciones:**
- Falta de visibilidad del inventario
- Reportes difíciles de generar
- Descuadres de stock frecuentes

**Funcionalidades clave:**
- Dashboard con métricas de sucursal
- Gestión de inventario con alertas
- Reportes de ventas por período
- Historial de movimientos de stock

### 3.3 Persona 3: Administrador (Admin)

**Perfil:**
- Dueño o gerente general del negocio
- Conocimiento tecnológico medio-alto
- Requiere visión global del negocio

**Necesidades:**
- Ver performance de todas las sucursales
- Gestionar catálogo de productos
- Configurar precios y políticas
- Crear usuarios y asignar permisos

**Frustraciones:**
- Datos fragmentados en múltiples sistemas
- Dificultad para comparar sucursales
- Procesos manuales de actualización de precios

**Funcionalidades clave:**
- Dashboard consolidado multi-sucursal
- Gestión centralizada de productos
- Actualización masiva de precios
- Importación/exportación de datos
- Configuración del sistema completa

### 3.4 Persona 4: Cliente E-commerce

**Perfil:**
- Consumidor final
- Navega desde móvil principalmente
- Valora la conveniencia de comprar online

**Necesidades:**
- Encontrar productos fácilmente
- Ver disponibilidad de stock y talles
- Proceso de compra simple
- Coordinar entrega o retiro

**Frustraciones:**
- Productos sin stock después de agregar al carrito
- Procesos de checkout largos
- Falta de comunicación post-compra

**Funcionalidades clave:**
- Catálogo con búsqueda y filtros
- Stock en tiempo real por talle
- Checkout simplificado
- Integración WhatsApp para coordinación

---

## 4. Requerimientos Funcionales

### 4.1 Módulo de Autenticación y Usuarios

#### RF-AUTH-001: Login de Usuarios
- **Descripción:** Sistema de autenticación con credenciales
- **Criterios de aceptación:**
  - Usuario puede ingresar con email/username y contraseña
  - Sistema genera token JWT con duración de 8 horas
  - Información del usuario disponible tras login
  - Mensajes de error claros para credenciales inválidas

#### RF-AUTH-002: Gestión de Roles
- **Descripción:** Sistema de roles con permisos diferenciados
- **Roles definidos:**
  - ADMIN: Acceso completo a todas las funcionalidades
  - MANAGER: Gestión de su sucursal, usuarios, inventario y reportes
  - SELLER: Operaciones de venta únicamente
  - ECOMMERCE: Gestión de tienda online y contenido
- **Criterios de aceptación:**
  - Cada usuario tiene un único rol asignado
  - Permisos validados en cada operación
  - Interfaz muestra solo opciones permitidas por rol

#### RF-AUTH-003: Gestión de Usuarios
- **Descripción:** CRUD completo de usuarios del sistema
- **Criterios de aceptación:**
  - Admin puede crear, editar, desactivar usuarios
  - Manager puede gestionar usuarios de su sucursal
  - Contraseña temporal generada automáticamente
  - Usuario puede cambiar su contraseña

### 4.2 Módulo de Sucursales (Branches)

#### RF-BRANCH-001: Gestión de Sucursales
- **Descripción:** Administración de ubicaciones físicas del negocio
- **Criterios de aceptación:**
  - Admin puede crear, editar, desactivar sucursales
  - Campos: nombre, dirección, teléfono, email
  - Cada sucursal tiene stock independiente
  - Usuarios asignados a una sucursal específica

#### RF-BRANCH-002: Multi-tenancy
- **Descripción:** Aislamiento de datos por sucursal
- **Criterios de aceptación:**
  - Vendedores solo ven datos de su sucursal
  - Managers ven datos de sus sucursales asignadas
  - Admins pueden ver todas las sucursales
  - Reportes filtrados por sucursal

### 4.3 Módulo de Productos

#### RF-PROD-001: Gestión de Catálogo
- **Descripción:** CRUD completo de productos
- **Campos del producto:**
  - Identificadores: nombre, SKU (único), código de barras
  - Clasificación: categoría, marca
  - Precios: precio POS, costo, precio e-commerce
  - Stock: cantidad, mínimo, alertas
  - Opciones: tiene talles, visible en e-commerce
  - Multimedia: imagen principal, galería
- **Criterios de aceptación:**
  - SKU validado como único en el sistema
  - Código de barras opcional pero único si existe
  - Precio e-commerce puede diferir del POS
  - Producto puede tener hasta 3 imágenes adicionales

#### RF-PROD-002: Gestión de Categorías
- **Descripción:** Organización jerárquica de productos
- **Criterios de aceptación:**
  - CRUD de categorías
  - Producto pertenece a una categoría
  - Filtrado por categoría en POS y e-commerce
  - Categorías pueden activarse/desactivarse

#### RF-PROD-003: Gestión de Marcas
- **Descripción:** Catálogo de marcas/fabricantes
- **Criterios de aceptación:**
  - CRUD de marcas
  - Producto puede tener marca asignada
  - Filtrado por marca disponible
  - Logo de marca opcional

#### RF-PROD-004: Productos con Talles
- **Descripción:** Soporte para productos con variantes de talla
- **Criterios de aceptación:**
  - Producto marcado como "tiene talles"
  - Stock controlado por talle y sucursal
  - Talles configurables: XS, S, M, L, XL, XXL, numéricos
  - Venta requiere selección de talle

#### RF-PROD-005: Importación Masiva
- **Descripción:** Carga de productos desde archivo
- **Formatos soportados:** CSV, Excel
- **Criterios de aceptación:**
  - Upload de archivo con preview de datos
  - Validación de campos requeridos
  - Productos existentes se actualizan por SKU
  - Productos nuevos se crean
  - Reporte de resultados (éxitos/errores)

#### RF-PROD-006: Actualización Masiva de Precios
- **Descripción:** Modificar precios en lote
- **Criterios de aceptación:**
  - Selección por filtros (categoría, marca, rango)
  - Aplicación de porcentaje de aumento/descuento
  - Preview antes de confirmar
  - Registro de cambios en auditoría

### 4.4 Módulo de Inventario

#### RF-INV-001: Stock por Sucursal
- **Descripción:** Control de inventario independiente por ubicación
- **Criterios de aceptación:**
  - Cada sucursal tiene su propio stock
  - Vista consolidada para admins
  - Stock total calculado como suma de sucursales
  - Alertas de stock bajo por sucursal

#### RF-INV-002: Stock por Talle
- **Descripción:** Control granular para productos con variantes
- **Criterios de aceptación:**
  - Stock independiente por talle dentro de cada sucursal
  - Matriz de stock: producto × sucursal × talle
  - Validación de disponibilidad antes de venta
  - Totales calculados correctamente

#### RF-INV-003: Ajustes de Stock
- **Descripción:** Modificaciones manuales de inventario
- **Tipos de ajuste:**
  - Entrada (IN): recepción de mercadería
  - Salida (OUT): mermas, roturas, devoluciones
  - Ajuste (ADJUSTMENT): correcciones de inventario
- **Criterios de aceptación:**
  - Registro con motivo obligatorio
  - Historial completo de movimientos
  - Trazabilidad de quién realizó el ajuste
  - Stock anterior y nuevo registrado

#### RF-INV-004: Alertas de Stock Bajo
- **Descripción:** Notificaciones automáticas de reposición
- **Criterios de aceptación:**
  - Umbral mínimo configurable por producto
  - Alerta cuando stock ≤ mínimo
  - Visible en dashboard y listado de productos
  - Notificaciones a usuarios relevantes

### 4.5 Módulo de Ventas POS

#### RF-POS-001: Búsqueda de Productos
- **Descripción:** Localización rápida de productos para venta
- **Métodos de búsqueda:**
  - Por nombre (parcial)
  - Por SKU (exacto o parcial)
  - Por código de barras (scanner o manual)
- **Criterios de aceptación:**
  - Resultados instantáneos mientras escribe
  - Soporte para lectores de código de barras
  - Muestra stock disponible en resultados

#### RF-POS-002: Carrito de Venta
- **Descripción:** Gestión de items en la transacción actual
- **Criterios de aceptación:**
  - Agregar productos con cantidad
  - Selección de talle si aplica
  - Modificar cantidades en carrito
  - Eliminar items del carrito
  - Cálculo automático de subtotal
  - Validación de stock antes de agregar

#### RF-POS-003: Métodos de Pago
- **Descripción:** Procesamiento de diferentes formas de pago
- **Métodos soportados:**
  - Efectivo (sin recargo)
  - Transferencia bancaria (sin recargo)
  - Tarjeta de débito (configurable)
  - Tarjeta de crédito (con recargo por cuotas)
- **Criterios de aceptación:**
  - Recargos configurables por tipo y cuotas
  - Cuotas disponibles: 1, 3, 6, 12, 18, 24
  - Cálculo automático del total con recargo
  - Registro del método usado en la venta

#### RF-POS-004: Descuentos
- **Descripción:** Aplicación de descuentos a la venta
- **Tipos:**
  - Porcentaje sobre el total
  - Monto fijo
- **Criterios de aceptación:**
  - Solo usuarios autorizados pueden aplicar descuentos
  - Límite máximo de descuento configurable
  - Registro del descuento aplicado
  - Cálculo correcto del total final

#### RF-POS-005: Impuestos
- **Descripción:** Cálculo y aplicación de impuestos
- **Criterios de aceptación:**
  - Tasa de impuesto configurable
  - Cálculo automático sobre subtotal
  - Desglose visible en ticket
  - Múltiples tasas configurables

#### RF-POS-006: Finalización de Venta
- **Descripción:** Confirmación y registro de la transacción
- **Criterios de aceptación:**
  - Modal de confirmación con resumen
  - Generación de número de venta único
  - Descuento automático de stock
  - Registro de movimientos de inventario
  - Modal de éxito con opciones post-venta

#### RF-POS-007: Ticket de Venta
- **Descripción:** Comprobante imprimible de la transacción
- **Criterios de aceptación:**
  - Formato para impresora térmica (80mm)
  - Datos del negocio y sucursal
  - Detalle de items con precios
  - Subtotal, impuestos, descuentos, total
  - Método de pago y fecha/hora
  - Número de venta único

### 4.6 Módulo E-commerce

#### RF-ECOM-001: Catálogo Público
- **Descripción:** Listado de productos disponibles para compra online
- **Criterios de aceptación:**
  - Solo productos con `show_in_ecommerce = true`
  - Precio e-commerce (diferente al POS si aplica)
  - Imágenes de productos desde Cloudinary
  - Stock en tiempo real
  - Paginación y carga progresiva

#### RF-ECOM-002: Búsqueda y Filtros
- **Descripción:** Localización de productos en el catálogo
- **Filtros disponibles:**
  - Categoría
  - Marca
  - Rango de precio
  - Con stock disponible
- **Criterios de aceptación:**
  - Búsqueda por nombre y descripción
  - Filtros combinables
  - Resultados actualizados en tiempo real
  - Contador de resultados

#### RF-ECOM-003: Detalle de Producto
- **Descripción:** Página individual del producto
- **Criterios de aceptación:**
  - Galería de imágenes
  - Nombre, descripción, precio
  - Selector de talle con stock por talle
  - Selector de cantidad
  - Botón de agregar al carrito
  - Validación de stock disponible

#### RF-ECOM-004: Carrito de Compras
- **Descripción:** Gestión de items seleccionados para compra
- **Criterios de aceptación:**
  - Persistencia en localStorage
  - Agregar/modificar/eliminar items
  - Validación de stock antes de checkout
  - Cálculo automático de totales
  - Indicador de cantidad en header

#### RF-ECOM-005: Proceso de Checkout
- **Descripción:** Flujo de finalización de compra
- **Pasos:**
  1. Revisión del carrito
  2. Datos del cliente (nombre, email, teléfono)
  3. Método de envío (pickup, delivery, shipping)
  4. Dirección (si aplica)
  5. Confirmación
- **Criterios de aceptación:**
  - Validación de campos requeridos
  - Verificación final de stock
  - Creación de venta tipo ECOMMERCE
  - Descuento automático de stock
  - Generación de número de orden

#### RF-ECOM-006: Confirmación de Orden
- **Descripción:** Comunicación post-compra al cliente
- **Criterios de aceptación:**
  - Modal/página de confirmación
  - Número de orden visible
  - Resumen de la compra
  - Link de WhatsApp para coordinación
  - Instrucciones de próximos pasos

#### RF-ECOM-007: Banners Promocionales
- **Descripción:** Contenido visual en página principal
- **Criterios de aceptación:**
  - Carrusel de imágenes
  - Título, subtítulo, botón de acción
  - Links personalizados
  - Ordenamiento configurable
  - Activación/desactivación

### 4.7 Módulo de Integración WhatsApp

#### RF-WA-001: Configuración de WhatsApp Business
- **Descripción:** Datos del negocio para integración
- **Campos:**
  - Número de WhatsApp Business
  - Nombre del negocio
  - Mensaje de bienvenida
  - Horarios de atención
- **Criterios de aceptación:**
  - Configuración desde panel admin
  - Validación de formato de número
  - Mensaje personalizable

#### RF-WA-002: Link de Chat Post-compra
- **Descripción:** Comunicación directa con el cliente
- **Criterios de aceptación:**
  - Generación automática de URL wa.me
  - Mensaje pre-cargado con datos de la orden
  - Disponible tras confirmar compra
  - Incluye número de orden y resumen

#### RF-WA-003: Ventas por WhatsApp
- **Descripción:** Registro de ventas coordinadas por chat
- **Criterios de aceptación:**
  - Tipo de venta WHATSAPP diferenciado
  - Entrada manual de datos del cliente
  - Misma lógica de descuento de stock
  - Visible en reportes separadamente

### 4.8 Módulo de Reportes

#### RF-REP-001: Dashboard de Métricas
- **Descripción:** Vista consolidada de KPIs principales
- **Métricas incluidas:**
  - Ventas del día/período
  - Cantidad de transacciones
  - Ticket promedio
  - Productos con stock bajo
  - Comparativa con período anterior
- **Criterios de aceptación:**
  - Actualización en tiempo real
  - Filtro por sucursal (según rol)
  - Visualización clara de tendencias

#### RF-REP-002: Reporte de Ventas
- **Descripción:** Análisis detallado de ventas
- **Dimensiones:**
  - Por período (día, semana, mes, rango)
  - Por sucursal
  - Por tipo de venta (POS, E-commerce, WhatsApp)
  - Por método de pago
- **Criterios de aceptación:**
  - Selector de rango de fechas
  - Totales y subtotales
  - Exportación a CSV/Excel
  - Gráficos de tendencia

#### RF-REP-003: Reporte de Productos
- **Descripción:** Análisis de desempeño de productos
- **Métricas:**
  - Productos más vendidos (top 10)
  - Ingresos por producto
  - Margen de ganancia
  - Rotación de inventario
- **Criterios de aceptación:**
  - Filtrado por categoría/marca
  - Período seleccionable
  - Visualización en tabla y gráfico

#### RF-REP-004: Reporte por Sucursal
- **Descripción:** Comparativa entre ubicaciones
- **Métricas:**
  - Ventas por sucursal
  - Ranking de sucursales
  - Stock por sucursal
- **Criterios de aceptación:**
  - Solo visible para Admin
  - Comparativa visual (gráfico de barras)
  - Drill-down a detalle de sucursal

### 4.9 Módulo de Configuración

#### RF-CONF-001: Métodos de Pago
- **Descripción:** Configuración de formas de pago aceptadas
- **Criterios de aceptación:**
  - Activar/desactivar métodos
  - Configurar recargos por tarjeta
  - Definir cuotas disponibles
  - Crear cuotas personalizadas

#### RF-CONF-002: Impuestos
- **Descripción:** Configuración de tasas impositivas
- **Criterios de aceptación:**
  - Tasa general del sistema
  - Múltiples tasas nombradas
  - Activación/desactivación
  - Selección en punto de venta

#### RF-CONF-003: Configuración de Tienda
- **Descripción:** Datos del negocio para e-commerce
- **Campos:**
  - Nombre de tienda
  - Logo
  - Descripción (SEO)
  - Información de contacto
  - Moneda
- **Criterios de aceptación:**
  - Edición desde panel admin
  - Upload de logo a Cloudinary
  - Reflejado en e-commerce público

#### RF-CONF-004: Redes Sociales
- **Descripción:** Enlaces a perfiles sociales
- **Plataformas:**
  - Facebook, Instagram, Twitter
  - YouTube, WhatsApp, TikTok
- **Criterios de aceptación:**
  - CRUD de enlaces
  - Ordenamiento visual
  - Activación/desactivación
  - Mostrados en footer e-commerce

---

## 5. Requerimientos No Funcionales

### 5.1 Performance

| ID | Requerimiento | Métrica |
|----|---------------|---------|
| RNF-PERF-001 | Tiempo de respuesta API | < 200ms para operaciones CRUD |
| RNF-PERF-002 | Carga de página inicial | < 3 segundos en 3G |
| RNF-PERF-003 | Búsqueda de productos | < 100ms para resultados |
| RNF-PERF-004 | Procesamiento de venta | < 500ms para confirmar |
| RNF-PERF-005 | Importación masiva | 1000 productos en < 30 segundos |

### 5.2 Escalabilidad

| ID | Requerimiento | Capacidad |
|----|---------------|-----------|
| RNF-ESC-001 | Productos | Hasta 100,000 productos |
| RNF-ESC-002 | Usuarios concurrentes | Hasta 500 usuarios simultáneos |
| RNF-ESC-003 | Sucursales | Hasta 50 sucursales |
| RNF-ESC-004 | Ventas diarias | Hasta 10,000 transacciones/día |

### 5.3 Disponibilidad

| ID | Requerimiento | SLA |
|----|---------------|-----|
| RNF-DISP-001 | Uptime del sistema | 99.5% |
| RNF-DISP-002 | Recovery time objective | < 4 horas |
| RNF-DISP-003 | Backup de datos | Diario automático |
| RNF-DISP-004 | Fallback e-commerce | Datos estáticos si backend cae |

### 5.4 Seguridad

| ID | Requerimiento | Implementación |
|----|---------------|----------------|
| RNF-SEG-001 | Autenticación | JWT con expiración de 8 horas |
| RNF-SEG-002 | Autorización | Validación de roles en cada endpoint |
| RNF-SEG-003 | Contraseñas | Bcrypt con salt |
| RNF-SEG-004 | HTTPS | Obligatorio en producción |
| RNF-SEG-005 | CORS | Configurado para dominios permitidos |
| RNF-SEG-006 | Auditoría | Log de acciones sensibles |

### 5.5 Usabilidad

| ID | Requerimiento | Criterio |
|----|---------------|----------|
| RNF-USA-001 | Responsive | Funcional en móvil, tablet, desktop |
| RNF-USA-002 | Accesibilidad | WCAG 2.1 nivel A |
| RNF-USA-003 | Idioma | Español (Argentina) |
| RNF-USA-004 | Feedback | Mensajes claros de éxito/error |
| RNF-USA-005 | Tiempo de aprendizaje | < 2 horas para operaciones básicas |

### 5.6 Compatibilidad

| ID | Requerimiento | Soporte |
|----|---------------|---------|
| RNF-COMP-001 | Navegadores | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| RNF-COMP-002 | Dispositivos | iOS 14+, Android 10+ |
| RNF-COMP-003 | Impresoras térmicas | ESC/POS compatible (80mm) |
| RNF-COMP-004 | Lectores de código | HID USB compatible |

---

## 6. Arquitectura Técnica

### 6.1 Stack Tecnológico

#### Backend
- **Framework:** FastAPI 0.115+
- **Base de datos:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0
- **Validación:** Pydantic 2.0
- **Autenticación:** JWT (python-jose)
- **Hashing:** Bcrypt (passlib)
- **Imágenes:** Cloudinary

#### Frontend POS Admin
- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, TypeScript 5
- **Estilos:** Tailwind CSS 4
- **Componentes:** shadcn/ui, Radix UI
- **Estado:** Zustand, React Query
- **HTTP:** Axios
- **Gráficos:** Recharts

#### Frontend E-commerce
- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, TypeScript 5
- **Estilos:** Tailwind CSS 4
- **Componentes:** shadcn/ui, Radix UI
- **Formularios:** React Hook Form, Zod
- **HTTP:** Axios

#### Infraestructura
- **Contenedores:** Docker, Docker Compose
- **Proxy reverso:** Nginx (producción)
- **Hosting:** Railway / VPS compatible
- **CI/CD:** GitHub Actions (opcional)

### 6.2 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                 │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   POS Admin     │    E-commerce   │      Mobile Browser         │
│   (Port 3000)   │   (Port 3001)   │                             │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                        │
         └─────────────────┼────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   NGINX     │ (Producción)
                    │   Proxy     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   FastAPI   │
                    │   Backend   │
                    │ (Port 8000) │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────▼─────┐    ┌──────▼──────┐   ┌──────▼──────┐
   │PostgreSQL │    │ Cloudinary  │   │  WhatsApp   │
   │    DB     │    │   (Images)  │   │  Business   │
   └───────────┘    └─────────────┘   └─────────────┘
```

### 6.3 Modelo de Datos Simplificado

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Branch    │────<│    User     │     │  Category   │
└─────────────┘     └─────────────┘     └──────┬──────┘
       │                   │                    │
       │                   │            ┌───────▼──────┐
       │                   │            │   Product    │
       │                   │            └───────┬──────┘
       │                   │                    │
┌──────▼──────┐     ┌──────▼──────┐     ┌───────▼──────┐
│ BranchStock │     │    Sale     │────<│  SaleItem    │
└─────────────┘     └─────────────┘     └──────────────┘
       │
┌──────▼──────┐
│ ProductSize │
└─────────────┘
```

### 6.4 Patrones de Diseño

| Patrón | Uso | Beneficio |
|--------|-----|-----------|
| Repository | Acceso a datos | Abstracción de BD, testeable |
| Service Layer | Lógica de negocio | Separación de responsabilidades |
| Dependency Injection | Inyección de sesión BD | Testeable, desacoplado |
| Factory | Creación de objetos complejos | Encapsulación de lógica |
| Observer | Notificaciones | Desacoplamiento de eventos |

---

## 7. Flujos de Usuario Principales

### 7.1 Flujo: Venta POS

```
Vendedor                    Sistema                     Base de Datos
    │                          │                             │
    │  1. Busca producto       │                             │
    │─────────────────────────>│                             │
    │                          │  2. Query productos         │
    │                          │────────────────────────────>│
    │                          │<────────────────────────────│
    │  3. Muestra resultados   │                             │
    │<─────────────────────────│                             │
    │                          │                             │
    │  4. Agrega al carrito    │                             │
    │─────────────────────────>│                             │
    │                          │  5. Valida stock            │
    │                          │────────────────────────────>│
    │                          │<────────────────────────────│
    │  6. Confirma agregado    │                             │
    │<─────────────────────────│                             │
    │                          │                             │
    │  7. Procede a pago       │                             │
    │─────────────────────────>│                             │
    │                          │  8. Calcula total           │
    │                          │     (impuestos, recargos)   │
    │  9. Muestra resumen      │                             │
    │<─────────────────────────│                             │
    │                          │                             │
    │  10. Confirma venta      │                             │
    │─────────────────────────>│                             │
    │                          │  11. Crea Sale + Items      │
    │                          │────────────────────────────>│
    │                          │  12. Descuenta stock        │
    │                          │────────────────────────────>│
    │                          │  13. Registra movimiento    │
    │                          │────────────────────────────>│
    │  14. Venta exitosa       │                             │
    │<─────────────────────────│                             │
    │                          │                             │
    │  15. Imprime ticket      │                             │
    │─────────────────────────>│                             │
```

### 7.2 Flujo: Compra E-commerce

```
Cliente                     Sistema                     Vendedor/Admin
    │                          │                             │
    │  1. Navega catálogo      │                             │
    │─────────────────────────>│                             │
    │  2. Muestra productos    │                             │
    │<─────────────────────────│                             │
    │                          │                             │
    │  3. Agrega productos     │                             │
    │─────────────────────────>│                             │
    │  4. Valida stock         │                             │
    │<─────────────────────────│                             │
    │                          │                             │
    │  5. Ingresa datos        │                             │
    │─────────────────────────>│                             │
    │                          │                             │
    │  6. Confirma compra      │                             │
    │─────────────────────────>│                             │
    │                          │                             │
    │  7. Orden confirmada     │  8. Notifica nueva orden    │
    │<─────────────────────────│────────────────────────────>│
    │                          │                             │
    │  9. Link WhatsApp        │                             │
    │<─────────────────────────│                             │
    │                          │                             │
    │  10. Inicia chat WA      │                             │
    │─────────────────────────────────────────────────────────>│
    │                          │                             │
    │  11. Coordina entrega    │                             │
    │<─────────────────────────────────────────────────────────│
```

---

## 8. Métricas de Éxito

### 8.1 KPIs del Producto

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tiempo de procesamiento de venta | < 30 segundos | Promedio desde búsqueda hasta confirmación |
| Tasa de abandono e-commerce | < 70% | Carritos abandonados / iniciados |
| Errores de stock | < 1% | Ventas con problema de stock / total |
| Adopción de usuarios | > 90% | Usuarios activos / usuarios totales |
| Satisfacción del usuario | > 4/5 | Encuestas periódicas |

### 8.2 KPIs Técnicos

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Disponibilidad | > 99.5% | Uptime mensual |
| Tiempo de respuesta p95 | < 500ms | Percentil 95 de latencia API |
| Errores del servidor | < 0.1% | Respuestas 5xx / total |
| Cobertura de tests | > 80% | Líneas cubiertas / total |

---

## 9. Alcance y Limitaciones

### 9.1 En Alcance (MVP)

- Sistema POS completo para ventas presenciales
- E-commerce básico con catálogo y checkout
- Control de inventario multi-sucursal
- Gestión de usuarios y roles
- Reportes básicos de ventas
- Integración WhatsApp (links)
- Gestión de imágenes con Cloudinary

### 9.2 Fuera de Alcance (Versión Actual)

- Procesamiento de pagos online (gateway)
- Facturación electrónica (AFIP)
- Sincronización offline del POS
- App móvil nativa
- Multi-idioma
- Multi-moneda en tiempo real
- Programa de fidelización/puntos
- Integración con marketplaces (ML, etc.)
- Módulo de compras a proveedores
- Contabilidad integrada

### 9.3 Supuestos

1. Los usuarios tienen conexión a internet estable
2. El negocio opera en Argentina (moneda ARS)
3. Los productos tienen precios fijos (no dinámicos)
4. El volumen de transacciones es moderado (< 10k/día)
5. Las imágenes son cargadas manualmente (no automáticas)

### 9.4 Dependencias

| Dependencia | Tipo | Riesgo |
|-------------|------|--------|
| PostgreSQL | Base de datos | Bajo - tecnología madura |
| Cloudinary | Servicio externo | Medio - plan gratuito limitado |
| WhatsApp | Servicio externo | Bajo - integración vía URL |
| Railway/VPS | Hosting | Medio - costos variables |

---

## 10. Roadmap

### Fase 1: MVP (Completado)
- [x] Backend API con autenticación
- [x] Modelos de datos principales
- [x] POS básico funcional
- [x] E-commerce con catálogo y checkout
- [x] Gestión de inventario
- [x] Multi-sucursal
- [x] Integración WhatsApp básica

### Fase 2: Mejoras (En Progreso)
- [x] Dashboard con métricas
- [x] Reportes de ventas
- [x] Importación masiva de productos
- [x] Actualización masiva de precios
- [x] Gestión de banners
- [x] Gestión de redes sociales
- [ ] Historial de ventas e-commerce mejorado
- [ ] Notificaciones en tiempo real

### Fase 3: Optimización (Planificado)
- [ ] Caché Redis para performance
- [ ] Búsqueda avanzada con Elasticsearch
- [ ] PWA para POS offline-first
- [ ] Tests automatizados > 80%
- [ ] CI/CD completo
- [ ] Monitoreo y alertas

### Fase 4: Expansión (Futuro)
- [ ] Gateway de pagos (Mercado Pago)
- [ ] Facturación electrónica AFIP
- [ ] App móvil nativa
- [ ] Integración con marketplaces
- [ ] API pública para terceros
- [ ] Multi-idioma

---

## 11. Glosario

| Término | Definición |
|---------|------------|
| **Branch** | Sucursal o ubicación física del negocio |
| **BranchStock** | Registro de stock de un producto en una sucursal específica |
| **Checkout** | Proceso de finalización de compra en e-commerce |
| **E-commerce** | Tienda online para clientes finales |
| **JWT** | JSON Web Token - método de autenticación |
| **POS** | Point of Sale - Punto de Venta |
| **ProductSize** | Variante de talla de un producto con su stock |
| **SKU** | Stock Keeping Unit - Código único de producto |
| **Ticket** | Comprobante de venta impreso |

---

## 12. Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | Enero 2025 | Equipo POS Cesariel | Versión inicial del PRD |

---

## 13. Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Product Owner | | | |
| Tech Lead | | | |
| Stakeholder | | | |
