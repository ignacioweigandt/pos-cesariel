# Guión de Demostración - Sistema POS Cesariel

## Preparación Previa (5 minutos antes)

### Lista de Verificación Técnica
- [ ] Verificar que todos los servicios estén corriendo (`make dev`)
- [ ] Comprobar conectividad a base de datos (`curl localhost:8000/health`)
- [ ] Validar que las 3 aplicaciones respondan:
  - [ ] Backend: http://localhost:8000/docs
  - [ ] POS Admin: http://localhost:3000
  - [ ] E-commerce: http://localhost:3001
- [ ] Tener datos de prueba cargados (`python init_data.py`)
- [ ] Preparar pestañas del navegador
- [ ] Verificar que WebSockets funcionen (notificaciones tiempo real)

### Datos de Prueba para Demo
```
Usuarios:
- Admin: admin / admin123
- Manager: manager / manager123  
- Seller: seller / seller123

Productos de prueba:
- Remera Básica (SKU: RB001) - Stock: 10
- Pantalón Jeans (SKU: PJ002) - Stock: 5
- Zapatillas Sport (SKU: ZS003) - Stock: 3
```

## Estructura de la Presentación (30 minutos)

### 1. Introducción y Contexto (3 minutos)

**Qué decir:**
"Buenos días/tardes. Mi nombre es [Tu Nombre] y hoy les voy a presentar mi proyecto de tesis: POS Cesariel, un sistema integral de punto de venta con e-commerce integrado."

**Mostrar diapositiva de arquitectura:**
"El sistema consiste en tres componentes principales:
- Un backend desarrollado en Python con FastAPI
- Un frontend administrativo para los empleados
- Un e-commerce para los clientes
- Todo conectado a una base de datos PostgreSQL"

### 2. Demostración del Backend API (5 minutos)

**URL:** http://localhost:8000/docs

**Qué mostrar:**
1. **Documentación automática Swagger**
   - "Como pueden ver, FastAPI genera automáticamente documentación interactiva"
   - Expandir algunos endpoints principales

2. **Health Check**
   - Ejecutar `GET /health`
   - Mostrar respuesta con estado del sistema

3. **Endpoints principales**
   - Mostrar estructura de endpoints por categoría
   - Explicar autenticación JWT
   - "Todos los endpoints están protegidos con autenticación excepto el e-commerce público"

**Qué decir:**
"El backend está desarrollado con FastAPI, que es un framework moderno de Python. Como pueden ver, tenemos endpoints organizados por funcionalidad: autenticación, productos, ventas, usuarios, etc. La documentación se genera automáticamente y permite probar los endpoints directamente desde aquí."

### 3. Demostración POS Admin (12 minutos)

#### 3.1 Login y Dashboard (2 minutos)
**URL:** http://localhost:3000

**Acciones:**
1. Mostrar pantalla de login
2. Ingresar credenciales: `admin` / `admin123`
3. Mostrar dashboard principal

**Qué decir:**
"Empezamos con el login. El sistema maneja diferentes roles de usuario. Voy a ingresar como administrador para tener acceso completo."

"Aquí vemos el dashboard principal con métricas en tiempo real: ventas del día, productos con stock bajo, gráficos de ventas por hora, etc."

#### 3.2 Gestión de Productos (3 minutos)
**Navegación:** Dashboard → Inventario

**Acciones:**
1. Mostrar lista de productos
2. Crear un producto nuevo:
   - Nombre: "Demo Producto Tesis"
   - SKU: "DPT001"
   - Precio: $2500
   - Stock: 10
   - Marcar "Mostrar en e-commerce"
3. Guardar producto
4. Mostrar producto creado en la lista

**Qué decir:**
"Aquí gestionamos el inventario. Puedo crear, editar y eliminar productos. Una característica importante es que puedo marcar si un producto se muestra en el e-commerce, esto permite tener productos exclusivos para el POS."

#### 3.3 Escáner de Códigos de Barras (2 minutos)
**Navegación:** Ir a POS/Ventas

