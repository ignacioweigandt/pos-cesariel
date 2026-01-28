# Railway Deployment Guide - POS Cesariel

## 🚂 Arquitectura Actual en Railway

Tu proyecto tiene **4 servicios separados** en Railway:

```
Railway Project: pos-cesariel
├── Backend (FastAPI)          - Puerto 8000
├── Frontend POS (Next.js)     - Puerto 3000
├── E-commerce (Next.js)       - Puerto 3001
└── PostgreSQL Database        - Puerto 5432
```

---

## 🔄 Deploy de los Cambios Recientes

Los cambios que acabamos de pushear requieren actualización de **3 servicios**:

### ✅ Servicios a Actualizar
1. **Backend** - Alembic, Rate Limiting, Variables de entorno
2. **Frontend POS** - Variables de entorno
3. **E-commerce** - Variables de entorno

### ⏭️ No Requiere Cambios
- **Database** - Solo aplicar migraciones después del deploy

---

## 📋 PASO 1: Configurar Variables de Entorno

### 1.1 Backend Service

**Ir a Railway → Backend Service → Variables**

**Variables CRÍTICAS a agregar/actualizar:**

```bash
# Environment
ENV=production
DEBUG=false

# Database (Railway te da estas automáticamente si linkeas la BD)
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Railway magic variable
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# JWT - GENERAR NUEVO PARA PRODUCCIÓN
JWT_SECRET_KEY=<generar_con_generate_secrets.py>
JWT_EXPIRE_MINUTES=480

# Cloudinary - REGENERAR KEYS (las actuales están comprometidas)
CLOUDINARY_CLOUD_NAME=<tu_cloud_name_nuevo>
CLOUDINARY_API_KEY=<tu_api_key_nuevo>
CLOUDINARY_API_SECRET=<tu_api_secret_nuevo>

# Rate Limiting (Opcional - para usar Redis)
# REDIS_URL=${{Redis.REDIS_URL}}  # Si agregas servicio Redis

# Secrets
SECRET_KEY=<generar_con_generate_secrets.py>
```

**Cómo generar secrets seguros:**

```bash
# En tu máquina local
python3 generate_secrets.py --all

# Copiar los valores generados a Railway
```

### 1.2 Frontend POS Service

**Ir a Railway → Frontend Service → Variables**

```bash
# API URL (usar la URL interna de Railway para server-side)
API_URL=https://pos-cesariel-backend.railway.internal:8000
# O si usás la URL pública:
API_URL=https://tu-backend-url.up.railway.app

# Public API URL (para browser)
NEXT_PUBLIC_API_URL=https://tu-backend-url.up.railway.app

# Development
NODE_ENV=production
```

### 1.3 E-commerce Service

**Ir a Railway → E-commerce Service → Variables**

```bash
# API URLs
API_URL=https://pos-cesariel-backend.railway.internal:8000
NEXT_PUBLIC_API_URL=https://tu-backend-url.up.railway.app

# Port
PORT=3001

# Development
NODE_ENV=production
```

---

## 🚀 PASO 2: Deploy Automático

Railway detecta automáticamente los cambios cuando pusheas a main:

```bash
# Ya lo hicimos:
git push origin main

# Railway automáticamente:
# 1. Detecta el push
# 2. Hace build de cada servicio
# 3. Deploya si el build es exitoso
```

**Verificar en Railway Dashboard:**
- Ir a cada servicio
- Ver "Deployments" tab
- Debería aparecer un nuevo deployment en progreso

---

## 🔧 PASO 3: Aplicar Migraciones de Alembic

**IMPORTANTE**: Hacer esto DESPUÉS de que el backend se haya deployado exitosamente.

### Opción A: Desde Railway CLI (Recomendado)

```bash
# 1. Instalar Railway CLI si no lo tenés
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link al proyecto
railway link

# 4. Seleccionar servicio backend
railway service

# 5. Aplicar migraciones
railway run alembic upgrade head

# 6. Verificar migración actual
railway run alembic current
```

### Opción B: Desde Railway Dashboard

1. Ir a **Backend Service**
2. Click en **"Deploy"** tab
3. Seleccionar el deployment activo
4. Click en **"View Logs"**
5. En la parte superior, click en **"Shell"** (si está disponible)
6. Ejecutar:
   ```bash
   alembic upgrade head
   alembic current
   ```

### Opción C: Script de Inicio (Automático)

Modificar `backend/Dockerfile.production` para ejecutar migraciones automáticamente:

```dockerfile
# Al final del Dockerfile, antes de CMD
RUN echo '#!/bin/sh\nalembic upgrade head\nexec "$@"' > /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]
```

**⚠️ PRECAUCIÓN**: Esto ejecuta migraciones en cada deploy. Solo usar si estás seguro.

---

## ✅ PASO 4: Verificación Post-Deploy

### 4.1 Verificar Backend

```bash
# Health check
curl https://tu-backend.up.railway.app/health

# Respuesta esperada:
{
  "status": "healthy",
  "service": "Backend POS Cesariel",
  "version": "1.0.0",
  "environment": "production",
  "database_configured": true
}
```

### 4.2 Verificar Rate Limiting

```bash
# Test rate limit en login (debe fallar en el intento 6)
for i in {1..6}; do
  echo "Intento $i:"
  curl -X POST https://tu-backend.up.railway.app/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=test&password=wrong" \
    -w "\nHTTP Status: %{http_code}\n\n"
  sleep 1
done

# Intentos 1-5: 401 Unauthorized (password incorrecto)
# Intento 6: 429 Too Many Requests (rate limited) ✅
```

### 4.3 Verificar Migraciones

```bash
# Ver migración actual
railway run alembic current

# Debería mostrar:
# Rev: e23e20872fc1 (head)
# initial_schema
```

