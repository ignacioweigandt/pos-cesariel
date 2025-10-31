# Plan de Refactorización - Módulo de Configuración

## Estado Actual - Análisis Completo

### Problema Principal: Duplicación de Rutas

```
app/
├── configuracion/
│   └── notificaciones/
│       └── page.tsx (63 líneas) - Ruta: /configuracion/notificaciones
└── settings/
    ├── page.tsx (262 líneas) - Dashboard principal
    ├── notifications/
    │   └── page.tsx (71 líneas) - Ruta: /settings/notifications
    ├── currency/
    │   └── page.tsx (284 líneas)
    ├── ecommerce/
    │   └── page.tsx (393 líneas)
    ├── payment-config/
    │   └── page.tsx (441 líneas) ⚠️ ARCHIVO GRANDE
    ├── payment-methods/
    │   └── page.tsx (490 líneas) ⚠️ ARCHIVO GRANDE
    ├── security-backups/
    │   └── page.tsx (390 líneas)
    ├── social-media/
    │   └── page.tsx (408 líneas) ⚠️ ARCHIVO GRANDE
    ├── store-banners/
    │   └── page.tsx (487 líneas) ⚠️ ARCHIVO GRANDE
    ├── store-logo/
    │   └── page.tsx (349 líneas)
    └── tax-rates/
        └── page.tsx (299 líneas)
```

**DUPLICACIÓN DETECTADA:**
- Notificaciones existe en `/configuracion/notificaciones` Y `/settings/notifications`
- Dos implementaciones ligeramente diferentes del mismo feature

### Archivos que Exceden 400 Líneas

1. **payment-methods/page.tsx** - 490 líneas
   - Gestión de métodos de pago
   - Configuración de cuotas personalizadas
   - CustomInstallmentsManager integrado

2. **store-banners/page.tsx** - 487 líneas
   - CRUD completo de banners
   - Upload de imágenes con Cloudinary
   - Preview y ordenamiento

3. **payment-config/page.tsx** - 441 líneas
   - Configuración de comisiones
   - Gestión de tarjetas
   - Validaciones complejas

4. **social-media/page.tsx** - 408 líneas
   - Configuración de WhatsApp
   - Redes sociales
   - Formularios múltiples

### Estructura de features/configuracion

```
features/configuracion/
├── README.md (bien documentado)
├── api/
│   ├── configApi.ts (220+ líneas, 30+ métodos)
│   └── index.ts
├── hooks/
│   ├── usePaymentConfig.ts
│   ├── useCustomInstallments.ts
│   ├── useCurrencyConfig.ts
│   ├── useTaxRates.ts
│   └── index.ts
├── components/
│   ├── CustomInstallments/
│   │   └── CustomInstallmentsManager.tsx
│   └── index.ts
├── types/
│   ├── config.types.ts (200+ líneas)
│   └── index.ts
└── utils/
    ├── formatters.ts
    ├── validators.ts
    └── index.ts
```

**BUENA ESTRUCTURA pero necesita:**
- Más componentes reutilizables
- Alineación con la estructura de rutas consolidada
- Separación de lógica de UI en componentes

## Decisión Arquitectónica

### Opción Elegida: Consolidar en `/settings` (NO /configuracion)

**Razones:**
1. `/settings` tiene 10 submódulos vs 1 en `/configuracion`
2. Naming en inglés es estándar para rutas administrativas
3. Consistencia con convenciones de Next.js/React Admin
4. `/settings` tiene el dashboard principal completo
5. Menor impacto en navegación existente

### Nueva Estructura Propuesta

