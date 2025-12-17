# Guía de Deployment a Producción - POS Cesariel

Esta guía detalla el proceso completo para hacer un build y deployment del sistema POS Cesariel a producción.

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Build de Producción](#build-de-producción)
4. [Deployment](#deployment)
5. [Verificación Post-Deployment](#verificación-post-deployment)
6. [Mantenimiento](#mantenimiento)
7. [Troubleshooting](#troubleshooting)
8. [Rollback](#rollback)

## 🔧 Pre-requisitos

### Software Requerido

- **Docker**: Versión 20.10 o superior
- **Docker Compose**: Versión 2.0 o superior
- **Make**: Para usar los comandos del Makefile (opcional)
- **Git**: Para control de versiones

### Verificar Instalación

```bash
docker --version
docker compose version
make --version
```

### Hardware Recomendado

**Mínimo:**
- 2 CPU cores
- 4 GB RAM
- 20 GB espacio en disco

**Recomendado:**
- 4+ CPU cores
- 8+ GB RAM
- 50+ GB espacio en disco SSD

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd pos-cesariel
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita con tus valores de producción:

```bash
cp .env.production.example .env.production
```

Edita `.env.production` con tus valores reales:

```env
# Base de datos
POSTGRES_DB=pos_cesariel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TU_PASSWORD_SEGURA_AQUI

# Backend
SECRET_KEY=genera_una_clave_super_segura_de_64_caracteres_minimo

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloudinary_cloud_name
CLOUDINARY_API_KEY=tu_cloudinary_api_key
CLOUDINARY_API_SECRET=tu_cloudinary_api_secret

# Frontend
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

#### 🔐 Generar SECRET_KEY segura

```bash
# Usando OpenSSL
openssl rand -hex 32

# Usando Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Configurar SSL/TLS (Recomendado)

Para producción, deberías usar HTTPS. Coloca tus certificados en:

```bash
mkdir -p nginx/ssl
# Copia tus certificados:
# - nginx/ssl/certificate.crt
# - nginx/ssl/private.key
```

Luego, descomenta la sección HTTPS en `nginx/nginx.conf`.

## 🏗️ Build de Producción

### Opción 1: Usando Makefile (Recomendado)

```bash
# Construir todas las imágenes
make build-prod

# O construir servicios individuales
make build-backend
make build-frontend
make build-ecommerce
```

### Opción 2: Usando Docker Compose directamente

```bash
# Construir todas las imágenes
docker compose -f docker-compose.production.yml build --no-cache

# Construir un servicio específico
docker compose -f docker-compose.production.yml build --no-cache backend
```

### ⏱️ Tiempo Estimado de Build

- **Backend**: ~5-10 minutos
- **Frontend POS**: ~10-15 minutos
- **E-commerce**: ~10-15 minutos
- **Total**: ~25-40 minutos (primera vez)

Los builds subsecuentes serán más rápidos gracias al cache de Docker.

## 🚀 Deployment

### Opción 1: Script Automatizado (Recomendado)

El script `deploy.sh` automatiza todo el proceso:

```bash
./deploy.sh
```

El script realiza automáticamente:
1. ✅ Verificación de pre-requisitos
2. ✅ Backup de base de datos
3. ✅ Build de imágenes
4. ✅ Detención de servicios antiguos
5. ✅ Inicio de servicios nuevos
6. ✅ Verificación de salud
7. ✅ Muestra logs y estado

### Opción 2: Deployment Manual

#### Paso 1: Backup de Base de Datos

```bash
make backup-db
# o manualmente:
mkdir -p backups
docker compose -f docker-compose.production.yml exec -T db \
  pg_dump -U postgres pos_cesariel > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Paso 2: Build de Imágenes

```bash
make build-prod
```

#### Paso 3: Detener Servicios Antiguos

```bash
make stop-prod
# o:
docker compose -f docker-compose.production.yml down
```

#### Paso 4: Iniciar Servicios

```bash
make deploy-prod
# o:
docker compose -f docker-compose.production.yml --env-file .env.production up -d
```

## ✅ Verificación Post-Deployment

### 1. Verificar Estado de Contenedores

```bash
make status
# o:
docker compose -f docker-compose.production.yml ps
```

Todos los servicios deben mostrar estado `Up (healthy)`.

### 2. Verificar Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend POS
curl http://localhost:3000/

# E-commerce
curl http://localhost:3001/
```

### 3. Verificar Logs

```bash
make logs-prod
# o:
docker compose -f docker-compose.production.yml logs -f
```

Busca errores o warnings. Los logs deben mostrar que todos los servicios iniciaron correctamente.

### 4. Verificar Base de Datos

```bash
docker compose -f docker-compose.production.yml exec db \
  psql -U postgres -d pos_cesariel -c "SELECT COUNT(*) FROM users;"
```

### 5. Probar Funcionalidad

1. **Backend API**: Visita `http://localhost:8000/docs`
2. **POS Admin**: Visita `http://localhost:3000` y prueba login
3. **E-commerce**: Visita `http://localhost:3001` y navega el catálogo

## 🔧 Mantenimiento

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
make logs-prod

# Servicio específico
docker compose -f docker-compose.production.yml logs -f backend
docker compose -f docker-compose.production.yml logs -f frontend
docker compose -f docker-compose.production.yml logs -f ecommerce
```

### Reiniciar Servicios

```bash
# Todos los servicios
make restart-prod

# Servicio específico
docker compose -f docker-compose.production.yml restart backend
```

### Actualizar la Aplicación

```bash
# 1. Hacer pull de los cambios
git pull origin main

# 2. Rebuild y redeploy
./deploy.sh
```

### Backups Regulares

Configura backups automáticos con cron:

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * cd /ruta/a/pos-cesariel && make backup-db
```

### Monitoreo de Recursos

```bash
# Ver uso de recursos
docker stats

# Ver espacio en disco
docker system df
```

## 🐛 Troubleshooting

### Los servicios no inician

```bash
# Ver logs detallados
docker compose -f docker-compose.production.yml logs

# Verificar errores en la configuración
docker compose -f docker-compose.production.yml config
```

### Error de conexión a base de datos

```bash
# Verificar que la BD está corriendo
docker compose -f docker-compose.production.yml ps db

# Ver logs de la BD
docker compose -f docker-compose.production.yml logs db

# Probar conexión manualmente
docker compose -f docker-compose.production.yml exec db \
  psql -U postgres -d pos_cesariel
```

### Puertos ya en uso

```bash
# Identificar qué está usando el puerto
lsof -i :8000
lsof -i :3000
lsof -i :3001

# Cambiar puertos en .env.production
BACKEND_PORT=8001
FRONTEND_PORT=3002
ECOMMERCE_PORT=3003
```

### Frontend no se conecta al Backend

1. Verificar `NEXT_PUBLIC_API_URL` en `.env.production`
2. Verificar que el backend está respondiendo: `curl http://localhost:8000/health`
3. Revisar configuración de CORS en `backend/main.py`

### Build falla

```bash
# Limpiar cache y rebuild
docker builder prune -af
make build-prod
```

### Espacio en disco insuficiente

```bash
# Limpiar recursos no utilizados
docker system prune -af --volumes

# Ver espacio usado
docker system df
```

## ⏮️ Rollback

Si algo sale mal, puedes hacer rollback rápidamente:

### Rollback Completo

```bash
# 1. Detener servicios actuales
make stop-prod

# 2. Restaurar backup de BD
make restore-db BACKUP_FILE=backups/backup_YYYYMMDD_HHMMSS.sql

# 3. Volver al commit anterior
git checkout <commit-anterior>

# 4. Rebuild y deploy
./deploy.sh
```

### Rollback Solo Backend

```bash
# Volver a imagen anterior
docker compose -f docker-compose.production.yml stop backend
docker tag pos-cesariel-backend:latest pos-cesariel-backend:old
git checkout HEAD~1 backend/
make build-backend
docker compose -f docker-compose.production.yml up -d backend
```

## 📊 Monitoreo y Performance

### Health Checks Automáticos

Los contenedores tienen health checks configurados que se ejecutan cada 30 segundos:

```bash
# Ver estado de health checks
docker compose -f docker-compose.production.yml ps
```

### Logs Centralizados

Para producción seria, considera usar:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana + Loki**
- **CloudWatch** (AWS)
- **Stackdriver** (GCP)

### Métricas

Considera agregar:
- **Prometheus** para métricas
- **Grafana** para visualización
- **Alerting** para notificaciones

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- ✅ Cambiar todas las contraseñas por defecto
- ✅ Usar HTTPS con certificados válidos
- ✅ Configurar firewall correctamente
- ✅ Mantener Docker actualizado
- ✅ Escanear imágenes por vulnerabilidades
- ✅ Limitar acceso SSH
- ✅ Configurar backups automáticos
- ✅ Implementar rate limiting
- ✅ Configurar CORS correctamente
- ✅ Usar secrets management

### Escaneo de Vulnerabilidades

```bash
# Escanear imágenes
docker scan pos-cesariel-backend:latest
docker scan pos-cesariel-frontend:latest
docker scan pos-cesariel-ecommerce:latest
```

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/index.html)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `make logs-prod`
2. Consulta esta documentación
3. Revisa los issues del repositorio
4. Contacta al equipo de desarrollo

---

**Última actualización**: Diciembre 2024
