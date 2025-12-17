# Sistema de Impresión Térmica para POS

## Descripción General

Sistema completo de impresión de tickets para impresoras térmicas de 80mm integrado en el módulo POS. El sistema genera tickets de venta profesionales optimizados para impresión térmica.

## Características

### ✅ Ticket Térmico Profesional
- **Formato 80mm**: Optimizado para impresoras térmicas estándar
- **Fuente Monoespaciada**: Alineación perfecta de columnas
- **Alto Contraste**: Óptimo para impresión térmica
- **Layout Completo**:
  - Encabezado con datos del negocio
  - Número de ticket y fecha
  - Información del vendedor y cliente
  - Detalle de productos con cantidades y precios
  - Totales (subtotal, IVA, descuentos)
  - Método de pago
  - Mensaje de agradecimiento
  - Número de venta como código de barras simulado

### ✅ Integración con POS
- **Botón de Impresión**: Integrado en modal de venta exitosa
- **Estado de Impresión**: Indicador visual durante el proceso
- **Impresión Condicional**: Solo se muestra para ventas exitosas
- **Print API del Navegador**: Usa window.print() nativo

### ✅ CSS Optimizado para Impresión
- **@media print**: Estilos específicos solo para impresión
- **Tamaño de Página**: 80mm de ancho, altura automática
- **Sin Márgenes**: Maximiza el uso del papel térmico
- **Oculto en Pantalla**: El ticket no interfiere con la UI

## Estructura de Archivos

```
frontend/pos-cesariel/features/pos/
├── components/
│   ├── ThermalTicket.tsx          # Componente del ticket térmico
│   └── Modals/
│       └── SaleSuccessModal.tsx   # Modal con botón de impresión
├── styles/
│   └── thermal-ticket.css         # Estilos para impresión térmica
└── utils/
    └── printTicket.ts             # Utilidades de impresión
```

## Uso

### 1. El Sistema se Activa Automáticamente

Cuando se completa una venta en el POS, el modal de éxito muestra un botón "Imprimir":

```tsx
// El usuario completa una venta
// Se muestra SaleSuccessModal con los datos de la venta
// Aparece el botón "Imprimir" en el footer del modal
```

### 2. Impresión del Ticket

```tsx
// Al hacer clic en "Imprimir":
// 1. Se renderiza el ThermalTicket (oculto en pantalla)
// 2. Se invoca window.print()
// 3. El navegador abre el diálogo de impresión
// 4. Solo el ticket se envía a la impresora
```

### 3. Configuración de la Impresora

**En el Diálogo de Impresión del Navegador:**
- Seleccionar impresora térmica
- Configurar tamaño de papel: 80mm o "Custom"
- Márgenes: Sin márgenes (0mm)
- Escala: 100%

## Componentes

### ThermalTicket

Componente React que renderiza el ticket térmico:

```tsx
<ThermalTicket
  saleData={{
    saleId: 123,
    saleNumber: "V-2025-00123",
    customerName: "Cliente",
    totalAmount: 15000,
    subtotal: 13500,
    tax: 1500,
    discount: 0,
    items: [
      { name: "Remera XL", quantity: 2, price: 5000, size: "XL" },
      { name: "Pantalón M", quantity: 1, price: 3500, size: "M" }
    ],
    paymentMethod: "CARD",
    cardType: "Visa",
    installments: 3
  }}
  branchName="POS Cesariel"
  branchAddress="Av. Principal 123"
  branchPhone="(011) 4444-5555"
  sellerName="Juan Pérez"
/>
```

### Utilidades de Impresión

```tsx
import { printThermalTicket, isPrintSupported } from '@/features/pos';

// Verificar soporte
if (isPrintSupported()) {
  // Imprimir ticket
  printThermalTicket();
}

// Con callbacks
printThermalTicket(
  () => console.log('Iniciando impresión...'),
  () => console.log('Impresión completada')
);
```

## Formato del Ticket

```
==========================================
         POS Cesariel
      Av. Principal 123
     Tel: (011) 4444-5555
==========================================
TICKET NO: V-2025-00123
FECHA: 13/11/2025 10:30:45
VENDEDOR: Juan Pérez
CLIENTE: María González
==========================================
DESCRIPCION                     IMPORTE
CANT x PRECIO
------------------------------------------
Remera XL                        $10.000
2 x $5.000

Pantalón M                        $3.500
1 x $3.500
==========================================
SUBTOTAL:                        $13.500
IVA:                              $1.500
TOTAL:                           $15.000
------------------------------------------
FORMA DE PAGO:              Visa 3x
==========================================
      ¡GRACIAS POR SU COMPRA!
      www.poscesariel.com

        V-2025-00123
```

