# 📋 TAREAS PENDIENTES - POS Cesariel

**Última actualización:** 28 de Enero 2026  
**Estado actual:** Sistema funcionando en producción en Railway ✅

---

## 🎯 TAREAS PRIORITARIAS (Próxima Sesión)

### 1. **Health Checks Avanzados** ⚡ ALTA PRIORIDAD
**Tiempo estimado:** 15 minutos  
**Impacto:** Railway necesita esto para auto-restart del backend

**Qué hacer:**
- Crear endpoint `/health/detailed` que verifique:
  - ✅ Conexión a PostgreSQL (query de prueba)
  - ✅ Conexión a Cloudinary (test de API)
  - ✅ Memoria disponible (< 90% uso)
  - ✅ Disco disponible (> 10% libre)
- Configurar Railway para usar este endpoint en Health Checks
- Retornar status 200 solo si TODO está OK, 503 si algo falla

**Beneficio:**
Railway reinicia automáticamente el backend si detecta problemas, sin intervención manual.

---

### 2. **Structured Logging (JSON)** 📊 ALTA PRIORIDAD
**Tiempo estimado:** 10 minutos  
**Impacto:** Debugging mucho más fácil en producción

**Qué hacer:**
- Reemplazar `print()` statements con logger configurado
- Logs en formato JSON con: timestamp, level, module, message, context
- Diferentes niveles: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Configurar Railway para capturar y mostrar logs correctamente

**Beneficio:**
Cuando algo falle en producción, vas a poder filtrar logs por nivel, módulo, usuario, etc.

**Archivo a crear:**
```
backend/config/logging.py
```

---

### 3. **Sentry Error Tracking** 🔔 MEDIA PRIORIDAD
**Tiempo estimado:** 10 minutos  
**Impacto:** Te avisa por email cuando hay errores en producción

**Qué hacer:**
- Crear cuenta gratuita en Sentry.io
- Instalar `sentry-sdk` en requirements.txt
- Configurar en `main.py` con DSN de Sentry
- Agregar `SENTRY_DSN` a variables de entorno en Railway

**Beneficio:**
- Stack traces completos cuando hay errores
- Notificaciones en tiempo real
- Ver cuántos usuarios fueron afectados
- Filtrar por browser, OS, endpoint, etc.

---

### 4. **Habilitar Rate Limiting con Redis** 🛡️ MEDIA PRIORIDAD
**Tiempo estimado:** 20 minutos  
**Impacto:** Protección contra brute force y DDoS

**Qué hacer:**
- Agregar servicio Redis en Railway (1 click)
- Cambiar `storage_uri="memory://"` → `storage_uri="redis://..."`
- Testear que funcione correctamente con proxies de Railway
- Habilitar con `RATE_LIMIT_ENABLED=true` en Railway
- Verificar que login tenga límite de 5 intentos/minuto

**Beneficio:**
Sistema protegido contra ataques de fuerza bruta en login y abuse de API.

**NOTA:** Actualmente deshabilitado porque causaba error 500 en Railway.

---

## 🔧 TAREAS TÉCNICAS ADICIONALES

### 5. **Regenerar Cloudinary API Keys** 🔑 CRÍTICO (Hacer ASAP)
**Tiempo estimado:** 5 minutos  
**Impacto:** Las keys actuales están comprometidas (estuvieron en git)

**Qué hacer:**
1. Ir a https://cloudinary.com/console
2. Settings → Security → Reset API Secret
3. Copiar nuevas credenciales
4. Actualizar en Railway:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Reiniciar backend en Railway

**¿Por qué?**
Las keys antiguas estuvieron en el código antes del secrets management.

---

### 6. **Configurar Variables de Entorno Faltantes** ⚙️ MEDIA PRIORIDAD
**Tiempo estimado:** 5 minutos  
**Impacto:** Configuración correcta de producción

**Variables a configurar en Railway:**

**Backend Service:**
```bash
ENV=production                    # Actualmente está en "development"
DEBUG=false                       # Deshabilitar modo debug
JWT_SECRET_KEY=<generated_value>  # Usar generate_secrets.py
SECRET_KEY=<generated_value>      # Usar generate_secrets.py
```

**Comandos para generar:**
```bash
python3 generate_secrets.py --all
```

---

### 7. **Aplicar Alembic Migrations en Producción** 🗄️ OPCIONAL
**Tiempo estimado:** 5 minutos  
**Impacto:** Base de datos versionada correctamente

**Qué hacer:**
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login y link
railway login
railway link

# 3. Marcar estado actual (BD ya tiene tablas)
railway run -s backend alembic stamp head

