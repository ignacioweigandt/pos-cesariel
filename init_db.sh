#!/bin/bash

# Script para inicializar la base de datos PostgreSQL en Railway
# Uso: railway run bash init_db.sh

set -e  # Salir si hay algún error

echo "════════════════════════════════════════════════════════"
echo "  Inicialización de Base de Datos - POS Cesariel"
echo "════════════════════════════════════════════════════════"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/init_data.py" ]; then
    echo "❌ Error: No se encuentra backend/init_data.py"
    echo "   Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

cd backend

echo "📊 [1/3] Inicializando datos esenciales..."
echo ""
python init_data.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Datos esenciales creados exitosamente"
    echo "   - Usuarios: admin, manager, seller"
    echo "   - Sucursales: Branch Central, Branch Norte, Branch Sur"
    echo "   - Categorías y productos iniciales"
else
    echo ""
    echo "⚠️  Advertencia: init_data.py falló o ya se había ejecutado antes"
fi

echo ""
echo "────────────────────────────────────────────────────────"
echo ""

echo "🛍️  [2/3] Inicializando contenido de e-commerce..."
echo ""
python init_content_data.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Contenido de e-commerce creado exitosamente"
    echo "   - Configuración de tienda"
    echo "   - Banners para homepage"
    echo "   - Redes sociales"
else
    echo ""
    echo "⚠️  Advertencia: init_content_data.py falló o ya se había ejecutado antes"
fi

echo ""
echo "────────────────────────────────────────────────────────"
echo ""

echo "⚽ [3/3] Cargando catálogo de productos deportivos..."
echo ""
python init_sportswear_data.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Catálogo deportivo cargado exitosamente"
    echo "   - Categorías deportivas"
    echo "   - Productos con tallas y stock"
else
    echo ""
    echo "⚠️  Advertencia: init_sportswear_data.py falló o ya se había ejecutado antes"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Inicialización completada"
echo ""
echo "Credenciales de prueba:"
echo "  • Admin:   admin / admin123"
echo "  • Manager: manager / manager123"
echo "  • Seller:  seller / seller123"
echo ""
echo "Próximos pasos:"
echo "  1. Verifica el backend: curl https://pos-cesariel-production.up.railway.app/health"
echo "  2. Prueba el login desde el frontend POS"
echo "  3. Verifica productos en e-commerce"
echo "════════════════════════════════════════════════════════"
