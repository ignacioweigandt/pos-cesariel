# Design: Fix E-commerce API Connection Error

**Relacionado con:** proposal.md  
**Arquitectura:** Frontend (E-commerce)  
**Fecha:** 2026-03-03

---

## 🎯 Decisiones de Diseño

### Enfoque Elegido
Crear archivo `.env.local` con configuración correcta para desarrollo local, siguiendo el patrón estándar de Next.js.

### Rationale
**Por qué esta solución:**
- Sigue best practices de Next.js (variables de entorno)
- No requiere cambios de código
- Fácil de replicar en otros entornos
- Mantiene separación entre config y código

### Trade-offs
| Aspecto | Trade-off | Justificación |
|---------|-----------|---------------|
| Manualidad | Requiere crear archivo manualmente | Estándar en proyectos Next.js |
| Documentación | Necesita docs actualizadas | .env.local.example sirve como docs |

---

## 🏗️ Arquitectura

### Componentes Afectados

#### E-commerce Frontend
**Archivos creados:**
- `ecommerce/.env.local` - Configuración de desarrollo
- `ecommerce/.env.local.example` - Template para otros devs

**Archivos modificados (opcional):**
- `ecommerce/README.md` - Agregar instrucciones de setup (opcional)
- `ecommerce/app/lib/api.ts` - Agregar logging si falta env var (opcional)

**NO se modifica código existente** - solo configuración.

### Configuración de Variables de Entorno

#### Desarrollo Local (.env.local)
```bash
# API Backend URL (desarrollo local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Puerto del e-commerce (Next.js dev server)
PORT=3001
```

#### Producción (Railway)
```bash
# API Backend URL (producción)
NEXT_PUBLIC_API_URL=https://backend-production-c20a.up.railway.app

# Puerto (Railway auto-asigna)
PORT=3001
```

---

## 🚀 Deployment Runbook

### Pre-requisitos
- [x] Backend corriendo en http://localhost:8000
- [x] E-commerce dev server detenido (Ctrl+C)

### Pasos de Deployment

#### 1. Crear Archivos de Configuración

```bash
# Navegar a directorio e-commerce
cd ecommerce

# Crear .env.local para desarrollo
cat > .env.local << 'EOF'
# E-commerce Development Environment
NEXT_PUBLIC_API_URL=http://localhost:8000
PORT=3001
EOF

# Crear .env.local.example como template
cat > .env.local.example << 'EOF'
# E-commerce Environment Variables
# Copiar este archivo a .env.local y ajustar valores

# API Backend URL
# Development: http://localhost:8000
# Production: https://backend-production-c20a.up.railway.app
NEXT_PUBLIC_API_URL=http://localhost:8000

# Next.js Dev Server Port
PORT=3001
EOF

echo "✅ Archivos .env creados"
```

**Tiempo estimado:** 1 minuto

---

#### 2. Verificar que .gitignore Protege .env.local

```bash
# Verificar que .env.local está en .gitignore
grep -n "\.env\.local" ecommerce/.gitignore || echo ".env.local" >> ecommerce/.gitignore

echo "✅ .env.local protegido en .gitignore"
```

**Tiempo estimado:** 30 segundos

---

#### 3. Reiniciar E-commerce Dev Server

```bash
# Desde directorio ecommerce/
npm run dev

# Verificar que inicia en puerto 3001
# Expected output:
#   ▲ Next.js 15.x.x
#   - Local:        http://localhost:3001
#   - ready in X ms
```

**Tiempo estimado:** 1 minuto

---

#### 4. Verificación Post-Deploy

```bash
# Health check del backend
curl http://localhost:8000/health
# Expected: {"status":"healthy", ...}

# Verificar que e-commerce carga
curl -I http://localhost:3001
# Expected: HTTP/1.1 200 OK

# Verificar API client en browser console
# Abrir http://localhost:3001 en browser
# Abrir DevTools > Console
# No debería haber "Network Error" o "ERR_NETWORK"
```

**Verificación:**
- [x] Backend health check OK
- [x] E-commerce página carga (200 OK)
- [x] Sin errores en browser console
- [x] Productos cargan correctamente
- [x] WhatsApp sales (si aplica) sin errores

**Tiempo estimado:** 2 minutos

---

### Tiempo Estimado Total
5 minutos

---

## 🔄 Rollback Procedure

### Detección de Problemas
**Señales de alerta:**
- E-commerce no inicia
- Errores de variables de entorno en terminal
- Conflictos con .gitignore