# 4. Verificar
railway run -s backend alembic current
# Debería mostrar: e23e20872fc1 (head)
```

**Beneficio:**
Futuras migraciones de BD serán automáticas y versionadas.

**NOTA:** No urgente porque la BD ya está funcionando.

---

## 📈 MEJORAS DE PERFORMANCE (Futuro)

### 8. **Caching con Redis** ⚡
- Cachear productos más vendidos
- Cachear categorías (cambian poco)
- Cachear configuración del sistema
- TTL: 5-15 minutos según el caso

### 9. **Optimización de Queries** 🔍
- Agregar índices a columnas más consultadas
- Usar `select_related()` y `prefetch_related()` en queries complejas
- Pagination en endpoints que devuelven muchos registros

### 10. **CDN para Imágenes** 🖼️
- Cloudinary ya tiene CDN incluido
- Verificar que las URLs usen el CDN de Cloudinary
- Configurar transformaciones automáticas (resize, webp)

---

## 🧪 TESTING (Futuro)

### 11. **CI/CD Pipeline** 🚀
- GitHub Actions para correr tests en cada push
- Deploy automático a Railway solo si tests pasan
- Linting automático (flake8, black)

### 12. **E2E Tests con Playwright** 🎭
- Tests de login/logout
- Tests de crear venta
- Tests de agregar producto
- Correr en CI antes de deploy

---

## 📝 DOCUMENTACIÓN

### 13. **API Documentation Enhancement** 📚
- Agregar más ejemplos en Swagger
- Documentar códigos de error comunes
- Agregar ejemplos de request/response
- Tutorial de Getting Started

### 14. **Deployment Runbook** 📖
- Documento paso a paso para despliegues
- Troubleshooting común
- Rollback procedures
- Database backup/restore procedures

---

## 🔐 SEGURIDAD ADICIONAL

### 15. **HTTPS Enforcement** 🔒
Railway ya proporciona HTTPS, pero verificar:
- Forzar HTTPS en todos los endpoints
- HSTS headers configurados
- Secure cookies

### 16. **Security Headers** 🛡️
- X-Content-Type-Options
- X-Frame-Options
- Content-Security-Policy
- X-XSS-Protection

---

## 📊 PROGRESO GENERAL

**✅ COMPLETADO (5/8 tareas críticas):**
- ✅ Alembic Database Migrations
- ✅ Secrets Management
- ✅ Rate Limiting (código listo)
- ✅ Railway Deployment
- ✅ **Login Fix (HOY)**

**🚧 EN PROGRESO (0/8):**
Ninguna actualmente

**⏳ PENDIENTE (3/8 tareas críticas + mejoras):**
- ⏳ Health Checks Avanzados
- ⏳ Structured Logging
- ⏳ Sentry Error Tracking
- ⏳ Regenerar Cloudinary Keys
- ⏳ Rate Limiting con Redis
- ⏳ Variables de entorno (ENV=production)
- ⏳ +10 mejoras adicionales documentadas arriba

**Progress:** 62.5% de tareas críticas completadas

---

## 🎯 RECOMENDACIÓN PARA PRÓXIMA SESIÓN

**Orden sugerido de implementación:**

1. **Regenerar Cloudinary Keys (5 min)** - CRÍTICO
2. **Health Checks Avanzados (15 min)** - ALTA prioridad
3. **Structured Logging (10 min)** - ALTA prioridad
4. **Sentry Error Tracking (10 min)** - MEDIA prioridad

**Total:** ~40 minutos para tener un sistema production-ready al 90%

---

## 📞 CONTACTO Y RECURSOS

**Repositorio:** https://github.com/ignacioweigandt/pos-cesariel  
**Railway Dashboard:** https://railway.app/dashboard  
**Backend URL:** https://backend-production-c20a.up.railway.app  
**Frontend POS URL:** https://frontend-pos-production.up.railway.app  
**E-commerce URL:** https://e-commerce-production-3634.up.railway.app

**Documentación útil:**
- `CLAUDE.md` - Guía completa del proyecto
- `MIGRATIONS.md` - Guía de Alembic
- `SECRETS_MANAGEMENT.md` - Gestión de secretos
- `RATE_LIMITING.md` - Documentación de rate limiting
- `RAILWAY_DEPLOY.md` - Guía de deployment
- `PRODUCTION_READY_CHECKLIST.md` - Checklist de producción

---

**Notas finales:**
- Sistema funcionando en producción ✅
- Login operativo ✅
- Rate limiting deshabilitado temporalmente (era la causa del error 500)
- Base de datos inicializada con 3 usuarios, 106 productos, 6 sucursales
- Credenciales de admin: `admin` / `admin123`

**Última modificación:** 28 de Enero 2026 - 15:45 ART
