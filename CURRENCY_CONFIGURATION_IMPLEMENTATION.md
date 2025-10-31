# Implementación de Configuración de Moneda

## Resumen

Se ha implementado un sistema completo de configuración de moneda que permite cambiar la moneda del sistema (ARS o USD) y personalizar el formato de precios en toda la aplicación.

## Características Implementadas

### Backend

1. **Modelo de Base de Datos** (`SystemConfig`)
   - Tabla `system_config` para almacenar configuración del sistema
   - Campos de moneda:
     - `default_currency`: ARS o USD (validado a nivel de enum)
     - `currency_symbol`: Símbolo de moneda ($, US$, etc.)
     - `currency_position`: "before" o "after" (posición del símbolo)
     - `decimal_places`: 0-2 decimales
   - Ubicación: `backend/app/models/system_config.py`

2. **Schemas de Validación**
   - `SystemConfigBase`, `SystemConfigCreate`, `SystemConfigUpdate`, `SystemConfigResponse`
   - `CurrencyConfigResponse` (solo campos de moneda)
   - Validación estricta: solo ARS y USD permitidos
   - Ubicación: `backend/app/schemas/system_config.py`

3. **Endpoints de API**
   - `GET /config/system` - Obtener configuración completa del sistema
   - `PUT /config/system` - Actualizar configuración del sistema
   - `GET /config/currency` - Obtener solo configuración de moneda
   - `PUT /config/currency` - Actualizar solo configuración de moneda
   - Todos requieren permisos de ADMIN o MANAGER
   - Ubicación: `backend/routers/config.py`

4. **Inicialización de Datos**
   - Script `init_data.py` actualizado para crear configuración por defecto (ARS)
   - La configuración se crea automáticamente si no existe
   - Ubicación: `backend/init_data.py`

### Frontend

1. **Context Global de Moneda**
   - `CurrencyProvider`: Context que carga y mantiene la configuración de moneda
   - `useCurrency()`: Hook para acceder a la configuración en cualquier componente
   - Carga automática al iniciar la aplicación
   - Recarga manual con `reload()`
   - Ubicación: `frontend/pos-cesariel/shared/contexts/CurrencyContext.tsx`

2. **Utilidades de Formateo**
   - `formatCurrency()`: Formatea números según la configuración global
   - `formatPrice()`: Alias con soporte para moneda específica
   - `formatCurrencyCustom()`: Formateo con configuración personalizada
   - `getCurrencySymbol()`: Obtiene el símbolo actual
   - `getCurrencyConfig()`: Obtiene la configuración completa
   - Sincronización automática con la configuración del Context
   - Ubicación: `frontend/pos-cesariel/shared/utils/format/currency.ts`

3. **Integración en la Aplicación**
   - `Providers`: Componente que envuelve la app con todos los contexts
   - Incluye `CurrencyProvider` y `Toaster` (notificaciones)
   - Integrado en el layout raíz
   - Ubicación: `frontend/pos-cesariel/app/providers.tsx`

4. **Página de Configuración**
   - UI para cambiar moneda (solo ARS y USD)
   - Configuración de formato (posición del símbolo, decimales)
   - Vista previa en tiempo real
   - Persistencia en base de datos
   - Ubicación: `frontend/pos-cesariel/app/settings/currency/page.tsx`

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              CurrencyProvider (Context)                  │ │
│  │  - Carga config desde API                               │ │
│  │  - Actualiza utilidades globales                        │ │
│  │  - Provee hook useCurrency()                            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         formatCurrency() Utilities (Global)             │ │
│  │  - Formateo consistente en toda la app                  │ │
│  │  - Usa configuración del Context                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ↓                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Components  │  │     POS      │  │    Reportes      │  │
│  │  (Dashboard) │  │  (Ventas)    │  │  (Analytics)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                              ↑ ↓
                         HTTP API Calls
                              ↑ ↓
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          Endpoints (/config/system, /config/currency)   │ │
│  │  GET  /config/system    - Toda la config del sistema    │ │
│  │  PUT  /config/system    - Actualizar config sistema     │ │
│  │  GET  /config/currency  - Solo config de moneda         │ │
│  │  PUT  /config/currency  - Actualizar solo moneda        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              SystemConfig Model (SQLAlchemy)             │ │
│  │  - default_currency: Enum(ARS, USD)                      │ │
│  │  - currency_symbol: String                               │ │
│  │  - currency_position: Enum(before, after)                │ │
│  │  - decimal_places: Integer (0-2)                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            PostgreSQL Database                           │ │
│  │  Table: system_config                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

