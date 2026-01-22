# 📁 Estructura Completa del Backend - POS Cesariel

## 🎯 Visión General

El backend es una API REST construida con **FastAPI 0.115.14** + **PostgreSQL 15**, organizada en capas siguiendo el patrón de **Clean Architecture** con separación de responsabilidades.

**Total de archivos: 142** (excluyendo `__pycache__`, `.venv`, `.pytest_cache`)

---

## 📂 Estructura de Directorios

```
backend/
├── 📄 Archivos de Configuración Raíz (17 archivos)
├── 📁 app/                     # Aplicación principal (Clean Architecture)
│   ├── 📁 api/                 # Endpoints API versionados
│   ├── 📁 core/                # Configuración core del sistema
│   ├── 📁 models/              # Modelos SQLAlchemy (ORM)
│   ├── 📁 repositories/        # Capa de acceso a datos (DAL)
│   ├── 📁 schemas/             # Esquemas Pydantic (DTOs)
│   └── 📁 services/            # Lógica de negocio
├── 📁 config/                  # Configuraciones del sistema
├── 📁 exceptions/              # Excepciones personalizadas
├── 📁 routers/                 # Rutas FastAPI (Controllers)
├── 📁 services/                # Servicios auxiliares (legacy)
├── 📁 tests/                   # Tests unitarios e integración
└── 📁 utils/                   # Utilidades y helpers
```

---

## 📄 ARCHIVOS DE CONFIGURACIÓN RAÍZ (17 archivos)

### **Archivos de Entorno**

#### `.env`
- **Ubicación**: `backend/.env`
- **Qué hace**: Contiene variables de entorno PRIVADAS para desarrollo local
- **Contenido típico**:
  - `DATABASE_URL`: Conexión a PostgreSQL
  - `SECRET_KEY`: Clave secreta para JWT
  - `CLOUDINARY_*`: Credenciales de Cloudinary
- **⚠️ NUNCA** subir a Git (está en `.gitignore`)

#### `.env.example`
- **Ubicación**: `backend/.env.example`
- **Qué hace**: Template de ejemplo de las variables de entorno necesarias
- **Uso**: Los desarrolladores copian este archivo a `.env` y llenan sus valores
- **Contenido**: Mismas claves que `.env` pero con valores de ejemplo

---

### **Archivos de Linting y Formateo**

#### `.pylintrc`
- **Ubicación**: `backend/.pylintrc`
- **Qué hace**: Configuración de **Pylint** (linter de código Python)
- **Función**: Define reglas de calidad de código, estándares, y qué errores ignorar
- **Uso**: `pylint app/ routers/` para verificar código

---

### **Docker**

#### `Dockerfile`
- **Ubicación**: `backend/Dockerfile`
- **Qué hace**: Instrucciones para construir la imagen Docker del backend
- **Función**:
  - Instala Python 3.9+
  - Copia `requirements.txt` e instala dependencias
  - Expone puerto 8000
  - Comando de inicio: `uvicorn main:app --host 0.0.0.0 --port 8000`

---

### **Archivos de Autenticación**

#### `auth.py`
- **Ubicación**: `backend/auth.py`
- **Qué hace**: Sistema de autenticación JWT principal
- **Funciones clave**:
  - `create_access_token()`: Genera tokens JWT
  - `verify_token()`: Valida tokens
  - `get_password_hash()`: Hashea contraseñas con bcrypt
  - `verify_password()`: Verifica contraseñas
  - `get_current_user()`: Dependency para obtener usuario actual

#### `auth_compat.py`
- **Ubicación**: `backend/auth_compat.py`
- **Qué hace**: Capa de compatibilidad para auth
- **Función**: Re-exporta funciones de `auth.py` para backwards compatibility
- **Uso**: Permite `from auth_compat import get_current_user` (legacy)

---

### **Archivos de Integración Externa**

#### `cloudinary_config.py`
- **Ubicación**: `backend/cloudinary_config.py`
- **Qué hace**: Configuración de **Cloudinary** para almacenamiento de imágenes
- **Función**:
  - Inicializa cliente Cloudinary
  - Sube imágenes de productos, banners, logos
  - Gestiona transformaciones de imágenes
- **Uso**: Importado por routers que manejan uploads

---

### **Base de Datos**

#### `database.py`
- **Ubicación**: `backend/database.py`
- **Qué hace**: Configuración de SQLAlchemy y conexión a PostgreSQL
- **Componentes**:
  - `engine`: Motor de SQLAlchemy
  - `SessionLocal`: Factory de sesiones de DB
  - `Base`: Clase base para todos los modelos
  - `get_db()`: Dependency que provee sesión de DB
- **Uso**: Importado por TODOS los routers y servicios

---

### **Punto de Entrada Principal**

#### `main.py`
- **Ubicación**: `backend/main.py`
- **Qué hace**: **Archivo principal de FastAPI** - Punto de entrada de la aplicación
- **Función**:
  - Inicializa app FastAPI
  - Configura CORS para frontends (POS y E-commerce)
  - Registra todos los routers
  - Configura WebSocket
  - Define endpoint de health check `/health`
  - Crea tablas en BD al startup
- **Líneas clave**:
  - Línea 93-100: Configuración CORS
  - Línea 122: WebSocket (actualmente deshabilitado)
  - Línea 150+: Registro de routers

---

### **Modelos Legacy**

#### `models.py`
- **Ubicación**: `backend/models.py`
- **Qué hace**: **Archivo legacy** - Modelos SQLAlchemy antiguos (antes de refactoring)
- **Estado**: OBSOLETO - Se mantiene por backwards compatibility
- **Reemplazo**: `app/models/` (nueva estructura modular)
- **⚠️ No usar**: Importar desde `app.models` en su lugar

#### `schemas.py`
- **Ubicación**: `backend/schemas.py`
- **Qué hace**: **Archivo legacy** - Esquemas Pydantic antiguos
- **Estado**: OBSOLETO - Se mantiene por backwards compatibility
- **Reemplazo**: `app/schemas/` (nueva estructura modular)
- **⚠️ No usar**: Importar desde `app.schemas` en su lugar

---

### **Archivos de Inicialización de Datos**

#### `init_data.py`
- **Ubicación**: `backend/init_data.py`
- **Qué hace**: Script para inicializar la BD con datos de prueba
- **Función**:
  - Crea usuarios de ejemplo (admin, manager, seller)
  - Crea sucursales, categorías, productos
  - Genera ventas de ejemplo
- **Uso**: `python init_data.py` o `docker compose exec backend python init_data.py`

#### `init_content_data.py`
- **Ubicación**: `backend/init_content_data.py`
- **Qué hace**: Inicializa datos de contenido para e-commerce
- **Función**:
  - Crea banners promocionales
  - Configura texto de bienvenida
  - Setup inicial de tienda online

#### `init_payment_configs.py`
- **Ubicación**: `backend/init_payment_configs.py`
- **Qué hace**: Inicializa configuraciones de métodos de pago
- **Función**:
  - Crea métodos de pago (Efectivo, Tarjeta, Transferencia)
  - Configura cuotas y recargos
  - Setup de surcharges por método de pago

#### `init_sportswear_data.py`
- **Ubicación**: `backend/init_sportswear_data.py`
- **Qué hace**: Inicializa datos específicos para tienda de ropa deportiva
- **Función**:
  - Crea productos de indumentaria deportiva
  - Talles (XS, S, M, L, XL, XXL)
  - Categorías de deporte

---

### **Scripts de Migración de BD**

> **Nota**: Este proyecto NO usa Alembic. Las migraciones son scripts Python manuales.

#### `migrate_add_brand.py`
- **Ubicación**: `backend/migrate_add_brand.py`
- **Qué hace**: Agrega columna `brand_id` a tabla `products`
- **Cuándo usar**: Si la tabla products no tiene referencia a marcas

#### `migrate_add_sales_references.py`
- **Ubicación**: `backend/migrate_add_sales_references.py`
- **Qué hace**: Agrega columnas de referencia a ventas (número de venta, cliente)
- **Función**: Actualiza schema de `sales` table

#### `migrate_audit_tables.py`
- **Ubicación**: `backend/migrate_audit_tables.py`
- **Qué hace**: Crea tablas de auditoría para rastrear cambios
- **Función**: Crea `audit_logs`, `inventory_movements`

#### `migrate_branch_config.py`
- **Ubicación**: `backend/migrate_branch_config.py`
- **Qué hace**: Crea tabla `branch_config` para configuración por sucursal
- **Función**: Permite configurar horarios, políticas por branch

