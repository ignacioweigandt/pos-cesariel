"""
Repositories de WhatsApp.

Acceso a datos para integración con WhatsApp Business y ventas sociales.

Repositories:
    - WhatsAppConfigRepository: Config singleton de WhatsApp
    - WhatsAppSaleRepository: Metadata de ventas vía WhatsApp
"""

from app.repositories.base import BaseRepository
from app.models import WhatsAppConfig, WhatsAppSale
from typing import Optional

class WhatsAppConfigRepository(BaseRepository[WhatsAppConfig]):
    """
    Repository de configuración de WhatsApp.
    
    Gestiona config singleton de integración con WhatsApp Business.
    """
    
    def get_active_config(self) -> Optional[WhatsAppConfig]:
        """
        Obtiene configuración activa de WhatsApp.
        
        Returns:
            Configuración activa (singleton) o None
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).first()

class WhatsAppSaleRepository(BaseRepository[WhatsAppSale]):
    """
    Repository de ventas vía WhatsApp.
    
    Gestiona metadata adicional de ventas realizadas por WhatsApp.
    """
    
    def get_by_sale(self, sale_id: int) -> Optional[WhatsAppSale]:
        """
        Obtiene metadata de WhatsApp de una venta.
        
        Args:
            sale_id: ID de la venta relacionada
        
        Returns:
            Metadata de WhatsApp o None si no existe
        """
        return self.get_by_field("sale_id", sale_id)
