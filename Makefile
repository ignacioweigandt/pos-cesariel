.PHONY: help dev dev-pos dev-ecommerce down restart clean clean-volumes logs-backend logs-frontend logs-ecommerce logs-db shell-backend shell-frontend shell-ecommerce shell-db build-prod deploy-prod stop-prod restart-prod logs-prod clean-prod backup-db restore-db

# ==================================
# VARIABLES
# ==================================
DOCKER_COMPOSE_DEV = docker compose -f docker-compose.yml
DOCKER_COMPOSE_PROD = docker compose -f docker-compose.production.yml

# ==================================
# AYUDA
# ==================================
help: ## Muestra esta ayuda
	@echo "Comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ==================================
# DESARROLLO
# ==================================
dev: ## Iniciar todos los servicios en modo desarrollo
	$(DOCKER_COMPOSE_DEV) up -d
	@echo "✅ Servicios iniciados en modo desarrollo"
	@echo "📍 POS Admin: http://localhost:3000"
	@echo "📍 E-commerce: http://localhost:3001"
	@echo "📍 API Backend: http://localhost:8000"
	@echo "📍 API Docs: http://localhost:8000/docs"
	@echo "📍 Adminer: http://localhost:8080"

dev-pos: ## Iniciar solo POS Admin y dependencias (db, backend, frontend)
	$(DOCKER_COMPOSE_DEV) up -d db backend frontend
	@echo "✅ POS Admin iniciado"
	@echo "📍 http://localhost:3000"

dev-ecommerce: ## Iniciar solo E-commerce y dependencias (db, backend, ecommerce)
	$(DOCKER_COMPOSE_DEV) up -d db backend ecommerce
	@echo "✅ E-commerce iniciado"
	@echo "📍 http://localhost:3001"

down: ## Detener todos los servicios
	$(DOCKER_COMPOSE_DEV) down
	@echo "🛑 Servicios detenidos"

restart: ## Reiniciar todos los servicios
	$(DOCKER_COMPOSE_DEV) restart
	@echo "🔄 Servicios reiniciados"

clean: ## Limpiar contenedores y volúmenes
	$(DOCKER_COMPOSE_DEV) down -v
	@echo "🧹 Contenedores y volúmenes limpiados"

clean-volumes: ## Limpiar solo volúmenes (preservar imágenes)
	$(DOCKER_COMPOSE_DEV) down -v --remove-orphans
	@echo "🧹 Volúmenes limpiados"

# ==================================
# LOGS
# ==================================
logs-backend: ## Ver logs del backend
	$(DOCKER_COMPOSE_DEV) logs -f backend

logs-frontend: ## Ver logs del frontend POS
	$(DOCKER_COMPOSE_DEV) logs -f frontend

logs-ecommerce: ## Ver logs del e-commerce
	$(DOCKER_COMPOSE_DEV) logs -f ecommerce

logs-db: ## Ver logs de la base de datos
	$(DOCKER_COMPOSE_DEV) logs -f db

logs-all: ## Ver todos los logs
	$(DOCKER_COMPOSE_DEV) logs -f

# ==================================
# SHELL ACCESS
# ==================================
shell-backend: ## Acceder al shell del contenedor backend
	$(DOCKER_COMPOSE_DEV) exec backend bash

shell-frontend: ## Acceder al shell del contenedor frontend POS
	$(DOCKER_COMPOSE_DEV) exec frontend sh

shell-ecommerce: ## Acceder al shell del contenedor e-commerce
	$(DOCKER_COMPOSE_DEV) exec ecommerce sh

shell-db: ## Acceder al shell de PostgreSQL
	$(DOCKER_COMPOSE_DEV) exec db psql -U postgres -d pos_cesariel

# ==================================
# PRODUCCIÓN - BUILD
# ==================================
build-prod: ## Construir imágenes de producción
	@echo "🔨 Construyendo imágenes de producción..."
	$(DOCKER_COMPOSE_PROD) build --no-cache
	@echo "✅ Imágenes de producción construidas"

