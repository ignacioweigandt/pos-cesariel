#!/bin/bash

# Script para configurar el servicio frontend en Railway

echo "═══════════════════════════════════════════════════════"
echo "  Railway Frontend Setup - POS Cesariel"
echo "═══════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar que estamos en el directorio correcto
echo -e "${YELLOW}[1/6]${NC} Verificando directorio..."
if [ ! -d "frontend/pos-cesariel" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio raíz del proyecto${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Directorio correcto"
echo ""

# 2. Verificar conexión a Railway
echo -e "${YELLOW}[2/6]${NC} Verificando conexión a Railway..."
if ! railway status > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No estás conectado a Railway${NC}"
    echo "Ejecuta: railway link"
    exit 1
fi
echo -e "${GREEN}✓${NC} Conectado a Railway"
CURRENT_SERVICE=$(railway status | grep "Service:" | awk '{print $2}')
echo "   Servicio actual: $CURRENT_SERVICE"
echo ""

# 3. Preguntar nombre del servicio frontend
echo -e "${YELLOW}[3/6]${NC} Configuración del servicio frontend"
echo ""
echo "¿Cuál es el nombre del servicio frontend en Railway?"
echo "(Si no lo has creado aún, ve a Railway UI y crea un servicio nuevo)"
echo ""
echo "Nombres comunes:"
echo "  - frontend-pos"
echo "  - frontend"
echo "  - pos-frontend"
echo ""
read -p "Nombre del servicio frontend: " FRONTEND_SERVICE

if [ -z "$FRONTEND_SERVICE" ]; then
    echo -e "${RED}❌ Debes proporcionar un nombre de servicio${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[4/6]${NC} Cambiando al servicio: $FRONTEND_SERVICE"

# 4. Intentar cambiar al servicio frontend (esto debe hacerse manualmente por el usuario)
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC} Railway CLI no puede cambiar servicios automáticamente en este entorno."
echo ""
echo "Por favor, ejecuta manualmente en tu terminal:"
echo ""
echo -e "${GREEN}railway link --service $FRONTEND_SERVICE${NC}"
echo ""
read -p "Presiona ENTER cuando hayas ejecutado el comando anterior..."

# 5. Verificar que estamos en el servicio correcto
echo ""
echo -e "${YELLOW}[5/6]${NC} Verificando servicio..."
CURRENT_SERVICE=$(railway status | grep "Service:" | awk '{print $2}')
echo "Servicio actual: $CURRENT_SERVICE"

if [ "$CURRENT_SERVICE" != "$FRONTEND_SERVICE" ]; then
    echo -e "${YELLOW}⚠️  Advertencia:${NC} Parece que no estás en el servicio correcto"
    echo "Servicio esperado: $FRONTEND_SERVICE"
    echo "Servicio actual: $CURRENT_SERVICE"
    echo ""
    read -p "¿Deseas continuar de todas formas? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 6. Obtener URL del backend
echo ""
echo -e "${YELLOW}[6/6]${NC} Configurando variables de entorno"
echo ""
echo "Necesito la URL de tu backend en Railway."
echo "Debería verse como: https://pos-cesariel-production.up.railway.app"
echo ""
read -p "URL del backend: " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Debes proporcionar la URL del backend${NC}"
    exit 1
fi

# Verificar formato de URL
if [[ ! $BACKEND_URL =~ ^https?:// ]]; then
    echo -e "${RED}❌ La URL debe comenzar con http:// o https://${NC}"
    exit 1
fi

# 7. Configurar variables
echo ""
echo "Configurando variables de entorno..."
echo ""

# Generar comandos para que el usuario ejecute
echo -e "${GREEN}Ejecuta estos comandos uno por uno:${NC}"
echo ""
echo "# Cambiar al servicio frontend (si no lo has hecho)"
echo "railway link --service $FRONTEND_SERVICE"
echo ""
echo "# Configurar variables de entorno"
echo "railway variables --set NEXT_PUBLIC_API_URL=$BACKEND_URL"
echo "railway variables --set PORT=3000"
echo "railway variables --set NODE_ENV=production"
echo "railway variables --set NEXT_TELEMETRY_DISABLED=1"
echo ""
echo "# Configurar el builder (MUY IMPORTANTE)"
echo "railway up --service $FRONTEND_SERVICE --detach"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Después de ejecutar estos comandos:${NC}"
echo "1. Ve a Railway UI → Tu servicio frontend"
echo "2. Settings → Build"
echo "3. Cambia Builder a 'Dockerfile'"
echo "4. Dockerfile Path: 'Dockerfile.production'"
echo "5. Settings → Source"
echo "6. Root Directory: 'frontend/pos-cesariel'"
echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Script completado${NC}"
echo ""
echo "Consulta RAILWAY_QUICK_FIX.md para más detalles"
echo "═══════════════════════════════════════════════════════"
