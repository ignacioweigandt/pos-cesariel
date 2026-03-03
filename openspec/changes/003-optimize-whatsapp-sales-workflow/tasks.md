# Tasks: Optimizar Workflow de Ventas WhatsApp

**Relacionado con:** design.md  
**Estimación total:** 8-10 horas  
**Fecha inicio:** 2026-03-03

---

## 📋 Overview

### Fases
1. **Preparación** - 15 min
2. **Implementación Backend** - 3-4 horas
3. **Implementación Frontend** - 2-3 horas
4. **Testing** - 1 hora
5. **Deployment** - 30 min
6. **Monitoring** - 30 min

---

## 1️⃣ FASE: Preparación

### 1.1 Setup de Entorno
- [ ] **Branch creada:** `git checkout -b feature/optimize-whatsapp-workflow`
- [ ] **Dependencies actualizadas:** Ya están OK (no hay nuevas dependencies)
- [ ] **Tests baseline pasando:** `docker compose exec backend pytest -v`
- [ ] **Docker compose UP:** `docker compose up -d` (todos los servicios corriendo)
- [ ] **Backup de BD:** ❌ **NO requerido** (no hay cambios de schema)

**Tiempo estimado:** 5 minutos

---

### 1.2 Migración de Base de Datos

✅ **NO APLICA** - Este cambio usa campos existentes (`Sale.order_status`, `WhatsAppSale.sale_id`)

**Tiempo ahorrado:** 15 minutos

---

## 2️⃣ FASE: Implementación Backend

### 2.1 Backend - Models

✅ **NO APLICA** - Usamos modelos existentes (`Sale`, `WhatsAppSale`, `BranchStock`, `ProductSize`, `InventoryMovement`)

**Tiempo ahorrado:** 20 minutos

---

### 2.2 Backend - Schemas

**Archivo:** `backend/app/schemas/whatsapp.py`

- [ ] **Schema creado: `WhatsAppSaleStatusUpdate`**
  ```python
  from pydantic import BaseModel
  from app.models.enums import OrderStatus
  
  class WhatsAppSaleStatusUpdate(BaseModel):
      """Schema para actualizar estado de venta WhatsApp."""
      new_status: OrderStatus
      
      class Config:
          use_enum_values = True  # Permite strings "PROCESSING"
  ```

- [ ] **Registrado en** `backend/app/schemas/__init__.py`
  ```python
  from app.schemas.whatsapp import (
      # ... existing imports
      WhatsAppSaleStatusUpdate  # ADD THIS
  )
  
  __all__ = [
      # ... existing exports
      "WhatsAppSaleStatusUpdate",  # ADD THIS
  ]
  ```

**Tiempo estimado:** 10 minutos

---

### 2.3 Backend - Service Helper

**Archivo:** `backend/app/services/inventory_service.py` (crear si no existe)

- [ ] **Crear archivo** `backend/app/services/inventory_service.py`

- [ ] **Implementar función `adjust_stock_for_sale()`**
  ```python
  from typing import Literal, List, Dict
  from sqlalchemy.orm import Session
  from app.models import Sale, SaleItem, BranchStock, ProductSize, InventoryMovement, Product
  
  def adjust_stock_for_sale(
      db: Session,
      sale: Sale,
      operation: Literal["deduct", "revert"]
  ) -> List[Dict]:
      """
      Ajusta stock para todos los items de una venta.
      
      Args:
          db: Sesión de BD
          sale: Venta con sale_items cargados
          operation: "deduct" (descuenta) o "revert" (revierte)
      
      Returns:
          Lista de cambios: [{product_id, product_name, size, quantity_adjusted, new_stock}]
      
      Raises:
          ValueError: Si no hay stock suficiente (solo en deduct)
      """
      # Ver pseudocódigo completo en design.md líneas 485-599
      pass  # IMPLEMENTAR
  ```

- [ ] **Validación de stock** (solo si operation="deduct")
  - Iterar `sale.sale_items`
  - Si `product.has_sizes`: verificar `ProductSize.quantity >= item.quantity`
  - Si NO tiene sizes: verificar `BranchStock.quantity >= item.quantity`
  - Lanzar `ValueError` con mensaje descriptivo si falta stock

