"""
Repositories de Configuración de Pagos.

Acceso a datos para gestión de medios de pago y planes de cuotas
personalizados (bancarizadas/no bancarizadas).

Repositories:
    - PaymentConfigRepository: Configuración de medios de pago
    - CustomInstallmentRepository: Planes de cuotas personalizados
"""

from app.repositories.base import BaseRepository
from app.models.payment import PaymentConfig, CustomInstallment
from typing import List, Optional


class PaymentConfigRepository(BaseRepository[PaymentConfig]):
    """
    Repository de configuración de medios de pago.
    
    Gestiona configuración de medios de pago disponibles en el sistema.
    """

    def get_active_configs(self) -> List[PaymentConfig]:
        """
        Obtiene configuraciones de pago activas.
        
        Returns:
            Lista de configuraciones con is_active=True
        """
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()

    def get_by_payment_type(self, payment_type: str) -> List[PaymentConfig]:
        """
        Obtiene configuraciones por tipo de pago.
        
        Args:
            payment_type: Tipo de pago (efectivo, tarjeta, etc.)
        
        Returns:
            Lista de configuraciones de ese tipo
        """
        return self.get_many_by_field("payment_type", payment_type)


class CustomInstallmentRepository(BaseRepository[CustomInstallment]):
    """
    Repository de planes de cuotas personalizados.
    
    Gestiona planes de financiación para tarjetas bancarizadas/no bancarizadas
    con recargos personalizados por cantidad de cuotas.
    """

    def get_by_card_type(self, card_type: str) -> List[CustomInstallment]:
        """
        Obtiene planes de cuotas por tipo de tarjeta ordenados.
        
        Args:
            card_type: Tipo de tarjeta ('bancarizadas' o 'no_bancarizadas')
        
        Returns:
            Planes ordenados por cantidad de cuotas (ascendente)
        """
        return self.db.query(self.model).filter(
            self.model.card_type == card_type
        ).order_by(self.model.installments.asc()).all()

    def get_active_installments(self, card_type: Optional[str] = None) -> List[CustomInstallment]:
        """
        Obtiene planes activos, opcionalmente filtrados por tipo de tarjeta.
        
        Args:
            card_type: Tipo de tarjeta opcional (None = todos los tipos)
        
        Returns:
            Planes activos ordenados por cantidad de cuotas
        """
        query = self.db.query(self.model).filter(
            self.model.is_active == True
        )

        if card_type:
            query = query.filter(self.model.card_type == card_type)

        return query.order_by(self.model.installments.asc()).all()

    def toggle_active(self, id: int) -> Optional[CustomInstallment]:
        """
        Alterna estado activo/inactivo de un plan.
        
        Args:
            id: ID del plan
        
        Returns:
            Plan actualizado o None si no existe
        """
        installment = self.get(id)
        if installment:
            installment.is_active = not installment.is_active
            self.db.commit()
            self.db.refresh(installment)
        return installment

    def exists_for_card_and_installments(
        self,
        card_type: str,
        installments: int,
        exclude_id: Optional[int] = None
    ) -> bool:
        """
        Verifica si ya existe plan para tipo de tarjeta y cantidad de cuotas.
        
        Útil para evitar duplicados al crear/editar planes.
        
        Args:
            card_type: Tipo de tarjeta
            installments: Cantidad de cuotas
            exclude_id: ID a excluir de la búsqueda (para updates)
        
        Returns:
            True si existe plan con esa combinación, False si no
        """
        query = self.db.query(self.model).filter(
            self.model.card_type == card_type,
            self.model.installments == installments
        )

        if exclude_id:
            query = query.filter(self.model.id != exclude_id)

        return query.first() is not None
