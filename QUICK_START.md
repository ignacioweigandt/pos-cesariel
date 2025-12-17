# Quick Start - Deployment a Producción

Guía rápida para deployment. Para información detallada, consulta [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🚀 Deployment en 5 Pasos

### 1. Configurar Entorno

```bash
cp .env.production.example .env.production
# Edita .env.production con tus valores reales
```

### 2. Generar SECRET_KEY

```bash
openssl rand -hex 32
# Copia el resultado a SECRET_KEY en .env.production
```

### 3. Build

```bash
make build-prod
# o: docker compose -f docker-compose.production.yml build --no-cache
```

### 4. Deploy

```bash
./deploy.sh
# o: make deploy-prod
```

### 5. Verificar

```bash
# Verificar estado
make status

# Verificar health
curl http://localhost:8000/health
curl http://localhost:3000/
curl http://localhost:3001/
```

## 📝 Comandos Útiles

```bash
# Ver logs
make logs-prod

# Reiniciar servicios
make restart-prod

# Detener
make stop-prod

# Backup BD
make backup-db

# Ver ayuda
make help
```

## 🌐 URLs de Acceso

- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **POS Admin**: http://localhost:3000
- **E-commerce**: http://localhost:3001

## ⚠️ Importante

- **NUNCA** subas `.env.production` a Git
- Usa contraseñas fuertes
- Configura HTTPS en producción
- Haz backups regulares

## 🆘 Problemas Comunes

### Build falla
```bash
docker builder prune -af
make build-prod
```

### Puertos ocupados
```bash
# Cambiar puertos en .env.production
BACKEND_PORT=8001
FRONTEND_PORT=3002
ECOMMERCE_PORT=3003
```

### Ver logs de errores
```bash
docker compose -f docker-compose.production.yml logs --tail=100
```

## 📚 Más Información

- [Deployment Completo](./DEPLOYMENT.md)
- [Documentación del Proyecto](./CLAUDE.md)
