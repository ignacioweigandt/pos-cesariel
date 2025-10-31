# Instrucciones: Migración de Configuración de Moneda

## ⚠️ IMPORTANTE
Este proceso es **SEGURO** y **NO destructivo**. Solo agrega una nueva tabla `system_config` sin tocar ningún dato existente.

## 📋 Pasos para migrar

### 1. Acceder al contenedor del backend

```bash
make shell-backend
```

### 2. Ejecutar el script de migración

```bash
python migrate_system_config.py
```

### 3. Verificar que la migración fue exitosa

Deberías ver algo como:

```
============================================================
Migración: Agregar tabla system_config
============================================================
⊕ Creando tabla 'system_config'...
✓ Tabla 'system_config' creada exitosamente

⊕ Insertando configuración por defecto...
✓ Configuración por defecto insertada:
  - Moneda: ARS
  - Símbolo: $
  - Posición: before
  - Decimales: 2
  - ID: 1

============================================================
✅ Migración completada exitosamente
============================================================
```

### 4. Salir del contenedor

```bash
exit
```

### 5. Reiniciar el frontend (opcional pero recomendado)

```bash
make restart
```

O solo reiniciar el frontend:

```bash
docker-compose restart frontend
```

## ✅ Verificación

### Backend - API

Prueba que el endpoint funcione:

```bash
# Desde tu máquina local (fuera del contenedor)
curl http://localhost:8000/docs
```

Busca los endpoints:
- `GET /config/system`
- `GET /config/currency`
- `PUT /config/currency`

### Frontend - UI

1. Accede a la aplicación: http://localhost:3000
2. Login con admin/admin123
3. Ve a Settings → Currency
4. Deberías ver:
   - Moneda actual: Peso Argentino (ARS)
   - Símbolo: $
   - Posición: Antes del número
   - Decimales: 2

### Probar cambio de moneda

1. En Settings → Currency
2. Selecciona "Dólar Estadounidense (USD)"
3. El símbolo debería cambiar a "US$"
4. Cambia la posición o decimales si quieres
5. Click en "Guardar Configuración"
6. Ve al Dashboard o POS
7. Verifica que los precios usen el nuevo formato

## 🔍 Verificación en Base de Datos (opcional)

Si quieres verificar directamente en la BD:

```bash
# Acceder a PostgreSQL
make shell-db

# Verificar que existe la tabla
\dt system_config

# Ver el contenido
SELECT * FROM system_config;

# Salir
\q
```

Deberías ver:
```
 id | default_currency | currency_symbol | currency_position | decimal_places | ...
----+------------------+-----------------+-------------------+----------------+-----
  1 | ARS             | $               | before            |              2 | ...
```

## ❓ Troubleshooting

### Problema: "La tabla ya existe"

**Solución**: Si ves el mensaje "La tabla 'system_config' ya existe", todo está bien. El script detectó que ya se ejecutó y no hará cambios.

### Problema: Error de conexión a la base de datos

**Solución**:
```bash
# Verificar que los servicios estén corriendo
make status

# Si no están corriendo
make dev

# Luego intenta la migración de nuevo
make shell-backend
python migrate_system_config.py
```

### Problema: "Permission denied" o error de permisos

**Solución**: Asegúrate de estar dentro del contenedor del backend:
```bash
make shell-backend
python migrate_system_config.py
```

### Problema: El frontend no muestra los cambios

**Solución**:
```bash
# Limpiar cache del navegador y reiniciar frontend
make restart
```

O en el navegador:
- Chrome/Edge: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)

## 📊 ¿Qué hace este script?

1. **Verifica** si la tabla `system_config` ya existe
2. **Crea** la tabla solo si no existe
3. **Inserta** un registro de configuración por defecto (ARS, $, before, 2 decimales)
4. **No toca** ninguna otra tabla (users, products, sales, etc.)
5. **No modifica** ningún dato existente

## 🎯 Resultado esperado

Después de la migración:

✅ Nueva tabla `system_config` en la base de datos
✅ Configuración por defecto: ARS, $, antes, 2 decimales
✅ Todos tus datos existentes intactos
✅ Settings → Currency funcional
✅ Formato de moneda aplicado en toda la app

## 🚀 Próximos pasos

Una vez completada la migración, puedes:

1. **Cambiar la moneda** desde Settings → Currency
2. **Personalizar el formato** (símbolo, posición, decimales)
3. Los cambios se **aplican automáticamente** en:
   - Dashboard
   - POS/Ventas
   - Reportes
   - Inventario
   - E-commerce

## 📞 Soporte

Si tienes problemas:
1. Verifica los logs: `make logs-backend`
2. Verifica que el contenedor esté corriendo: `make status`
3. Intenta reiniciar: `make restart`
