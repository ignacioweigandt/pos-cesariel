# Checkout Error Debugging - Status Report

## Current Situation

The checkout is failing with a **422 Unprocessable Entity** error from the backend. This indicates a **Pydantic validation error** occurring before the request reaches the business logic.

## What We've Done

### 1. ✅ Verified Backend Works
- Tested with curl using `/tmp/test_sale.json`
- Result: **SUCCESS** - Sale ID 47 created (HTTP 200)
- Conclusion: Backend endpoint and validation logic are working correctly

### 2. ✅ Improved Error Logging
Updated `/src/lib/actions/cart.ts` with enhanced logging:

```typescript
// Line 202 - Logs the REQUEST data being sent
console.log('[Create Sale] Request data:', JSON.stringify(saleData, null, 2))

// Lines 229-233 - Logs the ERROR response with full details
console.error('[Create Sale] Backend error:', {
  status: response.status,
  statusText: response.statusText,
  data: JSON.stringify(data, null, 2)  // Full Pydantic error details
})
```

### 3. ✅ Improved Error Parsing
Added Pydantic validation error parsing (lines 235-257):

```typescript
// Converts Pydantic error objects to readable strings
if (Array.isArray(data.detail)) {
  const errors = data.detail.map((err: any) => {
    const field = err.loc ? err.loc.join(' > ') : 'campo desconocido'
    return `${field}: ${err.msg || err.message || 'error de validación'}`
  })
  errorMessage = errors.join('\n')
}
```

### 4. ✅ Verified Environment Configuration
- Docker Compose: `API_URL=http://backend:8000` ✅
- Client-side: `NEXT_PUBLIC_API_URL=http://localhost:8000` ✅
- Server Actions correctly use backend:8000 for internal requests

### 5. ✅ Confirmed Code Deployment
- Latest code with JSON.stringify logging is in the container
- Next checkout attempt will show full request/response details

## Backend Schema Requirements

Based on `/backend/app/schemas/sale.py`:

### SaleCreate Schema
```python
class SaleCreate(SaleBase):
    sale_type: SaleType          # REQUIRED - must be "ECOMMERCE" or "POS"
    items: List[SaleItemCreate]  # REQUIRED - at least one item

    # All optional:
    branch_id: Optional[int]
    customer_name: Optional[str]
    customer_email: Optional[EmailStr]
    customer_phone: Optional[str]
    payment_method: Optional[str]
    order_status: OrderStatus = OrderStatus.PENDING
    notes: Optional[str]
```

### SaleItemCreate Schema
```python
class SaleItemCreate(SaleItemBase):
    product_id: int              # REQUIRED
    quantity: int                # REQUIRED
    unit_price: Decimal          # REQUIRED (accepts numbers)
    size: Optional[str]          # Optional
```

## Frontend Request Structure

From `/src/shared/providers/ecommerce-provider.tsx` (lines 260-273):

```typescript
const saleData: CreateSaleData = {
  sale_type: 'ECOMMERCE',
  customer_name: cartState.customerInfo.name,
  customer_phone: cartState.customerInfo.phone,
  customer_email: cartState.customerInfo.email,
  notes: deliveryNotes,
  payment_method: 'WHATSAPP',
  items: cartState.items.map(item => ({
    product_id: item.productId || parseInt(item.id),
    quantity: item.quantity,
    unit_price: item.price,
    size: item.size
  }))
}
```

## Known Good Request (from test)

```json
{
  "sale_type": "ECOMMERCE",
  "customer_name": "Test Customer",
  "customer_phone": "+5491112345678",
  "customer_email": "test@test.com",
  "notes": "Test sale",
  "payment_method": "WHATSAPP",
  "items": [
    {
      "product_id": 124,
      "quantity": 1,
      "unit_price": 45000,
      "size": "42"
    }
  ]
}
```
Result: ✅ SUCCESS (Sale ID 47)

## Next Steps for Debugging

### To See the Exact Error:

1. **Open the browser** and navigate to http://localhost:3001
2. **Open DevTools** (F12) and go to the **Console** tab
3. **Add a product to cart** and proceed to checkout
4. **Fill in customer information** and submit the checkout
5. **Check the console output** for:
   - `[Create Sale] Request data:` - Shows exactly what's being sent
   - `[Create Sale] Backend error:` - Shows the Pydantic validation error details

### What to Look For:

Compare the frontend request data with the known good request above. Common issues:

- ❌ Missing required field (sale_type or items)
- ❌ Empty items array
- ❌ product_id is NaN (from parseInt failure)
- ❌ unit_price is null or undefined
- ❌ customer_phone in wrong format (for EmailStr validation)
- ❌ sale_type has wrong value (not "ECOMMERCE")

### Alternative: Check Docker Logs

If console is not available:

```bash
# Terminal 1: Monitor ecommerce logs
docker logs -f pos-cesariel-ecommerce 2>&1 | grep -A 20 "\[Create Sale\]"

# Terminal 2: Monitor backend logs
docker logs -f pos-cesariel-backend 2>&1 | grep -A 5 "422"
```

## Expected Error Format

With our new error parsing, you should see a user-friendly error message like:

```
body > items > 0 > product_id: Field required
```

Or:

```
body > sale_type: Input should be 'ECOMMERCE' or 'POS'
```

## Current Status

- ✅ Backend tested and working
- ✅ Error logging improved
- ✅ Error parsing implemented
- ✅ Code deployed to container
- ✅ **Error identified and FIXED!**

## ✅ SOLUTION IMPLEMENTED

### Problem Identified
```
Error: body > customer_email: value is not a valid email address: An email address must have an @-sign.
```

**Root Cause:** The `customer_email` field was being sent as an empty string `""` when the user didn't provide an email. The backend schema (`EmailStr` type) rejects empty strings and requires either a valid email or `undefined`.

### Fix Applied
**File:** `src/shared/providers/ecommerce-provider.tsx` (line 264)

**Before:**
```typescript
customer_email: cartState.customerInfo.email,
```

**After:**
```typescript
customer_email: cartState.customerInfo.email || undefined,
```

This ensures that if the email field is empty, `undefined` is sent instead of an empty string, which satisfies the backend's `Optional[EmailStr]` validation.

### Status
✅ **Fix deployed and container restarted**
✅ **Ready for testing**

Try the checkout process again - it should now work correctly!
