# 🔧 Fix Backend - Error "No module named 'uvicorn'"

## ❌ Problema

El backend en Railway muestra este error repetidamente:
```
ModuleNotFoundError: No module named 'uvicorn'
```

## 🔍 Causa Raíz

Railway está usando **Nixpacks/Railpack** en lugar del **Dockerfile.production**, por lo que no instala correctamente las dependencias de Python.

Este es el **mismo problema** que tuvimos con frontend-pos y e-commerce.

---

## ✅ Solución (5 minutos)

### Paso 1: Configurar Builder en Railway UI

1. **Ve a Railway Dashboard:**
   - https://railway.app/project/2984b683-f2d8-4cf6-a13b-ca806d5bb3e6

2. **Selecciona el servicio "pos-cesariel" (backend)**

3. **Settings → Source:**
   - **Root Directory:** `backend`
   - ✅ Guarda los cambios

4. **Settings → Build:**
   - **Builder:** Selecciona **"Dockerfile"** (NO "Auto-detect")
   - **Dockerfile Path:** `Dockerfile.production`
   - ✅ Guarda los cambios

5. **Railway iniciará automáticamente un nuevo build** (5-10 minutos)

---

## 🔍 Verificar el Build

### Ver logs en tiempo real:

```bash
railway logs --service pos-cesariel
```

### ✅ Build CORRECTO (lo que debes ver):

```
using dockerfile builder
Step 1/14 : FROM python:3.9-slim as builder
Step 2/14 : WORKDIR /app
...
Successfully built
Successfully tagged ...
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### ❌ Build INCORRECTO (si aún usa Nixpacks):

```
using build driver nixpacks
⚠ No Python version specified
✖ Failed to install dependencies
ModuleNotFoundError: No module named 'uvicorn'
```

---

## 📋 Configuración Completa del Backend

Una vez que el Builder esté configurado, también necesitas estas variables:

### En Railway UI → pos-cesariel → Settings → Variables:

| Variable | Valor | Cómo Configurarlo |
|----------|-------|-------------------|
| **DATABASE_URL** | `${{postgres.DATABASE_URL}}` | Add Reference → postgres → DATABASE_URL |
| **SECRET_KEY** | `tu-secret-key-segura` | New Variable (manual) |
| **PORT** | `8000` | New Variable (manual) |
| **ENVIRONMENT** | `production` | New Variable (manual) |

### Generar SECRET_KEY:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

O usa este temporal:
```
my-secret-key-for-railway-deployment-2024
```

---

## 🧪 Probar el Backend

### 1. Health Check

Una vez que el build termine:

```bash
curl https://pos-cesariel-production.up.railway.app/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Verificar API Docs

Abre en el navegador:
- https://pos-cesariel-production.up.railway.app/docs

Deberías ver la documentación de FastAPI (Swagger UI).

### 3. Test de Login

```bash
curl -X POST https://pos-cesariel-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Si la DB no está inicializada:**
```json
{
  "detail": "User not found"
}
```

**Esto es normal** - significa que el backend funciona pero falta inicializar la base de datos.

---

## 🗄️ Después del Fix - Inicializar Base de Datos

Una vez que el backend funcione correctamente:

```bash
# 1. Cambiar al servicio backend
railway link
# Selecciona: charming-insight → production → pos-cesariel

# 2. Ejecutar script de inicialización
railway run bash init_db.sh
```

Esto creará:
- ✅ Tablas de PostgreSQL
- ✅ Usuarios: admin, manager, seller
- ✅ Sucursales y productos
- ✅ Contenido de e-commerce

---

## 📊 Resumen de Configuraciones Railway

### Backend (pos-cesariel):
```
Root Directory: backend
Builder: Dockerfile
Dockerfile Path: Dockerfile.production

Variables:
- DATABASE_URL: ${{postgres.DATABASE_URL}}
- SECRET_KEY: my-secret-key-for-railway-deployment-2024
- PORT: 8000
- ENVIRONMENT: production
```

### Frontend POS (frontend-pos):
```
Root Directory: frontend/pos-cesariel
Builder: Dockerfile
Dockerfile Path: Dockerfile.production

Variables:
- NEXT_PUBLIC_API_URL: https://pos-cesariel-production.up.railway.app
- PORT: 3000
- NODE_ENV: production
```

### E-commerce (e-commerce):
```
Root Directory: ecommerce
Builder: Dockerfile
Dockerfile Path: Dockerfile.production

Variables:
- NEXT_PUBLIC_API_URL: https://pos-cesariel-production.up.railway.app
- API_URL: https://pos-cesariel-production.up.railway.app
- PORT: 3001
- NODE_ENV: production
```

---

## 🔧 Troubleshooting

### Error: "Build failed - No Dockerfile found"

**Causa:** Root Directory no está configurado o es incorrecto

**Solución:**
- Settings → Source → Root Directory: `backend`
- El Dockerfile.production debe estar en `backend/Dockerfile.production`

### Error: "Still showing Nixpacks"

**Causa:** Cambios no guardados o caché de Railway

**Solución:**
1. Verifica que guardaste los cambios en Build settings
2. Haz un redeploy manual: Settings → Deployments → Trigger Deploy

### Backend inicia pero crash inmediatamente

**Causa:** DATABASE_URL no configurado

**Solución:**
```bash
railway variables --service pos-cesariel | grep DATABASE_URL
```

Si no aparece, agrégalo desde Railway UI.

---

## 📋 Checklist de Fix

- [ ] Settings → Source → Root Directory: `backend`
- [ ] Settings → Build → Builder: `Dockerfile`
- [ ] Settings → Build → Dockerfile Path: `Dockerfile.production`
- [ ] Variables → DATABASE_URL (referencia a postgres)
- [ ] Variables → SECRET_KEY
- [ ] Variables → PORT: 8000
- [ ] Variables → ENVIRONMENT: production
- [ ] Build completado exitosamente
- [ ] Health check responde
- [ ] API docs accesibles en /docs
- [ ] Database inicializada con init_db.sh

---

## 🔗 Enlaces Útiles

| Recurso | URL |
|---------|-----|
| **Railway Dashboard** | https://railway.app/project/2984b683-f2d8-4cf6-a13b-ca806d5bb3e6 |
| **Backend API** | https://pos-cesariel-production.up.railway.app |
| **API Docs** | https://pos-cesariel-production.up.railway.app/docs |
| **Health Check** | https://pos-cesariel-production.up.railway.app/health |

---

## 📚 Documentación Relacionada

- **DATABASE_SETUP.md** - Guía completa de configuración de PostgreSQL
- **init_db.sh** - Script para inicializar base de datos
- **DEPLOY_SUCCESS.md** - Deploy del frontend POS
- **ECOMMERCE_DEPLOY_SUMMARY.md** - Deploy del e-commerce

---

**Fecha:** Diciembre 17, 2024
**Problema:** ModuleNotFoundError: No module named 'uvicorn'
**Causa:** Railway usando Nixpacks en lugar de Dockerfile
**Solución:** Configurar Builder en Railway UI
**Tiempo estimado:** 5 minutos configuración + 10 minutos build
