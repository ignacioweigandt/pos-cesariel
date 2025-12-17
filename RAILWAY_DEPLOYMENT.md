# Deployment a Railway - POS Cesariel

Guía completa para desplegar el sistema POS Cesariel en Railway.

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Crear Proyecto en Railway](#crear-proyecto-en-railway)
4. [Desplegar Base de Datos](#desplegar-base-de-datos)
5. [Desplegar Backend](#desplegar-backend)
6. [Desplegar Frontend POS](#desplegar-frontend-pos)
7. [Desplegar E-commerce](#desplegar-e-commerce)
8. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
9. [Verificación](#verificación)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Pre-requisitos

### 1. Cuenta de Railway

- Crea una cuenta en [railway.app](https://railway.app)
- Conecta tu cuenta de GitHub
- Verifica tu cuenta con tarjeta (Railway ofrece $5 de crédito gratis)

### 2. Repositorio Git

Tu código debe estar en GitHub. Si no lo está:

```bash
# Inicializar git (si aún no lo has hecho)
git init
git add .
git commit -m "Initial commit - POS Cesariel"

# Crear repositorio en GitHub y hacer push
git remote add origin <tu-repositorio-github>
git branch -M main
git push -u origin main
```

### 3. Archivos Necesarios

Verifica que tienes estos archivos (ya creados):
- ✅ `backend/Dockerfile.production`
- ✅ `frontend/pos-cesariel/Dockerfile.production`
- ✅ `ecommerce/Dockerfile.production`
- ✅ `backend/railway.json`
- ✅ `frontend/pos-cesariel/railway.json`
- ✅ `ecommerce/railway.json`

---

## 🚀 Configuración Inicial

### Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza a Railway para acceder a tus repositorios
5. Selecciona el repositorio `pos-cesariel`
6. Railway detectará automáticamente que es un monorepo

---

## 🗄️ Desplegar Base de Datos

### Paso 1: Agregar PostgreSQL

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. Toma nota de las variables de entorno (se generan automáticamente):
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `DATABASE_URL` (ya formateada)

### Paso 2: Configurar Nombre del Servicio

1. Haz clic en el servicio PostgreSQL
2. Ve a **"Settings"** → **"Service Name"**
3. Cámbialo a `postgres` (para referencia más fácil)

---

## 🔧 Desplegar Backend

### Paso 1: Crear Servicio Backend

1. En tu proyecto, haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona tu repositorio `pos-cesariel`
4. Railway detectará múltiples servicios

### Paso 2: Configurar Root Directory

1. Haz clic en el servicio que acabas de crear
2. Ve a **"Settings"** → **"Service"**
3. En **"Root Directory"**, establece: `backend`
4. En **"Dockerfile Path"**, establece: `Dockerfile.production`

### Paso 3: Configurar Variables de Entorno

1. Ve a **"Variables"** en el servicio backend
2. Haz clic en **"+ New Variable"**
3. Agrega las siguientes variables:

```env
# Database (Railway Reference - usa variables del servicio postgres)
DATABASE_URL=${{postgres.DATABASE_URL}}

# Security
SECRET_KEY=<genera-una-clave-segura-64-caracteres>

# Cloudinary
CLOUDINARY_CLOUD_NAME=dgnflxfgh
CLOUDINARY_API_KEY=699583869153912
CLOUDINARY_API_SECRET=t9aXNi4rXvr8JGQmL9m0YMM8piU

# Environment
ENVIRONMENT=production
```

**Generar SECRET_KEY:**
```bash
# En tu terminal local
python -c "import secrets; print(secrets.token_hex(32))"
```

### Paso 4: Configurar Dominio Público

1. Ve a **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"**
3. Copia el dominio generado (ej: `pos-backend-production.up.railway.app`)
4. Este será tu `BACKEND_URL`

### Paso 5: Deploy

1. Railway comenzará a hacer deploy automáticamente
2. Ve a **"Deployments"** para ver el progreso
3. Espera a que el estado sea **"Success"**
4. Verifica que funciona: `https://<tu-backend-domain>/health`

---

## 🎨 Desplegar Frontend POS

### Paso 1: Crear Servicio Frontend

1. En tu proyecto, haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona tu repositorio (mismo que antes)

### Paso 2: Configurar Root Directory

1. Haz clic en el nuevo servicio
2. Renombra el servicio a `frontend-pos`
3. Ve a **"Settings"** → **"Service"**
4. En **"Root Directory"**, establece: `frontend/pos-cesariel`
5. En **"Dockerfile Path"**, establece: `Dockerfile.production`

### Paso 3: Configurar Variables de Entorno

```env
# API Backend (usa el dominio del backend)
NEXT_PUBLIC_API_URL=https://<tu-backend-domain>

# Port
PORT=3000

# Node Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Paso 4: Configurar Dominio Público

1. Ve a **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"**
3. Copia el dominio (ej: `pos-admin.up.railway.app`)

### Paso 5: Deploy

1. Railway comenzará el deploy
2. Espera a que termine (5-10 minutos)
3. Verifica accediendo a tu dominio

---

## 🛍️ Desplegar E-commerce

### Paso 1: Crear Servicio E-commerce

1. En tu proyecto, haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona tu repositorio

### Paso 2: Configurar Root Directory

1. Renombra el servicio a `ecommerce`
2. Ve a **"Settings"** → **"Service"**
3. En **"Root Directory"**, establece: `ecommerce`
4. En **"Dockerfile Path"**, establece: `Dockerfile.production`

### Paso 3: Configurar Variables de Entorno

```env
# API Backend
NEXT_PUBLIC_API_URL=https://<tu-backend-domain>
API_URL=https://<tu-backend-domain>

# Port
PORT=3001

# Node Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Paso 4: Configurar Dominio Público

1. Ve a **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"**
3. Copia el dominio (ej: `pos-ecommerce.up.railway.app`)

### Paso 5: Deploy

1. Espera a que complete el deploy
2. Verifica accediendo a tu dominio

---

## ⚙️ Configurar Variables de Entorno

### Resumen de Variables por Servicio

#### Backend
```env
DATABASE_URL=${{postgres.DATABASE_URL}}
SECRET_KEY=<64-caracteres-aleatorios>
CLOUDINARY_CLOUD_NAME=dgnflxfgh
CLOUDINARY_API_KEY=699583869153912
CLOUDINARY_API_SECRET=t9aXNi4rXvr8JGQmL9m0YMM8piU
ENVIRONMENT=production
```

#### Frontend POS
```env
NEXT_PUBLIC_API_URL=https://<backend-domain>
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

#### E-commerce
```env
NEXT_PUBLIC_API_URL=https://<backend-domain>
API_URL=https://<backend-domain>
PORT=3001
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Referencias entre Servicios

Railway permite referenciar variables de otros servicios usando:
```env
${{service-name.VARIABLE_NAME}}
```

Ejemplo:
```env
DATABASE_URL=${{postgres.DATABASE_URL}}
```

---

## 📊 Arquitectura Final en Railway

```
┌─────────────────────────────────────────────────┐
│             Railway Project                      │
│                                                  │
│  ┌──────────────┐      ┌──────────────┐        │
│  │  PostgreSQL  │◄─────┤   Backend    │        │
│  │   Database   │      │   (FastAPI)  │        │
│  └──────────────┘      └──────┬───────┘        │
│                               │                  │
│                               │ API              │
│                               │                  │
│                    ┌──────────▼───────────┐     │
│                    │                      │     │
│         ┌──────────┤   Frontend POS       │     │
│         │          │   (Next.js)          │     │
│         │          └──────────────────────┘     │
│         │                                        │
│         │          ┌──────────────────────┐     │
│         └──────────►   E-commerce         │     │
│                    │   (Next.js)          │     │
│                    └──────────────────────┘     │
└─────────────────────────────────────────────────┘
```

---

## ✅ Verificación Post-Deployment

### 1. Verificar Backend

```bash
curl https://<backend-domain>/health
# Debe retornar: {"status": "healthy"}
```

### 2. Verificar Frontend POS

- Accede a: `https://<frontend-domain>`
- Prueba el login con: `admin` / `admin123`

### 3. Verificar E-commerce

- Accede a: `https://<ecommerce-domain>`
- Verifica que se carguen los productos

### 4. Verificar Base de Datos

1. Ve al servicio PostgreSQL en Railway
2. Haz clic en **"Data"**
3. Verifica que existan las tablas

---

## 🔄 Inicializar Base de Datos

Después del primer deploy, necesitas inicializar la base de datos:

### Opción 1: Usando Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Conectar al servicio backend
railway run --service backend bash

# Una vez dentro del contenedor
python init_data.py
python init_content_data.py
python init_sportswear_data.py
```

### Opción 2: Desde el Panel de Railway

1. Ve al servicio **Backend**
2. Haz clic en **"Settings"** → **"Deploy"**
3. En **"Custom Start Command"**, agrega temporalmente:
   ```bash
   python init_data.py && uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```
4. Haz un nuevo deploy
5. Después de la inicialización, **quita** el comando de inicialización

---

## 🔧 Configuración Avanzada

### Dominios Personalizados

1. Ve a cualquier servicio
2. **"Settings"** → **"Networking"** → **"Custom Domain"**
3. Agrega tu dominio (ej: `pos.tudominio.com`)
4. Configura los registros DNS según Railway indique

### Escalado

1. Ve a **"Settings"** → **"Service"**
2. Ajusta **"Replicas"** según necesidad
3. Railway escala automáticamente (pago por uso)

### Logs y Monitoreo

- **Ver Logs**: Haz clic en cualquier servicio → **"View Logs"**
- **Métricas**: **"Observability"** → Ver CPU, Memoria, Network
- **Alerts**: Configura en **"Settings"** → **"Webhooks"**

---

## 💰 Costos Estimados en Railway

Railway cobra por uso. Estimación mensual:

| Servicio | Recursos | Costo Aproximado |
|----------|----------|------------------|
| PostgreSQL | 1GB RAM | $5-10/mes |
| Backend | 512MB RAM | $5-10/mes |
| Frontend POS | 512MB RAM | $5-10/mes |
| E-commerce | 512MB RAM | $5-10/mes |
| **Total** | | **$20-40/mes** |

**Plan gratuito**: Railway ofrece $5 de crédito gratis mensual.

**Optimizaciones para reducir costos**:
- Usa el tier gratuito para desarrollo
- Configura auto-sleep para ambientes no productivos
- Optimiza el número de workers

---

## 🐛 Troubleshooting

### Error: "Build Failed"

**Causa**: Problemas con el Dockerfile o dependencias

**Solución**:
1. Revisa los logs de build en Railway
2. Verifica que el **Root Directory** esté correcto
3. Asegúrate que `Dockerfile.production` existe

### Error: "Application Crashed"

**Causa**: Variables de entorno incorrectas o faltantes

**Solución**:
1. Revisa los logs del servicio
2. Verifica todas las variables de entorno
3. Asegúrate que `DATABASE_URL` apunte al servicio correcto

### Error: "Cannot Connect to Database"

**Causa**: Base de datos no inicializada o variables incorrectas

**Solución**:
1. Verifica que el servicio PostgreSQL esté corriendo
2. Revisa que `DATABASE_URL` use la referencia correcta: `${{postgres.DATABASE_URL}}`
3. Reinicia el servicio backend

### Error: "404 Not Found" en Frontend

**Causa**: Build de Next.js incompleto

**Solución**:
1. Verifica que el build completó exitosamente
2. Revisa que `NEXT_PUBLIC_API_URL` esté configurado
3. Haz un redeploy manual

### Frontend no puede conectarse al Backend

**Causa**: CORS o URL incorrecta

**Solución**:
1. Verifica `NEXT_PUBLIC_API_URL` en el frontend
2. Asegúrate que el backend esté funcionando: `/health`
3. Revisa la configuración CORS en `backend/main.py`

---

## 🔄 Actualizar la Aplicación

Railway hace deploy automático con cada push a GitHub:

```bash
# Hacer cambios en tu código
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# Railway detectará el cambio y hará deploy automático
```

Para hacer deploy manual:
1. Ve al servicio en Railway
2. **"Deployments"** → **"Deploy"** → **"Redeploy"**

---

## 📚 Recursos Adicionales

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Templates](https://railway.app/templates)
- [Railway Discord](https://discord.gg/railway)

---

## 🆘 Soporte

Si encuentras problemas:

1. **Logs**: Revisa los logs en Railway (cada servicio tiene su pestaña de logs)
2. **Status**: Verifica el estado en https://status.railway.app
3. **Community**: Railway Discord para ayuda de la comunidad
4. **Documentación**: Esta guía y la documentación oficial

---

**Última actualización**: Diciembre 2024

**Notas importantes**:
- Railway cobra por uso (CPU, RAM, Network)
- Los dominios `.railway.app` son gratis
- Dominios personalizados son gratis pero requieren configuración DNS
- El plan gratuito incluye $5/mes de crédito
