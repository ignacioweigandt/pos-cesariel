"""
WhatsApp repositories for POS Cesariel.

Provides data access for WhatsApp integration configuration and sales.
"""

from app.repositories.base import BaseRepository
from app.models import WhatsAppConfig, WhatsAppSale
from typing import Optional

class WhatsAppConfigRepository(BaseRepository[WhatsAppConfig]):
    """Repository for WhatsAppConfig entity."""
    
    def get_active_config(self) -> Optional[WhatsAppConfig]:
        """Get the active WhatsApp configuration."""
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).first()

class WhatsAppSaleRepository(BaseRepository[WhatsAppSale]):
    """Repository for WhatsAppSale entity."""
    
    def get_by_sale(self, sale_id: int) -> Optional[WhatsAppSale]:
        """Get WhatsApp sale record by sale ID."""
        return self.get_by_field("sale_id", sale_id)
