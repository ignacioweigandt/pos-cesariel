# Conectar Frontends con Backend - Guía Rápida

## 🎯 Objetivo

Conectar Frontend POS y E-commerce con el backend que ya está funcionando.

---

## 📋 Variables Requeridas

### Frontend POS (frontend-pos)

**Railway UI → frontend-pos → Settings → Variables**

| Variable | Valor |
|----------|-------|
| NEXT_PUBLIC_API_URL | `https://pos-cesariel-production.up.railway.app` |
| PORT | `3000` |
| NODE_ENV | `production` |
| NEXT_TELEMETRY_DISABLED | `1` |

### E-commerce (e-commerce)

**Railway UI → e-commerce → Settings → Variables**

| Variable | Valor |
|----------|-------|
| NEXT_PUBLIC_API_URL | `https://pos-cesariel-production.up.railway.app` |
| API_URL | `https://pos-cesariel-production.up.railway.app` |
| PORT | `3001` |
| NODE_ENV | `production` |
| NEXT_TELEMETRY_DISABLED | `1` |

---

## ⚡ Verificación Rápida (2 minutos)

### Paso 1: Obtener URL del Backend

Primero, necesitas saber la URL exacta de tu backend:

**Railway UI → Backend service → Settings → Networking → Public Networking**

Copia la URL pública, algo como:
```
https://pos-cesariel-production.up.railway.app
```

O:
```
https://web-production-xxxx.up.railway.app
```

---

### Paso 2: Configurar Frontend POS

1. **Railway UI** → Servicio **frontend-pos**
2. **Settings → Variables**
3. **Verifica** que exista `NEXT_PUBLIC_API_URL`
4. **Si existe:** Verifica que el valor sea la URL correcta del backend
5. **Si no existe:** Click **"+ New Variable"**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://pos-cesariel-production.up.railway.app` (tu URL del backend)
6. **Guarda los cambios**

Railway hará **redeploy automático** (2-3 minutos)

---

### Paso 3: Configurar E-commerce

1. **Railway UI** → Servicio **e-commerce**
2. **Settings → Variables**
3. **Verifica/Agrega estas 2 variables:**

**Variable 1:**
- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://pos-cesariel-production.up.railway.app`

**Variable 2:**
- Name: `API_URL`
- Value: `https://pos-cesariel-production.up.railway.app`

4. **Guarda los cambios**

Railway hará **redeploy automático** (2-3 minutos)

---

## 🔍 Verificar que Funciona

### 1. Verificar Backend

```bash
curl https://pos-cesariel-production.up.railway.app/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Verificar Frontend POS

Abre en el navegador:
```
https://frontend-pos-production.up.railway.app
```

**Debes ver:**
- ✅ La página de login del POS
- ✅ Sin errores de "Cannot connect to backend"
- ✅ Puedes intentar hacer login (aunque aún no hay usuarios en la DB)

**Revisa la consola del navegador (F12):**
- ❌ Si ves: `Failed to fetch` o `Network Error` → Backend no conectado
- ✅ Si ves: `401 Unauthorized` o `User not found` → Backend conectado correctamente (solo falta inicializar DB)

### 3. Verificar E-commerce

Abre en el navegador:
```
https://e-commerce-production-3634.up.railway.app
```

**Debes ver:**
- ✅ La página principal del e-commerce
- ✅ Puede mostrar "No products available" (normal, falta inicializar DB)
- ✅ Sin errores de conexión

---

## 🗄️ Inicializar Base de Datos

Una vez que los frontends estén conectados, inicializa la base de datos con datos de prueba.

### Desde tu Terminal Local:

```bash
# 1. Conectar al backend
railway link
# Selecciona: charming-insight → production → [backend service]

