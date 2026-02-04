# 🚀 PLAN DE PRODUCCIÓN - BASE DE DATOS POS CESARIEL

## Estado Actual
Base de datos bien diseñada conceptualmente pero le faltan **protecciones a nivel de base de datos** para soportar producción con múltiples usuarios concurrentes.

## Prioridad de Implementación

### ✅ FASE 1-4: CRÍTICO (Día 1-5) - **IMPLEMENTADAS**
Las fases críticas ya están creadas en este plan:
- ✅ Constraints UNIQUE (prevenir duplicados)
- ✅ Constraints CHECK (validar datos)
- ✅ Índices compuestos (performance)
- ✅ Trigger auto-calculado de stock
- ✅ Optimistic locking con `version`
- ✅ Servicio de stock thread-safe

### 🟡 FASE 5: BACKUP Y MONITORING (Día 6-7) - **POR IMPLEMENTAR**

#### 5.1 Setup de Backups Automáticos

```bash
# Crear directorio de backups
mkdir -p ~/backups/pos-cesariel

# Crear script de backup
cat > ~/backups/backup-pos.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups/pos-cesariel
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="pos_backup_${DATE}.sql.gz"

# Backup completo
docker compose exec -T db pg_dump -U postgres pos_cesariel | gzip > "${BACKUP_DIR}/${FILENAME}"

# Verificar éxito
if [ $? -eq 0 ]; then
    echo "✅ Backup exitoso: ${FILENAME}"
    
    # Eliminar backups más viejos que 30 días
    find "${BACKUP_DIR}" -name "pos_backup_*.sql.gz" -mtime +30 -delete
else
    echo "❌ Error en backup"
    exit 1
fi
EOF

chmod +x ~/backups/backup-pos.sh

# Agregar a crontab (backup diario a las 2AM)
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backups/backup-pos.sh") | crontab -
```

#### 5.2 Monitoring Básico

```bash
# Script de monitoring
cat > ~/backups/monitor-db.sh << 'EOF'
#!/bin/bash

# Verificar espacio en disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  ALERTA: Disco al ${DISK_USAGE}%"
fi

# Verificar conexiones activas
CONNECTIONS=$(docker compose exec -T db psql -U postgres -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='pos_cesariel';")
echo "📊 Conexiones activas: ${CONNECTIONS}"

# Verificar queries lentas (>1 segundo)
SLOW_QUERIES=$(docker compose exec -T db psql -U postgres pos_cesariel -t -c "SELECT count(*) FROM pg_stat_statements WHERE mean_exec_time > 1000;")
if [ $SLOW_QUERIES -gt 0 ]; then
    echo "⚠️  ${SLOW_QUERIES} queries lentas detectadas"
fi

# Verificar tamaño de base de datos
DB_SIZE=$(docker compose exec -T db psql -U postgres -t -c "SELECT pg_size_pretty(pg_database_size('pos_cesariel'));")
echo "💾 Tamaño DB: ${DB_SIZE}"
EOF

chmod +x ~/backups/monitor-db.sh

# Ejecutar cada hora
(crontab -l 2>/dev/null; echo "0 * * * * ~/backups/monitor-db.sh >> ~/backups/monitor.log 2>&1") | crontab -
```

#### 5.3 Habilitar pg_stat_statements

```sql
-- En PostgreSQL para tracking de queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Ver queries más lentas
SELECT 
    substring(query, 1, 50) AS short_query,
    round(total_exec_time::numeric, 2) AS total_time,
    calls,
    round(mean_exec_time::numeric, 2) AS avg_time,
    round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) AS percentage
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### 🟢 FASE 6: LIMPIEZA Y REFACTORIZACIÓN (Día 8-10) - **OPCIONAL**

#### 6.1 Unificar PaymentConfig y PaymentMethod

**Problema:** Dos tablas muy similares causan confusión.

**Solución:**
```python
# backend/alembic/versions/XXXXX_unify_payment_tables.py
# 1. Migrar datos de PaymentConfig a PaymentMethod
# 2. Eliminar PaymentConfig
# 3. Actualizar referencias en código
```

#### 6.2 Eliminar Product.brand (campo legacy)

**Problema:** Redundancia entre `brand` (string) y `brand_id` (FK).

**Solución:**
```python
# backend/alembic/versions/XXXXX_remove_legacy_brand.py
# 1. Migrar datos de Product.brand a Brand si no existe brand_id
# 2. Eliminar columna brand
```

#### 6.3 Agregar constraint ProductImage.is_main único

```sql
-- Solo una imagen principal por producto
CREATE UNIQUE INDEX idx_one_main_per_product 
ON product_images (product_id) 
WHERE is_main = true;
```

#### 6.4 Job de limpieza de notificaciones

```python
# backend/app/jobs/cleanup_notifications.py
"""Job para limpiar notificaciones expiradas y leídas viejas."""

