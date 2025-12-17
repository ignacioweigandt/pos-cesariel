#!/bin/bash

# Script para desplegar el frontend en Railway
# Uso: ./deploy-frontend.sh <BACKEND_URL>

set -e  # Salir si hay algún error

echo "═══════════════════════════════════════════════════════"
echo "  Railway Frontend Deploy - POS Cesariel"
echo "═══════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI no está instalado${NC}"
    echo "Instala con: npm i -g @railway/cli"
    exit 1
fi

# Verificar que estamos conectados
if ! railway status &> /dev/null; then
    echo -e "${RED}❌ No estás conectado a Railway${NC}"
    echo "Ejecuta: railway link"
    exit 1
fi

# Verificar servicio actual
CURRENT_SERVICE=$(railway status | grep "Service:" | awk '{print $2}')
echo -e "${BLUE}Servicio actual:${NC} $CURRENT_SERVICE"

if [ "$CURRENT_SERVICE" != "frontend-pos" ]; then
    echo -e "${RED}❌ Error: No estás en el servicio frontend-pos${NC}"
    echo "Servicio actual: $CURRENT_SERVICE"
    echo ""
    echo "Para cambiar de servicio, ejecuta manualmente:"
    echo "  railway link"
    echo "  Luego selecciona: frontend-pos"
    exit 1
fi

echo -e "${GREEN}✓${NC} Servicio correcto: frontend-pos"
echo ""

# Obtener URL del backend
BACKEND_URL="$1"

if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Necesito la URL de tu backend en Railway${NC}"
    echo ""
    echo "Para obtenerla:"
    echo "  1. Ve a https://railway.app"
    echo "  2. Abre tu proyecto 'charming-insight'"
    echo "  3. Selecciona el servicio 'pos-cesariel' (backend)"
    echo "  4. Ve a 'Settings' → 'Networking'"
    echo "  5. Copia el dominio público"
    echo ""
    echo -e "${BLUE}Ejemplo:${NC} https://pos-cesariel-production.up.railway.app"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
    echo ""
    read -p "Ingresa la URL del backend: " BACKEND_URL
fi

# Validar URL
if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Debes proporcionar la URL del backend${NC}"
    exit 1
fi

if [[ ! $BACKEND_URL =~ ^https?:// ]]; then
    echo -e "${RED}❌ La URL debe comenzar con http:// o https://${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓${NC} URL del backend: $BACKEND_URL"
echo ""

# Configurar variables de entorno
echo -e "${YELLOW}[1/4]${NC} Configurando variables de entorno..."
echo ""

echo "  → NEXT_PUBLIC_API_URL=$BACKEND_URL"
railway variables --set NEXT_PUBLIC_API_URL="$BACKEND_URL"

echo "  → PORT=3000"
railway variables --set PORT=3000

echo "  → NODE_ENV=production"
railway variables --set NODE_ENV=production

echo "  → NEXT_TELEMETRY_DISABLED=1"
railway variables --set NEXT_TELEMETRY_DISABLED=1

echo ""
echo -e "${GREEN}✓${NC} Variables configuradas"
echo ""

# Verificar variables
echo -e "${YELLOW}[2/4]${NC} Verificando variables..."
echo ""
railway variables | grep -E "NEXT_PUBLIC_API_URL|PORT|NODE_ENV|NEXT_TELEMETRY_DISABLED" || echo "Variables configuradas correctamente"
echo ""

# Hacer push de cambios a Git
echo -e "${YELLOW}[3/4]${NC} Verificando cambios en Git..."
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
    echo ""
    git status --short
    echo ""
    read -p "¿Deseas hacer commit y push ahora? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "feat: configure frontend for Railway deployment"
        git push origin main
        echo -e "${GREEN}✓${NC} Cambios pusheados a Git"
    else
        echo -e "${YELLOW}⚠️  Recuerda hacer push antes de hacer deploy${NC}"
    fi
else
    echo -e "${GREEN}✓${NC} No hay cambios pendientes"
fi
echo ""

# Instrucciones para configurar Builder
echo -e "${YELLOW}[4/4]${NC} Configuración del Builder"
echo ""
echo -e "${RED}⚠️  IMPORTANTE - CONFIGURACIÓN MANUAL REQUERIDA${NC}"
echo ""
echo "Railway CLI no puede configurar el Builder automáticamente."
echo "Debes hacer esto manualmente en Railway UI:"
echo ""
echo -e "${BLUE}1. Ve a https://railway.app${NC}"
echo -e "${BLUE}2. Proyecto: charming-insight${NC}"
echo -e "${BLUE}3. Servicio: frontend-pos${NC}"
echo ""
echo -e "${YELLOW}4. Settings → Source:${NC}"
echo "   - Root Directory: frontend/pos-cesariel"
echo ""
echo -e "${YELLOW}5. Settings → Build:${NC}"
echo "   - Builder: Dockerfile"
echo "   - Dockerfile Path: Dockerfile.production"
echo ""
echo -e "${RED}⚠️  SIN ESTO, EL DEPLOY FALLARÁ CON RAILPACK ERROR${NC}"
echo ""
read -p "Presiona ENTER cuando hayas configurado el Builder en Railway UI..."

echo ""
echo -e "${YELLOW}Iniciando deploy...${NC}"
echo ""

# Deploy
railway up --detach

echo ""
echo -e "${GREEN}✓${NC} Deploy iniciado"
echo ""

# Mostrar logs
echo -e "${BLUE}Ver logs en tiempo real:${NC}"
echo "  railway logs"
echo ""

echo -e "${BLUE}Ver estado:${NC}"
echo "  railway status"
echo ""

echo -e "${BLUE}Obtener dominio:${NC}"
echo "  railway domain"
echo ""

echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Configuración completada${NC}"
echo ""
echo "Verifica que el build use Dockerfile (no Railpack):"
echo "  railway logs"
echo ""
echo "Busca en los logs:"
echo -e "  ${GREEN}✓${NC} 'using dockerfile builder' = CORRECTO"
echo -e "  ${RED}✗${NC} 'using build driver railpack' = ERROR"
echo ""
echo "Si ves Railpack, vuelve a configurar el Builder en UI"
echo "═══════════════════════════════════════════════════════"
