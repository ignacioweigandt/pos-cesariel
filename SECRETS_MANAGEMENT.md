# Secrets Management Guide - POS Cesariel

## 🔒 ¿Por qué es importante?

**NUNCA** debés commitear secrets (contraseñas, API keys, tokens) al repositorio de git.

### Riesgos de secrets hardcodeados:

- ❌ Cualquiera con acceso al repo puede ver las credenciales
- ❌ Si el repo es público, las credenciales están expuestas en internet
- ❌ No podés tener diferentes secrets por entorno (dev vs prod)
- ❌ Si alguien roba las credenciales, debés cambiarlas en TODO el código
- ❌ Violación de compliance y seguridad

---

## 📋 Setup Inicial (Primera vez)

### 1. Copiar archivo de ejemplo

```bash
# En el root del proyecto
cp .env.example .env
```

### 2. Editar .env con valores reales

```bash
# Abrir con tu editor preferido
nano .env
# o
code .env
```

### 3. Llenar valores sensibles

```env
# ❌ MAL - Usar valores de ejemplo
DB_PASSWORD=your_secure_password_here

# ✅ BIEN - Generar valores seguros
DB_PASSWORD=kJ8$mPq2#vL9@xR4
```

### 4. Verificar que .env NO está en git

```bash
# Esto NO debe mostrar .env
git status

# Verificar que .env está en .gitignore
cat .gitignore | grep .env
```

---

## 🔑 Generar Secrets Seguros

### Password de Base de Datos

```bash
# Generar password aleatorio seguro
python3 -c "import secrets, string; chars = string.ascii_letters + string.digits + string.punctuation; print(''.join(secrets.choice(chars) for _ in range(32)))"
```

### JWT Secret Key

```bash
# Generar JWT secret key (URL-safe)
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Cloudinary Credentials

1. Ir a https://cloudinary.com/console
2. Copiar:
   - Cloud Name
   - API Key
   - API Secret

---

## 📝 Archivo .env (Desarrollo)

Crear `.env` en el root del proyecto:

```env
# =================================
# ENVIRONMENT
# =================================
ENV=development
DEBUG=true

# =================================
# DATABASE
# =================================
DB_HOST=db
DB_PORT=5432
DB_NAME=pos_cesariel
DB_USER=postgres
DB_PASSWORD=tu_password_seguro_aqui

# =================================
# JWT
# =================================
JWT_SECRET_KEY=tu_jwt_secret_key_super_seguro_aqui
JWT_EXPIRE_MINUTES=480

# =================================
# CLOUDINARY
# =================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# =================================
# FRONTEND
# =================================
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://backend:8000
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true
```

---

## 🚀 Archivo .env.production (Producción)

**IMPORTANTE**: Este archivo NUNCA debe commitearse a git.

```env
# =================================
# PRODUCTION ENVIRONMENT
# =================================
ENV=production
DEBUG=false

# =================================
# DATABASE (Managed Service Recommended)
# =================================
DB_HOST=your-production-db-host.com
DB_PORT=5432
DB_NAME=pos_cesariel_prod
DB_USER=pos_admin
DB_PASSWORD=SUPER_SECURE_PRODUCTION_PASSWORD

# =================================
# JWT (REGENERATE FOR PRODUCTION)
# =================================
JWT_SECRET_KEY=DIFFERENT_PRODUCTION_JWT_SECRET_KEY
JWT_EXPIRE_MINUTES=480

# =================================
# CLOUDINARY (SEPARATE ACCOUNT RECOMMENDED)
# =================================
CLOUDINARY_CLOUD_NAME=production_cloud_name
CLOUDINARY_API_KEY=production_api_key
CLOUDINARY_API_SECRET=production_api_secret

# =================================
# FRONTEND (Production URLs)
# =================================
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
API_URL=http://backend:8000
```

---

## 🔄 Uso con Docker Compose

Docker Compose automáticamente carga `.env` del directorio actual.

```yaml
# docker-compose.yml
services:
  backend:
    env_file:
      - .env  # ← Carga variables desde .env
    environment:
      - DB_PASSWORD=${DB_PASSWORD}  # ← Usa variable desde .env
```

### Verificar variables cargadas

```bash
# Ver variables de entorno del contenedor
docker compose exec backend env | grep DB_
```

---

## 🌐 Deploy a Plataformas (Railway, Heroku, etc.)

### Railway

1. Dashboard → Project → Variables
2. Agregar cada variable manualmente:
   - `DB_PASSWORD`: valor seguro
   - `JWT_SECRET_KEY`: valor seguro
   - etc.

3. O importar desde .env:
```bash
railway variables --load .env.production
```

### Heroku

```bash
# Set individual variables
heroku config:set DB_PASSWORD=secure_password
heroku config:set JWT_SECRET_KEY=secure_jwt_key

