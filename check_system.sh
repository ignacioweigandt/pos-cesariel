#!/bin/bash

echo "🔍 Verificando estado del sistema POS Cesariel..."

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar servicios
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "✅ $service_name: ${GREEN}Funcionando${NC} (HTTP $response)"
        return 0
    else
        echo -e "❌ $service_name: ${RED}Error${NC} (HTTP $response)"
        return 1
    fi
}

# Verificar contenedores Docker
echo ""
echo "📦 Estado de contenedores Docker:"
docker-compose ps --format "table {{.Service}}\t{{.State}}\t{{.Ports}}" 2>/dev/null

echo ""
echo "🌐 Verificando servicios web:"

# Verificar servicios
check_service "Frontend (Next.js)" "http://localhost:3000" "200"
check_service "Backend API" "http://localhost:8000" "200"
check_service "API Docs" "http://localhost:8000/docs" "200"
check_service "Adminer (DB Admin)" "http://localhost:8080" "200"

echo ""
echo "🔍 Verificando funcionalidades específicas:"

# Verificar health check
health_response=$(curl -s http://localhost:8000/health)
if echo "$health_response" | grep -q "healthy"; then
    echo -e "✅ Health Check: ${GREEN}Saludable${NC}"
else
    echo -e "❌ Health Check: ${RED}Error${NC}"
fi

# Verificar conexión DB
db_response=$(curl -s http://localhost:8000/db-test)
if echo "$db_response" | grep -q "ok"; then
    echo -e "✅ Base de Datos: ${GREEN}Conectada${NC}"
else
    echo -e "❌ Base de Datos: ${RED}Error de conexión${NC}"
fi

# Verificar autenticación
auth_response=$(curl -s -X POST "http://localhost:8000/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

if echo "$auth_response" | grep -q "access_token"; then
    echo -e "✅ Autenticación: ${GREEN}Funcionando${NC}"
else
    echo -e "❌ Autenticación: ${RED}Error${NC}"
fi

echo ""
echo "🔗 URLs disponibles:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8000"
echo "   • Documentación API: http://localhost:8000/docs"
echo "   • Adminer (DB): http://localhost:8080"

echo ""
echo "🔑 Usuarios de prueba:"
echo "   • Admin: admin / admin123"
echo "   • Gerente: manager / manager123"
echo "   • Vendedor: seller / seller123"

echo ""
echo "📊 Comandos útiles:"
echo "   • Ver logs: make logs"
echo "   • Detener: make down"
echo "   • Reiniciar: make restart"

echo ""
echo -e "${GREEN}🎉 Sistema POS Cesariel completamente operativo!${NC}"