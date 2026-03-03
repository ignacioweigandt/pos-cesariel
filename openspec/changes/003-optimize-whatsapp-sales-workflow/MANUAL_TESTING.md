# Manual Testing Guide - WhatsApp Sales Workflow Optimization

**Change:** 003-optimize-whatsapp-sales-workflow  
**Date:** 2026-03-03  
**Tester:** [Tu nombre]  
**Environment:** Local Docker Compose

---

## Pre-requisites

### 1. Services Running
```bash
# Verify all services are up
docker compose ps

# Expected output: backend, frontend, ecommerce, db, adminer all UP
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Adminer: http://localhost:8080
```

### 2. Test Data Available

**Product for testing:**
- **ID:** 196
- **Name:** Under Armour Training Socks
- **Initial Stock:** 10 units
- **Has Sizes:** No (simple product)
- **Price:** ~$30 (verify current price in DB)

**Verify initial stock:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT p.id, p.name, bs.stock_quantity, p.price, p.has_sizes
FROM products p
JOIN branch_stock bs ON p.id = bs.product_id AND bs.branch_id = 1
WHERE p.id = 196;
"
```

Expected output:
```
 id  |            name              | stock_quantity | price | has_sizes 
-----+------------------------------+----------------+-------+-----------
 196 | Under Armour Training Socks  |             10 | XX.XX | f
```

### 3. User Credentials

Login to POS Admin at http://localhost:3000

**Admin user (recommended):**
- Username: `admin`
- Password: `admin123` (or check `backend/init_db.py` for correct credentials)

**Or Manager user:**
- Username: `manager`
- Password: `manager123`

---

## Test Cases

### TEST 1: Verify UI Changes (Task 3.4)

**Objective:** Confirm duplicate "Ventas" tab was removed

**Steps:**
1. Login to http://localhost:3000
2. Navigate to **E-commerce** module (from main dashboard)
3. **VERIFY:** Tabs visible should be:
   - ✅ Dashboard
   - ✅ Productos Online
   - ✅ Historial de Ventas
   - ✅ Ventas WhatsApp
   - ✅ Contenido
   - ❌ **"Ventas" tab should NOT exist** (was removed)

**Expected Result:** Only 5 tabs visible, no standalone "Ventas" tab

**Status:** [ ] PASS / [ ] FAIL

**Screenshot:** (Optional - take screenshot showing tab navigation)

---

### TEST 2: Create WhatsApp Sale (Setup for subsequent tests)

**Objective:** Create a new WhatsApp sale in PENDING status

**Steps:**
1. Go to **E-commerce > Ventas WhatsApp** tab
2. Click **"Nueva Venta WhatsApp"** or equivalent button
3. Fill in customer data:
   - **Customer Name:** `Test Cliente 1`
   - **WhatsApp:** `5493512345678`
   - **Address:** `Calle Falsa 123, Córdoba`
   - **Shipping Method:** `Envío a domicilio` or `Retiro en tienda`
4. Add product:
   - **Product:** Under Armour Training Socks (ID 196)
   - **Quantity:** 3 units
   - **Price:** (should auto-fill from product price)
5. **Notes:** `Testing nuevo workflow automatizado`
6. Click **"Crear Venta"** or **"Guardar"**

**Verify in DB:**
```bash
# Get the newly created sale ID and details
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT ws.id, ws.customer_name, s.id as sale_id, s.order_status, s.total_amount, ws.created_at
FROM whatsapp_sales ws
JOIN sales s ON ws.sale_id = s.id
WHERE ws.customer_name = 'Test Cliente 1'
ORDER BY ws.created_at DESC
LIMIT 1;
"
```

**Expected Result:**
- New WhatsApp sale created
- `order_status = 'PENDING'`
- Total amount = 3 × product price
- **Stock NOT yet reduced** (remains at 10 units for product 196)

**Verify stock unchanged:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock 
WHERE product_id = 196 AND branch_id = 1;
"
```

Expected: `stock_quantity = 10` (unchanged)

**Status:** [ ] PASS / [ ] FAIL

**Sale ID Created:** `____` (write down for next tests)

---

### TEST 3: Confirm Payment - Stock Reduction (Task 3.1 - Part 1)

**Objective:** Verify PENDING → PROCESSING transition reduces stock automatically

**Pre-condition:** WhatsApp sale from TEST 2 in PENDING status

**Steps:**
1. In **Ventas WhatsApp** tab, locate the sale created in TEST 2
2. Verify current status badge shows **"PENDING"** or **"Pendiente"**
3. Click **"Confirmar Pago"** button
4. **Confirm action** if prompted
5. **Wait 1-2 seconds** for backend to process

**Verify in UI:**
- Status badge changes to **"PROCESSING"** or **"En Proceso"**
- Buttons change to: **"Marcar como Enviado"** + **"Cancelar (Revertir Stock)"**

**Verify in DB - Stock Reduced:**
```bash
# Check stock was reduced by 3 units (quantity in sale)
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock 
WHERE product_id = 196 AND branch_id = 1;
"
```

