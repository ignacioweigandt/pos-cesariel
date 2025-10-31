"""
Payment Service for POS Cesariel.

Handles all payment-related business logic including payment configuration
and custom installment plan management.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.payment import PaymentConfigRepository, CustomInstallmentRepository
from app.models.payment import PaymentConfig, CustomInstallment
from app.schemas.payment import CustomInstallmentCreate, CustomInstallmentUpdate


class PaymentService:
    """Service for payment configuration and custom installments management."""

    def __init__(self, db: Session):
        """
        Initialize payment service with database session.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self.payment_repo = PaymentConfigRepository(PaymentConfig, db)
        self.installment_repo = CustomInstallmentRepository(CustomInstallment, db)

    # =================== PAYMENT CONFIG METHODS ===================

    def get_active_payment_configs(self) -> List[PaymentConfig]:
        """Get all active payment configurations."""
        return self.payment_repo.get_active_configs()

    def get_payment_configs_by_type(self, payment_type: str) -> List[PaymentConfig]:
        """Get payment configurations by type."""
        return self.payment_repo.get_by_payment_type(payment_type)

    # =================== CUSTOM INSTALLMENT METHODS ===================

    def get_all_custom_installments(self, card_type: Optional[str] = None) -> List[CustomInstallment]:
        """
        Get all custom installment plans, optionally filtered by card type.

        Args:
            card_type: Optional card type filter ('bancarizadas' or 'no_bancarizadas')

        Returns:
            List of custom installment plans
        """
        if card_type:
            return self.installment_repo.get_by_card_type(card_type)
        return self.installment_repo.get_all()

    def get_active_custom_installments(self, card_type: Optional[str] = None) -> List[CustomInstallment]:
        """
        Get all active custom installment plans.

        Args:
            card_type: Optional card type filter

        Returns:
            List of active custom installment plans
        """
        return self.installment_repo.get_active_installments(card_type)

    def get_custom_installment(self, installment_id: int) -> Optional[CustomInstallment]:
        """
        Get a specific custom installment plan by ID.

        Args:
            installment_id: ID of the installment plan

        Returns:
            CustomInstallment or None if not found
        """
        return self.installment_repo.get(installment_id)

    def create_custom_installment(self, data: CustomInstallmentCreate) -> CustomInstallment:
        """
        Create a new custom installment plan with validation.

        Args:
            data: CustomInstallmentCreate schema with validated data

        Returns:
            Created custom installment plan

        Raises:
            ValueError: If validation fails or duplicate plan exists
        """
        # Check for duplicate (same card_type and installments)
        if self.installment_repo.exists_for_card_and_installments(
            data.card_type,
            data.installments
        ):
            raise ValueError(
                f"Ya existe un plan de {data.installments} cuotas para tarjetas {data.card_type}"
            )

        # Validate installments range (1-60)
        if not 1 <= data.installments <= 60:
            raise ValueError("El número de cuotas debe estar entre 1 y 60")

        # Validate surcharge range (0-100)
        if not 0 <= float(data.surcharge_percentage) <= 100:
            raise ValueError("El recargo debe estar entre 0% y 100%")

        # Create installment plan
        installment_dict = data.model_dump()
        return self.installment_repo.create(installment_dict)

    def update_custom_installment(
        self,
        installment_id: int,
        data: CustomInstallmentUpdate
    ) -> Optional[CustomInstallment]:
        """
        Update an existing custom installment plan.

        Args:
            installment_id: ID of the installment plan to update
            data: CustomInstallmentUpdate schema with validated data

        Returns:
            Updated custom installment plan or None if not found

        Raises:
            ValueError: If validation fails
        """
        # Check if installment exists
        installment = self.installment_repo.get(installment_id)
        if not installment:
            return None

        # Get update data
        update_dict = data.model_dump(exclude_unset=True)

        # Validate surcharge if provided
        if 'surcharge_percentage' in update_dict:
            surcharge = float(update_dict['surcharge_percentage'])
            if not 0 <= surcharge <= 100:
                raise ValueError("El recargo debe estar entre 0% y 100%")

        # Validate installments if provided
        if 'installments' in update_dict:
            installments = update_dict['installments']
            if not 1 <= installments <= 60:
                raise ValueError("El número de cuotas debe estar entre 1 y 60")

            # Check for duplicate if installments changed
            if installments != installment.installments:
                if self.installment_repo.exists_for_card_and_installments(
                    installment.card_type,
                    installments,
                    exclude_id=installment_id
                ):
                    raise ValueError(
                        f"Ya existe un plan de {installments} cuotas para tarjetas {installment.card_type}"
                    )

        # Update installment plan
        return self.installment_repo.update(installment_id, update_dict)

    def delete_custom_installment(self, installment_id: int) -> bool:
        """
        Delete a custom installment plan.

        Args:
            installment_id: ID of the installment plan to delete

        Returns:
            True if deleted, False if not found
        """
        return self.installment_repo.delete(installment_id)

    def toggle_custom_installment(self, installment_id: int) -> Optional[CustomInstallment]:
        """
        Toggle the active status of a custom installment plan.

        Args:
            installment_id: ID of the installment plan

        Returns:
            Updated custom installment plan or None if not found
        """
        return self.installment_repo.toggle_active(installment_id)

    def get_installments_by_card_type(self, card_type: str) -> List[CustomInstallment]:
        """
        Get all custom installment plans for a specific card type.

        Args:
            card_type: Card type ('bancarizadas' or 'no_bancarizadas')

        Returns:
            List of custom installment plans, ordered by number of installments
        """
        return self.installment_repo.get_by_card_type(card_type)
