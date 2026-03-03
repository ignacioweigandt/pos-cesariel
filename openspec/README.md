# POS Cesariel - Spec-Driven Development

**Sistema:** Mantenimiento de Producción  
**Versión SDD:** 1.0  
**Última actualización:** Marzo 2026

---

## 🎯 Propósito

Este directorio contiene la documentación Spec-Driven Development (SDD) para **mantenimiento en producción** del sistema POS Cesariel.

**NO es para desarrollo inicial**, sino para:
- ✅ Gestionar cambios en sistema productivo
- ✅ Documentar hotfixes y bugfixes
- ✅ Trackear nuevas features solicitadas por el cliente
- ✅ Mantener historial de decisiones técnicas
- ✅ Procedimientos de deployment y rollback

---

## 📁 Estructura

```
openspec/
├── config.yaml              # Configuración del SDD para este proyecto
├── README.md                # Este archivo
├── specs/                   # Especificaciones principales (source of truth)
│   ├── auth.md              # Specs de autenticación
│   ├── inventory.md         # Specs de inventario
│   ├── sales.md             # Specs de ventas POS
│   └── ecommerce.md         # Specs de e-commerce
├── changes/                 # Cambios activos y propuestas
│   ├── 001-hotfix-stock-bug/
│   │   ├── proposal.md
│   │   ├── design.md
│   │   ├── tasks.md
│   │   └── verify.md
│   └── archive/             # Cambios completados
│       └── 001-hotfix-stock-bug/  (movido aquí al completar)
└── templates/               # Templates para nuevos cambios
    ├── PROPOSAL_TEMPLATE.md
    ├── DESIGN_TEMPLATE.md
    ├── TASKS_TEMPLATE.md
    └── VERIFY_TEMPLATE.md
```

---

## 🚀 Workflow de Cambios

### 1️⃣ Crear Propuesta
```bash
# Copiar template
cp openspec/templates/PROPOSAL_TEMPLATE.md openspec/changes/002-nombre-del-cambio/proposal.md

# Editar y completar propuesta
# Definir: tipo, severidad, alcance, riesgos, rollback plan
```

**Tipos de cambio:**
- `hotfix`: Bug crítico en producción (fix inmediato)
- `bugfix`: Bug no crítico (puede esperar)
- `feature`: Nueva funcionalidad
- `optimization`: Mejora de performance
- `config`: Cambio de configuración

### 2️⃣ Diseñar Solución
```bash
# Copiar template
cp openspec/templates/DESIGN_TEMPLATE.md openspec/changes/002-nombre-del-cambio/design.md

# Completar:
# - Arquitectura y componentes afectados
# - Deployment runbook (pasos exactos)
# - Rollback procedure (cómo volver atrás)
# - Monitoring checklist (qué verificar post-deploy)
```

### 3️⃣ Implementar (apply)
```bash
# Seguir tasks definidas en design.md
# Mantener Clean Architecture:
#   - Cambios en Models → app/models/
#   - Cambios en Repositories → app/repositories/
#   - Cambios en Services → app/services/
#   - Cambios en Routers → routers/
#   - Migraciones → make migrate-create MSG="descripción"
```

### 4️⃣ Verificar (verify)
```bash
# Tests
make test-backend
cd frontend/pos-cesariel && npm test

# Deploy a producción (Railway auto-deploy desde main)
git push origin main

# Verificación post-deploy
curl https://backend-production-c20a.up.railway.app/health
railway logs -s backend
```

### 5️⃣ Archivar (archive)
```bash
# Mover a archive cuando completado
mv openspec/changes/002-nombre-del-cambio openspec/changes/archive/

# Capturar learnings en Engram
# (se hace automáticamente si usas mcp_engram_mem_save)
```

---

## 🔧 Comandos Útiles

### Desarrollo Local
```bash
make dev                 # Levantar todos los servicios
make logs-backend        # Ver logs del backend
make shell-backend       # Acceder a container backend
make test-backend        # Correr tests
```

### Migraciones de BD
```bash
make migrate-create MSG="add user avatar field"
make migrate-upgrade     # Aplicar migraciones
make migrate-downgrade   # Revertir migración
make backup-db           # Backup antes de migraciones
```

