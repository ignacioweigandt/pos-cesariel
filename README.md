# POS Cesariel - Sistema de Punto de Venta Multisucursal

Un sistema completo de punto de venta con e-commerce integrado, diseñado para empresas que manejan múltiples sucursales y necesitan sincronización de inventario en tiempo real.

## 🏗️ Arquitectura

- **Frontend**: Next.js 15 con React 19, TailwindCSS y TypeScript
- **Backend**: FastAPI con Python 3.9+, SQLAlchemy y PostgreSQL
- **Base de datos**: PostgreSQL 15
- **Contenedores**: Docker y Docker Compose para desarrollo y despliegue

## ✨ Características Principales

### 🏪 Sistema Multisucursal
- Gestión de múltiples sucursales desde una sola plataforma
- Control de usuarios y permisos por sucursal
- Reportes consolidados y por sucursal

### 📦 Inventario Centralizado
- Stock compartido entre POS físico y e-commerce
- Actualizaciones de inventario en tiempo real
- Alertas de stock bajo
- Gestión de productos con códigos de barras
- Seguimiento de movimientos de inventario

### 💰 Sistema de Ventas Unificado
- POS para ventas en tienda física
- E-commerce integrado con el mismo inventario
- Procesamiento de pagos (efectivo, tarjeta)
- Generación automática de números de venta
- Estados de pedidos para e-commerce

### 👥 Gestión de Usuarios
- Sistema de roles: Admin, Gerente, Vendedor, E-commerce
- Autenticación JWT segura
- Permisos granulares por módulo

### 📊 Reportes y Analytics
- Dashboard con métricas en tiempo real
- Reportes de ventas por período
- Productos más vendidos
- Análisis por sucursal

### 🛒 E-commerce Integrado
- Tienda online con productos del inventario
- Sincronización automática de stock
- Gestión de pedidos online
- Configuración de tienda centralizada

## 🚀 Instalación Rápida

### Prerequisitos
- Docker Desktop instalado
- Git

### Configuración Automática

```bash
# Clonar el repositorio
git clone <repository-url>
cd pos-cesariel

# Ejecutar script de configuración automática
./setup.sh
```

El script automático:
1. Construye todos los contenedores
2. Instala dependencias
3. Inicializa la base de datos
4. Carga datos de prueba
5. Inicia todos los servicios

### Configuración Manual

```bash
# Iniciar todos los servicios
make dev

# En otra terminal, inicializar datos de prueba
make shell-backend
python init_data.py
exit
```

## 🌐 Acceso al Sistema

Una vez iniciado el sistema, puedes acceder a:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Base de datos (Adminer)**: http://localhost:8080

## 🔑 Usuarios de Prueba

El sistema incluye usuarios predefinidos para testing:

| Usuario | Contraseña | Rol | Permisos |
|---------|------------|-----|----------|
| admin | admin123 | Admin | Acceso completo al sistema |
| manager | manager123 | Gerente | Gestión de sucursal, inventario, reportes |
| seller | seller123 | Vendedor | Solo módulo POS-Ventas |

## 📋 Módulos del Sistema

### 1. Dashboard
- Resumen de ventas del día y mes
- Estadísticas de productos e inventario
- Alertas de stock bajo
- Acciones rápidas

### 2. POS-Ventas
- Búsqueda rápida de productos
- Carrito de compras interactivo
- Procesamiento de ventas
- Múltiples métodos de pago
- Información de cliente opcional

### 3. Inventario
- Gestión completa de productos
- Categorías organizadas
- Control de stock en tiempo real
- Ajustes manuales de inventario
- Historial de movimientos

### 4. Reportes
- Dashboard con métricas clave
- Reportes de ventas personalizables
- Productos más vendidos
- Análisis por sucursal (admin)

### 5. E-commerce
- Gestión de productos online
- Configuración de tienda
- Administración de pedidos
- Sincronización automática con POS

### 6. Usuarios
- Gestión de cuentas de usuario
- Asignación de roles y permisos
- Control por sucursal

