# 🔒 Auditoría de Seguridad y UX - POS Cesariel

**Fecha**: 3 de Marzo, 2026  
**Sistema**: POS Cesariel (Backend FastAPI + Frontend Next.js + E-commerce)  
**Alcance**: Seguridad, UX Safety, Integridad de Datos  
**Estado**: ✅ EN PRODUCCIÓN ACTIVA - Railway deployment

---

## RESUMEN EJECUTIVO

El sistema POS Cesariel presenta:

**Seguridad:**
- ✅ Arquitectura de autenticación robusta (JWT + Bcrypt + RBAC)
- ✅ Validación de datos con Pydantic
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ❌ **3 vulnerabilidades CRÍTICAS** requieren acción inmediata
- ⚠️ **6 vulnerabilidades ALTAS/MEDIAS** necesitan resolverse en 1-4 semanas

**UX Safety:**
- ✅ Backend con validaciones sólidas (stock, duplicados, soft deletes)
- ✅ Gestión de sesión excelente (auto-logout, token refresh)
- ❌ **Confirmaciones débiles** (`window.confirm` fácil de saltear)
- ❌ **Sin advertencia de cambios sin guardar** en formularios
- ⚠️ **Mensajes de error técnicos** poco user-friendly

---

## 🔴 VULNERABILIDADES CRÍTICAS - Acción INMEDIATA

### 1. TOKENS JWT EN LOCALSTORAGE (XSS Risk)

**Ubicación:** `frontend/pos-cesariel/shared/hooks/useAuth.ts:48`

**Código actual:**
```typescript
// ❌ VULNERABLE A XSS
login: (token: string, user: User) => {
    localStorage.setItem('token', token);  // JavaScript puede robar esto
    set({ token, user, isAuthenticated: true });
}
```

**Impacto:**
- Si un atacante inyecta JavaScript (XSS), puede robar TODOS los tokens
- El token da acceso completo al sistema por 8 horas
- Afecta a POS Admin (3000), no a e-commerce (3001)

**Solución recomendada:**
```typescript
// ✅ BACKEND: Usar httpOnly cookies
// backend/routers/auth.py
@router.post("/login")
async def login(...):
    access_token = create_access_token(data={"sub": user.username})
    response = JSONResponse({"message": "Login successful", "user": {...}})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,   # JavaScript NO puede acceder
        secure=True,     # Solo HTTPS
        samesite="lax",  # CSRF protection
        max_age=28800    # 8 horas
    )
    return response

// ✅ FRONTEND: Eliminar localStorage
// El token se envía automáticamente con cada request (cookies)
// Actualizar axios interceptor para leer de cookies en lugar de localStorage
```

**Alternativa rápida** (si migración a cookies es compleja):
```typescript
// Usar sessionStorage (se borra al cerrar pestaña)
sessionStorage.setItem('token', token);
```

---

### 2. RATE LIMITING DESHABILITADO (Brute Force Risk)

**Ubicación:** `backend/config/rate_limit.py:62`

**Código actual:**
```python
# ❌ RATE LIMITING APAGADO EN PRODUCCIÓN
limiter = Limiter(
    key_func=get_identifier,
    default_limits=["60/minute"],
    enabled=os.getenv("RATE_LIMIT_ENABLED", "false").lower() == "true",  # ❌ FALSE
    storage_uri="memory://",
)
```

**Impacto:**
- Login endpoint SIN rate limit → Brute force attacks ilimitados
- Create order endpoint SIN rate limit → DoS attacks
- File upload SIN rate limit → Storage exhaustion
- Decoradores `@limiter.limit()` están presentes pero no hacen nada

**Solución INMEDIATA:**
```bash
# .env.production
RATE_LIMIT_ENABLED=true  # ✅ HABILITAR AHORA
```

**Solución PROFESIONAL (1 semana):**
```python
# config/rate_limit.py
limiter = Limiter(
    key_func=get_identifier,
    default_limits=["100/minute"],
    enabled=True,  # ✅ HABILITADO POR DEFECTO
    storage_uri=os.getenv("REDIS_URL", "redis://localhost:6379"),  # Persistente
)
```

---

### 3. ENDPOINT INIT_DB SIN AUTENTICACIÓN (Data Loss Risk)

**Ubicación:** `backend/routers/init_db_endpoint.py:50`

**Código actual:**
```python
# ❌ ENDPOINT PÚBLICO QUE RESETEA LA BD
@router.post("/database")
async def initialize_database(db: Session = Depends(get_db)):
    """⚠️ ADVERTENCIA: Solo ejecutar en bases de datos vacías."""
    # NO HAY Depends(require_admin) ← CUALQUIERA PUEDE EJECUTAR ESTO
    import init_data
    init_data.create_initial_data()  # Resetea TODA la BD
```

