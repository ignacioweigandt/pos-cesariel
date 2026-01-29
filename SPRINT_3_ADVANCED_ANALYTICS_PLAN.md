# SPRINT 3 - Advanced Analytics Dashboard

## 🎯 Objetivo

Crear un **Dashboard de Analytics completo y moderno** para el módulo de Reportes con múltiples vistas, tablas interactivas, y visualizaciones avanzadas usando shadcn/ui + React Query.

---

## 📊 Visión del Dashboard

### Layout Principal
```
┌─────────────────────────────────────────────────────────┐
│  📊 Reportes y Analytics                    [Export] 🔍 │
├─────────────────────────────────────────────────────────┤
│  📅 Date Range Picker    🏢 Branch Selector             │
├─────────────────────────────────────────────────────────┤
│  [Summary] [Sales] [Products] [Brands] [Branches]       │
│  [Payment Methods] [E-commerce] [Advanced]              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              TAB CONTENT AREA                            │
│                                                          │
│  (Charts, Tables, Cards según el tab activo)             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estructura de Tabs y Contenido

### 1️⃣ **Summary Tab** (Vista General)

**Contenido:**
- **4 Metric Cards** (shadcn/ui Card):
  - Total Sales ($)
  - Total Orders (#)
  - Average Ticket ($)
  - Total Products Sold (#)
  
- **Charts Row 1:**
  - Daily Sales Line Chart (últimos 30 días)
  - Sales by Type Pie Chart (POS vs E-commerce vs WhatsApp)

- **Charts Row 2:**
  - Top 5 Products Bar Chart
  - Top 5 Branches Bar Chart

- **Quick Stats Table:**
  - Comparison: This Month vs Last Month
  - Growth percentages

**Componentes a crear:**
- `features/reports/components/tabs/SummaryTab.tsx`
- `features/reports/components/cards/MetricCard.tsx`
- `features/reports/components/charts/DailySalesLineChart.tsx`
- `features/reports/components/charts/SalesByTypePieChart.tsx`
- `features/reports/components/charts/TopProductsBarChart.tsx`
- `features/reports/components/charts/TopBranchesBarChart.tsx`

---

### 2️⃣ **Sales Tab** (Ventas Detalladas)

**Contenido:**
- **Filters Row:**
  - Date Range
  - Branch Selector
  - Sale Type Filter (POS/E-commerce/WhatsApp)

- **Summary Cards:**
  - Total Sales
  - Total Orders
  - Average Ticket

- **Sales Table** (shadcn/ui Table):
  - Columns: Date, Order ID, Branch, Type, Items, Total, Payment Method
  - Features: Sorting, Pagination, Search
  - Export to CSV/PDF

- **Daily Sales Chart:**
  - Area chart with sales trend

**Componentes a crear:**
- `features/reports/components/tabs/SalesTab.tsx`
- `features/reports/components/tables/SalesTable.tsx`
- `features/reports/components/charts/SalesTrendChart.tsx`

---

### 3️⃣ **Products Tab** (Productos Más Vendidos)

**Contenido:**
- **Summary Cards:**
  - Total Products Sold
  - Total Revenue from Products
  - Most Profitable Product

- **Top Products Table** (shadcn/ui Table):
  - Columns: Product Name, Category, Quantity Sold, Revenue, % of Total Sales
  - Features: Sorting, Search, Pagination
  - Export to CSV

- **Charts:**
  - Products Pie Chart (Top 10 by revenue)
  - Products by Category Bar Chart

**Componentes a crear:**
- `features/reports/components/tabs/ProductsTab.tsx`
- `features/reports/components/tables/TopProductsTable.tsx` (mejorar existente)
- `features/reports/components/charts/ProductsByCategoryChart.tsx`

---

### 4️⃣ **Brands Tab** (Marcas Más Vendidas) ⭐ NUEVO

**Contenido:**
- **Summary Cards:**
  - Total Brands Sold
  - Total Revenue from Brands
  - Most Popular Brand

- **Top Brands Table** (shadcn/ui Table):
  - Columns: Brand Name, Products Sold, Quantity, Revenue, % of Total
  - Features: Sorting, Search, Pagination

- **Charts:**
  - Brands Pie Chart (Top 10)
  - Brands Revenue Bar Chart

**Backend Endpoints Necesarios:**
```python
GET /reports/brands-chart?start_date=X&end_date=Y&branch_id=Z
Response: [
  {"brand_id": 1, "brand_name": "Nike", "quantity_sold": 150, "total_revenue": 50000},
  ...
]
```

**Componentes a crear:**
- `features/reports/components/tabs/BrandsTab.tsx`
- `features/reports/components/tables/TopBrandsTable.tsx`
- `features/reports/components/charts/BrandsPieChart.tsx`
- `features/reports/components/charts/BrandsRevenueBarChart.tsx`

**Backend a crear:**
- `backend/app/repositories/reports.py` - Add `get_top_brands()`
- `backend/app/services/reports_service.py` - Add `get_brands_chart()`
- `backend/routers/reports.py` - Add `GET /reports/brands-chart`
- `backend/app/schemas/reports.py` - Add `TopBrand` schema

---

### 5️⃣ **Branches Tab** (Ventas por Sucursal)

**Contenido:**
- **Summary Cards:**
  - Total Branches
  - Top Performing Branch
  - Average Sales per Branch

- **Branch Sales Table** (shadcn/ui Table):
  - Columns: Branch Name, Total Sales, Orders Count, Average Ticket, % of Total
  - Features: Sorting, Search

- **Charts:**
  - Branch Sales Bar Chart (ya existe)
  - Branch Comparison Line Chart (trend over time)

**Componentes a crear:**
- `features/reports/components/tabs/BranchesTab.tsx`
- `features/reports/components/tables/BranchSalesTable.tsx` (mejorar existente)
- `features/reports/components/charts/BranchComparisonChart.tsx`

---

### 6️⃣ **Payment Methods Tab** (Métodos de Pago) ⭐ NUEVO

**Contenido:**
- **Summary Cards:**
  - Total Payment Methods Used
  - Most Popular Method
  - Cash vs Digital %

- **Payment Methods Table** (shadcn/ui Table):
  - Columns: Payment Method, Transactions Count, Total Amount, % of Total
  - Features: Sorting

- **Charts:**
  - Payment Methods Pie Chart
  - Payment Methods Trend Line Chart

**Backend Endpoints Necesarios:**
```python
GET /reports/payment-methods-chart?start_date=X&end_date=Y&branch_id=Z
Response: [
  {"payment_method": "Efectivo", "transactions_count": 250, "total_amount": 75000},
  {"payment_method": "Tarjeta de Crédito", "transactions_count": 180, "total_amount": 120000},
  ...
]
```

**Componentes a crear:**
- `features/reports/components/tabs/PaymentMethodsTab.tsx`
- `features/reports/components/tables/PaymentMethodsTable.tsx`
- `features/reports/components/charts/PaymentMethodsPieChart.tsx`
- `features/reports/components/charts/PaymentMethodsTrendChart.tsx`

**Backend a crear:**
- Add payment_method tracking to Sale model (if not exists)
- `backend/app/repositories/reports.py` - Add `get_payment_methods_stats()`
- `backend/app/services/reports_service.py` - Add `get_payment_methods_chart()`
- `backend/routers/reports.py` - Add `GET /reports/payment-methods-chart`
- `backend/app/schemas/reports.py` - Add `PaymentMethodStats` schema

---

### 7️⃣ **E-commerce Tab** (E-commerce vs POS) ⭐ NUEVO

**Contenido:**
- **Summary Cards:**
  - Total E-commerce Sales
  - Total POS Sales
  - E-commerce Growth %

- **Comparison Table:**
  - Columns: Channel (POS/E-commerce/WhatsApp), Orders, Revenue, Avg Ticket, % Growth
  
- **Charts:**
  - Channel Comparison Bar Chart
  - E-commerce vs POS Trend Line Chart (daily)
  - Sales by Channel Pie Chart

**Backend Endpoints Necesarios:**
```python
GET /reports/sales-by-channel?start_date=X&end_date=Y&branch_id=Z
Response: {
  "pos": {"total_sales": 500000, "orders_count": 1200, "average_ticket": 416.67},
  "ecommerce": {"total_sales": 250000, "orders_count": 600, "average_ticket": 416.67},
  "whatsapp": {"total_sales": 150000, "orders_count": 400, "average_ticket": 375.00}
}
```

**Componentes a crear:**
- `features/reports/components/tabs/EcommerceTab.tsx`
- `features/reports/components/tables/ChannelComparisonTable.tsx`
- `features/reports/components/charts/ChannelComparisonBarChart.tsx`
- `features/reports/components/charts/ChannelTrendChart.tsx`

**Backend a crear:**
- `backend/app/repositories/reports.py` - Add `get_sales_by_channel()`
- `backend/app/services/reports_service.py` - Add `get_sales_by_channel()`
- `backend/routers/reports.py` - Add `GET /reports/sales-by-channel`
- `backend/app/schemas/reports.py` - Add `SalesByChannel` schema

---

### 8️⃣ **Advanced Tab** (Análisis Avanzado) ⭐ NUEVO

**Contenido:**
- **Custom Metrics:**
  - Customer Lifetime Value (if user tracking exists)
  - Product Return Rate
  - Sales Velocity
  - Peak Sales Hours

- **Advanced Charts:**
  - Heatmap: Sales by Day of Week + Hour
  - Cohort Analysis (if applicable)
  - Product Correlation Matrix (products often bought together)

- **Export Options:**
  - Download Full Report (PDF)
  - Schedule Email Reports

**Componentes a crear:**
- `features/reports/components/tabs/AdvancedTab.tsx`
- `features/reports/components/charts/SalesHeatmap.tsx`
- `features/reports/components/exports/ReportExporter.tsx`

---

## 🛠️ Fase de Implementación

### **FASE 1: Setup y Estructura Base** (30 min)

#### 1.1 Instalar shadcn/ui Table component
```bash
cd frontend/pos-cesariel
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add select
```

#### 1.2 Crear estructura de carpetas
```bash
mkdir -p features/reports/components/tabs
mkdir -p features/reports/components/cards
mkdir -p features/reports/components/tables
mkdir -p features/reports/components/charts
mkdir -p features/reports/components/filters
```

#### 1.3 Actualizar tipos TypeScript
- `features/reports/types/reports.types.ts`
  - Add `TopBrand` interface
  - Add `PaymentMethodStats` interface
  - Add `SalesByChannel` interface
  - Add `ChannelData` interface

#### 1.4 Crear componente base con Tabs
- `features/reports/components/AdvancedReportsContainer.tsx`
  - Use shadcn/ui Tabs
  - Route switching entre tabs
  - Shared filters (Date Range, Branch)

---

### **FASE 2: Backend - Nuevos Endpoints** (1.5 horas)

#### 2.1 Brands Analytics
- [ ] Add `get_top_brands()` to `ReportsRepository`
- [ ] Add `get_brands_chart()` to `ReportsService`
- [ ] Add `GET /reports/brands-chart` endpoint
- [ ] Add `TopBrand` Pydantic schema
- [ ] Write tests (5 unit + 3 integration)

#### 2.2 Payment Methods Analytics
- [ ] Add `get_payment_methods_stats()` to `ReportsRepository`
- [ ] Add `get_payment_methods_chart()` to `ReportsService`
- [ ] Add `GET /reports/payment-methods-chart` endpoint
- [ ] Add `PaymentMethodStats` schema
- [ ] Write tests

#### 2.3 Sales by Channel
- [ ] Add `get_sales_by_channel()` to `ReportsRepository`
- [ ] Add `get_sales_by_channel()` to `ReportsService`
- [ ] Add `GET /reports/sales-by-channel` endpoint
- [ ] Add `SalesByChannel` schema
- [ ] Write tests

#### 2.4 Update React Query hooks
- [ ] Add `useBrandsChart()` hook
- [ ] Add `usePaymentMethodsChart()` hook
- [ ] Add `useSalesByChannel()` hook
- [ ] Export from `features/reports/hooks/useReportsQuery.ts`

---

### **FASE 3: Frontend - Summary Tab** (1 hora)

#### 3.1 Metric Cards Component
- [ ] Create `components/cards/MetricCard.tsx`
  - Props: title, value, icon, trend (+/- %), loading
  - Use shadcn/ui Card
  - Responsive grid layout

#### 3.2 Charts for Summary
- [ ] `charts/DailySalesLineChart.tsx` (recharts LineChart)
- [ ] `charts/SalesByTypePieChart.tsx` (recharts PieChart)
- [ ] `charts/TopProductsBarChart.tsx` (recharts BarChart)
- [ ] `charts/TopBranchesBarChart.tsx` (recharts BarChart)

#### 3.3 Summary Tab Container
- [ ] Create `tabs/SummaryTab.tsx`
  - Fetch data with React Query hooks
  - Layout: 4 metric cards + 2x2 charts grid
  - Loading skeletons
  - Error handling

---

### **FASE 4: Frontend - Sales Tab** (45 min)

#### 4.1 Sales Table Component
- [ ] Create `tables/SalesTable.tsx`
  - Use shadcn/ui Table
  - Columns: Date, Order ID, Branch, Type, Items, Total, Payment
  - Client-side sorting
  - Client-side pagination (10/25/50 per page)
  - Search/filter

#### 4.2 Sales Tab Container
- [ ] Create `tabs/SalesTab.tsx`
  - Filters: Date range, Branch, Sale type
  - Summary cards
  - Sales table
  - Sales trend chart

---

### **FASE 5: Frontend - Products Tab** (30 min)

#### 5.1 Improve Existing Table
- [ ] Refactor `tables/TopProductsTable.tsx`
  - Migrate to shadcn/ui Table
  - Add sorting, pagination
  - Add search filter

#### 5.2 Products Charts
- [ ] Create `charts/ProductsByCategoryChart.tsx`

#### 5.3 Products Tab Container
- [ ] Create `tabs/ProductsTab.tsx`
  - Summary cards
  - Top products table
  - Charts

---

### **FASE 6: Frontend - Brands Tab** (30 min)

#### 6.1 Brands Table
- [ ] Create `tables/TopBrandsTable.tsx`
  - shadcn/ui Table
  - Columns: Brand, Products, Quantity, Revenue, %
  - Sorting, pagination

#### 6.2 Brands Charts
- [ ] Create `charts/BrandsPieChart.tsx`
- [ ] Create `charts/BrandsRevenueBarChart.tsx`

#### 6.3 Brands Tab Container
- [ ] Create `tabs/BrandsTab.tsx`

---

### **FASE 7: Frontend - Branches Tab** (30 min)

#### 7.1 Improve Branch Table
- [ ] Refactor `tables/BranchSalesTable.tsx`
  - Migrate to shadcn/ui Table

#### 7.2 Branch Charts
- [ ] Create `charts/BranchComparisonChart.tsx` (trend over time)

#### 7.3 Branches Tab Container
- [ ] Create `tabs/BranchesTab.tsx`

---

### **FASE 8: Frontend - Payment Methods Tab** (30 min)

#### 8.1 Payment Methods Table
- [ ] Create `tables/PaymentMethodsTable.tsx`

#### 8.2 Payment Methods Charts
- [ ] Create `charts/PaymentMethodsPieChart.tsx`
- [ ] Create `charts/PaymentMethodsTrendChart.tsx`

#### 8.3 Payment Methods Tab Container
- [ ] Create `tabs/PaymentMethodsTab.tsx`

---

### **FASE 9: Frontend - E-commerce Tab** (30 min)

#### 9.1 Channel Comparison Table
- [ ] Create `tables/ChannelComparisonTable.tsx`

#### 9.2 Channel Charts
- [ ] Create `charts/ChannelComparisonBarChart.tsx`
- [ ] Create `charts/ChannelTrendChart.tsx`

#### 9.3 E-commerce Tab Container
- [ ] Create `tabs/EcommerceTab.tsx`

---

### **FASE 10: Frontend - Advanced Tab** (OPCIONAL - 1 hora)

#### 10.1 Advanced Metrics
- [ ] Create `components/metrics/AdvancedMetrics.tsx`

#### 10.2 Advanced Charts
- [ ] Create `charts/SalesHeatmap.tsx` (recharts Heatmap)

#### 10.3 Export Functionality
- [ ] Create `components/exports/ReportExporter.tsx`
  - PDF generation (jsPDF + html2canvas)
  - Email scheduling (backend endpoint needed)

---

### **FASE 11: Integration y Main Container** (30 min)

#### 11.1 Main Container Component
- [ ] Create `components/AdvancedReportsContainer.tsx`
  - shadcn/ui Tabs component
  - Shared filters at top
  - Route all 8 tabs
  - Export button (top right)

#### 11.2 Update Page Route
- [ ] Update `app/reports/page.tsx`
  - Import `AdvancedReportsContainer`
  - Replace old `ReportsContainer`

#### 11.3 Add Navigation
- [ ] Ensure sidebar has "Reportes Avanzados" link

---

### **FASE 12: Polish & Testing** (1 hora)

#### 12.1 Responsive Design
- [ ] Test all tabs on mobile/tablet
- [ ] Fix layout issues
- [ ] Add mobile-specific views

#### 12.2 Loading States
- [ ] Add skeletons for all tables
- [ ] Add chart loading placeholders
- [ ] Smooth transitions

#### 12.3 Error Handling
- [ ] Add error boundaries
- [ ] User-friendly error messages
- [ ] Retry buttons

#### 12.4 Tests
- [ ] Write component tests (60% coverage minimum)
- [ ] E2E test for main flow (Playwright)

---

## 📦 Componentes Reutilizables a Crear

### Shared Components

```typescript
// features/reports/components/shared/