#### `migrate_connect_config_tables.py`
- **Ubicación**: `backend/migrate_connect_config_tables.py`
- **Qué hace**: Conecta tablas de configuración con foreign keys
- **Función**: Establece relaciones entre config tables

#### `migrate_connect_payment_config.py`
- **Ubicación**: `backend/migrate_connect_payment_config.py`
- **Qué hace**: Conecta configuración de pagos con branches
- **Función**: Relaciona `payment_config` con `branches`

#### `migrate_create_brands_table.py`
- **Ubicación**: `backend/migrate_create_brands_table.py`
- **Qué hace**: Crea tabla `brands` (Marcas de productos)
- **Función**: Tabla para Nike, Adidas, Puma, etc.

#### `migrate_initialize_branch_stock.py`
- **Ubicación**: `backend/migrate_initialize_branch_stock.py`
- **Qué hace**: Inicializa registros en `branch_stock` para productos existentes
- **Función**: Crea registros de stock = 0 para todos los productos en todas las sucursales

#### `migrate_notifications.py`
- **Ubicación**: `backend/migrate_notifications.py`
- **Qué hace**: Crea tabla `notifications` para sistema de notificaciones
- **Función**: Tabla para notificaciones en tiempo real

#### `migrate_payment_methods.py`
- **Ubicación**: `backend/migrate_payment_methods.py`
- **Qué hace**: Crea tabla `payment_methods` (legacy, ahora es `payment_config`)
- **Función**: Tabla de métodos de pago

#### `migrate_system_config.py`
- **Ubicación**: `backend/migrate_system_config.py`
- **Qué hace**: Crea tabla `system_config` para configuración global
- **Función**: Configuraciones del sistema (moneda, idioma, etc.)

#### `migrate_tax_rates.py`
- **Ubicación**: `backend/migrate_tax_rates.py`
- **Qué hace**: Crea tabla `tax_rates` para tasas de impuestos
- **Función**: IVA, impuestos locales, etc.

---

### **Archivos de Configuración de Testing**

#### `pytest.ini`
- **Ubicación**: `backend/pytest.ini`
- **Qué hace**: Configuración de **pytest** (framework de testing)
- **Función**:
  - Define markers: `unit`, `integration`, `slow`, `auth`, `websocket`
  - Configura coverage (80% mínimo)
  - Paths de tests
- **Uso**: `pytest` para correr tests

---

### **Archivos de Configuración de Deploy**

#### `railway.json`
- **Ubicación**: `backend/railway.json`
- **Qué hace**: Configuración para deploy en **Railway.app**
- **Función**:
  - Define build command
  - Comando de start
  - Variables de entorno requeridas
  - Health check endpoint

---

### **Dependencias**

#### `requirements.txt`
- **Ubicación**: `backend/requirements.txt`
- **Qué hace**: Lista de dependencias Python del proyecto
- **Contenido**:
  - fastapi==0.115.14
  - uvicorn==0.35.0
  - sqlalchemy==2.0.36
  - pydantic==2.11.7
  - psycopg2-binary==2.9.10
  - python-jose==3.3.0
  - passlib==1.7.4
  - cloudinary==1.36.0
  - redis==5.0.1
  - pandas==2.2.3
  - pytest==7.4.3
  - (y más...)
- **Uso**: `pip install -r requirements.txt`

---

### **Archivos de Type Checking**

#### `pyrightconfig.json`
- **Ubicación**: `backend/pyrightconfig.json`
- **Qué hace**: Configuración de **Pyright** (type checker de Python)
- **Función**: Define reglas de tipado estricto para VS Code

---

### **Scripts de Testing**

#### `test_imports.py`
- **Ubicación**: `backend/test_imports.py`
- **Qué hace**: Script de prueba para verificar que todos los imports funcionan
- **Función**: Importa todos los módulos del proyecto para detectar errores

#### `test_repositories.py`
- **Ubicación**: `backend/test_repositories.py`
- **Qué hace**: Tests manuales de repositories
- **Función**: Prueba CRUD operations de repositories

---

### **Scripts de Utilidad**

#### `update_card_methods.py`
- **Ubicación**: `backend/update_card_methods.py`
- **Qué hace**: Script para actualizar métodos de pago con tarjeta
- **Función**: Migración de datos antigua

#### `update_product_brand.py`
- **Ubicación**: `backend/update_product_brand.py`
- **Qué hace**: Script para asignar marcas a productos existentes
- **Función**: Migración de datos de productos

#### `setup_vscode.sh`
- **Ubicación**: `backend/setup_vscode.sh`
- **Qué hace**: Script bash para configurar VS Code para el proyecto
- **Función**: Instala extensiones, configura linters

---

### **Scheduler**

#### `notification_scheduler.py`
- **Ubicación**: `backend/notification_scheduler.py`
- **Qué hace**: Scheduler para enviar notificaciones automáticas
- **Función**:
  - Corre tareas programadas
  - Envía alertas de stock bajo
  - Notificaciones periódicas
- **Uso**: Se ejecuta en background o como proceso separado

---

### **WebSocket Manager**

#### `websocket_manager.py`
- **Ubicación**: `backend/websocket_manager.py`
- **Qué hace**: Gestor de conexiones WebSocket para tiempo real
- **Función**:
  - Maneja conexiones WS activas
  - Broadcast de notificaciones
  - Actualiza clientes en tiempo real
- **Uso**: Importado por `routers/websockets.py`

---

## 📁 APP/ - Aplicación Principal (Clean Architecture)

### 📁 app/ (5 archivos + 6 subcarpetas)

#### `app/__init__.py`
- **Ubicación**: `backend/app/__init__.py`
- **Qué hace**: Inicializa el paquete `app`
- **Función**: Marca la carpeta como módulo Python
- **Contenido**: Vacío o imports básicos

---

### 📁 app/api/ - Versionado de API

#### `app/api/__init__.py`
- **Ubicación**: `backend/app/api/__init__.py`
- **Qué hace**: Inicializa paquete `api`
- **Función**: Estructura para versionado de API (v1, v2, etc.)

#### `app/api/v1/__init__.py`
- **Ubicación**: `backend/app/api/v1/__init__.py`
- **Qué hace**: API versión 1
- **Función**: Contenedor para endpoints de API v1

#### `app/api/v1/ecommerce/__init__.py`
- **Ubicación**: `backend/app/api/v1/ecommerce/__init__.py`
- **Qué hace**: Endpoints de e-commerce para API v1
- **Función**: Placeholder para endpoints versionados de e-commerce
- **Estado**: Actualmente no usado, los endpoints están en `routers/`

---

### 📁 app/core/ - Configuración Core

#### `app/core/__init__.py`
- **Ubicación**: `backend/app/core/__init__.py`
- **Qué hace**: Inicializa configuración core
- **Función**: Carpeta para configuraciones centrales del sistema
- **Estado**: Placeholder - configuración está en `config/settings.py`

---

### 📁 app/models/ - Modelos SQLAlchemy (ORM) - **18 archivos**

> **Los modelos definen el schema de la base de datos usando SQLAlchemy ORM**

#### `app/models/__init__.py`
- **Ubicación**: `backend/app/models/__init__.py`
- **Qué hace**: **HUB CENTRAL** de imports de modelos
- **Función**:
  - Importa TODOS los modelos del proyecto
  - Export point único: `from app.models import User, Product, Sale`
  - Lista `__all__` con todos los modelos y enums
- **Importancia**: ⭐⭐⭐ CRÍTICO - Todos los nuevos modelos DEBEN agregarse aquí

#### `app/models/README.md`
- **Ubicación**: `backend/app/models/README.md`
- **Qué hace**: Documentación de la arquitectura de modelos
- **Contenido**:
  - Guía para desarrolladores
  - Estructura de carpetas
  - Cómo importar modelos
  - Patrones de uso
  - Mejores prácticas

#### `app/models/MIGRATION_SUMMARY.md`
- **Ubicación**: `backend/app/models/MIGRATION_SUMMARY.md`
- **Qué hace**: Resumen de migración de modelos antiguos a nueva estructura
- **Contenido**:
  - Cambios de `models.py` → `app/models/`
  - Mapeo de modelos viejos → nuevos
  - Estado de migración

---

#### `app/models/base.py`
- **Ubicación**: `backend/app/models/base.py`
- **Qué hace**: Clases base y mixins para modelos
- **Contenido**:
  - `TimestampMixin`: Agrega `created_at`, `updated_at` automáticamente
  - `Base`: Clase base de SQLAlchemy
  - Helpers comunes