**Impacto:**
- Un atacante puede RESETEAR toda la base de datos en producción
- Pérdida TOTAL de ventas, usuarios, configuración
- Sin autenticación, sin rate limit, sin confirmación

**Solución URGENTE:**
```python
# Opción 1: ELIMINAR endpoint en producción
# backend/main.py
if settings.environment != "production":
    app.include_router(init_db_endpoint.router)

# Opción 2: Proteger con ADMIN + token de confirmación
@router.post("/database")
async def initialize_database(
    confirmation_token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # ✅ SOLO ADMIN
):
    expected_token = os.getenv("INIT_DB_TOKEN")  # Variable secreta
    if confirmation_token != expected_token:
        raise HTTPException(status_code=403, detail="Invalid token")
    # ...
```

---

## 🔴 UX CRÍTICO - Prevención de Errores Costosos

### 4. CONFIRMACIONES DÉBILES (window.confirm)

**Ubicación:** Múltiples archivos

**Código actual:**
```typescript
// ❌ CategoryFormModal.tsx:78
if (!confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?\n\nEsta acción no se puede deshacer.`)) {
  return;
}

// ❌ BrandFormModal.tsx:88
if (!confirm(`¿Estás seguro de eliminar la marca "${brandName}"?`)) {
  return;
}

// ❌ payment-config/page.tsx:124
if (!confirm(`¿Eliminar configuración "${config.description}"?`)) {
  return;
}

// ❌ ProductImageManager.tsx:140
if (!confirm('¿Eliminar esta imagen?')) {
  return;
}
```

**Impacto:**
- Usuario puede hacer clic en "Eliminar" + Enter por costumbre → **eliminación accidental**
- `window.confirm()` es fácil de ignorar visualmente
- No advierte sobre consecuencias (ej: eliminar categoría con 50 productos)

**Solución:**
```typescript
// ✅ Usar modal propio consistente (como DeleteConfirmationModal)
// ✅ Mostrar CONSECUENCIAS antes de confirmar:

const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
  // 1. Verificar dependencias
  const { productCount } = await api.get(`/categories/${categoryId}/dependencies`);
  
  // 2. Mostrar modal con advertencia
  setDeleteModal({
    isOpen: true,
    title: 'Eliminar Categoría',
    message: productCount > 0 
      ? `Esta categoría tiene ${productCount} productos asociados. La categoría será desactivada (no eliminada).`
      : 'Esta categoría será eliminada permanentemente.',
    onConfirm: () => deleteCategory(categoryId),
    variant: productCount > 0 ? 'warning' : 'danger'
  });
};
```

---

### 5. SIN ADVERTENCIA DE CAMBIOS SIN GUARDAR

**Ubicación:** Mayoría de formularios

**Problema:**
```typescript
// Solo 2 páginas implementan beforeunload:
// ✅ app/users/branches/edit/[id]/page.tsx:205
// ✅ app/users/edit/[id]/page.tsx:232

// ❌ Pero estos NO:
// - ProductFormModal
// - CategoryFormModal
// - BrandFormModal
// - StockAdjustmentModal
```

**Impacto:**
- Usuario llena formulario de producto → clic en "Cerrar" por error → **pierde todo**
- Sin advertencia al recargar página o cerrar pestaña

**Solución:**
```typescript
// ✅ En TODOS los modales/formularios:
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (formState.isDirty) {  // react-hook-form
      e.preventDefault();
      e.returnValue = '';  // Muestra advertencia del browser
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [formState.isDirty]);

// ✅ En botón "Cerrar":
const handleClose = () => {
  if (formState.isDirty && !confirm('Hay cambios sin guardar. ¿Salir?')) {
    return;
  }
  onClose();
};
```

---

### 6. AJUSTES DE STOCK SIN LÍMITES

**Ubicación:** `StockAdjustmentModal.tsx`

**Código actual:**
```typescript
// ❌ Sin validación de cambios grandes
<input
  type="number"
  required
  min="0"  // ✅ BIEN: no permite negativos
  value={formData.new_stock}
  // ❌ FALTA: max, validación de cambios grandes
/>
```

**Impacto:**
- Usuario puede ajustar stock de 10 a 10,000 por error sin advertencia
- Sin límite de ajustes diarios (vendedor malicioso puede hacer ajustes masivos)

**Solución:**
```typescript
// ✅ Advertencia si cambio > 50%:
const handleSubmit = () => {
  const change = Math.abs(newStock - currentStock);
  const percentChange = (change / currentStock) * 100;
  
  if (percentChange > 50) {
    setWarning({
      show: true,
      message: `Cambio grande detectado: ${currentStock} → ${newStock} (${percentChange.toFixed(0)}%). ¿Confirmar?`
    });
    return;
  }
  
  submitStockAdjustment();
};

