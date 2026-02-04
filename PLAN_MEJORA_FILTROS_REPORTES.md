# 📊 PLAN DE MEJORA - Sistema de Filtros de Reportes

## 🎯 Objetivo
Simplificar y optimizar el sistema de filtros del módulo de reportes, eliminando redundancias y mejorando la experiencia de usuario.

---

## ❌ Problemas Actuales Identificados

### 1. **Redundancia de Opciones**
- **Filtros Rápidos** tiene "Este Mes" 
- **Ver por Mes Específico** hace lo mismo (pero más complejo)
- **Ver Año Completo** tiene "Seleccionar año"
- **Filtros Rápidos** también tiene "Este Año"

### 2. **Selector de Sucursal Duplicado**
- Aparece en el **filtro compartido superior** (BranchSelector para admin)
- También aparece en **Filtro Personalizado** (dentro de DateRangeFilter)
- Se pisan entre sí y confunden al usuario

### 3. **Experiencia de Usuario Confusa**
- Demasiadas formas de hacer lo mismo
- No está claro cuál usar para cada caso
- "Limpiar filtros" solo limpia parte de los filtros (no el personalizado)
- Estado de los filtros no es coherente

### 4. **Problemas de UI/UX**
- 3 columnas de filtros ocupan mucho espacio
- Selector de año duplicado (en mes específico y año completo)
- No hay feedback visual claro de qué filtro está activo
- Mobile: Los filtros se ven apretados

---

## ✅ Solución Propuesta

### **DISEÑO SIMPLIFICADO - Single Row Filter**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Período ▼]  [Desde: ___]  [Hasta: ___]  [Sucursal ▼]  [Aplicar]     │
└─────────────────────────────────────────────────────────────────────────┘
```

### **Estructura:**

#### 1️⃣ **Período (Dropdown Inteligente)**
Un solo selector que combina todo:

```
┌────────────────────────────────┐
│ ⚡ Rápidos                      │
│   ○ Hoy                        │
│   ○ Últimos 7 días             │
│   ○ Últimos 30 días            │
│   ○ Este mes                   │
│   ○ Mes anterior               │
│   ○ Este año                   │
│   ○ Año anterior               │
├────────────────────────────────┤
│ 📅 Por Mes                     │
│   ○ Enero 2026                 │
│   ○ Diciembre 2025             │
│   ○ Noviembre 2025             │
│   ... (últimos 12 meses)       │
├────────────────────────────────┤
│ 📆 Por Año                     │
│   ○ 2026                       │
│   ○ 2025                       │
│   ○ 2024                       │
├────────────────────────────────┤
│ ✏️ Personalizado (usar fechas) │
└────────────────────────────────┘
```

#### 2️⃣ **Campos de Fecha (Desde/Hasta)**
- **Deshabilitados** por defecto
- Solo se **habilitan** cuando seleccionás "Personalizado"
- Auto-completan cuando elegís un período predefinido
- Validación en tiempo real

#### 3️⃣ **Selector de Sucursal**
- **UN SOLO** selector (eliminar duplicado)
- Ubicación: Al lado de los filtros de fecha
- Visible solo para Admin
- Opción "Todas las sucursales" por defecto

#### 4️⃣ **Botón Aplicar**
- Visible solo cuando hay cambios sin aplicar
- Con loading state
- Shortcut: Enter

---

## 🎨 Mockup Visual

### **Desktop:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│                         Reportes Avanzados                                      │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Filtros Activos:  [Últimos 30 días] [Todas las sucursales]  [x Limpiar todo] │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  Período:                                                               │  │
│  │  [Últimos 30 días        ▼]                                            │  │
│  │                                                                          │  │
│  │  Fechas:                                                                │  │
│  │  [📅 01/01/2026]  hasta  [📅 29/01/2026]  (bloqueado)                 │  │
│  │                                                                          │  │
│  │  Sucursal: (solo admin)                                                 │  │
│  │  [Todas las sucursales   ▼]                                            │  │
│  │                                                                          │  │
│  │                                        [Aplicar Filtros] [Limpiar]     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  [Resumen] [Ventas] [Productos] [Marcas] [Sucursales] [Pagos] [E-commerce]   │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

### **Mobile:**
```
┌──────────────────────────┐
│   Reportes Avanzados     │
├──────────────────────────┤
│                          │
│ Filtros Activos:         │
│ • Últimos 30 días        │
│ • Todas las sucursales   │
│         [x Limpiar]      │
│                          │
│ ┌──────────────────────┐ │
│ │ Período:             │ │
│ │ [Últimos 30 días  ▼] │ │
│ │                      │ │
│ │ Desde:               │ │
│ │ [📅 01/01/2026]     │ │
│ │                      │ │
│ │ Hasta:               │ │
│ │ [📅 29/01/2026]     │ │
│ │                      │ │
│ │ Sucursal:            │ │
│ │ [Todas ▼]           │ │
│ │                      │ │
│ │ [Aplicar] [Limpiar] │ │
│ └──────────────────────┘ │
│                          │
│ [≡ Tabs dropdown]        │
└──────────────────────────┘
```

---

## 🛠️ Implementación Técnica

### **Fase 1: Crear Nuevo Componente SimplifiedFilters**

#### Archivos a crear:
```
frontend/pos-cesariel/features/reports/components/Filters/
├── SimplifiedFilters.tsx          (componente principal)
├── PeriodSelector.tsx             (dropdown inteligente)
├── FilterBadges.tsx               (mostrar filtros activos)
└── types.ts                       (tipos compartidos)
```

#### Estado del Filtro (único):
```typescript
interface ReportFilter {
  // Período seleccionado
  period: {
    type: 'quick' | 'month' | 'year' | 'custom';
    value: string; // 'last30', '2025-12', '2025', 'custom'
    label: string; // Para mostrar: "Últimos 30 días"
  };
  
