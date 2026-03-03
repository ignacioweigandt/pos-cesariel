# 🚀 SDD Quick Start - POS Cesariel

**Sistema de Mantenimiento en Producción**

---

## ⚡ Inicio Rápido

### 1️⃣ Nuevo Cambio

```bash
# 1. Crear directorio para el cambio
mkdir -p openspec/changes/002-nombre-descriptivo

# 2. Copiar template de propuesta
cp openspec/templates/PROPOSAL_TEMPLATE.md \
   openspec/changes/002-nombre-descriptivo/proposal.md

# 3. Editar propuesta (definir tipo, alcance, riesgos, rollback)
# Tipos: hotfix | bugfix | feature | optimization | config
```

### 2️⃣ Diseñar Solución

```bash
# 1. Copiar template de diseño
cp openspec/templates/DESIGN_TEMPLATE.md \
   openspec/changes/002-nombre-descriptivo/design.md

# 2. Completar diseño (arquitectura, deployment runbook, rollback procedure)
```

### 3️⃣ Implementar

```bash
# Seguir Clean Architecture:
# - Models → app/models/
# - Repositories → app/repositories/
# - Services → app/services/
# - Routers → routers/

# Si hay cambios de schema:
make migrate-create MSG="descripción del cambio"
```

### 4️⃣ Verificar y Deployar

```bash
# Tests
make test-backend

# Deploy (Railway auto-deploy)
git push origin main

# Verificar
curl https://backend-production-c20a.up.railway.app/health
railway logs -s backend
```

---

## 🔥 Tipos de Cambios

| Tipo | Cuándo Usar | Prioridad | Approval |
|------|-------------|-----------|----------|
| `hotfix` | Bug crítico en producción | Urgente | No |
| `bugfix` | Bug no crítico | Alta | No |
| `feature` | Nueva funcionalidad | Media | Sí |
| `optimization` | Mejora de performance | Baja | No |
| `config` | Cambio de configuración | Media | Sí |

---

## ⚠️ Reglas Críticas

### Stock Management
```python
# ❌ NUNCA HACER ESTO
product.stock_quantity = 100

# ✅ SIEMPRE HACER ESTO
BranchStockRepository.adjust_stock(product_id, branch_id, quantity, "ENTRADA")
```

### API Endpoints
```python
# ❌ NO
router.get("/products/")

# ✅ SÍ
router.get("/products")
```

### Migraciones
```bash
# ✅ SIEMPRE usar Alembic
make migrate-create MSG="add user avatar"
make migrate-upgrade

# ❌ NUNCA usar create_all() en producción
```

---

## 🔄 Rollback Rápido

```bash
# Opción 1: Rollback en Railway (más rápido)
railway rollback -s backend

# Opción 2: Revert de código
git revert <commit-hash>
git push origin main

# Opción 3: Rollback de migración
railway run -s backend make migrate-downgrade
```

---

## 📊 Verificación Post-Deploy

```bash
# Health check
curl https://backend-production-c20a.up.railway.app/health

# Ver logs
railway logs -s backend

# Verificar métricas (Railway Dashboard)
# - CPU < 80%
# - Memory estable
# - No errores 500
```

---

## 💾 Capturar Learnings en Engram

```typescript
// Claude Code automáticamente guarda usando:
mcp_engram_mem_save({
  title: "Fixed XYZ issue in production",
  type: "bugfix",
  scope: "project",
  content: `
    **What**: [Qué se hizo]
    **Why**: [Por qué era necesario]
    **Where**: [Archivos afectados]
    **Learned**: [Lecciones aprendidas]
  `
})
```

---

## 📚 Documentación Completa

- **openspec/README.md** - Guía completa del sistema SDD
- **openspec/config.yaml** - Configuración y reglas
- **openspec/templates/** - Templates para copiar
- **openspec/changes/example-001-add-product-rating/** - Ejemplo de referencia

---

## 🔗 Links Útiles

- **Backend API:** https://backend-production-c20a.up.railway.app
- **POS Admin:** https://frontend-pos-production.up.railway.app
- **E-commerce:** https://e-commerce-production-3634.up.railway.app
- **Railway Dashboard:** https://railway.app/dashboard

---

## 📞 Ayuda

**Documentación completa:** Ver `openspec/README.md`  
**Ejemplo completo:** Ver `openspec/changes/example-001-add-product-rating/`  
**Config del proyecto:** Ver `openspec/config.yaml`
