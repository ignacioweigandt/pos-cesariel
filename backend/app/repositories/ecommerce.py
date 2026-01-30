"""
Repositories de E-commerce.

Acceso a datos para configuración de tienda online, banners promocionales
y galería de imágenes de productos.

Repositories:
    - EcommerceConfigRepository: Config singleton de tienda online
    - StoreBannerRepository: Banners del storefront
    - ProductImageRepository: Galería de imágenes por producto
"""

from app.repositories.base import BaseRepository
from app.models import EcommerceConfig, StoreBanner, ProductImage
from typing import List, Optional

class EcommerceConfigRepository(BaseRepository[EcommerceConfig]):
    """
    Repository de configuración de e-commerce.
    
    Gestiona config singleton de tienda online (colores, textos, contacto).
    """
    
    def get_active_config(self) -> Optional[EcommerceConfig]:
        """
        Obtiene configuración activa de tienda.
        
        Returns:
            Configuración activa (singleton) o None
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).first()

class StoreBannerRepository(BaseRepository[StoreBanner]):
    """
    Repository de banners de tienda.
    
    Gestiona banners promocionales del storefront (carrusel home).
    """
    
    def get_active_banners(self) -> List[StoreBanner]:
        """
        Obtiene banners activos ordenados por posición.
        
        Returns:
            Lista de banners activos en orden de banner_order
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).order_by(self.model.banner_order).all()

class ProductImageRepository(BaseRepository[ProductImage]):
    """
    Repository de imágenes de productos.
    
    Gestiona galería de imágenes por producto (múltiples fotos por item).
    """
    
    def get_by_product(self, product_id: int) -> List[ProductImage]:
        """
        Obtiene imágenes de un producto ordenadas.
        
        Args:
            product_id: ID del producto
        
        Returns:
            Lista de imágenes ordenadas por image_order
        """
        return self.db.query(self.model).filter(
            self.model.product_id == product_id
        ).order_by(self.model.image_order).all()
