# MÓDULO DE CONFIGURACIÓN - PLAN DE DESARROLLO COMPLETO

## TABLA DE CONTENIDOS

1. [Análisis del Estado Actual](#1-análisis-del-estado-actual)
2. [Gaps y Funcionalidad Faltante](#2-gaps-y-funcionalidad-faltante)
3. [Arquitectura Propuesta](#3-arquitectura-propuesta)
4. [Plan de Implementación](#4-plan-de-implementación)
5. [Detalles Técnicos](#5-detalles-técnicos)
6. [Endpoints API Requeridos (Backend)](#6-endpoints-api-requeridos-backend)
7. [Próximos Pasos](#7-próximos-pasos)

---

## 1. ANÁLISIS DEL ESTADO ACTUAL

### 1.1 Estructura Actual del Frontend

El módulo de configuración actual se encuentra en:
```
frontend/pos-cesariel/app/settings/
├── page.tsx                      # Dashboard principal de configuración
├── payment-methods/page.tsx      # Configuración de métodos de pago
├── payment-config/page.tsx       # Configuración detallada de pagos
├── currency/page.tsx             # Configuración de moneda
├── tax-rates/page.tsx            # Configuración de impuestos
├── notifications/page.tsx        # Configuración de alertas
├── security-backups/page.tsx     # Seguridad y respaldos
├── ecommerce/page.tsx            # Configuración de e-commerce
├── store-logo/page.tsx           # Logo de tienda
├── store-banners/page.tsx        # Banners de tienda
└── social-media/page.tsx         # Redes sociales
```

**Características encontradas:**
- ✅ Interfaz de métodos de pago implementada
- ✅ Sistema de recargos por tarjeta funcional
- ✅ Configuración de moneda (pero sin restricción a ARS/USD)
- ✅ Configuración de impuestos
- ✅ Configuración de notificaciones básica
- ✅ Configuración de seguridad y respaldos

### 1.2 Backend Actual

Archivo principal: `backend/routers/config.py` (771 líneas)

**Endpoints existentes:**
- `GET/POST/PUT /config/ecommerce` - Configuración de e-commerce
- `GET/PUT /config/system` - Configuración del sistema
- `GET/PUT /config/payment-methods` - Métodos de pago
- `GET/POST/PUT/DELETE /config/payment-config` - Configuración de pagos
- `GET/POST/PUT /config/tax-rates` - Tasas de impuestos
- `GET /config/notifications` - Configuración de notificaciones
- `GET /config/backup` - Configuración de respaldos

**Almacenamiento actual:**
- Configuraciones de pago: Almacenadas en memoria (temporal)
- Sistema usa configuraciones por defecto hardcodeadas
- Base de datos para e-commerce config

### 1.3 Problemas Identificados

1. **Arquitectura No Escalable:**
   - Páginas directamente en `app/settings/` sin seguir patrón de features
   - No hay separación clara de lógica de negocio
   - Código duplicado entre páginas

2. **Falta de Funcionalidad:**
   - ❌ No existe funcionalidad para agregar cuotas personalizadas
   - ❌ Monedas no están restringidas a ARS y USD
   - ❌ No hay validaciones fuertes en frontend

3. **Tipos y Validación:**
   - Tipos TypeScript débiles (uso de `any`)
   - Validaciones inconsistentes
   - No hay utilidades de formateo centralizadas

---

## 2. GAPS Y FUNCIONALIDAD FALTANTE

### 2.1 Funcionalidad de Cuotas Personalizadas (NUEVO)

**Requerimiento:**
> Funcionalidad para AGREGAR cuotas personalizadas a tarjetas bancarizadas o no bancarizadas

**Estado Actual:** ❌ NO EXISTE

**Lo que se necesita:**
- Interfaz para agregar cuotas personalizadas (ej: 15, 18, 24 cuotas)
- Configurar recargo personalizado por cada plan de cuotas
- Habilitar/deshabilitar cuotas personalizadas
- Persistencia en base de datos
- Validación de rangos (1-60 cuotas, 0-100% recargo)

### 2.2 Restricción de Monedas (MODIFICACIÓN)

**Requerimiento:**
> SOLO mostrar: Peso Argentino y Dólar Estadounidense (ninguna otra moneda)

**Estado Actual:** ⚠️ EXISTE PERO SIN RESTRICCIÓN

**Archivo actual:** `frontend/pos-cesariel/app/settings/currency/page.tsx`
```typescript
const commonCurrencies: Currency[] = [
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', country: 'Argentina' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', country: 'Estados Unidos' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'Zona Euro' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', country: 'Brasil' },
  // ... más monedas
];
```

**Cambio necesario:**
- Eliminar todas las monedas excepto ARS y USD
- Agregar validaciones de tipo TypeScript
- Implementar validación en backend

### 2.3 Mejoras de UX y Arquitectura

**Necesidades identificadas:**
1. Seguir patrón de features del proyecto
2. Centralizar lógica en hooks personalizados
3. Componentes reutilizables
4. Tipos TypeScript estrictos
5. Validaciones centralizadas

---

## 3. ARQUITECTURA PROPUESTA

### 3.1 Nueva Estructura del Feature

Siguiendo el patrón del proyecto (como `features/inventory/`, `features/pos/`):

```
frontend/pos-cesariel/features/configuracion/
├── index.ts                                    # Export principal
├── types/
│   ├── config.types.ts                        # Tipos TypeScript completos
│   └── index.ts
├── api/
│   ├── configApi.ts                           # API client extendido
│   └── index.ts
├── hooks/
│   ├── usePaymentConfig.ts                    # Hook para payment config
│   ├── useCustomInstallments.ts              # Hook para cuotas personalizadas (NUEVO)
│   ├── useCurrencyConfig.ts                   # Hook para moneda (con restricción ARS/USD)
│   ├── useTaxRates.ts                         # Hook para impuestos
│   └── index.ts
├── components/
│   ├── CustomInstallments/
│   │   ├── CustomInstallmentsManager.tsx     # Componente principal (NUEVO)
│   │   └── index.ts
│   └── index.ts
└── utils/
    ├── formatters.ts                          # Funciones de formateo
    ├── validators.ts                          # Validaciones centralizadas
    └── index.ts
```

### 3.2 Integración con Páginas Existentes

Las páginas en `app/settings/` se mantendrán pero consumirán el nuevo feature:

```typescript
// app/settings/payment-methods/page.tsx
import { usePaymentConfig, useCustomInstallments } from '@/features/configuracion';
import { CustomInstallmentsManager } from '@/features/configuracion/components';
```

### 3.3 Flujo de Datos

```
┌─────────────┐
│  Page.tsx   │  (app/settings/payment-methods/page.tsx)
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│  Custom Hooks       │  (usePaymentConfig, useCustomInstallments)
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  API Layer          │  (configurationApi)
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Backend Endpoints  │  (/config/custom-installments, etc.)
└─────────────────────┘
```

---

## 4. PLAN DE IMPLEMENTACIÓN

### FASE 1: Estructura del Feature ✅ COMPLETADA

**Archivos creados:**
1. ✅ `features/configuracion/index.ts`
2. ✅ `features/configuracion/types/config.types.ts` - 200+ líneas de tipos
3. ✅ `features/configuracion/types/index.ts`
4. ✅ `features/configuracion/api/configApi.ts` - API completa
5. ✅ `features/configuracion/api/index.ts`

**Tipos creados:**
- `PaymentMethod`, `PaymentConfig`, `PaymentConfigCreate/Update`
- `CustomInstallment`, `CustomInstallmentCreate` (NUEVO)
- `Currency`, `CurrencyConfig`, `CurrencyCode` (restringido a 'ARS' | 'USD')
- `TaxRate`, `TaxRateCreate/Update`
- `NotificationConfig`, `SecurityBackupConfig`
- `SystemConfig`

### FASE 2: Hooks Personalizados ✅ COMPLETADA

**Archivos creados:**
1. ✅ `hooks/usePaymentConfig.ts` - Gestión de configuraciones de pago
2. ✅ `hooks/useCustomInstallments.ts` - **FUNCIONALIDAD NUEVA**
3. ✅ `hooks/useCurrencyConfig.ts` - Con restricción ARS/USD
4. ✅ `hooks/useTaxRates.ts` - Gestión de impuestos
5. ✅ `hooks/index.ts`

**Características de los hooks:**
- Manejo de estado con useState/useEffect
- Carga asíncrona de datos
- Operaciones CRUD completas
- Validaciones integradas
- Mensajes toast para feedback
- Error handling robusto

### FASE 3: Componentes ✅ COMPLETADA

**Archivos creados:**
1. ✅ `components/CustomInstallments/CustomInstallmentsManager.tsx` - **COMPONENTE NUEVO**
2. ✅ `components/CustomInstallments/index.ts`
3. ✅ `components/index.ts`

**Funcionalidad del CustomInstallmentsManager:**
- Formulario para crear/editar cuotas personalizadas
- Lista de cuotas con ordenamiento
- Toggle para activar/desactivar
- Validaciones inline
- Diseño consistente con el resto del sistema
- Soporte para bancarizadas y no_bancarizadas

### FASE 4: Utilidades ✅ COMPLETADA

**Archivos creados:**
1. ✅ `utils/formatters.ts` - Funciones de formateo
2. ✅ `utils/validators.ts` - Validaciones centralizadas
3. ✅ `utils/index.ts`

**Funciones implementadas:**
- `formatPrice()` - Formateo de precios con configuración
- `formatSurcharge()` - Formateo de recargos
- `formatInstallments()` - Formateo de cuotas
- `validateCurrencyCode()` - Validación ARS/USD
- `validateInstallments()` - Validación 1-60 cuotas
- `validateSurcharge()` - Validación 0-100%
- Y más...

### FASE 5: Integración con Páginas (PENDIENTE)

**Páginas a actualizar:**

1. **`app/settings/payment-methods/page.tsx`** (ALTA PRIORIDAD)
   ```typescript
   import { usePaymentConfig, useCustomInstallments } from '@/features/configuracion';
   import { CustomInstallmentsManager } from '@/features/configuracion/components';

   // Agregar sección de cuotas personalizadas
   <CustomInstallmentsManager
     cardType="bancarizadas"
     title="Tarjetas Bancarizadas"
     color="green"
   />

   <CustomInstallmentsManager
     cardType="no_bancarizadas"
     title="Tarjetas No Bancarizadas"
     color="orange"
   />
   ```

2. **`app/settings/currency/page.tsx`** (MEDIA PRIORIDAD)
   ```typescript
   import { useCurrencyConfig } from '@/features/configuracion';

   // Reemplazar lista de monedas con:
   const { availableCurrencies } = useCurrencyConfig();
   // Solo mostrará ARS y USD
   ```

3. **`app/settings/tax-rates/page.tsx`** (BAJA PRIORIDAD)
   ```typescript
   import { useTaxRates } from '@/features/configuracion';
   // Usar hook en lugar de lógica local
   ```

---

## 5. DETALLES TÉCNICOS

### 5.1 Tipos TypeScript Clave

```typescript
// Cuotas Personalizadas (NUEVO)
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
export type CurrencyCode = 'ARS' | 'USD';  // SOLO estas dos

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  country: string;
}
```

### 5.2 Hooks - API de useCustomInstallments

```typescript
const {
  installments,                    // Lista de cuotas personalizadas
  loading,                          // Estado de carga
  error,                            // Error si existe
  reload,                           // Recargar datos
  createInstallment,                // Crear nueva cuota
  updateInstallment,                // Actualizar cuota
  deleteInstallment,                // Eliminar cuota
  toggleActive,                     // Activar/desactivar
  getInstallmentsByCardType,        // Filtrar por tipo
  getActiveInstallments,            // Solo activas
} = useCustomInstallments({ cardType: 'bancarizadas' });
```

### 5.3 Validaciones Implementadas

**Frontend:**
```typescript
// Cuotas: 1-60
validateInstallments(18) // true
validateInstallments(0)  // false
validateInstallments(61) // false

// Recargo: 0-100%
validateSurcharge(15.5)  // true
validateSurcharge(-1)    // false
validateSurcharge(101)   // false

// Moneda: solo ARS o USD
validateCurrencyCode('ARS') // true
validateCurrencyCode('EUR') // false
```

### 5.4 Formateo Centralizado

```typescript
import { formatPrice, formatSurcharge, formatInstallments } from '@/features/configuracion/utils';

formatPrice(1234.56, config);        // "$1234.56" o "1234.56$"
formatSurcharge(15);                 // "+15%"
formatSurcharge(0);                  // "Sin recargo"
formatInstallments(3);               // "3 cuotas"
formatInstallments(1);               // "1 cuota"
```

---

## 6. ENDPOINTS API REQUERIDOS (BACKEND)

### 6.1 Cuotas Personalizadas (NUEVOS ENDPOINTS)

**El backend DEBE implementar estos endpoints:**

#### GET /config/custom-installments
```python
@router.get("/custom-installments")
async def get_custom_installments(
    card_type: Optional[str] = None,
    current_user: User = Depends(admin_or_manager_required),
    db: Session = Depends(get_db)
):
    """
    Obtener cuotas personalizadas.
    Query params:
      - card_type: 'bancarizadas' | 'no_bancarizadas' (opcional)
    """
    query = db.query(CustomInstallment)
    if card_type:
        query = query.filter(CustomInstallment.card_type == card_type)

    return query.all()
```

**Response:**
```json
[
  {
    "id": 1,
    "card_type": "bancarizadas",
    "installments": 18,
    "surcharge_percentage": 35.0,
    "is_active": true,
    "description": "Plan especial 18 cuotas",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

#### POST /config/custom-installments
```python
@router.post("/custom-installments")
async def create_custom_installment(
    data: CustomInstallmentCreate,
    current_user: User = Depends(admin_or_manager_required),
    db: Session = Depends(get_db)
):
    """
    Crear cuota personalizada.
    Validaciones:
      - installments: 1-60
      - surcharge_percentage: 0-100
      - card_type: 'bancarizadas' o 'no_bancarizadas'
    """
    # Validar rangos
    if not 1 <= data.installments <= 60:
        raise HTTPException(400, "Las cuotas deben estar entre 1 y 60")

    if not 0 <= data.surcharge_percentage <= 100:
        raise HTTPException(400, "El recargo debe estar entre 0% y 100%")

    installment = CustomInstallment(**data.dict())
    db.add(installment)
    db.commit()
    db.refresh(installment)

    return installment
```

**Request Body:**
```json
{
  "card_type": "bancarizadas",
  "installments": 18,
  "surcharge_percentage": 35.0,
  "description": "Plan especial 18 cuotas"
}
```

#### PUT /config/custom-installments/{id}
```python
@router.put("/custom-installments/{id}")
async def update_custom_installment(
    id: int,
    data: CustomInstallmentUpdate,
    current_user: User = Depends(admin_or_manager_required),
    db: Session = Depends(get_db)
):
    """Actualizar cuota personalizada"""
    installment = db.query(CustomInstallment).filter(CustomInstallment.id == id).first()

    if not installment:
        raise HTTPException(404, "Cuota no encontrada")

    # Validaciones
    if data.surcharge_percentage is not None:
        if not 0 <= data.surcharge_percentage <= 100:
            raise HTTPException(400, "El recargo debe estar entre 0% y 100%")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(installment, field, value)

    db.commit()
    db.refresh(installment)

    return installment
```

#### DELETE /config/custom-installments/{id}
```python
@router.delete("/custom-installments/{id}")
async def delete_custom_installment(
    id: int,
    current_user: User = Depends(admin_or_manager_required),
    db: Session = Depends(get_db)
):
    """Eliminar cuota personalizada"""
    installment = db.query(CustomInstallment).filter(CustomInstallment.id == id).first()

    if not installment:
        raise HTTPException(404, "Cuota no encontrada")

    db.delete(installment)
    db.commit()

    return {"message": "Cuota eliminada exitosamente"}
```

#### PATCH /config/custom-installments/{id}/toggle
```python
@router.patch("/custom-installments/{id}/toggle")
async def toggle_custom_installment(
    id: int,
    current_user: User = Depends(admin_or_manager_required),
    db: Session = Depends(get_db)
):
    """Activar/desactivar cuota personalizada"""
    installment = db.query(CustomInstallment).filter(CustomInstallment.id == id).first()

    if not installment:
        raise HTTPException(404, "Cuota no encontrada")

    installment.is_active = not installment.is_active
    db.commit()
    db.refresh(installment)

    return installment
```

### 6.2 Modelo de Base de Datos (NUEVO)

**Archivo:** `backend/app/models/payment.py`

```python
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class CustomInstallment(Base):
    """
    Cuotas personalizadas para tarjetas bancarizadas y no bancarizadas

    Permite a los administradores configurar planes de cuotas especiales
    (ej: 15, 18, 24 cuotas) con recargos personalizados.
    """
    __tablename__ = "custom_installments"

    id = Column(Integer, primary_key=True, index=True)
    card_type = Column(String, nullable=False)  # 'bancarizadas' o 'no_bancarizadas'
    installments = Column(Integer, nullable=False)  # 1-60
    surcharge_percentage = Column(Numeric(5, 2), nullable=False)  # 0.00-100.00
    is_active = Column(Boolean, default=True, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<CustomInstallment {self.card_type} - {self.installments} cuotas>"
```

### 6.3 Schema Pydantic (NUEVO)

**Archivo:** `backend/app/schemas/payment.py`

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class CustomInstallmentBase(BaseModel):
    card_type: str = Field(..., description="Tipo de tarjeta: 'bancarizadas' o 'no_bancarizadas'")
    installments: int = Field(..., ge=1, le=60, description="Número de cuotas (1-60)")
    surcharge_percentage: float = Field(..., ge=0, le=100, description="Recargo en porcentaje (0-100)")
    description: str = Field(..., min_length=1, max_length=255)

    @validator('card_type')
    def validate_card_type(cls, v):
        allowed = ['bancarizadas', 'no_bancarizadas']
        if v not in allowed:
            raise ValueError(f"card_type debe ser uno de: {allowed}")
        return v

class CustomInstallmentCreate(CustomInstallmentBase):
    pass

class CustomInstallmentUpdate(BaseModel):
    installments: Optional[int] = Field(None, ge=1, le=60)
    surcharge_percentage: Optional[float] = Field(None, ge=0, le=100)
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    is_active: Optional[bool] = None

class CustomInstallment(CustomInstallmentBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
```

### 6.4 Migración de Base de Datos

```sql
-- Migration: Add custom_installments table
CREATE TABLE custom_installments (
    id SERIAL PRIMARY KEY,
    card_type VARCHAR(50) NOT NULL,
    installments INTEGER NOT NULL CHECK (installments >= 1 AND installments <= 60),
    surcharge_percentage NUMERIC(5, 2) NOT NULL CHECK (surcharge_percentage >= 0 AND surcharge_percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_custom_installments_card_type ON custom_installments(card_type);
CREATE INDEX idx_custom_installments_active ON custom_installments(is_active);

-- Datos de ejemplo
INSERT INTO custom_installments (card_type, installments, surcharge_percentage, description) VALUES
('bancarizadas', 15, 30.0, 'Plan especial 15 cuotas'),
('bancarizadas', 18, 35.0, 'Plan especial 18 cuotas'),
('bancarizadas', 24, 45.0, 'Plan especial 24 cuotas'),
('no_bancarizadas', 3, 20.0, 'Plan 3 cuotas no bancarizadas');
```

### 6.5 Restricción de Monedas (MODIFICACIÓN)

**Modificar:** `backend/routers/config.py`

```python
# Constantes para monedas permitidas
ALLOWED_CURRENCIES = ['ARS', 'USD']

@router.put("/system")
async def update_system_config(
    config_data: dict,
    current_user: User = Depends(admin_or_manager_required)
):
    # ... código existente ...

    # AGREGAR VALIDACIÓN DE MONEDA
    if "default_currency" in filtered_data:
        if filtered_data["default_currency"] not in ALLOWED_CURRENCIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Solo se permiten las monedas: {', '.join(ALLOWED_CURRENCIES)}"
            )

    # ... resto del código ...
```

### 6.6 Endpoints de Moneda (MODIFICACIÓN)

```python
@router.get("/currency")
async def get_currency_config(
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener configuración de moneda (solo ARS y USD)"""
    return {
        "default_currency": "ARS",
        "currency_symbol": "$",
        "currency_position": "before",
        "decimal_places": 2,
        "available_currencies": [
            {"code": "ARS", "name": "Peso Argentino", "symbol": "$", "country": "Argentina"},
            {"code": "USD", "name": "Dólar Estadounidense", "symbol": "$", "country": "Estados Unidos"}
        ]
    }
```

---

## 7. PRÓXIMOS PASOS

### 7.1 Para el Desarrollador Frontend (TÚ)

**INMEDIATO:**

1. ✅ **Integrar feature en páginas existentes**
   - Actualizar `app/settings/payment-methods/page.tsx`
   - Agregar `CustomInstallmentsManager` en las secciones correspondientes
   - Importar y usar hooks del feature

2. **Actualizar página de moneda**
   - Modificar `app/settings/currency/page.tsx`
   - Usar `useCurrencyConfig` hook
   - Asegurar que solo muestre ARS y USD

3. **Testing**
   - Probar creación de cuotas personalizadas
   - Validar restricciones (1-60 cuotas, 0-100% recargo)
   - Verificar que solo ARS y USD sean seleccionables

**CORTO PLAZO:**

4. **Refactorizar otras páginas**
   - `app/settings/tax-rates/page.tsx` → usar `useTaxRates`
   - `app/settings/notifications/page.tsx` → crear hook específico
   - `app/settings/security-backups/page.tsx` → crear hook específico

5. **Agregar tests unitarios**
   - Tests para hooks personalizados
   - Tests para componentes
   - Tests para validadores y formatters

### 7.2 Para el Desarrollador Backend

**CRÍTICO (Sin esto el frontend no funcionará):**

1. **Crear modelo `CustomInstallment`**
   - Archivo: `backend/app/models/payment.py`
   - Seguir especificación en sección 6.2

2. **Crear schemas Pydantic**
   - Archivo: `backend/app/schemas/payment.py`
   - Seguir especificación en sección 6.3

3. **Implementar endpoints de cuotas personalizadas**
   - `GET /config/custom-installments`
   - `POST /config/custom-installments`
   - `PUT /config/custom-installments/{id}`
   - `DELETE /config/custom-installments/{id}`
   - `PATCH /config/custom-installments/{id}/toggle`
   - Seguir especificación en sección 6.1

4. **Migración de base de datos**
   - Ejecutar SQL de sección 6.4
   - O crear migración con Alembic

5. **Agregar validación de monedas**
   - Modificar `update_system_config()` en `config.py`
   - Solo permitir ARS y USD
   - Seguir especificación en sección 6.5

**IMPORTANTE (Mejorar endpoints existentes):**

6. **Actualizar endpoint de moneda**
   - Modificar `GET /config/currency`
   - Retornar solo ARS y USD en `available_currencies`

7. **Testing del backend**
   - Tests para endpoints de custom installments
   - Tests de validaciones
   - Tests de integración

### 7.3 Coordinación Frontend-Backend

**Orden de implementación recomendado:**

```
SPRINT 1 (Backend):
- Día 1-2: Crear modelo y schemas
- Día 3-4: Implementar endpoints de custom installments
- Día 5: Migración de BD y testing

SPRINT 2 (Frontend):
- Día 1-2: Integrar CustomInstallmentsManager en payment-methods
- Día 3: Actualizar página de moneda
- Día 4-5: Testing y refinamiento

SPRINT 3 (Refinamiento):
- Día 1-3: Tests E2E
- Día 4-5: Documentación y deployment
```

---

## 8. RESUMEN EJECUTIVO

### 8.1 ¿Qué se ha construido?

**Feature de Configuración Completo:**
- ✅ 200+ líneas de tipos TypeScript estrictos
- ✅ API client extendida con 30+ métodos
- ✅ 4 hooks personalizados con lógica de negocio
- ✅ Componente `CustomInstallmentsManager` (NUEVO)
- ✅ 15+ funciones de utilidad (formatters y validators)
- ✅ Arquitectura escalable siguiendo patrones del proyecto

### 8.2 ¿Qué falta implementar?

**Frontend:**
- Integrar feature en páginas existentes (2-3 días de trabajo)
- Actualizar página de moneda (1 día)
- Testing (2-3 días)

**Backend:**
- Modelo `CustomInstallment` y schemas
- 5 nuevos endpoints API
- Migración de base de datos
- Validación de monedas
- Testing (3-5 días de trabajo total)

### 8.3 Funcionalidad Nueva vs. Existente

**NUEVO (No existía antes):**
1. ✅ Sistema de cuotas personalizadas
   - Hook `useCustomInstallments`
   - Componente `CustomInstallmentsManager`
   - Validaciones 1-60 cuotas, 0-100% recargo

2. ✅ Restricción de monedas a ARS/USD
   - Tipo `CurrencyCode = 'ARS' | 'USD'`
   - Validación `validateCurrencyCode()`
   - Hook `useCurrencyConfig` con restricción

**MEJORADO (Ya existía pero se refactorizó):**
1. ✅ Configuración de pagos
   - Hook `usePaymentConfig` centraliza lógica
   - Tipos TypeScript más estrictos

2. ✅ Configuración de impuestos
   - Hook `useTaxRates` con CRUD completo
   - Validaciones centralizadas

3. ✅ Utilidades globales
   - Formatters centralizados
   - Validators reutilizables

### 8.4 Impacto en el Sistema

**Beneficios:**
1. Código más mantenible (separación de concerns)
2. Reutilización de lógica (hooks y utils)
3. Tipos estrictos (menos errores en runtime)
4. Escalabilidad (fácil agregar más configuraciones)
5. Experiencia de usuario mejorada (cuotas personalizadas)

**Riesgos:**
1. Requiere coordinación backend-frontend
2. Migración de datos existentes
3. Testing exhaustivo necesario

---

## 9. ARCHIVOS CREADOS Y RUTAS

### 9.1 Estructura Completa Creada

```
frontend/pos-cesariel/features/configuracion/
├── index.ts
├── types/
│   ├── config.types.ts          [200+ líneas - CREADO]
│   └── index.ts                 [CREADO]
├── api/
│   ├── configApi.ts             [220+ líneas - CREADO]
│   └── index.ts                 [CREADO]
├── hooks/
│   ├── usePaymentConfig.ts      [90+ líneas - CREADO]
│   ├── useCustomInstallments.ts [140+ líneas - CREADO] ← NUEVO
│   ├── useCurrencyConfig.ts     [120+ líneas - CREADO] ← RESTRINGIDO
│   ├── useTaxRates.ts           [120+ líneas - CREADO]
│   └── index.ts                 [CREADO]
├── components/
│   ├── CustomInstallments/
│   │   ├── CustomInstallmentsManager.tsx  [280+ líneas - CREADO] ← NUEVO
│   │   └── index.ts             [CREADO]
│   └── index.ts                 [CREADO]
└── utils/
    ├── formatters.ts            [90+ líneas - CREADO]
    ├── validators.ts            [90+ líneas - CREADO]
    └── index.ts                 [CREADO]
```

**Total:** 18 archivos creados, ~1,400 líneas de código TypeScript

### 9.2 Rutas Absolutas de Archivos

```
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/index.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/types/config.types.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/types/index.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/api/configApi.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/api/index.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/hooks/usePaymentConfig.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/hooks/useCustomInstallments.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/hooks/useCurrencyConfig.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/hooks/useTaxRates.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/hooks/index.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/components/CustomInstallments/CustomInstallmentsManager.tsx
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/components/CustomInstallments/index.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/components/index.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/utils/formatters.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/utils/validators.ts
/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/frontend/pos-cesariel/features/configuracion/utils/index.ts
```

---

## 10. CONTACTO Y SOPORTE

Para preguntas sobre esta implementación:
- Revisar este documento primero
- Consultar código en `features/configuracion/`
- Verificar tipos en `types/config.types.ts`

**Archivos clave para entender:**
1. `types/config.types.ts` - Entender estructura de datos
2. `hooks/useCustomInstallments.ts` - Entender lógica de cuotas
3. `components/CustomInstallments/CustomInstallmentsManager.tsx` - Entender UI

---

**Documento generado:** 2025-10-04
**Versión:** 1.0
**Estado:** Plan completo - Frontend implementado, Backend pendiente
**Próximo paso:** Coordinar con backend para implementar endpoints API
