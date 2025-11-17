# 🧪 GUÍA DE PRUEBA INMEDIATA - Sistema de Cierre Automático

## ✅ Sistema Configurado para Testing

- **Timeout**: 1 minuto (en lugar de 4 horas)
- **Servicios**: Todos corriendo
- **Frontend**: Reiniciado y listo

---

## 🎯 TEST 1: Cierre Automático por Inactividad (1 minuto)

### Pasos a Seguir:

1. **Abrir el navegador en**:
   ```
   http://localhost:3000
   ```

2. **Hacer login con**:
   - **Usuario**: `admin`
   - **Password**: `admin123`

3. **Llegarás al Dashboard**:
   - ✅ Deberías ver la página principal del POS

4. **⏰ IMPORTANTE - NO TOQUES NADA durante 1 minuto**:
   - ❌ NO muevas el mouse
   - ❌ NO toques el teclado
   - ❌ NO hagas scroll
   - ❌ NO hagas click
   - ⏳ Solo espera y observa...

5. **Después de ~60 segundos**:
   - ✅ Deberías ver que automáticamente te redirige al login
   - ✅ Deberías ver un **banner AMARILLO** en la parte superior
   - ✅ El mensaje debe decir: "⏰ Tu sesión se cerró automáticamente por inactividad..."

### ✅ Resultado Esperado:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️  Tu sesión se cerró automáticamente por inactividad.    │
│      Por seguridad, las sesiones se cierran después de      │
│      4 horas (duración de un turno de trabajo). Por         │
│      favor, inicia sesión nuevamente.                   [X] │
└──────────────────────────────────────────────────────────────┘
```

**¿Lo viste?** Si el banner amarillo apareció, ¡FUNCIONA! ✅

---

## 🎯 TEST 2: Timer se Resetea con Actividad

### Pasos a Seguir:

1. **Hacer login nuevamente**:
   - Usuario: `admin` / Password: `admin123`

2. **Esperar 40 segundos** sin hacer nada

3. **🖱️ Mover el mouse** (esto resetea el timer)

4. **Esperar otros 40 segundos**

5. **🖱️ Mover el mouse otra vez**

6. **Esperar otros 40 segundos**

### ✅ Resultado Esperado:

- ✅ **NO debería cerrar sesión**
- ✅ Puedes seguir trabajando indefinidamente si sigues activo
- ✅ Cada movimiento resetea el timer a 1 minuto completo

**¿Puedes trabajar sin que se cierre?** ¡FUNCIONA! ✅

---

## 🎯 TEST 3: Logout Manual (Mensaje Azul)

### Pasos a Seguir:

1. **Hacer login**: `admin` / `admin123`

2. **Click en el botón de logout** (esquina superior derecha):
   - Es el ícono de flecha saliendo ➡️🚪

3. **Observar el mensaje**

### ✅ Resultado Esperado:

```
┌──────────────────────────────────────────────────────────────┐
│  ℹ️  👋 Has cerrado sesión correctamente.              [X]  │
└──────────────────────────────────────────────────────────────┘
```

- ✅ Banner **AZUL** (no amarillo)
- ✅ Mensaje amigable de despedida
- ✅ Tono positivo

**¿Viste el mensaje azul?** ¡FUNCIONA! ✅

---

## 🎯 TEST 4: Cerrar el Mensaje

### Pasos a Seguir:

1. **Estar en login con cualquier mensaje visible**

2. **Click en la "X"** en la esquina derecha del banner

### ✅ Resultado Esperado:

- ✅ El mensaje desaparece inmediatamente
- ✅ Puedes hacer login normalmente

**¿Se cerró el mensaje?** ¡FUNCIONA! ✅

---

## 🎯 TEST 5: Token Expirado (Avanzado)

### Pasos a Seguir:

1. **Hacer login**: `admin` / `admin123`

2. **Abrir DevTools del navegador**:
   - Windows/Linux: `F12`
   - Mac: `Cmd + Option + I`

3. **Ir a la pestaña "Application"** (o "Almacenamiento")

4. **En el panel izquierdo**:
   - Expandir "Local Storage"
   - Click en `http://localhost:3000`

5. **Buscar la clave "token"**

6. **Doble click en el valor del token** y modificarlo:
   - Agregar letras al final: `...abc123INVALIDO`

7. **Navegar a cualquier página**:
   - Click en "Inventario" o "Reportes"

