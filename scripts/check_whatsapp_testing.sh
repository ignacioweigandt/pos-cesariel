#!/bin/bash
# Quick DB checks for WhatsApp workflow testing
# Usage: ./scripts/check_whatsapp_testing.sh [command]

set -e

DB_EXEC="docker compose exec -T db psql -U postgres -d pos_cesariel -c"

case "${1:-help}" in
  stock)
    echo "=== STOCK ACTUAL - Producto 196 (Under Armour Training Socks) ==="
    $DB_EXEC "
    SELECT p.id, p.name, bs.stock_quantity, p.price
    FROM products p
    JOIN branch_stock bs ON p.id = bs.product_id AND bs.branch_id = 1
    WHERE p.id = 196;
    "
    ;;

  sales)
    echo "=== VENTAS WHATSAPP DE TESTING ==="
    $DB_EXEC "
    SELECT ws.id, ws.customer_name, s.order_status, s.total_amount, ws.created_at
    FROM whatsapp_sales ws
    JOIN sales s ON ws.sale_id = s.id
    WHERE ws.customer_name LIKE 'Test Cliente%'
    ORDER BY ws.created_at;
    "
    ;;

  movements)
    echo "=== MOVIMIENTOS DE INVENTARIO - Producto 196 ==="
    $DB_EXEC "
    SELECT id, quantity_change, movement_type, reason, created_at
    FROM inventory_movements
    WHERE product_id = 196
    ORDER BY created_at DESC
    LIMIT 10;
    "
    ;;

  last-sale)
    echo "=== ÚLTIMA VENTA WHATSAPP CREADA ==="
    $DB_EXEC "
    SELECT ws.id, ws.customer_name, ws.customer_whatsapp, s.order_status, s.total_amount, ws.created_at
    FROM whatsapp_sales ws
    JOIN sales s ON ws.sale_id = s.id
    ORDER BY ws.created_at DESC
    LIMIT 1;
    "
    echo ""
    echo "=== ITEMS DE LA ÚLTIMA VENTA ==="
    $DB_EXEC "
    SELECT si.product_id, p.name, si.quantity, si.size, si.unit_price, si.total_price
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.sale_id = (SELECT sale_id FROM whatsapp_sales ORDER BY created_at DESC LIMIT 1)
    ORDER BY si.id;
    "
    ;;

  all)
    echo "=== RESUMEN COMPLETO DE TESTING ==="
    echo ""
    $0 stock
    echo ""
    $0 sales
    echo ""
    $0 movements
    ;;

  cleanup)
    echo "=== LIMPIEZA DE DATOS DE TESTING ==="
    echo "⚠️  Esto eliminará todas las ventas WhatsApp de testing y restaurará stock a 10"
    read -p "¿Continuar? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo "Eliminando ventas de testing..."
      $DB_EXEC "DELETE FROM whatsapp_sales WHERE customer_name LIKE 'Test Cliente%';"
      
      echo "Restaurando stock a 10 unidades..."
      $DB_EXEC "UPDATE branch_stock SET stock_quantity = 10 WHERE product_id = 196 AND branch_id = 1;"
      
      echo "✅ Cleanup completado"
      $0 stock
    else
      echo "Cancelado"
    fi
    ;;

  help|*)
    cat <<EOF
Uso: $0 [comando]

Comandos disponibles:
  stock       - Ver stock actual del producto 196
  sales       - Ver todas las ventas WhatsApp de testing
  movements   - Ver movimientos de inventario del producto 196
  last-sale   - Ver última venta WhatsApp creada con sus items
  all         - Mostrar resumen completo
  cleanup     - Eliminar datos de testing y restaurar stock inicial
  help        - Mostrar esta ayuda

Ejemplos:
  $0 stock              # Ver stock actual
  $0 sales              # Ver ventas de testing
  $0 all                # Ver todo
  $0 cleanup            # Limpiar datos de testing

EOF
    ;;
esac
