# Integración: Métodos de Pago Dinámicos en el POS

## Resumen

Los **métodos de pago del POS** ahora se obtienen dinámicamente desde la configuración del sistema. Cuando deshabilitas un método de pago en Settings → Payment Methods, automáticamente desaparece del carrito del POS.

## Problema Resuelto

### Antes:
- ❌ Métodos de pago hardcodeados en el componente
- ❌ Siempre mostraba Efectivo, Tarjeta, Transferencia
- ❌ No respondía a la configuración del sistema

### Ahora:
- ✅ Métodos de pago obtenidos desde la API
- ✅ Solo muestra métodos habilitados (is_active=true)
- ✅ Se actualiza al recargar el POS
- ✅ Respeta la configuración de Settings

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Settings → Payment Methods                │
│  Usuario habilita/deshabilita métodos                        │
│  ├─ Efectivo ✅                                               │
│  ├─ Tarjeta de Débito ✅                                      │
│  ├─ Tarjeta de Crédito ❌ (deshabilitado)                    │
│  └─ Transferencia ✅                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    PUT /config/payment-methods/{id}
                    {"is_active": false}
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Base de Datos (payment_methods)                 │
│  id | name              | code        | is_active            │
│  1  | Efectivo          | CASH        | ✅ true              │
│  2  | Tarjeta de Débito | DEBIT_CARD  | ✅ true              │
│  3  | Tarjeta de Crédito| CREDIT_CARD | ❌ false             │
│  4  | Transferencia     | TRANSFER    | ✅ true              │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    GET /config/payment-methods
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 POS → Carrito (FloatingCart)                 │
│  usePaymentMethods()                                         │
│  ├─ Efectivo 💵 [seleccionable]                              │
│  ├─ Tarjeta de Débito 💳 [seleccionable]                    │
│  └─ Transferencia 🏦 [seleccionable]                         │
│                                                               │
│  ⚠️ Tarjeta de Crédito NO aparece (está deshabilitada)      │
└─────────────────────────────────────────────────────────────┘
```

## Implementación

### 1. Hook `usePaymentMethods`

**Ubicación:** `frontend/pos-cesariel/features/pos/hooks/usePaymentMethods.ts`

```typescript
export function usePaymentMethods() {
  const [methods, setMethods] = useState<POSPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    const response = await configurationApi.getPaymentMethods();
    const dbMethods = response.data;

    // Filtrar solo métodos activos
    const activeMethods = dbMethods
      .filter(method => method.is_active)
      .map(method => ({
        code: DB_TO_POS_CODE[method.code],
        name: method.name,
        icon: method.icon,
        color: PAYMENT_COLORS[posCode],
        requires_change: method.requires_change,
      }));

    setMethods(activeMethods);
  };

  return { methods, loading, error, reload };
}
```

**Características:**
- ✅ Carga métodos desde la API
- ✅ Filtra solo activos (`is_active === true`)
- ✅ Mapea códigos de BD a códigos del POS
- ✅ Fallback a métodos por defecto si falla la API
- ✅ Función `reload()` para refrescar

### 2. Componente `PaymentMethodStep`

**Ubicación:** `frontend/pos-cesariel/features/pos/components/Cart/_steps/PaymentMethodStep.tsx`

**Antes:**
```tsx
// Hardcodeado
<div className="grid grid-cols-3">
  <button>Efectivo</button>
  <button>Tarjeta</button>
  <button>Transferencia</button>
</div>
```

**Ahora:**
```tsx
const { methods, loading } = usePaymentMethods();

if (loading) return <Spinner />;
if (methods.length === 0) return <NoMethodsMessage />;

