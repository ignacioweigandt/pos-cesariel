# Settings Module - Developer Guide

**Última actualización:** Octubre 29, 2025

---

## Estructura del Módulo

```
settings/
├── page.tsx                          # Dashboard principal de configuración
├── payment-methods/                  # Métodos de pago (completado)
│   ├── page.tsx (221 líneas)
│   └── _components/ (7 componentes)
├── store-banners/                    # Banners de tienda (completado)
│   ├── page.tsx (277 líneas)
│   └── _components/ (7 componentes)
├── payment-config/                   # Config de pagos (completado)
│   ├── page.tsx (212 líneas)
│   └── _components/ (5 componentes)
├── social-media/                     # Redes sociales (completado)
│   ├── page.tsx (268 líneas)
│   └── _components/ (4 componentes)
├── REFACTORING_COMPLETE.md          # Documentación exhaustiva
└── README.md                         # Esta guía
```

---

## Quick Start

### Leer un Módulo

1. **Empezar por `page.tsx`**
   - Entender el estado y los handlers
   - Ver qué componentes se importan de `_components`

2. **Revisar `_components/index.ts`**
   - Ver qué componentes exporta el módulo
   - Entender la API pública

3. **Explorar componentes individuales**
   - Cada componente tiene una responsabilidad única
   - Props tipadas con interfaces

### Agregar un Nuevo Módulo

```bash
# 1. Crear estructura
mkdir -p app/settings/nueva-feature/_components

# 2. Crear page.tsx
touch app/settings/nueva-feature/page.tsx

# 3. Crear index.ts para exports
touch app/settings/nueva-feature/_components/index.ts
```

```typescript
// page.tsx template
'use client';

import { useState, useEffect } from 'react';
import { ComponenteA, ComponenteB } from './_components';

export default function NuevaFeaturePage() {
  // Estado y lógica
  return (
    <div>
      <ComponenteA />
      <ComponenteB />
    </div>
  );
}
```

### Agregar un Nuevo Componente

```bash
# 1. Crear archivo
touch app/settings/nueva-feature/_components/nuevo-componente.tsx
```

```typescript
// nuevo-componente.tsx
'use client';

interface NuevoComponenteProps {
  // Props tipadas
}

export function NuevoComponente({ ...props }: NuevoComponenteProps) {
  return (
    // JSX
  );
}
```

```typescript
// _components/index.ts
export { NuevoComponente } from './nuevo-componente';
```

---

## Convenciones

### Naming

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| **Archivos** | kebab-case | `banner-card.tsx` |
| **Componentes** | PascalCase | `BannerCard` |
| **Interfaces** | PascalCase + Props | `BannerCardProps` |
| **Handlers** | handle + Action | `handleEdit` |
| **Constantes** | UPPER_SNAKE_CASE | `INITIAL_FORM_DATA` |

### Estructura de Componente

```typescript
'use client'; // Si usa hooks

// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Interfaces
interface ComponentProps {
  data: SomeType;
  onAction: (id: number) => void;
}

// 3. Constantes
const DEFAULT_VALUE = 'algo';

// 4. Componente
export function Component({ data, onAction }: ComponentProps) {
  // 4.1. Hooks
  const [state, setState] = useState();

  // 4.2. Handlers
  const handleClick = () => {
    // lógica
  };

  // 4.3. Return
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## Patrones Comunes

### Estado en Page.tsx

```typescript
// Usar constantes para valores iniciales
const INITIAL_FORM_DATA = {
  field1: '',
  field2: '',
};

// Estado
const [formData, setFormData] = useState(INITIAL_FORM_DATA);

// Handler genérico
const handleFormChange = (field: string, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

### Validación con Utilidades

```typescript
import { validateRequired, validateUrl } from '@/lib/validation-utils';

const handleSubmit = () => {
  const validation = validateRequired(title, 'Título');
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }
};
```

### Upload con Validación

```typescript
import { validateFile, createFilePreview } from '@/lib/upload-utils';

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const validation = validateFile(file, {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png']
  });

  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  const preview = await createFilePreview(file);
  setPreviewUrl(preview);
};
```

---

## Utilidades Disponibles

### Upload Utils (`lib/upload-utils.ts`)

```typescript
// Validaciones
validateFile(file, options)
validateImageDimensions(file, options)

// Utilidades
createFilePreview(file): Promise<string>
formatFileSize(bytes): string
isCloudinaryUrl(url): boolean
```

### Validation Utils (`lib/validation-utils.ts`)

```typescript
// Básicas
validateRequired(value, fieldName)
validateMinLength(value, min, fieldName)
validateMaxLength(value, max, fieldName)
validateRange(value, min, max, fieldName)

// Específicas
validateUrl(url)
validateEmail(email)
validatePhone(phone)
validatePercentage(value)

// Argentinas
validatePostalCode(code)
validateCuit(cuit)

// Múltiples
validateMultiple(validations)
```

---

## Checklist para Code Review

### Estructura
- [ ] Carpeta `_components/` existe
- [ ] Archivo `_components/index.ts` exporta todos los componentes
- [ ] Page.tsx usa imports desde `./_components`
- [ ] No hay componentes inline de +50 líneas

### TypeScript
- [ ] Todas las props tienen interfaces
- [ ] No hay `any` (excepto error handling)
- [ ] Event handlers tipados correctamente
- [ ] Constantes tipadas

### Naming
- [ ] Archivos en kebab-case
- [ ] Componentes en PascalCase
- [ ] Handlers empiezan con `handle`
- [ ] Interfaces terminan en `Props`

### Best Practices
- [ ] 'use client' solo donde se necesita
- [ ] Componentes < 150 líneas
- [ ] Page.tsx < 300 líneas
- [ ] Una responsabilidad por componente
- [ ] Validaciones usan utilidades compartidas

---

## Testing (Recomendado)

### Unit Test Template

```typescript
// _components/banner-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BannerCard } from './banner-card';

describe('BannerCard', () => {
  const mockBanner = {
    id: 1,
    title: 'Test Banner',
    // ... resto de props
  };

  const mockHandlers = {
    onEdit: jest.fn(),
    onToggleActive: jest.fn(),
    onDelete: jest.fn(),
  };

  it('renders banner with title', () => {
    render(<BannerCard banner={mockBanner} {...mockHandlers} />);
    expect(screen.getByText('Test Banner')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    render(<BannerCard banner={mockBanner} {...mockHandlers} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockBanner);
  });
});
```

---

## Troubleshooting

### Import Errors

```typescript
// ❌ Incorrecto
import { BannerCard } from './banner-card';

// ✅ Correcto
import { BannerCard } from './_components';
```

### TypeScript Errors

```bash
# Verificar tipos
npm run type-check

# Build para ver errores
npm run build
```

### Component Not Rendering

1. Verificar que está exportado en `_components/index.ts`
2. Verificar que el import es correcto
3. Verificar que tiene `'use client'` si usa hooks
4. Revisar console para errores de runtime

---

## Recursos

- **Documentación completa**: `REFACTORING_COMPLETE.md`
- **Resumen ejecutivo**: `/CONFIGURATION_MODULE_REFACTORING_SUMMARY.md`
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev

---

## Ayuda

Para preguntas sobre:
- **Arquitectura**: Ver `REFACTORING_COMPLETE.md`
- **Patrones**: Ver sección "Patrones de Diseño Implementados"
- **Testing**: Ver sección "Testing Strategy"
- **Performance**: Ver sección "Performance Considerations"

**Última actualización:** Octubre 29, 2025
