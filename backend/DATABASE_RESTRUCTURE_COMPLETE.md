# ✨ Reestructuración de Base de Datos - POS Cesariel

## 📋 Resumen Ejecutivo

Se ha completado exitosamente la reestructuración de la base de datos del sistema POS Cesariel para **conectar las tablas de configuración** que estaban aisladas con el resto del sistema. Esta mejora proporciona:

✅ **Trazabilidad completa**: Cada venta registra qué configuraciones se usaron
✅ **Flexibilidad multi-sucursal**: Cada sucursal puede tener configuraciones personalizadas
✅ **Auditoría exhaustiva**: Registro de todos los cambios en configuraciones
✅ **Integridad de datos**: Validaciones que previenen datos inválidos
✅ **Backward compatible**: El sistema existente sigue funcionando sin cambios

---

## 🔄 Cambios Implementados

### Fase 1: Referencias en Ventas (Trazabilidad)

**Archivos modificados:**
- `backend/app/models/sales.py` - Agregadas columnas de referencia
- `backend/app/schemas/sale.py` - Actualizados schemas

**Nuevas columnas en tabla `sales`:**
```sql
-- Referencias de método de pago
payment_method_id INTEGER           -- ID del método usado
payment_method_name VARCHAR(100)    -- Nombre (snapshot)

-- Referencias de tasa de impuesto
tax_rate_id INTEGER                 -- ID de la tasa aplicada
tax_rate_name VARCHAR(100)          -- Nombre (snapshot)
tax_rate_percentage NUMERIC(5, 2)   -- Porcentaje (snapshot)
```

**Script de migración:** `backend/migrate_add_sales_references.py`

**Beneficios:**
- Histórico completo de cada venta
- Reportes precisos por método de pago
- Auditoría fiscal con tasas de impuesto exactas
- Datos inmutables (no se pierden si cambian las configuraciones)

---

### Fase 2: Configuraciones por Sucursal (Flexibilidad)

**Archivos creados:**
- `backend/app/models/branch_config.py` - Nuevos modelos

**Nuevas tablas:**

