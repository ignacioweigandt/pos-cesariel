# Desplegar Frontend POS en Railway - Guía de Solución

## Problema Resuelto

El error ocurría porque Railway estaba encontrando el `railway.json` en la raíz del proyecto, causando conflictos con la configuración del servicio frontend.

```
couldn't locate the dockerfile at path Dockerfile.production in code archive
```

## Solución Implementada

1. **Railway.json de la raíz renombrado**: El archivo `railway.json` en la raíz se renombró a `railway.json.backup` para evitar conflictos.

2. **Cada servicio tiene su propio railway.json**:
   - `backend/railway.json` (para el backend)
   - `frontend/pos-cesariel/railway.json` (para el frontend POS)
   - `ecommerce/railway.json` (para el e-commerce)

## Pasos para Desplegar Frontend POS en Railway

### 1. Confirmar Cambios en Git

```bash
# Eliminar el railway.json de la raíz (ya está renombrado)
git rm railway.json

# Confirmar cambios
git add railway.json.backup
git commit -m "fix: remove conflicting root railway.json for Railway deployment"
git push origin main
```

### 2. Configurar Servicio en Railway

1. Ve a tu proyecto en Railway
2. Haz clic en **"+ New"** → **"GitHub Repo"**
3. Selecciona tu repositorio `pos-cesariel`
4. Railway creará un nuevo servicio

### 3. Configurar Root Directory

1. Haz clic en el servicio recién creado
2. Ve a **"Settings"** → **"Service"**
3. En **"Root Directory"**, establece: `frontend/pos-cesariel`
4. Renombra el servicio a `frontend-pos` (opcional pero recomendado)

### 4. Configurar Variables de Entorno

Ve a **"Variables"** y agrega:

```env
# API Backend (reemplaza con tu dominio de backend de Railway)
NEXT_PUBLIC_API_URL=https://<tu-backend-domain>.railway.app

# Port
PORT=3000

# Node Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**Importante**: Reemplaza `<tu-backend-domain>` con el dominio real de tu backend en Railway.

### 5. Verificar Configuración del Servicio

En **"Settings"** → **"Build"**, deberías ver:
- **Builder**: DOCKERFILE
- **Dockerfile Path**: Dockerfile.production (detectado automáticamente)

### 6. Hacer Deploy

1. Railway iniciará el build automáticamente
2. Ve a **"Deployments"** para ver el progreso
3. El build puede tomar 5-10 minutos
4. Espera a que el estado sea **"Success"**

### 7. Generar Dominio Público

1. Ve a **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"**
3. Copia el dominio generado (ej: `pos-frontend.up.railway.app`)

### 8. Verificar Deployment

Accede a tu dominio y verifica:
- La aplicación carga correctamente
- Puedes hacer login con: `admin` / `admin123`
- La conexión con el backend funciona

## Estructura de Archivos Importante

```
pos-cesariel/
├── railway.json.backup              # ❌ NO usado (renombrado)
├── backend/
│   ├── Dockerfile.production        # ✅ Backend Dockerfile
│   └── railway.json                 # ✅ Backend config
├── frontend/pos-cesariel/
│   ├── Dockerfile.production        # ✅ Frontend Dockerfile
│   ├── railway.json                 # ✅ Frontend config
│   └── next.config.js              # ✅ Con output: 'standalone'
└── ecommerce/
    ├── Dockerfile.production        # ✅ E-commerce Dockerfile
    └── railway.json                 # ✅ E-commerce config
```

## Configuración de Railway por Servicio

### Backend
- **Root Directory**: `backend`
- **Dockerfile**: `Dockerfile.production`
- **Variables**: DATABASE_URL, SECRET_KEY, CLOUDINARY_*

### Frontend POS
- **Root Directory**: `frontend/pos-cesariel`
- **Dockerfile**: `Dockerfile.production`
- **Variables**: NEXT_PUBLIC_API_URL, PORT=3000

### E-commerce
- **Root Directory**: `ecommerce`
- **Dockerfile**: `Dockerfile.production`
- **Variables**: NEXT_PUBLIC_API_URL, PORT=3001

## Troubleshooting

### Error: "Dockerfile not found"
**Causa**: Railway está usando el railway.json incorrecto
**Solución**: Asegúrate de que no hay railway.json en la raíz del proyecto

### Error: "Build failed"
**Causa**: Dependencias o configuración incorrecta
**Solución**:
1. Verifica que `next.config.js` tiene `output: 'standalone'`
2. Revisa los logs de build en Railway
3. Asegúrate de que todas las dependencias están en package.json

### Frontend no se conecta al backend
**Causa**: Variable NEXT_PUBLIC_API_URL incorrecta
**Solución**:
1. Verifica que NEXT_PUBLIC_API_URL apunta a tu backend de Railway
2. El formato debe ser: `https://nombre-del-servicio.up.railway.app`
3. NO incluyas `/api` al final

### Error 502 Bad Gateway
**Causa**: El servidor Next.js no está iniciando
**Solución**:
1. Revisa los logs del servicio en Railway
2. Verifica que el puerto 3000 está expuesto
3. Asegúrate de que el healthcheck está funcionando

## Comandos Útiles

```bash
# Verificar estructura local
ls -la frontend/pos-cesariel/Dockerfile.production
ls -la frontend/pos-cesariel/railway.json

# Ver logs de Railway (usando Railway CLI)
railway logs --service frontend-pos

# Hacer redeploy
railway up --service frontend-pos
```

## Próximos Pasos

1. ✅ Backend desplegado y funcionando
2. ✅ Frontend POS: Seguir esta guía
3. 🔲 E-commerce: Mismos pasos pero con `root directory: ecommerce`
4. 🔲 Configurar dominios personalizados (opcional)
5. 🔲 Configurar CI/CD automático

## Variables de Entorno Completas

### Backend
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=<tu-secret-key-64-caracteres>
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>
ENVIRONMENT=production
```

### Frontend POS
```env
NEXT_PUBLIC_API_URL=https://<backend-domain>.railway.app
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### E-commerce (para después)
```env
NEXT_PUBLIC_API_URL=https://<backend-domain>.railway.app
API_URL=https://<backend-domain>.railway.app
PORT=3001
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Notas Importantes

- ⚠️ **NO** volver a crear railway.json en la raíz del proyecto
- ✅ Cada servicio tiene su propio railway.json en su directorio
- ✅ El Root Directory debe estar configurado correctamente en Railway
- ✅ Las variables NEXT_PUBLIC_* deben estar configuradas ANTES del build
- ✅ Si cambias NEXT_PUBLIC_API_URL, debes hacer un nuevo deploy

## Costos Estimados

Railway cobra por uso:
- **Frontend POS**: ~$5-10/mes (512MB RAM)
- Con el tier gratuito de Railway ($5 crédito mensual), el frontend podría ser prácticamente gratis para desarrollo/pruebas

---

**Última actualización**: Diciembre 2024
**Status**: ✅ Problema resuelto - Railway.json de raíz eliminado