### Pasos de Rollback

```bash
# Opción 1: Borrar .env.local (usa fallback)
rm ecommerce/.env.local
npm run dev

# Opción 2: Restaurar valores por defecto
cd ecommerce
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

**Tiempo:** 1 minuto

---

## 📊 Monitoring Checklist

### Métricas a Verificar (primeros 5 minutos)

#### Browser Console
- [x] **Sin errores de red:** No "ERR_NETWORK" en console
- [x] **API calls exitosas:** Network tab muestra 200 OK
- [x] **No warnings de env vars:** No "missing environment variable" warnings

#### Terminal (npm run dev)
- [x] **Server inicia correctamente:** Sin errores de startup
- [x] **Puerto 3001 disponible:** No "port already in use"
- [x] **Compilación exitosa:** "compiled successfully"

#### Funcionalidad
- [x] **Productos cargan:** GET /ecommerce/products funciona
- [x] **Categorías cargan:** GET /ecommerce/categories funciona
- [x] **WhatsApp config carga:** GET /ecommerce/whatsapp-config funciona (si aplica)

---

## 🧪 Testing Strategy

### Tests Manuales

#### Test 1: Conectividad Backend
**Pasos:**
1. Abrir http://localhost:3001
2. Abrir DevTools > Network tab
3. Recargar página
4. Verificar requests a http://localhost:8000

**Resultado esperado:**
- Requests a /ecommerce/products → 200 OK
- Requests a /ecommerce/categories → 200 OK
- Sin errores de CORS
- Sin timeouts

**Resultado actual:**
- [x] ✅ **PASS**

---

#### Test 2: Variables de Entorno
**Pasos:**
1. Agregar console.log en api.ts temporalmente:
```typescript
function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log('🔗 API Base URL:', url);  // ← Agregar esto
  return url;
}
```
2. Recargar página
3. Verificar console

**Resultado esperado:**
```
🔗 API Base URL: http://localhost:8000
```

**Resultado actual:**
- [x] ✅ **PASS**

---

#### Test 3: Fallback sin .env.local
**Pasos:**
1. Renombrar .env.local → .env.local.bak
2. Reiniciar npm run dev
3. Verificar que sigue funcionando

**Resultado esperado:**
- Código usa fallback `http://localhost:8000`
- Página carga correctamente

**Resultado actual:**
- [ ] ⚠️ **WARN** - Funciona pero con warnings

---

## 📝 Documentación a Actualizar

### ecommerce/README.md (opcional)

Agregar sección:

```markdown
## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the `ecommerce/` directory:

\`\`\`bash
# Copy from example
cp .env.local.example .env.local

# Edit values if needed
\`\`\`

**Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)
- `PORT` - Next.js dev server port (default: 3001)

### Development
\`\`\`bash
npm run dev
\`\`\`

Server will start on http://localhost:3001
```

---

## 🔐 Security Considerations

### .gitignore Verification
- [x] `.env.local` está en .gitignore
- [x] `.env.local.example` NO está en .gitignore (debe commitirse)

### Secrets
- ✅ No hay secrets en este fix (solo URLs públicas)
- ✅ .env.local nunca se commitea a git

---

## ✅ Checklist Final

### Pre-Deploy
- [x] .env.local creado con valores correctos
- [x] .env.local.example creado como template
- [x] .gitignore protege .env.local
- [x] Backend está corriendo (port 8000)

### Post-Deploy
- [x] E-commerce inicia en port 3001
- [x] Sin errores en browser console
- [x] API calls funcionan (Network tab)
- [x] Productos cargan correctamente
- [x] Sin "ERR_NETWORK" errors

### Opcional
- [ ] README.md actualizado con instrucciones
- [ ] Logging agregado en api.ts para debugging
- [ ] Documentación de troubleshooting agregada

---

## 💡 Learnings para Engram

```typescript
mcp_engram_mem_save({
  title: "E-commerce requires .env.local for API connection",
  type: "config",
  scope: "project",
  content: `
    **What**: E-commerce frontend necesita .env.local con NEXT_PUBLIC_API_URL
    **Why**: Next.js no carga variables de entorno sin archivo .env.local
    **Where**: ecommerce/.env.local
    **Learned**: 
    - Siempre crear .env.local.example en proyectos Next.js
    - NEXT_PUBLIC_* prefix es requerido para variables client-side
    - Next.js requiere restart después de cambiar .env.local
    - Backend en modo "production" localmente puede causar confusión
  `
})
```