# 2. Ejecutar script de inicialización
railway run bash init_db.sh
```

**Esto creará:**
- ✅ Usuarios de prueba (admin/admin123, manager/manager123, seller/seller123)
- ✅ Sucursales
- ✅ Categorías y productos
- ✅ Contenido de e-commerce

**Tiempo estimado:** 2-3 minutos

---

## 🧪 Probar Todo el Sistema

### 1. Login en Frontend POS

1. Abre: https://frontend-pos-production.up.railway.app
2. Login con:
   - **Usuario:** `admin`
   - **Contraseña:** `admin123`
3. Deberías ver el dashboard del POS

### 2. Ver Productos en Frontend POS

1. Dentro del POS, ve a "Productos" o "Inventory"
2. Deberías ver la lista de productos creados

### 3. Ver Productos en E-commerce

1. Abre: https://e-commerce-production-3634.up.railway.app
2. Deberías ver:
   - Productos en la página principal
   - Categorías funcionando
   - Imágenes de productos (si están configuradas)

### 4. Crear una Venta de Prueba

1. Desde el POS Admin, crea una venta
2. Verifica que el stock se actualice
3. Verifica que la venta aparezca en el historial

---

## 🐛 Troubleshooting

### Frontend muestra "Cannot connect to backend"

**Causa:** Variable `NEXT_PUBLIC_API_URL` no configurada o incorrecta

**Solución:**
1. Railway UI → Frontend service → Settings → Variables
2. Verifica que `NEXT_PUBLIC_API_URL` sea la URL correcta del backend
3. Si la cambiaste, Railway hará redeploy automático (espera 2-3 min)

---

### Frontend conecta pero muestra "401 Unauthorized"

**Esto es CORRECTO** - significa que:
- ✅ Frontend SÍ está conectado al backend
- ⚠️ Falta inicializar la base de datos con usuarios

**Solución:** Ejecuta `railway run bash init_db.sh`

---

### E-commerce muestra "No products available"

**Puede ser normal si:**
1. La base de datos está vacía (ejecuta `init_db.sh`)
2. No hay productos con `show_in_ecommerce = true`
3. Backend no está respondiendo

**Verificación:**
```bash
# Ver productos en backend directamente
curl https://pos-cesariel-production.up.railway.app/api/ecommerce/products
```

---

### Error: "CORS policy blocked"

**Causa:** Backend no permite requests desde el frontend

**Solución:**
El backend ya debería tener CORS configurado para Railway. Verifica en `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Variables no se actualizan

**Causa:** Railway no redeployó después de cambiar variables

**Solución Manual:**
1. Railway UI → Service → Settings → Deployments
2. Click en "Trigger Deploy" o "Redeploy"
3. Espera 2-3 minutos

---

## 📊 Resumen de URLs

| Servicio | URL | Variables Requeridas |
|----------|-----|---------------------|
| **Backend** | https://pos-cesariel-production.up.railway.app | DATABASE_URL, SECRET_KEY |
| **Frontend POS** | https://frontend-pos-production.up.railway.app | NEXT_PUBLIC_API_URL |
| **E-commerce** | https://e-commerce-production-3634.up.railway.app | NEXT_PUBLIC_API_URL, API_URL |

---

## ✅ Checklist Final

- [ ] Backend health check responde correctamente
- [ ] Frontend POS tiene NEXT_PUBLIC_API_URL configurado
- [ ] E-commerce tiene NEXT_PUBLIC_API_URL y API_URL configurados
- [ ] Railway redeployó frontend-pos (2-3 min)
- [ ] Railway redeployó e-commerce (2-3 min)
- [ ] Base de datos inicializada con init_db.sh
- [ ] Login funciona en Frontend POS (admin/admin123)
- [ ] Productos se ven en Frontend POS
- [ ] Productos se ven en E-commerce
- [ ] Crear venta funciona correctamente

---

## 🎉 Sistema Completo

Una vez que todo esté funcionando:

```
┌─────────────────────────────────────────────────────┐
│              Railway Production                      │
│                                                      │
│  ┌──────────────┐       ┌──────────────┐           │
│  │  PostgreSQL  │◄──────┤   Backend    │           │
│  │              │       │  (FastAPI)   │           │
│  │              │       │              │           │
│  │    ✅         │       │      ✅       │           │
│  └──────────────┘       └──────┬───────┘           │
│                                │ API                 │
│                   ┌────────────┼────────────┐       │
│                   │            │            │       │
│       ┌───────────▼─────────┐ │ ┌──────────▼────┐  │
│       │ Frontend POS        │ │ │ E-commerce    │  │
│       │                     │ │ │               │  │
│       │        ✅           │ │ │       ✅       │  │
│       └─────────────────────┘ │ └───────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

**Fecha:** Diciembre 17, 2024
**Status:** Backend ✅ - Frontends pendientes de conexión
**Tiempo estimado:** 5 minutos configuración + 5 minutos redeploy + 3 minutos inicializar DB
