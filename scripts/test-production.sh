#!/bin/bash

# Script para testear performance de producción
# Uso: ./scripts/test-production.sh [start|stop|rebuild|logs]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

case "${1:-start}" in
  start)
    echo "🚀 Iniciando modo PRODUCCIÓN..."
    echo ""
    echo "⚠️  IMPORTANTE: Esto va a:"
    echo "   1. Construir builds de producción (puede tardar 5-10 min)"
    echo "   2. Levantar servicios optimizados"
    echo "   3. Sin hot reload (hay que rebuild para ver cambios)"
    echo ""
    read -p "¿Continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "❌ Cancelado"
      exit 1
    fi
    
    echo ""
    echo "🏗️  Building producción..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    
    echo ""
    echo "🚀 Iniciando servicios..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    echo ""
    echo "✅ Servicios en modo PRODUCCIÓN corriendo:"
    echo "   - Frontend POS: http://localhost:3000"
    echo "   - E-commerce:   http://localhost:3001"
    echo "   - Backend API:  http://localhost:8000"
    echo ""
    echo "💡 Testeá la velocidad real de navegación"
    echo ""
    echo "Para ver logs: ./scripts/test-production.sh logs"
    echo "Para detener:  ./scripts/test-production.sh stop"
    ;;
    
  stop)
    echo "🛑 Deteniendo modo producción..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    echo "✅ Servicios detenidos"
    echo ""
    echo "Para volver a desarrollo:"
    echo "  docker-compose up -d"
    ;;
    
  rebuild)
    echo "🔨 Reconstruyendo builds de producción..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    echo "✅ Rebuild completo"
    ;;
    
  logs)
    echo "📋 Logs de producción (Ctrl+C para salir)..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
    ;;
    
  *)
    echo "Uso: $0 [start|stop|rebuild|logs]"
    echo ""
    echo "Comandos:"
    echo "  start   - Inicia modo producción (build + start)"
    echo "  stop    - Detiene modo producción"
    echo "  rebuild - Reconstruye y reinicia"
    echo "  logs    - Muestra logs en tiempo real"
    exit 1
    ;;
esac