Expected: `stock_quantity = 7` (10 - 3 = 7)

**Verify in DB - InventoryMovement Created:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT im.id, im.product_id, im.quantity_change, im.movement_type, im.reason, im.created_at
FROM inventory_movements im
WHERE im.product_id = 196
ORDER BY im.created_at DESC
LIMIT 1;
"
```

Expected:
- `quantity_change = -3` (negative = stock reduction)
- `movement_type = 'SALE'` or similar
- `reason` contains mention of WhatsApp sale confirmation

**Verify in DB - Sale Status Updated:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT id, order_status, updated_at 
FROM sales 
WHERE id = (SELECT sale_id FROM whatsapp_sales WHERE customer_name = 'Test Cliente 1');
"
```

Expected: `order_status = 'PROCESSING'`

**Status:** [ ] PASS / [ ] FAIL

**Notes:**

---

### TEST 4: Mark as Shipped (Task 3.1 - Part 2)

**Objective:** Verify PROCESSING → SHIPPED transition works correctly

**Pre-condition:** WhatsApp sale from TEST 3 in PROCESSING status

**Steps:**
1. In **Ventas WhatsApp** tab, locate the same sale
2. Verify status badge shows **"PROCESSING"**
3. Click **"Marcar como Enviado"** button
4. Confirm action if prompted

**Verify in UI:**
- Status badge changes to **"SHIPPED"** or **"Enviado"**
- Button changes to: **"Marcar como Entregado"**
- **Cancellation button should be GONE** (cannot cancel after shipped)

**Verify in DB:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT order_status FROM sales 
WHERE id = (SELECT sale_id FROM whatsapp_sales WHERE customer_name = 'Test Cliente 1');
"
```

Expected: `order_status = 'SHIPPED'`

**Verify Stock Unchanged:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```

Expected: `stock_quantity = 7` (no change, stock was already reduced in PROCESSING)

**Status:** [ ] PASS / [ ] FAIL

---

### TEST 5: Mark as Delivered (Task 3.1 - Part 3)

**Objective:** Verify SHIPPED → DELIVERED final transition

**Pre-condition:** WhatsApp sale from TEST 4 in SHIPPED status

**Steps:**
1. In **Ventas WhatsApp** tab, locate the same sale
2. Verify status badge shows **"SHIPPED"**
3. Click **"Marcar como Entregado"** button
4. Confirm action if prompted

**Verify in UI:**
- Status badge changes to **"DELIVERED"** or **"Entregado"**
- **No action buttons** (final state, no more transitions possible)
- Badge should be in a "success" color (green)

**Verify in DB:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT order_status FROM sales 
WHERE id = (SELECT sale_id FROM whatsapp_sales WHERE customer_name = 'Test Cliente 1');
"
```

Expected: `order_status = 'DELIVERED'`

**Status:** [ ] PASS / [ ] FAIL

---

### TEST 6: Stock Reversion on Cancellation (Task 3.2)

**Objective:** Verify cancelling a PROCESSING sale reverts stock automatically

**Steps:**

#### 6.1 Create Second WhatsApp Sale
1. Go to **Ventas WhatsApp** tab
2. Create new sale:
   - **Customer Name:** `Test Cliente 2 - Cancelacion`
   - **WhatsApp:** `5493598765432`
   - **Product:** Under Armour Training Socks (ID 196)
   - **Quantity:** 2 units
   - **Shipping:** Any method
3. Click **"Crear Venta"**

**Verify Stock:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```

Expected: `stock_quantity = 7` (unchanged, sale is still PENDING)

#### 6.2 Confirm Payment
1. Find the sale for "Test Cliente 2 - Cancelacion"
2. Click **"Confirmar Pago"**
3. Verify status → **"PROCESSING"**

**Verify Stock Reduced:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```

Expected: `stock_quantity = 5` (7 - 2 = 5)

#### 6.3 Cancel Sale (CRITICAL TEST)
1. With sale in **PROCESSING** status, click **"Cancelar (Revertir Stock)"** button
2. **Confirm cancellation** (should show warning about stock reversion)
3. Wait for operation to complete

**Verify in UI:**
- Status badge changes to **"CANCELLED"** or **"Cancelado"**
- No action buttons (final state)
- Badge should be in "danger" color (red/gray)

**Verify Stock REVERTED:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```

Expected: `stock_quantity = 7` (5 + 2 = 7, stock restored!)