### 7. Documentación
- Manuales de usuario
- Guías de uso del sistema
- API documentation

## 🛠️ Comandos de Desarrollo

```bash
# Ver todos los comandos disponibles
make help

# Desarrollo
make dev              # Iniciar entorno de desarrollo
make logs             # Ver logs de todos los servicios
make logs-frontend    # Ver logs del frontend
make logs-backend     # Ver logs del backend
make logs-db          # Ver logs de la base de datos

# Gestión de contenedores
make down             # Detener todos los servicios
make restart          # Reiniciar todos los servicios
make clean            # Limpiar contenedores y volúmenes

# Acceso a contenedores
make shell-frontend   # Acceso al contenedor frontend
make shell-backend    # Acceso al contenedor backend
make shell-db         # Acceso a PostgreSQL
```

## 🔧 Configuración

### Variables de Entorno

#### Backend
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `SECRET_KEY`: Clave secreta para JWT
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Configuración de base de datos

#### Frontend
- `NEXT_PUBLIC_API_URL`: URL del backend API

### Base de Datos

El sistema usa PostgreSQL con las siguientes configuraciones por defecto:
- Host: localhost
- Puerto: 5432
- Base de datos: pos_cesariel
- Usuario: postgres
- Contraseña: password

## 📊 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/login-json` - Login con JSON

### Productos
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `GET /products/search` - Buscar productos
- `GET /products/barcode/{barcode}` - Buscar por código de barras

### Ventas
- `GET /sales` - Listar ventas
- `POST /sales` - Crear venta
- `GET /sales/reports/dashboard` - Estadísticas dashboard

### Sucursales
- `GET /branches` - Listar sucursales
- `POST /branches` - Crear sucursal

### Usuarios
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `GET /users/me` - Usuario actual

Ver documentación completa en: http://localhost:8000/docs

## 🔄 Sincronización en Tiempo Real

El sistema maneja la sincronización de inventario mediante:

1. **Transacciones atómicas**: Todas las operaciones de venta son transaccionales
2. **Movimientos de inventario**: Cada cambio de stock se registra
3. **Validación de stock**: Verificación antes de cada venta
4. **Actualizaciones inmediatas**: Los cambios se reflejan instantáneamente

### Flujo de Venta
1. Usuario busca productos en POS
2. Agrega productos al carrito (validación de stock)
3. Procesa la venta
4. Se actualiza automáticamente el inventario
5. Se registra el movimiento
6. Stock actualizado disponible para e-commerce

## 🧪 Testing

Actualmente no hay framework de testing configurado. Para implementar tests:

1. Verificar si se agrega algún framework a `package.json` o `requirements.txt`
2. Consultar con el usuario sobre el enfoque de testing preferido

## 🐛 Troubleshooting

### Problemas Comunes

**Error de conexión a la base de datos**
```bash
make logs-db  # Verificar logs de PostgreSQL
make shell-db # Acceder directamente a la base de datos
```

**Frontend no carga**
```bash
make logs-frontend  # Ver errores de Next.js
make shell-frontend # Verificar dependencias
npm install         # Reinstalar dependencias
```

**Backend no responde**
```bash
make logs-backend   # Ver errores de FastAPI
make shell-backend  # Acceder al contenedor
pip install -r requirements.txt  # Reinstalar dependencias
```

**Reiniciar completamente**
```bash
make clean  # Limpiar todo
make dev    # Iniciar de nuevo
```

## 🚢 Despliegue en Producción

Para desplegar en producción:

1. Configurar variables de entorno de producción
2. Usar PostgreSQL externa (no Docker)
3. Configurar HTTPS y dominio
4. Implementar backups automáticos
5. Configurar monitoreo y logs

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte o preguntas:
- Crear un issue en GitHub
- Consultar la documentación en `/documentation`
- Revisar los logs del sistema con `make logs`

---

**POS Cesariel** - Sistema completo de punto de venta multisucursal con e-commerce integrado 🛍️