### ✅ Resultado Esperado:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️  🔒 Tu sesión ha expirado. Por favor, inicia sesión    │
│      nuevamente.                                        [X] │
└──────────────────────────────────────────────────────────────┘
```

- ✅ Redirección automática al login
- ✅ Banner amarillo
- ✅ Mensaje de expiración
- ✅ Token limpiado

**¿Viste el mensaje de expiración?** ¡FUNCIONA! ✅

---

## 📊 Checklist de Pruebas

### Funcionalidad Core
- [ ] ✅ Cierre automático después de 1 minuto
- [ ] ✅ Mensaje amarillo de inactividad visible
- [ ] ✅ Redirección automática al login

### Reseteo de Timer
- [ ] ✅ Mover mouse resetea timer
- [ ] ✅ Puedo trabajar indefinidamente con actividad
- [ ] ✅ NO se cierra si sigo activo

### Mensajes
- [ ] ✅ Mensaje de inactividad (amarillo)
- [ ] ✅ Mensaje de logout manual (azul)
- [ ] ✅ Mensaje de token expirado (amarillo)
- [ ] ✅ Botón X cierra el mensaje

### UI/UX
- [ ] ✅ Mensajes claros y fáciles de entender
- [ ] ✅ Colores apropiados (amarillo warning, azul info)
- [ ] ✅ Diseño profesional

---

## 🐛 Problemas Comunes

### "No veo el mensaje después de 1 minuto"

**Solución**:
1. Verifica que el frontend se haya reiniciado
2. Limpia caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
3. Abre en modo incógnito
4. Verifica en console del navegador si hay errores

### "El mensaje no dice 1 minuto, dice 4 horas"

**Respuesta**:
- ✅ Esto es CORRECTO
- El mensaje siempre dice "4 horas" porque esa es la configuración de producción
- Para testing usamos 1 minuto, pero el mensaje no cambia (no queremos confundir al usuario final)

### "Se cerró antes de 1 minuto"

**Posibles causas**:
- Alguna extensión del navegador está generando actividad
- Ads o scripts en background
- Prueba en modo incógnito

### "No se cierra después de 1 minuto"

**Posibles causas**:
- Estás moviendo el mouse sin darte cuenta
- El timer se está reseteando por actividad involuntaria
- Verifica que el frontend se haya reiniciado correctamente

---

## 🎥 Video de Demostración (Opcional)

Si quieres grabar el test:

1. **Abrir grabador de pantalla**
2. **Iniciar grabación**
3. **Hacer login**
4. **Poner las manos lejos del teclado/mouse**
5. **Esperar 1 minuto**
6. **Mostrar el mensaje que aparece**

---

## 🔧 Debugging

### Ver logs en tiempo real:

```bash
# En otra terminal
cd /Users/ignacioweigandt/Documentos/Tesis/pos-cesariel
docker-compose logs -f frontend
```

### Verificar estado del store en el navegador:

Abre Console del navegador y ejecuta:

```javascript
JSON.parse(localStorage.getItem('auth-storage'))
```

Deberías ver:
```json
{
  "state": {
    "logoutReason": "inactivity",  // o "manual", "expired"
    "isAuthenticated": false
  }
}
```

---

## ⏰ Cronometraje

Para verificar timing exacto:

1. **Iniciar cronómetro en tu celular**
2. **Hacer login**
3. **Iniciar cronómetro**
4. **Esperar sin tocar nada**
5. **Cuando se cierre, detener cronómetro**

Debería ser aproximadamente **60 segundos** (±2 segundos)

---

## ✅ ¿Todo Funcionó?

Si los 4 tests principales pasaron:
- ✅ Cierre automático (1 minuto)
- ✅ Reseteo con actividad
- ✅ Mensaje de logout manual
- ✅ Cerrar mensaje

**¡El sistema está funcionando perfectamente!** 🎉

---

## 🔄 Restaurar a Producción

**IMPORTANTE**: Cuando termines de probar, restaura el timeout a 4 horas:

Ver el archivo: `frontend/pos-cesariel/shared/hooks/useSessionTimeout.ts`

Cambiar línea 16:
```typescript
// De:
const SESSION_TIMEOUT = 60 * 1000; // TESTING

// A:
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // PRODUCCIÓN
```

Y reiniciar frontend:
```bash
docker-compose restart frontend
```

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona como esperado:
1. Revisa la sección "Problemas Comunes" arriba
2. Verifica los logs del frontend
3. Limpia caché del navegador
4. Prueba en modo incógnito

---

**¡Buena suerte con las pruebas!** 🚀

**Configuración actual**: Timeout de 1 minuto para testing
**URL**: http://localhost:3000
**Login**: admin / admin123