#### `branch_tax_rates`
```sql
CREATE TABLE branch_tax_rates (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    tax_rate_id INTEGER REFERENCES tax_rates(id) ON DELETE RESTRICT,
    is_default BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `branch_payment_methods`
```sql
CREATE TABLE branch_payment_methods (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    surcharge_override NUMERIC(5, 2),    -- Recargo personalizado
    installment_override INTEGER,         -- Cuotas personalizadas
    notes VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Script de migración:** `backend/migrate_branch_config.py`

**Beneficios:**
- Diferentes tasas de impuesto por jurisdicción
- Métodos de pago específicos por sucursal
- Recargos personalizados por ubicación
- Gestión descentralizada

---

### Fase 3: Auditoría de Configuraciones (Control)

**Archivos creados:**
- `backend/app/models/audit.py` - Modelos de auditoría

**Nuevas tablas:**

#### `config_change_log`
```sql
CREATE TABLE config_change_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action change_action NOT NULL,  -- CREATE/UPDATE/DELETE/ACTIVATE/DEACTIVATE
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    changed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    notes TEXT
);
```

#### `security_audit_log`
```sql
CREATE TABLE security_audit_log (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(100),
    success VARCHAR(10) DEFAULT 'SUCCESS' NOT NULL,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

**Script de migración:** `backend/migrate_audit_tables.py`

**Beneficios:**
- Cumplimiento normativo (GDPR, SOX, PCI-DSS)
- Rastreo de quién cambió qué y cuándo
- Monitoreo de seguridad
- Troubleshooting de configuraciones

---

### Fase 4: Servicios y Validaciones (Implementación)

**Archivos creados:**
- `backend/app/repositories/config.py` - 4 nuevos repositorios
- `backend/app/services/config_service.py` - Servicio de configuración

**Archivos modificados:**
- `backend/app/services/sale_service.py` - Integración con ConfigService

**Nuevos repositorios:**
1. `BranchTaxRateRepository` - Gestión de impuestos por sucursal
2. `BranchPaymentMethodRepository` - Gestión de pagos por sucursal
3. `ConfigChangeLogRepository` - Logs de cambios
4. `SecurityAuditLogRepository` - Logs de seguridad

**Nuevo servicio: ConfigService**

Proporciona métodos para:
- Obtener tasa de impuesto efectiva por sucursal
- Validar métodos de pago
- Gestionar configuraciones por sucursal
- Registrar cambios en auditoría

**SaleService mejorado:**
- Valida método de pago contra configuración
- Obtiene tasa de impuesto de la sucursal
- Registra referencias de configuración
- Calcula impuestos automáticamente

---

## 🚀 Cómo Usar el Sistema Mejorado

### 1. Ejecutar las Migraciones

**IMPORTANTE:** Las migraciones deben ejecutarse dentro del contenedor backend.

```bash
# 1. Acceder al contenedor backend
make shell-backend

# 2. Ejecutar migraciones en orden
python migrate_add_sales_references.py
python migrate_branch_config.py
python migrate_audit_tables.py

# 3. Salir del contenedor
exit
```

**Notas:**
- Las migraciones son **no-destructivas** (no pierden datos)
- Se pueden revertir con `python <script>.py rollback`
- Populan automáticamente configuraciones default para sucursales existentes

---

### 2. Configurar Tasas de Impuesto por Sucursal

```python
from app.services import ConfigService
from database import SessionLocal

db = SessionLocal()
config_service = ConfigService(db)

# Configurar tasa de impuesto para una sucursal
branch_tax = config_service.set_branch_tax_rate(
    branch_id=1,
    tax_rate_id=1,  # ID de la tasa de impuesto
    user_id=1,      # Usuario que hace el cambio
    notes="Configuración inicial de impuestos para Buenos Aires"
)

# Obtener tasa efectiva para una sucursal
tax_info = config_service.get_tax_rate_for_branch(branch_id=1)
if tax_info:
    tax_id, tax_name, tax_percentage = tax_info
    print(f"Tasa: {tax_name} - {tax_percentage}%")
```

---

### 3. Configurar Métodos de Pago por Sucursal

```python
# Habilitar método de pago para una sucursal
config_service.toggle_payment_method_for_branch(
    branch_id=1,
    payment_method_id=2,  # ID del método de pago
    is_active=True,
    user_id=1
)

# Obtener métodos disponibles para una sucursal
methods = config_service.get_available_payment_methods(branch_id=1)
for method in methods:
    print(f"{method.payment_method.name}: {'Activo' if method.is_active else 'Inactivo'}")

# Validar método de pago antes de venta
try:
    payment_method = config_service.validate_payment_method(
        payment_method_code="CARD",
        branch_id=1
    )
    print(f"Método válido: {payment_method.name}")
except ValueError as e:
    print(f"Error: {e}")
```

---

### 4. Crear Ventas con Trazabilidad Automática

El `SaleService` ahora registra automáticamente las configuraciones usadas:

```python
from app.services import SaleService
from app.schemas import SaleCreate, SaleItemCreate

db = SessionLocal()
sale_service = SaleService(db)

# Crear venta - automáticamente registra configuraciones
sale_data = SaleCreate(
    sale_type="POS",
    payment_method="CASH",  # Se valida automáticamente
    items=[
        SaleItemCreate(
            product_id=1,
            quantity=2,
            unit_price=1000.00
        )
    ]
)

sale = sale_service.create_sale(
    sale_data=sale_data,
    user_id=1,
    branch_id=1  # Usa configuración de esta sucursal
)

# La venta ahora tiene:
print(f"Método de pago: {sale.payment_method_name}")
print(f"Tasa de impuesto: {sale.tax_rate_name} ({sale.tax_rate_percentage}%)")
print(f"Impuesto calculado: ${sale.tax_amount}")
```

---

### 5. Consultar Auditoría de Cambios

```python
# Ver cambios recientes en configuraciones
recent_changes = config_service.get_config_change_history(
    table_name="tax_rates",
    limit=50
)

for change in recent_changes:
    print(f"{change.changed_at}: {change.summary}")
    print(f"  Usuario: {change.changed_by.username if change.changed_by else 'Sistema'}")

# Ver cambios en un registro específico
history = config_service.get_config_change_history(
    table_name="branch_tax_rates",
    record_id=1
)

for change in history:
    print(f"{change.action}: {change.field_name} = {change.new_value}")
```

---

### 6. Monitoreo de Seguridad

```python
# Registrar intento de login
config_service.log_security_event(
    event_type="LOGIN",
    success="FAILED",
    username="admin",
    ip_address="192.168.1.100",
    details="Invalid password"
)

# Verificar intentos fallidos
attempts = config_service.get_failed_login_attempts(
    username="admin",
    hours=1
)
print(f"Intentos fallidos en la última hora: {attempts}")

# Check si debe bloquearse la cuenta
should_lockout, count = config_service.check_account_lockout(
    username="admin",
    max_attempts=5,
    lockout_hours=1
)

if should_lockout:
    print(f"ALERTA: Cuenta debe bloquearse ({count} intentos)")
```

---

## 📊 Diagramas de Relaciones

### Antes de la Reestructuración
```
┌──────────┐     ┌──────────┐     ┌─────────┐
│  sales   │────▶│ branches │────▶│  users  │
└──────────┘     └──────────┘     └─────────┘
      │
      └──────────▶ sale_items ──────▶ products

Configuraciones aisladas (sin FKs):
- ecommerce_config
- payment_methods
- tax_rates
- system_config
- whatsapp_config
```

### Después de la Reestructuración
```
┌──────────────────────────────────────────────────────┐
│                      SALES                            │
│  - payment_method_id (ref to payment_methods)        │
│  - tax_rate_id (ref to tax_rates)                    │
│  - payment_method_name (snapshot)                    │
│  - tax_rate_name (snapshot)                          │
│  - tax_rate_percentage (snapshot)                    │
└─────────────────┬────────────────────────────────────┘
                  │
                  ├──────────▶ branches ◀──────────┐
                  │                                  │
                  │                     ┌────────────┴────────────┐
                  │                     │  branch_tax_rates       │
                  │                     │  - branch_id (FK)       │
                  │                     │  - tax_rate_id (FK)     │
                  │                     └─────────────────────────┘
                  │                                  │
                  │                     ┌────────────┴────────────┐
                  │                     │  branch_payment_methods │
                  │                     │  - branch_id (FK)       │
                  │                     │  - payment_method_id    │
                  │                     └─────────────────────────┘
                  │
                  └──────────▶ config_change_log ──────▶ users
                              security_audit_log
```

---

## 📈 Reportes y Consultas Útiles

### Ventas por Método de Pago

```sql
SELECT
    payment_method_name,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue
FROM sales
WHERE created_at >= '2025-01-01'
GROUP BY payment_method_name
ORDER BY total_revenue DESC;
```

### Ventas por Tasa de Impuesto

```sql
SELECT
    tax_rate_name,
    tax_rate_percentage,
    COUNT(*) as sale_count,
    SUM(tax_amount) as total_tax_collected
FROM sales
WHERE tax_rate_id IS NOT NULL
GROUP BY tax_rate_name, tax_rate_percentage
ORDER BY total_tax_collected DESC;
```

### Métodos de Pago por Sucursal

```sql
SELECT
    b.name as branch_name,
    pm.name as payment_method,
    bpm.is_active,
    bpm.surcharge_override
FROM branch_payment_methods bpm
JOIN branches b ON bpm.branch_id = b.id
JOIN payment_methods pm ON bpm.payment_method_id = pm.id
WHERE bpm.is_active = true
ORDER BY b.name, pm.name;
```

### Auditoría de Cambios Recientes

```sql
SELECT
    ccl.changed_at,
    ccl.table_name,
    ccl.action,
    u.username as changed_by,
    ccl.notes
FROM config_change_log ccl
LEFT JOIN users u ON ccl.changed_by_user_id = u.id
ORDER BY ccl.changed_at DESC
LIMIT 50;
```

### Intentos de Login Fallidos

```sql
SELECT
    created_at,
    username,
    ip_address,
    user_agent
FROM security_audit_log
WHERE event_type = 'LOGIN'
  AND success = 'FAILED'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## 🔧 Troubleshooting

### Error: "Payment method not found"

**Causa:** La tabla `payment_methods` está vacía.

**Solución:**
```bash
make shell-backend
python migrate_payment_methods.py  # Ejecutar si no se ha hecho
exit
```

### Error: "No default tax rate configured"

**Causa:** No hay tasas de impuesto en el sistema.

**Solución:**
```bash
make shell-backend
python migrate_tax_rates.py  # Ejecutar si no se ha hecho
exit
```

O crear manualmente:
```python
from app.models import TaxRate
from database import SessionLocal

db = SessionLocal()
tax_rate = TaxRate(
    name="IVA 21%",
    rate=21.0,
    is_active=True,
    is_default=True,
    description="Impuesto al Valor Agregado general"
)
db.add(tax_rate)
db.commit()
```

### Ventas antiguas sin referencias

**Normal:** Las ventas creadas antes de la migración no tienen referencias.

**Para poblar (opcional):**
```bash
make shell-backend
python migrate_add_sales_references.py  # Re-ejecutar para popular
exit
```

### Reversión de cambios

Todas las migraciones pueden revertirse:
```bash
make shell-backend
python migrate_audit_tables.py rollback
python migrate_branch_config.py rollback
python migrate_add_sales_references.py rollback
exit
```

---

## 📚 Estructura de Archivos

```
backend/
├── app/
│   ├── models/
│   │   ├── sales.py              # ✏️ Modificado (referencias)
│   │   ├── branch_config.py      # ✨ Nuevo
│   │   └── audit.py              # ✨ Nuevo
│   │
│   ├── schemas/
│   │   └── sale.py               # ✏️ Modificado
│   │
│   ├── repositories/
│   │   └── config.py             # ✨ Nuevo (4 repositorios)
│   │
│   └── services/
│       ├── sale_service.py       # ✏️ Modificado (integración)
│       └── config_service.py     # ✨ Nuevo
│
├── migrate_add_sales_references.py     # ✨ Nuevo
├── migrate_branch_config.py            # ✨ Nuevo
└── migrate_audit_tables.py             # ✨ Nuevo
```

---

## 🎯 Beneficios Obtenidos

### 1. Trazabilidad Completa
- Cada venta registra las configuraciones exactas usadas
- Histórico inmutable para auditorías
- Reportes precisos por configuración

### 2. Flexibilidad Multi-Sucursal
- Cada sucursal puede tener sus propias tasas de impuesto
- Métodos de pago específicos por ubicación
- Recargos personalizados por sucursal

### 3. Auditoría y Cumplimiento
- Registro de todos los cambios de configuración
- Monitoreo de eventos de seguridad
- Cumplimiento de regulaciones (GDPR, SOX, etc.)

### 4. Integridad de Datos
- Validaciones automáticas de configuraciones
- Prevención de datos inválidos
- Referencias consistentes

### 5. Backward Compatibility
- Sistema existente sigue funcionando
- Datos históricos preservados
- Migraciones reversibles

---

## 📞 Soporte

Para consultas o problemas:
1. Revisar logs del backend: `make logs-backend`
2. Verificar estado de migraciones: revisar tablas con Adminer (http://localhost:8080)
3. Consultar este documento

---

## ✅ Checklist de Implementación

- [x] Fase 1: Referencias en Sales
  - [x] Crear migración
  - [x] Actualizar modelo Sale
  - [x] Actualizar schema Sale

- [x] Fase 2: Configuraciones por Sucursal
  - [x] Crear modelos branch_config
  - [x] Crear migración de tablas
  - [x] Popular configuraciones default

- [x] Fase 3: Auditoría
  - [x] Crear modelos de auditoría
  - [x] Crear migración de tablas
  - [x] Implementar logging automático

- [x] Fase 4: Servicios y Validaciones
  - [x] Crear repositorios de configuración
  - [x] Crear ConfigService
  - [x] Actualizar SaleService
  - [x] Integrar validaciones

- [x] Documentación
  - [x] Crear guía de uso
  - [x] Documentar consultas útiles
  - [x] Troubleshooting guide

---

**Implementado por:** Claude Code (Anthropic)
**Fecha:** Noviembre 2025
**Versión:** 1.0.0