1. EmptyState.tsx
   - Props: icon, title, description, action?
   - Use when no data available

2. LoadingSkeleton.tsx
   - Props: type (table|chart|cards)
   - Skeleton loaders for different types

3. ExportButton.tsx
   - Props: data, filename, format (csv|pdf)
   - Export functionality

4. DateRangePicker.tsx (mejorar existente)
   - shadcn/ui Calendar + Popover
   - Presets: Last 7 days, Last 30 days, This month, Custom

5. BranchSelector.tsx
   - shadcn/ui Select
   - Multi-select for admins
   - Show "All Branches" option

6. TabNavigation.tsx
   - shadcn/ui Tabs
   - Responsive (mobile: dropdown)
   - Icon + label for each tab
```

---

## 🎨 Design System

### Colors (Tailwind)
```javascript
// Primary metrics
primary: indigo-600
success: green-600
warning: yellow-600
danger: red-600

// Charts colors
chart-1: blue-500
chart-2: green-500
chart-3: purple-500
chart-4: orange-500
chart-5: pink-500
```

### Typography
```javascript
// Headers
h1: text-2xl font-bold text-gray-900
h2: text-xl font-semibold text-gray-900
h3: text-lg font-medium text-gray-900

// Body
text-sm text-gray-600 (labels)
text-base text-gray-900 (content)
```

### Spacing
```javascript
// Container padding
px-4 sm:px-6 lg:px-8

