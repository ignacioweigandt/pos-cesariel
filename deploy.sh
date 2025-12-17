#!/bin/bash

# ==================================
# Script de Deployment para POS Cesariel
# ==================================
# Este script automatiza el proceso de deployment a producción

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones auxiliares
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}\n"
}

# Verificar que existe .env.production
check_env_file() {
    if [ ! -f .env.production ]; then
        print_error "No se encontró el archivo .env.production"
        print_info "Copia .env.production.example a .env.production y configúralo"
        print_info "cp .env.production.example .env.production"
        exit 1
    fi
    print_success "Archivo .env.production encontrado"
}

# Verificar que Docker está corriendo
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker no está corriendo"
        print_info "Inicia Docker Desktop e intenta nuevamente"
        exit 1
    fi
    print_success "Docker está corriendo"
}

# Crear backup de la base de datos
backup_database() {
    print_header "BACKUP DE BASE DE DATOS"

    if docker compose ps | grep -q "pos-cesariel-db-prod"; then
        print_info "Creando backup de la base de datos actual..."
        mkdir -p backups
        BACKUP_FILE="backups/pre-deploy-backup-$(date +%Y%m%d_%H%M%S).sql"

        if docker compose -f docker-compose.production.yml exec -T db pg_dump -U postgres pos_cesariel > "$BACKUP_FILE" 2>/dev/null; then
            print_success "Backup creado: $BACKUP_FILE"
        else
            print_warning "No se pudo crear el backup (la BD puede no estar corriendo)"
        fi
    else
        print_info "No hay base de datos corriendo, saltando backup"
    fi
}

# Construir imágenes
build_images() {
    print_header "CONSTRUCCIÓN DE IMÁGENES"

    print_info "Construyendo imágenes de producción..."
    docker compose -f docker-compose.production.yml build --no-cache

    print_success "Imágenes construidas correctamente"
}

# Detener servicios antiguos
stop_old_services() {
    print_header "DETENIENDO SERVICIOS ANTIGUOS"

    if docker compose -f docker-compose.production.yml ps | grep -q "Up"; then
        print_info "Deteniendo servicios en ejecución..."
        docker compose -f docker-compose.production.yml down
        print_success "Servicios detenidos"
    else
        print_info "No hay servicios corriendo"
    fi
}

# Iniciar servicios
start_services() {
    print_header "INICIANDO SERVICIOS"

    print_info "Levantando servicios de producción..."
    docker compose -f docker-compose.production.yml --env-file .env.production up -d

    print_success "Servicios iniciados"
}

# Verificar salud de servicios
check_health() {
    print_header "VERIFICACIÓN DE SERVICIOS"

    print_info "Esperando que los servicios estén listos (30 segundos)..."
    sleep 30

    # Verificar backend
    if docker compose -f docker-compose.production.yml exec backend curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend: OK"
    else
        print_error "Backend: FALLO"
    fi

    # Verificar frontend
    if docker compose -f docker-compose.production.yml exec frontend node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" > /dev/null 2>&1; then
        print_success "Frontend POS: OK"
    else
        print_error "Frontend POS: FALLO"
    fi

    # Verificar e-commerce
    if docker compose -f docker-compose.production.yml exec ecommerce node -e "require('http').get('http://localhost:3001/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" > /dev/null 2>&1; then
        print_success "E-commerce: OK"
    else
        print_error "E-commerce: FALLO"
    fi
}

# Mostrar logs
show_logs() {
    print_header "LOGS RECIENTES"

    print_info "Últimas líneas de logs:"
    docker compose -f docker-compose.production.yml logs --tail=20
}

# Mostrar estado final
show_status() {
    print_header "ESTADO DEL DEPLOYMENT"

    docker compose -f docker-compose.production.yml ps

    echo ""
    print_success "Deployment completado exitosamente"
    echo ""
    print_info "Servicios disponibles:"
    echo "  📍 Backend API: http://localhost:8000"
    echo "  📍 POS Admin: http://localhost:3000"
    echo "  📍 E-commerce: http://localhost:3001"
    echo ""
    print_info "Comandos útiles:"
    echo "  Ver logs: docker compose -f docker-compose.production.yml logs -f"
    echo "  Ver estado: docker compose -f docker-compose.production.yml ps"
    echo "  Detener: docker compose -f docker-compose.production.yml down"
    echo ""
}

# Función principal
main() {
    print_header "🚀 DEPLOYMENT A PRODUCCIÓN - POS CESARIEL"

    # Verificaciones previas
    print_info "Realizando verificaciones previas..."
    check_docker
    check_env_file

    # Confirmar deployment
    echo ""
    print_warning "Estás a punto de hacer un deployment a producción"
    read -p "¿Deseas continuar? [y/N] " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelado"
        exit 0
    fi

    # Proceso de deployment
    backup_database
    build_images
    stop_old_services
    start_services
    check_health
    show_logs
    show_status
}

# Ejecutar script
main "$@"