from datetime import datetime, timedelta
from database import SessionLocal
from app.models import Notification


def cleanup_old_notifications():
    """Eliminar notificaciones expiradas y leídas >30 días."""
    db = SessionLocal()
    try:
        cutoff_date = datetime.now() - timedelta(days=30)
        
        # Notificaciones expiradas
        expired = db.query(Notification).filter(
            Notification.expires_at < datetime.now()
        ).delete()
        
        # Notificaciones leídas viejas
        old_read = db.query(Notification).filter(
            Notification.is_read == True,
            Notification.read_at < cutoff_date
        ).delete()
        
        db.commit()
        print(f"✅ Eliminadas {expired + old_read} notificaciones viejas")
    finally:
        db.close()


if __name__ == "__main__":
    cleanup_old_notifications()
```

```bash
# Agregar a crontab (ejecutar semanalmente)
(crontab -l 2>/dev/null; echo "0 3 * * 0 cd /path/to/backend && python app/jobs/cleanup_notifications.py") | crontab -
```

---

## EJECUTAR EL PLAN (Orden de ejecución)

### DÍA 1-2: Constraints

```bash
# 1. Backup completo
make backup-db

# 2. Crear branch de Git
git checkout -b feature/db-production-hardening

# 3. Limpiar duplicados
docker compose exec backend python scripts/cleanup_duplicates.py

# 4. Aplicar constraints
make migrate-upgrade

# 5. Verificar
docker compose exec db psql -U postgres pos_cesariel -c "
SELECT conname, contype FROM pg_constraint 
WHERE conrelid::regclass::text LIKE '%branch_stock%' OR conrelid::regclass::text LIKE '%product_size%';
"

# 6. Testing manual
# - Intentar crear duplicado (debe fallar)
# - Intentar stock negativo (debe fallar)
```

### DÍA 2-3: Índices

```bash
# 1. Aplicar migración de índices
make migrate-upgrade

# 2. Verificar performance antes/después
docker compose exec db psql -U postgres pos_cesariel -c "
EXPLAIN ANALYZE 
SELECT * FROM branch_stock 
WHERE branch_id = 1 AND product_id = 100;
"

# 3. Ver tamaño de índices
docker compose exec db psql -U postgres pos_cesariel -c "
SELECT 
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes 
JOIN pg_class ON pg_indexes.indexname = pg_class.relname
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
"
```

### DÍA 3-4: Stock Auto-calculado

```bash
# 1. Aplicar trigger de stock
make migrate-upgrade

# 2. Verificar que funciona
docker compose exec db psql -U postgres pos_cesariel

# En psql:
-- Ver stock actual
SELECT id, name, stock_quantity FROM products LIMIT 3;

-- Cambiar BranchStock
UPDATE branch_stock SET stock_quantity = stock_quantity + 5 
WHERE product_id = (SELECT id FROM products LIMIT 1);

-- Verificar que Product.stock_quantity cambió automáticamente
SELECT id, name, stock_quantity FROM products LIMIT 3;
```

### DÍA 4-5: Optimistic Locking

```bash
# 1. Aplicar migración de versión
make migrate-upgrade

# 2. Actualizar código para usar StockService
# Ver ejemplo en backend/app/services/stock_service.py

# 3. Testing de concurrencia (ver TESTING.md abajo)
```

### DÍA 6-7: Backups y Monitoring

```bash
# 1. Setup scripts de backup
# (Ver FASE 5.1)

# 2. Setup monitoring
# (Ver FASE 5.2)

# 3. Habilitar pg_stat_statements
# (Ver FASE 5.3)

# 4. Probar restore
gunzip -c ~/backups/pos-cesariel/pos_backup_*.sql.gz | docker compose exec -T db psql -U postgres pos_cesariel_test
```

---

## TESTING DE CONCURRENCIA

### Script de prueba de race conditions

```python
# backend/tests/test_concurrent_sales.py
"""
Test de ventas concurrentes para verificar optimistic locking.
"""

import pytest
import threading
from sqlalchemy.orm import Session
from app.services.stock_service import StockService, InsufficientStockError, StockConflictError