**Acciones:**
1. Activar escáner de códigos
2. Simular escaneo ingresando código manualmente
3. Mostrar cómo se agrega al carrito

**Qué decir:**
"Una funcionalidad clave es el escáner de códigos de barras. Utiliza la cámara del dispositivo para leer códigos. Si no hay cámara disponible, se puede ingresar manualmente."

#### 3.4 Proceso de Venta Completo (3 minutos)
**Continuar en POS/Ventas**

**Acciones:**
1. Agregar 2-3 productos al carrito
2. Abrir carrito flotante
3. Modificar cantidades
4. Proceder al checkout
5. Ingresar datos del cliente:
   - Nombre: "Cliente Demo Tesis"
   - Email: "demo@tesis.com"
6. Seleccionar método de pago: "Efectivo"
7. Confirmar venta
8. Mostrar comprobante generado

**Qué decir:**
"Ahora voy a realizar una venta completa. Agrego productos al carrito, puedo modificar cantidades, ingreso datos del cliente y proceso la venta. El sistema genera automáticamente un número de venta y actualiza el stock."

#### 3.5 Reportes en Tiempo Real (2 minutos)
**Navegación:** Ir a Reportes

**Acciones:**
1. Mostrar dashboard actualizado con la venta recién realizada
2. Mostrar gráficos de ventas
3. Explicar métricas mostradas

**Qué decir:**
"Los reportes se actualizan en tiempo real. Como pueden ver, la venta que acabamos de realizar ya aparece reflejada en las estadísticas del día."

### 4. Demostración E-commerce (8 minutos)

#### 4.1 Navegación de Cliente (3 minutos)
**URL:** http://localhost:3001

**Acciones:**
1. Mostrar homepage con banners
2. Navegar a productos
3. Mostrar catálogo de productos
4. Filtrar por categoría
5. Buscar producto específico

**Qué decir:**
"Ahora vemos el e-commerce desde la perspectiva del cliente. La página está optimizada para móviles y muestra solo los productos que están marcados para e-commerce. Los productos y stock se sincronizan automáticamente con el POS."

#### 4.2 Detalle de Producto y Variantes (2 minutos)
**Acciones:**
1. Hacer clic en un producto con tallas
2. Mostrar opciones de talla y color
3. Verificar stock por talla
4. Explicar validación de stock en tiempo real

**Qué decir:**
"Cuando el cliente selecciona un producto, puede elegir talla y color. El sistema valida en tiempo real la disponibilidad antes de permitir agregar al carrito."

#### 4.3 Proceso de Compra E-commerce (3 minutos)
**Acciones:**
1. Agregar producto al carrito
2. Ir al carrito
3. Modificar cantidad
4. Proceder al checkout
5. Ingresar datos del cliente:
   - Nombre: "Cliente E-commerce"
   - Email: "cliente@ecommerce.com" 
   - Teléfono: "11-1234-5678"
6. Confirmar pedido
7. Mostrar redirección a WhatsApp
8. Mostrar mensaje pre-formateado

**Qué decir:**
"El proceso de compra es simple: el cliente agrega productos, ingresa sus datos y confirma el pedido. El sistema crea automáticamente una venta en el POS y redirige a WhatsApp para coordinación de entrega."

### 5. Demostración de Integración en Tiempo Real (3 minutos)

#### 5.1 Sincronización entre Sistemas
**Preparar dos ventanas:**
- POS Admin (dashboard de reportes)
- E-commerce (algún producto)

**Acciones:**
1. Realizar una compra en e-commerce
2. Mostrar inmediatamente cómo aparece en POS Admin
3. Ir a la sección de ventas en POS
4. Mostrar la venta e-commerce creada con `sale_type: 'ECOMMERCE'`
5. Verificar actualización de stock

**Qué decir:**
"Esta es la parte más importante: la integración. Cuando se realiza una compra en e-commerce, automáticamente se crea una venta en el sistema POS, se actualiza el stock y aparece en los reportes en tiempo real."

