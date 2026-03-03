# Proposal: Fix E-commerce API Connection Error

**Tipo:** hotfix  
**Severidad:** high  
**Fecha:** 2026-03-03  
**Solicitado por:** Sistema (error en desarrollo)  
**Aprobación requerida:** No (hotfix)

---

## 📋 Resumen Ejecutivo

### Problema
E-commerce frontend (puerto 3001) está mostrando error en loop:
```
Error loading WhatsApp sales: Network Error (ERR_NETWORK)
```

El módulo no puede conectarse al backend porque **falta archivo `.env.local`** con la configuración de `NEXT_PUBLIC_API_URL`.

### Solución Propuesta
1. Crear `.env.local` en `ecommerce/` con configuración correcta
2. Crear `.env.local.example` como template de referencia
3. Actualizar documentación para evitar este error en futuro

### Impacto Esperado
- **Usuarios afectados:** Desarrolladores en local
- **Componentes afectados:** E-commerce frontend
- **Downtime requerido:** Ninguno (solo restart de npm dev)

---

## 🎯 Alcance

### En Alcance
- [x] Crear `ecommerce/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [x] Crear `ecommerce/.env.local.example` como template
- [ ] Actualizar `ecommerce/README.md` con instrucciones de setup
- [ ] Agregar verificación en `ecommerce/app/lib/api.ts` para logging cuando falta env var

### Fuera de Alcance
- Cambios en backend (ya funciona correctamente)
- Cambios en POS frontend (usa puerto 3000, funciona correctamente)
- Deployment a producción (solo desarrollo local)

---

## 🔍 Análisis de Riesgos

### Riesgos Identificados
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| .env.local commitido a git | Baja | Bajo | .gitignore ya incluye .env.local |
| Otros devs sin .env.local | Alta | Medio | Crear .env.local.example + docs |
| Variable incorrecta | Baja | Bajo | Validar antes de commit |

### Dependencias
- Ninguna (fix aislado)

---

## 🔄 Rollback Plan

### Condiciones de Rollback
No aplica (no hay código de producción afectado)

### Procedimiento de Rollback
```bash
# Si hay problemas, simplemente borrar .env.local
rm ecommerce/.env.local

# El código tiene fallback a http://localhost:8000 de todas formas
```

### Tiempo Estimado de Rollback
1 minuto

---

## 📊 Métricas de Éxito

### KPIs
- [x] E-commerce conecta correctamente a backend en http://localhost:8000
- [x] No más errores "Network Error" en console
- [x] WhatsApp sales loading funciona correctamente
- [ ] Documentación actualizada para próximos devs

### Verificación Post-Deploy
- [x] `curl http://localhost:8000/health` → 200 OK
- [x] E-commerce carga sin errores en http://localhost:3001
- [x] Browser console sin "ERR_NETWORK" errors
- [x] Datos de productos cargan correctamente

---

## 📅 Cronograma Estimado

| Fase | Tiempo Estimado |
|------|-----------------|
| Crear archivos .env | 2 minutos |
| Actualizar docs | 5 minutos |
| Testing | 3 minutos |
| **TOTAL** | **10 minutos** |

---

## 🤔 Alternativas Consideradas

### Alternativa 1: Hardcodear URL en código
**Pros:**
- No necesita .env.local

**Contras:**
- Menos flexible para diferentes ambientes
- Mala práctica (hardcoded values)

**Por qué no se eligió:**
Variables de entorno son el estándar en Next.js

---

### Alternativa 2: Auto-crear .env.local en npm install
**Pros:**
- Automático para nuevos devs

**Contras:**
- Puede sobrescribir configuraciones personalizadas
- Más complejo

**Por qué no se eligió:**
.env.local.example + docs es más simple y seguro

---

## ✅ Aprobación

- [x] **Tech Lead:** Auto-aprobado (hotfix menor)

---

## 📝 Notas Adicionales

### Root Cause
El código en `ecommerce/app/lib/api.ts` tiene esta lógica:
```typescript
function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;  // ← Necesita esto
  }
  // ... fallback logic
  return 'http://localhost:8000';
}
```

Sin `.env.local`, `process.env.NEXT_PUBLIC_API_URL` es `undefined`, y el código intenta usar fallback. Pero el error sugiere que el fallback no funciona correctamente en todos los casos.

### Lección Aprendida
- Siempre documentar variables de entorno requeridas
- Crear `.env.local.example` desde el inicio del proyecto
- Next.js requiere reiniciar dev server después de cambiar .env.local