- **Uso**: Todos los modelos heredan de aquí

#### `app/models/enums.py`
- **Ubicación**: `backend/app/models/enums.py`
- **Qué hace**: Enumeraciones usadas por los modelos
- **Enums definidos**:
  - `UserRole`: ADMIN, MANAGER, SELLER, ECOMMERCE
  - `SaleType`: POS, ECOMMERCE
  - `OrderStatus`: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  - `MovementType`: ENTRADA, SALIDA, AJUSTE, DEVOLUCION
  - `NotificationType`: LOW_STOCK, SYSTEM, SALE, ORDER
- **Importancia**: ⭐⭐⭐ Usado en TODA la aplicación

---

#### `app/models/user.py`
- **Ubicación**: `backend/app/models/user.py`
- **Qué hace**: Modelos de **Usuarios y Sucursales**
- **Modelos**:
  - **User**: Usuarios del sistema (id, email, username, password_hash, role, branch_id)
    - Relación: `user.branch` → Branch
    - Roles: admin, manager, seller, ecommerce
  - **Branch**: Sucursales/Tiendas (id, name, address, phone, email, is_active)
    - Relación: `branch.users` → List[User]

#### `app/models/product.py`
- **Ubicación**: `backend/app/models/product.py`
- **Qué hace**: Modelos del **Catálogo de Productos**
- **Modelos**:
  - **Category**: Categorías de productos (id, name, description)
  - **Product**: Productos principales
    - Campos: name, sku, description, price, cost, barcode, category_id, brand_id
    - Flags: has_sizes, show_in_ecommerce, is_active
    - Imágenes: image_url, image_public_id
    - **Métodos importantes**:
      - `get_stock_for_branch(branch_id)`: Obtiene stock de una sucursal
      - `calculate_total_stock()`: Suma stock de todas las sucursales
      - `has_stock_in_branch(branch_id, quantity)`: Valida disponibilidad
      - `get_allowed_sizes()`: Obtiene talles disponibles
  - **ProductSize**: Talles/Variantes (id, name, product_id, branch_id)
    - Ejemplos: XS, S, M, L, XL, XXL, Única
  - **ProductImage**: Imágenes adicionales de productos

#### `app/models/brand.py`
- **Ubicación**: `backend/app/models/brand.py`
- **Qué hace**: Modelo de **Marcas de Productos**
- **Modelo**:
  - **Brand**: Marcas (id, name, description, logo_url, is_active)
    - Ejemplos: Nike, Adidas, Puma, Reebok
    - Relación: `brand.products` → List[Product]

#### `app/models/inventory.py`
- **Ubicación**: `backend/app/models/inventory.py`
- **Qué hace**: Modelos de **Gestión de Inventario**
- **Modelos**:
  - **BranchStock**: Stock por sucursal
    - Campos: branch_id, product_id, product_size_id, quantity, min_stock
    - **CRÍTICO**: Aquí se almacena el stock real
    - Relaciones: branch, product, product_size
  - **InventoryMovement**: Historial de movimientos de stock
    - Campos: movement_type (ENTRADA/SALIDA/AJUSTE), quantity, reason
    - Auditoría completa de cambios de inventario
  - **ImportLog**: Log de importaciones masivas de productos

#### `app/models/sales.py`
- **Ubicación**: `backend/app/models/sales.py`
- **Qué hace**: Modelos de **Transacciones de Venta**
- **Modelos**:
  - **Sale**: Venta/Orden
    - Campos: sale_number, sale_type (POS/ECOMMERCE), total_amount, subtotal
    - Campos cliente: customer_name, customer_email, customer_phone, customer_dni
    - Campos envío: shipping_address, shipping_cost
    - Estado: order_status (PENDING, PROCESSING, etc.)
    - Relaciones: branch, user, sale_items, payments
  - **SaleItem**: Items de una venta (línea de venta)
    - Campos: product_id, product_size_id, quantity, unit_price, total_price
    - Relaciones: sale, product, product_size
    - Descuentos: discount_amount, discount_percentage

#### `app/models/payment.py`
- **Ubicación**: `backend/app/models/payment.py`
- **Qué hace**: Modelo de **Configuración de Pagos**
- **Modelo**:
  - **PaymentConfig**: Métodos de pago y configuración de cuotas
    - Campos: payment_method (Efectivo, Tarjeta, Transferencia)
    - Cuotas: installments, surcharge_percentage
    - Flags: is_card, is_active

#### `app/models/payment_method.py`
- **Ubicación**: `backend/app/models/payment_method.py`
- **Qué hace**: Modelo **legacy** de métodos de pago
- **Estado**: DEPRECATED - Usar `PaymentConfig` en su lugar
- **Modelo**:
  - **PaymentMethod**: Método de pago (legacy)

#### `app/models/tax_rate.py`
- **Ubicación**: `backend/app/models/tax_rate.py`
- **Qué hace**: Modelo de **Tasas de Impuestos**
- **Modelo**:
  - **TaxRate**: Impuestos (IVA, etc.)
    - Campos: name, rate (porcentaje), is_active

#### `app/models/ecommerce.py`
- **Ubicación**: `backend/app/models/ecommerce.py`
- **Qué hace**: Modelos de **Configuración E-commerce**
- **Modelos**:
  - **EcommerceConfig**: Configuración de la tienda online
    - Campos: store_name, store_description, welcome_text
    - Contacto: contact_email, contact_phone, contact_whatsapp
    - SEO: meta_description, meta_keywords
    - Social: facebook_url, instagram_url, twitter_url
  - **StoreBanner**: Banners promocionales
    - Campos: title, subtitle, image_url, link_url, order, is_active
    - Display: show_on_home, show_on_category

#### `app/models/whatsapp.py`
- **Ubicación**: `backend/app/models/whatsapp.py`
- **Qué hace**: Modelos de **Integración WhatsApp Business**
- **Modelos**:
  - **WhatsAppConfig**: Configuración de WhatsApp Business
    - Campos: phone_number, api_token, business_account_id
    - Mensajes: welcome_message, catalog_message
  - **WhatsAppSale**: Ventas originadas por WhatsApp
    - Campos: sale_id, customer_phone, message_id, conversation_id
  - **SocialMediaConfig**: Links de redes sociales

#### `app/models/notification.py`
- **Ubicación**: `backend/app/models/notification.py`
- **Qué hace**: Modelo de **Sistema de Notificaciones**
- **Modelo**:
  - **Notification**: Notificaciones en tiempo real
    - Campos: title, message, notification_type, user_id, branch_id
    - Estado: is_read, read_at
    - Metadata: link_url, metadata (JSON)

#### `app/models/system_config.py`
- **Ubicación**: `backend/app/models/system_config.py`
- **Qué hace**: Modelo de **Configuración Global del Sistema**
- **Modelo**:
  - **SystemConfig**: Configuraciones del sistema
    - Campos: currency, language, timezone, date_format
    - Business: company_name, company_logo, company_address
    - Tickets: receipt_header, receipt_footer

#### `app/models/branch_config.py`
- **Ubicación**: `backend/app/models/branch_config.py`
- **Qué hace**: Modelo de **Configuración por Sucursal**
- **Modelo**:
  - **BranchConfig**: Configuración específica de cada branch
    - Campos: branch_id, opening_time, closing_time
    - Flags: allows_sales, allows_inventory_management

#### `app/models/audit.py`
- **Ubicación**: `backend/app/models/audit.py`
- **Qué hace**: Modelo de **Auditoría de Cambios**
- **Modelo**:
  - **AuditLog**: Log de todas las operaciones importantes
    - Campos: user_id, action, table_name, record_id
    - Data: old_values (JSON), new_values (JSON)
    - Timestamp: created_at

---

### 📁 app/repositories/ - Capa de Acceso a Datos (DAL) - **10 archivos**

> **Los repositories encapsulan TODAS las operaciones de base de datos**

#### `app/repositories/__init__.py`
- **Ubicación**: `backend/app/repositories/__init__.py`
- **Qué hace**: Inicializa paquete repositories
- **Función**: Export point de todos los repositories

#### `app/repositories/base.py`
- **Ubicación**: `backend/app/repositories/base.py`
- **Qué hace**: **Repository Base con CRUD genérico**
- **Clase**: `BaseRepository[ModelType]`
- **Métodos**:
  - `get(id)`: Obtener por ID
  - `get_multi(skip, limit)`: Listar con paginación
  - `create(obj_in)`: Crear registro
  - `update(db_obj, obj_in)`: Actualizar registro
  - `delete(id)`: Eliminar registro
