# Verify: [Nombre del Cambio]

**Relacionado con:** [TASKS_XXX.md]  
**Fecha verificación:** [YYYY-MM-DD]  
**Verificado por:** [Nombre]  
**Estado:** [✅ Aprobado | ⚠️ Con issues | ❌ Rechazado]

---

## 📋 Resumen de Verificación

### Resultado
[Descripción breve del resultado de la verificación]

### Issues Encontrados
- [Issue 1 si existe]
- [Issue 2 si existe]

---

## ✅ Verificación contra Specs

### Escenarios de Specs

#### Escenario 1: [Nombre del escenario]
**Given:** [Precondición]  
**When:** [Acción]  
**Then:** [Resultado esperado]

**Verificación:**
- [ ] ✅ **PASS** - [Descripción de cómo se verificó]
- [ ] ⚠️ **WARN** - [Funciona pero con issue menor]
- [ ] ❌ **FAIL** - [No funciona como se esperaba]

**Evidencia:**
```bash
# Comando ejecutado
curl -X POST https://backend-production-c20a.up.railway.app/api/[endpoint]

# Output
{"success": true, "data": {...}}
```

---

#### Escenario 2: [Nombre del escenario]
**Given:** [Precondición]  
**When:** [Acción]  
**Then:** [Resultado esperado]

**Verificación:**
- [ ] ✅ **PASS**
- [ ] ⚠️ **WARN**
- [ ] ❌ **FAIL**

---

## 🧪 Verificación de Tests

### Tests Unitarios

```bash
pytest tests/unit/ -v
```

**Resultado:**
- [ ] ✅ Todos los tests pasando
- [ ] ⚠️ Algunos tests skippeados
- [ ] ❌ Tests fallando

**Coverage:**
```bash
pytest --cov=app tests/
```
- **Coverage actual:** [X%]
- **Coverage requerido:** 80%
- [ ] ✅ Coverage >= 80%

---

### Tests de Integración

```bash
pytest tests/integration/ -v
```

**Resultado:**
- [ ] ✅ Todos los tests pasando
- [ ] ⚠️ Algunos tests skippeados
- [ ] ❌ Tests fallando

---

## 🔍 Verificación Funcional en Producción

### Smoke Tests

#### Test 1: [Descripción]
**Pasos:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado esperado:** [...]

**Resultado actual:**
- [ ] ✅ **PASS** - Funciona como se esperaba
- [ ] ⚠️ **WARN** - Funciona con issues menores
- [ ] ❌ **FAIL** - No funciona

**Evidencia:**
[Screenshot o log o descripción]

---

#### Test 2: [Descripción]
**Pasos:**
1. [Paso 1]
2. [Paso 2]

**Resultado esperado:** [...]

**Resultado actual:**
- [ ] ✅ **PASS**
- [ ] ⚠️ **WARN**
- [ ] ❌ **FAIL**

---

### Edge Cases

#### Edge Case 1: [Descripción]
**Escenario:** [Qué se probó]

**Resultado:**
- [ ] ✅ Manejado correctamente
- [ ] ⚠️ Warning apropiado mostrado
- [ ] ❌ Error no manejado

---

#### Edge Case 2: [Descripción]
**Escenario:** [Qué se probó]

**Resultado:**
- [ ] ✅ Manejado correctamente
- [ ] ⚠️ Warning apropiado mostrado
- [ ] ❌ Error no manejado

---

## 📊 Verificación de Métricas

### Performance

| Métrica | Antes | Después | Objetivo | Status |
|---------|-------|---------|----------|--------|
| Response Time (p95) | [X ms] | [Y ms] | < 500ms | ✅/⚠️/❌ |
| Database Queries | [X] | [Y] | Reducción | ✅/⚠️/❌ |
| Memory Usage | [X MB] | [Y MB] | Estable | ✅/⚠️/❌ |
| Request Count | [X/h] | [Y/h] | [Objetivo] | ✅/⚠️/❌ |

---

### Railway Metrics (24 horas)

**CPU Usage:**
- [ ] ✅ < 80% (normal)
- [ ] ⚠️ 80-95% (alto pero aceptable)
- [ ] ❌ > 95% (crítico)

**Memory:**
- [ ] ✅ Sin memory leaks
- [ ] ⚠️ Leve incremento gradual
- [ ] ❌ Memory leak evidente

**Errors:**
- [ ] ✅ < 0.1% error rate
- [ ] ⚠️ 0.1-1% error rate
- [ ] ❌ > 1% error rate

---

### Database

**Queries:**
```sql
-- Verificar que la nueva tabla existe (si aplica)
SELECT * FROM information_schema.tables WHERE table_name = '[table_name]';

-- Verificar datos
SELECT COUNT(*) FROM [table_name];
```

**Connection Pool:**
- [ ] ✅ < 20 active connections
- [ ] ⚠️ 20-40 connections
- [ ] ❌ > 40 connections (revisar N+1)

---

## 🔐 Verificación de Seguridad

### Authorization

- [ ] **Admin role:** Puede acceder a [endpoint/feature]
- [ ] **Manager role:** [Comportamiento esperado]
- [ ] **Seller role:** [Comportamiento esperado]
- [ ] **Unauthorized:** Recibe 401/403 apropiado

