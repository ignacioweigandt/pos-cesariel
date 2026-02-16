# Performance Optimization Report - Railway Deployment

**Fecha:** 16 Feb 2026  
**Proyecto:** POS Cesariel  
**Análisis:** Consumo de recursos y optimizaciones críticas

---

## 🔴 Problemas Críticos Encontrados

### 1. Polling Innecesario (ALTO IMPACTO)

#### Problema
Se están haciendo peticiones HTTP repetitivas cuando ya existe infraestructura WebSocket funcionando.

**Ubicaciones:**

1. **NotificationCenter** (`app/components/NotificationCenter.tsx`)
   - Polling cada 2 minutos (120,000ms)
   - 30 requests/hora por usuario
   ```typescript
   setInterval(() => {
     loadUnreadCount();
     if (isOpen) loadNotifications();
   }, 120000);
   ```

2. **EcommerceContainer** (`features/ecommerce/components/EcommerceContainer.tsx`)
   - Polling cada 30 segundos
   - 120 requests/hora por usuario
   ```typescript
   setInterval(() => {
     fetchStoreConfig();
     fetchStats();
   }, 30000);
   ```

3. **WhatsAppSalesManager** (`features/ecommerce/components/WhatsApp/WhatsAppSalesManager.tsx`)
   - ⚠️ **CRÍTICO**: Polling cada 10 segundos
   - 360 requests/hora por usuario
   ```typescript
   setInterval(() => {
     fetchSales();
     loadAvailableSales();
   }, 10000);
   ```

#### Impacto en Costos

**Por usuario activo:**
- Total: **510 requests/hora** de polling innecesario
- **12,240 requests/día** por usuario
- **366,000 requests/mes** por usuario

**Con 5 usuarios simultáneos:**
- **2,550 requests/hora**
- **61,200 requests/día**
- **1,836,000 requests/mes**

**Costo estimado en Railway:**
- Railway cobra por uso de CPU/RAM y requests
- Cada request consume CPU + memoria + ancho de banda
- Estimado: **$15-30/mes SOLO en polling innecesario**

#### Solución
✅ **Ya tienes WebSockets implementados** → Reemplazar TODO el polling por eventos WebSocket.

---

### 2. WebSocket ya existe pero no se usa correctamente

Ya tienes implementado:
- `useWebSocket` hook base
- `usePOSWebSocket` hook para branch-specific events
- Backend con WebSocket manager (`backend/websocket_manager.py`)

**Eventos disponibles:**
- `inventory_change` - Cambios de stock
- `new_sale` - Nuevas ventas
- `low_stock_alert` - Alertas de stock bajo
- `product_update` - Cambios en productos
- `sale_status_change` - Cambios de estado de órdenes
- `dashboard_update` - Actualizaciones de dashboard

**PERO:** Los componentes siguen usando polling en vez de escuchar estos eventos.

---

## 🚀 Optimizaciones Recomendadas

### Optimización 1: NotificationCenter - Usar WebSocket

**Antes (Polling):**
```typescript
// ❌ BAD: Polling cada 2 minutos
useEffect(() => {
  const interval = setInterval(() => {
    loadUnreadCount();
    if (isOpen) loadNotifications();
  }, 120000);
  return () => clearInterval(interval);
}, [isOpen]);
```

**Después (WebSocket):**
```typescript
// ✅ GOOD: Real-time updates via WebSocket
const { notifications, unreadCount, isConnected } = usePOSWebSocket(
  user.branch_id,
  token,
  true
);

// Solo cargar inicialmente, luego actualizar por WebSocket
useEffect(() => {
  loadNotifications();
  loadUnreadCount();
}, []); // Una sola vez al montar
```

**Ahorro:** De 30 requests/hora a 1 request inicial = **97% reducción**

---

### Optimización 2: EcommerceContainer - Usar WebSocket + Polling inteligente

**Antes:**
```typescript
// ❌ BAD: Polling agresivo cada 30 segundos
const interval = setInterval(() => {
  fetchStoreConfig();
  fetchStats();
}, 30000);
```

**Después:**
```typescript
// ✅ GOOD: WebSocket + polling reducido solo cuando está visible
// WebSocket para cambios en tiempo real
const { lastMessage } = usePOSWebSocket(branchId, token, activeTab === 'dashboard');

useEffect(() => {
  if (lastMessage?.type === 'dashboard_update') {
    fetchStats(); // Solo actualizar cuando hay cambio
  }
}, [lastMessage]);

// Polling de respaldo SOLO para config (cambia raramente) cada 5 minutos
useEffect(() => {
  if (activeTab === 'dashboard') {
    fetchStoreConfig(); // Inicial
    
    const interval = setInterval(() => {
      fetchStoreConfig(); // Config cambia raramente
    }, 300000); // 5 minutos en vez de 30 segundos
    
    return () => clearInterval(interval);
  }
}, [activeTab]);
```