- **Importancia**: ⭐⭐⭐ Todos los repositories heredan de aquí

#### `app/repositories/user.py`
- **Ubicación**: `backend/app/repositories/user.py`
- **Qué hace**: Repository para operaciones de **Usuarios y Branches**
- **Classes**:
  - `UserRepository`: CRUD de usuarios
    - `get_by_email(email)`: Buscar por email
    - `get_by_username(username)`: Buscar por username
    - `authenticate(username, password)`: Login
  - `BranchRepository`: CRUD de sucursales
    - `get_active()`: Listar sucursales activas

#### `app/repositories/product.py`
- **Ubicación**: `backend/app/repositories/product.py`
- **Qué hace**: Repository para **Productos, Categorías, Marcas**
- **Classes**:
  - `ProductRepository`: CRUD de productos
    - `get_by_sku(sku)`: Buscar por SKU
    - `get_by_barcode(barcode)`: Buscar por código de barras
    - `get_with_stock(branch_id)`: Productos con info de stock
    - `update_stock(product_id, size_id, branch_id, quantity)`: Actualizar stock
    - `search(query, category_id, branch_id)`: Búsqueda avanzada
  - `CategoryRepository`: CRUD de categorías
  - `BrandRepository`: CRUD de marcas

#### `app/repositories/inventory.py`
- **Ubicación**: `backend/app/repositories/inventory.py`
- **Qué hace**: Repository para **Gestión de Inventario**
- **Classes**:
  - `BranchStockRepository`: Gestión de stock por sucursal
    - `get_by_product_and_branch(product_id, branch_id)`: Stock específico
    - `get_low_stock(branch_id, threshold)`: Productos con stock bajo
    - `adjust_stock(product_id, size_id, branch_id, quantity, movement_type)`: Ajustar stock
  - `InventoryMovementRepository`: Historial de movimientos
    - `create_movement(product_id, movement_type, quantity, reason)`: Registrar movimiento
    - `get_movements_by_product(product_id)`: Historial de producto

#### `app/repositories/sale.py`
- **Ubicación**: `backend/app/repositories/sale.py`
- **Qué hace**: Repository para **Ventas**
- **Classes**:
  - `SaleRepository`: CRUD de ventas
    - `get_by_branch(branch_id, start_date, end_date)`: Ventas por sucursal y fechas
    - `get_by_sale_number(sale_number)`: Buscar por número de venta
    - `create_with_items(sale_data, items_data)`: Crear venta completa con items
    - `get_daily_total(branch_id, date)`: Total de ventas del día
    - `get_monthly_total(branch_id, year, month)`: Total del mes
  - `SaleItemRepository`: Items de venta

#### `app/repositories/payment.py`
- **Ubicación**: `backend/app/repositories/payment.py`
- **Qué hace**: Repository para **Configuración de Pagos**
- **Classes**:
  - `PaymentConfigRepository`: Métodos de pago
    - `get_active()`: Métodos de pago activos
    - `get_by_method(payment_method)`: Buscar por método
    - `calculate_surcharge(amount, installments)`: Calcular recargo

#### `app/repositories/ecommerce.py`
- **Ubicación**: `backend/app/repositories/ecommerce.py`
- **Qué hace**: Repository para **E-commerce**
- **Classes**:
  - `EcommerceConfigRepository`: Configuración de tienda
    - `get_config()`: Obtener configuración activa
    - `update_config(config_data)`: Actualizar configuración
  - `StoreBannerRepository`: Banners
    - `get_active_banners()`: Banners activos ordenados
    - `reorder(banner_ids)`: Reordenar banners

#### `app/repositories/whatsapp.py`
- **Ubicación**: `backend/app/repositories/whatsapp.py`
- **Qué hace**: Repository para **WhatsApp Business**
- **Classes**:
  - `WhatsAppConfigRepository`: Config de WhatsApp
  - `WhatsAppSaleRepository`: Ventas por WhatsApp
  - `SocialMediaConfigRepository`: Redes sociales

#### `app/repositories/notification.py`
- **Ubicación**: `backend/app/repositories/notification.py`
- **Qué hace**: Repository para **Notificaciones**
- **Classes**:
  - `NotificationRepository`: CRUD de notificaciones
    - `get_unread_by_user(user_id)`: Notificaciones no leídas
    - `mark_as_read(notification_id)`: Marcar como leída
    - `mark_all_as_read(user_id)`: Marcar todas como leídas
    - `create_low_stock_notification(product, branch)`: Crear alerta de stock bajo

#### `app/repositories/config.py`
- **Ubicación**: `backend/app/repositories/config.py`
- **Qué hace**: Repository para **Configuraciones del Sistema**
- **Classes**:
  - `SystemConfigRepository`: Config global
  - `BranchConfigRepository`: Config por sucursal
  - `TaxRateRepository`: Tasas de impuestos

---

### 📁 app/schemas/ - Esquemas Pydantic (DTOs) - **18 archivos**

> **Los schemas definen la estructura de datos para requests/responses de la API**

#### `app/schemas/__init__.py`
- **Ubicación**: `backend/app/schemas/__init__.py`
- **Qué hace**: **HUB CENTRAL** de imports de schemas
- **Función**: Export point único para todos los schemas
- **Importancia**: ⭐⭐⭐ Centraliza imports

#### `app/schemas/common.py`
- **Ubicación**: `backend/app/schemas/common.py`
- **Qué hace**: Schemas comunes reutilizables
- **Schemas**:
  - `ResponseMessage`: Response genérico con message
  - `PaginatedResponse`: Response con paginación
  - `SuccessResponse`: Response de éxito

#### `app/schemas/auth.py`
- **Ubicación**: `backend/app/schemas/auth.py`
- **Qué hace**: Schemas de **Autenticación**
- **Schemas**:
  - `TokenData`: Datos decodificados del token
  - `Token`: Response con access_token
  - `LoginRequest`: username + password
  - `LoginResponse`: token + user data

#### `app/schemas/user.py`
- **Ubicación**: `backend/app/schemas/user.py`
- **Qué hace**: Schemas de **Usuarios**
- **Schemas**:
  - `UserBase`: Campos comunes
  - `UserCreate`: Para crear usuario (con password)
  - `UserUpdate`: Para actualizar usuario
  - `User`: Response completo (sin password)
  - `UserInDB`: Con password_hash (interno)

#### `app/schemas/branch.py`
- **Ubicación**: `backend/app/schemas/branch.py`
- **Qué hace**: Schemas de **Sucursales**
- **Schemas**:
  - `BranchBase`: Campos comunes
  - `BranchCreate`: Para crear sucursal
  - `BranchUpdate`: Para actualizar
  - `Branch`: Response completo

#### `app/schemas/product.py`
- **Ubicación**: `backend/app/schemas/product.py`
- **Qué hace**: Schemas de **Productos**
- **Schemas**:
  - `ProductBase`: Campos comunes
  - `ProductCreate`: Para crear producto
  - `ProductUpdate`: Para actualizar
  - `Product`: Response completo con relaciones
  - `ProductWithStock`: Producto + info de stock
  - `ProductSize`: Schema de talles
  - `ProductImage`: Schema de imágenes

#### `app/schemas/category.py`
- **Ubicación**: `backend/app/schemas/category.py`
- **Qué hace**: Schemas de **Categorías**
- **Schemas**:
  - `CategoryBase`
  - `CategoryCreate`
  - `CategoryUpdate`
  - `Category`: Con lista de productos

#### `app/schemas/brand.py`
- **Ubicación**: `backend/app/schemas/brand.py`
- **Qué hace**: Schemas de **Marcas**
- **Schemas**:
  - `BrandBase`
  - `BrandCreate`
  - `BrandUpdate`
  - `Brand`

#### `app/schemas/inventory.py`
- **Ubicación**: `backend/app/schemas/inventory.py`
- **Qué hace**: Schemas de **Inventario**
- **Schemas**:
  - `BranchStockBase`
  - `BranchStockUpdate`: Para ajustar stock
  - `BranchStock`: Stock info completo
  - `InventoryMovement`: Movimiento de inventario
  - `StockAdjustment`: Para ajustes manuales