## Especificaciones Técnicas

### Dimensiones
- **Ancho**: 80mm (302px a 96dpi)
- **Alto**: Automático según contenido
- **Márgenes**: 2mm lateral, 5mm superior/inferior

### Tipografía
- **Fuente**: Courier New (monoespaciada)
- **Tamaños**:
  - Header: 12pt (bold)
  - Normal: 9pt
  - Small: 8pt
  - Totales: 10pt (bold)

### Caracteres por Línea
- **42 caracteres**: Alineación perfecta en 80mm
- Permite formateo con espacios para columnas

### Compatibilidad
- ✅ Impresoras térmicas 80mm (POS estándar)
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Windows, macOS, Linux
- ✅ Tablets y dispositivos móviles

## Personalización

### Modificar Información del Negocio

Editar en `POSContainer.tsx` al renderizar `ThermalTicket`:

```tsx
<ThermalTicket
  saleData={saleData}
  branchName="Tu Negocio"
  branchAddress="Tu Dirección"
  branchPhone="Tu Teléfono"
  sellerName={user?.full_name || "Vendedor"}
/>
```

### Modificar Estilos

Editar `thermal-ticket.css`:

```css
/* Cambiar tamaño de fuente */
.ticket-content {
  font-size: 10pt; /* Aumentar de 9pt a 10pt */
}

/* Cambiar ancho (para impresoras 58mm) */
@page {
  size: 58mm auto; /* En lugar de 80mm */
}
```

### Agregar Logo

En `ThermalTicket.tsx`, agregar antes del header:

```tsx
<div className="text-center mb-2">
  <img
    src="/logo.png"
    alt="Logo"
    style={{ width: '120px', margin: '0 auto' }}
  />
</div>
```

## Troubleshooting

### El ticket no se imprime correctamente

**Problema**: Ticket cortado o mal formateado
**Solución**:
- Verificar configuración de impresora (80mm, sin márgenes)
- Ajustar escala a 100%
- Verificar drivers de impresora actualizados

### Texto desalineado

**Problema**: Columnas no se alinean correctamente
**Solución**:
- Verificar que la fuente sea monoespaciada (Courier New)
- Revisar que el ancho sea exactamente 42 caracteres
- Verificar función `formatLine()` en el componente

### El botón de impresión no aparece

**Problema**: No se ve el botón "Imprimir"
**Solución**:
- Verificar que la venta sea exitosa (sin errores)
- Verificar que `saleData.error` sea `undefined`
- Revisar console del navegador para errores

### Vista previa en pantalla

Para ver el ticket en pantalla (desarrollo):

```tsx
<ThermalTicket
  saleData={...}
  className="preview-mode"  // Agregar esta clase
/>
```

## Testing

### Prueba Manual

1. Levantar el entorno: `make dev-pos`
2. Ir a POS: http://localhost:3000/pos
3. Agregar productos al carrito
4. Procesar una venta
5. Click en "Imprimir" en el modal de éxito
6. Verificar preview de impresión

### Prueba con Impresora Real

1. Conectar impresora térmica USB
2. Instalar drivers del fabricante
3. Configurar como impresora predeterminada
4. Realizar venta de prueba
5. Imprimir ticket
6. Verificar calidad y formato

## Ventajas del Sistema

✅ **Sin Librerías Externas**: Usa APIs nativas del navegador
✅ **Sin Backend**: Impresión 100% en frontend
✅ **Responsive**: Funciona en cualquier dispositivo
✅ **Profesional**: Formato estándar de tickets de comercio
✅ **Rápido**: Impresión instantánea sin procesamiento
✅ **Compatible**: Funciona con cualquier impresora térmica
✅ **Mantenible**: Código limpio y bien documentado

## Mejoras Futuras

- [ ] Soporte para impresoras de 58mm
- [ ] Integración con ESC/POS para control directo
- [ ] Impresión automática post-venta (opcional)
- [ ] Códigos de barras reales con bibliotecas
- [ ] Múltiples idiomas
- [ ] Plantillas personalizables por usuario
- [ ] Impresión de duplicados
- [ ] Historial de tickets impresos

## Referencias

- [Window.print() API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/print)
- [CSS Print Styles - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/print)
- [Thermal Printer Standards - ESC/POS](https://en.wikipedia.org/wiki/ESC/P)

---

**Desarrollado para**: POS Cesariel
**Versión**: 1.0.0
**Fecha**: Noviembre 2025