**Ahorro:** De 120 requests/hora a ~12 requests/hora = **90% reducción**

---

### Optimización 3: WhatsAppSalesManager - CRÍTICO

**Antes:**
```typescript
// ❌ CRÍTICO: 360 requests/hora (cada 10 segundos!)
const interval = setInterval(() => {
  fetchSales();
  loadAvailableSales();
}, 10000);
```

**Después:**
```typescript
// ✅ GOOD: WebSocket + polling de respaldo moderado
const { lastMessage } = usePOSWebSocket(branchId, token, isOpen);

// Escuchar eventos de ventas en tiempo real
useEffect(() => {
  if (lastMessage?.type === 'new_sale' || lastMessage?.type === 'sale_status_change') {
    fetchSales();
    loadAvailableSales();
  }
}, [lastMessage]);

// Polling de respaldo SOLO cuando el modal está abierto, cada 2 minutos
useEffect(() => {
  if (isOpen && whatsappConfig) {
    fetchSales(); // Inicial
    loadAvailableSales();
    
    const interval = setInterval(() => {
      fetchSales();
      loadAvailableSales();
    }, 120000); // 2 minutos en vez de 10 segundos
    
    return () => clearInterval(interval);
  }
}, [isOpen, whatsappConfig]);
```

**Ahorro:** De 360 requests/hora a ~30 requests/hora = **92% reducción**

---

## 📊 Resumen de Impacto

### Antes de Optimizaciones
- **510 requests/hora** por usuario (solo polling)
- **12,240 requests/día** por usuario
- **366,000 requests/mes** por usuario
- **Con 5 usuarios:** 1.8M requests/mes

### Después de Optimizaciones
- **~40 requests/hora** por usuario
- **~960 requests/día** por usuario  
- **~29,000 requests/mes** por usuario
- **Con 5 usuarios:** ~145K requests/mes

### Ahorro Total
- **92% reducción en requests HTTP**
- **~$20-25/mes ahorro** en costos de Railway
- **Mejor UX:** Actualizaciones instantáneas en vez de esperar 10-120 segundos
- **Menos latencia:** WebSocket es más rápido que polling
- **Menos carga en DB:** Menos queries concurrentes

---

## 🔧 Otras Optimizaciones Recomendadas

### 4. Lazy Loading de Componentes

Algunos componentes pesados se cargan siempre:

```typescript
// ✅ GOOD: Lazy load modals
const ProductEditModal = dynamic(() => import('./Products/ProductEditModal'), {
  loading: () => <LoadingSpinner />
});
```

### 5. Memoización de Queries Pesadas

```typescript
// Backend: Cachear queries que no cambian frecuentemente
from functools import lru_cache

@lru_cache(maxsize=128)
def get_store_config(db: Session):
    # Esta query se ejecuta una vez y se cachea
    return db.query(StoreConfig).first()
```

### 6. Pagination en Listas Grandes

```typescript
// Frontend: Implementar paginación o infinite scroll
// En vez de cargar todos los productos, cargar de a 20
```

### 7. Compresión de Respuestas HTTP

```python
# Backend main.py
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### 8. CDN para Imágenes (Cloudinary)

Ya lo tienes configurado, asegúrate de usar transformaciones optimizadas:

```typescript
// Usar URLs con transformaciones de Cloudinary
const optimizedUrl = `${imageUrl}?w=400&q=auto&f=auto`;
```

---

## ✅ Checklist de Implementación

### Prioridad ALTA (Hacer YA)
- [ ] Optimizar WhatsAppSalesManager (10s → 2min + WebSocket)
- [ ] Optimizar EcommerceContainer (30s → 5min + WebSocket)
- [ ] Optimizar NotificationCenter (usar WebSocket)

### Prioridad MEDIA (Esta semana)
- [ ] Agregar GZip middleware en backend
- [ ] Implementar paginación en listas de productos
- [ ] Lazy loading de modales pesados

### Prioridad BAJA (Futuro)
- [ ] Cachear queries en backend con Redis
- [ ] Implementar service worker para caching de assets
- [ ] Optimizar bundle size con code splitting

---

## 🎯 Siguiente Paso

¿Querés que implemente las 3 optimizaciones de ALTA prioridad ahora mismo?

Esto te va a ahorrar ~$20-25/mes y va a mejorar significativamente la experiencia de usuario.
