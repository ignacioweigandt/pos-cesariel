"""
Enumeraciones del sistema POS Cesariel.

Este módulo centraliza todas las enumeraciones utilizadas en los modelos
de base de datos para garantizar:
    - Valores categóricos consistentes en toda la aplicación
    - Validación automática a nivel de base de datos
    - Type safety en Python con type hints
    - Documentación centralizada de valores permitidos

Ventajas de usar Enums:
    - PostgreSQL valida valores en columnas ENUM automáticamente
    - IDEs proveen autocompletado de valores válidos
    - Previene typos y valores incorrectos
    - Facilita refactoring (cambiar valores en un solo lugar)
    - Mejora legibilidad del código (UserRole.ADMIN vs "ADMIN")

Uso en modelos:
    from app.models.enums import UserRole
    
    class User(Base):
        role = Column(Enum(UserRole), nullable=False)

Uso en código:
    if user.role == UserRole.ADMIN:
        # Lógica para admin
        pass

Note:
    Estos enums se almacenan en PostgreSQL como tipo ENUM nativo,
    no como strings, lo que mejora performance y validación.
"""

import enum


class UserRole(enum.Enum):
    """
    Roles de usuario que definen permisos y acceso al sistema.
    
    Sistema de control de acceso basado en roles (RBAC - Role-Based Access Control)
    donde cada rol tiene permisos específicos y scope de operación definido.
    
    Jerarquía de permisos (de mayor a menor):
        ADMIN > MANAGER > SELLER > ECOMMERCE
    
    Valores:
        ADMIN: Administrador del sistema
            - Acceso completo multisucursal
            - Gestión de usuarios y roles en todas las sucursales
            - Configuración global del sistema
            - Reportes consolidados de todas las sucursales
            - Gestión de sucursales (crear, editar, eliminar)
            - Configuración de impuestos, métodos de pago, moneda
            - Auditoría y logs del sistema
            
        MANAGER: Gerente de sucursal
            - Acceso limitado a su sucursal asignada
            - Gestión de usuarios de su sucursal
            - Gestión completa de inventario de su sucursal
            - Reportes avanzados de su sucursal
            - Configuración de productos y precios
            - Aprobación de devoluciones y ajustes de stock
            - No puede ver/modificar otras sucursales
            
        SELLER: Vendedor de punto de venta
            - Acceso limitado a operaciones de venta
            - Registrar ventas en su sucursal
            - Consultar stock de su sucursal
            - Ajustes simples de inventario (con límites)
            - Ver historial de sus propias ventas
            - No puede gestionar usuarios ni configuración
            
        ECOMMERCE: Usuario de tienda online (frontend público)
            - Acceso solo a API pública de e-commerce
            - Consultar catálogo de productos
            - Gestionar carrito de compras
            - Realizar pedidos online
            - Ver estado de sus pedidos
            - Sin acceso al panel administrativo
    
    Casos de uso:
        # Validar rol en endpoint
        @router.get("/admin-only")
        def admin_endpoint(user: User = Depends(require_admin)):
            if user.role != UserRole.ADMIN:
                raise HTTPException(403, "Admin access required")
        
        # Filtrar datos según rol
        if current_user.role == UserRole.ADMIN:
            # Ver todas las sucursales
            branches = db.query(Branch).all()
        else:
            # Ver solo su sucursal
            branches = db.query(Branch).filter(
                Branch.id == current_user.branch_id
            ).all()
    
    Database:
        Stored as: PostgreSQL ENUM type
        Column type: Enum(UserRole)
        Example value in DB: 'ADMIN', 'MANAGER', 'SELLER', 'ECOMMERCE'
    """
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SELLER = "SELLER"
    ECOMMERCE = "ECOMMERCE"


