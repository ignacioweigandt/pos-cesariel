# Proposal: [Nombre del Cambio]

**Tipo:** [hotfix | bugfix | feature | optimization | config]  
**Severidad:** [critical | high | medium | low]  
**Fecha:** [YYYY-MM-DD]  
**Solicitado por:** [Cliente | Equipo | Sistema]  
**Aprobación requerida:** [Sí | No]

---

## 📋 Resumen Ejecutivo

### Problema
[Describir el problema actual, bug, o necesidad que motiva este cambio]

### Solución Propuesta
[Describir en 2-3 párrafos la solución propuesta]

### Impacto Esperado
- **Usuarios afectados:** [Admin | Manager | Seller | Cliente E-commerce | Todos]
- **Componentes afectados:** [Backend | Frontend POS | E-commerce | Base de Datos | Configuración]
- **Downtime requerido:** [Ninguno | < 5 min | > 5 min]

---

## 🎯 Alcance

### En Alcance
- [ ] [Item 1]
- [ ] [Item 2]

### Fuera de Alcance
- [Item que NO se incluirá en este cambio]

---

## 🔍 Análisis de Riesgos

### Riesgos Identificados
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| [Riesgo 1] | Alta/Media/Baja | Alto/Medio/Bajo | [Cómo mitigarlo] |

### Dependencias
- [ ] [Sistema externo, biblioteca, migración de BD, etc.]

---

## 🔄 Rollback Plan

### Condiciones de Rollback
[¿En qué casos se debe hacer rollback?]

### Procedimiento de Rollback
```bash
# Pasos exactos para volver atrás
railway rollback -s backend
# o
git revert <commit-hash>
# o
make migrate-downgrade  # Si hubo migración de BD
```

### Tiempo Estimado de Rollback
[X minutos]

---

## 📊 Métricas de Éxito

### KPIs
- [ ] [Métrica 1: ej. "Tiempo de respuesta < 200ms"]
- [ ] [Métrica 2: ej. "0 errores en logs por 24 horas"]
- [ ] [Métrica 3: ej. "Reducción de 90% en requests"]

### Verificación Post-Deploy
- [ ] [Endpoint X responde correctamente]
- [ ] [Feature Y funciona en producción]
- [ ] [No hay errores en logs de Railway]

---

## 📅 Cronograma Estimado

| Fase | Tiempo Estimado |
|------|-----------------|
| Diseño técnico | [X horas] |
| Implementación | [X horas] |
| Testing | [X horas] |
| Deployment | [X minutos] |
| Verificación | [X minutos] |
| **TOTAL** | **[X horas]** |

---

## 🤔 Alternativas Consideradas

### Alternativa 1: [Nombre]
**Pros:**
- [Pro 1]

**Contras:**
- [Contra 1]

**Por qué no se eligió:**
[Razón]

---

## ✅ Aprobación

- [ ] **Tech Lead:** [Nombre] - [Fecha]
- [ ] **Cliente:** [Nombre] - [Fecha] (si aplica)

---

## 📝 Notas Adicionales

[Cualquier información adicional relevante]
