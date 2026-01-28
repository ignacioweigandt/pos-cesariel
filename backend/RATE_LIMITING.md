# Rate Limiting Guide - POS Cesariel

## 🛡️ ¿Qué es Rate Limiting?

Rate limiting es una técnica de seguridad que **limita la cantidad de requests** que un usuario/IP puede hacer a tu API en un período de tiempo determinado.

### Sin Rate Limiting:
```
Usuario: Login con password incorrecta (intento 1)
Usuario: Login con password incorrecta (intento 2)
Usuario: Login con password incorrecta (intento 3)
...
Usuario: Login con password incorrecta (intento 10000) ← ATAQUE DE FUERZA BRUTA
```

### Con Rate Limiting:
```
Usuario: Login con password incorrecta (intento 1)
Usuario: Login con password incorrecta (intento 2)
Usuario: Login con password incorrecta (intento 3)
Usuario: Login con password incorrecta (intento 4)
Usuario: Login con password incorrecta (intento 5)
API: ❌ 429 Too Many Requests - Espera 60 segundos
```

---

## 📊 Rate Limits Configurados

### Autenticación (Máxima Seguridad)
- **`/auth/login`**: 5 requests/minuto
- **`/auth/login-json`**: 5 requests/minuto
- **Razón**: Prevenir ataques de fuerza bruta

### E-commerce Público (Uso Normal)
- **`/ecommerce/products` (GET)**: 100 requests/minuto
- **`/ecommerce/sales` (POST)**: 10 requests/minuto
- **Razón**: Permitir browsing normal pero limitar compras excesivas

### Operaciones Costosas (Muy Restrictivo)
- **`/products/import`**: 10 requests/hora
- **Razón**: Importaciones masivas consumen muchos recursos

### Endpoints Generales (Default)
- **Todos los demás**: 60 requests/minuto
- **Razón**: Balance entre usabilidad y protección

---

## 🔧 Arquitectura Técnica

### Stack Utilizado

**SlowAPI** - Biblioteca de rate limiting para FastAPI
- Compatible con FastAPI nativo
- Basado en Flask-Limiter
- Soporte para Redis (producción) y memoria (desarrollo)

### Identificación de Clientes

Por defecto, usamos **IP address** para identificar clientes:

```python
def get_identifier(request: Request) -> str:
    # 1. Revisar header X-Forwarded-For (si está detrás de proxy)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    # 2. Revisar header X-Real-IP
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # 3. Fallback a IP directa
    return get_remote_address(request)
```

**Alternativas para producción:**
- User ID (para usuarios autenticados)
- API Key (para integraciones)
- Combinación IP + User Agent

---

## 📝 Uso en Endpoints

### Aplicar Rate Limit a Endpoint

```python
from fastapi import APIRouter, Request
from config.rate_limit import limiter, RateLimits

router = APIRouter()

@router.post("/login")
@limiter.limit(RateLimits.AUTH_LOGIN)  # 5/minute
async def login(request: Request, ...):
    # Request parameter es REQUERIDO para rate limiting
    pass
```

**IMPORTANTE**: El parámetro `request: Request` es **OBLIGATORIO**.

### Custom Rate Limit

```python
@router.get("/endpoint")
@limiter.limit("20/minute")  # Custom: 20 por minuto
async def custom_endpoint(request: Request):
    pass
```

### Múltiples Límites

```python
@router.post("/endpoint")
@limiter.limit("100/hour")  # Límite por hora
@limiter.limit("10/minute")  # Límite por minuto
async def multi_limited(request: Request):
    # Si alguno se excede, se bloquea
    pass
```

---

## 🌐 Response Headers

Cuando rate limiting está activo, la API devuelve headers informativos:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 5              # Límite total
X-RateLimit-Remaining: 3           # Requests restantes
X-RateLimit-Reset: 1643723456      # Unix timestamp de reset
```

### Cuando se excede el límite:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60                    # Segundos para reintentar

{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please slow down and try again later.",
  "retry_after": "60 seconds"
}
```

---

## 🚀 Configuración de Producción

### Usar Redis como Backend (Recomendado)

En desarrollo usamos memoria in-process, pero **en producción deberías usar Redis**:

```python
# backend/config/rate_limit.py

limiter = Limiter(
    key_func=get_identifier,
    storage_uri="redis://localhost:6379",  # Usar Redis
    # O desde variable de entorno:
    storage_uri=os.getenv("REDIS_URL", "memory://"),
)
```

**Ventajas de Redis:**
- ✅ Persistente entre reinicios
- ✅ Compartido entre múltiples instancias del backend
- ✅ Mejor performance
- ✅ Soporta millones de keys

**Docker Compose con Redis:**

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  backend:
    environment:
      - REDIS_URL=redis://redis:6379

volumes:
  redis_data:
```

### Variables de Entorno

Agregar a `.env`:

```env
# Rate Limiting
REDIS_URL=redis://localhost:6379
RATE_LIMIT_EXEMPT_IPS=127.0.0.1,10.0.0.1  # IPs exempt
```

---

## 🔓 Exemptions (Excepciones)

Algunos endpoints o IPs pueden estar exentos de rate limiting:

### Endpoints Exentos Automáticamente

```python
# backend/config/rate_limit.py

def is_exempt_from_rate_limit(request: Request) -> bool:
    # Health checks
    if request.url.path in ["/health", "/", "/docs", "/redoc"]:
        return True
    
    # IPs específicas (ej: servicios internos)
    if client_ip in RATE_LIMIT_EXEMPT_IPS:
        return True
    
    return False
