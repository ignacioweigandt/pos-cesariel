# Configuración de PostgreSQL en Railway

## 🎯 Objetivo
Conectar el backend (pos-cesariel) con la base de datos PostgreSQL que creaste en Railway.

---

## 📋 Configuración Automática (Recomendado)

Railway puede conectar automáticamente servicios usando **Service Variables**. Esto genera automáticamente todas las credenciales necesarias.

### Opción 1: Conectar Servicios desde UI (Más Fácil - 2 minutos)

1. **Ve a Railway Dashboard:**
   - https://railway.app/project/2984b683-f2d8-4cf6-a13b-ca806d5bb3e6

2. **Selecciona el servicio backend "pos-cesariel"**

3. **Ve a Settings → Variables**

4. **Agregar Variable de Referencia:**
   - Click en **"+ New Variable"**
   - Selecciona **"Add Reference"** o **"Service Variable"**
   - En el dropdown, selecciona: **postgres → DATABASE_URL**
   - Esto creará una variable `DATABASE_URL` que apunta automáticamente a tu PostgreSQL

5. **Railway hará redeploy automático** del backend

---

### Opción 2: Usando Railway CLI (Alternativa)

Si prefieres usar CLI, necesitas ejecutar estos comandos manualmente:

```bash
# 1. Cambiar al servicio backend
railway link
# Selecciona: charming-insight → production → pos-cesariel

# 2. Obtener el DATABASE_URL del servicio postgres
# Railway automáticamente expone estas variables cuando conectas servicios
# Puedes verificar con:
railway variables

# 3. Si no está conectado automáticamente, agrega manualmente:
railway variables --set DATABASE_URL=${{postgres.DATABASE_URL}}
```

**Nota:** `${{postgres.DATABASE_URL}}` es una referencia que Railway resuelve automáticamente.

---

## 🔍 Verificar la Configuración

### Paso 1: Verificar Variables del Backend

```bash
railway link --service pos-cesariel
railway variables | grep DATABASE_URL
```

**Deberías ver algo como:**
```
DATABASE_URL    | postgresql://postgres:xxxxx@postgres.railway.internal:5432/railway
```

### Paso 2: Verificar Conexión del Backend

Una vez que el backend se redespliegue, verifica los logs:

```bash
railway logs --service pos-cesariel
```

**Busca estas líneas (CORRECTO):**
```
INFO:     Application startup complete.
✓ Database connection established
```

**Si ves esto (ERROR):**
```
ERROR:    Cannot connect to database
sqlalchemy.exc.OperationalError: could not connect to server
```

---

## 🗄️ Inicializar la Base de Datos

Una vez que el backend esté conectado a PostgreSQL, necesitas crear las tablas e insertar datos iniciales.

### Opción 1: Desde Railway Dashboard (UI)

1. **Ve al servicio "pos-cesariel" en Railway**

2. **Click en "Shell" o "Console"** (si está disponible)

3. **Ejecuta los scripts de inicialización:**
   ```bash
   python init_data.py
   python init_content_data.py
   python init_sportswear_data.py
   ```

### Opción 2: Usando Railway CLI

```bash
# 1. Conectarse al servicio backend
railway link --service pos-cesariel

# 2. Ejecutar comandos en el contenedor
railway run python init_data.py
railway run python init_content_data.py
railway run python init_sportswear_data.py
```

### Opción 3: Usar Railway Run (Recomendado)

Si Railway Run no funciona directamente, puedes usar este enfoque:

1. **Crea un script temporal `init_db.sh` en la raíz del proyecto:**
   ```bash
   #!/bin/bash
   cd backend
   python init_data.py
   python init_content_data.py
   python init_sportswear_data.py
   echo "✓ Database initialized successfully"
   ```

2. **Hazlo ejecutable y súbelo:**
   ```bash
   chmod +x init_db.sh
   git add init_db.sh
   git commit -m "feat: add database initialization script"
   git push origin main
   ```

3. **Ejecuta desde Railway:**
   ```bash
   railway run bash init_db.sh
   ```

---

## 📊 Estructura de los Scripts de Inicialización

### `init_data.py`
**Propósito:** Datos esenciales del sistema
- ✅ Crea tablas en PostgreSQL (usando SQLAlchemy)
- ✅ Usuarios de prueba (admin, manager, seller)
- ✅ Sucursales (Branch Central, Branch Norte, Branch Sur)
- ✅ Categorías básicas
- ✅ Productos de ejemplo con stock

**Usuarios creados:**
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | ADMIN |
| manager | manager123 | MANAGER |
| seller | seller123 | SELLER |

### `init_content_data.py`
**Propósito:** Contenido del e-commerce
- ✅ Configuración de e-commerce (nombre tienda, contacto)
- ✅ Banners para homepage
- ✅ Configuración de redes sociales