  // Rango de fechas (auto-generado o manual)
  dateRange: {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
  };
  
  // Sucursal (solo admin)
  branch?: {
    id: number;
    name: string;
  };
  
  // Estado
  isDirty: boolean;      // Hay cambios sin aplicar
  isValid: boolean;      // Validación OK
  lastApplied: Date;     // Cuándo se aplicó por última vez
}
```

### **Fase 2: Lógica del PeriodSelector**

```typescript
// Opciones del selector
const periodOptions = [
  // Rápidos
  { group: 'quick', value: 'today', label: 'Hoy', icon: '⚡' },
  { group: 'quick', value: 'last7', label: 'Últimos 7 días', icon: '⚡' },
  { group: 'quick', value: 'last30', label: 'Últimos 30 días', icon: '⚡' },
  { group: 'quick', value: 'thisMonth', label: 'Este mes', icon: '⚡' },
  { group: 'quick', value: 'lastMonth', label: 'Mes anterior', icon: '⚡' },
  { group: 'quick', value: 'thisYear', label: 'Este año', icon: '⚡' },
  { group: 'quick', value: 'lastYear', label: 'Año anterior', icon: '⚡' },
  
  // Por mes (generados dinámicamente - últimos 12 meses)
  { group: 'month', value: '2026-01', label: 'Enero 2026', icon: '📅' },
  { group: 'month', value: '2025-12', label: 'Diciembre 2025', icon: '📅' },
  // ... generado automáticamente
  
  // Por año (últimos 5 años)
  { group: 'year', value: '2026', label: '2026', icon: '📆' },
  { group: 'year', value: '2025', label: '2025', icon: '📆' },
  // ... generado automáticamente
  
  // Custom
  { group: 'custom', value: 'custom', label: 'Personalizado', icon: '✏️' }
];

// Función para convertir período a rango de fechas
function periodToDateRange(period: string): { start: string, end: string } {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return { start: formatDate(now), end: formatDate(now) };
    
    case 'last7':
      const last7 = new Date(now);
      last7.setDate(now.getDate() - 7);
      return { start: formatDate(last7), end: formatDate(now) };
    
    case 'last30':
      const last30 = new Date(now);
      last30.setDate(now.getDate() - 30);
      return { start: formatDate(last30), end: formatDate(now) };
    
    case 'thisMonth':
      return {
        start: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
      };
    
    // Para mes específico: "2025-12"
    default:
      if (period.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = period.split('-').map(Number);
        return {
          start: formatDate(new Date(year, month - 1, 1)),
          end: formatDate(new Date(year, month, 0))
        };
      }
      
      // Para año específico: "2025"
      if (period.match(/^\d{4}$/)) {
        const year = Number(period);
        return {
          start: `${year}-01-01`,
          end: `${year}-12-31`
        };
      }
      
      // Custom: no hacer nada, user ingresa manual
      return { start: '', end: '' };
  }
}
```

### **Fase 3: Componente FilterBadges**

Muestra los filtros activos como badges removibles:

```tsx
<div className="flex items-center gap-2 flex-wrap">
  <span className="text-sm text-gray-600">Filtros activos:</span>
  
  <Badge variant="secondary">
    📅 Últimos 30 días
    <button onClick={() => clearFilter('period')}>×</button>
  </Badge>
  
  {filter.branch && (
    <Badge variant="secondary">
      🏢 {filter.branch.name}
      <button onClick={() => clearFilter('branch')}>×</button>
    </Badge>
  )}
  
  <button onClick={clearAllFilters} className="text-sm text-red-600">
    Limpiar todo
  </button>
