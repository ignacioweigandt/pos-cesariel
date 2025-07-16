# Makefile para POS Cesariel

# Variables
DOCKER_COMPOSE = docker-compose
PROJECT_NAME = pos-cesariel

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

.PHONY: help build up down restart logs clean status

help: ## Mostrar ayuda
	@echo "$(GREEN)Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Construir todas las imágenes
	@echo "$(GREEN)Construyendo imágenes...$(NC)"
	$(DOCKER_COMPOSE) build

up: ## Levantar todos los servicios
	@echo "$(GREEN)Levantando servicios...$(NC)"
	$(DOCKER_COMPOSE) up -d

up-build: ## Construir y levantar todos los servicios
	@echo "$(GREEN)Construyendo y levantando servicios...$(NC)"
	$(DOCKER_COMPOSE) up -d --build

down: ## Parar todos los servicios
	@echo "$(YELLOW)Parando servicios...$(NC)"
	$(DOCKER_COMPOSE) down

restart: ## Reiniciar todos los servicios
	@echo "$(YELLOW)Reiniciando servicios...$(NC)"
	$(DOCKER_COMPOSE) restart

logs: ## Ver logs de todos los servicios
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## Ver logs del backend
	$(DOCKER_COMPOSE) logs -f backend

logs-frontend: ## Ver logs del frontend (POS Admin)
	$(DOCKER_COMPOSE) logs -f frontend

logs-ecommerce: ## Ver logs del e-commerce
	$(DOCKER_COMPOSE) logs -f ecommerce

logs-db: ## Ver logs de la base de datos
	$(DOCKER_COMPOSE) logs -f db

shell-backend: ## Acceder al shell del backend
	$(DOCKER_COMPOSE) exec backend bash

shell-frontend: ## Acceder al shell del frontend (POS Admin)
	$(DOCKER_COMPOSE) exec frontend sh

shell-ecommerce: ## Acceder al shell del e-commerce
	$(DOCKER_COMPOSE) exec ecommerce sh

shell-db: ## Acceder al shell de la base de datos
	$(DOCKER_COMPOSE) exec db psql -U postgres -d pos_cesariel

status: ## Ver estado de los servicios
	$(DOCKER_COMPOSE) ps

clean: ## Limpiar contenedores, imágenes y volúmenes
	@echo "$(RED)Limpiando contenedores, imágenes y volúmenes...$(NC)"
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans

clean-volumes: ## Limpiar solo volúmenes
	@echo "$(RED)Limpiando volúmenes...$(NC)"
	$(DOCKER_COMPOSE) down -v

dev: ## Levantar entorno de desarrollo completo
	@echo "$(GREEN)Levantando entorno de desarrollo...$(NC)"
	$(DOCKER_COMPOSE) up -d --build
	@echo "$(GREEN)Servicios disponibles:$(NC)"
	@echo "$(YELLOW)POS Admin:$(NC) http://localhost:3000"
	@echo "$(YELLOW)E-commerce:$(NC) http://localhost:3001"
	@echo "$(YELLOW)Backend:$(NC) http://localhost:8000"
	@echo "$(YELLOW)API Docs:$(NC) http://localhost:8000/docs"
	@echo "$(YELLOW)Adminer:$(NC) http://localhost:8080"
	@echo "$(YELLOW)Base de datos:$(NC) localhost:5432"

dev-pos: ## Levantar solo POS Admin y dependencias
	@echo "$(GREEN)Levantando POS Admin...$(NC)"
	$(DOCKER_COMPOSE) up -d --build db backend frontend
	@echo "$(GREEN)Servicios POS disponibles:$(NC)"
	@echo "$(YELLOW)POS Admin:$(NC) http://localhost:3000"
	@echo "$(YELLOW)Backend:$(NC) http://localhost:8000"

dev-ecommerce: ## Levantar solo E-commerce y dependencias
	@echo "$(GREEN)Levantando E-commerce...$(NC)"
	$(DOCKER_COMPOSE) up -d --build db backend ecommerce
	@echo "$(GREEN)Servicios E-commerce disponibles:$(NC)"
	@echo "$(YELLOW)E-commerce:$(NC) http://localhost:3001"
	@echo "$(YELLOW)Backend:$(NC) http://localhost:8000"
