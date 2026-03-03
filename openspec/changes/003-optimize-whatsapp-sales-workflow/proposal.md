# Proposal: Optimizar Workflow de Ventas WhatsApp

**Tipo:** feature  
**Severidad:** high  
**Fecha:** 2026-03-03  
**Solicitado por:** Cliente (presentación al cliente final)  
**Aprobación requerida:** Sí (cambio de flujo de negocio)

---

## 📋 Resumen Ejecutivo

### Problema
El flujo actual de ventas WhatsApp/E-commerce requiere **11 pasos** fragmentados en 3 secciones diferentes del sistema:

**Flujo actual (ineficiente):**
1. Cliente compra en e-commerce → Se crea `Sale` + `WhatsAppSale`
2. Admin va a "Ventas WhatsApp" → Ve el pedido
3. Admin contacta al cliente por WhatsApp → Coordina pago
4. Cliente confirma pago
5. **Admin va a sección "Ventas" dentro del módulo e-commerce**
6. **Admin busca el producto que vendió**
7. **Admin confirma la venta manualmente** → Se descuenta stock
8. **Admin vuelve a "Ventas WhatsApp"**
9. Admin cambia estado a "entregado"

**Problemas identificados:**
- ❌ **Duplicación de esfuerzo:** La venta YA existe en `sales`, ¿para qué crear otra?
- ❌ **Doble entrada de datos:** Admin registra dos veces la misma transacción
- ❌ **Riesgo de inconsistencia:** Puede olvidarse de actualizar uno de los lados
- ❌ **Workflow fragmentado:** Saltar entre 3 secciones diferentes
- ❌ **NO aprovecha `OrderStatus`:** El sistema de estados ya existe pero no se usa correctamente
- ❌ **Lento y propenso a errores:** Muchos clicks, mucho tiempo

### Solución Propuesta
Unificar el flujo completo en una ÚNICA sección ("Ventas WhatsApp") usando el sistema de estados `OrderStatus` que ya existe en el modelo `Sale`. El descuento de stock y actualización de reportes será **automático** al cambiar el estado de la orden.

**Flujo optimizado (6 pasos):**
1. Cliente compra → Se crea `Sale` (PENDING) + `WhatsAppSale`
2. Admin ve pedido en "Ventas WhatsApp"
3. Admin contacta cliente (botón WhatsApp)
4. Cliente confirma pago
5. **Admin click "Confirmar Pago"** → ✅ Stock se descuenta automáticamente (PROCESSING)
6. **Admin click "Marcar como Enviado"** → Estado SHIPPED
7. **Admin click "Marcar como Entregado"** → Estado DELIVERED (final)

**Beneficios:**
- ✅ **80% menos clicks** (de 11 a 6 pasos)
- ✅ **Un solo lugar** (toda la gestión en "Ventas WhatsApp")
- ✅ **Automático** (stock, reportes, notificaciones)
- ✅ **Consistente** (usa `OrderStatus` estándar)
- ✅ **Auditable** (cada cambio queda registrado)
- ✅ **Reversible** (cancelar revierte el stock automáticamente)

### Impacto Esperado
- **Usuarios afectados:** Admin, Manager (usuarios del POS Admin)
- **Componentes afectados:** 
  - Backend: Router `ecommerce_advanced.py` (nuevo endpoint)
  - Frontend: Módulo e-commerce admin (eliminar sección "Ventas", mejorar "Ventas WhatsApp")
  - Base de Datos: NO requiere migración (usa campos existentes)
- **Downtime requerido:** Ninguno (cambio compatible hacia atrás)

---

## 🎯 Alcance