#### 5.2 Notificaciones WebSocket (si funciona)
**Acciones:**
1. Abrir dos pestañas del POS con diferentes usuarios
2. Realizar una acción en una (ej: stock bajo)
3. Mostrar notificación en la otra

**Qué decir:**
"El sistema también tiene notificaciones en tiempo real usando WebSockets. Esto permite que los gerentes reciban alertas inmediatas de stock bajo, nuevas ventas, etc."

## Preguntas Frecuentes y Respuestas

### Técnicas

**P: "¿Por qué eligieron FastAPI en lugar de Django o Flask?"**
R: "FastAPI ofrece varias ventajas: documentación automática, validación de tipos con Pydantic, performance superior, y soporte nativo para async/await. Además, la documentación interactiva facilita el desarrollo del frontend."

**P: "¿Cómo manejan la consistencia de datos entre POS y e-commerce?"**
R: "Utilizamos una sola base de datos PostgreSQL para ambos sistemas. Las transacciones garantizan consistencia, y WebSockets mantienen la sincronización en tiempo real. También implementamos validaciones dobles de stock."

**P: "¿Qué pasa si se cae la conexión a internet?"**
R: "El POS puede operar offline temporalmente, guardando ventas localmente y sincronizando cuando se restablece la conexión. El e-commerce tiene datos estáticos de fallback para funcionar sin backend."

### Funcionales

**P: "¿El sistema soporta múltiples sucursales?"**
R: "Sí, está diseñado para multisucursales. Cada usuario está asignado a una sucursal, los reportes se pueden filtrar por sucursal, y se mantiene trazabilidad de todas las operaciones."

**P: "¿Cómo se integra con sistemas de pago?"**
R: "Actualmente soporta efectivo, tarjeta y transferencia como métodos. La arquitectura permite agregar integraciones con procesadores de pago como MercadoPago o PayPal."

**P: "¿Qué medidas de seguridad implementaron?"**
R: "Utilizamos JWT para autenticación, HTTPS para comunicaciones, validación de entrada con Pydantic, control de acceso basado en roles, y encriptación de contraseñas con bcrypt."

## Plan de Contingencia

### Si algo no funciona:

1. **Backend no responde:**
   - Mostrar código fuente del endpoint problemático
   - Explicar la lógica sin ejecutar

2. **E-commerce no carga:**
   - Mostrar código del componente React
   - Explicar la arquitectura de componentes

3. **WebSockets no funcionan:**
   - Omitir demostración en tiempo real
   - Explicar conceptualmente cómo funciona

4. **Base de datos con problemas:**
   - Mostrar schemas y modelos de SQLAlchemy
   - Explicar relaciones entre entidades

## Cierre de la Presentación (2 minutos)

**Qué decir:**
"En resumen, POS Cesariel es un sistema completo que demuestra:

1. **Integración real** entre múltiples tecnologías modernas
2. **Solución a problemas reales** de negocio
3. **Arquitectura escalable** preparada para crecimiento
4. **Experiencia de usuario** optimizada tanto para empleados como clientes
5. **Código de calidad** con documentación, tests y buenas prácticas

El proyecto representa la aplicación práctica de todos los conocimientos adquiridos en la carrera, desde análisis de requerimientos hasta implementación y testing.

¿Tienen alguna pregunta?"

## Checklist Final

### Antes de la presentación:
- [ ] Probar demo completa al menos 2 veces
- [ ] Verificar que todos los datos de prueba estén cargados
- [ ] Preparar respuestas para preguntas técnicas comunes
- [ ] Tener backup de screenshots por si algo falla
- [ ] Verificar que proyector/pantalla funcione correctamente

### Durante la presentación:
- [ ] Hablar claro y pausado
- [ ] Explicar qué estoy haciendo antes de hacerlo
- [ ] Mantener contacto visual con la audiencia
- [ ] Manejar errores con calma si ocurren
- [ ] Ser entusiasta sobre el proyecto

### Tiempo total: 30 minutos (25 minutos demo + 5 minutos preguntas)