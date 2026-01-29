# 📊 PLAN COMPLETO - MÓDULO REPORTES AVANZADOS

**Estado actual:** 65% completado (11/15 tareas)  
**Última sesión:** 29 Enero 2026  
**Tiempo invertido:** ~1.5 horas  
**Tiempo estimado restante:** ~2 horas

**⚠️ Ver `REPORTES_PROGRESO.md` para estado detallado y notas de la última sesión**

---

## ✅ COMPLETADO (9 tareas)

### Backend (100%)
- ✅ Endpoint `/reports/brands-chart` creado
- ✅ 7 endpoints funcionando:
  - `/reports/dashboard`
  - `/reports/sales`
  - `/reports/sales/detailed` (payment methods + sale types)
  - `/reports/daily-sales`
  - `/reports/products-chart`
  - `/reports/branches-chart`
  - `/reports/brands-chart` (NUEVO)

### Frontend - Fundación (100%)
- ✅ shadcn/ui components instalados (table, tabs, badge, select, skeleton)
- ✅ Estructura de carpetas creada
- ✅ Tipos TypeScript actualizados (8 nuevas interfaces)
- ✅ React Query hooks creados (useBrandsChart, useDetailedSalesReport)
- ✅ 4 Shared components reutilizables:
  - EmptyState
  - LoadingSkeleton
  - ExportButton
  - BranchSelector
- ✅ MetricCard component
- ✅ AdvancedReportsContainer con navegación
- ✅ **Summary Tab completo** (4 cards + 4 charts)
- ✅ Page actualizada con nuevo container

---

## 🚧 PENDIENTE (6 tabs restantes)

### TAB 1: Products Tab (30-45 min) - PRIORIDAD ALTA

**Objetivo:** Mostrar productos más vendidos con análisis detallado

**Componentes a crear:**
```
components/tabs/ProductsTab.tsx
components/tables/ProductsTable.tsx (con shadcn Table)
```

**Features:**
1. **Tabla de productos** (shadcn/ui Table):
   - Columnas: Nombre, Cantidad Vendida, Revenue, Precio Promedio
   - Sorting por columnas
   - Pagination (mostrar 10/25/50/100)
   - Search/Filter por nombre

2. **Charts:**
   - Top 10 Products (pie chart) - REUTILIZAR ProductsPieChart existente
   - Products by Category (bar chart) - NUEVO

3. **Métricas adicionales:**
   - Total productos únicos vendidos
   - Producto más vendido del período
   - Categoría más vendida

**Endpoints a usar:**
- `GET /reports/sales` → top_products
- `GET /reports/products-chart`

**Estimación:** 30-45 min

---

### TAB 2: Brands Tab (30-45 min) - PRIORIDAD ALTA

**Objetivo:** Análisis de ventas por marca

**Componentes a crear:**
```
components/tabs/BrandsTab.tsx
components/tables/BrandsTable.tsx
```

**Features:**
1. **Tabla de marcas** (shadcn/ui Table):
   - Columnas: Marca, Productos Vendidos, Cantidad, Revenue
   - Sorting por revenue/cantidad
   - Pagination
   - Highlight de marca top

2. **Charts:**
   - Top Brands Revenue (bar chart horizontal)
   - Brands Market Share (pie chart)

3. **Métricas:**
   - Total marcas activas
   - Marca #1 del período
   - % de concentración (top 3 brands)

**Endpoints a usar:**
- `GET /reports/brands-chart` (NUEVO - ya creado)

**Estimación:** 30-45 min

---

### TAB 3: Branches Tab (20-30 min) - PRIORIDAD MEDIA

**Objetivo:** Comparación entre sucursales (solo Admin)

**Componentes a crear:**
```
components/tabs/BranchesTab.tsx
components/tables/BranchesComparisonTable.tsx
```

**Features:**
1. **Tabla comparativa:**
   - Columnas: Sucursal, Ventas, Pedidos, Ticket Promedio, % del Total
   - Sorting por métricas
   - Color coding (verde/amarillo/rojo según performance)

2. **Charts:**
   - Branches Sales Comparison (bar chart) - REUTILIZAR BranchSalesChart
   - Branch Performance Radar Chart (OPCIONAL)

3. **Métricas:**
   - Mejor sucursal del período
   - Sucursal con más crecimiento
   - Distribución % de ventas

**Endpoints a usar:**
- `GET /reports/sales` → sales_by_branch
- `GET /reports/branches-chart`

**Nota:** Este tab solo se muestra para usuarios ADMIN

**Estimación:** 20-30 min

---

### TAB 4: Sales Tab (45-60 min) - PRIORIDAD ALTA

**Objetivo:** Tabla detallada de ventas individuales con filtros avanzados

**Componentes a crear:**
```
components/tabs/SalesTab.tsx
components/tables/SalesDetailTable.tsx (COMPLEJA)
```