**Evidencia:**
```bash
# Test con token inválido
curl -X GET https://backend-production-c20a.up.railway.app/api/[endpoint] \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 Unauthorized
```

---

### Input Validation

- [ ] **SQL Injection:** Probado con `'; DROP TABLE --`
- [ ] **XSS:** Probado con `<script>alert('xss')</script>`
- [ ] **Invalid data types:** Probado con strings en campos numéricos
- [ ] **Empty/null values:** Manejados correctamente

**Resultado:**
- [ ] ✅ Todas las validaciones funcionan
- [ ] ⚠️ Algunas validaciones faltantes (documentadas abajo)
- [ ] ❌ Vulnerabilidades encontradas

---

## 📝 Verificación de Logs

### Logs de Aplicación

```bash
railway logs -s backend | tail -100
```

**Verificación:**
- [ ] ✅ Sin errores 500
- [ ] ✅ Sin excepciones no manejadas
- [ ] ✅ Sin warnings críticos
- [ ] ✅ Logs de debug apropiados

**Errores encontrados:** [Ninguno | Listar]

---

### Logs de Base de Datos

```bash
railway logs -s postgres
```

**Verificación:**
- [ ] ✅ Sin slow queries (> 1s)
- [ ] ✅ Sin deadlocks
- [ ] ✅ Sin connection pool exhausted

---

## 🔄 Verificación de Rollback

### Rollback Plan Tested

**Escenario:** Simular fallo y ejecutar rollback

**Pasos:**
1. [Paso 1 del rollback]
2. [Paso 2 del rollback]
3. [Verificar sistema volvió a estado anterior]

**Resultado:**
- [ ] ✅ **PASS** - Rollback funciona correctamente
- [ ] ⚠️ **WARN** - Rollback parcial
- [ ] ❌ **FAIL** - Rollback no funciona

**Tiempo de rollback:** [X minutos]

---

## 📱 Verificación de UX

### Frontend (si aplica)

#### Usabilidad
- [ ] **Responsive:** Funciona en mobile, tablet, desktop
- [ ] **Loading states:** Indicadores de carga apropiados
- [ ] **Error messages:** Mensajes claros y útiles
- [ ] **Success feedback:** Confirmaciones apropiadas

#### Accesibilidad
- [ ] **Keyboard navigation:** Funciona sin mouse
- [ ] **Screen reader:** Textos apropiados
- [ ] **Contrast:** Cumple WCAG 2.1 nivel A

---

## ✅ Checklist Final de Verificación

### Funcionalidad
- [ ] Todos los escenarios de specs verificados
- [ ] Edge cases manejados correctamente
- [ ] Error handling apropiado
- [ ] Validaciones funcionando

### Performance
- [ ] Métricas dentro de objetivos
- [ ] Sin degradación de performance
- [ ] Sin memory leaks
- [ ] Database queries optimizadas

### Seguridad
- [ ] Authorization verificada
- [ ] Input validation verificada
- [ ] Sin vulnerabilidades obvias
- [ ] CORS configurado correctamente

### Operaciones
- [ ] Logs apropiados
- [ ] Monitoring funcionando
- [ ] Rollback plan verificado
- [ ] Documentación actualizada

---

## 🐛 Issues Encontrados

### Issue 1: [Título del issue]
**Severidad:** [Critical | High | Medium | Low]

**Descripción:**
[Descripción del problema encontrado]

**Pasos para reproducir:**
1. [Paso 1]
2. [Paso 2]

**Comportamiento esperado:**
[Qué debería pasar]

**Comportamiento actual:**
[Qué pasa realmente]

**Acción requerida:**
- [ ] Fix inmediato (bloquea release)
- [ ] Fix antes de release
- [ ] Fix en próximo sprint
- [ ] Documentar como known issue

---

## 📈 Métricas de Éxito (KPIs)

### KPIs Definidos en Proposal

| KPI | Objetivo | Actual | Status |
|-----|----------|--------|--------|
| [KPI 1] | [Valor objetivo] | [Valor actual] | ✅/⚠️/❌ |
| [KPI 2] | [Valor objetivo] | [Valor actual] | ✅/⚠️/❌ |
| [KPI 3] | [Valor objetivo] | [Valor actual] | ✅/⚠️/❌ |

**Conclusión:** [Si se alcanzaron los KPIs]

---

## 💡 Learnings

### Qué funcionó bien
- [Learning 1]
- [Learning 2]

### Qué podría mejorar
- [Mejora 1]
- [Mejora 2]

### Sorpresas / Descubrimientos
- [Descubrimiento 1]
- [Descubrimiento 2]

---

## 📝 Decisión Final

### Veredicto
- [ ] ✅ **APROBADO** - Ready para producción
- [ ] ⚠️ **APROBADO CON CONDICIONES** - [Listar condiciones]
- [ ] ❌ **RECHAZADO** - Requiere más trabajo

### Próximos Pasos
- [Paso 1: ej. "Deployar a producción"]
- [Paso 2: ej. "Monitorear métricas por 48 horas"]
- [Paso 3: ej. "Archivar cambio"]

---

## ✍️ Sign-off

**Verificado por:** [Nombre]  
**Fecha:** [YYYY-MM-DD]  
**Firma:** [...]

**Aprobado por:** [Cliente/Tech Lead]  
**Fecha:** [YYYY-MM-DD]  
**Firma:** [...]