def test_concurrent_sales_same_product(db: Session):
    """
    Simula dos vendedores vendiendo el ÚLTIMO producto simultáneamente.
    Solo UNO debe tener éxito, el otro debe recibir InsufficientStockError.
    """
    
    # Setup: Producto con stock = 1
    product_id = 1
    branch_id = 1
    
    # Setear stock a 1 para la prueba
    db.execute("UPDATE branch_stock SET stock_quantity = 1 WHERE product_id = :pid AND branch_id = :bid",
               {"pid": product_id, "bid": branch_id})
    db.commit()
    
    results = []
    
    def sell_product(seller_name):
        """Función que ejecuta cada vendedor."""
        try:
            db_session = SessionLocal()  # Nueva sesión por thread
            StockService.decrement_stock_with_locking(
                db=db_session,
                product_id=product_id,
                branch_id=branch_id,
                quantity=1,
                reference_type="TEST",
                notes=f"Vendedor {seller_name}"
            )
            results.append(f"{seller_name}: SUCCESS")
        except (InsufficientStockError, StockConflictError) as e:
            results.append(f"{seller_name}: FAILED - {str(e)}")
        finally:
            db_session.close()
    
    # Crear dos threads (dos vendedores)
    thread1 = threading.Thread(target=sell_product, args=("Vendedor A",))
    thread2 = threading.Thread(target=sell_product, args=("Vendedor B",))
    
    # Iniciar simultáneamente
    thread1.start()
    thread2.start()
    
    # Esperar a que terminen
    thread1.join()
    thread2.join()
    
    # Verificar resultados
    print("Resultados:", results)
    
    # Debe haber exactamente 1 SUCCESS y 1 FAILED
    successes = [r for r in results if "SUCCESS" in r]
    failures = [r for r in results if "FAILED" in r]
    
    assert len(successes) == 1, "Solo un vendedor debe tener éxito"
    assert len(failures) == 1, "Un vendedor debe fallar por stock insuficiente"
    
    # Verificar stock final es 0
    final_stock = db.execute("SELECT stock_quantity FROM branch_stock WHERE product_id = :pid AND branch_id = :bid",
                            {"pid": product_id, "bid": branch_id}).fetchone()[0]
    assert final_stock == 0, "Stock final debe ser 0"


# Ejecutar
# pytest backend/tests/test_concurrent_sales.py -v
```

---

## CHECKLIST PRE-PRODUCCIÓN

### Base de Datos
- [ ] Todos los constraints aplicados
- [ ] Todos los índices creados
- [ ] Trigger de stock funcionando
- [ ] Optimistic locking implementado
- [ ] Test de concurrencia pasando
- [ ] Backup automático configurado
- [ ] Restore testeado al menos 1 vez
- [ ] Monitoring básico activo

### Código
- [ ] Todas las ventas usan `StockService`
- [ ] Manejo de `StockConflictError` en endpoints
- [ ] Manejo de `InsufficientStockError` con mensajes claros
- [ ] Paginación en todos los listados grandes
- [ ] Logs de errores configurados

### Testing
- [ ] Tests unitarios de stock_service pasando
- [ ] Tests de concurrencia pasando
- [ ] Load testing con 50+ usuarios (opcional pero recomendado)
- [ ] E2E tests de flujo de venta completo

### Infraestructura
- [ ] PostgreSQL configurado para producción (max_connections, shared_buffers)
- [ ] Espacio en disco monitoreado
- [ ] Alertas configuradas (email/Slack)
- [ ] Plan de escalamiento definido

### Documentación
- [ ] CLAUDE.md actualizado con nuevas reglas
- [ ] Documentación de procedimientos de backup/restore
- [ ] Runbook de troubleshooting
- [ ] Plan de rollback si algo falla

---

## ROLLBACK PLAN

Si algo sale mal en producción:

```bash
# 1. Backup inmediato del estado actual
make backup-db

# 2. Revertir migraciones una por una
make migrate-downgrade  # Revierte última migración

# 3. Si todo falla, restore del último backup bueno
gunzip -c backup_YYYYMMDD.sql.gz | docker compose exec -T db psql -U postgres pos_cesariel

# 4. Verificar integridad
docker compose exec db psql -U postgres pos_cesariel -c "
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM sales;
SELECT COUNT(*) FROM branch_stock;
"
```

---

## MÉTRICAS DE ÉXITO

Después de implementar, debés ver:

✅ **Cero duplicados** en BranchStock, ProductSize  
✅ **Cero stock negativo** en todas las tablas  
✅ **Queries <100ms** en listados paginados  
✅ **Cero errores de concurrencia** en ventas concurrentes  
✅ **100% de backups exitosos** en 30 días  
✅ **Recovery time <5 minutos** desde backup  

---

## PRÓXIMOS PASOS (Post-Producción)

Una vez estable en producción, considerar:

1. **Partitioning** de sales e inventory_movements por mes
2. **Read replicas** para reportes pesados
3. **Connection pooling** (PgBouncer)
4. **Full-text search** (PostgreSQL FTS o Elasticsearch)
5. **Caching** de productos con Redis
6. **CDC** (Change Data Capture) para analytics

---

## CONTACTO Y SOPORTE

**Autor:** [Tu nombre]  
**Fecha:** 2024-02-04  
**Versión:** 1.0  

Para dudas sobre este plan:
- Revisar logs: `make logs-backend`, `make logs-db`
- Ejecutar monitoring: `~/backups/monitor-db.sh`
- Verificar constraints: `SELECT * FROM pg_constraint;`

**IMPORTANTE:** NO lanzar a producción sin completar al menos FASE 1-4 (Día 1-5).
