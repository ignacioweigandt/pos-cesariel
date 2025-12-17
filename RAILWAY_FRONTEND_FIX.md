# Fix: Frontend Dockerfile Not Found en Railway

## 🔴 Error

```
couldn't locate the dockerfile at path Dockerfile.production in code archive
  -  not found at Dockerfile.production
  -  not found at frontend/Dockerfile.production
```

## ✅ Solución Paso a Paso

### Opción 1: Configuración Manual (Recomendada)

#### Paso 1: Verificar/Configurar Root Directory

1. En Railway, ve a tu servicio **Frontend POS**
2. Click en **Settings** (engranaje)
3. Busca la sección **"Source"** o **"Service"**
4. Encuentra el campo **"Root Directory"**
5. Asegúrate que diga **EXACTAMENTE**:
   ```
   frontend/pos-cesariel
   ```
   ⚠️ **SIN** barra al final
   ⚠️ **SIN** espacios
   ⚠️ Sensible a mayúsculas/minúsculas

#### Paso 2: Configurar Dockerfile Path

1. En la misma pantalla de **Settings**
2. Busca **"Build"** o **"Docker"**
3. Encuentra el campo **"Dockerfile Path"**
4. Asegúrate que diga **EXACTAMENTE**:
   ```
   Dockerfile.production
   ```
   ⚠️ **NO** pongas: `frontend/pos-cesariel/Dockerfile.production`
   ⚠️ La ruta es **relativa** al Root Directory

#### Paso 3: Verificar Build Command (Opcional)

1. En **Settings** → **Build**
2. **Builder**: debe estar en `DOCKERFILE`
3. **Build Command**: debe estar **VACÍO** (se usa el Dockerfile)

#### Paso 4: Redeploy

1. Ve a **Deployments**
2. Click en **"New Deployment"** o **"Redeploy"**
3. Espera que complete el build (5-10 minutos)

---

### Opción 2: Usar Nixpacks (Alternativa)

Si la Opción 1 no funciona, Railway puede detectar Next.js automáticamente:

#### Paso 1: Cambiar a Nixpacks

1. **Settings** → **Build**
2. **Builder**: Cambia de `DOCKERFILE` a `NIXPACKS`
3. **Dockerfile Path**: Déjalo **VACÍO** o elimínalo

#### Paso 2: Configurar Variables de Build

1. **Settings** → **Variables**
2. Asegúrate que estén estas variables:
   ```env
   NEXT_PUBLIC_API_URL=https://<tu-backend-domain>
   NODE_ENV=production
   ```

#### Paso 3: Configurar Root Directory

1. **Settings** → **Source**
2. **Root Directory**: `frontend/pos-cesariel`

#### Paso 4: Redeploy

1. **Deployments** → **New Deployment**

---

### Opción 3: Mover Dockerfile a la Raíz (No Recomendada)

Solo si las anteriores fallan, puedes crear un Dockerfile específico en la raíz:

1. Mantén el servicio sin Root Directory
2. Crea un nuevo Dockerfile en la raíz del proyecto
3. Este Dockerfile debe hacer COPY desde frontend/pos-cesariel

---

## 🔍 Checklist de Verificación

Antes de redeploy, verifica:

- [ ] Root Directory: `frontend/pos-cesariel` (exacto)
- [ ] Dockerfile Path: `Dockerfile.production` (exacto)
- [ ] Builder: `DOCKERFILE`
- [ ] Variables de entorno configuradas (ver `railway-env-vars.txt`)
- [ ] Branch correcto seleccionado (main)

## 📸 Screenshots de Configuración Correcta

### Settings → Source
```
Repository: tu-usuario/pos-cesariel
Branch: main
Root Directory: frontend/pos-cesariel
```

### Settings → Build
```
Builder: DOCKERFILE
Dockerfile Path: Dockerfile.production
Build Command: (vacío)
Install Command: (vacío)
```

### Settings → Deploy
```
Start Command: (vacío - se usa el CMD del Dockerfile)
```

---

## 🧪 Test Local del Dockerfile

Para verificar que el Dockerfile funciona localmente:

```bash
# Desde la raíz del proyecto
cd frontend/pos-cesariel

# Build local
docker build -f Dockerfile.production -t test-frontend .

# Si funciona localmente, funcionará en Railway
```

---

## 🐛 Troubleshooting

### Error: "Root directory not found"
- Verifica que hiciste push del código a GitHub
- Confirma que la carpeta `frontend/pos-cesariel` existe en tu repo

### Error: "Dockerfile parse error"
- Hay un problema con el contenido del Dockerfile
- Revisa los logs del build para más detalles

### Build se queda colgado
- Cancela el deployment
- Limpia el caché: Settings → Clear Build Cache
- Intenta de nuevo

### Variables de entorno no se aplican
- Asegúrate de guardar las variables
- Haz un nuevo deployment después de cambiar variables
- Las variables con `NEXT_PUBLIC_` deben estar en build time

---

## 💡 Configuración Final Correcta

Una vez que funcione, tu servicio debe verse así:

**Frontend POS Service**
```
Name: frontend-pos
Root Directory: frontend/pos-cesariel
Dockerfile: Dockerfile.production
Status: Active ✅
Domain: https://frontend-pos-xxx.up.railway.app
```

**Variables:**
```env
NEXT_PUBLIC_API_URL=https://<backend-domain>
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## 📞 Si Sigue Sin Funcionar

1. **Revisar logs del build**:
   - Click en el deployment fallido
   - Lee los logs completos
   - Busca el error específico

2. **Probar Nixpacks** (Opción 2)
   - Es más simple para Next.js
   - Railway lo detecta automáticamente

3. **Verificar en GitHub**:
   - Confirma que `frontend/pos-cesariel/Dockerfile.production` existe
   - Ve a tu repo en GitHub
   - Navega a: `frontend/pos-cesariel/Dockerfile.production`

4. **Contacto**:
   - Railway Discord: https://discord.gg/railway
   - Comparte los logs del error

---

## ✅ Verificación Post-Fix

Cuando el deployment sea exitoso:

```bash
# Verificar que el frontend está vivo
curl https://<tu-frontend-domain>

# Debería retornar HTML de Next.js
```

Accede en el navegador:
- URL: `https://<tu-frontend-domain>`
- Deberías ver la pantalla de login

---

**Última actualización**: Diciembre 2024
