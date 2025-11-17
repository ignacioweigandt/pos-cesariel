"""
Configuration Service for POS Cesariel.

Handles all configuration-related business logic including branch-specific
configurations, tax rates, payment methods, and audit logging.
"""

from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session

from app.repositories.config import (
    BranchTaxRateRepository,
    BranchPaymentMethodRepository,
    ConfigChangeLogRepository,
    SecurityAuditLogRepository
)
from app.models import (
    BranchTaxRate,
    BranchPaymentMethod,
    TaxRate,
    PaymentMethod,
    ChangeAction
)


class ConfigService:
    """Service for configuration management operations."""

    def __init__(self, db: Session):
        self.db = db
        self.branch_tax_repo = BranchTaxRateRepository(db)
        self.branch_payment_repo = BranchPaymentMethodRepository(db)
        self.change_log_repo = ConfigChangeLogRepository(db)
        self.security_log_repo = SecurityAuditLogRepository(db)

    # ==================== Tax Rate Configuration ====================

    def get_tax_rate_for_branch(
        self,
        branch_id: int,
        fallback_to_system: bool = True
    ) -> Optional[Tuple[int, str, Decimal]]:
        """
        Get the effective tax rate for a branch.

        Returns:
            Tuple of (tax_rate_id, tax_rate_name, tax_rate_percentage)
            None if no rate is configured and fallback_to_system is False
        """
        # Try to get branch-specific tax rate
        branch_tax = self.branch_tax_repo.get_default_for_branch(branch_id)

        if branch_tax and branch_tax.tax_rate:
            return (
                branch_tax.tax_rate_id,
                branch_tax.tax_rate.name,
                branch_tax.tax_rate.rate
            )

        # Fallback to system default
        if fallback_to_system:
            default_tax = self.db.query(TaxRate).filter(
                TaxRate.is_default == True,
                TaxRate.is_active == True
            ).first()

            if default_tax:
                return (default_tax.id, default_tax.name, default_tax.rate)

        return None

    def set_branch_tax_rate(
        self,
        branch_id: int,
        tax_rate_id: int,
        user_id: Optional[int] = None,
        notes: Optional[str] = None
    ) -> BranchTaxRate:
        """Set the tax rate for a specific branch with audit logging."""
        # Get old configuration for audit
        old_config = self.branch_tax_repo.get_default_for_branch(branch_id)
        old_tax_rate_id = old_config.tax_rate_id if old_config else None

        # Set new configuration
        branch_tax = self.branch_tax_repo.set_default_for_branch(branch_id, tax_rate_id)

        # Log the change
        self.change_log_repo.log_change(
            table_name="branch_tax_rates",
            record_id=branch_tax.id,
            action=ChangeAction.UPDATE if old_config else ChangeAction.CREATE,
            user_id=user_id,
            field_name="tax_rate_id",
            old_value=str(old_tax_rate_id) if old_tax_rate_id else None,
            new_value=str(tax_rate_id),
            notes=notes or f"Tax rate configured for branch {branch_id}"
        )

        return branch_tax

    def get_all_branch_tax_rates(self, branch_id: int) -> List[BranchTaxRate]:
        """Get all tax rate configurations for a branch."""
        return self.branch_tax_repo.get_by_branch(branch_id, active_only=False)

    # ==================== Payment Method Configuration ====================

    def get_available_payment_methods(
        self,
        branch_id: int
    ) -> List[BranchPaymentMethod]:
        """
        Get all available payment methods for a branch.

        Returns branch-specific configurations if they exist, otherwise
        returns global payment methods.
        """
        # Get branch-specific configurations
        branch_methods = self.branch_payment_repo.get_by_branch(branch_id, active_only=True)

        # If branch has specific configurations, return those
        if branch_methods:
            return branch_methods

        # Otherwise, return all globally active payment methods
        # (create temporary objects to maintain consistent interface)
        global_methods = self.db.query(PaymentMethod).filter(
            PaymentMethod.is_active == True
        ).all()

        return [
            BranchPaymentMethod(
                branch_id=branch_id,
                payment_method_id=pm.id,
                payment_method=pm,
                is_active=True
            )
            for pm in global_methods
        ]

    def is_payment_method_available(
        self,
        branch_id: int,
        payment_method_id: int
    ) -> bool:
        """Check if a payment method is available for a branch."""
        return self.branch_payment_repo.is_method_available(branch_id, payment_method_id)

    def validate_payment_method(
        self,
        payment_method_code: str,
        branch_id: Optional[int] = None
    ) -> Optional[PaymentMethod]:
        """
        Validate if a payment method exists and is active.

        Args:
            payment_method_code: The code of the payment method (e.g., "CASH", "CARD")
            branch_id: Optional branch ID to check branch-specific availability

        Returns:
            PaymentMethod if valid, None otherwise

        Raises:
            ValueError: If payment method is invalid or not available
        """
        # Find payment method by code
        payment_method = self.db.query(PaymentMethod).filter(
            PaymentMethod.code == payment_method_code
        ).first()

        if not payment_method:
            raise ValueError(f"Payment method '{payment_method_code}' not found")

        if not payment_method.is_active:
            raise ValueError(f"Payment method '{payment_method_code}' is not active")

        # If branch_id provided, check branch-specific availability
        if branch_id is not None:
            if not self.is_payment_method_available(branch_id, payment_method.id):
                raise ValueError(
                    f"Payment method '{payment_method_code}' is not available at this branch"
                )

        return payment_method

    def toggle_payment_method_for_branch(
        self,
        branch_id: int,
        payment_method_id: int,
        is_active: bool,
        user_id: Optional[int] = None
    ) -> BranchPaymentMethod:
        """Enable or disable a payment method for a branch with audit logging."""
        # Get old configuration for audit
        old_config = self.branch_payment_repo.get_by_branch_and_method(
            branch_id, payment_method_id
        )
        old_active = old_config.is_active if old_config else None

        # Toggle method
        config = self.branch_payment_repo.toggle_method(branch_id, payment_method_id, is_active)

        # Log the change
        action_text = "enabled" if is_active else "disabled"
        self.change_log_repo.log_change(
            table_name="branch_payment_methods",
            record_id=config.id,
            action=ChangeAction.ACTIVATE if is_active else ChangeAction.DEACTIVATE,
            user_id=user_id,
            field_name="is_active",
            old_value=str(old_active) if old_active is not None else None,
            new_value=str(is_active),
            notes=f"Payment method {action_text} for branch {branch_id}"
        )

        return config

    def get_payment_method_surcharge(
        self,
        branch_id: int,
        payment_method_id: int
    ) -> Optional[Decimal]:
        """Get the effective surcharge for a payment method at a branch."""
        surcharge = self.branch_payment_repo.get_surcharge(branch_id, payment_method_id)
        return Decimal(str(surcharge)) if surcharge is not None else None

    # ==================== Audit Logging ====================

    def log_config_change(
        self,
        table_name: str,
        record_id: int,
        action: ChangeAction,
        user_id: Optional[int] = None,
        field_name: Optional[str] = None,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None,
        notes: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log a configuration change to the audit trail."""
        return self.change_log_repo.log_change(
            table_name=table_name,
            record_id=record_id,
            action=action,
            user_id=user_id,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            notes=notes,
            ip_address=ip_address,
            user_agent=user_agent
        )

    def get_config_change_history(
        self,
        table_name: Optional[str] = None,
        record_id: Optional[int] = None,
        limit: int = 100
    ):
        """Get configuration change history, optionally filtered."""
        if table_name and record_id:
            return self.change_log_repo.get_by_record(table_name, record_id)
        elif table_name:
            return self.change_log_repo.get_by_table(table_name, limit)
        else:
            return self.change_log_repo.get_recent(limit)

    # ==================== Security Logging ====================

    def log_security_event(
        self,
        event_type: str,
        success: str = "SUCCESS",
        user_id: Optional[int] = None,
        username: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[str] = None
    ):
        """Log a security event."""
        return self.security_log_repo.log_event(
            event_type=event_type,
            success=success,
            user_id=user_id,
            username=username,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details
        )

    def get_failed_login_attempts(
        self,
        username: str,
        hours: int = 1
    ) -> int:
        """Get count of failed login attempts for a user."""
        return self.security_log_repo.get_failed_login_count(username, hours)

    def check_account_lockout(
        self,
        username: str,
        max_attempts: int = 5,
        lockout_hours: int = 1
    ) -> Tuple[bool, int]:
        """
        Check if an account should be locked out due to failed login attempts.

        Returns:
            Tuple of (should_lockout, attempt_count)
        """
        attempt_count = self.get_failed_login_attempts(username, lockout_hours)
        should_lockout = attempt_count >= max_attempts
        return (should_lockout, attempt_count)