### `init_sportswear_data.py`
**Propósito:** Catálogo completo de productos deportivos
- ✅ Categorías deportivas (Running, Fútbol, Basketball, etc.)
- ✅ Productos con múltiples tallas
- ✅ Imágenes de ejemplo
- ✅ Precios y stock

---

## 🔐 Variables de Entorno Necesarias

Además de `DATABASE_URL`, el backend necesita estas variables:

### En Railway UI → pos-cesariel → Settings → Variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| **DATABASE_URL** | `${{postgres.DATABASE_URL}}` | Conexión a PostgreSQL (referencia automática) |
| **SECRET_KEY** | `tu-secret-key-segura-aqui` | Para JWT tokens (genera uno aleatorio) |
| **CLOUDINARY_CLOUD_NAME** | `tu-cloud-name` | (Opcional) Para imágenes de productos |
| **CLOUDINARY_API_KEY** | `tu-api-key` | (Opcional) |
| **CLOUDINARY_API_SECRET** | `tu-api-secret` | (Opcional) |
| **PORT** | `8000` | Puerto del backend |
| **ENVIRONMENT** | `production` | Entorno de ejecución |

### Generar SECRET_KEY

Puedes generar un SECRET_KEY seguro con:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

O usar uno temporal para desarrollo:
```
my-secret-key-for-railway-deployment-2024
```

---

## 🧪 Probar la Conexión

### 1. Backend Health Check

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

### 2. Verificar Usuarios

```bash
curl https://pos-cesariel-production.up.railway.app/api/users
```

**Si no está autenticado:**
```json
{
  "detail": "Not authenticated"
}
```

**Esto es CORRECTO** - significa que el backend funciona y la autenticación está activa.

### 3. Login de Prueba

```bash
curl -X POST https://pos-cesariel-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  }
}
```

---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"

**Causa:** DATABASE_URL no configurado o incorrecto

**Solución:**
1. Verifica que la variable existe:
   ```bash
   railway variables --service pos-cesariel | grep DATABASE_URL
   ```
2. Si no existe, agrégala desde Railway UI:
   - Settings → Variables → Add Reference → postgres → DATABASE_URL

### Error: "Database does not exist"

**Causa:** PostgreSQL está vacío, no se han ejecutado los scripts de inicialización

**Solución:**
```bash
railway run --service pos-cesariel python init_data.py
```

### Error: "Table already exists"

**Causa:** Los scripts ya se ejecutaron antes

**Solución:** Esto es normal si ya inicializaste la base de datos. Ignora el error.

### PostgreSQL Service No Aparece en Variables

**Causa:** Los servicios no están "conectados" en Railway

**Solución:**
1. Ve a Railway UI → pos-cesariel → Settings
2. Busca "Service Connections" o "Connected Services"
3. Agrega "postgres" como servicio conectado
4. Railway generará automáticamente las variables

---

## 📋 Checklist de Configuración

- [ ] PostgreSQL service creado en Railway
- [ ] DATABASE_URL agregado al backend (referencia: `${{postgres.DATABASE_URL}}`)
- [ ] SECRET_KEY configurado en backend
- [ ] Backend redesployado con nuevas variables
- [ ] Logs del backend muestran "Database connection established"
- [ ] Script `init_data.py` ejecutado exitosamente
- [ ] Script `init_content_data.py` ejecutado (opcional)
- [ ] Script `init_sportswear_data.py` ejecutado (opcional)
- [ ] Backend health check responde correctamente
- [ ] Login de prueba funciona (admin/admin123)
- [ ] Frontend POS se conecta al backend
- [ ] E-commerce se conecta al backend

---

## 🚀 Próximos Pasos

Una vez que PostgreSQL esté configurado:

1. **Verificar que los 3 servicios funcionen:**
   - Backend: https://pos-cesariel-production.up.railway.app/health
   - Frontend POS: https://frontend-pos-production.up.railway.app
   - E-commerce: https://e-commerce-production-3634.up.railway.app

2. **Probar el flujo completo:**
   - Login en POS Admin
   - Ver productos
   - Crear una venta
   - Ver productos en E-commerce

3. **Configuración adicional (opcional):**
   - Cloudinary para imágenes
   - WhatsApp integration
   - Dominio personalizado

---

## 📚 Documentación Relacionada

- **BUILD_FIX_SUMMARY.md** - Corrección de archivos lib
- **DEPLOY_SUCCESS.md** - Deploy del frontend POS
- **ECOMMERCE_DEPLOY_SUMMARY.md** - Deploy del e-commerce
- **RAILWAY_QUICK_FIX.md** - Guía rápida Railway
- **CLAUDE.md** - Documentación completa del proyecto

---

**Fecha:** Diciembre 17, 2024
**Status:** 📝 Guía lista - ⏳ Pendiente configuración
**Siguiente acción:** Conectar pos-cesariel con postgres en Railway UI
