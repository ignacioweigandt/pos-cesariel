# Variables de Entorno del Backend - Configuración Rápida

## ⚡ Configuración Rápida (3 minutos)

El backend necesita estas variables de entorno para funcionar correctamente.

---

## 📋 Variables Requeridas

### En Railway UI → Backend Service → Settings → Variables:

| Variable | Valor | Cómo Agregarlo |
|----------|-------|----------------|
| **DATABASE_URL** | `${{postgres.DATABASE_URL}}` | **Add Reference** → postgres → DATABASE_URL |
| **SECRET_KEY** | Ver abajo ⬇️ | **New Variable** (copiar valor generado) |
| **PORT** | `8000` | **New Variable** |
| **ENVIRONMENT** | `production` | **New Variable** |

---

## 🔐 Generar SECRET_KEY

### Opción 1: Generar Clave Segura (Recomendado)

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Ejemplo de salida:**
```
vK8xY9mZ2pR5sT7nQ4wL1hF6jD3gB0uA8cE2iM7oP9
```

Copia este valor y úsalo como SECRET_KEY.

### Opción 2: Usar Clave Temporal

Para pruebas rápidas (NO recomendado para producción):
```
my-secret-key-for-railway-deployment-2024
```

---

## 🎯 Pasos Detallados

### 1. Agregar DATABASE_URL (Referencia a Postgres)

1. **Railway UI** → Proyecto **charming-insight** → Servicio **backend**
2. **Settings → Variables**
3. Click en **"+ New Variable"**
4. Selecciona **"Add Reference"** o **"Service Variable"**
5. **Service:** postgres
6. **Variable:** DATABASE_URL
7. Click **"Add"**

**Resultado:** Verás algo como:
```
DATABASE_URL = ${{postgres.DATABASE_URL}}
```

Railway resolverá esto automáticamente a:
```
postgresql://postgres:xxxxx@postgres.railway.internal:5432/railway
```

---

### 2. Agregar SECRET_KEY

1. **Genera una clave** usando el comando de Python arriba
2. **Railway UI** → Backend → **Settings → Variables**
3. Click en **"+ New Variable"**
4. **Name:** `SECRET_KEY`
5. **Value:** Pega la clave que generaste
6. Click **"Add"**

---

### 3. Agregar PORT

1. **Railway UI** → Backend → **Settings → Variables**
2. Click en **"+ New Variable"**
3. **Name:** `PORT`
4. **Value:** `8000`
5. Click **"Add"**

---

### 4. Agregar ENVIRONMENT

1. **Railway UI** → Backend → **Settings → Variables**
2. Click en **"+ New Variable"**
3. **Name:** `ENVIRONMENT`
4. **Value:** `production`
5. Click **"Add"**

---

## ✅ Verificar Variables Configuradas

Deberías ver estas 4 variables en Settings → Variables:

```
DATABASE_URL   = ${{postgres.DATABASE_URL}}
SECRET_KEY     = vK8xY9mZ2pR5sT7nQ4wL1hF6jD3gB0uA8cE2iM7oP9
PORT           = 8000
ENVIRONMENT    = production
```

---

## 🚀 Redeploy Automático

Una vez que agregues las variables, Railway hará **redeploy automático** del backend.

**Tiempo estimado:** 2-3 minutos (no necesita rebuild completo)

---

## 🔍 Verificar que Funciona

### Ver Logs del Deploy:

En Railway UI → Backend → Deployments → Último deployment → View logs

**Busca estas líneas (✅ SUCCESS):**
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Test del Health Check:

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

### Verificar API Docs:

Abre en el navegador:
```
https://pos-cesariel-production.up.railway.app/docs
```

Deberías ver la interfaz de Swagger UI con todos los endpoints del backend.

---

## 🐛 Troubleshooting

### Error: KeyError: 'DATABASE_URL'

**Causa:** La variable DATABASE_URL no está configurada

**Solución:** Agrega la referencia a postgres como se indica arriba

---

### Error: "Database connection failed"

**Causa:** PostgreSQL no está conectado o no existe

**Verificación:**
1. Asegúrate de que el servicio "postgres" existe en Railway
2. Verifica que DATABASE_URL es una referencia: `${{postgres.DATABASE_URL}}`
3. Verifica en Settings → "Connected Services" que postgres está conectado

---

### Error: "Invalid JWT secret key"

**Causa:** SECRET_KEY no está configurado o es inválido

**Solución:** Genera una nueva SECRET_KEY con el comando de Python y agrégala

---

### Healthcheck sigue fallando

**Causa:** El backend está crasheando al iniciar

**Diagnóstico:**
1. Ve a Railway UI → Backend → Deployments
2. Click en el deployment que falló
3. Scroll down hasta "Deploy Logs" o "Runtime Logs"
4. Busca el error exacto (traceback de Python)

---

### Backend inicia pero no responde

**Causa:** PORT no está configurado correctamente

**Verificación:**
```bash
railway variables | grep PORT
# Debe mostrar: PORT = 8000
```

**Solución:** Asegúrate de que PORT=8000 en las variables

---

## 🔐 Variables Opcionales (pero Recomendadas)

Para funcionalidad completa, también puedes agregar:

| Variable | Descripción | Valor |
|----------|-------------|-------|
| **CLOUDINARY_CLOUD_NAME** | Para subir imágenes de productos | Tu cloud name de Cloudinary |
| **CLOUDINARY_API_KEY** | API key de Cloudinary | Tu API key |
| **CLOUDINARY_API_SECRET** | API secret de Cloudinary | Tu API secret |
| **WHATSAPP_API_TOKEN** | Para integración WhatsApp | Tu token de WhatsApp Business |

**Nota:** Estas son opcionales. El backend funciona sin ellas, pero algunas funcionalidades estarán deshabilitadas.

---

## 📊 Variables por Servicio

### Backend (pos-cesariel o similar):
```
DATABASE_URL = ${{postgres.DATABASE_URL}}   (Requerido)
SECRET_KEY = xxx                             (Requerido)
PORT = 8000                                  (Requerido)
ENVIRONMENT = production                     (Requerido)
```

### Frontend POS (frontend-pos):
```
NEXT_PUBLIC_API_URL = https://pos-cesariel-production.up.railway.app
PORT = 3000
NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
```

### E-commerce (e-commerce):
```
NEXT_PUBLIC_API_URL = https://pos-cesariel-production.up.railway.app
API_URL = https://pos-cesariel-production.up.railway.app
PORT = 3001
NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
```

---

## ✅ Checklist de Configuración

- [ ] DATABASE_URL agregado (referencia a postgres)
- [ ] SECRET_KEY generado y agregado
- [ ] PORT configurado (8000)
- [ ] ENVIRONMENT configurado (production)
- [ ] Variables verificadas en Settings → Variables
- [ ] Redeploy automático completado (2-3 min)
- [ ] Health check responde correctamente
- [ ] API docs accesibles en /docs
- [ ] Sin errores en logs del deployment

---

**Fecha:** Diciembre 17, 2024
**Problema:** Backend falla healthcheck por falta de variables de entorno
**Solución:** Configurar DATABASE_URL, SECRET_KEY, PORT, ENVIRONMENT
**Tiempo estimado:** 3 minutos + 2-3 minutos redeploy