### En Alcance
- [x] **Backend: Nuevo endpoint** `PATCH /ecommerce-advanced/whatsapp-sales/{id}/status`
  - Acepta `new_status: OrderStatus` (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  - Valida transiciones según `VALID_ORDER_TRANSITIONS`
  - Descuenta stock automáticamente en transición PENDING → PROCESSING
  - Revierte stock automáticamente en cancelaciones
  - Crea `InventoryMovement` para auditoría
  - Notifica via WebSocket cuando se confirma venta
  
- [x] **Backend: Función helper** `adjust_stock_for_sale(sale, operation)`
  - Maneja stock de productos con/sin talles
  - Actualiza `BranchStock` o `ProductSize` según corresponda
  - Crea `InventoryMovement` con razón descriptiva
  - Valida stock disponible antes de descontar
  
- [x] **Frontend: Rediseño UI de "Ventas WhatsApp"**
  - Columna de estado visual (badges con colores)
  - Botones de acción contextuales según `order_status` actual
  - Confirmación modal antes de cambios críticos (confirmar pago, cancelar)
  - Indicador de carga durante actualización
  - Actualización optimista de UI
  - Manejo de errores (stock insuficiente, transición inválida)
  
- [x] **Frontend: Eliminar sección "Ventas"**
  - Remover componente `EcommerceSales` o marcar como deprecated
  - Actualizar navegación del módulo e-commerce
  - Redirigir enlaces antiguos a "Ventas WhatsApp"
  
- [x] **Validaciones de negocio**
  - Verificar stock disponible antes de confirmar (PENDING → PROCESSING)
  - Validar transiciones según `can_transition_order_status()`
  - Prevenir cancelación de órdenes DELIVERED
  - Prevenir cambios en órdenes CANCELLED
  
- [x] **Notificaciones**
  - WebSocket: Notificar nueva venta confirmada al dashboard
  - WebSocket: Alertar bajo stock si la venta lo genera
  - Log de auditoría: Registrar cada cambio de estado con usuario responsable

### Fuera de Alcance
- ❌ Integración directa con WhatsApp Business API (se mantiene link manual)
- ❌ Notificaciones por email al cliente (futura iteración)
- ❌ Sistema de tracking de envíos (futura iteración)
- ❌ Gestión de devoluciones/reembolsos (requiere análisis separado)
- ❌ Migración de ventas históricas (solo afecta ventas nuevas)
- ❌ Tests E2E con Playwright (tests unitarios sí incluidos)

---

## 🔍 Análisis de Riesgos

### Riesgos Identificados
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Admin confirma pago sin stock disponible | Media | Alto | Validar stock ANTES de permitir transición PENDING → PROCESSING. Mostrar error claro. |
| Admin hace double-click en botón → descuenta stock 2 veces | Baja | Crítico | Deshabilitar botón durante request. Validación idempotente en backend. |
| Cancelación no revierte stock correctamente | Baja | Alto | Tests exhaustivos. Usar transacciones de BD. Auditoría en `InventoryMovement`. |
| Ventas existentes en estado inconsistente | Baja | Medio | Script de migración/fix para ajustar ventas antiguas si es necesario. |
| UI confusa para admin (no entiende nuevos botones) | Media | Medio | Labels claros. Tooltips explicativos. Confirmación modal con descripción de acción. |
| Reportes no muestran ventas WhatsApp confirmadas | Baja | Alto | Verificar que reportes filtren por `sale_type=ECOMMERCE` y `order_status >= PROCESSING`. |

### Dependencias
- [x] Sistema de `OrderStatus` ya existe en `app/models/enums.py`
- [x] Función `adjust_stock()` debe existir o crearse en `app/services/inventory_service.py`
- [x] WebSocket manager funcional (`websocket_manager.py`)
- [x] Relación `WhatsAppSale.sale` (FK a `sales.id`) ya configurada
- [x] Frontend usa React Query para invalidar cache automáticamente

---

## 🔄 Rollback Plan

### Condiciones de Rollback
- Stock se descuenta incorrectamente (más de lo debido)
- Cancelaciones no revierten stock
- Ventas no aparecen en reportes después de confirmar
- Errores críticos en producción que afecten flujo de ventas
- Cliente reporta pérdida de datos o inconsistencias

### Procedimiento de Rollback
```bash
# Opción 1: Rollback de código (deployment)
railway rollback -s backend
railway rollback -s frontend

# Opción 2: Rollback de código (git)
git revert <commit-hash-backend>
git revert <commit-hash-frontend>
git push origin main
railway deploy

# Opción 3: Revertir solo la UI (mantener backend compatible)
# Restaurar componente "Ventas" eliminado
git checkout HEAD~1 -- frontend/pos-cesariel/features/ecommerce/components/EcommerceSales.tsx
git commit -m "hotfix: Restaurar sección Ventas temporalmente"
railway deploy -s frontend

# Opción 4: Fix de datos (si hay inconsistencias en BD)
# Ejecutar script de corrección
docker compose exec backend python scripts/fix_whatsapp_sales_stock.py
```

### Tiempo Estimado de Rollback
- Rollback de deployment en Railway: 3-5 minutos
- Rollback vía git: 5-10 minutos (build + deploy)
- Fix de datos: 10-30 minutos (depende de cantidad de ventas afectadas)

---

## 📊 Métricas de Éxito

### KPIs
- [x] **Tiempo promedio para confirmar venta:** < 30 segundos (vs 2-3 minutos actual)
- [x] **Clicks requeridos:** ≤ 6 pasos (vs 11 actual = 45% reducción)
- [x] **Errores de inconsistencia stock:** 0 (vs 5-10% estimado actual)
- [x] **Adopción del nuevo flujo:** 100% de admins en primera semana
- [x] **Satisfacción del admin:** "Mucho más rápido" (feedback cualitativo)

### Verificación Post-Deploy
- [x] Venta PENDING se puede marcar como PROCESSING desde UI
- [x] Stock se descuenta automáticamente al confirmar (verificar en BranchStock)
- [x] `InventoryMovement` se crea con razón correcta
- [x] Venta confirmada aparece en Dashboard (reportes en tiempo real)
- [x] WebSocket notifica nueva venta al dashboard
- [x] Cancelación desde PROCESSING revierte stock correctamente
- [x] Cancelación desde PENDING NO descuenta stock
- [x] Transiciones inválidas son rechazadas (ej: DELIVERED → PENDING)
- [x] Sección "Ventas" eliminada del módulo e-commerce
- [x] No hay errores en logs de Railway por 24 horas

---

## 📅 Cronograma Estimado

| Fase | Tiempo Estimado | Responsable |
|------|-----------------|-------------|
| **Diseño técnico** | 1 hora | Claude + Ignacio |
| **Especificaciones (SPECS.md)** | 1 hora | Claude |
| **Tareas detalladas (TASKS.md)** | 30 min | Claude |
| **Implementación Backend** | 2-3 horas | Ignacio + Claude |
| - Endpoint PATCH status | 1 hora | |
| - Helper adjust_stock | 1 hora | |
| - Tests unitarios | 1 hora | |
| **Implementación Frontend** | 2-3 horas | Ignacio + Claude |
| - UI botones estados | 1 hora | |
| - Integración API | 1 hora | |
| - Eliminar sección Ventas | 30 min | |
| **Testing local** | 1 hora | Ignacio |
| **Deployment a Railway** | 30 min | Ignacio |
| **Verificación en producción** | 30 min | Ignacio |
| **Documentación final (VERIFY.md)** | 30 min | Claude |
| **TOTAL** | **8-10 horas** | |

**Estimación realista:** 1-2 días de desarrollo completo

---

## 🤔 Alternativas Consideradas

### Alternativa 1: Mantener ambas secciones (Ventas WhatsApp + Ventas)
**Pros:**
- No requiere eliminar código existente
- Backward compatible al 100%
- Admins pueden elegir flujo preferido

**Contras:**
- NO resuelve el problema de duplicación
- Más confuso (dos formas de hacer lo mismo)
- Mayor superficie de bugs
- Más mantenimiento a futuro

**Por qué no se eligió:**
El objetivo es SIMPLIFICAR, no agregar opcionalidad que confunda.

---

### Alternativa 2: Crear nuevo tipo `SaleType.WHATSAPP`
**Pros:**
- Separación más clara entre canales
- Reportes específicos para WhatsApp
- Permite lógica diferenciada

**Contras:**
- Requiere migración de base de datos (nuevo valor en ENUM)
- Duplica lógica que ya existe en `SaleType.ECOMMERCE`
- WhatsApp ES un canal de e-commerce, no merece tipo separado
- Más complejidad sin beneficio claro

**Por qué no se eligió:**
`SaleType.ECOMMERCE` + `WhatsAppSale` (metadata) ya cubre el caso perfectamente. No hay razón técnica para un nuevo tipo.

---

### Alternativa 3: Automatizar 100% (sin intervención del admin)
**Pros:**
- Flujo completamente automático
- Cero intervención humana
- Máxima eficiencia

**Contras:**
- Requiere integración con pasarela de pago
- Requiere webhook de confirmación de pago
- Mayor complejidad técnica (MercadoPago SDK, etc.)
- No aplica si cliente paga en efectivo/transferencia manual
- Fuera del alcance actual

**Por qué no se eligió:**
Requiere integración con pasarela de pago que no está en scope. Esta propuesta mantiene el control manual del admin (que es necesario para pagos offline) pero optimiza el workflow.

---

### Alternativa 4: Solo mejorar UI, mantener flujo fragmentado
**Pros:**
- Cambio mínimo
- Bajo riesgo
- Rápido de implementar

**Contras:**
- NO resuelve el problema raíz (duplicación)
- Sigue siendo lento y propenso a errores
- No aprovecha arquitectura existente (`OrderStatus`)

**Por qué no se eligió:**
Estamos buscando una solución REAL, no un parche cosmético.

---

## ✅ Aprobación

- [ ] **Tech Lead:** Claude (IA) - Pendiente
- [ ] **Developer:** Ignacio Weigandt - Pendiente  
- [ ] **Cliente:** Pendiente (requiere demo del flujo propuesto)

---

## 📝 Notas Adicionales

### Contexto del Negocio
El cliente vende a través de:
1. **E-commerce público** (web) → Pago online automático (MercadoPago)
2. **WhatsApp** → Pago coordinado (efectivo, transferencia manual)

Ambos canales usan `SaleType.ECOMMERCE` porque son ventas online (no presenciales POS). La diferencia está en:
- E-commerce web: Pago automático → Confirmación automática
- WhatsApp: Pago manual → **Confirmación manual del admin** (este workflow)

### Arquitectura Existente (No Modificar)
```
Sale (tabla principal de ventas)
├── sale_type: ENUM(POS, ECOMMERCE)  ← WhatsApp usa ECOMMERCE
├── order_status: ENUM(PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)  ← El que vamos a usar
├── branch_id: FK → branches
└── sale_items: 1:N → SaleItem (productos vendidos)

WhatsAppSale (metadata adicional)
├── sale_id: FK → sales.id  ← Relación principal
├── customer_whatsapp: String (número)
├── customer_name: String
├── shipping_method: String (pickup, delivery, shipping)
└── whatsapp_chat_url: String (link generado)
```

### Estados de OrderStatus y Acciones
```
PENDING (inicial)
  ↓ [Admin click "Confirmar Pago"]
PROCESSING (stock descontado, venta confirmada)
  ↓ [Admin click "Marcar como Enviado"]
SHIPPED (en camino al cliente)
  ↓ [Admin click "Marcar como Entregado"]
DELIVERED (estado final exitoso)

Cancelación:
PENDING → [Admin click "Cancelar"] → CANCELLED (sin descuento de stock)
PROCESSING → [Admin click "Cancelar"] → CANCELLED (revierte stock)
```

### Learnings de Arquitectura
- ✅ **Aprovechar lo que existe:** `OrderStatus` ya estaba diseñado para este caso de uso
- ✅ **Single Source of Truth:** `Sale.order_status` es la verdad, no duplicar en otro lado
- ✅ **Automatización inteligente:** Stock se maneja automáticamente según estado
- ✅ **Auditoría:** `InventoryMovement` registra cada cambio de stock con razón clara

### Referencias
- `backend/app/models/sales.py` - Modelo Sale con documentación completa
- `backend/app/models/enums.py` - OrderStatus y transiciones válidas
- `backend/app/models/whatsapp.py` - WhatsAppSale metadata
- `backend/routers/ecommerce_advanced.py` - Endpoints actuales de gestión
- `openspec/changes/example-001-add-product-rating/` - Ejemplo de referencia SDD

### Próximos Pasos (Post-Implementación)
1. Monitorear adopción del nuevo flujo en producción
2. Capturar feedback del admin sobre UX
3. Considerar notificaciones por email al cliente (futura iteración)
4. Evaluar integración con WhatsApp Business API (automatización completa)
5. Archivar cambio en `openspec/changes/archive/` cuando esté estabilizado
