# Inicializar Base de Datos en Railway - Guía Completa

## 🎯 Objetivo

Poblar la base de datos PostgreSQL con datos iniciales para que el sistema funcione.

---

## 📊 Qué se va a Crear

### `init_data.py` - Datos Esenciales
- ✅ **Usuarios:**
  - admin / admin123 (ADMIN - acceso total)
  - manager / manager123 (MANAGER - gestión de sucursal)
  - seller / seller123 (SELLER - solo ventas)
- ✅ **Sucursales:**
  - Branch Central
  - Branch Norte
  - Branch Sur
- ✅ **Categorías:** Ropa, Calzado, Accesorios
- ✅ **Productos de ejemplo** con stock

### `init_content_data.py` - Contenido E-commerce
- ✅ Configuración de la tienda (nombre, contacto, redes sociales)
- ✅ Banners para la página principal
- ✅ Configuración de WhatsApp

### `init_sportswear_data.py` - Catálogo Deportivo
- ✅ Categorías deportivas (Running, Fútbol, Basketball, etc.)
- ✅ Productos con múltiples tallas
- ✅ Stock por sucursal

---

## ⚡ Método 1: Usando Railway CLI (Recomendado)

### Requisitos:
- ✅ Railway CLI instalado
- ✅ Backend desplegado y funcionando

### Pasos:

#### 1. Conectar al Servicio Backend

```bash
railway link
```

**Selecciona:**
- Workspace: `Ignacio Weigandt's Projects`
- Project: `charming-insight`
- Environment: `production`
- Service: `[tu servicio backend]` (el que tiene FastAPI)

#### 2. Verificar Conexión

```bash
railway status
```

Deberías ver:
```
Project: charming-insight
Environment: production
Service: [tu-backend-service]
```

#### 3. Ejecutar Script de Inicialización

```bash
railway run bash init_db.sh
```

**Esto ejecutará los 3 scripts automáticamente:**
1. `init_data.py` - Datos esenciales
2. `init_content_data.py` - Contenido e-commerce
3. `init_sportswear_data.py` - Catálogo deportivo

**Salida esperada:**
```
════════════════════════════════════════════════════════
  Inicialización de Base de Datos - POS Cesariel
════════════════════════════════════════════════════════

📊 [1/3] Inicializando datos esenciales...
✅ Datos esenciales creados exitosamente

🛍️  [2/3] Inicializando contenido de e-commerce...
✅ Contenido de e-commerce creado exitosamente

⚽ [3/3] Cargando catálogo de productos deportivos...
✅ Catálogo deportivo cargado exitosamente

════════════════════════════════════════════════════════
✅ Inicialización completada

Credenciales de prueba:
  • Admin:   admin / admin123
  • Manager: manager / manager123
  • Seller:  seller / seller123
════════════════════════════════════════════════════════
```

**Tiempo estimado:** 2-3 minutos

---

## ⚡ Método 2: Script por Script (Si el anterior falla)

Si `init_db.sh` falla, ejecuta los scripts individualmente:

```bash
# 1. Datos esenciales
railway run python backend/init_data.py

# 2. Contenido e-commerce
railway run python backend/init_content_data.py

# 3. Catálogo deportivo
railway run python backend/init_sportswear_data.py
```

---

## ⚡ Método 3: Desde Railway UI (Alternativa)

Si Railway CLI no funciona:

### 1. Acceder al Shell del Backend

**Railway UI → Backend service → Shell** (puede estar en "Deployments" o como botón)

### 2. Ejecutar Comandos

Una vez dentro del shell del contenedor:

```bash
cd /app
python init_data.py
python init_content_data.py
python init_sportswear_data.py
```

**Nota:** Este método solo funciona si Railway ofrece acceso a Shell en su UI.

---

## 🔍 Verificar que Funcionó

### 1. Test de Login desde Backend

