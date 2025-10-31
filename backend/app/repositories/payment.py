"""
Payment repository for POS Cesariel.

Provides data access for payment configuration management,
including custom installment plans.
"""

from app.repositories.base import BaseRepository
from app.models.payment import PaymentConfig, CustomInstallment
from typing import List, Optional


class PaymentConfigRepository(BaseRepository[PaymentConfig]):
    """Repository for PaymentConfig entity."""

    def get_active_configs(self) -> List[PaymentConfig]:
        """Get all active payment configurations."""
        return self.db.query(self.model).filter(
            self.model.is_active == True
        ).all()

    def get_by_payment_type(self, payment_type: str) -> List[PaymentConfig]:
        """Get all payment configurations for a specific payment type."""
        return self.get_many_by_field("payment_type", payment_type)


class CustomInstallmentRepository(BaseRepository[CustomInstallment]):
    """Repository for CustomInstallment entity."""

    def get_by_card_type(self, card_type: str) -> List[CustomInstallment]:
        """
        Get all custom installment plans for a specific card type.

        Args:
            card_type: Card type ('bancarizadas' or 'no_bancarizadas')

        Returns:
            List of custom installment plans for the specified card type
        """
        return self.db.query(self.model).filter(
            self.model.card_type == card_type
        ).order_by(self.model.installments.asc()).all()

    def get_active_installments(self, card_type: Optional[str] = None) -> List[CustomInstallment]:
        """
        Get all active custom installment plans, optionally filtered by card type.

        Args:
            card_type: Optional card type filter

        Returns:
            List of active custom installment plans
        """
        query = self.db.query(self.model).filter(
            self.model.is_active == True
        )

        if card_type:
            query = query.filter(self.model.card_type == card_type)

        return query.order_by(self.model.installments.asc()).all()

    def toggle_active(self, id: int) -> Optional[CustomInstallment]:
        """
        Toggle the active status of a custom installment plan.

        Args:
            id: ID of the installment plan

        Returns:
            Updated installment plan or None if not found
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
        Check if a custom installment plan already exists for the given card type and installments.

        Args:
            card_type: Card type
            installments: Number of installments
            exclude_id: Optional ID to exclude from the check (for updates)

        Returns:
            True if a plan exists, False otherwise
        """
        query = self.db.query(self.model).filter(
            self.model.card_type == card_type,
            self.model.installments == installments
        )

        if exclude_id:
            query = query.filter(self.model.id != exclude_id)

        return query.first() is not None