```
app/
└── (config)/                           # Route group para configuración
    ├── layout.tsx                      # Layout compartido con navegación
    ├── settings/
    │   ├── page.tsx                    # Dashboard principal (mantener)
    │   │
    │   ├── payment-methods/            # Métodos de pago
    │   │   ├── page.tsx                # Componente reducido ~150 líneas
    │   │   └── _components/            # Componentes privados
    │   │       ├── payment-method-card.tsx
    │   │       ├── payment-method-form.tsx
    │   │       └── payment-config-section.tsx
    │   │
    │   ├── store-banners/              # Banners
    │   │   ├── page.tsx                # Componente reducido ~150 líneas
    │   │   └── _components/
    │   │       ├── banner-list.tsx
    │   │       ├── banner-form.tsx
    │   │       ├── banner-upload.tsx
    │   │       └── banner-preview.tsx
    │   │
    │   ├── payment-config/             # Config pagos
    │   │   ├── page.tsx                # Componente reducido ~150 líneas
    │   │   └── _components/
    │   │       ├── card-config-form.tsx
    │   │       ├── installment-config.tsx
    │   │       └── surcharge-calculator.tsx
    │   │
    │   ├── social-media/               # Redes sociales
    │   │   ├── page.tsx                # Componente reducido ~150 líneas
    │   │   └── _components/
    │   │       ├── whatsapp-config.tsx
    │   │       ├── social-links-form.tsx
    │   │       └── contact-info-form.tsx
    │   │
    │   ├── notifications/              # Notificaciones (unificado)
    │   │   ├── page.tsx                # Versión consolidada
    │   │   └── _components/
    │   │       ├── notification-toggle.tsx
    │   │       └── notification-schedule.tsx
    │   │
    │   ├── currency/
    │   │   └── page.tsx                # OK como está (284 líneas)
    │   ├── ecommerce/
    │   │   └── page.tsx                # OK como está (393 líneas)
    │   ├── security-backups/
    │   │   └── page.tsx                # OK como está (390 líneas)
    │   ├── store-logo/
    │   │   └── page.tsx                # OK como está (349 líneas)
    │   └── tax-rates/
    │       └── page.tsx                # OK como está (299 líneas)

features/configuracion/                  # Feature layer
├── README.md
├── api/
│   ├── configApi.ts                    # Mantener como está
│   └── index.ts
├── hooks/
│   ├── usePaymentConfig.ts             # Mantener
│   ├── useCustomInstallments.ts        # Mantener
│   ├── useCurrencyConfig.ts            # Mantener
│   ├── useTaxRates.ts                  # Mantener
│   ├── useBanners.ts                   # NUEVO - extraído de store-banners
│   ├── useSocialMedia.ts               # NUEVO - extraído de social-media
│   └── index.ts
├── components/                          # Componentes compartidos
│   ├── CustomInstallments/
│   │   └── CustomInstallmentsManager.tsx   # Mantener
│   ├── ConfigCard/                     # NUEVO - card reutilizable
│   │   └── config-card.tsx
│   ├── ConfigForm/                     # NUEVO - formularios base
│   │   ├── config-form.tsx
│   │   └── config-form-actions.tsx
│   └── index.ts
├── types/
│   ├── config.types.ts                 # Expandir con nuevos tipos
│   ├── banner.types.ts                 # NUEVO
│   ├── social-media.types.ts           # NUEVO
│   └── index.ts
└── utils/
    ├── formatters.ts
    ├── validators.ts
    ├── image-upload.ts                 # NUEVO - lógica de Cloudinary
    └── index.ts
```

### Shared Components (si se usan en 2+ módulos)

```
components/ui/                           # Componentes globales
├── config/                              # Solo si se usan en 2+ settings
│   ├── config-header.tsx               # Header reutilizable
│   ├── config-section.tsx              # Sección con título/descripción
│   └── config-loading.tsx              # Loading states
```

## Plan de Implementación

### Fase 1: Consolidación de Rutas (PRIORITARIO)
- [ ] Eliminar `/app/configuracion/notificaciones/`
- [ ] Consolidar lógica en `/app/settings/notifications/`
- [ ] Verificar componente `NotificationSettings` en `app/components/`
- [ ] Actualizar links de navegación en dashboard
- [ ] Verificar que `/configuracion` no tenga otras referencias

### Fase 2: División de Archivos Grandes

#### 2.1 payment-methods/page.tsx (490 líneas)
**Componentes a extraer:**
- `PaymentMethodCard` - Card individual de método
- `PaymentMethodForm` - Formulario de edición
- `PaymentConfigSection` - Sección de configuraciones
- Mantener `CustomInstallmentsManager` del feature

**Hooks a crear:**
- Ya existe `usePaymentConfig` en features/
- Posible `usePaymentMethods` si la lógica es diferente

#### 2.2 store-banners/page.tsx (487 líneas)
**Componentes a extraer:**
- `BannerList` - Lista de banners
- `BannerForm` - Formulario crear/editar
- `BannerUpload` - Componente de upload
- `BannerPreview` - Preview del banner
- `BannerCard` - Card individual

**Hooks a crear:**
- `useBanners` en features/configuracion/hooks/
- `useImageUpload` para lógica de Cloudinary

#### 2.3 payment-config/page.tsx (441 líneas)
**Componentes a extraer:**
- `CardConfigForm` - Formulario de tarjetas
- `InstallmentConfig` - Config de cuotas
- `SurchargeCalculator` - Calculadora de recargos
- `CardTypeSelector` - Selector de tipo de tarjeta

#### 2.4 social-media/page.tsx (408 líneas)
**Componentes a extraer:**
- `WhatsAppConfig` - Configuración WhatsApp
- `SocialLinksForm` - Links de redes sociales
- `ContactInfoForm` - Info de contacto

**Hooks a crear:**
- `useSocialMedia` en features/configuracion/hooks/

