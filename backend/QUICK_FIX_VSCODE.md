# ⚡ Quick Fix: VS Code Errores Python

## 🎯 Solución Rápida (2 minutos)

### Paso 1: Instalar Extensiones
1. Abre VS Code
2. Presiona `Cmd+Shift+P` (Mac) o `Ctrl+Shift+P` (Windows/Linux)
3. Busca: **"Extensions: Show Recommended Extensions"**
4. Instala estas 3 extensiones:
   - ✅ **Python** (ms-python.python)
   - ✅ **Pylance** (ms-python.vscode-pylance) ← **IMPORTANTE**
   - ✅ **Pylint** (ms-python.pylint)

### Paso 2: Seleccionar Intérprete
1. Presiona `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Busca: **"Python: Select Interpreter"**
3. Selecciona **cualquier Python 3.9+** que aparezca

### Paso 3: Recargar VS Code
1. Presiona `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Busca: **"Developer: Reload Window"**
3. Espera 15 segundos mientras Pylance indexa

## ✅ Verificación

Abre `backend/app/models/user.py`:
- ✅ No hay líneas rojas en `from sqlalchemy import Column`
- ✅ No hay líneas rojas en `from database import Base`
- ✅ Autocompletado funciona

## 🐳 Nota Importante sobre Docker

Este proyecto usa **Docker** para ejecutar el código. Los errores que ves en VS Code son **solo visuales** - el código funciona perfectamente en Docker.

Si después de seguir estos pasos todavía ves algunos errores rojos pero el comando `make dev` funciona bien, **puedes ignorar esos errores**. Son falsos positivos de VS Code.

## 🔧 Si No Funciona

Ver documentación completa: `backend/VSCODE_SETUP.md`

O ejecuta el script de configuración:
```bash
cd backend
./setup_vscode.sh
```

Luego selecciona el intérprete de `.venv` en VS Code.