#### `app/schemas/sale.py`
- **Ubicación**: `backend/app/schemas/sale.py`
- **Qué hace**: Schemas de **Ventas**
- **Schemas**:
  - `SaleItemBase`: Item de venta
  - `SaleItemCreate`: Para crear item
  - `SaleItem`: Response de item
  - `SaleBase`: Campos comunes de venta
  - `SaleCreate`: Para crear venta (con items)
  - `SaleUpdate`: Para actualizar venta
  - `Sale`: Response completo con items y pagos
  - `SaleWithDetails`: Venta con detalles extendidos

#### `app/schemas/payment.py`
- **Ubicación**: `backend/app/schemas/payment.py`
- **Qué hace**: Schemas de **Pagos**
- **Schemas**:
  - `PaymentConfigBase`
  - `PaymentConfigCreate`
  - `PaymentConfigUpdate`
  - `PaymentConfig`
  - `SurchargeCalculation`: Cálculo de recargos

#### `app/schemas/payment_method.py`
- **Ubicación**: `backend/app/schemas/payment_method.py`
- **Qué hace**: Schemas de **Métodos de Pago** (legacy)
- **Estado**: DEPRECATED - Usar `payment.py`

#### `app/schemas/tax_rate.py`
- **Ubicación**: `backend/app/schemas/tax_rate.py`
- **Qué hace**: Schemas de **Impuestos**
- **Schemas**:
  - `TaxRateBase`
  - `TaxRateCreate`
  - `TaxRateUpdate`
  - `TaxRate`

#### `app/schemas/ecommerce.py`
- **Ubicación**: `backend/app/schemas/ecommerce.py`
- **Qué hace**: Schemas de **E-commerce**
- **Schemas**:
  - `EcommerceConfigBase`
  - `EcommerceConfigUpdate`
  - `EcommerceConfig`
  - `StoreBannerBase`
  - `StoreBannerCreate`
  - `StoreBannerUpdate`
  - `StoreBanner`
  - `ProductPublic`: Producto para frontend público

#### `app/schemas/whatsapp.py`
- **Ubicación**: `backend/app/schemas/whatsapp.py`
- **Qué hace**: Schemas de **WhatsApp**
- **Schemas**:
  - `WhatsAppConfigBase`
  - `WhatsAppConfigUpdate`
  - `WhatsAppConfig`
  - `WhatsAppSale`
  - `SocialMediaConfig`

#### `app/schemas/notification.py`
- **Ubicación**: `backend/app/schemas/notification.py`
- **Qué hace**: Schemas de **Notificaciones**
- **Schemas**:
  - `NotificationBase`
  - `NotificationCreate`
  - `Notification`
  - `NotificationMarkRead`: Para marcar como leída

#### `app/schemas/system_config.py`
- **Ubicación**: `backend/app/schemas/system_config.py`
- **Qué hace**: Schemas de **Configuración del Sistema**
- **Schemas**:
  - `SystemConfigBase`
  - `SystemConfigUpdate`
  - `SystemConfig`

#### `app/schemas/dashboard.py`
- **Ubicación**: `backend/app/schemas/dashboard.py`
- **Qué hace**: Schemas para **Dashboard y Estadísticas**
- **Schemas**:
  - `DashboardStats`: Estadísticas generales
    - total_sales_today
    - total_sales_month
    - total_products
    - low_stock_products
    - active_branches
  - `SalesChart`: Datos para gráficos de ventas
  - `TopProduct`: Productos más vendidos

---

### 📁 app/services/ - Lógica de Negocio - **7 archivos**

> **Los services contienen la lógica de negocio compleja que orquesta múltiples repositories**

#### `app/services/__init__.py`
- **Ubicación**: `backend/app/services/__init__.py`
- **Qué hace**: Inicializa paquete services
- **Función**: Export point de servicios

#### `app/services/user_service.py`
- **Ubicación**: `backend/app/services/user_service.py`
- **Qué hace**: Lógica de negocio para **Usuarios**
- **Funciones**:
  - `create_user(user_data)`: Crea usuario y hashea password
  - `update_user_password(user_id, new_password)`: Cambia password
  - `deactivate_user(user_id)`: Desactiva usuario (soft delete)
  - `assign_branch(user_id, branch_id)`: Asigna usuario a sucursal

#### `app/services/product_service.py`
- **Ubicación**: `backend/app/services/product_service.py`
- **Qué hace**: Lógica de negocio para **Productos e Inventario**
- **Funciones**:
  - `create_product_with_stock(product_data, initial_stock)`: Crea producto + stock inicial
  - `transfer_stock(product_id, from_branch, to_branch, quantity)`: Transfiere stock entre sucursales
  - `check_low_stock(branch_id)`: Identifica productos con stock bajo
  - `bulk_import_products(csv_file)`: Importación masiva desde CSV
  - `update_product_price(product_id, new_price)`: Actualiza precio

#### `app/services/sale_service.py`
- **Ubicación**: `backend/app/services/sale_service.py`
- **Qué hace**: Lógica de negocio para **Ventas**
- **Funciones**:
  - `create_sale(sale_data, items_data)`: Crea venta completa
    1. Valida stock disponible
    2. Crea registro de venta
    3. Crea items de venta
    4. Descuenta stock de BranchStock
    5. Crea movimientos de inventario
  - `cancel_sale(sale_id)`: Cancela venta y devuelve stock
  - `process_payment(sale_id, payment_data)`: Procesa pago
  - `calculate_sale_total(items, payment_method)`: Calcula total con impuestos y recargos
  - `get_sales_report(branch_id, start_date, end_date)`: Genera reporte

#### `app/services/inventory_service.py`
- **Ubicación**: `backend/app/services/inventory_service.py`
- **Qué hace**: Lógica de negocio para **Gestión de Inventario**
- **Funciones**:
  - `adjust_stock(adjustments)`: Ajuste masivo de stock
  - `generate_inventory_report(branch_id)`: Reporte de inventario
  - `sync_stock_across_branches()`: Sincroniza stock entre sucursales
  - `alert_low_stock()`: Genera notificaciones de stock bajo

#### `app/services/payment_service.py`
- **Ubicación**: `backend/app/services/payment_service.py`
- **Qué hace**: Lógica de negocio para **Pagos**
- **Funciones**:
  - `calculate_installment_surcharge(amount, installments)`: Calcula recargo por cuotas
  - `validate_payment(payment_data)`: Valida datos de pago
  - `process_refund(sale_id, amount)`: Procesa devolución

#### `app/services/notification_service.py`
- **Ubicación**: `backend/app/services/notification_service.py`
- **Qué hace**: Lógica de negocio para **Notificaciones**
- **Funciones**:
  - `send_notification(user_id, notification_data)`: Envía notificación
  - `broadcast_notification(branch_id, message)`: Envía a todos los usuarios de una sucursal
  - `create_low_stock_alerts(branch_id)`: Crea alertas automáticas de stock bajo

#### `app/services/config_service.py`
- **Ubicación**: `backend/app/services/config_service.py`
- **Qué hace**: Lógica de negocio para **Configuraciones**
- **Funciones**:
  - `get_system_config()`: Obtiene configuración del sistema
  - `update_ecommerce_config(config_data)`: Actualiza config de e-commerce
  - `manage_banners(banner_operations)`: Gestiona banners

---

## 📁 CONFIG/ - Configuraciones del Sistema

#### `config/__init__.py`
- **Ubicación**: `backend/config/__init__.py`
- **Qué hace**: Inicializa paquete config
- **Función**: Export de configuraciones

#### `config/settings.py`
- **Ubicación**: `backend/config/settings.py`
- **Qué hace**: **Configuraciones centralizadas** usando Pydantic Settings
- **Contenido**:
  - Lee variables de entorno de `.env`
  - Define configuración de BD, JWT, Cloudinary, etc.
  - Validación de tipos con Pydantic
- **Uso**: `from config.settings import settings`

---

## 📁 EXCEPTIONS/ - Excepciones Personalizadas

#### `exceptions/__init__.py`
- **Ubicación**: `backend/exceptions/__init__.py`
- **Qué hace**: Inicializa paquete exceptions
- **Función**: Export de excepciones

#### `exceptions/custom_exceptions.py`
- **Ubicación**: `backend/exceptions/custom_exceptions.py`
- **Qué hace**: Define excepciones personalizadas
- **Excepciones**:
  - `ItemNotFoundException`: No se encontró el item
  - `InsufficientStockException`: Stock insuficiente
  - `InvalidCredentialsException`: Credenciales inválidas
  - `UnauthorizedException`: Sin autorización
  - `DuplicateEntryException`: Entrada duplicada
