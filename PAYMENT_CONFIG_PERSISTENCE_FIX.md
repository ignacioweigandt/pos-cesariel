# Fix: Persistencia de Configuraciones de Pago

## Problema Identificado

Las configuraciones de métodos de pago **NO se estaban guardando en la base de datos**. Se almacenaban en una variable global en memoria (`_payment_configs_store`), lo que causaba que:

❌ Los cambios se perdieran al reiniciar el backend
❌ No hubiera persistencia real de la configuración
❌ Las modificaciones fueran temporales

## Solución Implementada

Se corrigieron los endpoints para usar **persistencia real en PostgreSQL**:

### 1. **Endpoint GET corregido**

**Antes:**
```python
# Usaba variable global en memoria
def get_payment_configs():
    global _payment_configs_store
    if _payment_configs_store is None:
        _payment_configs_store = get_default_payment_configs()
    return _payment_configs_store
```

**Ahora:**
```python
# Consulta la base de datos
def get_or_create_default_payment_configs(db: Session):
    existing_count = db.query(PaymentConfig).count()
    if existing_count > 0:
        return db.query(PaymentConfig).all()

    # Crear configuraciones por defecto si no existen
    default_configs = [...]
    for config in default_configs:
        db.add(config)
    db.commit()
    return default_configs
```

### 2. **Endpoint PUT corregido**

**Antes:**
```python
# Actualizaba variable en memoria
updated_config = update_payment_config_in_store(config_id, update_data)
```

**Ahora:**
```python
# Actualiza la base de datos
config = db.query(PaymentConfig).filter(PaymentConfig.id == config_id).first()
for field, value in update_data.items():
    setattr(config, field, value)
db.commit()
db.refresh(config)
```

### 3. **Script de Inicialización**

Se creó `init_payment_configs.py` para poblar la tabla con 9 configuraciones por defecto:

1. Efectivo (sin recargo)
2. Transferencia (sin recargo)
3. Tarjetas bancarizadas - 1 cuota (sin recargo)
4. Tarjetas bancarizadas - 3 cuotas (8% recargo)
5. Tarjetas bancarizadas - 6 cuotas (14% recargo)
6. Tarjetas bancarizadas - 9 cuotas (20% recargo)
7. Tarjetas bancarizadas - 12 cuotas (26% recargo)
8. Tarjetas no bancarizadas (15% recargo)
9. Tarjeta Naranja (15% recargo)

## Verificación de la Solución

### ✅ Prueba 1: Verificar que hay datos en la BD

```bash
docker-compose exec db psql -U postgres -d pos_cesariel -c "SELECT COUNT(*) FROM payment_config;"
```

**Resultado esperado:** 9 configuraciones

### ✅ Prueba 2: Persistencia después de reiniciar

```bash
# 1. Verificar configuraciones actuales
docker-compose exec db psql -U postgres -d pos_cesariel -c "SELECT id, payment_type, installments FROM payment_config;"

# 2. Reiniciar backend
docker-compose restart backend

# 3. Verificar que siguen ahí
docker-compose exec db psql -U postgres -d pos_cesariel -c "SELECT COUNT(*) FROM payment_config;"
```

**Resultado esperado:** Las 9 configuraciones siguen presentes

### ✅ Prueba 3: Modificar y verificar persistencia

1. Acceder a http://localhost:3000
2. Login como admin/admin123
3. Ir a Settings → Payment Methods
4. Modificar el recargo de "Tarjetas bancarizadas - 3 cuotas" de 8% a 10%
5. Guardar
6. Reiniciar backend: `docker-compose restart backend`
7. Recargar la página
8. Verificar que el 10% sigue ahí

## Estado Actual

### ✅ Funcionando Correctamente

- GET `/config/payment-config` → Lee de la BD
- PUT `/config/payment-config/{id}` → Actualiza en la BD
- DELETE `/config/payment-config/{id}` → Marca como inactiva en la BD
- POST `/config/payment-config` → Crea en la BD
- GET `/config/custom-installments` → Lee de la BD (cuotas personalizadas)
- POST `/config/custom-installments` → Crea en la BD

### 📊 Tabla en Base de Datos

```
payment_config
├── id (PK)
├── payment_type (efectivo, transferencia, tarjeta)
├── card_type (bancarizadas, no_bancarizadas, tarjeta_naranja)
├── installments (número de cuotas)
├── surcharge_percentage (% de recargo)
├── is_active (activo/inactivo)
├── description (descripción)
├── created_at (timestamp)
└── updated_at (timestamp)
```

## Archivos Modificados

1. **backend/routers/config.py**
   - Eliminada variable global `_payment_configs_store`
   - Corregidos endpoints GET y PUT
   - Nueva función `get_or_create_default_payment_configs()`

2. **backend/init_payment_configs.py** (NUEVO)
   - Script para inicializar configuraciones por defecto
   - Se ejecuta una sola vez

## Instrucciones para Desarrollo

### Si ya tienes configuraciones en memoria (variables globales)

No hay problema, simplemente:

```bash
# Ejecutar script de inicialización
docker-compose exec backend python init_payment_configs.py

# Reiniciar backend
docker-compose restart backend
```

### Si estás partiendo de cero

Las configuraciones se crearán automáticamente la primera vez que accedas a Settings → Payment Methods.

O puedes ejecutar manualmente:

```bash
docker-compose exec backend python init_payment_configs.py
```

## Beneficios del Fix

✅ **Persistencia real**: Los cambios sobreviven reinicios
✅ **Auditoría**: Timestamps de creación y actualización
✅ **Escalabilidad**: Múltiples instancias del backend comparten la misma config
✅ **Backup**: Los datos están en la BD, se respaldan con el backup regular
✅ **Consistencia**: Una única fuente de verdad (la BD)

## Próximos Pasos (Opcional)

1. **Migración automática**: Integrar `get_or_create_default_payment_configs` en `init_data.py`
2. **API de auditoría**: Endpoint para ver historial de cambios
3. **Validación adicional**: Reglas de negocio más estrictas
4. **UI mejorada**: Mostrar cuando una config fue modificada por última vez

## Soporte

Para verificar que todo está funcionando:

```bash
# 1. Ver estado de la BD
docker-compose exec db psql -U postgres -d pos_cesariel -c "SELECT * FROM payment_config;"

# 2. Ver logs del backend
docker-compose logs backend --tail 50

# 3. Probar endpoint desde Swagger
# http://localhost:8000/docs
# GET /config/payment-config
```

## Conclusión

✅ **Problema resuelto**: Las configuraciones de pago ahora persisten correctamente en PostgreSQL
✅ **Probado**: Verificado que sobreviven reinicios del backend
✅ **Listo para producción**: Implementación robusta y escalable
