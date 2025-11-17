"""
Configuration repositories for POS Cesariel.

This module contains repositories for managing branch-specific configurations,
audit logs, and security events.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime, timedelta

from app.repositories.base import BaseRepository
from app.models import (
    BranchTaxRate,
    BranchPaymentMethod,
    ConfigChangeLog,
    SecurityAuditLog,
    ChangeAction,
    TaxRate,
    PaymentMethod
)


class BranchTaxRateRepository(BaseRepository[BranchTaxRate]):
    """Repository for branch-specific tax rate configurations"""

    def __init__(self, db: Session):
        super().__init__(BranchTaxRate, db)

    def get_by_branch(self, branch_id: int, active_only: bool = True) -> List[BranchTaxRate]:
        """Get all tax rates configured for a specific branch"""
        query = self.db.query(BranchTaxRate).filter(
            BranchTaxRate.branch_id == branch_id
        )

        if active_only:
            query = query.join(TaxRate).filter(TaxRate.is_active == True)

        return query.order_by(BranchTaxRate.is_default.desc()).all()

    def get_default_for_branch(self, branch_id: int) -> Optional[BranchTaxRate]:
        """Get the default tax rate for a branch"""
        return self.db.query(BranchTaxRate).filter(
            and_(
                BranchTaxRate.branch_id == branch_id,
                BranchTaxRate.is_default == True
            )
        ).join(TaxRate).filter(TaxRate.is_active == True).first()

    def get_effective_tax_rate(self, branch_id: int, date: Optional[datetime] = None) -> Optional[BranchTaxRate]:
        """
        Get the effective tax rate for a branch at a specific date.
        If no date provided, uses current date.
        """
        if date is None:
            date = datetime.now()

        return self.db.query(BranchTaxRate).filter(
            and_(
                BranchTaxRate.branch_id == branch_id,
                BranchTaxRate.is_default == True,
                BranchTaxRate.effective_from <= date
            )
        ).join(TaxRate).filter(TaxRate.is_active == True)\
         .order_by(BranchTaxRate.effective_from.desc()).first()

    def set_default_for_branch(self, branch_id: int, tax_rate_id: int) -> BranchTaxRate:
        """
        Set a tax rate as default for a branch.
        Automatically unsets previous default.
        """
        # Unset previous defaults
        self.db.query(BranchTaxRate).filter(
            and_(
                BranchTaxRate.branch_id == branch_id,
                BranchTaxRate.is_default == True
            )
        ).update({"is_default": False})

        # Set new default or get existing
        branch_tax = self.db.query(BranchTaxRate).filter(
            and_(
                BranchTaxRate.branch_id == branch_id,
                BranchTaxRate.tax_rate_id == tax_rate_id
            )
        ).first()

        if branch_tax:
            branch_tax.is_default = True
        else:
            branch_tax = BranchTaxRate(
                branch_id=branch_id,
                tax_rate_id=tax_rate_id,
                is_default=True
            )
            self.db.add(branch_tax)

        self.db.commit()
        self.db.refresh(branch_tax)
        return branch_tax


class BranchPaymentMethodRepository(BaseRepository[BranchPaymentMethod]):
    """Repository for branch-specific payment method configurations"""

    def __init__(self, db: Session):
        super().__init__(BranchPaymentMethod, db)

    def get_by_branch(self, branch_id: int, active_only: bool = True) -> List[BranchPaymentMethod]:
        """Get all payment methods configured for a specific branch"""
        query = self.db.query(BranchPaymentMethod).filter(
            BranchPaymentMethod.branch_id == branch_id
        )

        if active_only:
            query = query.filter(BranchPaymentMethod.is_active == True)\
                        .join(PaymentMethod).filter(PaymentMethod.is_active == True)

        return query.all()

    def get_by_branch_and_method(self, branch_id: int, payment_method_id: int) -> Optional[BranchPaymentMethod]:
        """Get specific payment method configuration for a branch"""
        return self.db.query(BranchPaymentMethod).filter(
            and_(
                BranchPaymentMethod.branch_id == branch_id,
                BranchPaymentMethod.payment_method_id == payment_method_id
            )
        ).first()

    def is_method_available(self, branch_id: int, payment_method_id: int) -> bool:
        """Check if a payment method is available for a branch"""
        config = self.get_by_branch_and_method(branch_id, payment_method_id)

        # If no config exists, check global payment_method
        if not config:
            method = self.db.query(PaymentMethod).filter(
                PaymentMethod.id == payment_method_id
            ).first()
            return method.is_active if method else False

        # Check both branch config and global config
        return config.is_active and config.payment_method.is_active

    def get_surcharge(self, branch_id: int, payment_method_id: int) -> Optional[float]:
        """Get the effective surcharge for a payment method at a branch"""
        config = self.get_by_branch_and_method(branch_id, payment_method_id)

        if not config:
            return None

        # Branch override takes precedence
        if config.surcharge_override is not None:
            return float(config.surcharge_override)

        # Otherwise return the method's default (would need to add this field to PaymentMethod)
        return None

    def toggle_method(self, branch_id: int, payment_method_id: int, is_active: bool) -> BranchPaymentMethod:
        """Enable or disable a payment method for a branch"""
        config = self.get_by_branch_and_method(branch_id, payment_method_id)

        if not config:
            config = BranchPaymentMethod(
                branch_id=branch_id,
                payment_method_id=payment_method_id,
                is_active=is_active
            )
            self.db.add(config)
        else:
            config.is_active = is_active

        self.db.commit()
        self.db.refresh(config)
        return config


class ConfigChangeLogRepository(BaseRepository[ConfigChangeLog]):
    """Repository for configuration change audit logs"""

    def __init__(self, db: Session):
        super().__init__(ConfigChangeLog, db)

    def log_change(
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
    ) -> ConfigChangeLog:
        """Create a new configuration change log entry"""
        log_entry = ConfigChangeLog(
            table_name=table_name,
            record_id=record_id,
            action=action,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            changed_by_user_id=user_id,
            notes=notes,
            ip_address=ip_address,
            user_agent=user_agent
        )
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry

    def get_by_table(self, table_name: str, limit: int = 100) -> List[ConfigChangeLog]:
        """Get recent changes for a specific table"""
        return self.db.query(ConfigChangeLog).filter(
            ConfigChangeLog.table_name == table_name
        ).order_by(desc(ConfigChangeLog.changed_at)).limit(limit).all()

    def get_by_record(self, table_name: str, record_id: int) -> List[ConfigChangeLog]:
        """Get all changes for a specific record"""
        return self.db.query(ConfigChangeLog).filter(
            and_(
                ConfigChangeLog.table_name == table_name,
                ConfigChangeLog.record_id == record_id
            )
        ).order_by(desc(ConfigChangeLog.changed_at)).all()

    def get_by_user(self, user_id: int, limit: int = 100) -> List[ConfigChangeLog]:
        """Get recent changes made by a specific user"""
        return self.db.query(ConfigChangeLog).filter(
            ConfigChangeLog.changed_by_user_id == user_id
        ).order_by(desc(ConfigChangeLog.changed_at)).limit(limit).all()

    def get_recent(self, limit: int = 100, table_filter: Optional[str] = None) -> List[ConfigChangeLog]:
        """Get recent configuration changes, optionally filtered by table"""
        query = self.db.query(ConfigChangeLog)

        if table_filter:
            query = query.filter(ConfigChangeLog.table_name == table_filter)

        return query.order_by(desc(ConfigChangeLog.changed_at)).limit(limit).all()


class SecurityAuditLogRepository(BaseRepository[SecurityAuditLog]):
    """Repository for security audit logs"""

    def __init__(self, db: Session):
        super().__init__(SecurityAuditLog, db)

    def log_event(
        self,
        event_type: str,
        success: str = "SUCCESS",
        user_id: Optional[int] = None,
        username: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[str] = None
    ) -> SecurityAuditLog:
        """Create a new security audit log entry"""
        log_entry = SecurityAuditLog(
            event_type=event_type,
            user_id=user_id,
            username=username,
            success=success,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details
        )
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry

    def get_login_attempts(
        self,
        username: Optional[str] = None,
        ip_address: Optional[str] = None,
        hours: int = 24,
        failed_only: bool = False
    ) -> List[SecurityAuditLog]:
        """Get login attempts, optionally filtered"""
        cutoff = datetime.now() - timedelta(hours=hours)

        query = self.db.query(SecurityAuditLog).filter(
            and_(
                SecurityAuditLog.event_type == "LOGIN",
                SecurityAuditLog.created_at >= cutoff
            )
        )

        if username:
            query = query.filter(SecurityAuditLog.username == username)

        if ip_address:
            query = query.filter(SecurityAuditLog.ip_address == ip_address)

        if failed_only:
            query = query.filter(SecurityAuditLog.success == "FAILED")

        return query.order_by(desc(SecurityAuditLog.created_at)).all()

    def get_failed_login_count(self, username: str, hours: int = 1) -> int:
        """Count failed login attempts for a user in the last N hours"""
        cutoff = datetime.now() - timedelta(hours=hours)

        return self.db.query(SecurityAuditLog).filter(
            and_(
                SecurityAuditLog.event_type == "LOGIN",
                SecurityAuditLog.username == username,
                SecurityAuditLog.success == "FAILED",
                SecurityAuditLog.created_at >= cutoff
            )
        ).count()

    def get_user_activity(self, user_id: int, limit: int = 100) -> List[SecurityAuditLog]:
        """Get security events for a specific user"""
        return self.db.query(SecurityAuditLog).filter(
            SecurityAuditLog.user_id == user_id
        ).order_by(desc(SecurityAuditLog.created_at)).limit(limit).all()