### Deployment
```bash
git push origin main     # Railway auto-deploy
railway logs -s backend  # Ver logs de producción
railway rollback -s backend  # Rollback si hay problemas
```

---

## 📊 Integración con Engram (Memoria Persistente)

Este proyecto usa **Engram MCP** para memoria persistente entre sesiones.

### Cuándo guardar en Engram:
- ✅ Después de completar un hotfix o bugfix
- ✅ Decisiones arquitectónicas importantes
- ✅ Bugs conocidos y workarounds
- ✅ Configuraciones específicas del cliente
- ✅ Procedimientos de deployment que funcionaron

### Cómo guardar:
```typescript
// Claude Code automáticamente guarda en Engram usando:
mcp_engram_mem_save({
  title: "Fixed N+1 query in products endpoint",
  type: "bugfix",
  scope: "project",
  content: `
    **What**: Replaced per-product stock queries with batch query
    **Why**: Railway timeout with 50+ products (N+1 problem)
    **Where**: backend/routers/products.py
    **Learned**: Always use batch queries, Railway has strict timeouts
  `
})
```

### Recuperar de Engram:
```typescript
// Buscar conocimiento previo
mcp_engram_mem_search({ 
  query: "stock management issues", 
  project: "pos-cesariel" 
})

// Ver contexto reciente
mcp_engram_mem_context({ 
  project: "pos-cesariel", 
  limit: 20 
})
```

---

## 🎓 Mejores Prácticas

### 1. Siempre crear propuesta primero
- No hacer cambios directos sin documentar
- Propuesta ayuda a pensar antes de codear

### 2. Incluir rollback plan
- Para severity >= medium, SIEMPRE tener plan de rollback
- Documentar pasos exactos, no generalidades

### 3. Testing obligatorio
- Tests unitarios para bugfix y feature
- Testing manual en producción post-deploy

### 4. Monitoring post-deploy
- Primeras 24 horas son críticas
- Verificar métricas de Railway (CPU, memory, requests)
- Verificar logs de errores

### 5. Capturar learnings
- Usar Engram para documentar lo aprendido
- Útil para futuras sesiones y otros developers

---

## 📝 Constraints Críticos del Proyecto

### Stock Management
- ⚠️ **NUNCA modificar `Product.stock_quantity` directamente**
- ✅ **SIEMPRE usar `BranchStock` table**
- Stock es por sucursal + producto + talla
- Usar `ProductRepository.update_stock()` o `BranchStockRepository.adjust_stock()`

### API Endpoints
- ⚠️ **SIN trailing slashes**: `/products` NO `/products/`
- CORS en producción: dominios específicos, NO wildcard `"*"`

### Multi-tenant
- Queries DEBEN filtrar por `branch_id` según rol
- Admin ve todas las sucursales
- Manager/Seller solo su sucursal

### Database Migrations
- ✅ **USAR Alembic** para cambios de schema
- ⚠️ **NO usar `Base.metadata.create_all()`** en producción
- Backup antes de migrations: `make backup-db`

### Known Issues
- Columna `version` no existe en producción (optimistic locking deshabilitado)
- Payment methods: lookup case-insensitive (frontend minúsculas, DB mayúsculas)
- Products limit: máximo 500 por request (Railway timeout)

---

## 🔗 Links Útiles

### Producción
- Backend API: https://backend-production-c20a.up.railway.app
- POS Admin: https://frontend-pos-production.up.railway.app
- E-commerce: https://e-commerce-production-3634.up.railway.app
- Railway Dashboard: https://railway.app/dashboard

### Documentación
- `CLAUDE.md` - Guía principal del proyecto
- `BACKEND_STRUCTURE.md` - Estructura del backend
- `PRD.md` - Product Requirements Document
- `DEPLOYMENT_FIXES_2026-02-15.md` - Historial de fixes en producción

### Credenciales Producción
```
Admin:    admin    / admin123
Manager:  manager  / manager123
Seller:   seller   / seller123
```

---

## 📞 Soporte

**Developer:** Ignacio Weigandt  
**AI Assistant:** Claude Code (Anthropic)  
**Proyecto:** POS Cesariel - Sistema de Punto de Venta + E-commerce