class SaleType(enum.Enum):
    """
    Tipo de canal de venta donde se originó la transacción.
    
    Permite diferenciar ventas según su canal de origen para:
        - Reportes segmentados por canal
        - Métricas de performance por canal
        - Estrategias de inventario diferenciadas
        - Comisiones diferenciadas por canal
        - Análisis de rentabilidad por canal
    
    Valores:
        POS: Venta en punto de venta físico
            - Transacción presencial en sucursal
            - Pago inmediato (efectivo, tarjeta en el momento)
            - Entrega inmediata del producto
            - Atención por vendedor (UserRole.SELLER)
            - Stock descontado automáticamente de la sucursal
            - Sin costo de envío
            - Ejemplo: Cliente compra en tienda física
            
        ECOMMERCE: Venta online a través del e-commerce
            - Transacción remota vía web
            - Pago online (MercadoPago, transferencia)
            - Requiere preparación y envío
            - Sin interacción con vendedor
            - Stock reservado hasta confirmación de pago
            - Costo de envío aplicado
            - Estados de orden (PENDING → PROCESSING → SHIPPED → DELIVERED)
            - Ejemplo: Cliente compra desde la tienda online
        
        WHATSAPP (futuro): Venta por WhatsApp Business
            - Transacción vía chat
            - Pago coordinado (efectivo, transferencia)
            - Entrega coordinada (envío o retiro)
            - Atención personalizada
            - Registro manual de venta en sistema
    
    Uso en reportes:
        # Ventas por canal
        pos_sales = db.query(Sale).filter(Sale.sale_type == SaleType.POS).count()
        ecommerce_sales = db.query(Sale).filter(Sale.sale_type == SaleType.ECOMMERCE).count()
        
        # Comparar rentabilidad
        pos_revenue = db.query(func.sum(Sale.total_amount)).filter(
            Sale.sale_type == SaleType.POS
        ).scalar()
    
    Business rules:
        - Ventas POS no tienen order_status (son instantáneas)
        - Ventas ECOMMERCE requieren order_status obligatorio
        - Stock de POS se descuenta inmediatamente
        - Stock de ECOMMERCE se reserva hasta pago confirmado
    
    Database:
        Stored as: PostgreSQL ENUM type
        Column type: Enum(SaleType)
        Default: SaleType.POS (si no se especifica)
        Example value in DB: 'POS', 'ECOMMERCE'
    """
    POS = "POS"
    ECOMMERCE = "ECOMMERCE"
    # WHATSAPP = "WHATSAPP"  # Uncomment cuando se implemente