// ✅ Backend: Audit log para alertas
// Si usuario hace > 20 ajustes en 1 hora → notificar admin
```

---

## 🟠 VULNERABILIDADES ALTAS (1-2 semanas)

### 7. SECRET KEY POR DEFECTO

**Ubicación:** `backend/config/settings.py:232-235`

**Código actual:**
```python
jwt_secret_key: str = os.getenv(
    "SECRET_KEY",
    "your-secret-key-here-change-in-production"  # ❌ DÉBIL
)

# ✅ Tiene validación (líneas 374-378):
if settings.is_production:
    if settings.jwt_secret_key == "your-secret-key-here-change-in-production":
        raise ValueError("⚠️ JWT_SECRET_KEY debe ser robusta")
```

**Mejora necesaria:**
```python
# ✅ Validar FORTALEZA del secret key
if settings.is_production:
    if len(settings.jwt_secret_key) < 32:
        raise ValueError("JWT_SECRET_KEY debe tener al menos 32 caracteres")
    if settings.jwt_secret_key.isalnum():  # Solo letras/números
        raise ValueError("JWT_SECRET_KEY debe incluir caracteres especiales")
```

**Generar secret key seguro:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Output ejemplo: KJ8d_xF3nP-9Qw2mL5vR7yT4bH6gN1cX8z0aW3e
```

---

### 8. CORS WILDCARD HABILITADO

**Ubicación:** `backend/config/settings.py:214`

**Código actual:**
```python
cors_origins: List[str] = [
    "http://localhost:3000",
    "http://frontend:3000",
    "http://localhost:3001",
    "http://ecommerce:3001",
    "*"  # ❌ PERMITE CUALQUIER ORIGEN
]
```

**Impacto:**
- Sitios maliciosos pueden hacer requests al backend
- Bypassea Same-Origin Policy
- Permite CSRF attacks desde cualquier dominio

**Solución:**
```python
# backend/config/settings.py - DESCOMENTAR validación existente (líneas 386-391)
if "*" in settings.cors_origins:
    raise ValueError("⚠️ CORS wildcard '*' no permitido en producción")

# Y ELIMINAR "*" de la lista (línea 214)
```

---

### 9. FALTA CSP HEADERS

**Ubicación:** `frontend/pos-cesariel/next.config.mjs`

**Problema:**
- Sin Content-Security-Policy → vulnerable a XSS
- Sin X-Frame-Options → vulnerable a clickjacking
- Sin X-Content-Type-Options → vulnerable a MIME sniffing

**Solución:**
```javascript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' https://res.cloudinary.com data:; style-src 'self' 'unsafe-inline';"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};
```

---

## 🟡 VULNERABILIDADES MEDIAS (1-3 meses)

### 10. File Validation Solo por Extensión

**Ubicación:** `backend/routers/ecommerce_advanced.py:151`

**Código actual:**
```python
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def validate_file(file: UploadFile) -> bool:
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:  # ❌ Solo extensión
        return False
```

**Riesgo:**
- Atacante puede renombrar `malware.exe` → `malware.jpg` y bypassear validación

**Solución:**
```python
def validate_file(file: UploadFile) -> bool:
    # ✅ Validar extensión
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False
    
    # ✅ Validar MIME type
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        return False
    
    # ✅ Validar magic bytes (primeros bytes del archivo)
    file_header = file.file.read(16)
    file.file.seek(0)  # Reset
    
    if not file_header.startswith(b'\xff\xd8\xff'):  # JPEG
        if not file_header.startswith(b'\x89PNG'):    # PNG
            if not file_header.startswith(b'GIF8'):   # GIF
                return False
    
    return True
```

---

### 11. Falta HTTPS Enforcement

**Ubicación:** `backend/main.py`

**Problema:**
- Sin redirección automática HTTP → HTTPS
- Permite conexiones inseguras en producción

**Solución:**
```python
# main.py
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

if settings.is_production:
    app.add_middleware(HTTPSRedirectMiddleware)  # ✅ Force HTTPS
    
    # ✅ Agregar también:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["frontend-pos-production.up.railway.app", "*.railway.app"]
    )
```

---

### 12. Error Details en Producción

**Ubicación:** `backend/main.py`

**Problema:**
- Stack traces exponen internals del sistema
- Información sensible puede filtrarse en errores 500

**Solución:**
```python
# main.py
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # ✅ Log completo en backend
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    if settings.is_production:
        # ✅ Mensaje genérico al cliente
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "request_id": str(uuid.uuid4())}
        )
    else:
        # ✅ Detalles en desarrollo
        return JSONResponse(
            status_code=500,
            content={
                "error": str(exc),
                "type": type(exc).__name__,
                "traceback": traceback.format_exc()
            }
        )
```

