# Guía de Migraciones con Alembic - POS Cesariel

## ¿Por qué Alembic?

Antes usábamos `Base.metadata.create_all()` que tiene estos problemas:
- ❌ No hay historial de cambios
- ❌ No se pueden revertir cambios
- ❌ Pérdida de datos al modificar esquema
- ❌ No es reproducible entre entornos

Con Alembic tenemos:
- ✅ Historial versionado de cambios de esquema
- ✅ Rollback seguro con `downgrade`
- ✅ Migraciones que preservan datos
- ✅ Control de versiones del esquema en git
- ✅ Migraciones automáticas con `--autogenerate`

---

## Comandos Rápidos (Makefile)

```bash
# Ver migraciones actuales
make migrate-current

# Ver historial completo
make migrate-history

# Crear nueva migración
make migrate-create MSG="add user avatar column"

# Aplicar migraciones pendientes
make migrate-upgrade

# Revertir última migración
make migrate-downgrade
```

---

## Workflow Completo

### 1. Modificar Modelos

Editá tus modelos en `backend/app/models/`:

```python
# backend/app/models/user.py
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    # NUEVO: Agregar columna
    avatar_url = Column(String, nullable=True)
```

### 2. Generar Migración

```bash
make migrate-create MSG="add avatar_url to users"
```

Esto genera un archivo en `backend/alembic/versions/` con formato:
```
YYYYMMDD_HHMM_<revision>_add_avatar_url_to_users.py
```

### 3. Revisar Migración Generada

**IMPORTANTE**: Alembic auto-genera el código pero **SIEMPRE debés revisarlo**.

```python
# backend/alembic/versions/20260128_1530_abc123_add_avatar_url_to_users.py

def upgrade() -> None:
    """Apply migration changes"""
    # Alembic detectó el cambio automáticamente
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))

def downgrade() -> None:
    """Revert migration changes"""
    op.drop_column('users', 'avatar_url')
```

**Cosas a verificar:**
- ✅ ¿El upgrade hace lo que esperás?
- ✅ ¿El downgrade revierte correctamente?
- ✅ ¿Se preservan los datos existentes?
- ✅ ¿Hay valores por default para columnas NOT NULL?

### 4. Aplicar Migración

```bash
make migrate-upgrade
```

Esto ejecuta:
```
alembic upgrade head
```

Verás output como:
```
INFO  [alembic.runtime.migration] Running upgrade abc123 -> def456, add avatar_url to users
✅ Migraciones aplicadas
```

### 5. Verificar en Base de Datos

```bash
make shell-db
```

```sql
\d users  -- Ver estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';
```

---

## Casos Comunes

### Agregar Columna NOT NULL

**PROBLEMA**: No podés agregar directamente una columna NOT NULL a una tabla con datos.

**SOLUCIÓN**: Hacerlo en 2 pasos:

```python
# Paso 1: Agregar columna nullable con default
def upgrade():
    op.add_column('users', sa.Column('phone', sa.String(), nullable=True))
    # Llenar datos existentes
    op.execute("UPDATE users SET phone = 'sin-telefono' WHERE phone IS NULL")
    # Ahora hacerla NOT NULL
    op.alter_column('users', 'phone', nullable=False)
```

### Renombrar Columna

Alembic a veces no detecta renombres, los ve como drop + add.

```python
# Migración manual para renombrar
def upgrade():
    op.alter_column('users', 'old_name', new_column_name='new_name')

def downgrade():
    op.alter_column('users', 'new_name', new_column_name='old_name')
```

### Migrar Datos Existentes

```python
from alembic import op
import sqlalchemy as sa

def upgrade():
    # 1. Agregar nueva columna
    op.add_column('products', sa.Column('category_id', sa.Integer(), nullable=True))
    
    # 2. Migrar datos
    connection = op.get_bind()
    connection.execute("""
        UPDATE products 
        SET category_id = (SELECT id FROM categories WHERE name = products.old_category)
    """)
    
    # 3. Agregar constraint
    op.create_foreign_key('fk_product_category', 'products', 'categories', ['category_id'], ['id'])
```

