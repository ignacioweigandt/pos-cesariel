# Proposal: Add Product Rating System

**Tipo:** feature  
**Severidad:** medium  
**Fecha:** 2026-03-03  
**Solicitado por:** Cliente  
**Aprobación requerida:** Sí

---

## 📋 Resumen Ejecutivo

### Problema
Los clientes del e-commerce quieren poder calificar productos que compraron, para ayudar a otros clientes a tomar mejores decisiones de compra. Actualmente no hay manera de dejar feedback sobre los productos.

### Solución Propuesta
Implementar un sistema de ratings (1-5 estrellas) + comentarios opcionales para productos. Solo clientes que compraron el producto pueden calificarlo. Las calificaciones se muestran en el detalle del producto en e-commerce.

### Impacto Esperado
- **Usuarios afectados:** Cliente E-commerce
- **Componentes afectados:** Backend, E-commerce frontend
- **Downtime requerido:** Ninguno (solo cambios de schema con migración)

---

## 🎯 Alcance

### En Alcance
- [ ] Modelo `ProductRating` (rating, comment, user_email, product_id, created_at)
- [ ] Endpoint POST /products/{id}/ratings (crear rating)
- [ ] Endpoint GET /products/{id}/ratings (listar ratings con paginación)
- [ ] Campo calculado `average_rating` en Product
- [ ] UI en e-commerce para mostrar ratings
- [ ] UI en e-commerce para enviar nuevo rating (solo si compró)
- [ ] Validación: 1 rating por email por producto

### Fuera de Alcance
- Ratings en POS Admin (solo e-commerce)
- Editar/borrar ratings (MVP solo permite crear)
- Reportes de ratings (para futura iteración)
- Moderación de comentarios (se asume uso responsable)

---

## 🔍 Análisis de Riesgos

### Riesgos Identificados
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Spam de ratings | Media | Medio | Validar 1 rating por email, solo si compró producto |
| Performance con muchos ratings | Baja | Medio | Paginación, índice en product_id |
| Ratings maliciosos | Media | Bajo | Fase 2: sistema de moderación |

### Dependencias
- [ ] Migración Alembic para nueva tabla `product_ratings`
- [ ] Endpoint público (sin auth) para crear ratings

---

## 🔄 Rollback Plan

### Condiciones de Rollback
- Errores 500 al crear/listar ratings
- Performance degradada en listado de productos
- Problemas de spam inmanejables

### Procedimiento de Rollback
```bash
# Revertir código (Railway auto-deploy)
git revert <commit-hash>
git push origin main

# Opcional: revertir migración (si es necesario)
railway run -s backend make migrate-downgrade
```

### Tiempo Estimado de Rollback
3 minutos (código) + 5 minutos (migración)

---

## 📊 Métricas de Éxito

### KPIs
- [ ] Al menos 10% de clientes dejan rating después de comprar
- [ ] Promedio de rating visible en <100ms
- [ ] 0 errores en logs al crear ratings por 48 horas

### Verificación Post-Deploy
- [ ] Endpoint POST /products/{id}/ratings funciona
- [ ] Endpoint GET /products/{id}/ratings devuelve datos paginados
- [ ] UI en e-commerce muestra ratings correctamente
- [ ] No hay errores en logs de Railway

---

## 📅 Cronograma Estimado

| Fase | Tiempo Estimado |
|------|-----------------|
| Diseño técnico | 1 hora |
| Implementación Backend | 3 horas |
| Implementación Frontend | 2 horas |
| Testing | 1 hora |
| Deployment | 15 minutos |
| Verificación | 30 minutos |
| **TOTAL** | **~8 horas** |

---

## 🤔 Alternativas Consideradas

### Alternativa 1: Integración con servicio externo (ej. Trustpilot)
**Pros:**
- Sistema maduro con moderación incluida
- Sin desarrollo necesario

**Contras:**
- Costo mensual adicional ($99/mes)
- Dependencia externa
- Menos control sobre datos

**Por qué no se eligió:**
MVP interno es más económico y customizable. Podemos migrar a externo en futuro si es necesario.

---

### Alternativa 2: Solo ratings sin comentarios
**Pros:**
- Más simple de implementar
- Menos riesgo de spam

**Contras:**
- Menos útil para clientes (comentarios aportan contexto)

**Por qué no se eligió:**
Comentarios opcionales no agregan mucha complejidad y aportan valor significativo.

---

## ✅ Aprobación

- [ ] **Tech Lead:** [Pendiente] - [Fecha]
- [ ] **Cliente:** [Pendiente] - [Fecha]

---

## 📝 Notas Adicionales

- Este es un EJEMPLO de propuesta para demostrar el formato SDD
- En producción real, este documento se completaría antes de comenzar implementación
- La aprobación del cliente y tech lead es REQUERIDA antes de proceder a diseño
