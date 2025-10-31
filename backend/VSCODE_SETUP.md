# VS Code Setup for Backend Development

Este documento explica cómo configurar VS Code para desarrollo del backend FastAPI sin errores de importación.

## 🔧 Problema

VS Code muestra errores en el código Python del backend (líneas rojas), especialmente en imports como:
```python
from app.models import User
from app.schemas import UserCreate
```

## ✅ Solución

Ya se han creado los archivos de configuración necesarios. Solo necesitas seguir estos pasos:

### 1. Instalar Extensiones Recomendadas

Cuando abras el proyecto en VS Code, te preguntará si quieres instalar las extensiones recomendadas. **Acepta instalar todas**.

O instálalas manualmente:
- **Python** (ms-python.python)
- **Pylance** (ms-python.vscode-pylance) - *Importante para resolución de imports*
- **Pylint** (ms-python.pylint)
- **Black Formatter** (ms-python.black-formatter)

### 2. Seleccionar el Intérprete de Python

**Opción A: Si usas Docker (recomendado)**
1. Presiona `Cmd+Shift+P` (Mac) o `Ctrl+Shift+P` (Windows/Linux)
2. Busca: "Python: Select Interpreter"
3. Selecciona cualquier Python 3.9+
4. Los errores desaparecerán porque el código se ejecuta en Docker

**Opción B: Si quieres usar Python local**
1. Crea un entorno virtual en el backend:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate  # Mac/Linux
   # o
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```
2. En VS Code, presiona `Cmd+Shift+P` / `Ctrl+Shift+P`
3. Busca: "Python: Select Interpreter"
4. Selecciona el intérprete de `.venv`

### 3. Reiniciar VS Code

Después de instalar las extensiones:
1. Cierra VS Code completamente
2. Vuelve a abrirlo
3. Abre cualquier archivo Python del backend
4. Espera 10-15 segundos mientras Pylance indexa el proyecto

### 4. Verificar que Funciona

Abre `backend/app/models/user.py`. No debería tener errores rojos.

## 📁 Archivos de Configuración Creados

- **`.vscode/settings.json`** - Configuración de Python para el workspace
- **`backend/pyrightconfig.json`** - Configuración de análisis de tipos
- **`backend/.pylintrc`** - Configuración de linting (desactiva warnings molestos)
- **`.vscode/extensions.json`** - Extensiones recomendadas

## 🔍 Configuración Aplicada

### Rutas de Import Extra
```json
"python.analysis.extraPaths": [
  "${workspaceFolder}/backend",
  "${workspaceFolder}/backend/app"
]
```

Esto permite que VS Code entienda imports como `from app.models import User`.

### Linting Desactivado para Falsos Positivos
Se desactivaron warnings comunes de Pylint que causan problemas con FastAPI/SQLAlchemy:
- `E1101` - no-member (SQLAlchemy)
- `E0401` - import-error
- `C0111` - missing-docstring
- `R0903` - too-few-public-methods

### Type Checking Mode
```json
"python.analysis.typeCheckingMode": "basic"
```

Modo básico que no es demasiado estricto pero ayuda a detectar errores.

## 🐛 Si Sigues Viendo Errores

### Error: "Import could not be resolved"
1. Verifica que Pylance esté instalado (extensión activa)
2. Recarga la ventana: `Cmd+Shift+P` → "Developer: Reload Window"
3. Verifica que el intérprete esté seleccionado correctamente

### Error: "No module named 'app'"
Asegúrate de que el intérprete apunte a:
- Docker (recomendado) - cualquier Python 3.9+ funciona
- O `.venv` local con todas las dependencias instaladas

### Pylance no funciona
1. Desinstala Pylance
2. Cierra VS Code
3. Reinstala Pylance
4. Reinicia VS Code

### Último recurso
```bash
# En VS Code:
Cmd+Shift+P → "Python: Clear Cache and Reload Window"
```

## 📝 Notas

- **Docker vs Local**: Si usas Docker (como en este proyecto), los errores de VS Code son solo visuales. El código funciona perfectamente en Docker.
- **Performance**: La primera vez que abras el proyecto, Pylance tardará ~30 segundos en indexar todo.
- **Auto-format**: El código se formatea automáticamente al guardar (Black formatter).

## ✅ Verificación Final

Si todo está bien configurado:
- ✅ No hay errores rojos en `backend/app/models/`
- ✅ Autocompletado funciona al escribir `from app.`
- ✅ Puedes hacer Cmd+Click en imports para ir a la definición
- ✅ El código se formatea automáticamente al guardar

Si sigue habiendo errores visuales pero el backend funciona en Docker, **ignóralos** - es un problema menor de VS Code que no afecta el desarrollo.