- [ ] **Ajuste de stock**
  - Calcular `quantity_change = item.quantity * multiplier` (multiplier: -1 si deduct, +1 si revert)
  - Si `product.has_sizes`: actualizar `ProductSize.quantity`
  - Si NO: actualizar `BranchStock.quantity`

- [ ] **Crear `InventoryMovement`** por cada item
  - `quantity = quantity_change` (negativo si deduct, positivo si revert)
  - `reason = "Venta WhatsApp #{sale_number} confirmada"` o `"Cancelación..."`
  - `movement_type = "sale"` (si deduct) o `"adjustment"` (si revert)

- [ ] **Retornar lista de cambios** para respuesta de API

**Tiempo estimado:** 1 hora 30 minutos

**Archivo de referencia:** `design.md` líneas 485-599 (pseudocódigo completo)

---

### 2.4 Backend - Router (nuevo endpoint)

**Archivo:** `backend/routers/ecommerce_advanced.py`

- [ ] **Importar dependencias necesarias**
  ```python
  from app.models.enums import OrderStatus, can_transition_order_status
  from app.schemas.whatsapp import WhatsAppSaleStatusUpdate
  from app.services.inventory_service import adjust_stock_for_sale
  from websocket_manager import notify_new_sale
  ```

- [ ] **Implementar endpoint `PATCH /whatsapp-sales/{id}/status`**
  ```python
  @router.patch("/whatsapp-sales/{id}/status")
  def update_whatsapp_sale_status(
      id: int,
      status_update: WhatsAppSaleStatusUpdate,
      db: Session = Depends(get_db),
      current_user: User = Depends(require_manager_or_admin)
  ):
      # Ver pseudocódigo completo en design.md líneas 400-480
      pass  # IMPLEMENTAR
  ```

- [ ] **1. Obtener WhatsAppSale + Sale** (join)
  ```python
  whatsapp_sale = db.query(WhatsAppSale).filter(WhatsAppSale.id == id).first()
  if not whatsapp_sale:
      raise HTTPException(404, "Venta WhatsApp no encontrada")
  
  sale = whatsapp_sale.sale
  current_status = sale.order_status
  new_status = status_update.new_status
  ```

- [ ] **2. Validar transición**
  ```python
  if not can_transition_order_status(current_status, new_status):
      raise HTTPException(400, f"Transición inválida: {current_status.value} → {new_status.value}")
  ```

- [ ] **3. Lógica según transición**
  
  - [ ] **PENDING → PROCESSING:** Descontar stock + notificar
    ```python
    if current_status == OrderStatus.PENDING and new_status == OrderStatus.PROCESSING:
        try:
            stock_changes = adjust_stock_for_sale(db, sale, operation="deduct")
        except ValueError as e:
            raise HTTPException(400, str(e))
        
        notify_new_sale(
            branch_id=sale.branch_id,
            sale_id=sale.id,
            sale_number=sale.sale_number,
            total_amount=float(sale.total_amount)
        )
    ```
  
  - [ ] **PROCESSING/SHIPPED → CANCELLED:** Revertir stock
    ```python
    elif new_status == OrderStatus.CANCELLED and current_status in [OrderStatus.PROCESSING, OrderStatus.SHIPPED]:
        stock_changes = adjust_stock_for_sale(db, sale, operation="revert")
    ```

- [ ] **4. Actualizar estado de Sale**
  ```python
  sale.order_status = new_status
  db.commit()
  db.refresh(sale)
  ```

- [ ] **5. Retornar respuesta**
  ```python
  return {
      "message": f"Estado actualizado a {new_status.value}",
      "sale": sale,
      "stock_changes": stock_changes
  }
  ```

**Tiempo estimado:** 1 hora

**Archivo de referencia:** `design.md` líneas 400-480

---

## 2️⃣ FASE: Implementación Frontend

### 2.5 Frontend - API Client

**Archivo:** `frontend/pos-cesariel/features/ecommerce/api/ecommerceAdvancedApi.ts`

