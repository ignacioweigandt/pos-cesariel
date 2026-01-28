# ✅ Deploy Checklist - Railway Production

**Fecha:** ___________  
**Deployed by:** ___________

---

## 🚀 Pre-Deploy (En tu máquina local)

- [ ] 1. **Generar secrets nuevos**
  ```bash
  python3 generate_secrets.py --all
  # Copiar valores generados
  ```

- [ ] 2. **Regenerar Cloudinary credentials**
  - Ir a https://cloudinary.com/console
  - Settings → Security → Reset API Secret
  - Copiar: Cloud Name, API Key, API Secret

- [ ] 3. **Verificar código en GitHub**
  ```bash
  git log --oneline -5
  # Verificar que los 5 commits están:
  # - feat: implement Alembic database migrations
  # - feat: implement secrets management
  # - feat: implement API rate limiting
  # - docs: add production readiness checklist
  # - docs: add Railway deployment guide
  ```

---

## 🔧 Railway Dashboard - Backend Service

- [ ] 4. **Variables de entorno del Backend**
  
  Railway Dashboard → Backend Service → Variables:
  
  ```
  ENV = production
  DEBUG = false
  
  # JWT (valores generados en paso 1)
  JWT_SECRET_KEY = ___________________________
  SECRET_KEY = ___________________________
  
  # Cloudinary (valores del paso 2)
  CLOUDINARY_CLOUD_NAME = ___________________________
  CLOUDINARY_API_KEY = ___________________________
  CLOUDINARY_API_SECRET = ___________________________
  ```

- [ ] 5. **Verificar database link**
  - Settings → Link PostgreSQL service
  - Esto auto-configura: DATABASE_URL, DB_HOST, DB_PORT, etc.

---

## 🎨 Railway Dashboard - Frontend POS Service

- [ ] 6. **Variables del Frontend POS**
  
  Railway Dashboard → Frontend Service → Variables:
  
  ```
  NODE_ENV = production
  
  # URL del backend (usar tu URL de Railway)
  NEXT_PUBLIC_API_URL = https://pos-cesariel-backend-production.up.railway.app
  API_URL = https://pos-cesariel-backend-production.up.railway.app
  ```

---

## 🛒 Railway Dashboard - E-commerce Service

- [ ] 7. **Variables del E-commerce**
  
  Railway Dashboard → E-commerce Service → Variables:
  
  ```
  NODE_ENV = production
  PORT = 3001
  
  # URL del backend
  NEXT_PUBLIC_API_URL = https://pos-cesariel-backend-production.up.railway.app
  API_URL = https://pos-cesariel-backend-production.up.railway.app
  ```

---

## 🚢 Deploy Automático

- [ ] 8. **Esperar deploy automático de Railway**
  
  Railway detectó tu push y está deployando:
  - Backend Service: Building... → Deploying... → Active ✅
  - Frontend Service: Building... → Deploying... → Active ✅
  - E-commerce Service: Building... → Deploying... → Active ✅
  
  **Tiempo estimado:** 5-10 minutos

- [ ] 9. **Verificar logs durante deploy**
  
  Railway Dashboard → Service → Deployments → View Logs
  
  Buscar errores:
  - ❌ "ModuleNotFoundError" → Problema con requirements.txt
  - ❌ "Port already in use" → Problema con PORT variable
  - ✅ "Application startup complete" → Backend OK

---

## 💾 Aplicar Migraciones de Base de Datos

**IMPORTANTE:** Hacer DESPUÉS de que backend esté Active

### Opción A: Railway CLI (Recomendado)

- [ ] 10a. **Instalar Railway CLI**
  ```bash
  npm install -g @railway/cli
  railway login
  railway link  # Seleccionar proyecto pos-cesariel
  ```

- [ ] 11a. **Aplicar migraciones**
  ```bash
  railway run -s backend alembic upgrade head
  ```