- **Uso**: Lanzadas por services y atrapadas por exception handlers en main.py

---

## 📁 ROUTERS/ - Controladores FastAPI - **14 archivos**

> **Los routers definen los endpoints de la API y delegan a services/repositories**

#### `routers/__init__.py`
- **Ubicación**: `backend/routers/__init__.py`
- **Qué hace**: Inicializa paquete routers
- **Función**: Export de routers para registro en main.py

#### `routers/auth.py`
- **Ubicación**: `backend/routers/auth.py`
- **Qué hace**: Endpoints de **Autenticación**
- **Endpoints**:
  - `POST /auth/login`: Login con username/password → devuelve JWT token
  - `GET /auth/me`: Obtiene usuario actual autenticado
  - `POST /auth/register`: Registro de nuevo usuario (si está habilitado)
  - `POST /auth/refresh`: Refresh token
- **Prefijo**: `/auth`

#### `routers/users.py`
- **Ubicación**: `backend/routers/users.py`
- **Qué hace**: Endpoints de **Gestión de Usuarios**
- **Endpoints**:
  - `GET /users`: Listar usuarios (con filtros)
  - `GET /users/{user_id}`: Obtener usuario por ID
  - `POST /users`: Crear usuario
  - `PUT /users/{user_id}`: Actualizar usuario
  - `DELETE /users/{user_id}`: Eliminar usuario
  - `PATCH /users/{user_id}/password`: Cambiar contraseña
  - `PATCH /users/{user_id}/activate`: Activar/desactivar usuario
- **Prefijo**: `/users`
- **Auth requerida**: ✅ (Solo Admin y Manager)

#### `routers/branches.py`
- **Ubicación**: `backend/routers/branches.py`
- **Qué hace**: Endpoints de **Gestión de Sucursales**
- **Endpoints**:
  - `GET /branches`: Listar sucursales
  - `GET /branches/{branch_id}`: Obtener sucursal por ID
  - `POST /branches`: Crear sucursal
  - `PUT /branches/{branch_id}`: Actualizar sucursal
  - `DELETE /branches/{branch_id}`: Eliminar sucursal (con cleanup de relaciones)
  - `GET /branches/{branch_id}/users`: Usuarios de la sucursal
  - `GET /branches/{branch_id}/stock`: Stock de la sucursal
- **Prefijo**: `/branches`
- **Auth requerida**: ✅ (Admin y Manager)

#### `routers/products.py`
- **Ubicación**: `backend/routers/products.py`
- **Qué hace**: Endpoints de **Gestión de Productos**
- **Endpoints**:
  - `GET /products`: Listar productos (con filtros y paginación)
  - `GET /products/{product_id}`: Obtener producto por ID
  - `POST /products`: Crear producto
  - `PUT /products/{product_id}`: Actualizar producto
  - `DELETE /products/{product_id}`: Eliminar producto
  - `POST /products/{product_id}/image`: Subir imagen (Cloudinary)
  - `GET /products/{product_id}/stock`: Stock del producto
  - `POST /products/{product_id}/stock`: Ajustar stock
  - `GET /products/search`: Búsqueda avanzada
  - `GET /products/barcode/{barcode}`: Buscar por código de barras
- **Prefijo**: `/products`
- **Auth requerida**: ✅ (Admin, Manager, Seller)

#### `routers/brands.py`
- **Ubicación**: `backend/routers/brands.py`
- **Qué hace**: Endpoints de **Gestión de Marcas**
- **Endpoints**:
  - `GET /brands`: Listar marcas
  - `GET /brands/{brand_id}`: Obtener marca por ID
  - `POST /brands`: Crear marca
  - `PUT /brands/{brand_id}`: Actualizar marca
  - `DELETE /brands/{brand_id}`: Eliminar marca
  - `GET /brands/{brand_id}/products`: Productos de la marca
- **Prefijo**: `/brands`
- **Auth requerida**: ✅

#### `routers/categories.py`
- **Ubicación**: `backend/routers/categories.py`
- **Qué hace**: Endpoints de **Gestión de Categorías**
- **Endpoints**:
  - `GET /categories`: Listar categorías
  - `GET /categories/{category_id}`: Obtener categoría por ID
  - `POST /categories`: Crear categoría
  - `PUT /categories/{category_id}`: Actualizar categoría
  - `DELETE /categories/{category_id}`: Eliminar categoría
  - `GET /categories/{category_id}/products`: Productos de la categoría
- **Prefijo**: `/categories`
- **Auth requerida**: ✅

#### `routers/sales.py`
- **Ubicación**: `backend/routers/sales.py`
- **Qué hace**: Endpoints de **Gestión de Ventas (POS)**
- **Endpoints**:
  - `GET /sales`: Listar ventas (con filtros de fecha, sucursal, estado)
  - `GET /sales/{sale_id}`: Obtener venta por ID
  - `POST /sales`: Crear venta (procesa venta completa con items)
  - `PUT /sales/{sale_id}`: Actualizar venta
  - `DELETE /sales/{sale_id}`: Cancelar venta (devuelve stock)
  - `GET /sales/daily`: Total de ventas del día
  - `GET /sales/monthly`: Total de ventas del mes
  - `GET /sales/report`: Reporte de ventas (con filtros)
  - `GET /sales/{sale_id}/receipt`: Generar ticket de venta (PDF o texto)
- **Prefijo**: `/sales`
- **Auth requerida**: ✅ (Admin, Manager, Seller)

#### `routers/ecommerce_public.py`
- **Ubicación**: `backend/routers/ecommerce_public.py`
- **Qué hace**: Endpoints **PÚBLICOS** de E-commerce (sin autenticación)
- **Endpoints**:
  - `GET /ecommerce/products`: Listar productos públicos (solo con `show_in_ecommerce=true`)
  - `GET /ecommerce/products/{product_id}`: Detalle de producto público
  - `GET /ecommerce/categories`: Categorías para e-commerce
  - `GET /ecommerce/banners`: Banners activos
  - `GET /ecommerce/config`: Configuración de la tienda (nombre, contacto, etc.)
  - `POST /ecommerce/orders`: Crear orden desde e-commerce (sin auth)
  - `GET /ecommerce/products/search`: Búsqueda pública
- **Prefijo**: `/ecommerce`
- **Auth requerida**: ❌ NO (endpoints públicos)

#### `routers/ecommerce_advanced.py`
- **Ubicación**: `backend/routers/ecommerce_advanced.py`
- **Qué hace**: Endpoints de **Administración de E-commerce** (con autenticación)
- **Endpoints**:
  - `GET /ecommerce-advanced/orders`: Listar órdenes de e-commerce
  - `GET /ecommerce-advanced/orders/{order_id}`: Detalle de orden
  - `PATCH /ecommerce-advanced/orders/{order_id}/status`: Cambiar estado de orden
  - `PUT /ecommerce-advanced/config`: Actualizar configuración de tienda
  - `POST /ecommerce-advanced/banners`: Crear banner
  - `PUT /ecommerce-advanced/banners/{banner_id}`: Actualizar banner
  - `DELETE /ecommerce-advanced/banners/{banner_id}`: Eliminar banner
  - `POST /ecommerce-advanced/banners/reorder`: Reordenar banners
- **Prefijo**: `/ecommerce-advanced`
- **Auth requerida**: ✅ (Admin, Manager, Ecommerce role)

#### `routers/notifications.py`
- **Ubicación**: `backend/routers/notifications.py`
- **Qué hace**: Endpoints de **Sistema de Notificaciones**
- **Endpoints**:
  - `GET /notifications`: Listar notificaciones del usuario actual
  - `GET /notifications/unread`: Notificaciones no leídas
  - `PATCH /notifications/{notification_id}/read`: Marcar como leída
  - `PATCH /notifications/read-all`: Marcar todas como leídas
  - `DELETE /notifications/{notification_id}`: Eliminar notificación
- **Prefijo**: `/notifications`
- **Auth requerida**: ✅

#### `routers/config.py`
- **Ubicación**: `backend/routers/config.py`
- **Qué hace**: Endpoints de **Configuración del Sistema**
- **Endpoints**:
  - `GET /config/system`: Obtener configuración global
  - `PUT /config/system`: Actualizar configuración global
  - `GET /config/payment-methods`: Métodos de pago activos
  - `POST /config/payment-methods`: Crear método de pago
  - `PUT /config/payment-methods/{id}`: Actualizar método de pago
  - `GET /config/tax-rates`: Tasas de impuestos
  - `POST /config/tax-rates`: Crear tasa de impuesto