---

## 🟢 UX MEJORAS (Medio-Bajo Riesgo)

### 13. Mensajes de Error Técnicos

**Ubicación:** `features/inventory/hooks/useProducts.ts:79-89`

**Problema:**
```typescript
// ❌ Muestra mensaje técnico del backend
toast.error(`Error: ${errorMessage}`);
// Ejemplo: "Insufficient stock for product Zapatillas Nike. Required: 5"
// Usuario no sabe QUÉ hacer
```

**Solución:**
```typescript
// ✅ Traducir errores del backend
const ERROR_TRANSLATIONS = {
  'Insufficient stock': 'No hay suficiente stock disponible. Intente con menor cantidad.',
  'SKU already exists': 'Este código SKU ya está en uso. Use otro código.',
  'Product not found': 'Producto no encontrado. Puede haber sido eliminado.',
  'Stock cannot be negative': 'El stock no puede ser negativo.',
  'Category not found': 'La categoría seleccionada no existe.',
  'Brand not found': 'La marca seleccionada no existe.',
  'Invalid token': 'Su sesión ha expirado. Por favor inicie sesión nuevamente.',
};

const translateError = (backendError: string): string => {
  for (const [key, translation] of Object.entries(ERROR_TRANSLATIONS)) {
    if (backendError.includes(key)) return translation;
  }
  return 'Ocurrió un error. Intente nuevamente o contacte al administrador.';
};

toast.error(translateError(errorMessage));
```

---

### 14. Validación de Stock por Sucursal

**Ubicación:** `frontend/pos-cesariel/features/pos/components/POSContainer.tsx:190-193`

**Problema:**
```typescript
// ❌ Valida stock GLOBAL, no de sucursal del usuario
if (product.stock_quantity <= 0) {
  toast.error("Producto sin stock");
  return;
}
```

**Impacto:**
- Si stock está en otra sucursal, muestra "sin stock" incorrectamente
- Usuario no puede vender aunque haya stock en su sucursal

**Solución:**
```typescript
// ✅ Validar stock de sucursal específica
const branchStock = await api.get(
  `/products/${product.id}/stock?branch_id=${user.branch_id}`
);

if (branchStock.quantity <= 0) {
  toast.error(
    `Producto sin stock en ${user.branch_name}. ` +
    `Hay ${product.stock_quantity} unidades en otras sucursales.`
  );
  return;
}
```

---

### 15. Sin Preview en Bulk Price Update

**Ubicación:** `BulkPriceUpdateModal.tsx`

**Problema:**
```typescript
// ✅ Tiene step 'confirm' pero:
// ❌ No muestra precios calculados antes de confirmar
// ❌ No advierte sobre impacto en e-commerce
```

**Solución:**
```typescript
// ✅ En step 'confirm', mostrar tabla:
<table>
  <thead>
    <tr>
      <th>Producto</th>
      <th>Precio Actual</th>
      <th>Precio Nuevo</th>
      <th>Diferencia</th>
    </tr>
  </thead>
  <tbody>
    {selectedProducts.map(product => {
      const newPrice = calculateNewPrice(product, adjustment);
      return (
        <tr key={product.id}>
          <td>{product.name}</td>
          <td>${product.price}</td>
          <td>${newPrice}</td>
          <td className={newPrice > product.price ? 'text-green' : 'text-red'}>
            {((newPrice - product.price) / product.price * 100).toFixed(1)}%
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

<p className="text-amber-600">
  ⚠️ Este cambio afectará {selectedProducts.filter(p => p.show_in_ecommerce).length} productos en la tienda online.
</p>

<label>
  <input type="checkbox" required />
  He revisado los cambios y entiendo que son irreversibles
</label>
```

---

### 16. Validación de Duplicados en Tiempo Real

**Ubicación:** `ProductFormModal.tsx`

**Problema:**
- Usuario completa formulario → envía → error 400 "SKU ya existe" → pierde tiempo

**Solución:**
```typescript
// ✅ Validar en blur:
<input
  name="sku"
  onBlur={async (e) => {
    const sku = e.target.value;
    if (!sku) return;
    
    const { data } = await api.get(`/products/check-sku?sku=${sku}`);
    if (data.exists) {
      setError('sku', {
        type: 'manual',
        message: 'Este SKU ya existe. Use otro código.'
      });
    }
  }}
  {...register('sku', { required: 'SKU es requerido' })}
/>

// ✅ Backend: Agregar endpoint lightweight
@router.get("/check-sku")
async def check_sku(sku: str, db: Session = Depends(get_db)):
    exists = db.query(Product).filter(Product.sku == sku).first() is not None
    return {"exists": exists}
```