### Fase 3: Reorganización de Features
- [ ] Crear nuevos hooks en `features/configuracion/hooks/`
- [ ] Crear componentes compartidos en `features/configuracion/components/`
- [ ] Expandir tipos en `features/configuracion/types/`
- [ ] Agregar utilidades en `features/configuracion/utils/`
- [ ] Actualizar `features/configuracion/index.ts` con exports

### Fase 4: Actualización de Imports
- [ ] Buscar imports de `/configuracion/*` y reemplazar por `/settings/*`
- [ ] Actualizar imports de componentes movidos
- [ ] Verificar imports en navigation/sidebar
- [ ] Actualizar tests si existen

### Fase 5: Verificación
- [ ] Compilar Next.js sin errores
- [ ] Verificar rutas funcionan correctamente
- [ ] Verificar navegación desde dashboard
- [ ] Verificar permisos de acceso
- [ ] Verificar que componentes se rendericen correctamente

## Scope Rule Application

### Componentes Locales (_components/)
**Uso en UN SOLO módulo → Quedan en `_components/`**
- `payment-methods/_components/payment-method-card.tsx`
- `store-banners/_components/banner-upload.tsx`
- `social-media/_components/whatsapp-config.tsx`

### Componentes del Feature (features/configuracion/components/)
**Uso en 2+ módulos de configuración → Van a `features/`**
- `CustomInstallmentsManager` - Usado en payment-methods y payment-config
- `ConfigCard` - Card base reutilizable
- `ConfigForm` - Formulario base

### Componentes Globales (components/ui/)
**Uso en 2+ features diferentes → Van a `components/ui/`**
- Solo si se usan fuera de configuración
- Por ahora, no identificados

## Estimación de Impacto

### Archivos a Crear
- ~20 nuevos componentes en `_components/`
- 3-4 nuevos hooks en `features/configuracion/hooks/`
- 2-3 nuevos archivos de tipos
- 1-2 nuevas utilidades

### Archivos a Modificar
- 4 archivos page.tsx grandes (reducir a ~150 líneas cada uno)
- 1 archivo page.tsx de notificaciones (consolidar)
- `features/configuracion/index.ts` (agregar exports)
- Sidebar/Navigation (actualizar links)

### Archivos a Eliminar
- `app/configuracion/notificaciones/page.tsx`
- Carpeta `app/configuracion/` (si queda vacía)

### Líneas de Código Impactadas
- **Antes:** ~3,675 líneas en page.tsx
- **Después:** ~1,500 líneas en page.tsx + ~2,000 en componentes
- **Reducción en page.tsx:** ~60%
- **Mejora en mantenibilidad:** Significativa

## Ventajas de la Refactorización

1. **Eliminación de duplicación** - Una sola ruta de notificaciones
2. **Archivos más pequeños** - Más fáciles de entender y mantener
3. **Componentes reutilizables** - DRY principle
4. **Mejor testabilidad** - Componentes pequeños son más fáciles de testear
5. **Scope Rule compliant** - Componentes en el lugar correcto
6. **Next.js 15 best practices** - Uso de _components/ para privacidad
7. **Mejor developer experience** - Código más navegable

## Riesgos y Mitigación

### Riesgo 1: Breaking Changes en Navegación
**Mitigación:**
- Mantener redirects de `/configuracion/*` a `/settings/*`
- Actualizar todos los links en una sola fase

### Riesgo 2: Imports Rotos
**Mitigación:**
- Usar búsqueda global antes de mover
- Actualizar imports en orden dependencia
- Verificar compilación después de cada fase

### Riesgo 3: Pérdida de Funcionalidad
**Mitigación:**
- Testing manual después de cada componente extraído
- No eliminar código viejo hasta verificar nuevo funciona
- Commits pequeños y frecuentes

## Orden de Ejecución Recomendado

1. ✅ Análisis y documentación (ESTE ARCHIVO)
2. 🔄 Consolidar notificaciones (Fase 1) - PRIORITARIO
3. Dividir payment-methods (más grande, 490 líneas)
4. Dividir store-banners (487 líneas)
5. Dividir payment-config (441 líneas)
6. Dividir social-media (408 líneas)
7. Reorganizar features/configuracion
8. Actualizar imports globalmente
9. Verificación completa

## Next Steps Inmediatos

1. Crear branch: `refactor/consolidate-config-module`
2. Ejecutar Fase 1: Consolidar notificaciones
3. Commit: "refactor(config): consolidate notifications route"
4. Ejecutar Fase 2.1: Dividir payment-methods
5. Commit: "refactor(config): extract payment-methods components"
6. Continuar con cada fase...

---

**Autor:** Claude Code (Scope Rule Architect)
**Fecha:** 2025-10-29
**Versión:** 1.0
**Estado:** PLAN APROBADO - LISTO PARA EJECUCIÓN