// Section spacing
space-y-6 (between sections)
gap-4 (grid gaps)
```

---

## 🧪 Testing Strategy

### Unit Tests
- All utility functions (100% coverage)
- All custom hooks (80% coverage)
- All tables components (60% coverage)

### Integration Tests
- Backend endpoints (80% coverage)
- React Query hooks with mock data

### E2E Tests (Playwright)
- User flow: Login → Reports → Change date range → View tabs → Export
- Test permissions (Admin vs Manager vs Seller)

---

## 📊 Métricas de Éxito

### Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Performance Score > 90

### Code Quality
- [ ] ESLint: 0 errors
- [ ] TypeScript: Strict mode, 0 errors
- [ ] Test coverage: > 70%

### UX
- [ ] Mobile responsive (all breakpoints)
- [ ] Keyboard navigation
- [ ] Accessible (WCAG AA compliance)

---

## 🚀 Roadmap de Ejecución

### Sprint 3A - Core Tabs (2-3 días)
- ✅ Setup y estructura
- ✅ Backend: Brands + Payment Methods + Channels endpoints
- ✅ Frontend: Summary + Sales + Products tabs

### Sprint 3B - Advanced Tabs (2 días)
- ✅ Frontend: Brands + Branches + Payment Methods tabs
- ✅ Frontend: E-commerce tab
- ✅ Integration tests

### Sprint 3C - Polish (1 día)
- ✅ Advanced tab (opcional)
- ✅ Responsive design
- ✅ Performance optimization
- ✅ E2E tests

---

## 📝 Notas Técnicas

### shadcn/ui Table Features
```typescript
// Sorting
const [sorting, setSorting] = useState<SortingState>([])

