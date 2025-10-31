# Fix: Persistencia de Métodos de Pago

## Problema Identificado

Los **métodos de pago** (Efectivo, Tarjeta de Débito, Tarjeta de Crédito, Transferencia) NO se podían habilitar/deshabilitar porque:

❌ Estaban **hardcodeados en memoria** (datos estáticos en el endpoint)
❌ **No existía endpoint PUT** para actualizarlos
❌ **No existía tabla en la BD** para persistirlos
❌ Error: "Error actualizando método de pago"

## Diferencia: Payment Methods vs Payment Config

Es importante entender la diferencia:

### Payment Methods (Métodos de Pago)
- **Qué son**: Tipos básicos de pago disponibles
- **Ejemplos**: Efectivo, Débito, Crédito, Transferencia
- **Funcionalidad**: Habilitar/deshabilitar cada método
- **Tabla**: `payment_methods`

### Payment Config (Configuración de Pagos)
- **Qué son**: Configuraciones de recargos y cuotas
- **Ejemplos**: 3 cuotas con 8%, 6 cuotas con 14%, etc.
- **Funcionalidad**: Configurar % de recargo por cuotas
- **Tabla**: `payment_config`

## Solución Implementada

### 1. Modelo PaymentMethod

Creado en `backend/app/models/payment_method.py`:

```python
class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)      # "Efectivo", "Tarjeta de Débito"
    code = Column(String(50), unique=True)          # "CASH", "DEBIT_CARD", "CREDIT_CARD"
    icon = Column(String(10))                       # "💵", "💳", "🏦"
    is_active = Column(Boolean, default=True)       # Habilitado/Deshabilitado
    requires_change = Column(Boolean, default=False) # Si requiere dar vuelto
    description = Column(String(255))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
```

### 2. Schemas

Creado en `backend/app/schemas/payment_method.py`:

- `PaymentMethodBase` - Schema base
- `PaymentMethodCreate` - Para crear nuevos
- `PaymentMethodUpdate` - Para actualizar
- `PaymentMethodResponse` - Para respuestas

### 3. Endpoints Corregidos

#### GET `/config/payment-methods`

**Antes:**
```python
# Retornaba datos hardcodeados
payment_methods = [
    {"id": 1, "name": "Efectivo", "code": "CASH", ...},
    {"id": 2, "name": "Tarjeta de Débito", ...},
    ...
]
```

**Ahora:**
```python
# Lee de la base de datos
def get_or_create_default_payment_methods(db: Session):
    existing = db.query(PaymentMethod).count()
    if existing > 0:
        return db.query(PaymentMethod).all()

    # Crear métodos por defecto si no existen
    default_methods = [...]
    for method in default_methods:
        db.add(method)
    db.commit()
    return default_methods
```

#### PUT `/config/payment-methods/{method_id}` (NUEVO)

```python
@router.put("/payment-methods/{method_id}")
async def update_payment_method(method_id: int, method_data: dict, ...):
    # Buscar en BD
    method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id).first()

    # Actualizar campos
    allowed_fields = ['is_active', 'name', 'icon', 'requires_change', 'description']
    for field in allowed_fields:
        if field in method_data:
            setattr(method, field, method_data[field])

    db.commit()
    return method
```

### 4. Script de Migración

`backend/migrate_payment_methods.py`:

- Crea la tabla `payment_methods` si no existe
- Inserta 4 métodos de pago por defecto
- Todos habilitados por defecto

## Estado Actual

### ✅ Tabla en Base de Datos

```sql
SELECT * FROM payment_methods;

 id |        name        |    code     | is_active | requires_change
----+--------------------+-------------+-----------+-----------------
  1 | Efectivo           | CASH        | t         | t
  2 | Tarjeta de Débito  | DEBIT_CARD  | t         | f
  3 | Tarjeta de Crédito | CREDIT_CARD | t         | f
  4 | Transferencia      | TRANSFER    | t         | f
```