1. **Inicialización**
   - App inicia → `CurrencyProvider` carga configuración desde API
   - Configuración se guarda en Context y actualiza utilidades globales
   - Todos los componentes tienen acceso via `useCurrency()`

2. **Formateo de Precios**
   - Componente necesita mostrar precio
   - Opción A: Usa `useCurrency().formatPrice(amount)`
   - Opción B: Usa `formatCurrency(amount)` (utility global)
   - Ambos usan la misma configuración

3. **Cambio de Configuración**
   - Usuario va a Settings → Currency
   - Modifica moneda o formato
   - Click en "Guardar"
   - API actualiza BD
   - Context recarga configuración
   - Toda la UI se actualiza automáticamente

## Restricciones

- **Monedas permitidas**: Solo ARS (Peso Argentino) y USD (Dólar Estadounidense)
- **Decimales**: Entre 0 y 2
- **Posición**: "before" (antes) o "after" (después)
- **Permisos**: Solo ADMIN y MANAGER pueden modificar

## Validaciones

### Backend
- Validación de enum a nivel de SQLAlchemy
- Validación de schema con Pydantic
- Mensajes de error claros en español

### Frontend
- Validación en formulario
- Mensajes de error con toast notifications
- Solo opciones válidas disponibles

## Testing

### Casos de Prueba Backend

```bash
# Dentro del contenedor backend
make shell-backend

# Test: Obtener configuración del sistema
curl -X GET http://localhost:8000/config/system \
  -H "Authorization: Bearer TOKEN"

# Test: Actualizar moneda a USD
curl -X PUT http://localhost:8000/config/currency \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"default_currency":"USD","currency_symbol":"US$"}'

# Test: Actualizar decimales
curl -X PUT http://localhost:8000/config/currency \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decimal_places":0}'
```

### Casos de Prueba Frontend

1. **Cambio de Moneda**
   - Ir a Settings → Currency
   - Cambiar de ARS a USD
   - Verificar que el símbolo cambia
   - Guardar y verificar que persiste

2. **Cambio de Formato**
   - Cambiar posición del símbolo (antes/después)
   - Cambiar decimales (0, 1, 2)
   - Verificar vista previa en tiempo real

3. **Propagación Global**
   - Cambiar configuración
   - Ir al Dashboard
   - Verificar que los precios usan el nuevo formato
   - Ir al POS
   - Verificar que los precios usan el nuevo formato

## Migraciones

Si ya tienes una base de datos existente sin la tabla `system_config`:

```bash
# Opción 1: Reinicializar datos (DESTRUCTIVO)
make shell-backend
python init_data.py

# Opción 2: Crear solo la tabla (preserva datos)
make shell-backend
python
>>> from database import engine, Base
>>> from app.models import SystemConfig
>>> Base.metadata.create_all(bind=engine, tables=[SystemConfig.__table__])
>>> exit()
```

Luego crear la configuración por defecto:

```python
from database import SessionLocal
from app.models import SystemConfig

db = SessionLocal()
config = SystemConfig(
    default_currency="ARS",
    currency_symbol="$",
    currency_position="before",
    decimal_places=2,
    default_tax_rate=0,
    session_timeout=30
)
db.add(config)
db.commit()
db.close()
```

## Uso en Componentes

### Con Hook (Recomendado)

```tsx
'use client';

import { useCurrency } from '@/shared/contexts/CurrencyContext';

function ProductCard({ product }) {
  const { formatPrice } = useCurrency();

  return (
    <div>
      <h3>{product.name}</h3>
      <p>Precio: {formatPrice(product.price)}</p>
    </div>
  );
}
```

### Con Utility (Para funciones/utils)

```typescript
import { formatCurrency } from '@/shared/utils/format/currency';

function calculateTotal(items: Item[]) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return formatCurrency(total);
}
```

## Consideraciones de Performance

- La configuración se carga **una vez** al iniciar la app
- Se guarda en memoria (Context)
- No hay llamadas adicionales a la API por cada formateo
- Las utilidades globales son síncronas y rápidas

## Próximos Pasos (Opcional)

1. **Conversión de Moneda**
   - Integrar API de tipos de cambio
   - Permitir mostrar precios en ambas monedas

2. **Más Monedas**
   - Agregar EUR, BRL, etc.
   - Mantener validación estricta

3. **Formato Localizado**
   - Usar Intl.NumberFormat con locale dinámico
   - Separadores de miles personalizables

4. **Historial de Cambios**
   - Auditoría de cambios de configuración
   - Quién y cuándo cambió la moneda

## Soporte

Para problemas o dudas:
1. Revisar logs del backend: `make logs-backend`
2. Revisar consola del navegador
3. Verificar que la tabla `system_config` existe
4. Verificar que hay un registro en `system_config`