- [ ] 12a. **Verificar migración**
  ```bash
  railway run -s backend alembic current
  
  # Debe mostrar:
  # Rev: e23e20872fc1 (head)
  # initial_schema
  ```

### Opción B: Railway Dashboard

- [ ] 10b. **Ir a Backend Service → Deployments**

- [ ] 11b. **Click en deployment Active → "Shell" (si disponible)**

- [ ] 12b. **Ejecutar comandos:**
  ```bash
  alembic upgrade head
  alembic current
  ```

---

## ✅ Verificación Post-Deploy

- [ ] 13. **Health Check del Backend**
  ```bash
  curl https://TU-BACKEND-URL.up.railway.app/health
  
  # Debe retornar:
  # {
  #   "status": "healthy",
  #   "service": "Backend POS Cesariel",
  #   "environment": "production"
  # }
  ```

- [ ] 14. **Test de Rate Limiting**
  ```bash
  # Intentar login 6 veces
  for i in {1..6}; do
    echo "Intento $i:"
    curl -X POST https://TU-BACKEND-URL.up.railway.app/auth/login \
      -d "username=test&password=wrong" -w "\nStatus: %{http_code}\n"
  done
  
  # Intentos 1-5: 401 ✅
  # Intento 6: 429 (Too Many Requests) ✅
  ```

- [ ] 15. **Verificar Frontend POS carga**
  - Abrir: https://TU-FRONTEND-URL.up.railway.app
  - Login debe funcionar
  - Dashboard debe cargar

- [ ] 16. **Verificar E-commerce carga**
  - Abrir: https://TU-ECOMMERCE-URL.up.railway.app
  - Productos deben listarse
  - Agregar al carrito debe funcionar

- [ ] 17. **Test de funcionalidad crítica**
  - [ ] Login con usuario real
  - [ ] Ver productos
  - [ ] Crear una venta de prueba
  - [ ] Ver reportes
  - [ ] Verificar que stock se actualiza

---

## 📊 Monitoreo (Primeras 24 horas)

- [ ] 18. **Configurar alertas en Railway**
  - Project Settings → Notifications
  - Agregar email/Slack para alertas

- [ ] 19. **Monitorear métricas**
  - CPU Usage < 80% ✅
  - Memory Usage < 80% ✅
  - Error Rate < 5% ✅
  - Response Time < 2s ✅

- [ ] 20. **Revisar logs cada 2-4 horas**
  ```bash
  railway logs -s backend
  railway logs -s frontend
  railway logs -s ecommerce
  ```

---

## 🐛 Si algo sale mal...

### Backend no inicia

```bash
# Ver logs
railway logs -s backend

# Errores comunes:
# - "slowapi not found" → Rebuild service
# - "alembic.ini not found" → Verificar Dockerfile.production
# - "Database connection refused" → Verificar DATABASE_URL
```

### Frontend muestra errores de API

```bash
# Verificar variables
railway variables -s frontend

# Asegurar que:
# NEXT_PUBLIC_API_URL apunta al backend correcto
```

### Rollback de emergencia

```bash
# Opción 1: Railway Dashboard
# Service → Deployments → Click deployment anterior → Redeploy

# Opción 2: Railway CLI
railway rollback -s backend
```

---

## 📝 Notas del Deploy

**Versión deployada:** _______________________

**Issues encontrados:**
- ________________________________________
- ________________________________________
- ________________________________________

**Tiempo total de deploy:** _______________________

**Downtime:** _______________________

**Performance observado:**
- Response time promedio: _______________________
- Requests/minuto: _______________________
- Errores: _______________________

---

## ✅ Sign-off

- [ ] Todo funcionando correctamente
- [ ] Equipo notificado del deploy
- [ ] Documentación actualizada
- [ ] Backup de BD tomado (si necesario)

**Deployed by:** _______________________  
**Date:** _______________________  
**Time:** _______________________

---

**Próximo deploy:** _______________________