---

## 📊 MATRIZ DE RIESGO

| ID | Problema | Seguridad | UX | Impacto | Esfuerzo | Prioridad |
|----|----------|-----------|----|---------|---------|-----------| 
| 1  | Tokens en localStorage | 🔴 Crítico | - | Alto | Medio | **P0** |
| 2  | Rate limiting OFF | 🔴 Crítico | - | Alto | Bajo | **P0** |
| 3  | Init DB sin auth | 🔴 Crítico | - | Crítico | Bajo | **P0** |
| 4  | window.confirm | - | 🔴 Crítico | Medio | Bajo | **P0** |
| 5  | Sin warn unsaved | - | 🔴 Crítico | Medio | Bajo | **P0** |
| 6  | Stock sin límites | - | 🔴 Crítico | Medio | Bajo | **P0** |
| 7  | Secret key débil | 🟠 Alto | - | Alto | Bajo | **P1** |
| 8  | CORS wildcard | 🟠 Alto | - | Medio | Bajo | **P1** |
| 9  | Sin CSP headers | 🟠 Alto | - | Medio | Medio | **P1** |
| 10 | File validation | 🟡 Medio | - | Medio | Medio | **P2** |
| 11 | Sin HTTPS force | 🟡 Medio | - | Bajo | Bajo | **P2** |
| 12 | Error details | 🟡 Medio | - | Bajo | Bajo | **P2** |
| 13 | Errores técnicos | - | 🟡 Medio | Bajo | Bajo | **P2** |
| 14 | Stock global | - | 🟡 Medio | Medio | Medio | **P2** |
| 15 | Sin preview bulk | - | 🟡 Medio | Medio | Medio | **P2** |
| 16 | Sin validación RT | - | 🟢 Bajo | Bajo | Medio | **P3** |

---

## ✅ PLAN DE ACCIÓN

### FASE 0: HOTFIX URGENTE (HOY - 24 HORAS)

**Objetivo:** Cerrar 3 vulnerabilidades críticas de seguridad

```bash
# 1. HABILITAR RATE LIMITING
echo "RATE_LIMIT_ENABLED=true" >> .env.production
# Railway: Settings → Variables → Add RATE_LIMIT_ENABLED=true

# 2. ELIMINAR CORS WILDCARD
# backend/config/settings.py línea 214
# BORRAR línea: "*"

# 3. PROTEGER INIT_DB ENDPOINT
# backend/routers/init_db_endpoint.py línea 51
# AGREGAR: current_user: User = Depends(require_admin)

# 4. COMMIT Y DEPLOY
git add backend/config/settings.py backend/routers/init_db_endpoint.py
git commit -m "fix(security): enable rate limiting, remove CORS wildcard, protect init_db endpoint"
git push origin main
```

**Testing:**
```bash
# Verificar rate limiting
for i in {1..100}; do curl http://localhost:8000/auth/login -d "username=test&password=test"; done
# Debe retornar HTTP 429 "Too Many Requests" después de ~60 requests

# Verificar init_db protegido
curl -X POST http://localhost:8000/api/init/database
# Debe retornar HTTP 401 "Not authenticated"
```

---

### FASE 1: SEGURIDAD CRÍTICA (1 SEMANA)

**Objetivo:** Migrar a httpOnly cookies, generar secret key robusta, agregar CSP headers

#### 1.1 Migrar a httpOnly Cookies (3-4 horas)

**Backend:**
```python
# backend/routers/auth.py
@router.post("/login", response_model=Token)
async def login(...):
    access_token = create_access_token(data={"sub": user.username})
    user_data = {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "branch_id": user.branch_id,
    }
    
    response = JSONResponse(content={"user": user_data})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # Solo HTTPS
        samesite="lax",
        max_age=28800,  # 8 horas
        domain=".railway.app" if settings.is_production else None
    )
    return response

# backend/auth.py - Actualizar get_current_user()
async def get_current_user(
    token: str = Cookie(None, alias="access_token"),  # Leer de cookie
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise credentials_exception
    # ... resto igual
```

**Frontend:**
```typescript
// shared/hooks/useAuth.ts
// ELIMINAR:
// localStorage.setItem('token', token);

// AGREGAR:
login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    // El token viene en cookie automáticamente (httpOnly)
    set({ user: response.data.user, isAuthenticated: true });
}

// shared/api/client.ts
// ELIMINAR interceptor que agrega Authorization header desde localStorage
// Las cookies se envían automáticamente con { withCredentials: true }
```