build-backend: ## Construir solo backend de producción
	@echo "🔨 Construyendo backend..."
	$(DOCKER_COMPOSE_PROD) build --no-cache backend
	@echo "✅ Backend construido"

build-frontend: ## Construir solo frontend POS de producción
	@echo "🔨 Construyendo frontend POS..."
	$(DOCKER_COMPOSE_PROD) build --no-cache frontend
	@echo "✅ Frontend POS construido"

build-ecommerce: ## Construir solo e-commerce de producción
	@echo "🔨 Construyendo e-commerce..."
	$(DOCKER_COMPOSE_PROD) build --no-cache ecommerce
	@echo "✅ E-commerce construido"

# ==================================
# PRODUCCIÓN - DEPLOYMENT
# ==================================
deploy-prod: ## Desplegar en producción (requiere .env.production)
	@if [ ! -f .env.production ]; then \
		echo "❌ Error: .env.production no encontrado"; \
		echo "💡 Copia .env.production.example a .env.production y configúralo"; \
		exit 1; \
	fi
	@echo "🚀 Desplegando en producción..."
	$(DOCKER_COMPOSE_PROD) --env-file .env.production up -d
	@echo "✅ Aplicación desplegada en producción"
	@echo "⏳ Esperando que los servicios estén listos..."
	@sleep 10
	$(DOCKER_COMPOSE_PROD) ps

stop-prod: ## Detener producción
	$(DOCKER_COMPOSE_PROD) down
	@echo "🛑 Producción detenida"

restart-prod: ## Reiniciar producción
	$(DOCKER_COMPOSE_PROD) restart
	@echo "🔄 Producción reiniciada"

logs-prod: ## Ver logs de producción
	$(DOCKER_COMPOSE_PROD) logs -f

clean-prod: ## Limpiar contenedores de producción (MANTIENE volúmenes)
	@echo "⚠️  Esto detendrá los contenedores de producción"
	@read -p "¿Estás seguro? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(DOCKER_COMPOSE_PROD) down; \
		echo "🧹 Contenedores de producción limpiados"; \
	else \
		echo "❌ Operación cancelada"; \
	fi

# ==================================
# BASE DE DATOS
# ==================================
backup-db: ## Crear backup de la base de datos
	@echo "💾 Creando backup de la base de datos..."
	@mkdir -p backups
	@docker compose exec -T db pg_dump -U postgres pos_cesariel > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup creado en backups/"

restore-db: ## Restaurar base de datos desde backup (usar BACKUP_FILE=ruta/al/archivo.sql)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Error: Especifica BACKUP_FILE=ruta/al/archivo.sql"; \
		exit 1; \
	fi
	@echo "⚠️  Esto sobrescribirá la base de datos actual"
	@read -p "¿Estás seguro? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cat $(BACKUP_FILE) | docker compose exec -T db psql -U postgres pos_cesariel; \
		echo "✅ Base de datos restaurada"; \
	else \
		echo "❌ Operación cancelada"; \
	fi

init-db: ## Inicializar base de datos con datos de prueba
	@echo "📦 Inicializando base de datos..."
	$(DOCKER_COMPOSE_DEV) exec backend python init_data.py
	@echo "✅ Base de datos inicializada"

# ==================================
# MIGRACIONES (ALEMBIC)
# ==================================
migrate-create: ## Crear nueva migración (usar MSG="descripción")
	@if [ -z "$(MSG)" ]; then \
		echo "❌ Error: Especifica MSG=\"descripción de la migración\""; \
		echo "💡 Ejemplo: make migrate-create MSG=\"add user email column\""; \
		exit 1; \
	fi
	@echo "🔨 Creando migración: $(MSG)"
	$(DOCKER_COMPOSE_DEV) exec backend alembic revision --autogenerate -m "$(MSG)"
	@echo "✅ Migración creada en backend/alembic/versions/"
	@echo "⚠️  IMPORTANTE: Revisá el archivo generado antes de aplicarlo"

