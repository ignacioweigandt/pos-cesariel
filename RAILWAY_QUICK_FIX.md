# 🚀 Railway Frontend - Fix Rápido (5 minutos)

## El Problema
```
✖ Railpack could not determine how to build the app.
```

## La Solución (3 pasos)

### Paso 1: Ve a Settings → Build
En tu servicio de Railway:
1. Haz clic en **"Settings"** (⚙️)
2. Busca la sección **"Build"** o **"Builder"**

### Paso 2: Cambia a Dockerfile
1. **Builder**: Cambia de "Railpack" a **"Dockerfile"**
2. **Dockerfile Path**: Escribe `Dockerfile.production`

```
╭─────────────────────────────╮
│ Settings                    │
├─────────────────────────────┤
│ Source                      │
│   Root Directory:           │
│   frontend/pos-cesariel ✅  │
├─────────────────────────────┤
│ Build                       │
│   Builder: [Dockerfile] ⚠️  │  ← CAMBIAR AQUÍ
│   Dockerfile Path:          │
│   Dockerfile.production ✅  │
╰─────────────────────────────╯
```

### Paso 3: Deploy
1. **Guarda** (si hay botón Save)
2. Ve a **"Deployments"**
3. Haz clic en **"Deploy"** o espera auto-deploy

---

## Verificación

### ✅ Correcto (Dockerfile):
```
using dockerfile builder
Step 1/15 : FROM node:18-alpine AS deps
...
Successfully built
```

### ❌ Incorrecto (Railpack):
```
using build driver railpack-v0.15.1
⚠ Script start.sh not found
```

---

## Variables de Entorno (No olvides)

Ve a **"Variables"** y agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

⚠️ **Reemplaza** `tu-backend.railway.app` con tu dominio real del backend.

---

## Si no ves la opción "Builder"

1. Ve a **Settings** → **"Show Advanced"** o busca **"Custom Build"**
2. O usa Railway CLI:
   ```bash
   npm i -g @railway/cli
   railway login
   railway link
   railway vars set RAILWAY_DOCKERFILE_PATH=Dockerfile.production
   ```

---

## Configuración Completa

| Setting | Value |
|---------|-------|
| Root Directory | `frontend/pos-cesariel` |
| Builder | **Dockerfile** |
| Dockerfile Path | `Dockerfile.production` |
| NEXT_PUBLIC_API_URL | `https://tu-backend.railway.app` |
| PORT | `3000` |
| NODE_ENV | `production` |

---

## Tiempo estimado
⏱️ **5 minutos** de configuración
⏱️ **5-10 minutos** de build

---

## Ayuda

- 📖 Guía completa: `RAILWAY_MANUAL_CONFIG.md`
- 📖 Deployment general: `RAILWAY_FRONTEND_DEPLOYMENT.md`
- 📖 Troubleshooting: Ver sección en `CLAUDE.md`

---

**Última actualización**: Diciembre 2024
