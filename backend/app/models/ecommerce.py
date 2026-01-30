"""
Modelos de e-commerce para POS Cesariel.

Este módulo contiene todos los modelos relacionados con la tienda online,
incluyendo configuración general, banners promocionales e imágenes de productos.

Arquitectura de e-commerce:
    ┌─────────────────────────────────────────┐
    │  EcommerceConfig (singleton)            │
    │  - Configuración general de la tienda   │
    │  - Nombre, logo, contacto               │
    │  - Impuestos y moneda                   │
    └─────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────┐
    │  StoreBanner (múltiples)                │
    │  - Banners del carrusel homepage        │
    │  - Imágenes promocionales               │
    │  - Ordenados por banner_order           │
    └─────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────┐
    │  ProductImage (múltiples por producto)  │
    │  - Galería de imágenes de producto      │
    │  - Una imagen principal (is_main=True)  │
    │  - Ordenadas por image_order            │
    └─────────────────────────────────────────┘

Flujo de e-commerce:
    1. Cliente navega productos filtrados por show_in_ecommerce=True
    2. Ve imágenes de ProductImage (galería)
    3. Agrega al carrito
    4. Checkout con datos de EcommerceConfig (impuestos, moneda)
    5. Genera Sale con sale_type=ECOMMERCE
    6. Admin gestiona orden según order_status

Modelos:
    - EcommerceConfig: Configuración general de la tienda
    - StoreBanner: Banners promocionales del homepage
    - ProductImage: Imágenes adicionales de productos

See Also:
    - app/models/product.py: Product (show_in_ecommerce flag)
    - app/models/sales.py: Sale (sale_type=ECOMMERCE)
    - routers/ecommerce_public.py: API pública sin auth
    - routers/ecommerce_advanced.py: API admin con auth
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class EcommerceConfig(Base):
    """
    Configuración general de la tienda online (singleton pattern).
    
    Este modelo almacena toda la configuración necesaria para operar
    la tienda online: branding, contacto, impuestos y moneda.
    
    Patrón singleton:
        Debe existir SOLO UNA fila en esta tabla.
        Al inicializar el sistema, crear con id=1.
        Para editar, actualizar ese registro, NO crear nuevos.
    
    Uso en frontend e-commerce:
        - Mostrar store_name y store_logo en header
        - Usar contact_email y contact_phone en footer
        - Aplicar tax_percentage en checkout
        - Formatear precios con currency
        - Mostrar address en página de contacto
    
    Attributes:
        id (int): Identificador único (siempre 1)
        store_name (str): Nombre de la tienda para header y SEO
        store_description (str): Descripción para meta tags y presentación
        store_logo (str): URL del logo (Cloudinary)
        contact_email (str): Email de atención al cliente
        contact_phone (str): Teléfono de atención al cliente
        address (str): Dirección física para retiros y contacto
        is_active (bool): Flag para habilitar/deshabilitar e-commerce
        tax_percentage (Decimal): % de impuesto por defecto (IVA, etc.)
        currency (str): Código de moneda ISO 4217 (USD, ARS, EUR, etc.)
        created_at (datetime): Timestamp de creación
        updated_at (datetime): Timestamp de última modificación
    
    Business Rules:
        - DEBE existir exactamente UN registro con id=1
        - store_name obligatorio para mostrar en header
        - contact_email obligatorio para notificaciones
        - tax_percentage usado en cálculo de totales de venta
        - is_active=False deshabilita toda la tienda online
        - currency afecta formateo de precios en frontend
    
    Relación con ventas:
        # Al crear venta e-commerce, usar config actual
        config = db.query(EcommerceConfig).first()
        
        sale = Sale(
            sale_type=SaleType.ECOMMERCE,
            tax_rate_percentage=config.tax_percentage,
            # ... resto de campos
        )
    
    Inicialización:
        # Crear configuración inicial
        config = EcommerceConfig(
            id=1,  # IMPORTANTE: Siempre id=1 (singleton)
            store_name="Mi Tienda Online",
            store_description="Venta de ropa y calzado",
            contact_email="contacto@mitienda.com",
            contact_phone="+5491112345678",
            address="Av. Principal 123, Ciudad",
            tax_percentage=21.00,  # IVA 21%
            currency="ARS",
            is_active=True
        )
        db.add(config)
        db.commit()
    
    Edición:
        # Actualizar configuración existente (NO crear nueva)
        config = db.query(EcommerceConfig).first()
        if config:
            config.store_name = "Nuevo Nombre"
            config.tax_percentage = 10.50
            db.commit()
        else:
            # Primera vez, crear
            config = EcommerceConfig(id=1, ...)
            db.add(config)
            db.commit()
    
    Example (Frontend):
        GET /ecommerce/config
        
        Response:
        {
            "store_name": "POS Cesariel Store",
            "store_logo": "https://cloudinary.com/...",
            "contact_email": "ventas@poscesariel.com",
            "contact_phone": "+5491165551234",
            "tax_percentage": 21.00,
            "currency": "ARS"
        }
    
    Validaciones:
        - tax_percentage debe estar entre 0 y 100
        - currency debe ser código ISO 4217 válido
        - contact_email debe ser email válido
        - store_logo debe ser URL válida
    
    See Also:
        - routers/ecommerce_public.py: Endpoint GET /ecommerce/config
        - frontend/ecommerce/app/lib/data-service.ts: Uso en cliente
    """
    __tablename__ = "ecommerce_config"
    
    # ===== IDENTIFICACIÓN (SINGLETON) =====
    
    id = Column(
        Integer, 
        primary_key=True,
        doc="Identificador único. DEBE ser siempre 1 (singleton pattern)"
    )
    
    # ===== BRANDING =====
    
    store_name = Column(
        String(100), 
        nullable=False,
        doc="Nombre de la tienda mostrado en header, título de página y emails"
    )
    
    store_description = Column(
        Text,
        doc="Descripción de la tienda para meta description (SEO) y página About Us"
    )
    
    store_logo = Column(
        String(255),
        doc="URL del logo de la tienda (Cloudinary). Usado en header y emails"
    )
    
    # ===== INFORMACIÓN DE CONTACTO =====
    
    contact_email = Column(
        String(100),
        nullable=False,  # Obligatorio para notificaciones
        doc="Email de atención al cliente. Usado para: "
            "- Responder consultas "
            "- Notificaciones de pedidos "
            "- Footer del sitio"
    )
    
    contact_phone = Column(
        String(20),
        doc="Teléfono de atención al cliente. Formato: +5491112345678 (con código país)"
    )
    
    address = Column(
        String(200),
        doc="Dirección física de la tienda. Usado para: "
            "- Retiro en tienda "
            "- Página de contacto "
            "- Footer del sitio"
    )
    
    # ===== CONFIGURACIÓN FINANCIERA =====
    
    tax_percentage = Column(
        Numeric(5, 2),  # Hasta 999.99%
        default=0,
        doc="Porcentaje de impuesto por defecto (ej: 21.00 para IVA 21%). "
            "Se aplica en checkout: total = subtotal * (1 + tax_percentage/100)"
    )
    
    currency = Column(
        String(10), 
        default="USD",
        doc="Código de moneda ISO 4217 (USD, ARS, EUR, BRL, etc.). "
            "Afecta símbolo mostrado: USD=$, ARS=$, EUR=€"
    )
    
    # ===== ESTADO =====
    
    is_active = Column(
        Boolean, 
        default=True,
        doc="Flag maestro de activación del e-commerce. "
            "False = Deshabilita toda la tienda (mostrar página de mantenimiento)"
    )
    
    # ===== AUDITORÍA =====
    
    created_at = Column(
        DateTime, 
        default=func.now(),
        doc="Timestamp de creación de la configuración inicial"
    )
    
    updated_at = Column(
        DateTime, 
        default=func.now(), 
        onupdate=func.now(),
        doc="Timestamp de última modificación de la configuración"
    )
    
    # ===== MÉTODOS DE NEGOCIO =====
    
    @classmethod
    def get_config(cls, db):
        """
        Obtiene la configuración singleton (crea si no existe).
        
        Args:
            db: Sesión de base de datos
        
        Returns:
            EcommerceConfig: Configuración actual o nueva con defaults
        
        Example:
            >>> config = EcommerceConfig.get_config(db)
            >>> print(config.store_name)
        """
        config = db.query(cls).first()
        if not config:
            # Primera vez, crear con defaults
            config = cls(
                id=1,
                store_name="Mi Tienda Online",
                contact_email="contacto@example.com",
                tax_percentage=0,
                currency="USD",
                is_active=True
            )
            db.add(config)
            db.commit()
            db.refresh(config)
        return config
    
    def calculate_tax(self, subtotal: float) -> float:
        """
        Calcula el monto de impuesto para un subtotal.
        
        Args:
            subtotal: Monto sin impuesto
        
        Returns:
            float: Monto de impuesto a aplicar
        
        Example:
            >>> config = EcommerceConfig(tax_percentage=21.00)
            >>> config.calculate_tax(1000.00)
            210.00
        """
        if not self.tax_percentage:
            return 0.0
        return subtotal * (float(self.tax_percentage) / 100)
    
    def format_price(self, amount: float) -> str:
        """
        Formatea un precio según la moneda configurada.
        
        Args:
            amount: Monto a formatear
        
        Returns:
            str: Precio formateado con símbolo de moneda
        
        Example:
            >>> config = EcommerceConfig(currency="ARS")
            >>> config.format_price(1500.50)
            "$1,500.50"
        """
        # TODO: Implementar formateo correcto según currency
        # Por ahora retorna formato simple
        return f"{self.currency} {amount:,.2f}"
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        return (
            f"<EcommerceConfig("
            f"store='{self.store_name}', "
            f"tax={self.tax_percentage}%, "
            f"currency={self.currency}, "
            f"active={self.is_active}"
            f")>"
        )


class StoreBanner(Base):
    """
    Banner promocional para el carrusel del homepage.
    
    Banners rotativos que se muestran en la página principal de la tienda
    para destacar productos, promociones o colecciones especiales.
    
    Carrusel de banners:
        - Se muestran ordenados por banner_order (ASC)
        - Solo banners con is_active=True se muestran
        - Típicamente 3-5 banners rotan automáticamente
        - Cada banner puede tener link a categoría/producto
    
    Attributes:
        id (int): Identificador único del banner
        title (str): Título principal del banner (máx. 200 caracteres)
        subtitle (str): Subtítulo o descripción (máx. 300 caracteres)
        image_url (str): URL de la imagen del banner (Cloudinary)
        link_url (str): URL de destino al hacer clic (opcional)
        button_text (str): Texto del botón call-to-action (ej: "Ver Más")
        banner_order (int): Orden de aparición (1, 2, 3, ...)
        is_active (bool): Flag para mostrar/ocultar banner
        created_at (datetime): Timestamp de creación
        updated_at (datetime): Timestamp de última modificación
    
    Business Rules:
        - banner_order determina secuencia en carrusel (menor primero)
        - Dos banners NO deben tener mismo banner_order
        - image_url debe ser imagen optimizada (1920x600px recomendado)
        - link_url puede ser interno (/products/123) o externo
        - is_active=False oculta el banner sin eliminarlo
    
    Casos de uso:
        - Promoción de temporada (Navidad, Black Friday)
        - Destacar nueva colección
        - Anunciar descuentos especiales
        - Mostrar productos destacados
    
    Example (Admin):
        # Crear banner de promoción
        banner = StoreBanner(
            title="Black Friday 50% OFF",
            subtitle="Descuentos increíbles en toda la tienda",
            image_url="https://cloudinary.com/banner-blackfriday.jpg",
            link_url="/products?discount=50",
            button_text="Comprar Ahora",
            banner_order=1,
            is_active=True
        )
        db.add(banner)
        db.commit()
    
    Example (Frontend):
        # Obtener banners activos para carrusel
        GET /ecommerce/banners
        
        Response:
        [
            {
                "id": 1,
                "title": "Black Friday 50% OFF",
                "subtitle": "Descuentos increíbles",
                "image_url": "https://...",
                "link_url": "/products?discount=50",
                "button_text": "Comprar Ahora",
                "order": 1
            },
            {
                "id": 2,
                "title": "Nueva Colección Verano",
                ...
            }
        ]
    
    Gestión de orden:
        # Reordenar banners
        banner1 = db.query(StoreBanner).filter(StoreBanner.id == 1).first()
        banner1.banner_order = 2
        
        banner2 = db.query(StoreBanner).filter(StoreBanner.id == 2).first()
        banner2.banner_order = 1
        
        db.commit()
    
    Validaciones:
        - title obligatorio (máx 200 chars)
        - image_url obligatorio y debe ser URL válida
        - banner_order debe ser > 0
        - button_text opcional pero recomendado para CTA
    
    See Also:
        - routers/content_management.py: CRUD de banners
        - frontend/ecommerce/components/Carousel.tsx: Carrusel
    """
    __tablename__ = "store_banners"
    
    # ===== IDENTIFICACIÓN =====
    
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        doc="Identificador único del banner"
    )
    
    # ===== CONTENIDO DEL BANNER =====
    
    title = Column(
        String(200), 
        nullable=False,
        doc="Título principal del banner. Texto grande visible en el banner. Max 200 caracteres"
    )
    
    subtitle = Column(
        String(300),
        doc="Subtítulo o descripción secundaria. Texto más pequeño debajo del título. Max 300 caracteres"
    )
    
    # ===== RECURSOS VISUALES =====
    
    image_url = Column(
        String(500), 
        nullable=False,
        doc="URL de la imagen del banner (Cloudinary). "
            "Dimensiones recomendadas: 1920x600px (desktop) y 800x600px (mobile)"
    )
    
    # ===== CALL TO ACTION =====
    
    link_url = Column(
        String(500),
        doc="URL de destino al hacer clic en el banner. "
            "Puede ser: /products/123, /categories/ropa, https://external.com"
    )
    
    button_text = Column(
        String(100),
        doc="Texto del botón call-to-action. Ej: 'Ver Más', 'Comprar Ahora', 'Descubrir'"
    )
    
    # ===== ORDENAMIENTO Y ESTADO =====
    
    banner_order = Column(
        Integer, 
        default=1,
        index=True,  # Índice para ordenar en queries
        doc="Orden de aparición en el carrusel (1 = primero, 2 = segundo, etc.). "
            "Banners se muestran ordenados por este campo ASC"
    )
    
    is_active = Column(
        Boolean, 
        default=True,
        index=True,  # Índice para filtrar activos
        doc="Flag para mostrar/ocultar banner sin eliminarlo. "
            "Solo banners con is_active=True se muestran en el carrusel"
    )
    
    # ===== AUDITORÍA =====
    
    created_at = Column(
        DateTime, 
        default=func.now(),
        doc="Timestamp de creación del banner"
    )
    
    updated_at = Column(
        DateTime, 
        default=func.now(), 
        onupdate=func.now(),
        doc="Timestamp de última modificación"
    )
    
    # ===== CONSTRAINTS DE TABLA =====
    
    __table_args__ = (
        {"extend_existing": True},
    )
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        return (
            f"<StoreBanner("
            f"id={self.id}, "
            f"title='{self.title}', "
            f"order={self.banner_order}, "
            f"active={self.is_active}"
            f")>"
        )


class ProductImage(Base):
    """
    Imagen adicional de producto para galería.
    
    Cada producto puede tener múltiples imágenes en una galería,
    además de la imagen principal (Product.image_url).
    
    Galería de producto:
        - Product.image_url: Imagen principal (miniatura, listados)
        - ProductImage: Galería completa (página de detalle)
        - Una imagen marcada como is_main=True (principal de galería)
        - Ordenadas por image_order para consistencia visual
    
    Attributes:
        id (int): Identificador único de la imagen
        product_id (int): ID del producto (FK → products.id)
        image_url (str): URL de la imagen (Cloudinary)
        image_order (int): Orden de aparición (1, 2, 3, ...)
        alt_text (str): Texto alternativo para SEO y accesibilidad
        is_main (bool): Flag de imagen principal de la galería
        created_at (datetime): Timestamp de creación
        updated_at (datetime): Timestamp de última modificación
    
    Relationships:
        product: Producto al que pertenece esta imagen
    
    Business Rules:
        - Un producto puede tener 0-N imágenes adicionales
        - SOLO UNA imagen debe tener is_main=True por producto
        - image_order determina secuencia en galería (menor primero)
        - alt_text obligatorio para SEO y accesibilidad
        - image_url debe ser imagen optimizada (800x800px recomendado)
    
    Uso en frontend:
        # Obtener galería de producto
        GET /ecommerce/products/123/images
        
        Response:
        [
            {
                "id": 1,
                "image_url": "https://cloudinary.com/product-123-front.jpg",
                "alt_text": "Remera negra vista frontal",
                "is_main": true,
                "order": 1
            },
            {
                "id": 2,
                "image_url": "https://cloudinary.com/product-123-back.jpg",
                "alt_text": "Remera negra vista trasera",
                "is_main": false,
                "order": 2
            },
            ...
        ]
    
    Example (Admin):
        # Agregar imágenes a producto
        product_id = 123
        
        # Imagen principal
        image1 = ProductImage(
            product_id=product_id,
            image_url="https://cloudinary.com/remera-frente.jpg",
            alt_text="Remera negra vista frontal",
            image_order=1,
            is_main=True
        )
        
        # Imágenes adicionales
        image2 = ProductImage(
            product_id=product_id,
            image_url="https://cloudinary.com/remera-atras.jpg",
            alt_text="Remera negra vista trasera",
            image_order=2,
            is_main=False
        )
        
        db.add_all([image1, image2])
        db.commit()
    
    Reordenar imágenes:
        # Cambiar orden de galería
        images = db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).order_by(ProductImage.image_order).all()
        
        # Intercambiar orden de primera y segunda
        images[0].image_order = 2
        images[1].image_order = 1
        db.commit()
    
    Validaciones:
        - Solo UNA imagen con is_main=True por producto
        - image_url obligatorio y debe ser URL válida
        - alt_text obligatorio (máx 255 chars)
        - image_order debe ser > 0
    
    SEO y Accesibilidad:
        - alt_text describe la imagen para lectores de pantalla
        - alt_text usado por Google Images para indexar
        - Bueno: "Zapatillas Nike Air Max negras vista lateral"
        - Malo: "imagen1.jpg"
    
    See Also:
        - Product.image_url: Imagen principal del producto
        - routers/ecommerce_advanced.py: Upload de imágenes
        - frontend/ecommerce/components/ProductGallery.tsx: Galería
    """
    __tablename__ = "product_images"
    
    # ===== IDENTIFICACIÓN =====
    
    id = Column(
        Integer, 
        primary_key=True, 
        index=True,
        doc="Identificador único de la imagen"
    )
    
    product_id = Column(
        Integer, 
        ForeignKey("products.id"), 
        nullable=False,
        index=True,  # Índice para queries por producto
        doc="ID del producto al que pertenece esta imagen"
    )
    
    # ===== RECURSO VISUAL =====
    
    image_url = Column(
        String(500), 
        nullable=False,
        doc="URL de la imagen en Cloudinary u otro CDN. "
            "Dimensiones recomendadas: 800x800px (cuadrada) para consistencia"
    )
    
    # ===== ORDENAMIENTO Y METADATA =====
    
    image_order = Column(
        Integer, 
        default=1,
        index=True,  # Índice para ordenar en queries
        doc="Orden de aparición en la galería (1 = primera, 2 = segunda, etc.)"
    )
    
    alt_text = Column(
        String(255),
        doc="Texto alternativo para: "
            "- SEO (Google Images) "
            "- Accesibilidad (lectores de pantalla) "
            "- Fallback si imagen no carga. "
            "Debe describir la imagen detalladamente"
    )
    
    is_main = Column(
        Boolean, 
        default=False,
        index=True,  # Índice para encontrar imagen principal
        doc="Flag de imagen principal de la galería. "
            "Solo UNA imagen debe tener is_main=True por producto"
    )
    
    # ===== AUDITORÍA =====
    
    created_at = Column(
        DateTime, 
        default=func.now(),
        doc="Timestamp de creación de la imagen"
    )
    
    updated_at = Column(
        DateTime, 
        default=func.now(), 
        onupdate=func.now(),
        doc="Timestamp de última modificación"
    )
    
    # ===== RELACIONES =====
    
    product = relationship(
        "Product", 
        back_populates="product_images",
        doc="Producto al que pertenece esta imagen (permite acceder a Product.name, etc.)"
    )
    
    # ===== CONSTRAINTS DE TABLA =====
    
    __table_args__ = (
        # TODO: Agregar constraint para garantizar solo una is_main=True por producto
        # CheckConstraint para validar que solo una imagen sea principal
        {"extend_existing": True},
    )
    
    # ===== REPRESENTACIÓN =====
    
    def __repr__(self) -> str:
        """Representación legible para debugging."""
        main_flag = " [MAIN]" if self.is_main else ""
        return (
            f"<ProductImage("
            f"id={self.id}, "
            f"product_id={self.product_id}, "
            f"order={self.image_order}"
            f"{main_flag}"
            f")>"
        )
