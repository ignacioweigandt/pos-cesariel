#!/bin/bash

# Script de pruebas automatizadas para Custom Installments API
# Autor: Claude Code
# Fecha: 2025-10-04

echo "=========================================="
echo "🧪 TEST SUITE - CUSTOM INSTALLMENTS API"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Función para registrar test
test_result() {
    local test_name=$1
    local result=$2

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "📋 Paso 1: Obtener token de autenticación"
echo "----------------------------------------"

TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8000/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ ERROR: No se pudo obtener token de autenticación${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Token obtenido correctamente${NC}"
    echo "Token: ${TOKEN:0:50}..."
fi

echo ""
echo "📋 Paso 2: Tests de endpoints GET"
echo "----------------------------------------"

# Test 1: GET all custom installments
echo "Test 1: GET /config/custom-installments (todos)"
RESPONSE=$(curl -s -X GET "http://localhost:8000/config/custom-installments" \
  -H "Authorization: Bearer $TOKEN")
COUNT=$(echo $RESPONSE | grep -o '"id":' | wc -l)

if [ $COUNT -ge 8 ]; then
    test_result "GET todos los planes (esperado ≥8, obtenido $COUNT)" 0
else
    test_result "GET todos los planes (esperado ≥8, obtenido $COUNT)" 1
fi

# Test 2: GET bancarizadas
echo "Test 2: GET /config/custom-installments?card_type=bancarizadas"
RESPONSE=$(curl -s -X GET "http://localhost:8000/config/custom-installments?card_type=bancarizadas" \
  -H "Authorization: Bearer $TOKEN")
COUNT=$(echo $RESPONSE | grep -o '"card_type":"bancarizadas"' | wc -l)

if [ $COUNT -ge 4 ]; then
    test_result "GET planes bancarizadas (esperado ≥4, obtenido $COUNT)" 0
else
    test_result "GET planes bancarizadas (esperado ≥4, obtenido $COUNT)" 1
fi

# Test 3: GET no_bancarizadas
echo "Test 3: GET /config/custom-installments?card_type=no_bancarizadas"
RESPONSE=$(curl -s -X GET "http://localhost:8000/config/custom-installments?card_type=no_bancarizadas" \
  -H "Authorization: Bearer $TOKEN")
COUNT=$(echo $RESPONSE | grep -o '"card_type":"no_bancarizadas"' | wc -l)

if [ $COUNT -ge 4 ]; then
    test_result "GET planes no bancarizadas (esperado ≥4, obtenido $COUNT)" 0
else
    test_result "GET planes no bancarizadas (esperado ≥4, obtenido $COUNT)" 1
fi

echo ""
echo "📋 Paso 3: Test POST (Crear nuevo plan)"
echo "----------------------------------------"

# Test 4: POST crear plan válido
echo "Test 4: POST /config/custom-installments (crear plan de prueba)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8000/config/custom-installments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"card_type": "bancarizadas", "installments": 42, "surcharge_percentage": 75.5, "description": "Test automatizado - 42 cuotas"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
NEW_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ] && [ ! -z "$NEW_ID" ]; then
    test_result "POST crear plan válido (HTTP $HTTP_CODE, ID: $NEW_ID)" 0
    echo "   → Plan creado con ID: $NEW_ID"
else
    test_result "POST crear plan válido (HTTP $HTTP_CODE)" 1
    NEW_ID=""
fi

echo ""
echo "📋 Paso 4: Test PUT (Actualizar plan)"
echo "----------------------------------------"

if [ ! -z "$NEW_ID" ]; then
    # Test 5: PUT actualizar plan
    echo "Test 5: PUT /config/custom-installments/$NEW_ID (actualizar)"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:8000/config/custom-installments/$NEW_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"description": "Test actualizado", "surcharge_percentage": 80.0}')

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    UPDATED_DESC=$(echo "$RESPONSE" | sed '$d' | grep -o '"description":"[^"]*"' | cut -d'"' -f4)

    if [ "$HTTP_CODE" = "200" ] && [ "$UPDATED_DESC" = "Test actualizado" ]; then
        test_result "PUT actualizar plan (HTTP $HTTP_CODE)" 0
    else
        test_result "PUT actualizar plan (HTTP $HTTP_CODE)" 1
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} - Test 5: PUT (no hay plan para actualizar)"
fi

