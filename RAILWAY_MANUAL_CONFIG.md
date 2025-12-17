# Railway - Configuración Manual del Builder

## Problema

Railway está usando **Railpack** (buildpacks) en lugar de detectar el **Dockerfile**, mostrando este error:

```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

## Solución: Configurar Builder Manualmente

Railway no siempre detecta automáticamente el `railway.json`. Debes configurar el builder manualmente en la UI.

---

## Pasos para Frontend POS

### 1. Ve a la Configuración del Servicio

1. Accede a tu proyecto en Railway
2. Haz clic en el servicio **frontend-pos**
3. Ve a la pestaña **"Settings"**

### 2. Configurar Source

En la sección **"Source"**:

- **Root Directory**: `frontend/pos-cesariel` ✅ (Ya configurado)

### 3. Configurar Builder (CRÍTICO)

En la sección **"Build"** o **"Builder"**:

1. Busca **"Build Settings"** o **"Builder"**
2. Cambia de **"Railpack"** o **"Auto"** a **"Dockerfile"**
3. En **"Dockerfile Path"**, ingresa: `Dockerfile.production`

**Captura visual del flujo**:
```
Settings → Build
  ↓
Builder: [Cambiar de "Railpack" a "Dockerfile"]
  ↓
Dockerfile Path: Dockerfile.production
```

### 4. Variables de Entorno

Ve a la pestaña **"Variables"** y asegúrate de tener:

```env
NEXT_PUBLIC_API_URL=https://<tu-backend-railway-domain>.railway.app
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**Importante**: Reemplaza `<tu-backend-railway-domain>` con el dominio real de tu backend.

### 5. Guardar y Redeploy

1. Haz clic en **"Save"** o los cambios se guardan automáticamente
2. Ve a la pestaña **"Deployments"**
3. Haz clic en **"Deploy"** o espera el auto-deploy
4. El build debería comenzar usando el Dockerfile

---

## Pasos para E-commerce (Similar)

### Configuración para E-commerce:

1. **Root Directory**: `ecommerce`
2. **Builder**: `Dockerfile`
3. **Dockerfile Path**: `Dockerfile.production`
4. **Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://<tu-backend-railway-domain>.railway.app
   API_URL=https://<tu-backend-railway-domain>.railway.app
   PORT=3001
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

---

## Verificación del Builder

### Antes (Incorrecto - Railpack):
```
using build driver railpack-v0.15.1
╭─────────────────╮
│ Railpack 0.15.1 │
╰─────────────────╯
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

### Después (Correcto - Dockerfile):
```
using dockerfile builder
Step 1/15 : FROM node:18-alpine AS deps
Step 2/15 : RUN apk add --no-cache libc6-compat
...
Successfully built
```

---

## Configuración Visual en Railway UI

### Ubicación de las Configuraciones

1. **Dashboard** → Selecciona tu servicio
2. **Settings** (⚙️)
   - **Source** → Root Directory: `frontend/pos-cesariel`
   - **Build** → Builder: `Dockerfile`
   - **Build** → Dockerfile Path: `Dockerfile.production`
3. **Variables** (pestaña separada)
   - Agrega todas las variables de entorno

---

## Troubleshooting

### El Builder no aparece en Settings

Si no ves la opción "Builder" o "Dockerfile":

1. **Opción A - Usando Railway CLI**:
   ```bash
   # Instalar Railway CLI
   npm i -g @railway/cli

   # Login
   railway login

   # Link al proyecto
   railway link

   # Configurar builder
   railway vars set RAILWAY_DOCKERFILE_PATH=Dockerfile.production
   ```

2. **Opción B - En Settings avanzados**:
   - Ve a Settings → Show Advanced
   - Busca "Custom Build Command" o "Builder"
   - Selecciona "Dockerfile"

### Railway sigue usando Railpack

1. **Verifica que guardaste los cambios** en Settings
2. **Haz un redeploy manual**:
   - Deployments → ... (menú) → Redeploy
3. **Verifica el log del build** para confirmar que usa Dockerfile

### Error: "Dockerfile not found"

Si después de configurar el builder, obtienes "Dockerfile not found":

1. **Verifica la ruta**:
   - Root Directory: `frontend/pos-cesariel` ✅
   - Dockerfile Path: `Dockerfile.production` ✅

2. **Verifica que el archivo existe**:
   ```bash
   ls -la frontend/pos-cesariel/Dockerfile.production
   # Debe mostrar el archivo
   ```

3. **Commit y push** si acabas de crear el archivo:
   ```bash
   git add frontend/pos-cesariel/Dockerfile.production
   git commit -m "add: Dockerfile.production for Railway"
   git push origin main
   ```

---

## Configuración Completa por Servicio

### 📋 Backend (Ya funcionando)

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Builder | Dockerfile |
| Dockerfile Path | `Dockerfile.production` |
| Variables | DATABASE_URL, SECRET_KEY, CLOUDINARY_* |

### 🎨 Frontend POS (Configurar)

| Setting | Value |
|---------|-------|
| Root Directory | `frontend/pos-cesariel` |
| Builder | **Dockerfile** ⚠️ |
| Dockerfile Path | `Dockerfile.production` |
| Variables | NEXT_PUBLIC_API_URL, PORT=3000 |

### 🛒 E-commerce (Configurar después)

| Setting | Value |
|---------|-------|
| Root Directory | `ecommerce` |
| Builder | **Dockerfile** ⚠️ |
| Dockerfile Path | `Dockerfile.production` |
| Variables | NEXT_PUBLIC_API_URL, PORT=3001 |

---

## Por qué railway.json no funciona automáticamente

Railway a veces no detecta `railway.json` en monorepos por:

1. **Auto-detección limitada**: Railpack se ejecuta primero antes de leer railway.json
2. **Configuración de servicio**: Railway prioriza la config de UI sobre railway.json
3. **Root Directory**: Cuando se establece un root directory, Railway puede ignorar el railway.json

**Solución**: Configurar manualmente en UI es más confiable que depender de railway.json.

---

## Comandos de Verificación

### Verificar archivos localmente:
```bash
# Verificar que existen los Dockerfiles
ls -la frontend/pos-cesariel/Dockerfile.production
ls -la frontend/pos-cesariel/railway.json
ls -la ecommerce/Dockerfile.production
ls -la ecommerce/railway.json

# Verificar contenido de railway.json
cat frontend/pos-cesariel/railway.json
```

### Verificar configuración en Railway (CLI):
```bash
# Instalar CLI
npm i -g @railway/cli

# Login y link
railway login
railway link

# Ver variables del servicio
railway vars

# Ver estado
railway status
```

---

## Próximos Pasos

1. ✅ **Configurar Builder manualmente** en Railway UI (Dockerfile)
2. ✅ **Configurar variables de entorno**
3. ✅ **Hacer deploy** y verificar que use Dockerfile
4. ✅ **Generar dominio público**
5. ✅ **Probar la aplicación**

---

## Referencias Útiles

- [Railway Dockerfile Builder](https://docs.railway.app/deploy/dockerfiles)
- [Railway Root Directory](https://docs.railway.app/deploy/monorepo)
- [Railway Build Configuration](https://docs.railway.app/deploy/builds)

---

**Última actualización**: Diciembre 2024
**Status**: ⚠️ Configuración manual requerida en UI
