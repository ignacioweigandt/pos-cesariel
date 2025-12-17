# Feature: Configuración

Sistema centralizado de configuración para POS Cesariel.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Estructura](#estructura)
- [Uso](#uso)
- [Hooks Disponibles](#hooks-disponibles)
- [Componentes](#componentes)
- [Tipos](#tipos)
- [Utilidades](#utilidades)

## Descripción

Este feature maneja toda la configuración del sistema POS, incluyendo:

- ✅ Métodos de pago y recargos
- ✅ **Cuotas personalizadas** (FUNCIONALIDAD NUEVA)
- ✅ Configuración de moneda (restringida a ARS y USD)
- ✅ Tasas de impuestos
- ✅ Notificaciones y alertas
- ✅ Seguridad y respaldos

## Estructura

```
features/configuracion/
├── index.ts                    # Exports principales
├── types/                      # TypeScript types
│   ├── config.types.ts        # 200+ líneas de tipos
│   └── index.ts
├── api/                        # API client
│   ├── configApi.ts           # 220+ líneas con 30+ métodos
│   └── index.ts
├── hooks/                      # Custom hooks
│   ├── usePaymentConfig.ts
│   ├── useCustomInstallments.ts   ← NUEVO
│   ├── useCurrencyConfig.ts       ← RESTRINGIDO A ARS/USD
│   ├── useTaxRates.ts
│   └── index.ts
├── components/                 # React components
│   ├── CustomInstallments/
│   │   └── CustomInstallmentsManager.tsx   ← NUEVO
│   └── index.ts
└── utils/                      # Utilities
    ├── formatters.ts
    ├── validators.ts
    └── index.ts
```

## Uso

### Importar desde el feature

```typescript
import {
  // Hooks
  usePaymentConfig,
  useCustomInstallments,
  useCurrencyConfig,
  useTaxRates,

  // Components
  CustomInstallmentsManager,

  // Types
  PaymentConfig,
  CustomInstallment,
  CurrencyCode,
  TaxRate,

  // Utils
  formatPrice,
  validateSurcharge,
} from '@/features/configuracion';
```

## Hooks Disponibles

### usePaymentConfig

Gestiona configuraciones de métodos de pago.

```typescript
const {
  configs,              // PaymentConfig[]
  loading,              // boolean
  error,                // Error | null
  reload,               // () => Promise<void>
  createConfig,         // (data: PaymentConfigCreate) => Promise<PaymentConfig>
  updateConfig,         // (id: number, data: PaymentConfigUpdate) => Promise<PaymentConfig>
  deleteConfig,         // (id: number) => Promise<void>
  toggleActive,         // (id: number) => Promise<void>
} = usePaymentConfig();
```

### useCustomInstallments (NUEVO)

Gestiona cuotas personalizadas para tarjetas.

```typescript
const {
  installments,                // CustomInstallment[]
  loading,                     // boolean
  error,                       // Error | null
  reload,                      // (cardType?: CardType) => Promise<void>
  createInstallment,           // (data: CustomInstallmentCreate) => Promise<CustomInstallment>
  updateInstallment,           // (id: number, data: Partial<CustomInstallmentCreate>) => Promise<CustomInstallment>
  deleteInstallment,           // (id: number) => Promise<void>
  toggleActive,                // (id: number) => Promise<void>
  getInstallmentsByCardType,   // (type: CardType) => CustomInstallment[]
  getActiveInstallments,       // (type?: CardType) => CustomInstallment[]
} = useCustomInstallments({ cardType: 'bancarizadas' });
```

**Ejemplo de uso:**

```typescript
'use client';

import { useCustomInstallments } from '@/features/configuracion';

function MyComponent() {
  const { installments, createInstallment, loading } = useCustomInstallments({
    cardType: 'bancarizadas'
  });

  const handleCreate = async () => {
    await createInstallment({
      card_type: 'bancarizadas',
      installments: 18,
      surcharge_percentage: 35.0,
      description: 'Plan especial 18 cuotas'
    });
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {installments.map(inst => (
        <div key={inst.id}>
          {inst.installments} cuotas - {inst.surcharge_percentage}%
        </div>
      ))}
      <button onClick={handleCreate}>Agregar Cuota</button>
    </div>
  );
}
```

### useCurrencyConfig

Gestiona configuración de moneda (solo ARS y USD).

```typescript
const {
  config,                 // CurrencyConfig
  availableCurrencies,    // Currency[] (solo ARS y USD)
  currentCurrency,        // Currency | undefined
  loading,                // boolean
  saving,                 // boolean
  error,                  // Error | null
  reload,                 // () => Promise<void>
  updateConfig,           // (data: Partial<CurrencyConfig>) => Promise<CurrencyConfig>
  changeCurrency,         // (code: CurrencyCode) => Promise<void>
  formatPrice,            // (amount: number, customConfig?: Partial<CurrencyConfig>) => string
} = useCurrencyConfig();
```

**Características:**
- ✅ Solo permite ARS y USD
- ✅ Validación estricta de tipos
- ✅ Formateo de precios integrado

### useTaxRates

Gestiona tasas de impuestos.

```typescript
const {
  taxRates,              // TaxRate[]
  loading,               // boolean
  error,                 // Error | null
  reload,                // () => Promise<void>
  createTaxRate,         // (data: TaxRateCreate) => Promise<TaxRate>
  updateTaxRate,         // (id: number, data: TaxRateUpdate) => Promise<TaxRate>
  deleteTaxRate,         // (id: number) => Promise<void>
  setDefaultTaxRate,     // (id: number) => Promise<void>
  toggleActive,          // (id: number) => Promise<void>
  getDefaultTaxRate,     // () => TaxRate | undefined
  getActiveTaxRates,     // () => TaxRate[]
} = useTaxRates();
```

## Componentes

### CustomInstallmentsManager (NUEVO)

Componente completo para gestionar cuotas personalizadas.

```typescript
import { CustomInstallmentsManager } from '@/features/configuracion';

function PaymentMethodsPage() {
  return (
    <div>
      <h1>Métodos de Pago</h1>

      {/* Cuotas para tarjetas bancarizadas */}
      <CustomInstallmentsManager
        cardType="bancarizadas"
        title="Tarjetas Bancarizadas"
        color="green"
      />

      {/* Cuotas para tarjetas no bancarizadas */}
      <CustomInstallmentsManager
        cardType="no_bancarizadas"
        title="Tarjetas No Bancarizadas"
        color="orange"
      />
    </div>
  );
}
```

**Props:**
- `cardType`: `'bancarizadas' | 'no_bancarizadas'` - Tipo de tarjeta
- `title`: `string` - Título del componente
- `color?: string` - Color del tema (default: 'blue')

**Funcionalidades:**
- ✅ Formulario inline para crear/editar
- ✅ Lista de cuotas con ordenamiento
- ✅ Toggle para activar/desactivar
- ✅ Validaciones integradas (1-60 cuotas, 0-100% recargo)
- ✅ Confirmación antes de eliminar

## Tipos

### Tipos Principales

```typescript
// Cuotas Personalizadas
export interface CustomInstallment {
  id: number;
  card_type: 'bancarizadas' | 'no_bancarizadas';
  installments: number;              // 1-60
  surcharge_percentage: number;      // 0-100
  is_active: boolean;
  description: string;
  created_at?: string;
}

// Moneda (RESTRINGIDO)
export type CurrencyCode = 'ARS' | 'USD';  // Solo estas dos

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  country: string;
}

// Configuración de Pago
export interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: 'bancarizadas' | 'no_bancarizadas' | 'tarjeta_naranja';
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
}

// Tasa de Impuesto
export interface TaxRate {
  id: number;
  name: string;
  rate: number;                      // 0-100
  is_active: boolean;
  is_default: boolean;
  description: string;
}
```

Ver `types/config.types.ts` para la lista completa.

## Utilidades

### Formatters

```typescript
import {
  formatPrice,
  formatSurcharge,
  formatInstallments,
  formatCardType,
} from '@/features/configuracion/utils';

// Formatear precio con configuración
formatPrice(1234.56, config);
// → "$1234.56" o "1234.56$"

// Formatear recargo
formatSurcharge(15);       // → "+15%"
formatSurcharge(0);        // → "Sin recargo"

// Formatear cuotas
formatInstallments(3);     // → "3 cuotas"
formatInstallments(1);     // → "1 cuota"

// Formatear tipo de tarjeta
formatCardType('bancarizadas');  // → "Tarjetas Bancarizadas"
```

### Validators

```typescript
import {
  validateCurrencyCode,
  validateInstallments,
  validateSurcharge,
  validateTaxRate,
} from '@/features/configuracion/utils';

// Validar código de moneda (solo ARS o USD)
validateCurrencyCode('ARS');  // → true
validateCurrencyCode('EUR');  // → false

// Validar número de cuotas (1-60)
validateInstallments(18);     // → true
validateInstallments(0);      // → false
validateInstallments(61);     // → false

// Validar recargo (0-100%)
validateSurcharge(15.5);      // → true
validateSurcharge(-1);        // → false
validateSurcharge(101);       // → false

// Validar tasa de impuesto (0-100%)
validateTaxRate(21);          // → true
validateTaxRate(-5);          // → false
```

## API Backend Requerida

Este feature requiere los siguientes endpoints en el backend:

### Cuotas Personalizadas (NUEVOS)

- `GET /config/custom-installments` - Obtener cuotas
- `POST /config/custom-installments` - Crear cuota
- `PUT /config/custom-installments/{id}` - Actualizar cuota
- `DELETE /config/custom-installments/{id}` - Eliminar cuota
- `PATCH /config/custom-installments/{id}/toggle` - Activar/desactivar

### Endpoints Existentes

- `GET/PUT /config/payment-methods` - Métodos de pago
- `GET/POST/PUT/DELETE /config/payment-config` - Configuración de pagos
- `GET/PUT /config/currency` - Configuración de moneda
- `GET/POST/PUT/DELETE /config/tax-rates` - Tasas de impuestos

Ver documento `MODULO_CONFIGURACION_PLAN_DESARROLLO.md` para especificaciones completas del backend.

## Testing

### Ejemplo de Test para Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCustomInstallments } from './useCustomInstallments';

describe('useCustomInstallments', () => {
  it('should load installments on mount', async () => {
    const { result } = renderHook(() =>
      useCustomInstallments({ cardType: 'bancarizadas' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.installments).toBeInstanceOf(Array);
  });

  it('should validate installments range', async () => {
    const { result } = renderHook(() => useCustomInstallments());

    await expect(
      result.current.createInstallment({
        card_type: 'bancarizadas',
        installments: 61, // Inválido
        surcharge_percentage: 10,
        description: 'Test'
      })
    ).rejects.toThrow();
  });
});
```

## Notas Importantes

### Restricción de Monedas

Este feature **SOLO** permite Peso Argentino (ARS) y Dólar Estadounidense (USD). Cualquier intento de usar otra moneda será rechazado tanto en frontend como backend.

```typescript
// ✅ Válido
updateConfig({ default_currency: 'ARS' });
updateConfig({ default_currency: 'USD' });

// ❌ Inválido - lanzará error
updateConfig({ default_currency: 'EUR' });  // Error: Solo ARS o USD
```

### Validaciones de Cuotas

Las cuotas personalizadas tienen validaciones estrictas:
- **Número de cuotas:** 1-60 (validado en frontend y backend)
- **Recargo:** 0-100% (validado en frontend y backend)
- **Tipo de tarjeta:** Solo 'bancarizadas' o 'no_bancarizadas'

### Consistencia con el Proyecto

Este feature sigue los mismos patrones que:
- `features/inventory/` - Hooks, API, Components
- `features/pos/` - Estructura de carpetas
- `features/ecommerce/` - Validaciones y tipos

## Contribuir

Al extender este feature:

1. Mantén los tipos estrictos en `types/config.types.ts`
2. Agrega validaciones en `utils/validators.ts`
3. Agrega formatters en `utils/formatters.ts`
4. Crea hooks reutilizables en `hooks/`
5. Documenta cambios en este README

## Enlaces

- Plan de desarrollo completo: `/MODULO_CONFIGURACION_PLAN_DESARROLLO.md`
- Tipos TypeScript: `./types/config.types.ts`
- API Methods: `./api/configApi.ts`

---

**Última actualización:** 2025-10-04
**Versión:** 1.0
**Estado:** Implementado (Frontend) - Backend pendiente