migrate-upgrade: ## Aplicar todas las migraciones pendientes
	@echo "⬆️  Aplicando migraciones..."
	$(DOCKER_COMPOSE_DEV) exec backend alembic upgrade head
	@echo "✅ Migraciones aplicadas"

migrate-downgrade: ## Revertir última migración
	@echo "⬇️  Revirtiendo última migración..."
	$(DOCKER_COMPOSE_DEV) exec backend alembic downgrade -1
	@echo "✅ Migración revertida"

migrate-history: ## Ver historial de migraciones
	$(DOCKER_COMPOSE_DEV) exec backend alembic history

migrate-current: ## Ver migración actual aplicada
	$(DOCKER_COMPOSE_DEV) exec backend alembic current

migrate-init: ## Crear migración inicial desde esquema actual
	@echo "🚀 Creando migración inicial desde esquema existente..."
	$(DOCKER_COMPOSE_DEV) exec backend alembic revision --autogenerate -m "initial_schema"
	@echo "✅ Migración inicial creada"
	@echo "📝 Revisá backend/alembic/versions/ antes de aplicar"

# ==================================
# TESTING
# ==================================
test-backend: ## Ejecutar tests del backend
	$(DOCKER_COMPOSE_DEV) exec backend pytest

test-frontend: ## Ejecutar tests del frontend POS
	$(DOCKER_COMPOSE_DEV) exec frontend npm test

test-ecommerce: ## Ejecutar tests del e-commerce
	$(DOCKER_COMPOSE_DEV) exec ecommerce npm test

# ==================================
# UTILIDADES
# ==================================
status: ## Ver estado de los contenedores
	@echo "Estado de contenedores de desarrollo:"
	@$(DOCKER_COMPOSE_DEV) ps
	@echo ""
	@echo "Estado de contenedores de producción:"
	@$(DOCKER_COMPOSE_PROD) ps

health: ## Verificar salud de los servicios
	@echo "Verificando servicios..."
	@curl -f http://localhost:8000/health || echo "❌ Backend no responde"
	@curl -f http://localhost:3000/ || echo "❌ Frontend POS no responde"
	@curl -f http://localhost:3001/ || echo "❌ E-commerce no responde"
	@echo "✅ Verificación completa"

prune: ## Limpiar recursos Docker no utilizados
	@echo "⚠️  Esto eliminará imágenes, contenedores y volúmenes no utilizados"
	@read -p "¿Estás seguro? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker system prune -af --volumes; \
		echo "🧹 Sistema Docker limpiado"; \
	else \
		echo "❌ Operación cancelada"; \
	fi

# ============================================
# PRODUCCIÓN
# ============================================

.PHONY: build-prod deploy-prod logs-prod down-prod status-prod

build-prod: ## Build production images
	docker compose -f docker-compose.prod.yml build
	@echo "✅ Production images built successfully"

deploy-prod: ## Deploy to production
	@echo "🚀 Deploying to production..."
	docker compose -f docker-compose.prod.yml up -d
	@echo "✅ Production deployment complete"
	@echo "📍 Frontend: http://localhost:3000"
	@echo "📍 E-commerce: http://localhost:3001"
	@echo "📍 API: http://localhost:8000"

logs-prod: ## View production logs
	docker compose -f docker-compose.prod.yml logs -f

down-prod: ## Stop production services
	docker compose -f docker-compose.prod.yml down

status-prod: ## Check production services status
	docker compose -f docker-compose.prod.yml ps

restart-prod: ## Restart production services
	docker compose -f docker-compose.prod.yml restart

health-prod: ## Check health of production services
	@echo "Checking production services health..."
	@curl -f http://localhost:8000/ || echo "❌ Backend unhealthy"
	@curl -f http://localhost:3000/ || echo "❌ Frontend unhealthy"
	@curl -f http://localhost:3001/ || echo "❌ E-commerce unhealthy"

