# 🚂 Railway CLI - Configuración Paso a Paso

## Estado Actual
✅ Railway CLI instalado (v4.15.0)
✅ Conectado al proyecto: **charming-insight**
✅ Environment: **production**
✅ Backend funcionando: **pos-cesariel** ✅

---

## 🎯 Objetivo
Configurar el servicio **Frontend POS** en Railway usando CLI

---

## 📋 Paso 1: Crear Servicio Frontend (Si no existe)

### Opción A: Desde Railway UI (Recomendado)
1. Ve a https://railway.app
2. Abre tu proyecto **charming-insight**
3. Haz clic en **"+ New"** → **"GitHub Repo"**
4. Selecciona tu repositorio **pos-cesariel**
5. Nombra el servicio como **"frontend-pos"**

### Opción B: Desde CLI
```bash
# Esto abrirá el navegador para autorizar
railway up --service frontend-pos
```

---

## 📋 Paso 2: Verificar Servicios Existentes

Primero, vamos a ver qué servicios tienes:

```bash
# Ver estado actual
railway status

# Deberías ver algo como:
# Project: charming-insight
# Environment: production
# Service: pos-cesariel (backend actual)
```

**¿Ya creaste el servicio frontend?**
- ✅ **SÍ** → Continúa al Paso 3
- ❌ **NO** → Ve al Paso 1 primero

---

## 📋 Paso 3: Cambiar al Servicio Frontend

```bash
# Reemplaza "frontend-pos" con el nombre real de tu servicio
railway link --service frontend-pos
```

**Nota**: Si el servicio tiene otro nombre (como "frontend", "pos-frontend"), usa ese nombre.

### Verificar que cambiaste correctamente:
```bash
railway status

# Debería mostrar:
# Service: frontend-pos
```

---

## 📋 Paso 4: Obtener URL del Backend

Primero, necesitas la URL de tu backend:

```bash
# Cambiar temporalmente al backend
railway link --service pos-cesariel

# Ver el dominio público
railway domain

# Copia la URL que se muestra (ejemplo):
# https://pos-cesariel-production.up.railway.app
```

**Guarda esta URL**, la necesitarás en el siguiente paso.

---

## 📋 Paso 5: Volver al Servicio Frontend

```bash
# Cambiar de vuelta al frontend
railway link --service frontend-pos
```

---

## 📋 Paso 6: Configurar Variables de Entorno

**⚠️ IMPORTANTE**: Reemplaza `<TU-BACKEND-URL>` con la URL real que copiaste en el Paso 4.

```bash
# Configurar variables una por una
railway variables --set NEXT_PUBLIC_API_URL=<TU-BACKEND-URL>
railway variables --set PORT=3000
railway variables --set NODE_ENV=production
railway variables --set NEXT_TELEMETRY_DISABLED=1
```

**Ejemplo con URL real**:
```bash
railway variables --set NEXT_PUBLIC_API_URL=https://pos-cesariel-production.up.railway.app
railway variables --set PORT=3000
railway variables --set NODE_ENV=production
railway variables --set NEXT_TELEMETRY_DISABLED=1
```

### Verificar variables:
```bash
railway variables
```

Deberías ver todas las variables configuradas.

---

## 📋 Paso 7: Configurar Root Directory y Builder (UI)

**⚠️ CRÍTICO**: Railway CLI no puede configurar el builder, debes hacerlo en UI.

### Ve a Railway UI:
1. Abre https://railway.app
2. Ve a tu proyecto **charming-insight**
3. Selecciona el servicio **frontend-pos**

### Configurar Source:
1. Ve a **"Settings"** → **"Source"**
2. **Root Directory**: `frontend/pos-cesariel`

### Configurar Builder:
1. Ve a **"Settings"** → **"Build"**
2. **Builder**: Cambia a **"Dockerfile"**
3. **Dockerfile Path**: `Dockerfile.production`

📸 **Captura visual**:
```
╭─────────────────────────────╮
│ Settings                    │
├─────────────────────────────┤
│ Source                      │
│   Root Directory:           │
│   frontend/pos-cesariel ✅  │
├─────────────────────────────┤
│ Build                       │
│   Builder: Dockerfile   ⚠️  │  ← CAMBIAR AQUÍ
│   Dockerfile Path:          │
│   Dockerfile.production ✅  │
╰─────────────────────────────╯
```

---

## 📋 Paso 8: Deploy

Una vez configurado todo en UI:

