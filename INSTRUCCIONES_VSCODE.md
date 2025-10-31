# ✅ VS Code Configurado - Instrucciones Finales

## 🎉 ¡El entorno Python ya está listo!

He instalado Python 3.13 con todas las dependencias en `.venv` dentro del backend.

## 📝 Pasos para activar en VS Code:

### 1. Cerrar VS Code Completamente
- Cierra todas las ventanas de VS Code
- Asegúrate de que no haya ninguna instancia corriendo

### 2. Reabrir el Proyecto
```bash
cd /Users/ignacioweigandt/Documentos/Tesis/pos-cesariel
code .
```

### 3. VS Code te va a preguntar si quieres instalar las extensiones recomendadas
- **Haz click en "Install All"** o "Instalar Todo"
- Espera a que se instalen:
  - Python
  - Pylance (muy importante!)
  - Pylint
  - Black Formatter

### 4. Seleccionar el Intérprete (IMPORTANTE)
1. Presiona `Cmd+Shift+P` (abre la paleta de comandos)
2. Escribe: **"Python: Select Interpreter"**
3. En la lista que aparece, busca y selecciona:
   ```
   Python 3.13.7 64-bit ('.venv': venv)
   ./backend/.venv/bin/python
   ```
4. Si NO aparece en la lista:
   - Selecciona "Enter interpreter path..."
   - Pega esta ruta: `/Users/ignacioweigandt/Documentos/Tesis/pos-cesariel/backend/.venv/bin/python`

### 5. Recargar VS Code
1. Presiona `Cmd+Shift+P`
2. Escribe: **"Developer: Reload Window"**
3. Presiona Enter

### 6. Esperar a que Pylance Indexe (30 segundos)
- Abajo a la derecha verás un mensaje "Python Language Server"
- Espera a que termine de cargar

## ✅ Verificación

Abre el archivo `backend/app/models/user.py` y verifica:
- ✅ No hay líneas rojas en los imports
- ✅ Al hacer `Cmd+Click` en un import, te lleva a la definición
- ✅ Autocompletado funciona cuando escribes código

## 🐛 Si sigue sin funcionar

### Verificar el intérprete seleccionado:
Mira en la **barra inferior de VS Code** (abajo a la derecha). Debe decir:
```
Python 3.13.7 64-bit ('.venv': venv)
```

Si dice otra cosa o no aparece nada, repite el paso 4.

### Forzar recarga de Pylance:
1. `Cmd+Shift+P`
2. Busca: **"Python: Clear Cache and Reload Window"**
3. Enter

### Verificar que las extensiones estén instaladas:
1. Ve a la pestaña de Extensiones (icono de cuadrados)
2. Busca "Python"
3. Verifica que estén instaladas:
   - ✅ Python (Microsoft)
   - ✅ Pylance (Microsoft)
   - ✅ Pylint (Microsoft)

## 📦 Lo que se instaló

- **Entorno virtual**: `backend/.venv`
- **Python**: 3.13.7
- **Dependencias**: FastAPI, SQLAlchemy, Pydantic, etc. (todas las de requirements.txt)
- **Dev tools**: Pylint, Black, isort

## 💡 Notas Importantes

- El entorno virtual (`.venv`) solo se usa para que VS Code no muestre errores
- El código real se ejecuta en Docker (no cambia nada del flujo de desarrollo)
- Si actualizas `requirements.txt`, ejecuta:
  ```bash
  cd backend
  source .venv/bin/activate
  pip install -r requirements.txt
  ```

## 🚀 Listo!

Una vez completados estos pasos, no deberías ver más errores rojos en el código Python.

Si sigues teniendo problemas, mándame un screenshot de:
1. La barra inferior de VS Code (donde dice el intérprete)
2. Los errores que ves en un archivo Python