// Pagination
const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 10,
})

// Filtering
const [globalFilter, setGlobalFilter] = useState('')

// Column visibility
const [columnVisibility, setColumnVisibility] = useState({})
```

### React Query Cache Strategy
```typescript
// Short cache for real-time data
staleTime: 1 * 60 * 1000, // 1 min

// Longer cache for static data
staleTime: 10 * 60 * 1000, // 10 min

// Background refetch on window focus
refetchOnWindowFocus: true,
```

### Chart Responsive Config
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#6366f1" />
  </BarChart>
</ResponsiveContainer>
```

---

## 🎯 Resultado Final Esperado

Al completar Sprint 3, el módulo de Reportes tendrá:

✅ **8 tabs completos** con analytics avanzado  
✅ **15+ charts interactivos** con recharts  
✅ **10+ tablas** con shadcn/ui (sorting, pagination, search)  
✅ **Backend robusto** con nuevos endpoints  
✅ **100% TypeScript** con types estrictos  
✅ **React Query** para data fetching eficiente  
✅ **Responsive design** mobile-first  
✅ **Tests comprehensivos** (70%+ coverage)  
✅ **Export functionality** (CSV + PDF)  

**Rating Final Esperado: 9.5/10** 🚀

---

## 📦 Deliverables

1. **Código:**
   - ~30 nuevos componentes
   - ~3 nuevos endpoints backend
   - ~5 nuevos React Query hooks
   - ~500 líneas de tests

2. **Documentación:**
   - Component API docs
   - Backend endpoint docs
   - User guide (screenshots)

3. **Demos:**
   - Video walkthrough
   - Screenshots de cada tab
   - Performance metrics

---

**Estimated Total Time: 8-10 horas de desarrollo**  
**Complejidad: Media-Alta**  
**Impacto: MUY ALTO** 🎯