### Opción A: Deploy desde UI
1. Ve a **"Deployments"** en Railway UI
2. Haz clic en **"Deploy"**

### Opción B: Deploy desde CLI
```bash
# Asegúrate de estar en el servicio frontend
railway status  # Debe mostrar: Service: frontend-pos

# Deploy
railway up --detach
```

### Monitorear el deploy:
```bash
# Ver logs en tiempo real
railway logs

# Ver estado
railway status
```

---

## 📋 Paso 9: Generar Dominio Público

```bash
# Generar dominio para el frontend
railway domain
```

O desde UI:
1. **Settings** → **"Networking"**
2. **"Generate Domain"**

---

## 📋 Paso 10: Verificar Deployment

### Verificar build:
```bash
railway logs
```

**Busca esto en los logs**:
```
✅ Correcto (Dockerfile):
using dockerfile builder
Step 1/15 : FROM node:18-alpine AS deps
...
Successfully built

❌ Incorrecto (Railpack):
using build driver railpack-v0.15.1
⚠ Script start.sh not found
```

Si ves Railpack, vuelve al **Paso 7** y asegúrate de cambiar el Builder a Dockerfile en UI.

### Verificar que el servicio está corriendo:
```bash
railway status
```

### Probar la aplicación:
```bash
# Obtener el dominio
railway domain

# Visitar en el navegador
# https://<tu-dominio>.railway.app
```

---

## ✅ Checklist Final

- [ ] Servicio frontend creado en Railway
- [ ] Root Directory: `frontend/pos-cesariel`
- [ ] Builder: `Dockerfile` (configurado en UI)
- [ ] Dockerfile Path: `Dockerfile.production`
- [ ] Variables configuradas:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `PORT=3000`
  - [ ] `NODE_ENV=production`
  - [ ] `NEXT_TELEMETRY_DISABLED=1`
- [ ] Deploy completado exitosamente
- [ ] Dominio público generado
- [ ] Aplicación accesible y funcionando

---

## 🆘 Comandos Útiles

```bash
# Ver estado actual
railway status

# Ver variables
railway variables

# Ver dominio
railway domain

# Ver logs en tiempo real
railway logs

# Cambiar de servicio
railway link --service <nombre-servicio>

# Ver lista de proyectos
railway list

# Redeploy
railway up --detach

# Ver información del proyecto
railway whoami
```

---

## 🐛 Troubleshooting

### Error: "Service not found"
**Solución**: Crea el servicio primero en Railway UI.

### Error: "Railpack could not determine how to build"
**Solución**: Ve a Railway UI → Settings → Build → Cambia a "Dockerfile"

### Error: "Variables not set"
**Solución**: Ejecuta los comandos del Paso 6 nuevamente

### Frontend no carga / Error 502
**Solución**:
1. Verifica que `NEXT_PUBLIC_API_URL` apunta al backend correcto
2. Revisa los logs: `railway logs`
3. Verifica que el build usó Dockerfile (no Railpack)

### No puedo cambiar de servicio
**Solución**: Usa `railway link --service <nombre>` explícitamente

---

## 📚 Documentación Relacionada

- **Setup rápido**: `RAILWAY_QUICK_FIX.md`
- **Configuración manual detallada**: `RAILWAY_MANUAL_CONFIG.md`
- **Deployment completo**: `RAILWAY_FRONTEND_DEPLOYMENT.md`

---

## 🎯 Resumen de Comandos en Orden

```bash
# 1. Verificar estado
railway status

# 2. Cambiar al servicio frontend
railway link --service frontend-pos

# 3. Obtener URL del backend (cambiar temporalmente)
railway link --service pos-cesariel
railway domain  # Copiar esta URL

# 4. Volver al frontend
railway link --service frontend-pos

# 5. Configurar variables (reemplazar <BACKEND-URL>)
railway variables --set NEXT_PUBLIC_API_URL=<BACKEND-URL>
railway variables --set PORT=3000
railway variables --set NODE_ENV=production
railway variables --set NEXT_TELEMETRY_DISABLED=1

# 6. Verificar
railway variables

# 7. Ir a Railway UI y configurar:
#    - Root Directory: frontend/pos-cesariel
#    - Builder: Dockerfile
#    - Dockerfile Path: Dockerfile.production

# 8. Deploy
railway up --detach

# 9. Ver logs
railway logs

# 10. Obtener dominio
railway domain
```

---

**Última actualización**: Diciembre 2024
**Tiempo estimado**: 10-15 minutos
