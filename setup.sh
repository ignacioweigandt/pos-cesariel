#!/bin/bash

echo "🚀 Iniciando configuración de POS Cesariel..."

# Crear directorio de scripts si no existe
mkdir -p scripts

# Función para mostrar mensajes con colores
show_message() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

show_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

show_info() {
    echo -e "\033[1;34mℹ️  $1\033[0m"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    show_error "Docker no está instalado. Por favor instala Docker Desktop primero."
    exit 1
fi

# Verificar que Docker Compose esté disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    show_error "Docker Compose no está disponible. Por favor verifica tu instalación de Docker."
    exit 1
fi

show_info "Deteniendo contenedores existentes..."
make down 2>/dev/null || true

show_info "Construyendo contenedores..."
if docker-compose build; then
    show_message "Contenedores construidos exitosamente"
else
    show_error "Error al construir contenedores"
    exit 1
fi

show_info "Iniciando servicios..."
if docker-compose up -d; then
    show_message "Servicios iniciados exitosamente"
else
    show_error "Error al iniciar servicios"
    exit 1
fi

show_info "Esperando que los servicios estén listos..."
sleep 10

show_info "Instalando dependencias del frontend..."
if docker-compose exec frontend npm install; then
    show_message "Dependencias del frontend instaladas"
else
    show_error "Error al instalar dependencias del frontend"
fi

show_info "Instalando dependencias del backend..."
if docker-compose exec backend pip install -r requirements.txt; then
    show_message "Dependencias del backend instaladas"
else
    show_error "Error al instalar dependencias del backend"
fi

show_info "Inicializando datos de prueba..."
if docker-compose exec backend python init_data.py; then
    show_message "Datos de prueba inicializados exitosamente"
else
    show_error "Error al inicializar datos de prueba"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Información del sistema:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8000"
echo "   • Documentación API: http://localhost:8000/docs"
echo "   • Base de datos (Adminer): http://localhost:8080"
echo ""
echo "🔑 Usuarios de prueba:"
echo "   • Admin: admin / admin123"
echo "   • Gerente: manager / manager123"
echo "   • Vendedor: seller / seller123"
echo ""
echo "📊 Comandos útiles:"
echo "   • Ver logs: make logs"
echo "   • Detener servicios: make down"
echo "   • Reiniciar: make restart"
echo "   • Ver todos los comandos: make help"
echo ""
show_message "¡El sistema está listo para usar!"