**Features:**
1. **Tabla de ventas** (shadcn/ui Table con features avanzadas):
   - Columnas: ID, Fecha, Cliente, Items, Método Pago, Total, Estado
   - Sorting por múltiples columnas
   - Pagination avanzada
   - Filtros:
     - Por método de pago
     - Por sale type (POS/Ecommerce/WhatsApp)
     - Por rango de montos
     - Por estado (completada/cancelada)
   - Export a CSV de resultados filtrados

2. **Chart:**
   - Daily Sales Trend (line chart) - REUTILIZAR DailySalesChart

3. **Stats cards:**
   - Ventas Completadas
   - Ventas Canceladas
   - Ticket Promedio
   - Total Items Vendidos

**Endpoints a usar:**
- `GET /reports/daily-sales`
- `GET /reports/sales`

**Nota:** Esta es la tabla MÁS COMPLEJA (sorting + pagination + filtros)

**Estimación:** 45-60 min

---

### TAB 5: Payment Methods Tab (30-40 min) - PRIORIDAD MEDIA

**Objetivo:** Análisis de métodos de pago

**Componentes a crear:**
```
components/tabs/PaymentMethodsTab.tsx
components/tables/PaymentMethodsTable.tsx
components/charts/PaymentMethodsPieChart.tsx
```

**Features:**
1. **Tabla:**
   - Columnas: Método, Transacciones, Monto Total, % del Total, Ticket Promedio
   - Sorting
   - Highlight método más usado

2. **Charts:**
   - Payment Methods Distribution (pie chart)
   - Payment Methods Trend (line chart) - ver evolución temporal

3. **Métricas:**
   - Método más usado
   - Método con mayor ticket promedio
   - % efectivo vs digital

**Endpoints a usar:**
- `GET /reports/sales/detailed` → sales_by_payment_method

**Estimación:** 30-40 min

---

### TAB 6: E-commerce Tab (30-40 min) - PRIORIDAD MEDIA

**Objetivo:** Comparación POS vs E-commerce vs WhatsApp

**Componentes a crear:**
```
components/tabs/EcommerceTab.tsx
components/cards/ChannelComparisonCard.tsx
components/charts/ChannelComparisonChart.tsx
```

**Features:**
1. **Comparison Cards:**
   - 3 cards lado a lado (POS / E-commerce / WhatsApp)
   - Cada card muestra: Ventas, Pedidos, Ticket Promedio, % del Total

2. **Charts:**
   - Channel Distribution (pie chart)
   - Channel Trend Over Time (stacked area chart)
   - Channel Performance Comparison (bar chart)

3. **Insights:**
   - Canal dominante
   - Canal con mejor ticket promedio
   - Tendencia de crecimiento por canal

**Endpoints a usar:**
- `GET /reports/sales/detailed` → sales_by_type

**Estimación:** 30-40 min

---

## 🎨 MEJORAS OPCIONALES (Low Priority)

### 1. Export Functionality (30 min)
- Implementar export real de CSV por tab
- Export de charts como PNG
- Export de PDF con todos los datos

### 2. Date Range Presets (15 min)
- Quick filters mejorados
- Comparación con período anterior
- Year-over-year comparison

### 3. Real-time Updates (45 min)
- WebSocket integration para actualizar datos en vivo
- Notificación de nuevas ventas
- Auto-refresh cada X minutos

### 4. Advanced Filters (30 min)
- Filtro por categoría de producto
- Filtro por rango de precios
- Filtro por vendedor (seller)

### 5. Dashboard Customization (60 min)
- Drag & drop para reorganizar charts
- Guardar layouts personalizados por usuario
- Widgets configurables

---

## 📊 RESUMEN DE TAREAS

| Tab | Prioridad | Tiempo | Complejidad |
|-----|-----------|--------|-------------|
| **Products** | ⭐⭐⭐ Alta | 30-45 min | Media |
| **Brands** | ⭐⭐⭐ Alta | 30-45 min | Media |
| **Sales** | ⭐⭐⭐ Alta | 45-60 min | Alta |
| **Branches** | ⭐⭐ Media | 20-30 min | Baja |
| **Payment Methods** | ⭐⭐ Media | 30-40 min | Media |
| **E-commerce** | ⭐⭐ Media | 30-40 min | Media |

**Total estimado:** 3-4 horas

---

## 🎯 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

### Sesión 1 (1.5 horas) - Tabs Sencillos
1. **Branches Tab** (20-30 min) → Más simple, usar componentes existentes
2. **Products Tab** (30-45 min) → Reutiliza mucho código
3. **Brands Tab** (30-45 min) → Usa el endpoint nuevo que ya creamos

### Sesión 2 (1.5 horas) - Tabs Medianos
4. **Payment Methods Tab** (30-40 min)
5. **E-commerce Tab** (30-40 min)
6. **Testing y ajustes** (20-30 min)

### Sesión 3 (1 hora) - Tab Complejo + Polish
7. **Sales Tab** (45-60 min) → El más complejo, dejarlo para el final
8. **Polish general** (15-30 min) → Responsive, loading states, errores