```bash
curl -X POST https://backend-production-c20a.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Respuesta esperada (SUCCESS):**
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

**Si ves esto (ERROR - DB vacía):**
```json
{
  "detail": "User not found"
}
```

### 2. Verificar Productos

```bash
curl https://backend-production-c20a.up.railway.app/api/ecommerce/products
```

**Deberías ver un array con productos:**
```json
[
  {
    "id": 1,
    "name": "Producto ejemplo",
    "price": 29.99,
    ...
  }
]
```

### 3. Login desde Frontend POS

Abre en el navegador:
```
https://frontend-pos-production.up.railway.app
```

**Login con:**
- Usuario: `admin`
- Contraseña: `admin123`

Deberías entrar al dashboard del POS.

### 4. Ver Productos en E-commerce

Abre en el navegador:
```
https://e-commerce-production-3634.up.railway.app
```

Deberías ver productos en la página principal.

---

## 🐛 Troubleshooting

### Error: "railway: command not found"

**Causa:** Railway CLI no está instalado

**Solución:**
```bash
npm i -g @railway/cli
```

---

### Error: "Service not linked"

**Causa:** No estás conectado al servicio correcto

**Solución:**
```bash
railway link
# Selecciona el servicio backend
```

---

### Error: "No module named 'models'"

**Causa:** El script se está ejecutando desde el directorio incorrecto

**Solución en `railway run`:**
```bash
# Asegúrate de ejecutar desde la raíz del proyecto
railway run bash init_db.sh

# O especifica el path completo:
railway run python backend/init_data.py
```

---

### Error: "Database connection failed"

**Causa:** DATABASE_URL no está configurada en el backend

**Verificar:**
```bash
railway variables | grep DATABASE_URL
```

Debe mostrar:
```
DATABASE_URL = ${{postgres.DATABASE_URL}}
```

**Solución:** Agrega la variable en Railway UI → Backend → Settings → Variables

---

### Error: "IntegrityError: duplicate key value"

**Causa:** Los datos ya fueron creados anteriormente

**Solución:** Esto es normal si ya ejecutaste los scripts antes. Ignora el error.

Si quieres empezar de cero:
```bash
# CUIDADO: Esto borra TODA la base de datos
railway run python backend/reset_db.py
railway run bash init_db.sh
```

---

### Scripts no producen salida

**Causa:** Los scripts pueden no mostrar output en Railway CLI

**Solución:** Verifica que funcionaron intentando login:
```bash
curl -X POST https://backend-production-c20a.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## 📋 Datos Creados

### Usuarios de Prueba:

| Usuario | Contraseña | Rol | Permisos |
|---------|-----------|-----|----------|
| admin | admin123 | ADMIN | Acceso completo al sistema |
| manager | manager123 | MANAGER | Gestión de sucursal, inventario, reportes |
| seller | seller123 | SELLER | Solo POS y ventas |

### Sucursales:

1. **Branch Central** - Sucursal principal
2. **Branch Norte** - Sucursal secundaria
3. **Branch Sur** - Sucursal secundaria

### Productos:

- **init_data.py:** ~10 productos básicos de ejemplo
- **init_sportswear_data.py:** ~50+ productos deportivos con tallas

Todos los productos vienen con:
- ✅ Stock en cada sucursal
- ✅ Múltiples tallas (S, M, L, XL)
- ✅ Precios y categorías
- ✅ Configurados para mostrarse en e-commerce

---

## ✅ Checklist Final

- [ ] Railway CLI instalado
- [ ] Conectado al servicio backend (`railway link`)
- [ ] Ejecutado `railway run bash init_db.sh`
- [ ] Login con admin/admin123 funciona
- [ ] Productos visibles en API: `/api/ecommerce/products`
- [ ] Login funciona en Frontend POS
- [ ] Productos se ven en Frontend POS
- [ ] Productos se ven en E-commerce
- [ ] Crear venta funciona correctamente

---

## 🎉 Sistema Completo

Una vez inicializada la base de datos, tendrás:

```
┌─────────────────────────────────────────────────────┐
│              Railway Production                      │
│                                                      │
│  ┌──────────────┐       ┌──────────────┐           │
│  │  PostgreSQL  │◄──────┤   Backend    │           │
│  │  ✅ Poblada  │       │  ✅ Online    │           │
│  │              │       │              │           │
│  │  3 usuarios  │       │  API activa  │           │
│  │  50+ prods   │       │              │           │
│  └──────────────┘       └──────┬───────┘           │
│                                │ API                 │
│                   ┌────────────┼────────────┐       │
│                   │            │            │       │
│       ┌───────────▼─────────┐ │ ┌──────────▼────┐  │
│       │ Frontend POS        │ │ │ E-commerce    │  │
│       │  ✅ Conectado       │ │ │ ✅ Conectado  │  │
│       │  Login OK           │ │ │ Productos OK  │  │
│       └─────────────────────┘ │ └───────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘

URLs:
Backend:  https://backend-production-c20a.up.railway.app
Frontend: https://frontend-pos-production.up.railway.app
Ecommerce: https://e-commerce-production-3634.up.railway.app
```

---

**Fecha:** Diciembre 17, 2024
**Status:** Backend ✅ - Frontends ✅ - DB pendiente de inicializar
**Tiempo estimado:** 3-5 minutos