```

### Agregar IP Exempt

```env
# .env
RATE_LIMIT_EXEMPT_IPS=192.168.1.100,10.0.0.5
```

---

## 🧪 Testing

### Deshabilitar en Tests

Rate limiting se deshabilita automáticamente cuando `ENV=test`:

```python
limiter = Limiter(
    key_func=get_identifier,
    enabled=os.getenv("ENV") != "test",  # Disabled in tests
)
```

### Probar Rate Limiting Manualmente

```bash
# Test login rate limit (5/minute)
for i in {1..6}; do
  curl -X POST http://localhost:8000/auth/login \
    -d "username=test&password=wrong" \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done

# Los primeros 5 deberían retornar 401 (Unauthorized)
# El 6to debería retornar 429 (Too Many Requests)
```

### Test de Headers

```bash
curl -i http://localhost:8000/ecommerce/products

# Buscar headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
```

---

## 📈 Monitoreo

### Ver Estadísticas de Rate Limiting

```python
from config.rate_limit import limiter

# En un endpoint admin
@router.get("/admin/rate-limit-stats")
async def get_rate_limit_stats(request: Request):
    # Esto requeriría implementación custom según backend
    # Redis permite queries para ver keys activas
    return {"message": "Not implemented"}
```

### Logs de Rate Limiting

SlowAPI automáticamente loggea cuando alguien es rate limited.

---

## ⚠️ Troubleshooting

### Error: "Request parameter required"

```python
# ❌ MAL
@limiter.limit("5/minute")
async def endpoint():  # Falta Request
    pass

# ✅ BIEN
@limiter.limit("5/minute")
async def endpoint(request: Request):
    pass
```

### Rate Limit No Se Aplica

Verificar que:
1. Middleware está agregado en `main.py`
2. Exception handler está registrado
3. `ENV != "test"`
4. Endpoint tiene decorador `@limiter.limit()`

### Cliente Reporta Muchos 429

Opciones:
1. Aumentar el límite (si es legítimo)
2. Educar al cliente sobre el uso correcto
3. Ofrecer una API key con límites mayores

---

## 🎯 Mejores Prácticas

### 1. Límites Conservadores al Inicio

Es mejor empezar con límites **más estrictos** y relajarlos según necesidad:

```python
# Empezar estricto
@limiter.limit("10/minute")

# Si usuarios se quejan (legítimamente), aumentar
@limiter.limit("30/minute")
```

### 2. Comunicar Límites Claramente

Documentar límites en:
- Swagger/OpenAPI docs
- README de API
- Mensajes de error

### 3. Diferentes Límites por Rol

```python
from auth_compat import get_current_user

@router.get("/products")
async def get_products(request: Request, user = Depends(get_current_user)):
    # Usuarios premium: sin límite
    if user.is_premium:
        return ...
    
    # Usuarios normales: con límite
    await limiter.check(request, "60/minute")
    return ...
```

### 4. Graceful Degradation

No bloquear completamente, ofrecer funcionalidad reducida:

```python
@router.get("/products")
async def get_products(request: Request, limit: int = 100):
    try:
        await limiter.check(request, "100/minute")
    except RateLimitExceeded:
        # Retornar menos productos en lugar de error
        limit = 10
    
    return db.query(Product).limit(limit).all()
```

### 5. Monitorear Patrones de Abuso

Loggear cuando usuarios llegan al límite frecuentemente:

```python
import logging

logger = logging.getLogger(__name__)

@limiter.limit("5/minute")
async def login(request: Request, ...):
    try:
        # ...
    except RateLimitExceeded:
        logger.warning(f"Rate limit exceeded for IP: {get_identifier(request)}")
        raise
```

---

## 📚 Referencia de Configuración

### RateLimits Presets

```python
# backend/config/rate_limit.py

class RateLimits:
    # Authentication
    AUTH_LOGIN = "5/minute"
    AUTH_REGISTER = "3/hour"
    
    # E-commerce
    ECOMMERCE_READ = "100/minute"
    ECOMMERCE_WRITE = "10/minute"
    
    # Admin
    ADMIN_READ = "60/minute"
    ADMIN_WRITE = "30/minute"
    
    # Heavy operations
    BULK_IMPORT = "10/hour"
    BULK_EXPORT = "20/hour"
    REPORT_GENERATION = "10/minute"
    
    # Files
    FILE_UPLOAD = "20/hour"
    
    # Default
    DEFAULT = "60/minute"
```

### Formatos de Límite

```python
"10/second"   # 10 por segundo
"60/minute"   # 60 por minuto
"100/hour"    # 100 por hora
"1000/day"    # 1000 por día
"5000/month"  # 5000 por mes
```

---

## 🔄 Migración de Sistema Sin Rate Limiting

Si ya tenés un sistema en producción sin rate limiting:

### Paso 1: Deploy con Límites Altos

```python
# Primer deploy: límites muy altos para no afectar usuarios
RateLimits.AUTH_LOGIN = "100/minute"  # Alto inicialmente
```

### Paso 2: Monitorear Uso Real

```bash
# Ver requests promedio
grep "POST /auth/login" logs.txt | wc -l
```

### Paso 3: Ajustar Gradualmente

```python
# Segundo deploy: límites más realistas
RateLimits.AUTH_LOGIN = "20/minute"

# Tercer deploy: límites de seguridad
RateLimits.AUTH_LOGIN = "5/minute"
```

---

## 📖 Recursos Adicionales

- [SlowAPI Documentation](https://slowapi.readthedocs.io/)
- [Redis Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiter/)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#rate-limiting)

---

**Última actualización:** 28 de Enero 2026