---

## 📝 NOTAS TÉCNICAS

### Componentes Reutilizables Ya Disponibles:
- ✅ `DailySalesChart` → Line chart de ventas diarias
- ✅ `ProductsPieChart` → Pie chart (reutilizable para brands, payments, etc)
- ✅ `BranchSalesChart` → Bar chart de sucursales
- ✅ `LoadingSkeleton` → Skeletons por tipo (table, chart, cards)
- ✅ `EmptyState` → Cuando no hay datos
- ✅ `MetricCard` → Cards de métricas con trends

### shadcn/ui Table Pattern:
```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

// Sorting + Pagination pattern
const [sorting, setSorting] = useState([]);
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

// TanStack Table hook
const table = useReactTable({
  data,
  columns,
  onSortingChange: setSorting,
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: { sorting, pagination },
});
```

### React Query Pattern:
```tsx
const { data, isLoading, error } = useProductsChart(
  startDate,
  endDate,
  branchId
);

if (isLoading) return <LoadingSkeleton type="table" count={10} />;
if (error) return <EmptyState title="Error" />;
if (!data?.length) return <EmptyState />;
```

---

## 🚀 ENTREGABLES FINALES

Cuando termine, tendremos:

✅ **7 Tabs Completos:**
- Summary (DONE)
- Products
- Brands
- Branches
- Sales
- Payment Methods
- E-commerce

✅ **Features:**
- Navegación con tabs moderna
- Filtros compartidos (fecha + sucursal)
- Tablas con sorting y pagination
- Charts interactivos
- Export a CSV
- Loading states
- Empty states
- Error handling
- Responsive design

✅ **Tech Stack:**
- shadcn/ui components
- React Query para data fetching
- TypeScript strict types
- Tailwind CSS
- Recharts para visualizaciones

---

## 📁 ESTRUCTURA FINAL DE ARCHIVOS

```
features/reports/
├── components/
│   ├── AdvancedReportsContainer.tsx       ✅ DONE
│   ├── tabs/
│   │   ├── SummaryTab.tsx                 ✅ DONE
│   │   ├── ProductsTab.tsx                🚧 TODO
│   │   ├── BrandsTab.tsx                  🚧 TODO
│   │   ├── BranchesTab.tsx                🚧 TODO
│   │   ├── SalesTab.tsx                   🚧 TODO
│   │   ├── PaymentMethodsTab.tsx          🚧 TODO
│   │   └── EcommerceTab.tsx               🚧 TODO
│   ├── cards/
│   │   ├── MetricCard.tsx                 ✅ DONE
│   │   └── ChannelComparisonCard.tsx      🚧 TODO
│   ├── tables/
│   │   ├── ProductsTable.tsx              🚧 TODO
│   │   ├── BrandsTable.tsx                🚧 TODO
│   │   ├── BranchesComparisonTable.tsx    🚧 TODO
│   │   ├── SalesDetailTable.tsx           🚧 TODO
│   │   └── PaymentMethodsTable.tsx        🚧 TODO
│   ├── charts/
│   │   ├── PaymentMethodsPieChart.tsx     🚧 TODO
│   │   ├── ChannelComparisonChart.tsx     🚧 TODO
│   │   └── (reutilizar existentes)        ✅ DONE
│   └── shared/
│       ├── EmptyState.tsx                 ✅ DONE
│       ├── LoadingSkeleton.tsx            ✅ DONE
│       ├── ExportButton.tsx               ✅ DONE
│       └── BranchSelector.tsx             ✅ DONE
├── hooks/
│   ├── useReportsQuery.ts                 ✅ DONE (+2 hooks)
│   └── useReportFilters.ts                ✅ DONE
└── types/
    └── reports.types.ts                   ✅ DONE (+8 interfaces)
```

---

## 🎓 APRENDIZAJES CLAVE

Al completar este módulo, habrás implementado:

1. **Sistema de Tabs moderno** con shadcn/ui
2. **Tablas avanzadas** con sorting, pagination, filtros
3. **Data visualization** con múltiples tipos de charts
4. **React Query patterns** para data fetching optimizado
5. **Component composition** reutilizando código
6. **TypeScript strict** con interfaces bien tipadas
7. **Loading & Error states** profesionales
8. **Responsive design** que funciona en mobile

---

## 📞 PRÓXIMOS PASOS

**Para la próxima sesión:**
1. Revisar este plan
2. Decidir si empezamos con Sesión 1 (tabs sencillos) o Sesión 2
3. Tener backend y frontend corriendo en desarrollo:
   ```bash
   docker compose up -d backend db
   cd frontend/pos-cesariel && npm run dev
   ```

**¿Dudas o queres ajustar algo del plan?**

---

**Creado:** 29 Enero 2026  
**Última actualización:** 29 Enero 2026  
**Estado:** 60% completado (9/15 tareas)
