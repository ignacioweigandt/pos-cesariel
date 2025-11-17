"""
Audit and logging models for POS Cesariel.

This module contains models for tracking configuration changes and
maintaining an audit trail of system modifications. Essential for:
- Compliance and regulatory requirements
- Troubleshooting and debugging
- Security audits
- Change management
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class ChangeAction(str, enum.Enum):
    """Types of configuration change actions"""
    CREATE = "CREATE"      # New record created
    UPDATE = "UPDATE"      # Existing record modified
    DELETE = "DELETE"      # Record deleted/deactivated
    ACTIVATE = "ACTIVATE"  # Record activated
    DEACTIVATE = "DEACTIVATE"  # Record deactivated


class ConfigChangeLog(Base):
    """
    Configuration change audit log.

    Tracks all changes to configuration tables (system_config, tax_rates,
    payment_methods, ecommerce_config, etc.) for compliance and troubleshooting.

    Attributes:
        id (int): Identificador único del log
        table_name (str): Nombre de la tabla modificada
        record_id (int): ID del registro modificado
        action (ChangeAction): Tipo de acción realizada (CREATE/UPDATE/DELETE)
        field_name (str): Campo específico modificado (opcional)
        old_value (str): Valor anterior del campo
        new_value (str): Valor nuevo del campo
        changed_by_user_id (int): ID del usuario que realizó el cambio
        changed_at (datetime): Timestamp del cambio
        ip_address (str): IP desde donde se realizó el cambio (opcional)
        user_agent (str): Navegador/cliente que realizó el cambio (opcional)
        notes (str): Notas adicionales sobre el cambio

    Relationships:
        changed_by: Usuario que realizó el cambio

    Business Rules:
        - Todos los cambios en tablas de configuración deben registrarse
        - Los logs son inmutables (no se pueden editar después de crear)
        - Retención: mantener logs por al menos 2 años para auditorías
    """
    __tablename__ = "config_change_log"

    # Primary key
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único del log de cambio")

    # What was changed
    table_name = Column(String(100), nullable=False, index=True,
                       doc="Nombre de la tabla de configuración modificada")
    record_id = Column(Integer, nullable=False, index=True,
                      doc="ID del registro específico modificado")
    action = Column(SQLEnum(ChangeAction), nullable=False,
                   doc="Tipo de acción realizada")

    # Change details
    field_name = Column(String(100), nullable=True,
                       doc="Campo específico modificado (opcional si es CREATE/DELETE)")
    old_value = Column(Text, nullable=True,
                      doc="Valor anterior del campo (JSON para objetos complejos)")
    new_value = Column(Text, nullable=True,
                      doc="Valor nuevo del campo (JSON para objetos complejos)")

    # Who and when
    changed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"),
                               nullable=True, index=True,
                               doc="Usuario que realizó el cambio")
    changed_at = Column(DateTime, default=func.now(), nullable=False, index=True,
                       doc="Timestamp exacto del cambio")

    # Audit metadata
    ip_address = Column(String(50), nullable=True,
                       doc="Dirección IP desde donde se realizó el cambio")
    user_agent = Column(String(500), nullable=True,
                       doc="User agent del cliente que realizó el cambio")
    notes = Column(Text, nullable=True,
                  doc="Notas adicionales o justificación del cambio")

    # Relationships
    changed_by = relationship("User", backref="config_changes",
                             doc="Usuario que realizó el cambio")

    def __repr__(self):
        return f"<ConfigChangeLog(table={self.table_name}, record_id={self.record_id}, action={self.action}, by={self.changed_by_user_id})>"

    @property
    def summary(self) -> str:
        """Generate a human-readable summary of the change"""
        action_text = {
            ChangeAction.CREATE: "creó",
            ChangeAction.UPDATE: "actualizó",
            ChangeAction.DELETE: "eliminó",
            ChangeAction.ACTIVATE: "activó",
            ChangeAction.DEACTIVATE: "desactivó"
        }

        base = f"{action_text.get(self.action, 'modificó')} registro {self.record_id} en {self.table_name}"

        if self.field_name:
            base += f", campo '{self.field_name}'"
            if self.old_value:
                base += f": '{self.old_value}' → '{self.new_value}'"
            else:
                base += f" = '{self.new_value}'"

        return base


class SecurityAuditLog(Base):
    """
    Security audit log for authentication and authorization events.

    Tracks security-relevant events like login attempts, permission changes,
    and suspicious activities for security monitoring.

    Attributes:
        id (int): Identificador único del log
        event_type (str): Tipo de evento (LOGIN, LOGOUT, PERMISSION_CHANGE, etc.)
        user_id (int): ID del usuario relacionado (opcional)
        username (str): Username intentado (para intentos fallidos)
        success (bool): Si el evento fue exitoso
        ip_address (str): IP desde donde ocurrió el evento
        user_agent (str): User agent del cliente
        details (str): Detalles adicionales del evento (JSON)
        created_at (datetime): Timestamp del evento

    Relationships:
        user: Usuario relacionado con el evento

    Business Rules:
        - Registrar todos los intentos de login (exitosos y fallidos)
        - Registrar cambios de permisos y roles
        - Alertar sobre múltiples intentos fallidos
        - Retención: mantener logs por al menos 1 año
    """
    __tablename__ = "security_audit_log"

    # Primary key
    id = Column(Integer, primary_key=True, index=True,
                doc="Identificador único del log de seguridad")

    # Event information
    event_type = Column(String(50), nullable=False, index=True,
                       doc="Tipo de evento de seguridad")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"),
                    nullable=True, index=True,
                    doc="Usuario relacionado con el evento")
    username = Column(String(100), nullable=True, index=True,
                     doc="Username intentado (para login fallidos)")
    success = Column(String(10), nullable=False, default="SUCCESS",
                    doc="Si el evento fue exitoso (SUCCESS/FAILED)")

    # Context information
    ip_address = Column(String(50), nullable=True, index=True,
                       doc="Dirección IP desde donde ocurrió el evento")
    user_agent = Column(String(500), nullable=True,
                       doc="User agent del cliente")
    details = Column(Text, nullable=True,
                    doc="Detalles adicionales del evento (JSON)")

    # Timestamp
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True,
                       doc="Timestamp del evento")

    # Relationships
    user = relationship("User", backref="security_events",
                       doc="Usuario relacionado con el evento")

    def __repr__(self):
        return f"<SecurityAuditLog(event={self.event_type}, user={self.username}, success={self.success}, ip={self.ip_address})>"