- [ ] **Agregar función `updateWhatsAppSaleStatus()`**
  ```typescript
  export async function updateWhatsAppSaleStatus(
    id: number,
    newStatus: string
  ): Promise<{ message: string; sale: any; stock_changes: any[] }> {
    const response = await apiClient.patch(
      `/ecommerce-advanced/whatsapp-sales/${id}/status`,
      { new_status: newStatus }
    );
    return response.data;
  }
  ```

**Tiempo estimado:** 5 minutos

---

### 2.6 Frontend - Hook (React Query mutation)

**Archivo:** `frontend/pos-cesariel/features/ecommerce/hooks/useWhatsAppSales.ts`

- [ ] **Importar dependencias**
  ```typescript
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import { updateWhatsAppSaleStatus } from '../api/ecommerceAdvancedApi';
  import { toast } from 'react-hot-toast'; // O tu librería de toast
  ```

- [ ] **Crear mutation `useUpdateWhatsAppSaleStatus()`**
  ```typescript
  export function useUpdateWhatsAppSaleStatus() {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
        updateWhatsAppSaleStatus(id, newStatus),
      
      onSuccess: (data, variables) => {
        // Invalidar cache
        queryClient.invalidateQueries(['whatsapp-sales']);
        
        // Update optimista (opcional)
        queryClient.setQueryData(['whatsapp-sales'], (old: any) => {
          return old?.map((sale: any) =>
            sale.id === variables.id
              ? { ...sale, sale: { ...sale.sale, order_status: variables.newStatus } }
              : sale
          );
        });
        
        toast.success(data.message);
      },
      
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Error al actualizar estado';
        toast.error(message);
      }
    });
  }
  ```

**Tiempo estimado:** 15 minutos

---

### 2.7 Frontend - Component UI (WhatsAppSales)

**Archivo:** `frontend/pos-cesariel/features/ecommerce/components/WhatsAppSales.tsx`

- [ ] **Agregar config de estados** (al inicio del componente)
  ```typescript
  const STATUS_CONFIG = {
    PENDING: { label: "Pendiente", color: "yellow", icon: "⏳" },
    PROCESSING: { label: "En Preparación", color: "blue", icon: "📦" },
    SHIPPED: { label: "Enviado", color: "purple", icon: "🚚" },
    DELIVERED: { label: "Entregado", color: "green", icon: "✅" },
    CANCELLED: { label: "Cancelado", color: "red", icon: "❌" }
  };
  ```

- [ ] **Agregar columna de estado** (en tabla)
  ```tsx
  <td>
    <Badge variant={STATUS_CONFIG[sale.sale.order_status]?.color || 'gray'}>
      {STATUS_CONFIG[sale.sale.order_status]?.icon} {STATUS_CONFIG[sale.sale.order_status]?.label}
    </Badge>
  </td>
  ```

- [ ] **Agregar modal de confirmación** (componente o hook)
  ```tsx
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    saleId: number;
    newStatus: string;
    message: string;
  }>({ open: false, saleId: 0, newStatus: '', message: '' });
  
  function showConfirmModal(saleId: number, newStatus: string, message: string) {
    setConfirmModal({ open: true, saleId, newStatus, message });
  }
  ```

