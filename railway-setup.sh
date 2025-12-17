#!/bin/bash

# ==================================
# Railway Setup Helper
# ==================================
# Este script ayuda a generar las variables de entorno necesarias para Railway

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}=====================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================${NC}\n"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
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

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║                                               ║
║     Railway Deployment Helper                 ║
║     POS Cesariel                              ║
║                                               ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_header "GENERACIÓN DE VARIABLES DE ENTORNO"

# Generar SECRET_KEY
print_info "Generando SECRET_KEY segura..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32)
print_success "SECRET_KEY generada"

# Crear archivo con las variables
OUTPUT_FILE="railway-env-vars.txt"

print_info "Creando archivo de variables: $OUTPUT_FILE"

cat > "$OUTPUT_FILE" << EOF
# ==================================
# VARIABLES DE ENTORNO PARA RAILWAY
# ==================================
# Generado: $(date)
#
# Instrucciones:
# 1. Ve a tu proyecto en Railway
# 2. Para cada servicio, copia las variables correspondientes
# 3. Pega en Variables → Raw Editor

# ==================================
# BACKEND SERVICE
# ==================================
# Variables para el servicio Backend (FastAPI)

DATABASE_URL=\${{postgres.DATABASE_URL}}
SECRET_KEY=$SECRET_KEY
CLOUDINARY_CLOUD_NAME=dgnflxfgh
CLOUDINARY_API_KEY=699583869153912
CLOUDINARY_API_SECRET=t9aXNi4rXvr8JGQmL9m0YMM8piU
ENVIRONMENT=production

# ==================================
# FRONTEND POS SERVICE
# ==================================
# Variables para el servicio Frontend POS (Next.js)
# IMPORTANTE: Reemplaza <BACKEND_DOMAIN> con el dominio real de tu backend

NEXT_PUBLIC_API_URL=https://<BACKEND_DOMAIN>
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# ==================================
# E-COMMERCE SERVICE
# ==================================
# Variables para el servicio E-commerce (Next.js)
# IMPORTANTE: Reemplaza <BACKEND_DOMAIN> con el dominio real de tu backend

NEXT_PUBLIC_API_URL=https://<BACKEND_DOMAIN>
API_URL=https://<BACKEND_DOMAIN>
PORT=3001
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# ==================================
# NOTAS IMPORTANTES
# ==================================
#
# 1. DATABASE_URL:
#    - Usa la referencia \${{postgres.DATABASE_URL}}
#    - Railway la resolverá automáticamente
#
# 2. BACKEND_DOMAIN:
#    - Después de desplegar el backend, copia su dominio
#    - Actualiza las variables del frontend y e-commerce
#    - Formato: nombre-servicio.up.railway.app
#
# 3. SECRET_KEY:
#    - Ya fue generada automáticamente
#    - NO la compartas públicamente
#    - Guárdala en un lugar seguro
#
# 4. Cloudinary:
#    - Las credenciales actuales son del ambiente de desarrollo
#    - Para producción, considera usar credenciales diferentes
#
# 5. Para actualizar variables:
#    - Ve a Settings → Variables en Railway
#    - Puedes usar "Raw Editor" para pegar múltiples variables
#    - O agregar una por una usando "+ New Variable"
EOF

print_success "Archivo creado: $OUTPUT_FILE"

# Mostrar las variables
print_header "VARIABLES GENERADAS"

echo -e "${CYAN}Backend Variables:${NC}"
echo -e "${GREEN}DATABASE_URL${NC}=\${{postgres.DATABASE_URL}}"
echo -e "${GREEN}SECRET_KEY${NC}=$SECRET_KEY"
echo -e "${GREEN}CLOUDINARY_CLOUD_NAME${NC}=dgnflxfgh"
echo -e "${GREEN}CLOUDINARY_API_KEY${NC}=699583869153912"
echo -e "${GREEN}CLOUDINARY_API_SECRET${NC}=t9aXNi4rXvr8JGQmL9m0YMM8piU"
echo -e "${GREEN}ENVIRONMENT${NC}=production"