### Agregar Índice

```python
def upgrade():
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade():
    op.drop_index('idx_users_email', 'users')
```

---

## Comandos Avanzados

### Ver SQL sin aplicar

```bash
docker compose exec backend alembic upgrade head --sql
```

### Aplicar migración específica

```bash
docker compose exec backend alembic upgrade abc123
```

### Revertir a versión específica

```bash
docker compose exec backend alembic downgrade abc123
```

### Ver diferencias con base actual

```bash
docker compose exec backend alembic check
```

---

## Flujo en Producción

### Primera Vez (Migración Inicial)

Si ya tenés datos en producción:

1. **Crear migración inicial** que coincida con tu esquema actual:
```bash
make migrate-init
```

2. **Marcar como aplicada SIN ejecutarla** (porque las tablas ya existen):
```bash
docker compose exec backend alembic stamp head
```

### Deploy de Nueva Migración

```bash
# 1. En desarrollo: crear y probar migración
make migrate-create MSG="add new feature"
make migrate-upgrade

# 2. Commitear migración a git
git add backend/alembic/versions/
git commit -m "feat: add new feature migration"

# 3. En producción: aplicar migración
# (Hacer backup primero!)
make backup-db
make migrate-upgrade
```

---

## Troubleshooting

### Error: "target database is not up to date"

```bash
# Ver estado actual
make migrate-current

# Ver qué falta aplicar
make migrate-history

# Aplicar pendientes
make migrate-upgrade
```

### Error: "Can't locate revision identified by 'abc123'"

Tu base de datos tiene una migración que no existe en código. Opciones:

1. **Si es desarrollo**: Recrear BD
```bash
make clean-volumes
make dev
make migrate-upgrade
```

2. **Si es producción**: Restaurar migración faltante desde git

### Quiero deshacer una migración ya aplicada

```bash
# Revertir última
make migrate-downgrade

# Si ya la commiteaste, crear nueva migración que revierta:
make migrate-create MSG="revert problematic change"
# Editar manualmente para revertir cambios
```

---

## Mejores Prácticas

1. **✅ Siempre revisar migraciones auto-generadas**
   - Alembic no es perfecto, puede generar cosas incorrectas

2. **✅ Probar en desarrollo primero**
   - Nunca aplicar en prod sin probar en dev

3. **✅ Hacer backup antes de migrar en producción**
   ```bash
   make backup-db
   ```

4. **✅ Commitear migraciones con el código**
   - La migración es parte del código

5. **✅ Una migración por feature/cambio**
   - No mezclar cambios no relacionados

6. **✅ Escribir mensajes descriptivos**
   ```bash
   # ❌ MAL
   make migrate-create MSG="changes"
   
   # ✅ BIEN
   make migrate-create MSG="add user avatar and bio fields"
   ```

7. **✅ Incluir downgrade siempre**
   - Siempre tené un plan de rollback

8. **❌ NUNCA editar migraciones ya aplicadas**
   - Crear una nueva migración en su lugar

9. **❌ NUNCA borrar migraciones ya aplicadas**
   - Rompe el historial

10. **✅ Documentar migraciones complejas**
    - Si la migración toca datos, explicar en comentarios

---

## Preguntas Frecuentes

### ¿Puedo usar Alembic con datos existentes?

Sí, usá `alembic stamp head` para marcar la migración inicial como aplicada sin ejecutarla.

### ¿Qué pasa si 2 personas crean migraciones al mismo tiempo?

Alembic detecta branches y te avisa. Tenés que mergear manualmente:

```bash
docker compose exec backend alembic merge heads -m "merge migrations"
```

### ¿Debo commitear los archivos de versión?

**SÍ**, las migraciones son código y deben estar en git.

### ¿Puedo testear migraciones?

Sí, en tests podés:

```python
from alembic.config import Config
from alembic import command

def test_migrations_run():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    # Verificar que funcionó
```

---

## Referencias

- [Documentación oficial de Alembic](https://alembic.sqlalchemy.org/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [Auto-generate Docs](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)