- [ ] **Agregar componente `ActionButtons`**
  ```tsx
  function ActionButtons({ sale, onUpdateStatus }: { sale: any; onUpdateStatus: (id: number, status: string) => void }) {
    const { order_status } = sale.sale;
    const { mutate, isLoading } = useUpdateWhatsAppSaleStatus();
    
    const handleUpdate = (newStatus: string, confirmMessage: string) => {
      if (window.confirm(confirmMessage)) {
        mutate({ id: sale.id, newStatus });
      }
    };
    
    if (order_status === 'PENDING') {
      return (
        <>
          <Button 
            variant="success"
            onClick={() => handleUpdate('PROCESSING', '¿Confirmar pago? Esto descontará el stock.')}
            disabled={isLoading}
          >
            ✅ Confirmar Pago
          </Button>
          <Button 
            variant="danger"
            onClick={() => handleUpdate('CANCELLED', '¿Cancelar pedido?')}
            disabled={isLoading}
          >
            ❌ Cancelar
          </Button>
        </>
      );
    }
    
    if (order_status === 'PROCESSING') {
      return (
        <>
          <Button onClick={() => handleUpdate('SHIPPED', '¿Marcar como enviado?')} disabled={isLoading}>
            📦 Marcar como Enviado
          </Button>
          <Button 
            variant="danger"
            onClick={() => handleUpdate('CANCELLED', '¿Cancelar? Esto revertirá el stock.')}
            disabled={isLoading}
          >
            ❌ Cancelar (Revertir Stock)
          </Button>
        </>
      );
    }
    
    if (order_status === 'SHIPPED') {
      return (
        <Button onClick={() => handleUpdate('DELIVERED', '¿Marcar como entregado?')} disabled={isLoading}>
          ✅ Marcar como Entregado
        </Button>
      );
    }
    
    if (order_status === 'DELIVERED') {
      return <Badge variant="success">Entregado ✅</Badge>;
    }
    
    if (order_status === 'CANCELLED') {
      return <Badge variant="danger">Cancelado ❌</Badge>;
    }
    
    return null;
  }
  ```

- [ ] **Agregar columna de acciones** en tabla
  ```tsx
  <td>
    <ActionButtons sale={sale} />
  </td>
  ```

**Tiempo estimado:** 1 hora 30 minutos

---

### 2.8 Frontend - Eliminar Sección "Ventas"

**Archivos afectados:**
- `frontend/pos-cesariel/features/ecommerce/components/EcommerceSales.tsx` (eliminar o marcar deprecated)
- Navegación del módulo e-commerce (remover link)

- [ ] **Comentar o eliminar componente** `EcommerceSales.tsx`
  ```tsx
  // DEPRECATED: Sección "Ventas" eliminada. 
  // Ahora todo el flujo se maneja desde WhatsAppSales con estados.
  // Mantener comentado por si cliente pide rollback temporal.
  
  /* export function EcommerceSales() {
    ... código original ...
  } */
  ```

- [ ] **Actualizar navegación** (remover link a "Ventas")
  - Buscar archivo de navegación (probablemente `Navigation.tsx` o similar)
  - Comentar o eliminar el link a la sección "Ventas"

- [ ] **Verificar rutas** en `app/` (Next.js)
  - Asegurarse de que no haya página `/ecommerce/sales` o similar
  - Si existe, redirigir a `/ecommerce/whatsapp-sales`

**Tiempo estimado:** 30 minutos

---

## 3️⃣ FASE: Testing

### 3.1 Tests Unitarios - Backend

**Archivo:** `backend/tests/unit/test_whatsapp_workflow.py` (nuevo)

- [ ] **Crear archivo de tests**

- [ ] **Test: `test_adjust_stock_deduct_success()`**
  - Arrange: Sale con items, stock inicial = 100
  - Act: `adjust_stock_for_sale(db, sale, "deduct")`
  - Assert: Stock descontado correctamente

- [ ] **Test: `test_adjust_stock_insufficient_raises_error()`**
  - Arrange: Sale con items, stock = 1 (menos que lo requerido)
  - Act & Assert: `pytest.raises(ValueError, match="Stock insuficiente")`

- [ ] **Test: `test_adjust_stock_revert_success()`**
  - Arrange: Descontar primero, luego revertir
  - Assert: Stock vuelve al valor original

- [ ] **Test: `test_update_status_pending_to_processing()`**
  - Act: `PATCH /whatsapp-sales/{id}/status` con `new_status=PROCESSING`
  - Assert: 200 OK, `order_status=PROCESSING`, stock descontado

- [ ] **Test: `test_update_status_invalid_transition_rejected()`**
  - Arrange: Sale con `order_status=DELIVERED`
  - Act: Intentar cambiar a PENDING
  - Assert: 400 Bad Request, "Transición inválida"

**Comando:** `docker compose exec backend pytest tests/unit/test_whatsapp_workflow.py -v`

**Tiempo estimado:** 45 minutos