echo ""
echo "📋 Paso 5: Test PATCH (Toggle activo)"
echo "----------------------------------------"

if [ ! -z "$NEW_ID" ]; then
    # Test 6: PATCH toggle
    echo "Test 6: PATCH /config/custom-installments/$NEW_ID/toggle"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "http://localhost:8000/config/custom-installments/$NEW_ID/toggle" \
      -H "Authorization: Bearer $TOKEN")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    IS_ACTIVE=$(echo "$RESPONSE" | sed '$d' | grep -o '"is_active":[a-z]*' | cut -d':' -f2)

    if [ "$HTTP_CODE" = "200" ]; then
        test_result "PATCH toggle activo (HTTP $HTTP_CODE, is_active: $IS_ACTIVE)" 0
    else
        test_result "PATCH toggle activo (HTTP $HTTP_CODE)" 1
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} - Test 6: PATCH (no hay plan para toggle)"
fi

echo ""
echo "📋 Paso 6: Test DELETE (Eliminar plan)"
echo "----------------------------------------"

if [ ! -z "$NEW_ID" ]; then
    # Test 7: DELETE
    echo "Test 7: DELETE /config/custom-installments/$NEW_ID"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "http://localhost:8000/config/custom-installments/$NEW_ID" \
      -H "Authorization: Bearer $TOKEN")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    MESSAGE=$(echo "$RESPONSE" | sed '$d' | grep -o '"message":"[^"]*"' | cut -d'"' -f4)

    if [ "$HTTP_CODE" = "200" ]; then
        test_result "DELETE eliminar plan (HTTP $HTTP_CODE)" 0
    else
        test_result "DELETE eliminar plan (HTTP $HTTP_CODE)" 1
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} - Test 7: DELETE (no hay plan para eliminar)"
fi

echo ""
echo "📋 Paso 7: Tests de validación"
echo "----------------------------------------"

# Test 8: Validación cuotas fuera de rango
echo "Test 8: POST con cuotas inválidas (100)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8000/config/custom-installments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"card_type": "bancarizadas", "installments": 100, "surcharge_percentage": 50, "description": "Test validación"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "422" ] || [ "$HTTP_CODE" = "400" ]; then
    test_result "Validación cuotas fuera de rango (HTTP $HTTP_CODE - rechazado correctamente)" 0
else
    test_result "Validación cuotas fuera de rango (HTTP $HTTP_CODE - debería ser 400/422)" 1
fi

# Test 9: Validación recargo fuera de rango
echo "Test 9: POST con recargo inválido (150%)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8000/config/custom-installments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"card_type": "bancarizadas", "installments": 12, "surcharge_percentage": 150, "description": "Test validación"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "422" ] || [ "$HTTP_CODE" = "400" ]; then
    test_result "Validación recargo fuera de rango (HTTP $HTTP_CODE - rechazado correctamente)" 0
else
    test_result "Validación recargo fuera de rango (HTTP $HTTP_CODE - debería ser 400/422)" 1
fi

echo ""
echo "=========================================="
echo "📊 RESUMEN DE TESTS"
echo "=========================================="
echo ""
echo "Total de tests ejecutados: $TOTAL_TESTS"
echo -e "Tests ${GREEN}exitosos${NC}: $PASSED_TESTS"
echo -e "Tests ${RED}fallidos${NC}: $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS LOS TESTS PASARON EXITOSAMENTE${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ALGUNOS TESTS FALLARON${NC}"
    echo ""
    exit 1
fi
