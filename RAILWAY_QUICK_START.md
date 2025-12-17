# Railway Quick Start - POS Cesariel

Guía rápida para deployment en Railway en 10 pasos.

## ✅ Pre-requisitos

- ✅ Cuenta en [railway.app](https://railway.app)
- ✅ Código en GitHub
- ✅ Build completado localmente

## 🚀 Deployment en 10 Pasos

### 1. Ejecutar Script de Setup

```bash
./railway-setup.sh
```

Este script genera:
- `railway-env-vars.txt` con todas las variables
- Nueva `SECRET_KEY` segura

### 2. Subir Código a GitHub

```bash
git add .
git commit -m "Add Railway configuration"
git push origin main
```

### 3. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Click **"New Project"**
3. Conecta con GitHub

### 4. Agregar PostgreSQL

1. Click **"+ New"**
2. **"Database"** → **"Add PostgreSQL"**
3. Renombra el servicio a `postgres`

### 5. Desplegar Backend

1. **"+ New"** → **"GitHub Repo"**
2. Selecciona `pos-cesariel`
3. **Settings** → **Root Directory**: `backend`
4. **Settings** → **Dockerfile Path**: `Dockerfile.production`
5. **Variables** → Copia las variables del Backend desde `railway-env-vars.txt`
6. **Settings** → **Networking** → **Generate Domain**
7. Copia el dominio (ej: `backend-abc123.up.railway.app`)

### 6. Actualizar Variables con Backend Domain

1. Abre `railway-env-vars.txt`
2. Reemplaza `<BACKEND_DOMAIN>` con el dominio del paso 5
3. Ejemplo: `https://backend-abc123.up.railway.app`

### 7. Desplegar Frontend POS

1. **"+ New"** → **"GitHub Repo"**
2. Selecciona `pos-cesariel` nuevamente
3. Renombra a `frontend-pos`
4. **Settings** → **Root Directory**: `frontend/pos-cesariel`
5. **Settings** → **Dockerfile Path**: `Dockerfile.production`
6. **Variables** → Copia las variables del Frontend POS (con el dominio actualizado)
7. **Settings** → **Networking** → **Generate Domain**

### 8. Desplegar E-commerce

1. **"+ New"** → **"GitHub Repo"**
2. Selecciona `pos-cesariel` nuevamente
3. Renombra a `ecommerce`
4. **Settings** → **Root Directory**: `ecommerce`
5. **Settings** → **Dockerfile Path**: `Dockerfile.production`
6. **Variables** → Copia las variables del E-commerce (con el dominio actualizado)
7. **Settings** → **Networking** → **Generate Domain**

### 9. Verificar Deployments

Espera que todos los servicios estén **"Success"** (verde):

- ✅ postgres
- ✅ backend
- ✅ frontend-pos
- ✅ ecommerce

### 10. Inicializar Base de Datos

**Opción A: Usando Railway CLI**
```bash
npm i -g @railway/cli
railway login
railway link
railway run --service backend bash
python init_data.py
python init_content_data.py
exit
```

**Opción B: Temporal Start Command**
1. Backend → **Settings** → **Deploy**
2. **Custom Start Command**:
   ```bash
   python init_data.py && uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```
3. **Deploy**
4. Después de inicializar, **quita** el comando

## 🌐 URLs de Acceso

Después del deployment, tendrás 3 URLs:

- **Backend API**: `https://backend-xxx.up.railway.app`
- **POS Admin**: `https://frontend-pos-xxx.up.railway.app`
- **E-commerce**: `https://ecommerce-xxx.up.railway.app`

## ✅ Verificación

```bash
# Verificar backend
curl https://<backend-domain>/health

# Verificar frontend (en el navegador)
https://<frontend-domain>

# Login con:
# Usuario: admin
# Password: admin123
```

## 📊 Variables de Entorno - Resumen

### Backend
```env
DATABASE_URL=${{postgres.DATABASE_URL}}
SECRET_KEY=<generada-automáticamente>
CLOUDINARY_CLOUD_NAME=dgnflxfgh
CLOUDINARY_API_KEY=699583869153912
CLOUDINARY_API_SECRET=t9aXNi4rXvr8JGQmL9m0YMM8piU
ENVIRONMENT=production
```

### Frontend POS
```env
NEXT_PUBLIC_API_URL=https://<backend-domain>
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### E-commerce
```env
NEXT_PUBLIC_API_URL=https://<backend-domain>
API_URL=https://<backend-domain>
PORT=3001
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔄 Actualizaciones

Railway hace deploy automático con cada push:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Railway detecta y despliega automáticamente
```

## 💰 Costos

- Plan gratuito: $5/mes de crédito
- Estimado para POS Cesariel: $20-40/mes
- Primer mes gratis con crédito inicial

## 🐛 Troubleshooting Rápido

**Build Failed**
- Revisa logs en Railway
- Verifica Root Directory
- Confirma que Dockerfile existe

**App Crashed**
- Revisa variables de entorno
- Verifica DATABASE_URL
- Check logs del servicio

**Cannot Connect to Database**
- Asegura que postgres esté corriendo
- Verifica `${{postgres.DATABASE_URL}}`
- Reinicia backend

## 📚 Más Información

- Guía completa: `RAILWAY_DEPLOYMENT.md`
- Variables: `railway-env-vars.txt`
- Railway Docs: https://docs.railway.app

---

**Total tiempo de deployment: 30-45 minutos**

**¿Problemas?** Consulta `RAILWAY_DEPLOYMENT.md` para troubleshooting detallado.