---

### 3.2 Tests de Integración - Backend

**Archivo:** `backend/tests/integration/test_whatsapp_sales_api.py` (crear si no existe)

- [ ] **Test: `test_patch_status_requires_auth()`**
  - Act: PATCH sin headers de auth
  - Assert: 401 Unauthorized

- [ ] **Test: `test_patch_status_requires_manager_or_admin()`**
  - Act: PATCH con `auth_headers_seller` (rol SELLER)
  - Assert: 403 Forbidden

- [ ] **Test: `test_patch_status_not_found()`**
  - Act: PATCH a `/whatsapp-sales/99999/status` (no existe)
  - Assert: 404 Not Found

- [ ] **Test: `test_patch_status_full_workflow()`**
  - PENDING → PROCESSING (confirmar)
  - PROCESSING → SHIPPED (enviar)
  - SHIPPED → DELIVERED (entregar)
  - Verificar stock en cada paso

**Comando:** `docker compose exec backend pytest tests/integration/test_whatsapp_sales_api.py -v`

**Tiempo estimado:** 30 minutos

---

### 3.3 Linting y Code Quality

- [ ] **Backend linting** (si se configuró)
  ```bash
  docker compose exec backend pylint app/services/inventory_service.py --fail-under=8.0
  docker compose exec backend pylint routers/ecommerce_advanced.py --fail-under=8.0
  ```

- [ ] **Frontend linting**
  ```bash
  cd frontend/pos-cesariel
  npm run lint
  ```

**Tiempo estimado:** 5 minutos

---

### 3.4 Testing Manual Local

- [ ] **Iniciar todos los servicios:** `docker compose up -d`
- [ ] **Login como Admin** en http://localhost:3000
- [ ] **Navegar a E-commerce → Ventas WhatsApp**
- [ ] **Verificar badges de estado** se muestran correctamente
- [ ] **Crear venta de prueba** (o usar existente en estado PENDING)
- [ ] **Click "Confirmar Pago"**
  - Verificar modal de confirmación aparece
  - Confirmar acción
  - Verificar que badge cambia a "En Preparación" (PROCESSING)
  - Verificar en PostgreSQL que `order_status` cambió
  - Verificar que stock se descontó en tabla `branch_stock`
  - Verificar que se creó `inventory_movement` con reason correcto
- [ ] **Click "Marcar como Enviado"** → Badge cambia a SHIPPED
- [ ] **Click "Marcar como Entregado"** → Badge cambia a DELIVERED
- [ ] **Verificar cancelación** (crear otra venta PENDING)
  - Click "Cancelar"
  - Verificar badge cambia a CANCELLED
  - Verificar que NO se descontó stock (porque estaba en PENDING)
- [ ] **Verificar cancelación con reversión** (venta en PROCESSING)
  - Confirmar pago primero
  - Luego cancelar
  - Verificar que stock se REVIRTIÓ correctamente
- [ ] **Verificar sección "Ventas" eliminada** (no debe aparecer en navegación)

**Tiempo estimado:** 30 minutos

---

## 4️⃣ FASE: Deployment

### 4.1 Pre-Deploy Checklist

- [ ] **Tests backend pasando:** `docker compose exec backend pytest -v`
- [ ] **Tests frontend (si hay):** `cd frontend/pos-cesariel && npm test`
- [ ] **Linting OK:** Backend y frontend
- [ ] **Migrations:** ❌ NO APLICA (no hay cambios de schema)
- [ ] **Backup de BD:** ❌ NO REQUERIDO (no hay migrations)
- [ ] **Variables de entorno:** ✅ Ya configuradas en Railway (no hay nuevas)
- [ ] **Commit y push a feature branch:**
  ```bash
  git add .
  git commit -m "feat: optimize WhatsApp sales workflow with OrderStatus automation"
  git push origin feature/optimize-whatsapp-workflow
  ```

**Tiempo estimado:** 10 minutos

---

### 4.2 Deployment a Producción

#### Merge a main branch
```bash
git checkout main
git pull origin main
git merge feature/optimize-whatsapp-workflow
git push origin main
```