### 4.4 Verificar Variables de Entorno

```bash
# Desde Railway CLI
railway run env

# O desde Dashboard → Service → Variables tab
```

---

## 🔐 PASO 5: Seguridad Post-Deploy

### 5.1 Regenerar Cloudinary Credentials

**Las keys actuales en el código están COMPROMETIDAS (estaban en git):**

1. Ir a https://cloudinary.com/console
2. Settings → Security → **Reset API Secret**
3. Copiar nuevas credenciales
4. Actualizar en Railway:
   ```
   CLOUDINARY_CLOUD_NAME=nuevo_valor
   CLOUDINARY_API_KEY=nuevo_valor
   CLOUDINARY_API_SECRET=nuevo_valor
   ```
5. Redeploy backend (Railway lo hace automático)

### 5.2 Verificar .env NO está en Repo

```bash
# Verificar que .env está en .gitignore
cat .gitignore | grep .env

# Verificar que NO está tracked
git ls-files | grep "^\.env$"
# No debería retornar nada
```

---

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'slowapi'"

**Causa**: Railway no instaló las nuevas dependencias.

**Solución**:
```bash
# Forzar rebuild
railway up --detach

# O en Dashboard: Settings → Redeploy
```

### Error: "alembic: command not found"

**Causa**: Alembic no está en el Dockerfile de producción.

**Solución**: Verificar `backend/Dockerfile.production`:
```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
# Esto debería instalar alembic (ya está en requirements.txt)
```

### Error: "Rate limit headers not showing"

**Causa**: Middleware no configurado correctamente.

**Verificación**:
```bash
# Ver logs del backend
railway logs

# Buscar errores relacionados con SlowAPI
```

### Error: "Database connection refused"

**Causa**: Variables de entorno de BD no configuradas.

**Solución**:
```bash
# En Railway Dashboard:
# Backend Service → Settings → "Link" la base de datos PostgreSQL
# Esto auto-configura las variables DATABASE_URL, etc.
```

### Build Falla con "alembic.ini not found"

**Causa**: El archivo no se copió al contenedor.

**Solución**: Verificar `backend/Dockerfile.production`:
```dockerfile
COPY . .  # Debe copiar TODO, incluyendo alembic/
```

---

## 📊 Monitoreo en Railway

### Ver Logs en Tiempo Real

```bash
# Backend
railway logs -s backend

# Frontend
railway logs -s frontend

# E-commerce
railway logs -s ecommerce
```

### Métricas

En Railway Dashboard → Service → Metrics:
- CPU Usage
- Memory Usage
- Request Rate
- Response Times

**Alertas a configurar:**
- CPU > 80%
- Memory > 80%
- Error Rate > 5%

---

## 🔄 Workflow de Deploy Futuro

```bash
# 1. Hacer cambios localmente
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Push a GitHub
git push origin main

# 3. Railway auto-deploya

# 4. Si hay cambios en modelos de BD:
railway run alembic revision --autogenerate -m "descripción"
git add backend/alembic/versions/
git commit -m "feat: add migration for nueva funcionalidad"
git push

# 5. Aplicar migración en producción
railway run alembic upgrade head

# 6. Verificar
curl https://tu-backend.up.railway.app/health
```

---

## 🎯 Checklist de Deploy

### Pre-Deploy
- [ ] Variables de entorno configuradas en Railway
- [ ] Secrets regenerados (Cloudinary, JWT)
- [ ] Tests pasando localmente
- [ ] Código pusheado a GitHub

### Durante Deploy
- [ ] Railway detectó el push
- [ ] Build exitoso en los 3 servicios
- [ ] Deployments en estado "Active"

### Post-Deploy
- [ ] Migraciones aplicadas (`alembic upgrade head`)
- [ ] Health check respondiendo 200
- [ ] Rate limiting funcionando (test con curl)
- [ ] Frontend carga correctamente
- [ ] E-commerce carga correctamente
- [ ] Login funciona
- [ ] Crear una venta de prueba

---

## 🚨 Rollback de Emergencia

Si algo sale mal:

```bash
# Opción 1: Rollback desde Railway Dashboard
# Service → Deployments → Click en deployment anterior → "Redeploy"

# Opción 2: Desde Railway CLI
railway rollback

# Opción 3: Revertir commits y pushear
git revert HEAD~4..HEAD  # Revierte últimos 4 commits
git push origin main
```

**Para migraciones:**
```bash
# Revertir migración
railway run alembic downgrade -1

# O a versión específica
railway run alembic downgrade <revision_id>
```

---

## 📚 Recursos

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Alembic Migrations](../backend/MIGRATIONS.md)
- [Secrets Management](../SECRETS_MANAGEMENT.md)
- [Rate Limiting](../backend/RATE_LIMITING.md)

---

## 🎯 Próximos Pasos Recomendados

### 1. Agregar Redis para Rate Limiting (Opcional pero recomendado)

```bash
# En Railway Dashboard:
# New → Database → Redis

# Luego en Backend Variables:
REDIS_URL=${{Redis.REDIS_URL}}
```

### 2. Configurar Dominios Personalizados

```bash
# Railway Dashboard → Service → Settings → Domains
# Agregar: api.tu-dominio.com, pos.tu-dominio.com, etc.
```

### 3. Habilitar Backups Automáticos

```bash
# Railway Dashboard → Database → Settings
# Enable automated backups
```

### 4. Configurar Alertas

```bash
# Railway Dashboard → Project Settings → Notifications
# Configurar Slack/Discord/Email para alertas
```

---

**Última actualización:** 28 de Enero 2026
**Autor:** Sistema de Deploy POS Cesariel