<div className={`grid gap-3 ${methods.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
  {methods.map((method, index) => (
    <button key={method.code}>
      <Icon />
      <span>{method.name}</span>
    </button>
  ))}
</div>
```

**Características:**
- ✅ Renderiza dinámicamente según métodos activos
- ✅ Grid adaptativo (2 columnas si hay ≤2 métodos, 3 si hay más)
- ✅ Loading state con spinner
- ✅ Empty state si no hay métodos
- ✅ Iconos y colores personalizados por método

### 3. Mapeo de Códigos

**De BD a POS:**
```typescript
const DB_TO_POS_CODE = {
  'CASH': 'efectivo',
  'DEBIT_CARD': 'tarjeta_debito',
  'CREDIT_CARD': 'tarjeta_credito',
  'TRANSFER': 'transferencia',
};
```

**Para compatibilidad con teclado:**
```typescript
// tarjeta_debito y tarjeta_credito se mapean a 'tarjeta'
// para mantener la navegación por teclado simple
const mapToKeyboardCode = (code: string) => {
  if (code === 'tarjeta_debito' || code === 'tarjeta_credito') {
    return 'tarjeta';
  }
  return code;
};
```

## Flujo de Usuario

### Escenario 1: Deshabilitar Efectivo

1. **Settings → Payment Methods**
   - Administrador deshabilita "Efectivo"
   - Se guarda en BD: `payment_methods.is_active = false`

2. **POS → Nueva Venta**
   - Usuario agrega productos al carrito
   - Presiona "Finalizar Venta"
   - **Solo aparecen**: Tarjeta de Débito, Tarjeta de Crédito, Transferencia
   - **NO aparece**: Efectivo ✅

### Escenario 2: Solo Efectivo y Transferencia

1. **Settings → Payment Methods**
   - Administrador deshabilita tarjetas
   - Habilita solo Efectivo y Transferencia

2. **POS → Carrito**
   - Grid de 2 columnas (adaptativo)
   - Botones: Efectivo | Transferencia
   - Navegación más simple (solo 2 opciones)

## Estados Especiales

### Loading State
```tsx
<div className="flex justify-center items-center py-8">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
```

### No Methods Available
```tsx
<div className="text-center py-4 text-gray-500">
  <p className="text-sm">No hay métodos de pago habilitados</p>
  <p className="text-xs mt-1">Configure métodos de pago en Configuración</p>
</div>
```

## Pruebas

### ✅ Prueba 1: Deshabilitar un método

1. Ve a Settings → Payment Methods
2. Deshabilita "Efectivo"
3. Ve al POS
4. Agrega productos y abre el carrito
5. **Verificar**: Efectivo NO aparece ✅

### ✅ Prueba 2: Habilitar nuevamente

1. Settings → Payment Methods
2. Habilita "Efectivo"
3. Recarga el POS (F5)
4. Abre el carrito
5. **Verificar**: Efectivo aparece de nuevo ✅

### ✅ Prueba 3: Sin métodos activos

1. Settings → Payment Methods
2. Deshabilita TODOS los métodos
3. Ve al POS
4. Intenta finalizar venta
5. **Verificar**: Mensaje "No hay métodos de pago habilitados" ✅

### ✅ Prueba 4: Grid adaptativo

1. Habilita solo 2 métodos (Efectivo, Transferencia)
2. Abre carrito en POS
3. **Verificar**: Grid de 2 columnas ✅

4. Habilita 3 o más métodos
5. Recarga
6. **Verificar**: Grid de 3 columnas ✅

## Consideraciones

### Navegación por Teclado

El hook `useCartKeyboard` sigue usando un array fijo de métodos. Para mantener la compatibilidad:

- Tarjeta de Débito y Crédito se mapean a `'tarjeta'`
- Esto mantiene la navegación simple: ← → entre métodos
- Si se necesita navegación dinámica, se puede extender el hook

### Cache y Recargas

- Los métodos se cargan **una vez** al montar el componente
- Para refrescar: **recargar el POS** (F5)
- Futuro: Implementar polling o WebSocket para updates en tiempo real

### Fallback por Seguridad

Si la API falla, el hook usa métodos por defecto:
- Efectivo
- Tarjeta de Débito
- Tarjeta de Crédito
- Transferencia

Esto asegura que el POS siempre funcione, incluso con problemas de red.

## Archivos Modificados/Creados

### Nuevos Archivos
- `frontend/pos-cesariel/features/pos/hooks/usePaymentMethods.ts`
- `POS_DYNAMIC_PAYMENT_METHODS.md` (este archivo)

### Archivos Modificados
- `frontend/pos-cesariel/features/pos/components/Cart/_steps/PaymentMethodStep.tsx`

## Beneficios

✅ **Sincronización**: POS refleja la configuración del sistema
✅ **Flexibilidad**: Administrador controla qué métodos están disponibles
✅ **UX mejorada**: Grid adaptativo según cantidad de métodos
✅ **Mantenibilidad**: No más código hardcodeado
✅ **Consistencia**: Una fuente de verdad (la BD)

## Próximos Pasos (Opcionales)

1. **WebSocket Updates**: Actualizar POS en tiempo real cuando cambia la configuración
2. **Navegación por teclado dinámica**: Ajustar `useCartKeyboard` para usar métodos dinámicos
3. **Preferencias de usuario**: Recordar último método de pago usado
4. **Validaciones avanzadas**: Método por defecto obligatorio, mínimo 1 método activo

## Soporte

Para verificar que funciona:

```bash
# 1. Ver métodos en BD
docker-compose exec db psql -U postgres -d pos_cesariel \
  -c "SELECT id, name, code, is_active FROM payment_methods;"

# 2. Deshabilitar uno
# Settings → Payment Methods → Toggle off

# 3. Ver en POS
# http://localhost:3000/pos → Agregar productos → Carrito
```