**Verify InventoryMovement for Reversion:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT im.id, im.product_id, im.quantity_change, im.movement_type, im.reason, im.created_at
FROM inventory_movements im
WHERE im.product_id = 196
ORDER BY im.created_at DESC
LIMIT 2;
"
```

Expected: 2 entries:
1. Most recent: `quantity_change = +2` (positive = stock increase), reason mentions "cancelación"
2. Previous: `quantity_change = -2` (the original reduction from confirmation)

**Status:** [ ] PASS / [ ] FAIL

**Notes:**

---

### TEST 7: Insufficient Stock Validation (Task 3.3)

**Objective:** Verify system rejects confirmation when stock is insufficient

**Current stock:** 7 units of product 196

**Steps:**

#### 7.1 Create Sale with Large Quantity
1. Go to **Ventas WhatsApp** tab
2. Create new sale:
   - **Customer Name:** `Test Cliente 3 - Stock Insuficiente`
   - **WhatsApp:** `5493511112222`
   - **Product:** Under Armour Training Socks (ID 196)
   - **Quantity:** **20 units** (MORE than available 7)
   - **Shipping:** Any method
3. Click **"Crear Venta"**

**Expected:** Sale created in PENDING status (no stock check yet)

#### 7.2 Attempt to Confirm Payment
1. Find the sale for "Test Cliente 3 - Stock Insuficiente"
2. Click **"Confirmar Pago"**
3. **CRITICAL:** Should see **ERROR message** or **alert** about insufficient stock

**Expected Error Message (example):**
- "Stock insuficiente para producto Under Armour Training Socks"
- "No hay suficiente stock disponible"
- HTTP 400 Bad Request with error details

**Verify in UI:**
- Status remains **"PENDING"** (unchanged)
- Sale is NOT confirmed
- User sees clear error message

**Verify Stock Unchanged:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;
"
```

Expected: `stock_quantity = 7` (no change)

**Verify Sale Status Unchanged:**
```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
SELECT order_status FROM sales 
WHERE id = (SELECT sale_id FROM whatsapp_sales WHERE customer_name LIKE 'Test Cliente 3%');
"
```

Expected: `order_status = 'PENDING'`

**Status:** [ ] PASS / [ ] FAIL

**Error Message Received:**

---

### TEST 8: WebSocket Real-Time Notification (Bonus)

**Objective:** Verify real-time dashboard updates when confirming WhatsApp sale

**Pre-requisites:** Open TWO browser windows/tabs

**Steps:**
1. **Tab 1:** Login and go to **E-commerce > Dashboard**
2. **Tab 2:** Login and go to **E-commerce > Ventas WhatsApp**
3. In **Tab 2:** Create new WhatsApp sale and confirm payment (PENDING → PROCESSING)
4. **Watch Tab 1 (Dashboard):** Should update automatically without refresh

**Expected in Dashboard (Tab 1):**
- Sales count increases
- Dashboard stats refresh
- No manual page reload needed

**Status:** [ ] PASS / [ ] FAIL / [ ] SKIPPED

---

## Test Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| TEST 1: UI Changes (no "Ventas" tab) | [ ] PASS / [ ] FAIL | |
| TEST 2: Create WhatsApp Sale | [ ] PASS / [ ] FAIL | Sale ID: ___ |
| TEST 3: Confirm Payment (stock reduction) | [ ] PASS / [ ] FAIL | |
| TEST 4: Mark as Shipped | [ ] PASS / [ ] FAIL | |
| TEST 5: Mark as Delivered | [ ] PASS / [ ] FAIL | |
| TEST 6: Cancellation (stock reversion) | [ ] PASS / [ ] FAIL | |
| TEST 7: Insufficient Stock Validation | [ ] PASS / [ ] FAIL | |
| TEST 8: WebSocket Notification (bonus) | [ ] PASS / [ ] FAIL / [ ] SKIPPED | |

---

## Final Stock Verification

After completing all tests, verify final stock state:

```bash
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
-- Final stock for product 196
SELECT stock_quantity FROM branch_stock WHERE product_id = 196 AND branch_id = 1;

-- All inventory movements for product 196 during testing
SELECT id, quantity_change, movement_type, reason, created_at 
FROM inventory_movements 
WHERE product_id = 196 
ORDER BY created_at DESC;

-- All WhatsApp sales created during testing
SELECT ws.id, ws.customer_name, s.order_status, s.total_amount 
FROM whatsapp_sales ws
JOIN sales s ON ws.sale_id = s.id
WHERE ws.customer_name LIKE 'Test Cliente%'
ORDER BY ws.created_at;
"
```

**Expected Final Stock:**
- Initial: 10 units
- TEST 3-5 (delivered): -3 units
- TEST 6 (cancelled, reverted): 0 net change
- TEST 7 (insufficient, rejected): 0 change
- **Final expected: 7 units**

---

## Issues Found

Document any bugs, unexpected behavior, or improvements needed:

1. 
2. 
3. 

---

## Cleanup (Optional)

To reset test data and restore initial stock:

```bash
# Delete test sales
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
DELETE FROM whatsapp_sales WHERE customer_name LIKE 'Test Cliente%';
"

# Restore stock to 10 units
docker compose exec -T db psql -U postgres -d pos_cesariel -c "
UPDATE branch_stock 
SET stock_quantity = 10 
WHERE product_id = 196 AND branch_id = 1;
"
```

---

## Sign-off

**Tester Name:** _______________  
**Date Completed:** _______________  
**Overall Result:** [ ] ALL PASS / [ ] FAILED (see issues)  
**Ready for Production:** [ ] YES / [ ] NO

**Additional Comments:**
