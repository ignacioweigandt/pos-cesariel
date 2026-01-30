"""
Módulo de Auditoría y Trazabilidad.

Sistema completo de logs para rastreo de cambios de configuración y eventos
de seguridad. Cumplimiento normativo y troubleshooting avanzado.

Modelos:
    - ConfigChangeLog: Registro inmutable de cambios en configuraciones
    - SecurityAuditLog: Registro de eventos de seguridad (login, permisos)

Enums:
    - ChangeAction: Tipos de acciones (CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE)

Casos de Uso:
    - Auditorías de cumplimiento normativo
    - Troubleshooting de cambios en configuración
    - Detección de intentos de acceso no autorizado
    - Historial de quién cambió qué y cuándo
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class ChangeAction(str, enum.Enum):
    """
    Tipos de acciones de cambio en configuraciones.
    
    Define las operaciones posibles sobre registros de configuración para
    tracking detallado en ConfigChangeLog.
    
    Values:
        CREATE: Registro nuevo creado
        UPDATE: Registro existente modificado
        DELETE: Registro eliminado/desactivado permanentemente
        ACTIVATE: Registro reactivado (después de DEACTIVATE)
        DEACTIVATE: Registro temporalmente desactivado (reversible)
    
    Ejemplo:
        ConfigChangeLog(
            action=ChangeAction.UPDATE,
            table_name="system_config",
            field_name="currency_code"
        )
    """
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    ACTIVATE = "ACTIVATE"
    DEACTIVATE = "DEACTIVATE"


class ConfigChangeLog(Base):
    """
    Registro inmutable de cambios en configuraciones del sistema.
    
    Rastreo completo de modificaciones en tablas críticas (system_config, tax_rates,
    payment_methods, ecommerce_config, branch_config) con contexto de quién, qué,
    cuándo y desde dónde. Esencial para auditorías y troubleshooting.
    
    Attributes:
        id: Identificador único del log
        table_name: Nombre de tabla modificada (indexado)
        record_id: ID del registro modificado (indexado)
        action: Tipo de acción (CREATE/UPDATE/DELETE/ACTIVATE/DEACTIVATE)
        field_name: Campo específico modificado (NULL si CREATE/DELETE completo)
        old_value: Valor anterior (JSON para objetos complejos)
        new_value: Valor nuevo (JSON para objetos complejos)
        changed_by_user_id: ID del usuario que realizó cambio (FK users.id)
        changed_at: Timestamp exacto del cambio (indexado, auto)
        ip_address: IP origen del request (máx 50 chars)
        user_agent: Cliente/navegador que realizó cambio (máx 500 chars)
        notes: Justificación o contexto adicional del cambio
    
    Relationships:
        changed_by: Usuario que realizó el cambio (backref: config_changes)
    
    Business Rules:
        - Logs son inmutables: nunca UPDATE/DELETE después de crear
        - Registrar TODOS los cambios en tablas de configuración
        - Retención mínima: 2 años para auditorías fiscales
        - Valores complejos serializar como JSON en old_value/new_value
        - IP y user_agent opcionales pero recomendados para seguridad
    
    Properties:
        summary: Resumen en español legible del cambio realizado
    
    Ejemplo:
        ConfigChangeLog(
            table_name="system_config",
            record_id=1,
            action=ChangeAction.UPDATE,
            field_name="currency_code",
            old_value="USD",
            new_value="ARS",
            changed_by_user_id=5,
            ip_address="192.168.1.100",
            notes="Cambio de moneda para Argentina"
        )
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
        """Representación técnica del log de cambio para debugging."""
        return f"<ConfigChangeLog(table={self.table_name}, record_id={self.record_id}, action={self.action}, by={self.changed_by_user_id})>"

    @property
    def summary(self) -> str:
        """
        Genera resumen en español legible del cambio realizado.
        
        Convierte los datos técnicos del log en una frase descriptiva tipo:
        "actualizó registro 5 en system_config, campo 'currency_code': 'USD' → 'ARS'"
        
        Returns:
            str: Descripción en español del cambio con formato legible
        
        Ejemplo:
            log.summary  # "creó registro 10 en tax_rates"
        """
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
    Registro de eventos de seguridad y autenticación.
    
    Rastreo de eventos críticos de seguridad: intentos de login (exitosos/fallidos),
    cambios de permisos, actividades sospechosas. Base para detección de intrusiones
    y análisis forense.
    
    Attributes:
        id: Identificador único del log
        event_type: Tipo de evento (LOGIN, LOGOUT, PERMISSION_CHANGE, etc.) (indexado)
        user_id: ID del usuario relacionado (FK users.id, indexado, opcional)
        username: Username intentado en login (para fallidos, indexado)
        success: Estado del evento ("SUCCESS" o "FAILED")
        ip_address: IP origen del evento (indexado, máx 50 chars)
        user_agent: User agent del cliente (máx 500 chars)
        details: Detalles adicionales en JSON (motivo fallo, permisos cambiados, etc.)
        created_at: Timestamp del evento (indexado, auto)
    
    Relationships:
        user: Usuario relacionado con el evento (backref: security_events)
    
    Business Rules:
        - Registrar TODOS los intentos de login (exitosos y fallidos)
        - Registrar cambios de roles y permisos de usuarios
        - Detectar patrones: múltiples fallos consecutivos desde misma IP → alerta
        - Retención mínima: 1 año (3 años para entornos regulados)
        - IP indexada para análisis de ataques por origen
    
    Event Types Comunes:
        LOGIN: Intento de autenticación
        LOGOUT: Cierre de sesión
        PERMISSION_CHANGE: Cambio de rol/permisos
        ACCESS_DENIED: Intento de acceso denegado
        SUSPICIOUS_ACTIVITY: Actividad sospechosa detectada
    
    Ejemplo:
        SecurityAuditLog(
            event_type="LOGIN",
            user_id=10,
            username="admin",
            success="FAILED",
            ip_address="203.0.113.45",
            details='{"reason": "invalid_password", "attempts": 3}'
        )
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
        """Representación técnica del log de seguridad para debugging."""
        return f"<SecurityAuditLog(event={self.event_type}, user={self.username}, success={self.success}, ip={self.ip_address})>"
