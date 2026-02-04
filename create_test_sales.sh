#!/bin/bash
# Script para crear ventas de prueba con diferentes características
# para testear los filtros avanzados

API_URL="http://localhost:8000"

# Login como admin
echo "🔐 Obteniendo token de autenticación..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=admin&password=admin123' | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo "✅ Token obtenido"

# Obtener productos disponibles
echo "📦 Obteniendo productos disponibles..."
PRODUCTS=$(curl -s "$API_URL/products/" -H "Authorization: Bearer $TOKEN")
PRODUCT_1=$(echo $PRODUCTS | jq -r '.[0].id')
PRODUCT_2=$(echo $PRODUCTS | jq -r '.[1].id')
PRODUCT_3=$(echo $PRODUCTS | jq -r '.[2].id')
PRODUCT_4=$(echo $PRODUCTS | jq -r '.[3].id')

echo "✅ Productos encontrados: $PRODUCT_1, $PRODUCT_2, $PRODUCT_3, $PRODUCT_4"

# Función para crear una venta
create_sale() {
  local CUSTOMER_NAME=$1
  local PAYMENT_METHOD=$2
  local SALE_TYPE=$3
  local PRODUCT_ID=$4
  local QUANTITY=$5
  local PRICE=$6
  
  echo "📝 Creando venta: $CUSTOMER_NAME - $PAYMENT_METHOD - $$PRICE"
  
  curl -s -X POST "$API_URL/sales/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"customer_name\": \"$CUSTOMER_NAME\",
      \"payment_method\": \"$PAYMENT_METHOD\",
      \"sale_type\": \"$SALE_TYPE\",
      \"items\": [{
        \"product_id\": $PRODUCT_ID,
        \"quantity\": $QUANTITY,
        \"unit_price\": $PRICE
      }]
    }" > /dev/null
}

echo ""
echo "🛒 Creando ventas de prueba..."
echo ""

# Ventas variadas para testear todos los filtros
# Formato: create_sale "Cliente" "Método Pago" "Tipo" ProductID Cantidad Precio

# Ventas con diferentes métodos de pago
create_sale "Juan Pérez" "Efectivo" "POS" $PRODUCT_1 2 15000.00
create_sale "María González" "Tarjeta de Crédito" "POS" $PRODUCT_2 1 25000.00
create_sale "Carlos López" "Tarjeta de Débito" "POS" $PRODUCT_3 3 8500.00
create_sale "Ana Martínez" "Transferencia" "POS" $PRODUCT_4 1 45000.00
create_sale "Pedro Rodríguez" "MercadoPago" "POS" $PRODUCT_1 2 12000.00

# Ventas E-commerce
create_sale "Laura Fernández" "Tarjeta de Crédito" "ECOMMERCE" $PRODUCT_2 1 32000.00
create_sale "Diego Silva" "MercadoPago" "ECOMMERCE" $PRODUCT_3 2 18000.00
create_sale "Sofía Romero" "Transferencia" "ECOMMERCE" $PRODUCT_4 1 55000.00

# Ventas con diferentes montos (para testear filtro de rango)
create_sale "Cliente A" "Efectivo" "POS" $PRODUCT_1 1 5000.00    # Monto bajo
create_sale "Cliente B" "Efectivo" "POS" $PRODUCT_2 2 20000.00   # Monto medio
create_sale "Cliente C" "Efectivo" "POS" $PRODUCT_3 5 50000.00   # Monto alto
create_sale "Cliente D" "Efectivo" "POS" $PRODUCT_4 10 100000.00 # Monto muy alto

# Ventas para testear búsqueda de texto
create_sale "TEST-SEARCH-001" "Efectivo" "POS" $PRODUCT_1 1 10000.00
create_sale "Prueba Busqueda" "Efectivo" "POS" $PRODUCT_2 1 15000.00

echo ""
echo "✅ ¡Ventas de prueba creadas exitosamente!"
echo ""
echo "📊 Ahora podés testear los siguientes filtros en http://localhost:3000/reports (tab Ventas):"
echo ""
echo "   1️⃣  Búsqueda de texto:"
echo "      - Buscá 'TEST-SEARCH' → debería encontrar 1 venta"
echo "      - Buscá 'Juan' → debería encontrar ventas de Juan Pérez"
echo "      - Buscá 'Prueba' → debería encontrar 1 venta"
echo ""
echo "   2️⃣  Filtro por tipo de venta:"
echo "      - POS → ~11 ventas"
echo "      - ECOMMERCE → ~3 ventas"
echo ""
echo "   3️⃣  Filtro por método de pago:"
echo "      - Efectivo → ~7 ventas"
echo "      - Tarjeta de Crédito → ~2 ventas"
echo "      - MercadoPago → ~2 ventas"
echo ""
echo "   4️⃣  Filtro por rango de monto:"
echo "      - Mínimo: 20000, Máximo: 60000 → debería filtrar ventas en ese rango"
echo "      - Mínimo: 50000 → solo ventas grandes"
echo ""
echo "   5️⃣  Combinación de filtros:"
echo "      - Tipo: POS + Pago: Efectivo + Búsqueda: 'Cliente'"
echo ""
echo "   6️⃣  Debounce de búsqueda:"
echo "      - Escribí rápido en la búsqueda → debería esperar 500ms antes de buscar"
echo ""
