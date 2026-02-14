# Diagramas de Casos de Uso - POS Cesariel

Diagramas simplificados de casos de uso para presentación de tesis. Enfocados en los casos de uso principales sin detalles técnicos excesivos.

## Archivos Disponibles

### 1. **01-ventas-pos.puml** - Módulo de Ventas POS
- **Actores**: Vendedor, Gerente, Administrador
- **Casos de uso principales**:
  - Registrar Venta (POS/E-commerce/WhatsApp)
  - Consultar Ventas
  - Generar Reportes
  - Ver Dashboard
  - Cancelar Venta
  - Gestionar Órdenes E-commerce

### 2. **02-inventario-productos.puml** - Módulo de Inventario
- **Actores**: Vendedor, Gerente, Administrador
- **Casos de uso principales**:
  - Gestionar Productos
  - Buscar Productos
  - Ajustar Stock
  - Consultar Stock por Sucursal
  - Gestionar Talles
  - Monitorear Stock Bajo
  - Importar desde Excel
  - Actualizar Precios Masivamente

### 3. **03-ecommerce-backend.puml** - E-commerce Backend
- **Actores**: Gerente, Administrador
- **Casos de uso principales**:
  - Configurar Tienda
  - Gestionar Banners
  - Configurar WhatsApp
  - Gestionar Imágenes de Productos
  - Controlar Visibilidad en Tienda
  - Ver Órdenes Online
  - Cambiar Estado de Orden
  - Confirmar/Completar Órdenes

### 4. **04-ecommerce-frontend.puml** - E-commerce Frontend
- **Actores**: Cliente
- **Casos de uso principales**:
  - Explorar Productos
  - Filtrar por Categoría/Marca
  - Buscar Productos
  - Ver Detalle de Producto
  - Agregar al Carrito
  - Gestionar Carrito
  - Seleccionar Talle
  - Realizar Checkout
  - Ingresar Datos de Envío
  - Confirmar Compra
  - Contactar por WhatsApp
  - Ver Información de la Tienda

## Cómo Generar las Imágenes

### Opción 1: Online (Más Rápido)
1. Ve a [PlantUML Online](http://www.plantuml.com/plantuml/uml/)
2. Copia el contenido del archivo `.puml`
3. Pega en el editor
4. Descarga como PNG o SVG

### Opción 2: VSCode
1. Instala extensión **PlantUML**
2. Instala Graphviz: `brew install graphviz`
3. Abre el archivo `.puml`
4. Presiona `Alt+D` (Mac: `Option+D`)
5. Exporta como imagen

### Opción 3: CLI
```bash
# Instalar PlantUML
brew install plantuml

# Generar PNG
plantuml docs/use-cases/*.puml

# Generar SVG (mejor calidad para slides)
plantuml -tsvg docs/use-cases/*.puml
```

### Opción 4: Docker (Sin instalación)
```bash
# Generar PNG
docker run -it --rm -v $(pwd)/docs/use-cases:/data plantuml/plantuml:latest -tpng /data/*.puml

# Generar SVG
docker run -it --rm -v $(pwd)/docs/use-cases:/data plantuml/plantuml:latest -tsvg /data/*.puml
```

## Recomendación para Slides

- Usa formato **SVG** para mejor calidad en presentaciones
- Los diagramas están diseñados para ser legibles en proyección
- Las notas explicativas son breves y concisas
- Los actores y casos de uso son claros y directos

## Estructura de los Diagramas

Cada diagrama incluye:
- ✅ **Actores principales** del sistema
- ✅ **Casos de uso esenciales** sin detalles técnicos excesivos
- ✅ **Agrupación lógica** en packages cuando aplica
- ✅ **Notas breves** con información clave
- ✅ **Permisos por rol** claramente definidos

---

**Nota**: Estos diagramas están optimizados para presentación de tesis. Versiones más detalladas pueden generarse según necesidad.