#### Railway auto-deploy
- Railway detecta push a `main`
- Auto-deploy de backend (~3 min)
- Auto-deploy de frontend POS (~3 min)
- Monitorear en: https://railway.app/project/[project-id]/deployments

**Tiempo estimado:** 5 minutos (merge) + 6 minutos (Railway build)

---

### 4.3 Aplicar Migraciones

✅ **NO APLICA** - No hay cambios de schema

**Tiempo ahorrado:** 5 minutos

---

## 5️⃣ FASE: Monitoring y Verificación

### 5.1 Health Checks

- [ ] **Backend health check**
  ```bash
  curl https://backend-production-c20a.up.railway.app/docs
  # Expected: Swagger UI carga correctamente
  ```

- [ ] **Verificar nuevo endpoint existe**
  ```bash
  curl -X PATCH https://backend-production-c20a.up.railway.app/ecommerce-advanced/whatsapp-sales/1/status \
    -H "Authorization: Bearer <admin-token>" \
    -H "Content-Type: application/json" \
    -d '{"new_status": "PROCESSING"}' \
    -w "\nHTTP Status: %{http_code}\n"
  
  # Expected: 200 OK o 400/404 (si no existe venta 1)
  # NO debe dar 404 "endpoint not found"
  ```

**Tiempo estimado:** 3 minutos

---

### 5.2 Smoke Testing en Producción

- [ ] **Escenario 1: Confirmar venta PENDING**
  1. Login como Admin en https://frontend-pos-production.up.railway.app
  2. Navegar a E-commerce → Ventas WhatsApp
  3. Buscar venta en estado PENDING (o crear una de prueba desde e-commerce público)
  4. Click "Confirmar Pago"
  5. Confirmar en modal
  6. **Resultado esperado:** Badge cambia a "En Preparación", stock se descuenta

- [ ] **Escenario 2: Verificar stock descontado**
  1. Ir a Inventario
  2. Buscar producto de la venta confirmada
  3. **Resultado esperado:** Stock disminuyó en la cantidad vendida

- [ ] **Escenario 3: Verificar venta en Dashboard**
  1. Ir a Dashboard
  2. **Resultado esperado:** Venta confirmada aparece en métricas y ventas recientes

- [ ] **Escenario 4: Cancelar y revertir stock**
  1. Crear venta de prueba, confirmar pago (PROCESSING)
  2. Cancelar venta
  3. **Resultado esperado:** Stock se revierte correctamente

- [ ] **Escenario 5: Sección "Ventas" eliminada**
  1. Navegar por módulo E-commerce
  2. **Resultado esperado:** NO debe aparecer link a "Ventas" en navegación

**Tiempo estimado:** 15 minutos

---

### 5.3 Verificación de Logs

```bash
# Ver logs de backend (últimas 100 líneas)
railway logs -s backend --tail 100

# Buscar errores
railway logs -s backend | grep ERROR

# Buscar confirmaciones de ventas
railway logs -s backend | grep "Venta WhatsApp.*confirmada"
```

**Verificar:**
- [ ] Sin errores 500 en logs
- [ ] Sin excepciones no manejadas
- [ ] Sin warnings críticos de stock
- [ ] Logs de confirmación de ventas aparecen correctamente

**Tiempo estimado:** 5 minutos

---

### 5.4 Verificación en Base de Datos

**Conectarse a PostgreSQL de Railway:**
```bash
railway connect -s postgres

# O usar Adminer: http://localhost:8080 (si está configurado con Railway DB)
```

**Queries de verificación:**

- [ ] **Verificar inventory_movements creados**
  ```sql
  SELECT * 
  FROM inventory_movements 
  WHERE reason LIKE '%Venta WhatsApp%' 
    AND created_at > NOW() - INTERVAL '1 day'
  ORDER BY created_at DESC
  LIMIT 10;
  ```

- [ ] **Verificar ventas en PROCESSING**
  ```sql
  SELECT s.id, s.sale_number, s.order_status, s.total_amount, s.created_at
  FROM sales s
  JOIN whatsapp_sales ws ON ws.sale_id = s.id
  WHERE s.order_status = 'PROCESSING' 
    AND s.sale_type = 'ECOMMERCE'
  ORDER BY s.created_at DESC
  LIMIT 10;
  ```

