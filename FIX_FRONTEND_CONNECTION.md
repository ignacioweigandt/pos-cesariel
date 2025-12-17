# Fix: Frontend Conectando a localhost en lugar de Railway

## ❌ Problema

Frontend muestra error:
```
Error de conexión. Verifica que el backend esté funcionando en http://localhost:8000
```

## 🔍 Causa

La variable `NEXT_PUBLIC_API_URL` no está configurada correctamente o el frontend no se redeployó después de configurarla.

---

## ✅ Solución Rápida (2 pasos)

### Paso 1: Verificar Variable en Railway UI

1. **Ve a:** https://railway.app/project/2984b683-f2d8-4cf6-a13b-ca806d5bb3e6

2. **Click en "frontend-pos"**

3. **Settings → Variables**

4. **Busca `NEXT_PUBLIC_API_URL`:**

   **Si no existe:**
   - Click **"+ New Variable"**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://backend-production-c20a.up.railway.app`
   - Click **"Add"**

   **Si existe pero dice `http://localhost:8000`:**
   - Click en el ícono de editar (lápiz)
   - Cambia el valor a: `https://backend-production-c20a.up.railway.app`
   - Guarda

   **Si ya dice `https://backend-production-c20a.up.railway.app`:**
   - La variable está correcta, solo falta redeploy

### Paso 2: Forzar Redeploy

**Opción A: Desde Railway UI**
1. Ve a **Settings → Deployments**
2. Click en los 3 puntos (...) del deployment más reciente
3. Click en **"Redeploy"**

**Opción B: Ya lo hice por ti**
- Hice un push a GitHub que forzará el redeploy automáticamente
- Railway detectará el cambio en ~30 segundos
- El redeploy tomará 2-3 minutos

---

## ⏰ Esperar Redeploy

**Tiempo estimado:** 2-3 minutos

**Monitorear:**
- Railway UI → frontend-pos → Deployments
- Busca el nuevo deployment "Building..." → "Deployed"

---

## 🧪 Verificar que Funcionó

### 1. Abrir Frontend

```
https://frontend-pos-production.up.railway.app
```

### 2. Abrir Consola del Navegador

Presiona **F12** → **Console**

### 3. Intentar Login

Usuario: `admin`
Password: `admin123`

### 4. Buscar Errores

**❌ Si aún ves:**
```
Failed to connect to localhost:8000
```

Significa que el frontend no se redeployó o la variable no se configuró.

**✅ Si ves:**
```
POST https://backend-production-c20a.up.railway.app/api/auth/login
```

¡Perfecto! El frontend está conectado correctamente al backend.

---

## 🔧 Variables Completas que Debe Tener frontend-pos

| Variable | Valor Correcto |
|----------|---------------|
| `NEXT_PUBLIC_API_URL` | `https://backend-production-c20a.up.railway.app` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `NEXT_TELEMETRY_DISABLED` | `1` |

---

## 🐛 Troubleshooting

### Error persiste después de redeploy

**Causa:** La variable no se guardó correctamente

**Solución:**
1. Borra la variable actual (click en X)
2. Créala de nuevo:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://backend-production-c20a.up.railway.app`
3. Espera redeploy automático (2-3 min)

---

### El frontend muestra página en blanco

**Causa:** Error de build

**Ver logs:**
1. Railway UI → frontend-pos → Deployments
2. Click en el deployment
3. Scroll down a "Build Logs"
4. Busca errores

**Común:** Si ves "Module not found", revisa que todos los archivos lib/ estén en el repositorio.

---

### Variables correctas pero sigue conectando a localhost

**Causa:** Caché del navegador

**Solución:**
1. Abre el frontend en una **ventana de incógnito**
2. O limpia la caché: Ctrl+Shift+Delete → Borrar caché
3. Recarga la página con Ctrl+F5 (hard refresh)

---

### Railway no detecta el redeploy

**Causa:** Railway no está escuchando el repositorio

**Solución Manual:**
1. Railway UI → frontend-pos → Settings
2. Click en **"Disconnect Source"**
3. Click en **"Connect to GitHub"**
4. Selecciona el repositorio: `ignacioweigandt/pos-cesariel`
5. Branch: `main`
6. Root Directory: `frontend/pos-cesariel`
7. Guarda y espera redeploy

---

## ✅ Checklist de Verificación

- [ ] Variable `NEXT_PUBLIC_API_URL` existe en Railway
- [ ] Valor es `https://backend-production-c20a.up.railway.app` (con https://)
- [ ] Railway hizo redeploy del frontend (Deployments muestra "Deployed")
- [ ] Frontend carga sin errores
- [ ] Consola del navegador (F12) no muestra errores de localhost
- [ ] Login intenta conectar a backend-production-c20a.up.railway.app
- [ ] Login funciona con admin/admin123
- [ ] Dashboard del POS se muestra correctamente

---

## 🎯 Estado Esperado Final

**Cuando todo funcione:**

```
F12 Console:
✅ POST https://backend-production-c20a.up.railway.app/api/auth/login 200 OK
✅ GET https://backend-production-c20a.up.railway.app/api/products 200 OK
```

**Login exitoso:**
```json
{
  "access_token": "eyJ...",
  "user": {
    "username": "admin",
    "role": "ADMIN"
  }
}
```

**Dashboard visible con:**
- ✅ Menú lateral
- ✅ Stats de ventas
- ✅ Lista de productos
- ✅ Sin errores de conexión

---

**Fecha:** Diciembre 17, 2024
**Problema:** Frontend conectando a localhost:8000
**Solución:** Configurar NEXT_PUBLIC_API_URL y forzar redeploy
**Tiempo:** 3-5 minutos