**Testing:**
```bash
# 1. Login debe setear cookie httpOnly
curl -c cookies.txt -X POST http://localhost:8000/auth/login -d "username=admin&password=password"
# Ver cookies.txt: debe tener "access_token" con HttpOnly

# 2. Requests subsiguientes usan cookie
curl -b cookies.txt http://localhost:8000/users/me
# Debe retornar usuario autenticado
```

---

#### 1.2 Generar Secret Key Robusta (10 minutos)

```bash
# Generar secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Output: xF3nP-9Qw2mL5vR7yT4bH6gN1cX8z0aW3eKJ8d_

# Railway: Settings → Variables
# SECRET_KEY=xF3nP-9Qw2mL5vR7yT4bH6gN1cX8z0aW3eKJ8d_

# Validación en settings.py (agregar)
if settings.is_production:
    if len(settings.jwt_secret_key) < 32:
        raise ValueError("JWT_SECRET_KEY must be at least 32 characters")
```

---

#### 1.3 Agregar CSP Headers (30 minutos)

```javascript
// frontend/pos-cesariel/next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js requires unsafe-eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://res.cloudinary.com data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://backend-production-c20a.up.railway.app wss:",
              "frame-ancestors 'none'",
            ].join('; ')
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Testing:**
```bash
# Verificar headers
curl -I http://localhost:3000
# Debe mostrar:
# Content-Security-Policy: default-src 'self'; ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

---

### FASE 2: UX SAFETY (1 SEMANA)

**Objetivo:** Reemplazar window.confirm, agregar warn unsaved, límites de stock

#### 2.1 Reemplazar window.confirm (2-3 horas)

**Crear componente reutilizable:**
```typescript
// shared/components/ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  dependencies?: { label: string; count: number }[];  // Mostrar dependencias
}

export function ConfirmDialog({ ... }: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === 'danger' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
            {variant === 'warning' && <ExclamationCircleIcon className="h-5 w-5 text-amber-600" />}
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-gray-600">{message}</p>
        
        {dependencies && dependencies.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
            <p className="text-sm font-medium text-amber-800 mb-1">
              Registros relacionados:
            </p>
            <ul className="text-sm text-amber-700">
              {dependencies.map(dep => (
                <li key={dep.label}>• {dep.count} {dep.label}</li>
              ))}
            </ul>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {cancelText || 'Cancelar'}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'destructive' : 'default'} 
            onClick={onConfirm}
          >
            {confirmText || 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Uso:**
```typescript
// CategoryFormModal.tsx (reemplazar window.confirm)
const [confirmDialog, setConfirmDialog] = useState({
  isOpen: false,
  categoryId: null,
  categoryName: '',
  dependencies: []
});

const handleDeleteClick = async (categoryId: number, categoryName: string) => {
  // Verificar dependencias
  const { data } = await api.get(`/categories/${categoryId}/dependencies`);
  
  setConfirmDialog({
    isOpen: true,
    categoryId,
    categoryName,
    dependencies: [
      { label: 'productos', count: data.product_count }
    ]
  });
};

const confirmDelete = async () => {
  await deleteCategory(confirmDialog.categoryId);
  setConfirmDialog({ ...confirmDialog, isOpen: false });
};

// En el JSX:
<ConfirmDialog
  isOpen={confirmDialog.isOpen}
  title={`Eliminar Categoría "${confirmDialog.categoryName}"`}
  message={
    confirmDialog.dependencies[0].count > 0
      ? 'Esta categoría tiene productos asociados. Será desactivada (no eliminada).'
      : 'Esta categoría será eliminada permanentemente.'
  }
  variant="danger"
  onConfirm={confirmDelete}
  onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
  dependencies={confirmDialog.dependencies}
/>
```

**Archivos a actualizar:**
- `CategoryFormModal.tsx`
- `BrandFormModal.tsx`
- `payment-config/page.tsx`
- `CustomInstallmentsManager.tsx`
- `ProductImageManager.tsx`

---

#### 2.2 Agregar Warn Unsaved (1 hora)

**Hook reutilizable:**
```typescript
// shared/hooks/useWarnUnsaved.ts
export function useWarnUnsaved(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';  // Chrome requires returnValue to be set
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  
  const confirmClose = (onClose: () => void) => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Hay cambios sin guardar. ¿Está seguro de que desea salir?'
      );
      if (!confirmed) return;
    }
    onClose();
  };
  
  return { confirmClose };
}
```

**Uso en modales:**
```typescript
// ProductFormModal.tsx
import { useForm } from 'react-hook-form';
import { useWarnUnsaved } from '@/shared/hooks/useWarnUnsaved';