### ✅ Endpoints Funcionando

- `GET /config/payment-methods` - Lee de BD ✅
- `PUT /config/payment-methods/{id}` - Actualiza en BD ✅

## Cómo Usar

### Desde la Interfaz

1. Ve a **Settings → Payment Methods**
2. Verás 4 métodos de pago (Efectivo, Débito, Crédito, Transferencia)
3. Puedes **habilitar/deshabilitar** cada uno con el switch
4. Los cambios se **guardan automáticamente en la BD**
5. **Persisten después de reiniciar** el backend

### Desde la API

```bash
# Ver métodos de pago
curl http://localhost:8000/config/payment-methods \
  -H "Authorization: Bearer TOKEN"

# Deshabilitar efectivo
curl -X PUT http://localhost:8000/config/payment-methods/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

# Habilitar efectivo nuevamente
curl -X PUT http://localhost:8000/config/payment-methods/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}'
```

## Verificación

### ✅ Prueba 1: Verificar datos en BD

```bash
docker-compose exec db psql -U postgres -d pos_cesariel \
  -c "SELECT id, name, code, is_active FROM payment_methods;"
```

### ✅ Prueba 2: Habilitar/Deshabilitar

1. Ir a Settings → Payment Methods
2. Deshabilitar "Efectivo"
3. Recargar la página
4. Verificar que sigue deshabilitado ✅

### ✅ Prueba 3: Persistencia

```bash
# 1. Deshabilitar un método desde la UI
# 2. Reiniciar backend
docker-compose restart backend

# 3. Recargar la página
# 4. Verificar que sigue deshabilitado ✅
```

## Archivos Modificados/Creados

### Nuevos Archivos

1. `backend/app/models/payment_method.py` - Modelo PaymentMethod
2. `backend/app/schemas/payment_method.py` - Schemas de validación
3. `backend/migrate_payment_methods.py` - Script de migración

### Archivos Modificados

1. `backend/app/models/__init__.py` - Exportar PaymentMethod
2. `backend/routers/config.py`:
   - Endpoint GET corregido (usa BD)
   - Endpoint PUT nuevo (actualiza BD)
   - Función `get_or_create_default_payment_methods()`

## Datos por Defecto

| ID | Nombre | Código | Habilitado | Requiere Cambio |
|----|--------|--------|------------|-----------------|
| 1 | Efectivo | CASH | ✅ | ✅ |
| 2 | Tarjeta de Débito | DEBIT_CARD | ✅ | ❌ |
| 3 | Tarjeta de Crédito | CREDIT_CARD | ✅ | ❌ |
| 4 | Transferencia | TRANSFER | ✅ | ❌ |

## Beneficios

✅ **Persistencia real**: Los cambios se guardan en PostgreSQL
✅ **Habilitar/Deshabilitar**: Funcionalidad completa
✅ **No se pierden cambios**: Sobreviven reinicios
✅ **Fácil de usar**: Switch en la UI
✅ **Auditable**: Timestamps de creación/actualización

## Troubleshooting

### Error: "payment_methods table doesn't exist"

```bash
# Ejecutar migración
docker-compose exec backend python migrate_payment_methods.py
```

### No aparecen métodos en la UI

```bash
# Reiniciar backend
docker-compose restart backend

# Limpiar cache del navegador
Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
```

### Los cambios no persisten

```bash
# Verificar que están en BD
docker-compose exec db psql -U postgres -d pos_cesariel \
  -c "SELECT * FROM payment_methods;"

# Ver logs
docker-compose logs backend --tail 50
```

## Conclusión

✅ **Problema resuelto**: Los métodos de pago ahora persisten correctamente
✅ **Funcionalidad completa**: Habilitar/deshabilitar funciona
✅ **Sin errores**: "Error actualizando método de pago" eliminado
✅ **Listo para usar**: Implementación robusta y escalable