echo ""
echo -e "${CYAN}Frontend POS Variables:${NC}"
echo -e "${YELLOW}NEXT_PUBLIC_API_URL${NC}=https://<BACKEND_DOMAIN> ${RED}(CAMBIAR)${NC}"
echo -e "${GREEN}PORT${NC}=3000"
echo -e "${GREEN}NODE_ENV${NC}=production"
echo -e "${GREEN}NEXT_TELEMETRY_DISABLED${NC}=1"

echo ""
echo -e "${CYAN}E-commerce Variables:${NC}"
echo -e "${YELLOW}NEXT_PUBLIC_API_URL${NC}=https://<BACKEND_DOMAIN> ${RED}(CAMBIAR)${NC}"
echo -e "${YELLOW}API_URL${NC}=https://<BACKEND_DOMAIN> ${RED}(CAMBIAR)${NC}"
echo -e "${GREEN}PORT${NC}=3001"
echo -e "${GREEN}NODE_ENV${NC}=production"
echo -e "${GREEN}NEXT_TELEMETRY_DISABLED${NC}=1"

# Información adicional
print_header "PRÓXIMOS PASOS"

echo -e "${CYAN}1.${NC} Sube tu código a GitHub:"
echo -e "   ${GREEN}git add .${NC}"
echo -e "   ${GREEN}git commit -m \"Add Railway configuration\"${NC}"
echo -e "   ${GREEN}git push origin main${NC}"
echo ""

echo -e "${CYAN}2.${NC} Crea un nuevo proyecto en Railway:"
echo -e "   ${GREEN}https://railway.app${NC}"
echo ""

echo -e "${CYAN}3.${NC} Agrega PostgreSQL:"
echo -e "   ${GREEN}+ New → Database → Add PostgreSQL${NC}"
echo ""

echo -e "${CYAN}4.${NC} Despliega Backend:"
echo -e "   ${GREEN}+ New → GitHub Repo → Selecciona tu repo${NC}"
echo -e "   ${GREEN}Settings → Root Directory → backend${NC}"
echo -e "   ${GREEN}Variables → Pega las variables del Backend${NC}"
echo ""

echo -e "${CYAN}5.${NC} Copia el dominio del Backend:"
echo -e "   ${GREEN}Settings → Networking → Generate Domain${NC}"
echo ""

echo -e "${CYAN}6.${NC} Despliega Frontend POS y E-commerce:"
echo -e "   ${GREEN}Repite el proceso para cada uno${NC}"
echo -e "   ${GREEN}Actualiza <BACKEND_DOMAIN> con el dominio real${NC}"
echo ""

echo -e "${CYAN}7.${NC} Inicializa la base de datos:"
echo -e "   ${GREEN}Sigue las instrucciones en RAILWAY_DEPLOYMENT.md${NC}"
echo ""

print_header "ARCHIVOS CREADOS"

echo -e "${GREEN}✅${NC} railway.json (raíz)"
echo -e "${GREEN}✅${NC} backend/railway.json"
echo -e "${GREEN}✅${NC} frontend/pos-cesariel/railway.json"
echo -e "${GREEN}✅${NC} ecommerce/railway.json"
echo -e "${GREEN}✅${NC} RAILWAY_DEPLOYMENT.md (guía completa)"
echo -e "${GREEN}✅${NC} $OUTPUT_FILE (variables de entorno)"

print_header "RECURSOS"

echo -e "${CYAN}📖 Documentación:${NC} RAILWAY_DEPLOYMENT.md"
echo -e "${CYAN}🔑 Variables:${NC} $OUTPUT_FILE"
echo -e "${CYAN}🌐 Railway:${NC} https://railway.app"
echo -e "${CYAN}📚 Railway Docs:${NC} https://docs.railway.app"

print_success "Setup completado!"
echo ""
print_warning "IMPORTANTE: Revisa $OUTPUT_FILE y actualiza <BACKEND_DOMAIN>"
echo ""
