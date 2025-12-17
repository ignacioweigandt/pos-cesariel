#!/bin/bash

# Script de verificación para Railway deployment

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Railway Deployment Verification           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 ${RED}(NO ENCONTRADO)${NC}"
        return 1
    fi
}

echo -e "${YELLOW}Verificando archivos necesarios...${NC}"
echo ""

# Backend
echo -e "${BLUE}📦 Backend:${NC}"
check_file "backend/Dockerfile.production"
check_file "backend/railway.json"
check_file "backend/requirements.txt"
echo ""

# Frontend POS
echo -e "${BLUE}📦 Frontend POS:${NC}"
check_file "frontend/pos-cesariel/Dockerfile.production"
check_file "frontend/pos-cesariel/railway.json"
check_file "frontend/pos-cesariel/package.json"
check_file "frontend/pos-cesariel/next.config.js"
echo ""

# E-commerce
echo -e "${BLUE}📦 E-commerce:${NC}"
check_file "ecommerce/Dockerfile.production"
check_file "ecommerce/railway.json"
check_file "ecommerce/package.json"
check_file "ecommerce/next.config.mjs"
echo ""

# Verificar que los Dockerfiles tienen contenido
echo -e "${YELLOW}Verificando contenido de Dockerfiles...${NC}"
echo ""

for dockerfile in "backend/Dockerfile.production" "frontend/pos-cesariel/Dockerfile.production" "ecommerce/Dockerfile.production"; do
    if [ -f "$dockerfile" ]; then
        lines=$(wc -l < "$dockerfile" | tr -d ' ')
        if [ "$lines" -gt 10 ]; then
            echo -e "${GREEN}✅${NC} $dockerfile (${lines} líneas)"
        else
            echo -e "${YELLOW}⚠️${NC} $dockerfile (solo ${lines} líneas - parece incompleto)"
        fi
    fi
done
echo ""

# Verificar railway.json
echo -e "${YELLOW}Verificando configuración de Railway...${NC}"
echo ""

echo -e "${BLUE}Frontend POS railway.json:${NC}"
cat frontend/pos-cesariel/railway.json
echo ""

# Mostrar configuración correcta
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${GREEN}Configuración correcta para Railway:${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}Backend:${NC}"
echo "  Root Directory: backend"
echo "  Dockerfile Path: Dockerfile.production"
echo ""

echo -e "${BLUE}Frontend POS:${NC}"
echo "  Root Directory: frontend/pos-cesariel"
echo "  Dockerfile Path: Dockerfile.production"
echo ""

echo -e "${BLUE}E-commerce:${NC}"
echo "  Root Directory: ecommerce"
echo "  Dockerfile Path: Dockerfile.production"
echo ""

# Verificar Git
echo -e "${YELLOW}Verificando Git status...${NC}"
echo ""

if git status &> /dev/null; then
    echo -e "${GREEN}✅${NC} Repositorio Git inicializado"

    # Verificar si hay cambios sin commit
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️${NC} Hay cambios sin commit:"
        git status --short
        echo ""
        echo -e "${YELLOW}Recuerda hacer commit y push antes de deployar en Railway:${NC}"
        echo "  git add ."
        echo "  git commit -m \"Add Railway configuration\""
        echo "  git push origin main"
    else
        echo -e "${GREEN}✅${NC} Todo está commiteado"

        # Verificar si está pusheado
        LOCAL=$(git rev-parse @)
        REMOTE=$(git rev-parse @{u} 2>/dev/null)

        if [ "$LOCAL" = "$REMOTE" ]; then
            echo -e "${GREEN}✅${NC} Código sincronizado con GitHub"
        else
            echo -e "${YELLOW}⚠️${NC} Hay commits locales sin push a GitHub"
            echo "  git push origin main"
        fi
    fi
else
    echo -e "${RED}❌${NC} No es un repositorio Git"
    echo "  Inicializa con: git init"
fi
echo ""

# Resumen
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo -e "${GREEN}Resumen:${NC}"
echo -e "${YELLOW}════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}1.${NC} Asegúrate que todo está pusheado a GitHub"
echo -e "${BLUE}2.${NC} En Railway, configura para cada servicio:"
echo ""
echo -e "   ${CYAN}Frontend POS:${NC}"
echo "     - Root Directory: ${GREEN}frontend/pos-cesariel${NC}"
echo "     - Dockerfile Path: ${GREEN}Dockerfile.production${NC}"
echo ""
echo -e "   ${CYAN}E-commerce:${NC}"
echo "     - Root Directory: ${GREEN}ecommerce${NC}"
echo "     - Dockerfile Path: ${GREEN}Dockerfile.production${NC}"
echo ""
echo -e "${BLUE}3.${NC} Verifica las variables de entorno en:"
echo "     railway-env-vars.txt"
echo ""
echo -e "${BLUE}4.${NC} Si sigue el error, consulta:"
echo "     RAILWAY_FRONTEND_FIX.md"
echo ""

echo -e "${GREEN}✨ Verificación completa!${NC}"
