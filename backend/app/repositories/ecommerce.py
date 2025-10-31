"""
E-commerce repositories for POS Cesariel.

Provides data access for e-commerce configuration, banners, and product images.
"""

from app.repositories.base import BaseRepository
from app.models import EcommerceConfig, StoreBanner, ProductImage
from typing import List, Optional

class EcommerceConfigRepository(BaseRepository[EcommerceConfig]):
    """Repository for EcommerceConfig entity."""
    
    def get_active_config(self) -> Optional[EcommerceConfig]:
        """Get the active e-commerce configuration."""
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).first()

class StoreBannerRepository(BaseRepository[StoreBanner]):
    """Repository for StoreBanner entity."""
    
    def get_active_banners(self) -> List[StoreBanner]:
        """Get all active banners ordered by banner_order."""
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).order_by(self.model.banner_order).all()

class ProductImageRepository(BaseRepository[ProductImage]):
    """Repository for ProductImage entity."""
    
    def get_by_product(self, product_id: int) -> List[ProductImage]:
        """Get all images for a specific product ordered by image_order."""
        return self.db.query(self.model).filter(
            self.model.product_id == product_id
        ).order_by(self.model.image_order).all()