# View all config vars
heroku config
```

### Render

1. Dashboard → Environment
2. Add Environment Variables
3. Marcar variables sensibles como "Secret"

---

## ✅ Checklist de Seguridad

Antes de ir a producción:

- [ ] `.env` está en `.gitignore`
- [ ] `.env.production` está en `.gitignore`
- [ ] Verificar que NO hay secrets en código fuente:
  ```bash
  git log --all -p | grep -i "password\|secret\|api_key" | grep -v "your_"
  ```
- [ ] Todos los secrets de producción son DIFERENTES a los de desarrollo
- [ ] Passwords tienen al menos 32 caracteres aleatorios
- [ ] JWT secret key tiene al menos 32 caracteres aleatorios
- [ ] Cloudinary de producción es cuenta separada (o subfolder)
- [ ] Database de producción es servicio managed (no SQLite)
- [ ] Backups automáticos configurados
- [ ] Secrets rotados si alguna vez fueron expuestos

---

## 🔄 Rotar Secrets (Si fueron comprometidos)

Si accidentalmente commiteaste secrets al repo:

### 1. Cambiar secrets INMEDIATAMENTE

```bash
# 1. Generar nuevos secrets
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# 2. Actualizar .env
nano .env

# 3. Actualizar plataforma de deploy
railway variables:set JWT_SECRET_KEY=nuevo_valor
```

### 2. Regenerar API Keys de terceros

**Cloudinary:**
1. Ir a Settings → Security → Reset API Secret
2. Actualizar .env con nuevo valor

### 3. Limpiar historial de git (SOLO SI ES NECESARIO)

⚠️ **PELIGROSO** - Esto reescribe la historia de git

```bash
# Usar git-filter-repo (mejor que filter-branch)
# Instalar: brew install git-filter-repo

git filter-repo --path .env --invert-paths
git push --force
```

### 4. Invalidar sesiones activas

```bash
# Si cambiaste JWT_SECRET_KEY, todos los usuarios serán deslogueados
# Esto es BUENO en caso de compromiso de seguridad
```

---

## 🧪 Testing con Secrets

### Para tests locales

Crear `.env.test`:

```env
ENV=test
DEBUG=true
DB_HOST=localhost
DB_NAME=pos_cesariel_test
DB_USER=postgres
DB_PASSWORD=test_password
JWT_SECRET_KEY=test_jwt_key_not_secure
```

### Cargar en tests

```python
# tests/conftest.py
import os
from dotenv import load_dotenv

load_dotenv('.env.test')
```

---

## 📖 Referencias Rápidas

### Ver valores actuales (desarrollo)

```bash
# Ver todas las variables (cuidado con logs públicos)
docker compose config

# Ver variable específica
docker compose exec backend env | grep JWT_SECRET_KEY
```

### Validar configuración

```bash
# Verificar que .env existe
test -f .env && echo "✅ .env exists" || echo "❌ .env missing"

# Verificar que .env NO está en git
git ls-files | grep -q "^\.env$" && echo "❌ .env is tracked!" || echo "✅ .env is ignored"
```

---

## ❌ Errores Comunes

### Error: "Environment variable not set"

```bash
# Verificar que .env existe
ls -la .env

# Verificar sintaxis (sin espacios alrededor del =)
# ✅ BIEN
DB_PASSWORD=mypassword

# ❌ MAL
DB_PASSWORD = mypassword
```

### Error: "Connection refused" después de cambiar DB_PASSWORD

```bash
# Recrear contenedor de BD
docker compose down
docker volume rm pos-cesariel_postgres_data  # ⚠️ Borra datos
docker compose up -d
```

---

## 🆘 Troubleshooting

### Variables no se cargan en Docker

```bash
# 1. Verificar que .env está en el mismo directorio que docker-compose.yml
pwd
ls -la .env

# 2. Recrear contenedores
docker compose down
docker compose up -d --force-recreate

# 3. Ver logs
docker compose logs backend | grep -i "environment"
```

### Secrets visibles en logs

```bash
# Evitar loggear secrets
# ❌ MAL
print(f"Password: {DB_PASSWORD}")

# ✅ BIEN
print("Password: [REDACTED]")
```

---

## 📚 Mejores Prácticas

1. **Un .env por entorno**
   - `.env` → desarrollo local
   - `.env.test` → testing
   - `.env.production` → producción (NUNCA commitear)

2. **Usar valores por default seguros**
   ```yaml
   - DB_PASSWORD=${DB_PASSWORD:-fallback_default}
   ```

3. **Documentar variables requeridas**
   - Mantener `.env.example` actualizado
   - Listar todas las variables necesarias

4. **Validar en startup**
   ```python
   # backend/config/settings.py
   if not os.getenv("JWT_SECRET_KEY"):
       raise ValueError("JWT_SECRET_KEY must be set")
   ```

5. **Rotar secrets regularmente**
   - Cada 90 días en producción
   - Inmediatamente si hay sospecha de compromiso

6. **Usar secrets managers en producción**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Railway/Heroku config vars

---

## 🎯 Resumen

✅ **HACER:**
- Usar `.env` para secrets locales
- Mantener `.env.example` actualizado sin valores reales
- Usar secrets managers en producción
- Generar secrets largos y aleatorios
- Rotar secrets comprometidos inmediatamente

❌ **NO HACER:**
- Commitear `.env` a git
- Usar mismos secrets en dev y prod
- Hardcodear secrets en código
- Compartir secrets por email/Slack
- Loggear valores de secrets

---

**Última actualización:** 28 de Enero 2026
