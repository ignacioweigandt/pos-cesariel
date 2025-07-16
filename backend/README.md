# Backend POS Cesariel

API backend para el sistema de punto de venta desarrollado con FastAPI.

## Requisitos

- Python 3.9+
- pip

## Instalación

1. Crear y activar el entorno virtual:
```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar las dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar las variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

## Ejecución

### Modo desarrollo
```bash
# Activar el entorno virtual
source venv/bin/activate

# Ejecutar el servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Modo producción
```bash
# Activar el entorno virtual
source venv/bin/activate

# Ejecutar el servidor
python main.py
```

## Endpoints

- `GET /` - Mensaje de bienvenida
- `GET /health` - Health check
- `GET /docs` - Documentación automática de la API (Swagger UI)
- `GET /redoc` - Documentación alternativa (ReDoc)

## Estructura del proyecto

```
backend/
├── main.py              # Aplicación principal
├── requirements.txt     # Dependencias
├── .env                 # Variables de entorno
├── .gitignore          # Archivos a ignorar en Git
├── README.md           # Este archivo
└── venv/               # Entorno virtual
```

## Desarrollo

Para agregar nuevos endpoints, edita el archivo `main.py` o crea nuevos módulos en la estructura del proyecto.

## Acceso a la documentación

Una vez que el servidor esté ejecutándose, puedes acceder a:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