- **Prefijo**: `/config`
- **Auth requerida**: ✅ (Admin)

#### `routers/content_management.py`
- **Ubicación**: `backend/routers/content_management.py`
- **Qué hace**: Endpoints de **Gestión de Contenido** (banners, textos, logos)
- **Endpoints**:
  - `POST /content/banners`: Subir banner
  - `POST /content/logo`: Subir logo de la tienda
  - `PUT /content/welcome-text`: Actualizar texto de bienvenida
- **Prefijo**: `/content`
- **Auth requerida**: ✅ (Admin, Manager)

#### `routers/websockets.py`
- **Ubicación**: `backend/routers/websockets.py`
- **Qué hace**: Endpoints de **WebSocket** para comunicación en tiempo real
- **Endpoints**:
  - `WS /ws/{branch_id}/{token}`: Conexión WebSocket para notificaciones
- **Función**:
  - Broadcast de notificaciones en tiempo real
  - Actualización de ventas en tiempo real
  - Alertas de stock bajo
- **Prefijo**: `/ws`
- **Estado**: Implementado pero deshabilitado en main.py:122

#### `routers/init_db_endpoint.py`
- **Ubicación**: `backend/routers/init_db_endpoint.py`
- **Qué hace**: Endpoint para **inicializar BD desde la API**
- **Endpoints**:
  - `POST /api/init/database`: Inicializa BD con datos de prueba
- **Prefijo**: `/api/init`
- **Uso**: Alternativa a correr `init_data.py` manualmente
- **⚠️ Seguridad**: Solo disponible en desarrollo

---

## 📁 SERVICES/ - Servicios Auxiliares (Legacy)

#### `services/__init__.py`
- **Ubicación**: `backend/services/__init__.py`
- **Qué hace**: Inicializa paquete services (legacy)
- **Estado**: Carpeta legacy, preferir `app/services/`

#### `services/auth_service.py`
- **Ubicación**: `backend/services/auth_service.py`
- **Qué hace**: Servicio de autenticación (legacy)
- **Estado**: Funcionalidad movida a `app/services/user_service.py`
- **Mantener por**: Backwards compatibility

---

## 📁 TESTS/ - Tests Unitarios e Integración - **16 archivos**

### 📁 tests/ - Tests

#### `tests/__init__.py`
- **Ubicación**: `backend/tests/__init__.py`
- **Qué hace**: Inicializa paquete tests
- **Función**: Marca carpeta como módulo Python

#### `tests/conftest.py`
- **Ubicación**: `backend/tests/conftest.py`
- **Qué hace**: **Fixtures de pytest** para todos los tests
- **Fixtures definidos**:
  - `db`: Sesión de BD de prueba
  - `client`: Cliente de FastAPI TestClient
  - `test_user`: Usuario de prueba
  - `test_branch`: Sucursal de prueba
  - `test_product`: Producto de prueba
  - `auth_headers`: Headers con token JWT
- **Importancia**: ⭐⭐⭐ Todos los tests usan estas fixtures

#### `tests/conftest_advanced.py`
- **Ubicación**: `backend/tests/conftest_advanced.py`
- **Qué hace**: Fixtures avanzadas para tests complejos
- **Fixtures**:
  - `db_with_data`: BD pre-cargada con datos de prueba
  - `admin_client`: Cliente autenticado como admin
  - `seller_client`: Cliente autenticado como seller

#### `tests/test_database_setup.py`
- **Ubicación**: `backend/tests/test_database_setup.py`
- **Qué hace**: Tests de configuración de BD
- **Tests**:
  - Verifica conexión a BD
  - Verifica creación de tablas
  - Verifica fixtures básicas

---

### 📁 tests/unit/ - Tests Unitarios

#### `tests/unit/__init__.py`
- **Ubicación**: `backend/tests/unit/__init__.py`
- **Qué hace**: Inicializa paquete unit tests

#### `tests/unit/test_auth.py`
- **Ubicación**: `backend/tests/unit/test_auth.py`
- **Qué hace**: Tests unitarios de **autenticación**
- **Tests**:
  - `test_password_hashing()`: Verifica hash de contraseñas
  - `test_password_verification()`: Verifica validación de contraseñas
  - `test_create_access_token()`: Verifica creación de JWT
  - `test_verify_token()`: Verifica validación de JWT
  - `test_token_expiration()`: Verifica expiración de tokens

#### `tests/unit/test_models.py`
- **Ubicación**: `backend/tests/unit/test_models.py`
- **Qué hace**: Tests unitarios de **modelos**
- **Tests**:
  - `test_user_model()`: Crea y valida usuario
  - `test_product_model()`: Crea y valida producto
  - `test_sale_model()`: Crea y valida venta
  - `test_branch_stock_calculation()`: Verifica cálculos de stock
  - `test_product_methods()`: Verifica métodos de Product

#### `tests/unit/test_database.py`
- **Ubicación**: `backend/tests/unit/test_database.py`
- **Qué hace**: Tests de conexión y operaciones de BD
- **Tests**:
  - `test_database_connection()`: Verifica conexión
  - `test_session_factory()`: Verifica creación de sesiones
  - `test_transaction_rollback()`: Verifica rollback

---

### 📁 tests/integration/ - Tests de Integración

#### `tests/integration/__init__.py`
- **Ubicación**: `backend/tests/integration/__init__.py`
- **Qué hace**: Inicializa paquete integration tests

#### `tests/integration/test_auth_endpoints.py`
- **Ubicación**: `backend/tests/integration/test_auth_endpoints.py`
- **Qué hace**: Tests de integración de **endpoints de auth**
- **Tests**:
  - `test_login_success()`: Login exitoso
  - `test_login_invalid_credentials()`: Login con credenciales incorrectas
  - `test_get_current_user()`: Obtener usuario autenticado
  - `test_unauthorized_access()`: Acceso sin autenticación

#### `tests/integration/test_products_api.py`
- **Ubicación**: `backend/tests/integration/test_products_api.py`
- **Qué hace**: Tests de integración de **API de productos**
- **Tests**:
  - `test_create_product()`: Crear producto
  - `test_list_products()`: Listar productos con paginación
  - `test_update_product()`: Actualizar producto
  - `test_delete_product()`: Eliminar producto
  - `test_search_products()`: Búsqueda de productos
  - `test_product_stock()`: Gestión de stock

#### `tests/integration/test_sales_api.py`
- **Ubicación**: `backend/tests/integration/test_sales_api.py`
- **Qué hace**: Tests de integración de **API de ventas**
- **Tests**:
  - `test_create_sale()`: Crear venta completa con items
  - `test_create_sale_insufficient_stock()`: Venta con stock insuficiente
  - `test_list_sales()`: Listar ventas
  - `test_cancel_sale()`: Cancelar venta y devolver stock
  - `test_sales_report()`: Generar reporte de ventas

#### `tests/integration/test_ecommerce_endpoints.py`
- **Ubicación**: `backend/tests/integration/test_ecommerce_endpoints.py`
- **Qué hace**: Tests de integración de **API pública de e-commerce**
- **Tests**:
  - `test_list_public_products()`: Listar productos públicos
  - `test_create_ecommerce_order()`: Crear orden sin autenticación
  - `test_get_banners()`: Obtener banners activos
  - `test_get_store_config()`: Obtener configuración de tienda

#### `tests/integration/test_inventory_enhancements.py`
- **Ubicación**: `backend/tests/integration/test_inventory_enhancements.py`
- **Qué hace**: Tests de integración de **sistema de inventario mejorado**
- **Tests**:
  - `test_stock_adjustment()`: Ajuste de stock
  - `test_stock_transfer()`: Transferencia entre sucursales
  - `test_low_stock_alert()`: Alertas de stock bajo
  - `test_inventory_movements()`: Historial de movimientos

#### `tests/integration/test_configuration_api.py`
- **Ubicación**: `backend/tests/integration/test_configuration_api.py`
- **Qué hace**: Tests de integración de **API de configuración**
- **Tests**:
  - `test_get_system_config()`: Obtener configuración
  - `test_update_system_config()`: Actualizar configuración
  - `test_payment_methods()`: Gestión de métodos de pago
  - `test_tax_rates()`: Gestión de tasas de impuestos