- [ ] **Verificar NO hay stock negativo** (regla de negocio)
  ```sql
  SELECT product_id, branch_id, quantity 
  FROM branch_stock 
  WHERE quantity < 0;
  
  -- Expected: 0 rows (no debe haber stock negativo)
  ```

**Tiempo estimado:** 5 minutos

---

### 5.5 Monitoring de Métricas (primeras 24 horas)

**Railway Dashboard - Verificar cada 6 horas:**
- [ ] **CPU Usage:** < 60% (similar a baseline)
- [ ] **Memory Usage:** < 500 MB (sin memory leaks)
- [ ] **Request Count:** Patrón normal (no incremento anómalo)
- [ ] **Response Time p95:** < 500ms

**PostgreSQL:**
- [ ] **Active Connections:** < 20
- [ ] **Query Latency:** Sin degradación notable

**Logs:**
- [ ] Revisar errores cada 6 horas primeras 24h
- [ ] Buscar patrones anómalos

**Tiempo estimado:** 5 minutos cada 6 horas (día 1)

---

## ✅ Checklist Final

### Pre-Deploy
- [ ] Todos los tasks de implementación backend completados
- [ ] Todos los tasks de implementación frontend completados
- [ ] Tests unitarios pasando (backend)
- [ ] Tests de integración pasando (backend)
- [ ] Linting pasando (backend + frontend)
- [ ] Testing manual local exitoso
- [ ] Código commiteado y pusheado

### Post-Deploy
- [ ] Health checks OK en producción
- [ ] Smoke tests OK en producción
- [ ] Logs sin errores críticos
- [ ] Métricas dentro de lo esperado
- [ ] Features funcionando correctamente
- [ ] Cliente/usuario puede confirmar ventas exitosamente
- [ ] Stock se descuenta/revierte correctamente

### Post-Mortem (48 horas)
- [ ] Métricas revisadas (CPU, memoria, latencia)
- [ ] Feedback del admin recopilado ("¿Es más rápido el nuevo flujo?")
- [ ] Learnings capturados en Engram
  ```bash
  # Usar mcp_engram_mem_save con tipo "architecture"
  # Title: "Optimización workflow WhatsApp con OrderStatus"
  # Content: Qué se hizo, por qué, dónde, learnings
  ```
- [ ] Documentación actualizada en `CLAUDE.md`
  - Sección "Common Workflows" → Agregar flujo de confirmación WhatsApp
  - Sección "API Endpoints" → Agregar `PATCH /ecommerce-advanced/whatsapp-sales/{id}/status`
- [ ] Cambio movido a `openspec/changes/archive/003-optimize-whatsapp-sales-workflow/`

---

## 📝 Notas de Implementación

### Decisiones Tomadas Durante Implementación
[Espacio para notas en tiempo real]

### Problemas Encontrados y Soluciones
[Espacio para documentar issues y cómo se resolvieron]

### Mejoras Futuras Identificadas
[Espacio para ideas que surgieron pero están fuera de scope]

---

## 🎯 Próximos Pasos Post-Implementación

1. **Monitorear adopción** - ¿El admin usa el nuevo flujo? ¿Encuentra confuso algún botón?
2. **Capturar métricas** - Tiempo promedio de confirmación antes vs después
3. **Considerar iteraciones:**
   - Email automático al cliente cuando se confirma pago
   - WhatsApp Business API integration (enviar mensaje automático)
   - Sistema de tracking de envíos (agregar campo tracking_number en Sale)
4. **Archivar cambio** cuando esté estabilizado (1-2 semanas en producción sin issues)

---

**TOTAL TIEMPO ESTIMADO:** 8-10 horas (1-2 días de desarrollo)

**ESTADO:** [ ] En Progreso | [ ] Completado | [ ] Bloqueado

**BLOQUEADORES (si aplica):**
- Ninguno identificado

**FECHA COMPLETADO:** _____________