class OrderStatus(enum.Enum):
    """
    Estado actual de una orden de e-commerce en su ciclo de vida.
    
    Aplica SOLO a ventas de tipo SaleType.ECOMMERCE.
    Las ventas POS no tienen order_status porque son instantáneas.
    
    Flujo típico de una orden:
        PENDING → PROCESSING → SHIPPED → DELIVERED
        
        O en caso de cancelación:
        PENDING → CANCELLED
        PROCESSING → CANCELLED
    
    Valores:
        PENDING: Orden creada, esperando confirmación
            - Cliente completó checkout
            - Esperando confirmación de pago
            - Stock reservado pero no descontado
            - Cliente puede cancelar libremente
            - Notificación enviada al admin
            - Tiempo máximo: 24-48 horas antes de auto-cancelar
            - Acciones disponibles: Confirmar pago, Cancelar
            
        PROCESSING: Orden confirmada, en preparación
            - Pago confirmado y acreditado
            - Stock descontado del inventario
            - Productos siendo preparados para envío
            - Factura/comprobante generado
            - Cliente puede solicitar cancelación (requiere aprobación)
            - Notificación de confirmación enviada al cliente
            - Acciones disponibles: Marcar como enviado, Cancelar con reembolso
            
        SHIPPED: Orden enviada al cliente
            - Paquete despachado con courier/correo
            - Número de tracking asignado
            - Cliente notificado con tracking info
            - En tránsito hacia destino
            - Cancelación requiere proceso de devolución
            - Tiempo estimado de entrega comunicado
            - Acciones disponibles: Marcar como entregado, Gestionar devolución
            
        DELIVERED: Orden entregada exitosamente
            - Cliente recibió el pedido
            - Confirmación de entrega (firma, foto, código)
            - Transacción completada
            - Plazo para devolución/cambio activo (7-15 días según política)
            - Stock ya descontado (no reversible sin devolución formal)
            - Acciones disponibles: Solicitar review, Gestionar devolución post-venta
            
        CANCELLED: Orden cancelada
            - Cancelado por cliente o admin
            - Stock revertido al inventario (si estaba descontado)
            - Reembolso procesado (si hubo pago)
            - No se puede reactivar (crear nueva orden)
            - Registrar motivo de cancelación para analytics
            - Impacto en métricas de conversión
            - Acciones disponibles: Ver historial, Crear nueva orden
    
    Transiciones válidas:
        PENDING → PROCESSING (pago confirmado)
        PENDING → CANCELLED (timeout o cancelación temprana)
        PROCESSING → SHIPPED (despachado)
        PROCESSING → CANCELLED (cancelación con reembolso)
        SHIPPED → DELIVERED (entrega confirmada)
        SHIPPED → CANCELLED (devolución en tránsito - raro)
        DELIVERED → (estado final, no cambia)
        CANCELLED → (estado final, no cambia)
    
    Reglas de negocio:
        - Solo aplicable a Sale.sale_type == SaleType.ECOMMERCE
        - Sale.sale_type == SaleType.POS debe tener order_status = NULL
        - Cada cambio de estado debe registrarse en audit log
        - Notificaciones automáticas en cada transición
        - Reversión de stock solo en cancelaciones desde PROCESSING+
    
    Ejemplo de uso:
        # Actualizar estado de orden
        order = db.query(Sale).filter(Sale.id == order_id).first()
        
        if order.order_status == OrderStatus.PENDING:
            # Confirmar pago
            order.order_status = OrderStatus.PROCESSING
            # Descontar stock
            adjust_stock(order.items, operation="subtract")
            # Notificar cliente
            send_notification(order.customer_email, "order_confirmed")
        
        # Filtrar ordenes por estado
        pending_orders = db.query(Sale).filter(
            Sale.sale_type == SaleType.ECOMMERCE,
            Sale.order_status == OrderStatus.PENDING
        ).all()
    
    Métricas importantes:
        - Tasa de conversión: PENDING → PROCESSING (cuántos pagan)
        - Tiempo promedio en PROCESSING (eficiencia de preparación)
        - Tasa de CANCELLED en cada etapa (donde se pierden ventas)
        - Tiempo SHIPPED → DELIVERED (performance de logística)
    
    Database:
        Stored as: PostgreSQL ENUM type
        Column type: Enum(OrderStatus), nullable=True (NULL para POS sales)
        Index: Useful for querying orders by status
        Example value in DB: 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    """
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


# ===== METADATA Y VALIDACIONES =====

# Mapeo de roles a permisos legibles para UI
ROLE_DISPLAY_NAMES = {
    UserRole.ADMIN: "Administrador",
    UserRole.MANAGER: "Gerente",
    UserRole.SELLER: "Vendedor",
    UserRole.ECOMMERCE: "Cliente E-commerce"
}

# Mapeo de estados de orden a descripciones para cliente
ORDER_STATUS_DISPLAY = {
    OrderStatus.PENDING: "Pendiente de pago",
    OrderStatus.PROCESSING: "En preparación",
    OrderStatus.SHIPPED: "En camino",
    OrderStatus.DELIVERED: "Entregada",
    OrderStatus.CANCELLED: "Cancelada"
}

# Transiciones válidas de OrderStatus (para validación)
VALID_ORDER_TRANSITIONS = {
    OrderStatus.PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    OrderStatus.PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    OrderStatus.SHIPPED: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    OrderStatus.DELIVERED: [],  # Estado final
    OrderStatus.CANCELLED: []   # Estado final
}


def can_transition_order_status(current: OrderStatus, target: OrderStatus) -> bool:
    """
    Valida si una transición de estado de orden es permitida.
    
    Args:
        current: Estado actual de la orden
        target: Estado objetivo deseado
    
    Returns:
        bool: True si la transición es válida, False en caso contrario
    
    Example:
        >>> can_transition_order_status(OrderStatus.PENDING, OrderStatus.PROCESSING)
        True
        >>> can_transition_order_status(OrderStatus.DELIVERED, OrderStatus.SHIPPED)
        False
    """
    return target in VALID_ORDER_TRANSITIONS.get(current, [])
