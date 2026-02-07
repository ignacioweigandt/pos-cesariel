# 🚀 Guía: Testear Performance de Producción

## 📋 ¿Por qué hacer esto?

En **modo desarrollo** (`npm run dev`):
- ❌ Next.js recompila código en cada cambio (2-15 segundos)
- ❌ Hot Module Replacement causa delays
- ❌ Sin optimizaciones de producción

En **modo producción** (`npm run build + start`):
- ✅ Todo pre-compilado (navegación instantánea)
- ✅ Bundles optimizados y minificados
- ✅ Performance real que verán los usuarios

---

## 🎯 Método 1: Usando Makefile (RECOMENDADO)

### **Iniciar modo producción:**

```bash
make prod-test
```

Esto va a:
1. Construir builds de producción (frontend + backend)
2. Levantar servicios optimizados
3. Mostrar URLs para testear

### **Testear la velocidad:**

1. Abrí http://localhost:3000
2. Hacé login
3. Navegá entre módulos (Dashboard → POS → Inventory → Reports)
4. **Observá:** Carga < 1 segundo, navegación instantánea

### **Ver logs:**

```bash
make prod-logs
```

### **Detener y volver a desarrollo:**

```bash
make prod-stop
```

Esto automáticamente vuelve a levantar el modo desarrollo.

---

## 🎯 Método 2: Usando docker-compose directo

### **Iniciar producción:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### **Detener producción:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### **Volver a desarrollo:**

```bash
docker-compose up -d
```

---

## 🎯 Método 3: Script bash

### **Iniciar:**

```bash
./scripts/test-production.sh start
```

### **Ver logs:**

```bash
./scripts/test-production.sh logs
```

### **Detener:**

```bash
./scripts/test-production.sh stop
```

---

## 📊 Comparación de Performance

| Métrica | Desarrollo | Producción |
|---------|-----------|------------|
| **Primera carga** | 2-15s | < 1s |
| **Navegación** | 2-5s | Instantánea |
| **HMR/Hot Reload** | ✅ Sí | ❌ No |
| **Bundle size** | Grande | Minificado |
| **Logs de debug** | Muchos | Ninguno |
| **Optimizaciones** | ❌ No | ✅ Sí |

---

## ⚠️ IMPORTANTE

### **Cuándo usar cada modo:**

**Desarrollo (`docker-compose up`):**
- ✅ Para programar (hot reload activo)
- ✅ Para ver cambios al instante
- ❌ No para medir performance

**Producción (`make prod-test`):**
- ✅ Para testear performance real
- ✅ Para demos a clientes
- ✅ Para verificar antes de deploy
- ❌ No para desarrollar (sin hot reload)

---

## 🔧 Comandos Útiles

```bash
# Ver todos los comandos disponibles
make help

# Estado de servicios de producción
make prod-status

# Reconstruir después de cambios
make prod-rebuild

# Ver logs en tiempo real
make prod-logs

# Detener y volver a dev
make prod-stop
```

---

## 💡 Tips

1. **Primera vez:** El build tarda 5-10 minutos (normal)
2. **Rebuilds:** Son más rápidos (usan cache)
3. **Cambios en código:** Necesitás `make prod-rebuild` para verlos
4. **Performance:** Medila en producción, no en desarrollo

---

## 🎯 Flujo de Trabajo Recomendado

```bash
# 1. Desarrollar con hot reload
docker-compose up -d

# 2. Hacer cambios en código
# ... editando archivos ...

# 3. Testear performance
make prod-test

# 4. Si todo OK, hacer commit
git add .
git commit -m "feature: nueva funcionalidad"

# 5. Volver a desarrollo
make prod-stop
```

---

## 🚨 Troubleshooting

### **"Puerto ya en uso"**

Detené desarrollo primero:
```bash
docker-compose down
make prod-test
```

### **"Build muy lento"**

Primera vez es normal (5-10 min). Siguientes son más rápidos.

### **"Cambios no se ven"**

En producción NO hay hot reload. Hacer rebuild:
```bash
make prod-rebuild
```

### **"Error de permisos"**

```bash
chmod +x scripts/test-production.sh
```

---

## 📚 Más Info

- Ver `Makefile` para todos los comandos
- Ver `docker-compose.prod.yml` para configuración
- Ver `CLAUDE.md` para documentación completa

---

**Creado:** 04/02/2026  
**Autor:** Sistema POS Cesariel