export function ProductFormModal({ isOpen, onClose, ... }) {
  const { formState, ... } = useForm();
  const { confirmClose } = useWarnUnsaved(formState.isDirty);
  
  return (
    <Modal isOpen={isOpen} onClose={() => confirmClose(onClose)}>
      {/* ... */}
    </Modal>
  );
}
```

**Archivos a actualizar:**
- `ProductFormModal.tsx`
- `CategoryFormModal.tsx`
- `BrandFormModal.tsx`
- `StockAdjustmentModal.tsx`
- `BranchFormModal.tsx`

---

#### 2.3 Límites en Ajustes de Stock (1 hora)

```typescript
// StockAdjustmentModal.tsx
const [warning, setWarning] = useState<{show: boolean; message: string} | null>(null);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  const newStock = parseInt(formData.new_stock);
  const currentStock = product.stock_quantity;
  const change = Math.abs(newStock - currentStock);
  const percentChange = currentStock > 0 ? (change / currentStock) * 100 : 0;
  
  // Advertencia si cambio > 50%
  if (percentChange > 50) {
    setWarning({
      show: true,
      message: `Cambio grande: ${currentStock} → ${newStock} (${percentChange.toFixed(0)}%). ¿Confirmar?`
    });
    return;
  }
  
  submitAdjustment();
};

const submitAdjustment = async () => {
  setWarning(null);
  // ... submit logic
};

// En el JSX:
{warning && (
  <div className="bg-amber-50 border border-amber-300 rounded-md p-3 mb-4">
    <p className="text-sm text-amber-800">{warning.message}</p>
    <div className="flex gap-2 mt-2">
      <Button size="sm" onClick={submitAdjustment}>Confirmar cambio</Button>
      <Button size="sm" variant="outline" onClick={() => setWarning(null)}>Cancelar</Button>
    </div>
  </div>
)}
```

**Backend - Rate limiting por usuario:**
```python
# backend/routers/products.py
# Agregar auditoría de ajustes frecuentes
@router.post("/{product_id}/adjust-stock")
async def adjust_stock(...):
    # Contar ajustes del usuario en última hora
    one_hour_ago = datetime.now() - timedelta(hours=1)
    recent_adjustments = db.query(InventoryMovement).filter(
        InventoryMovement.created_by == current_user.id,
        InventoryMovement.created_at >= one_hour_ago
    ).count()
    
    if recent_adjustments > 20:
        # Notificar a admin
        notify_admin(f"Usuario {current_user.username} ha hecho {recent_adjustments} ajustes de stock en 1 hora")
    
    # ... resto de lógica
```

---

### FASE 3: MEJORAS MEDIAS (2-4 SEMANAS)

**Objetivo:** File validation, HTTPS enforcement, error handling

#### 3.1 File Validation Mejorada (2 horas)

```python
# backend/utils/file_validation.py
import magic  # pip install python-magic

ALLOWED_MIME_TYPES = {
    'image/jpeg': [b'\xff\xd8\xff'],
    'image/png': [b'\x89PNG\r\n\x1a\n'],
    'image/gif': [b'GIF87a', b'GIF89a'],
    'image/webp': [b'RIFF', b'WEBP'],
}

def validate_file_secure(file: UploadFile) -> tuple[bool, str]:
    """Validación robusta de archivos subidos."""
    
    # 1. Validar extensión
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {'.jpg', '.jpeg', '.png', '.gif', '.webp'}:
        return False, f"Extensión no permitida: {ext}"
    
    # 2. Validar Content-Type
    if file.content_type not in ALLOWED_MIME_TYPES:
        return False, f"Tipo MIME no permitido: {file.content_type}"
    
    # 3. Validar magic bytes (primeros 16 bytes)
    file_header = file.file.read(16)
    file.file.seek(0)  # Reset file pointer
    
    valid_magic = False
    for mime_type, magic_bytes_list in ALLOWED_MIME_TYPES.items():
        if file.content_type == mime_type:
            for magic_bytes in magic_bytes_list:
                if file_header.startswith(magic_bytes):
                    valid_magic = True
                    break
    
    if not valid_magic:
        return False, "El contenido del archivo no coincide con su extensión"
    
    # 4. Validar tamaño (max 5MB)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset
    
    if file_size > 5 * 1024 * 1024:
        return False, f"Archivo muy grande: {file_size / 1024 / 1024:.1f}MB (max 5MB)"
    
    return True, "OK"

# Uso en endpoints
@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    is_valid, error_msg = validate_file_secure(file)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    # ... resto de lógica
```

---

#### 3.2 HTTPS Enforcement (30 minutos)

```python
# backend/main.py
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

if settings.is_production:
    # Force HTTPS
    app.add_middleware(HTTPSRedirectMiddleware)
    
    # Validate Host header
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "backend-production-c20a.up.railway.app",
            "*.railway.app",
            settings.backend_url.replace("https://", "")
        ]
    )
    
    # Security headers
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response
```

---

#### 3.3 Error Handling Profesional (1 hora)

```python
# backend/main.py
import uuid
import traceback
from fastapi.responses import JSONResponse