#### `tests/integration/test_payment_config_api.py`
- **Ubicación**: `backend/tests/integration/test_payment_config_api.py`
- **Qué hace**: Tests de integración de **configuración de pagos**
- **Tests**:
  - `test_create_payment_config()`: Crear método de pago
  - `test_calculate_surcharge()`: Calcular recargos
  - `test_installments()`: Configuración de cuotas

#### `tests/integration/test_websockets.py`
- **Ubicación**: `backend/tests/integration/test_websockets.py`
- **Qué hace**: Tests de integración de **WebSocket**
- **Tests**:
  - `test_websocket_connection()`: Conexión WebSocket
  - `test_websocket_authentication()`: Autenticación por WebSocket
  - `test_websocket_message_broadcast()`: Broadcast de mensajes

#### `tests/integration/test_websocket_real_time.py`
- **Ubicación**: `backend/tests/integration/test_websocket_real_time.py`
- **Qué hace**: Tests de integración de **actualizaciones en tiempo real**
- **Tests**:
  - `test_real_time_notification()`: Notificación en tiempo real
  - `test_stock_update_broadcast()`: Broadcast de actualización de stock
  - `test_multiple_clients()`: Múltiples clientes conectados

---

## 📁 UTILS/ - Utilidades y Helpers

#### `utils/__init__.py`
- **Ubicación**: `backend/utils/__init__.py`
- **Qué hace**: Inicializa paquete utils
- **Función**: Export de utilidades

#### `utils/helpers.py`
- **Ubicación**: `backend/utils/helpers.py`
- **Qué hace**: Funciones helper generales
- **Funciones**:
  - `generate_sale_number()`: Genera número único de venta
  - `format_currency(amount)`: Formatea moneda
  - `calculate_percentage(amount, percentage)`: Cálculo de porcentaje
  - `validate_email(email)`: Valida formato de email
  - `sanitize_input(text)`: Sanitiza entrada de usuario

#### `utils/validators.py`
- **Ubicación**: `backend/utils/validators.py`
- **Qué hace**: Validadores personalizados
- **Funciones**:
  - `validate_sku(sku)`: Valida formato de SKU
  - `validate_barcode(barcode)`: Valida código de barras
  - `validate_dni(dni)`: Valida DNI/documento
  - `validate_phone(phone)`: Valida número de teléfono
  - `validate_stock_quantity(quantity)`: Valida cantidad de stock

#### `utils/size_validators.py`
- **Ubicación**: `backend/utils/size_validators.py`
- **Qué hace**: Validadores de talles de productos
- **Funciones**:
  - `validate_size_name(name)`: Valida nombre de talle
  - `validate_size_for_category(size, category)`: Valida talle según categoría
  - `get_standard_sizes(category)`: Obtiene talles estándar por categoría
  - `normalize_size_name(name)`: Normaliza nombre de talle

---

## 📊 Resumen por Tipo de Archivo

| Tipo | Cantidad | Ubicación Principal |
|------|----------|---------------------|
| **Archivos Raíz** | 17 | `backend/` |
| **Modelos (ORM)** | 18 | `backend/app/models/` |
| **Repositories (DAL)** | 10 | `backend/app/repositories/` |
| **Schemas (DTOs)** | 18 | `backend/app/schemas/` |
| **Services** | 7 | `backend/app/services/` |
| **Routers (API)** | 14 | `backend/routers/` |
| **Tests** | 16 | `backend/tests/` |
| **Utilidades** | 3 | `backend/utils/` |
| **Config** | 2 | `backend/config/` |
| **Exceptions** | 2 | `backend/exceptions/` |
| **Scripts Migración** | 11 | `backend/migrate_*.py` |
| **Scripts Init** | 4 | `backend/init_*.py` |
| **Otros** | 20 | Varios |
| **TOTAL** | **142** | - |

---

## 🎯 Flujo de una Request HTTP

```
1. Cliente → HTTP Request → main.py (FastAPI app)
                                ↓
2. CORS Middleware (main.py:93-100) valida origen
                                ↓
3. Router (routers/*.py) recibe request
                                ↓
4. Dependency get_current_user() (auth.py) valida JWT
                                ↓
5. Router llama a Service (app/services/*.py)
                                ↓
6. Service orquesta lógica de negocio
                                ↓
7. Service llama a Repository (app/repositories/*.py)
                                ↓
8. Repository ejecuta queries SQL (SQLAlchemy)
                                ↓
9. Database (PostgreSQL) retorna datos
                                ↓
10. Repository retorna Model (app/models/*.py)
                                ↓
11. Service retorna Model al Router
                                ↓
12. Router convierte Model → Schema (app/schemas/*.py)
                                ↓
13. FastAPI serializa Schema → JSON Response
                                ↓
14. Cliente ← HTTP Response ← main.py
```

---

## 🔑 Archivos MÁS IMPORTANTES

### **Top 10 Archivos Críticos**:

1. **`main.py`** ⭐⭐⭐⭐⭐
   - Punto de entrada de la aplicación
   - Configura FastAPI, CORS, routers
   - Sin este archivo, nada funciona

2. **`database.py`** ⭐⭐⭐⭐⭐
   - Conexión a PostgreSQL
   - Sesiones de BD para todas las operaciones
   - Dependency `get_db()` usado en TODOS los routers

3. **`auth.py`** ⭐⭐⭐⭐⭐
   - Sistema de autenticación JWT
   - Validación de usuarios
   - Usado en TODOS los endpoints protegidos

4. **`app/models/__init__.py`** ⭐⭐⭐⭐
   - Hub central de imports de modelos
   - Define estructura de BD
   - Todos los modelos DEBEN estar aquí

5. **`app/repositories/base.py`** ⭐⭐⭐⭐
   - CRUD genérico base
   - Todos los repositories heredan de aquí
   - Patrón fundamental del proyecto

6. **`app/services/sale_service.py`** ⭐⭐⭐⭐
   - Lógica compleja de ventas
   - Orquesta productos, stock, pagos
   - Crítico para operación del POS

7. **`routers/products.py`** ⭐⭐⭐⭐
   - API de productos (más usado)
   - Gestión de inventario
   - Usado por POS y E-commerce

8. **`routers/ecommerce_public.py`** ⭐⭐⭐⭐
   - API pública de e-commerce
   - Sin autenticación
   - Crítico para tienda online

9. **`requirements.txt`** ⭐⭐⭐⭐
   - Todas las dependencias
   - Sin esto, no se puede instalar nada

10. **`pytest.ini`** ⭐⭐⭐
    - Configuración de tests
    - Coverage y markers
    - Calidad del código

---

## 📚 Referencias Cruzadas

### **Modelo → Repository → Service → Router**

Ejemplo: **Producto**

```
Model: app/models/product.py (Product)
    ↓
Repository: app/repositories/product.py (ProductRepository)
    ↓
Service: app/services/product_service.py (create_product_with_stock)
    ↓
Router: routers/products.py (POST /products)
    ↓
Schema: app/schemas/product.py (ProductCreate, Product)
```

---

## ✅ Checklist para Agregar Nueva Funcionalidad

1. ✅ Crear modelo en `app/models/*.py`
2. ✅ Registrar modelo en `app/models/__init__.py`
3. ✅ Crear schemas en `app/schemas/*.py`
4. ✅ Registrar schemas en `app/schemas/__init__.py`
5. ✅ Crear repository en `app/repositories/*.py`
6. ✅ Crear service en `app/services/*.py` (si necesita lógica compleja)
7. ✅ Crear router en `routers/*.py`
8. ✅ Registrar router en `main.py`
9. ✅ Escribir tests en `tests/unit/` y `tests/integration/`
10. ✅ Actualizar documentación

---

## 🎓 Conceptos Clave

### **Clean Architecture**
- **Models**: Definen estructura de BD (SQLAlchemy ORM)
- **Schemas**: Definen contratos de API (Pydantic)
- **Repositories**: Encapsulan acceso a datos (DAL)
- **Services**: Contienen lógica de negocio
- **Routers**: Exponen endpoints HTTP (Controllers)

### **Dependency Injection**
- `get_db()`: Inyecta sesión de BD
- `get_current_user()`: Inyecta usuario autenticado
- FastAPI gestiona automáticamente las dependencias

### **Multi-tenant (Branch-based)**
- La mayoría de modelos tienen `branch_id`
- Stock es **por sucursal** (`BranchStock`)
- Usuarios pertenecen a una sucursal
- Queries filtran por sucursal del usuario

---

**Documento generado automáticamente**
**Total de archivos documentados: 142**
**Fecha: 2026-01-20**