</div>
```

### **Fase 4: Validaciones**

```typescript
function validateFilter(filter: ReportFilter): { isValid: boolean; error?: string } {
  // Validar que haya fechas
  if (!filter.dateRange.start || !filter.dateRange.end) {
    return { isValid: false, error: 'Debe seleccionar un período' };
  }
  
  // Validar que start <= end
  if (new Date(filter.dateRange.start) > new Date(filter.dateRange.end)) {
    return { isValid: false, error: 'La fecha de inicio no puede ser mayor que la de fin' };
  }
  
  // Validar rango máximo (ej: 1 año)
  const diffDays = Math.floor(
    (new Date(filter.dateRange.end).getTime() - new Date(filter.dateRange.start).getTime()) 
    / (1000 * 60 * 60 * 24)
  );
  
  if (diffDays > 365) {
    return { isValid: false, error: 'El rango no puede superar 1 año' };
  }
  
  return { isValid: true };
}
```

---

## 📋 Checklist de Implementación

### **Sprint 1: Preparación (1 día)**
- [ ] Crear nuevos archivos de componentes
- [ ] Definir tipos e interfaces
- [ ] Crear utilidades de fecha (periodToDateRange, etc.)
- [ ] Escribir tests unitarios para utilidades

### **Sprint 2: Componentes Base (2 días)**
- [ ] Implementar PeriodSelector con grupos
- [ ] Implementar campos de fecha con enable/disable
- [ ] Implementar selector de sucursal unificado
- [ ] Implementar FilterBadges
- [ ] Agregar validaciones

### **Sprint 3: Integración (1 día)**
- [ ] Crear SimplifiedFilters que integre todo
- [ ] Conectar con hook useReportFilters
- [ ] Reemplazar DateRangeFilter por SimplifiedFilters
- [ ] Eliminar BranchSelector duplicado
- [ ] Testing de integración

### **Sprint 4: Polish y UX (1 día)**
- [ ] Responsive design (mobile)
- [ ] Animaciones y transiciones
- [ ] Loading states
- [ ] Error states
- [ ] Accesibilidad (ARIA labels, keyboard nav)
- [ ] Testing E2E

### **Sprint 5: Cleanup (0.5 día)**
- [ ] Eliminar código viejo (DateRangeFilter, BranchSelector)
- [ ] Actualizar documentación
- [ ] Code review
- [ ] Deploy

---

## 🎯 Métricas de Éxito

### **Antes (Situación Actual):**
- ❌ 3 selectores de filtros + 2 campos de fecha + selector de sucursal duplicado
- ❌ 15+ opciones visibles al mismo tiempo
- ❌ Estado inconsistente entre filtros
- ❌ 3 formas de hacer lo mismo

### **Después (Objetivo):**
- ✅ 1 selector inteligente + 2 campos de fecha + 1 selector de sucursal
- ✅ 5 elementos visibles, expansión por dropdown
- ✅ Estado único y coherente
- ✅ 1 forma clara para cada caso de uso

### **KPIs:**
- Reducción de clicks: 40%
- Tiempo para aplicar filtro: -50%
- Errores de usuario: -70%
- Espacio vertical ocupado: -60%

---

## 🚀 Beneficios

### **Para el Usuario:**
1. **Simplicidad**: Una sola forma clara de filtrar
2. **Rapidez**: Menos clicks, más productividad
3. **Claridad**: Siempre sabe qué filtro está activo
4. **Mobile-friendly**: Mejor experiencia en celular

### **Para el Desarrollador:**
1. **Mantenibilidad**: Menos código duplicado
2. **Testeable**: Lógica centralizada
3. **Extensible**: Fácil agregar nuevos períodos
4. **Type-safe**: TypeScript con tipos fuertes

### **Para el Negocio:**
1. **Menos errores**: Usuarios aplican filtros correctos
2. **Más uso**: Interface más intuitiva = más adopción
3. **Insights**: Mejor análisis de datos al ser más fácil filtrar

---

## 📝 Notas de Implementación

### **Compatibilidad con Backend:**
El backend actual espera:
```
?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&branch_id=N
```

✅ El nuevo sistema genera exactamente este formato, sin cambios en backend.

### **Migration Path:**
1. Implementar SimplifiedFilters en paralelo (feature flag)
2. A/B testing con usuarios
3. Una vez validado, reemplazar completamente
4. Eliminar código viejo

### **Backward Compatibility:**
- URL query params se mantienen iguales
- API requests no cambian
- LocalStorage keys pueden cambiar (migración automática)

---

## 🎨 Tecnologías

- **UI Components**: Continuar con shadcn/ui
- **State Management**: Zustand (ya está)
- **Date Utils**: `date-fns` (agregar como dependencia)
- **Form Validation**: Zod (opcional, para type-safe validation)
- **Testing**: Jest + React Testing Library

---

## ⏱️ Estimación Total

- **Desarrollo**: 5 días
- **Testing**: 1 día
- **Review + Deploy**: 0.5 día

**Total: ~6.5 días** de trabajo

---

## 🔄 Próximos Pasos

1. **Review del plan** - Validar con stakeholders
2. **Priorización** - ¿Hacerlo ahora o después de otras features?
3. **Asignación** - ¿Quién lo implementa?
4. **Kickoff** - Preparar ambiente y crear branches

---

**¿Aprobás el plan? ¿Querés que arranque con la implementación?**
