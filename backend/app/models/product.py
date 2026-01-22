"""
Product and Category models for the POS Cesariel system.

This module contains product-related models including Category and Product entities,
which handle inventory management, pricing, and product catalog.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Category(Base):
    """
    Modelo de Categoría de productos del sistema POS Cesariel.
    
    Organiza los productos en categorías para facilitar la navegación,
    búsqueda y gestión del inventario tanto en el POS como en el e-commerce.
    Las categorías pueden ser usadas para filtros, reportes y organización visual.
    
    Attributes:
        id (int): Identificador único de la categoría
        name (str): Nombre descriptivo de la categoría (máx. 100 caracteres)
        description (str): Descripción detallada opcional de la categoría
        is_active (bool): Estado activo/inactivo de la categoría
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        products: Lista de productos que pertenecen a esta categoría
    """
    __tablename__ = "categories"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental de la categoría")
    name = Column(String(100), nullable=False,
                  doc="Nombre descriptivo de la categoría")
    description = Column(Text,
                        doc="Descripción detallada opcional de la categoría")
    
    # Campos de control
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo de la categoría")
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    products = relationship("Product", back_populates="category",
                           doc="Productos que pertenecen a esta categoría")


class Product(Base):
    """
    Modelo de Producto del sistema POS Cesariel.
    
    Representa todos los productos/artículos disponibles para venta tanto en
    POS como en e-commerce. Maneja inventario centralizado con soporte para
    múltiples sucursales, talles/variantes, imágenes y precios diferenciados.
    
    Attributes:
        id (int): Identificador único del producto
        name (str): Nombre comercial del producto (máx. 200 caracteres)
        description (str): Descripción detallada del producto
        sku (str): Código SKU único del producto (máx. 50 caracteres)
        barcode (str): Código de barras único para escaneo (máx. 50 caracteres)
        category_id (int): ID de la categoría asignada (FK hacia categories.id)
        brand (str): Marca del producto (Nike, Adidas, Puma, etc.) (máx. 100 caracteres)
        price (decimal): Precio de venta en POS (10 dígitos, 2 decimales)
        cost (decimal): Costo del producto para cálculo de margen
        stock_quantity (int): Stock general del producto (suma de todas las sucursales)
        min_stock (int): Stock mínimo para alertas de reposición
        is_active (bool): Estado activo/inactivo del producto
        show_in_ecommerce (bool): Visibilidad en tienda online
        ecommerce_price (decimal): Precio específico para e-commerce
        image_url (str): URL de imagen principal del producto
        has_sizes (bool): Indica si el producto maneja talles/variantes
        created_at (datetime): Fecha y hora de creación del registro
        updated_at (datetime): Fecha y hora de última modificación
        
    Relationships:
        category: Categoría asignada al producto
        sale_items: Items de venta que incluyen este producto
        inventory_movements: Movimientos de stock del producto
        branch_stocks: Stock específico por sucursal
        product_sizes: Talles/variantes disponibles del producto
        product_images: Imágenes adicionales del producto
    """
    __tablename__ = "products"
    
    # Campos principales de identificación
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único autoincremental del producto")
    name = Column(String(200), nullable=False,
                  doc="Nombre comercial del producto")
    description = Column(Text,
                        doc="Descripción detallada del producto")
    
    # Códigos de identificación únicos
    sku = Column(String(50), unique=True, index=True, nullable=False,
                 doc="Código SKU único del producto")
    barcode = Column(String(50), unique=True, index=True,
                     doc="Código de barras único para escaneo POS")
    
    # Categorización
    category_id = Column(Integer, ForeignKey("categories.id"),
                         doc="ID de la categoría asignada al producto")
    brand_id = Column(Integer, ForeignKey("brands.id"),
                     doc="ID de la marca asignada al producto")
    brand = Column(String(100),
                   doc="Marca del producto - LEGACY: usar brand_id (se mantendrá para compatibilidad)")

    # Precios y costos
    price = Column(Numeric(10, 2), nullable=False,
                   doc="Precio de venta en POS (con 2 decimales)")
    cost = Column(Numeric(10, 2),
                  doc="Costo del producto para cálculo de margen")
    ecommerce_price = Column(Numeric(10, 2),
                             doc="Precio específico para tienda online")
    
    # Control de inventario
    stock_quantity = Column(Integer, default=0,
                            doc="Stock global calculado (suma de todas las sucursales)")
    min_stock = Column(Integer, default=0,
                       doc="Stock mínimo global para alertas de reposición")
    
    # Configuración de producto
    is_active = Column(Boolean, default=True,
                       doc="Estado activo/inactivo del producto")
    show_in_ecommerce = Column(Boolean, default=True,
                               doc="Visibilidad en tienda online")
    has_sizes = Column(Boolean, default=False,
                       doc="Indica si el producto maneja talles/variantes")
    
    # Recursos multimedia
    image_url = Column(String(255),
                       doc="URL de imagen principal del producto")
    
    # Campos de auditoría
    created_at = Column(DateTime, default=func.now(),
                        doc="Timestamp de creación del registro")
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(),
                        doc="Timestamp de última actualización")
    
    # Relaciones con otras entidades
    category = relationship("Category", back_populates="products",
                           doc="Categoría asignada al producto")
    brand_rel = relationship("Brand", back_populates="products",
                            doc="Marca asignada al producto")
    sale_items = relationship("SaleItem", back_populates="product",
                             doc="Items de venta que incluyen este producto")
    inventory_movements = relationship("InventoryMovement", back_populates="product",
                                     doc="Movimientos de stock del producto")
    branch_stocks = relationship("BranchStock", back_populates="product",
                                doc="Stock específico por sucursal")
    product_sizes = relationship("ProductSize", back_populates="product",
                                doc="Talles/variantes disponibles del producto")
    product_images = relationship("ProductImage", back_populates="product",
                                 doc="Imágenes adicionales del producto")
    
    def get_stock_for_branch(self, branch_id):
        """
        Obtiene el stock específico para una sucursal.
        Para productos con talles, suma ProductSize de esa sucursal.
        
        Args:
            branch_id (int): ID de la sucursal
            
        Returns:
            int: Cantidad en stock para la sucursal especificada
        """
        if self.has_sizes:
            # Para productos con talles, sumar stock de ProductSize de la sucursal
            from sqlalchemy.orm import Session
            from sqlalchemy import func as sqlalchemy_func
            from database import SessionLocal
            from app.models.inventory import ProductSize  # Import necesario para la query
            db = SessionLocal()
            try:
                total = db.query(sqlalchemy_func.sum(ProductSize.stock_quantity)).filter(
                    ProductSize.product_id == self.id,
                    ProductSize.branch_id == branch_id
                ).scalar() or 0
                return int(total)
            finally:
                db.close()
        else:
            # Para productos sin talles, usar BranchStock
            branch_stock = next((bs for bs in self.branch_stocks if bs.branch_id == branch_id), None)
            return branch_stock.stock_quantity if branch_stock else 0
    
    def get_available_stock_for_branch(self, branch_id):
        """
        Obtiene el stock disponible (no reservado) para una sucursal.
        Para productos con talles, usa ProductSize de esa sucursal.
        
        Args:
            branch_id (int): ID de la sucursal
            
        Returns:
            int: Cantidad disponible para venta en la sucursal especificada
        """
        if self.has_sizes:
            # Para productos con talles, usar el stock de ProductSize (mismo que get_stock_for_branch por ahora)
            return self.get_stock_for_branch(branch_id)
        else:
            # Para productos sin talles, usar BranchStock disponible
            branch_stock = next((bs for bs in self.branch_stocks if bs.branch_id == branch_id), None)
            return branch_stock.available_stock if branch_stock else 0
    
    def calculate_total_stock(self):
        """
        Calcula el stock total sumando todas las sucursales.
        Para productos con talles, suma ProductSize, sino suma BranchStock.
        
        Returns:
            int: Stock total del producto
        """
        if self.has_sizes:
            # Para productos con talles, sumar todo el stock de ProductSize
            from sqlalchemy.orm import Session
            from sqlalchemy import func as sqlalchemy_func
            from database import SessionLocal
            from app.models.inventory import ProductSize
            db = SessionLocal()
            try:
                total = db.query(sqlalchemy_func.sum(ProductSize.stock_quantity)).filter(
                    ProductSize.product_id == self.id
                ).scalar() or 0
                return int(total)
            finally:
                db.close()
        else:
            # Para productos sin talles, sumar BranchStock
            return sum(bs.stock_quantity for bs in self.branch_stocks)
    
    def calculate_total_available_stock(self):
        """
        Calcula el stock disponible total sumando todas las sucursales.
        Para productos con talles, suma ProductSize, sino suma BranchStock.
        
        Returns:
            int: Stock disponible total del producto
        """
        if self.has_sizes:
            # Para productos con talles, sumar todo el stock de ProductSize (sin reserved_stock por ahora)
            from sqlalchemy.orm import Session
            from sqlalchemy import func as sqlalchemy_func
            from database import SessionLocal
            from app.models.inventory import ProductSize
            db = SessionLocal()
            try:
                total = db.query(sqlalchemy_func.sum(ProductSize.stock_quantity)).filter(
                    ProductSize.product_id == self.id
                ).scalar() or 0
                return int(total)
            finally:
                db.close()
        else:
            # Para productos sin talles, sumar BranchStock disponible
            return sum(bs.available_stock for bs in self.branch_stocks)
    
    def has_stock_in_branch(self, branch_id, quantity=1):
        """
        Verifica si hay suficiente stock en una sucursal específica.
        
        Args:
            branch_id (int): ID de la sucursal
            quantity (int): Cantidad requerida (default: 1)
            
        Returns:
            bool: True si hay stock suficiente en la sucursal
        """
        return self.get_available_stock_for_branch(branch_id) >= quantity
    
    def get_branches_with_stock(self):
        """
        Obtiene lista de sucursales que tienen stock del producto.
        
        Returns:
            list: Lista de IDs de sucursales con stock > 0
        """
        return [bs.branch_id for bs in self.branch_stocks if bs.stock_quantity > 0]
    
    def get_allowed_sizes(self):
        """
        Obtiene los talles válidos para este producto basado en su categoría.
        
        Returns:
            list: Lista de talles válidos para este producto
        """
        from utils.size_validators import get_valid_sizes_for_category
        
        if not self.has_sizes or not self.category:
            return []
        
        return get_valid_sizes_for_category(self.category.name)
    
    def is_valid_size(self, size: str) -> bool:
        """
        Valida si un talle es válido para este producto.
        
        Args:
            size (str): Talle a validar
            
        Returns:
            bool: True si el talle es válido para este producto
        """
        allowed_sizes = self.get_allowed_sizes()
        return size in allowed_sizes
    
    def __repr__(self):
        return f"<Product(id={self.id}, sku='{self.sku}', name='{self.name}', stock={self.stock_quantity})>"
