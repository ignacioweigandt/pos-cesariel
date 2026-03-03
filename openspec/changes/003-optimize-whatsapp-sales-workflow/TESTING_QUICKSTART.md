# Testing Quick Start - WhatsApp Workflow

**Para testing completo, ver:** `MANUAL_TESTING.md`

---

## Setup Rápido (5 minutos)

### 1. Servicios corriendo
```bash
cd /Users/ignacioweigandt/Documentos/Tesis/pos-cesariel
docker compose ps  # Todos UP
```

### 2. Login
- **URL:** http://localhost:3000
- **User:** `admin` / `admin123`
- **Navegar a:** E-commerce module

### 3. Producto de prueba
- **ID:** 196 - Under Armour Training Socks
- **Stock inicial:** 10 unidades
- **Precio:** ~$30

---

## Tests Críticos (orden de ejecución)

### ✅ TEST 1: UI sin tab "Ventas" duplicado
**Qué verificar:** Solo 5 tabs visibles (Dashboard, Productos Online, Historial, **Ventas WhatsApp**, Contenido)
**Dónde:** E-commerce → Tab navigation
**Esperado:** ❌ NO debe existir tab "Ventas" standalone

---

### ✅ TEST 2: Crear venta WhatsApp PENDING
**Dónde:** E-commerce → Ventas WhatsApp → "Nueva Venta"
**Datos:**
- Cliente: `Test Cliente 1`
- WhatsApp: `5493512345678`
- Producto: Under Armour Training Socks (ID 196)
- Cantidad: **3 unidades**

**Verificar en DB después:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```
**Esperado:** Stock = 10 (sin cambios, sale está PENDING)

---

### ✅ TEST 3: Confirmar Pago → Stock baja automáticamente
**Acción:** Click en "Confirmar Pago" en la venta recién creada
**Esperado en UI:**
- Status → PROCESSING
- Botones: "Marcar como Enviado" + "Cancelar (Revertir Stock)"

**Verificar stock:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```
**Esperado:** Stock = **7** (10 - 3 = 7) ✅ STOCK DESCENDIÓ AUTOMÁTICAMENTE

**Verificar movimiento de inventario:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT quantity_change, movement_type, reason 
FROM inventory_movements 
WHERE product_id = 196 
ORDER BY created_at DESC LIMIT 1;
"
```
**Esperado:** `quantity_change = -3`, razón menciona venta WhatsApp

---

### ✅ TEST 4: Cancelar venta → Stock se revierte
**Setup:** Crear OTRA venta con 2 unidades, confirmar pago (stock baja a 5)
**Acción:** Click "Cancelar (Revertir Stock)" en estado PROCESSING
**Esperado en UI:**
- Status → CANCELLED

**Verificar stock:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```
**Esperado:** Stock = **7** (5 + 2 = 7) ✅ STOCK SE REVIRTIÓ

---

### ✅ TEST 5: Stock insuficiente → Rechaza confirmación
**Setup:** Crear venta con **20 unidades** (> stock disponible)
**Acción:** Intentar "Confirmar Pago"
**Esperado:**
- ❌ **ERROR** visible en UI: "Stock insuficiente"
- Status permanece en PENDING
- Stock sin cambios (7 unidades)

```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```
**Esperado:** Stock = 7 (sin cambios)

---

## Resultado Final Esperado

| Concepto | Valor |
|----------|-------|
| Stock inicial | 10 |
| Venta 1 confirmada y entregada | -3 |
| Venta 2 confirmada y cancelada | 0 (revertida) |
| Venta 3 rechazada (insuficiente) | 0 |
| **Stock final** | **7** |

---

## Si algo falla

### Backend logs
```bash
docker compose logs -f backend | grep -i "whatsapp\|stock\|error"
```

### Frontend logs
```bash
docker compose logs -f frontend | grep -i "error"
```

### Ver todas las ventas WhatsApp de testing
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT ws.id, ws.customer_name, s.order_status, s.total_amount 
FROM whatsapp_sales ws
JOIN sales s ON ws.sale_id = s.id
WHERE ws.customer_name LIKE 'Test Cliente%'
ORDER BY ws.created_at;
"
```

---

## Documentar resultados

Completar tabla en `MANUAL_TESTING.md` con PASS/FAIL para cada test.

**Si todos PASS:** Crear `verification.md` con resultados y screenshots.

**Si alguno FAIL:** Documentar el issue y volver a desarrollo.