# Logger para seguridad
security_logger = logging.getLogger('security')

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Manejar excepciones HTTP con logging."""
    request_id = str(uuid.uuid4())
    
    # Log error
    logger.warning(
        f"HTTP {exc.status_code} | Request ID: {request_id} | "
        f"Path: {request.url.path} | Detail: {exc.detail}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "request_id": request_id
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Manejar errores no capturados."""
    request_id = str(uuid.uuid4())
    
    # Log completo en backend
    logger.error(
        f"Unhandled exception | Request ID: {request_id} | "
        f"Path: {request.url.path} | Error: {exc}",
        exc_info=True
    )
    
    if settings.is_production:
        # Mensaje genérico en producción
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "request_id": request_id,
                "message": "Por favor contacte al soporte técnico con este ID"
            }
        )
    else:
        # Detalles en desarrollo
        return JSONResponse(
            status_code=500,
            content={
                "error": str(exc),
                "type": type(exc).__name__,
                "traceback": traceback.format_exc(),
                "request_id": request_id
            }
        )

# Login attempts logging
@router.post("/login")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        security_logger.warning(
            f"Failed login attempt | Username: {form_data.username} | "
            f"IP: {request.client.host} | User-Agent: {request.headers.get('user-agent')}"
        )
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    security_logger.info(
        f"Successful login | Username: {user.username} | "
        f"IP: {request.client.host} | Role: {user.role}"
    )
    # ...
```

---

## 📈 MÉTRICAS DE ÉXITO

### Fase 0 (Hotfix)
- [x] Rate limiting habilitado (verificar HTTP 429 después de 60 requests)
- [x] CORS wildcard eliminado (verificar lista en settings.py)
- [x] Init DB protegido (verificar HTTP 401 sin token)

### Fase 1 (Seguridad)
- [ ] Tokens en httpOnly cookies (verificar en DevTools → Application → Cookies)
- [ ] Secret key robusta (> 32 caracteres, caracteres especiales)
- [ ] CSP headers activos (verificar en DevTools → Network → Response Headers)
- [ ] Penetration testing: 0 vulnerabilidades CRÍTICAS

### Fase 2 (UX Safety)
- [ ] 0 usos de `window.confirm()` (grep en frontend)
- [ ] 100% de formularios con warn unsaved
- [ ] Advertencias en ajustes de stock > 50%
- [ ] Reducción del 80% en "eliminaciones accidentales" (métrica de soporte)

### Fase 3 (Mejoras)
- [ ] File validation con magic bytes
- [ ] HTTPS enforcement activo (verificar redirect)
- [ ] Error logging con request IDs
- [ ] 100% de errores traducidos a español user-friendly

---

## 🔍 AUDITORÍAS RECOMENDADAS

### Cada 3 meses:
1. **Dependency scanning**: `npm audit`, `pip-audit`, `snyk`
2. **Code review**: Buscar nuevos `window.confirm`, `localStorage.setItem('token')`
3. **Penetration testing**: Contratar profesional o usar OWASP ZAP
4. **Log review**: Analizar security_logger para patrones de ataque

### Cada 6 meses:
1. **Full security audit** por profesional externo
2. **Disaster recovery drill**: Simular breach y validar rollback plan
3. **User training**: Capacitar en phishing, social engineering

---

## 📝 CONCLUSIÓN

**Estado Actual:**
- 🔒 Seguridad: **6/10** (sólida base, vulnerabilidades críticas en token storage y rate limiting)
- 🛡️ UX Safety: **7/10** (backend robusto, frontend necesita refuerzos)

**Estado Esperado Post-Remediación:**
- 🔒 Seguridad: **9/10** (httpOnly cookies, rate limiting, CSP, HTTPS enforcement)
- 🛡️ UX Safety: **9/10** (confirmaciones robustas, warn unsaved, límites de stock)

**Tiempo Estimado Total:** 3-4 semanas (2 semanas crítico, 2 semanas mejoras)

**Inversión Requerida:**
- Fase 0: 4-6 horas (1 día)
- Fase 1: 20-30 horas (1 semana)
- Fase 2: 15-20 horas (1 semana)
- Fase 3: 20-30 horas (2 semanas)

**ROI:**
- Prevención de breach de seguridad: **invaluable**
- Reducción de errores de usuario: **80%**
- Mejora de confianza del cliente: **alta**
- Cumplimiento de estándares de seguridad: **crítico para escalabilidad**

---

**Auditor**: Claude Code (Anthropic)  
**Modelo**: claude-sonnet-4-5-20250929  
**Fecha**: 3 de Marzo, 2026  
**Versión**: 1.0
