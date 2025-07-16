# 🛒 E-commerce Integration - POS Cesariel

## 🎯 Overview

El e-commerce ahora está completamente integrado dentro del sistema POS Cesariel como un servicio adicional. Esta arquitectura unificada permite gestión centralizada, inventario compartido y desarrollo más eficiente.

## 🏗️ Arquitectura Integrada

```
pos-cesariel/
├── backend/           # FastAPI (puerto 8000)
├── frontend/          # POS Admin (puerto 3000)  
├── ecommerce/         # E-commerce público (puerto 3001) ✨
├── docker-compose.yml # Orchestación completa
└── Makefile          # Comandos unificados
```

## 🚀 Comandos de Desarrollo

### Entorno Completo
```bash
make dev              # Todos los servicios (POS + E-commerce)
```

### Servicios Específicos
```bash
make dev-pos          # Solo POS Admin + Backend + DB
make dev-ecommerce    # Solo E-commerce + Backend + DB
```

### Logs y Shell
```bash
make logs-ecommerce   # Logs del e-commerce
make shell-ecommerce  # Shell del contenedor e-commerce
make logs             # Todos los logs
```

## 🌐 URLs de Servicios

- **🏪 POS Admin**: http://localhost:3000
- **🛒 E-commerce**: http://localhost:3001
- **⚡ Backend API**: http://localhost:8000
- **📚 API Docs**: http://localhost:8000/docs
- **🗄️ Adminer**: http://localhost:8080

## ✅ Beneficios de la Integración

### 🔄 **Inventario Sincronizado**
- Base de datos PostgreSQL compartida
- Stock en tiempo real entre POS y E-commerce
- WebSockets para actualizaciones instantáneas

### 🔐 **Autenticación Unificada**
- Sistema JWT centralizado
- Roles compartidos (ADMIN, MANAGER, SELLER, ECOMMERCE)
- Gestión de usuarios desde POS Admin

### 📊 **Datos Centralizados**
- Productos, categorías y ventas en una BD
- Reportes consolidados POS + E-commerce
- Auditoría completa de transacciones

### 🛠️ **Desarrollo Simplificado**
- Docker Compose unificado
- Variables de entorno compartidas
- Testing integrado
- Deploy conjunto

## 🔧 Configuración Técnica

### Variables de Entorno
```env
# ecommerce/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
PORT=3001
```

### Docker Services
```yaml
services:
  db:          # PostgreSQL (puerto 5432)
  backend:     # FastAPI (puerto 8000)
  frontend:    # POS Admin (puerto 3000)
  ecommerce:   # E-commerce (puerto 3001) ✨
  adminer:     # Admin BD (puerto 8080)
```

## 📱 Funcionalidades E-commerce

### 🏠 **Homepage**
- Banners dinámicos desde backend
- Productos destacados en tiempo real
- Categorías desde POS

### 📦 **Catálogo**
- Productos con `show_in_ecommerce = true`
- Filtros por categoría, marca, precio
- Stock validation en tiempo real

### 🛒 **Carrito & Checkout**
- Validación de stock antes de compra
- Creación de ventas en sistema POS
- Integración WhatsApp para coordinación

### 📊 **Conexión Status**
- Indicador visual de conexión backend
- Fallback automático a datos estáticos
- Cache inteligente (5 minutos)

## 🔍 Troubleshooting

### E-commerce no muestra productos
```sql
-- Habilitar productos para e-commerce
UPDATE products SET show_in_ecommerce = true WHERE is_active = true;
```

### Verificar conexión backend
```bash
curl http://localhost:8000/health
curl http://localhost:8000/products?show_in_ecommerce=true
```

### Logs de debugging
```bash
make logs-ecommerce     # Solo e-commerce
make logs-backend       # Solo backend
make logs              # Todos los servicios
```

## 🎯 Next Steps

1. **Configurar productos**: Marcar productos como `show_in_ecommerce = true`
2. **Testing**: Probar flujo completo POS ↔ E-commerce
3. **Performance**: Optimizar cache y queries
4. **Deploy**: Configurar producción con SSL

## 📚 Documentación Adicional

- **CLAUDE.md** - Guías específicas de desarrollo
- **ARQUITECTURA.md** - Documentación técnica detallada
- **TESTING.md** - Guías de testing integrado

---

✅ **El e-commerce está completamente integrado y listo para desarrollo!**