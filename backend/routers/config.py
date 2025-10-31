from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth_compat import get_current_active_user
from app.models import User, EcommerceConfig, PaymentConfig, UserRole, SystemConfig, PaymentMethod
from app.models.payment import CustomInstallment
from app.schemas import (
    EcommerceConfig as EcommerceConfigSchema,
    EcommerceConfigCreate,
    EcommerceConfigUpdate,
    PaymentConfig as PaymentConfigSchema,
    PaymentConfigCreate,
    PaymentConfigUpdate,
    SystemConfigResponse,
    SystemConfigUpdate,
    CurrencyConfigResponse
)
from app.schemas.payment import (
    CustomInstallment as CustomInstallmentSchema,
    CustomInstallmentCreate,
    CustomInstallmentUpdate,
    ALLOWED_CURRENCIES
)
from app.services.payment_service import PaymentService
from cloudinary_config import upload_image_to_cloudinary, delete_image_from_cloudinary, extract_public_id_from_url
import logging
import os
from decimal import Decimal

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/config",
    tags=["config"],
    responses={404: {"description": "Not found"}},
)

def get_or_create_default_payment_configs(db: Session):
    """Obtener o crear configuraciones de pago por defecto en la base de datos"""
    # Verificar si ya existen configuraciones
    existing_count = db.query(PaymentConfig).count()

    if existing_count > 0:
        # Ya existen configuraciones, retornarlas
        return db.query(PaymentConfig).all()

    # No existen, crear configuraciones por defecto
    logger.info("Creando configuraciones de pago por defecto...")

    default_configs = [
        # Efectivo
        PaymentConfig(
            payment_type="efectivo",
            card_type=None,
            installments=1,
            surcharge_percentage=Decimal("0.00"),
            is_active=True,
            description="Pago en efectivo sin recargo"
        ),
        # Transferencia
        PaymentConfig(
            payment_type="transferencia",
            card_type=None,
            installments=1,
            surcharge_percentage=Decimal("0.00"),
            is_active=True,
            description="Transferencia bancaria sin recargo"
        ),
        # Tarjetas Bancarizadas - 1 cuota
        PaymentConfig(
            payment_type="tarjeta",
            card_type="bancarizadas",
            installments=1,
            surcharge_percentage=Decimal("0.00"),
            is_active=True,
            description="Tarjetas bancarizadas - 1 cuota"
        ),
        # Tarjetas Bancarizadas - 3 cuotas
        PaymentConfig(
            payment_type="tarjeta",
            card_type="bancarizadas",
            installments=3,
            surcharge_percentage=Decimal("8.00"),
            is_active=True,
            description="Tarjetas bancarizadas - 3 cuotas"
        ),
        # Tarjetas Bancarizadas - 6 cuotas
        PaymentConfig(
            payment_type="tarjeta",
            card_type="bancarizadas",
            installments=6,
            surcharge_percentage=Decimal("14.00"),
            is_active=True,
            description="Tarjetas bancarizadas - 6 cuotas"
        ),
        # Tarjetas Bancarizadas - 9 cuotas
        PaymentConfig(
            payment_type="tarjeta",
            card_type="bancarizadas",
            installments=9,
            surcharge_percentage=Decimal("20.00"),
            is_active=True,
            description="Tarjetas bancarizadas - 9 cuotas"
        ),
        # Tarjetas Bancarizadas - 12 cuotas
        PaymentConfig(
            payment_type="tarjeta",
            card_type="bancarizadas",
            installments=12,
            surcharge_percentage=Decimal("26.00"),
            is_active=True,
            description="Tarjetas bancarizadas - 12 cuotas"
        ),
        # Tarjetas No Bancarizadas
        PaymentConfig(
            payment_type="tarjeta",
            card_type="no_bancarizadas",
            installments=1,
            surcharge_percentage=Decimal("15.00"),
            is_active=True,
            description="Tarjetas no bancarizadas"
        ),
        # Tarjeta Naranja
        PaymentConfig(
            payment_type="tarjeta",
            card_type="tarjeta_naranja",
            installments=1,
            surcharge_percentage=Decimal("15.00"),
            is_active=True,
            description="Tarjeta Naranja"
        )
    ]

    for config in default_configs:
        db.add(config)

    db.commit()
    logger.info(f"✓ {len(default_configs)} configuraciones de pago creadas")

    return default_configs

def admin_or_manager_required(current_user: User = Depends(get_current_active_user)):
    """Verificar que el usuario sea admin o manager"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a la configuración"
        )
    return current_user

# =================== E-COMMERCE CONFIG ===================

@router.get("/ecommerce", response_model=EcommerceConfigSchema)
async def get_ecommerce_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener configuración de e-commerce"""
    try:
        config = db.query(EcommerceConfig).first()
        if not config:
            # Crear configuración por defecto si no existe
            config = EcommerceConfig(
                store_name="Mi Tienda Online",
                store_description="Descripción de la tienda",
                is_active=True,
                tax_percentage=0,
                currency="USD"
            )
            db.add(config)
            db.commit()
            db.refresh(config)
        
        logger.info(f"Usuario {current_user.username} obtuvo configuración de e-commerce")
        return config
    except Exception as e:
        logger.error(f"Error obteniendo configuración de e-commerce: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/ecommerce", response_model=EcommerceConfigSchema)
async def create_ecommerce_config(
    config_data: EcommerceConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Crear configuración de e-commerce"""
    try:
        # Verificar si ya existe una configuración
        existing_config = db.query(EcommerceConfig).first()
        if existing_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una configuración de e-commerce. Use PUT para actualizar."
            )
        
        db_config = EcommerceConfig(**config_data.dict())
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        
        logger.info(f"Usuario {current_user.username} creó configuración de e-commerce")
        return db_config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando configuración de e-commerce: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.put("/ecommerce", response_model=EcommerceConfigSchema)
async def update_ecommerce_config(
    config_data: EcommerceConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Actualizar configuración de e-commerce"""
    try:
        config = db.query(EcommerceConfig).first()
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuración de e-commerce no encontrada"
            )
        
        # Actualizar solo los campos proporcionados
        update_data = config_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(config, field, value)
        
        db.commit()
        db.refresh(config)
        
        logger.info(f"Usuario {current_user.username} actualizó configuración de e-commerce")
        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando configuración de e-commerce: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

# =================== SYSTEM CONFIG ===================

@router.get("/system", response_model=SystemConfigResponse)
async def get_system_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener configuración general del sistema"""
    try:
        # Get or create system config
        config = db.query(SystemConfig).first()
        if not config:
            # Create default configuration
            config = SystemConfig(
                default_currency="ARS",
                currency_symbol="$",
                currency_position="before",
                decimal_places=2,
                default_tax_rate=0,
                session_timeout=30
            )
            db.add(config)
            db.commit()
            db.refresh(config)

        # Build response with system info
        response_data = config.to_dict()
        response_data.update({
            "app_name": "POS Cesariel",
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
        })

        logger.info(f"Usuario {current_user.username} obtuvo configuración del sistema")
        return response_data
    except Exception as e:
        logger.error(f"Error obteniendo configuración del sistema: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.put("/system", response_model=SystemConfigResponse)
async def update_system_config(
    config_data: SystemConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Actualizar configuración general del sistema"""
    try:
        # Get or create system config
        config = db.query(SystemConfig).first()
        if not config:
            # Create default configuration if doesn't exist
            config = SystemConfig(
                default_currency="ARS",
                currency_symbol="$",
                currency_position="before",
                decimal_places=2,
                default_tax_rate=0,
                session_timeout=30
            )
            db.add(config)

        # Update only provided fields
        update_data = config_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(config, field, value)

        db.commit()
        db.refresh(config)

        # Build response with system info
        response_data = config.to_dict()
        response_data.update({
            "app_name": "POS Cesariel",
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
        })

        logger.info(f"Usuario {current_user.username} actualizó configuración del sistema: {update_data}")
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando configuración del sistema: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/currency", response_model=CurrencyConfigResponse)
async def get_currency_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ Permitir a todos los usuarios leer
):
    """Obtener configuración de moneda solamente (lectura permitida para todos los roles)"""
    try:
        # Get or create system config
        config = db.query(SystemConfig).first()
        if not config:
            # Create default configuration
            config = SystemConfig(
                default_currency="ARS",
                currency_symbol="$",
                currency_position="before",
                decimal_places=2,
                default_tax_rate=0,
                session_timeout=30
            )
            db.add(config)
            db.commit()
            db.refresh(config)

        logger.info(f"Usuario {current_user.username} obtuvo configuración de moneda")
        return {
            "default_currency": config.default_currency,
            "currency_symbol": config.currency_symbol,
            "currency_position": config.currency_position,
            "decimal_places": config.decimal_places,
        }
    except Exception as e:
        logger.error(f"Error obteniendo configuración de moneda: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.put("/currency", response_model=CurrencyConfigResponse)
async def update_currency_config(
    config_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Actualizar solo la configuración de moneda"""
    try:
        # Get or create system config
        config = db.query(SystemConfig).first()
        if not config:
            config = SystemConfig(
                default_currency="ARS",
                currency_symbol="$",
                currency_position="before",
                decimal_places=2,
                default_tax_rate=0,
                session_timeout=30
            )
            db.add(config)

        # Validate and update currency fields only
        if "default_currency" in config_data:
            if config_data["default_currency"] not in ["ARS", "USD"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Solo se permiten las monedas ARS (Peso Argentino) y USD (Dólar Estadounidense)"
                )
            config.default_currency = config_data["default_currency"]

        if "currency_symbol" in config_data:
            config.currency_symbol = config_data["currency_symbol"]

        if "currency_position" in config_data:
            if config_data["currency_position"] not in ["before", "after"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La posición de moneda debe ser 'before' o 'after'"
                )
            config.currency_position = config_data["currency_position"]

        if "decimal_places" in config_data:
            if not 0 <= config_data["decimal_places"] <= 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Los decimales deben estar entre 0 y 2"
                )
            config.decimal_places = config_data["decimal_places"]

        db.commit()
        db.refresh(config)

        logger.info(f"Usuario {current_user.username} actualizó configuración de moneda")
        return {
            "default_currency": config.default_currency,
            "currency_symbol": config.currency_symbol,
            "currency_position": config.currency_position,
            "decimal_places": config.decimal_places,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando configuración de moneda: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


def get_or_create_default_payment_methods(db: Session):
    """Obtener o crear métodos de pago por defecto en la base de datos"""
    # Verificar si ya existen métodos de pago
    existing_count = db.query(PaymentMethod).count()

    if existing_count > 0:
        # Ya existen, retornarlos
        return db.query(PaymentMethod).all()

    # No existen, crear métodos por defecto
    logger.info("Creando métodos de pago por defecto...")

    default_methods = [
        PaymentMethod(
            name="Efectivo",
            code="CASH",
            icon="💵",
            is_active=True,
            requires_change=True,
            description="Pago en efectivo"
        ),
        PaymentMethod(
            name="Tarjetas",
            code="CARD",
            icon="💳",
            is_active=True,
            requires_change=False,
            description="Pago con tarjetas (bancarizadas, no bancarizadas, etc.)"
        ),
        PaymentMethod(
            name="Transferencia",
            code="TRANSFER",
            icon="🏦",
            is_active=True,
            requires_change=False,
            description="Transferencia bancaria"
        )
    ]

    for method in default_methods:
        db.add(method)

    db.commit()
    logger.info(f"✓ {len(default_methods)} métodos de pago creados")

    return default_methods


@router.get("/payment-methods")
async def get_payment_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ Permitir lectura a todos los usuarios
):
    """Obtener métodos de pago desde la base de datos (lectura permitida para todos los roles)"""
    try:
        # Obtener o crear métodos por defecto en la BD
        methods = get_or_create_default_payment_methods(db)

        logger.info(f"Usuario {current_user.username} obtuvo métodos de pago ({len(methods)} métodos)")
        return methods

    except Exception as e:
        logger.error(f"Error obteniendo métodos de pago: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.put("/payment-methods/{method_id}")
async def update_payment_method(
    method_id: int,
    method_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Actualizar método de pago (habilitar/deshabilitar) en la base de datos"""
    try:
        # Buscar método en la BD
        method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id).first()

        if not method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Método de pago no encontrado"
            )

        # Actualizar campos permitidos
        allowed_fields = ['is_active', 'name', 'icon', 'requires_change', 'description']
        for field in allowed_fields:
            if field in method_data:
                setattr(method, field, method_data[field])

        db.commit()
        db.refresh(method)

        logger.info(f"Usuario {current_user.username} actualizó método de pago ID: {method_id} - {method.name} (activo: {method.is_active})")
        return method

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando método de pago: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/tax-rates", response_model=list)
async def get_tax_rates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ Permitir lectura a todos los usuarios
):
    """Obtener configuración de impuestos desde la base de datos (lectura permitida para todos los roles)"""
    try:
        from app.models.tax_rate import TaxRate

        # Obtener todas las tasas de impuestos
        tax_rates = db.query(TaxRate).order_by(TaxRate.id).all()

        # Si no hay tasas, crear las predeterminadas
        if not tax_rates:
            logger.info("No hay tasas de impuestos, creando tasas por defecto...")
            default_rates = _create_default_tax_rates(db)
            tax_rates = default_rates

        # Convertir a dict para la respuesta
        result = []
        for rate in tax_rates:
            result.append({
                "id": rate.id,
                "name": rate.name,
                "rate": float(rate.rate),
                "is_active": rate.is_active,
                "is_default": rate.is_default,
                "description": rate.description,
                "created_at": rate.created_at.isoformat() if rate.created_at else None,
                "updated_at": rate.updated_at.isoformat() if rate.updated_at else None,
            })

        logger.info(f"Usuario {current_user.username} obtuvo {len(result)} tasas de impuestos")
        return result
    except Exception as e:
        logger.error(f"Error obteniendo configuración de impuestos: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo configuración de impuestos: {str(e)}"
        )


@router.post("/tax-rates", status_code=status.HTTP_201_CREATED)
async def create_tax_rate(
    tax_rate_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Crear una nueva tasa de impuesto"""
    try:
        from app.models.tax_rate import TaxRate

        # Si se marca como default, desmarcar las demás
        if tax_rate_data.get("is_default", False):
            db.query(TaxRate).update({"is_default": False})

        # Crear nueva tasa
        new_rate = TaxRate(
            name=tax_rate_data["name"],
            rate=tax_rate_data["rate"],
            is_active=tax_rate_data.get("is_active", True),
            is_default=tax_rate_data.get("is_default", False),
            description=tax_rate_data.get("description", "")
        )

        db.add(new_rate)
        db.commit()
        db.refresh(new_rate)

        logger.info(f"Usuario {current_user.username} creó tasa de impuesto: {new_rate.name}")

        return {
            "id": new_rate.id,
            "name": new_rate.name,
            "rate": float(new_rate.rate),
            "is_active": new_rate.is_active,
            "is_default": new_rate.is_default,
            "description": new_rate.description,
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error creando tasa de impuesto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creando tasa de impuesto: {str(e)}"
        )


@router.put("/tax-rates/{tax_rate_id}")
async def update_tax_rate(
    tax_rate_id: int,
    tax_rate_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Actualizar una tasa de impuesto"""
    try:
        from app.models.tax_rate import TaxRate

        # Buscar la tasa
        tax_rate = db.query(TaxRate).filter(TaxRate.id == tax_rate_id).first()
        if not tax_rate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tasa de impuesto no encontrada"
            )

        # Si se marca como default, desmarcar las demás
        if tax_rate_data.get("is_default", False) and not tax_rate.is_default:
            db.query(TaxRate).update({"is_default": False})

        # Actualizar campos
        if "name" in tax_rate_data:
            tax_rate.name = tax_rate_data["name"]
        if "rate" in tax_rate_data:
            tax_rate.rate = tax_rate_data["rate"]
        if "is_active" in tax_rate_data:
            tax_rate.is_active = tax_rate_data["is_active"]
        if "is_default" in tax_rate_data:
            tax_rate.is_default = tax_rate_data["is_default"]
        if "description" in tax_rate_data:
            tax_rate.description = tax_rate_data["description"]

        db.commit()
        db.refresh(tax_rate)

        logger.info(f"Usuario {current_user.username} actualizó tasa de impuesto: {tax_rate.name}")

        return {
            "id": tax_rate.id,
            "name": tax_rate.name,
            "rate": float(tax_rate.rate),
            "is_active": tax_rate.is_active,
            "is_default": tax_rate.is_default,
            "description": tax_rate.description,
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error actualizando tasa de impuesto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error actualizando tasa de impuesto: {str(e)}"
        )


@router.delete("/tax-rates/{tax_rate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tax_rate(
    tax_rate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Eliminar una tasa de impuesto"""
    try:
        from app.models.tax_rate import TaxRate

        # Buscar la tasa
        tax_rate = db.query(TaxRate).filter(TaxRate.id == tax_rate_id).first()
        if not tax_rate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tasa de impuesto no encontrada"
            )

        # No permitir eliminar la tasa por defecto
        if tax_rate.is_default:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar la tasa de impuesto por defecto"
            )

        db.delete(tax_rate)
        db.commit()

        logger.info(f"Usuario {current_user.username} eliminó tasa de impuesto: {tax_rate.name}")

        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error eliminando tasa de impuesto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando tasa de impuesto: {str(e)}"
        )


def _create_default_tax_rates(db: Session):
    """Crear tasas de impuestos por defecto"""
    from app.models.tax_rate import TaxRate

    default_rates = [
        TaxRate(
            name="IVA General",
            rate=21.0,
            is_active=True,
            is_default=True,
            description="Impuesto al Valor Agregado general"
        ),
        TaxRate(
            name="IVA Reducido",
            rate=10.5,
            is_active=True,
            is_default=False,
            description="IVA reducido para productos básicos"
        ),
        TaxRate(
            name="Exento",
            rate=0.0,
            is_active=True,
            is_default=False,
            description="Productos exentos de impuestos"
        )
    ]

    for rate in default_rates:
        db.add(rate)

    db.commit()

    # Refresh para obtener los IDs
    for rate in default_rates:
        db.refresh(rate)

    logger.info(f"✓ {len(default_rates)} tasas de impuestos predeterminadas creadas")

    return default_rates

@router.get("/printers")
async def get_printer_config(
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener configuración de impresoras"""
    try:
        printers = [
            {
                "id": 1,
                "name": "Impresora Principal",
                "type": "THERMAL",
                "connection": "USB",
                "ip_address": None,
                "port": None,
                "is_active": True,
                "is_default": True,
                "paper_width": 80,  # mm
                "auto_cut": True
            },
            {
                "id": 2,
                "name": "Impresora Red",
                "type": "THERMAL",
                "connection": "NETWORK",
                "ip_address": "192.168.1.100",
                "port": 9100,
                "is_active": False,
                "is_default": False,
                "paper_width": 58,  # mm
                "auto_cut": False
            }
        ]
        
        logger.info(f"Usuario {current_user.username} obtuvo configuración de impresoras")
        return printers
    except Exception as e:
        logger.error(f"Error obteniendo configuración de impresoras: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/notifications")
async def get_notification_config(
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener configuración de notificaciones"""
    try:
        notifications = {
            "email": {
                "enabled": False,
                "smtp_server": "",
                "smtp_port": 587,
                "username": "",
                "use_tls": True
            },
            "low_stock_alert": {
                "enabled": True,
                "threshold": 5
            },
            "daily_sales_report": {
                "enabled": True,
                "time": "18:00"
            },
            "backup_reminder": {
                "enabled": True,
                "frequency": "WEEKLY"
            }
        }
        
        logger.info(f"Usuario {current_user.username} obtuvo configuración de notificaciones")
        return notifications
    except Exception as e:
        logger.error(f"Error obteniendo configuración de notificaciones: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/backup")
async def get_backup_config(
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener configuración de respaldos"""
    try:
        backup_config = {
            "auto_backup": {
                "enabled": True,
                "frequency": "DAILY",
                "time": "02:00",
                "retention_days": 30
            },
            "backup_location": "/backups",
            "include_images": True,
            "compress_backups": True,
            "last_backup": "2024-01-15T02:00:00Z",
            "backup_size": "125MB"
        }
        
        logger.info(f"Usuario {current_user.username} obtuvo configuración de respaldos")
        return backup_config
    except Exception as e:
        logger.error(f"Error obteniendo configuración de respaldos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

# =================== PAYMENT CONFIG ===================

@router.get("/payment-config", response_model=List[PaymentConfigSchema])
async def get_payment_configs_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener configuraciones de pagos y recargos desde la base de datos"""
    try:
        # Obtener o crear configuraciones por defecto en la BD
        configs = get_or_create_default_payment_configs(db)

        logger.info(f"Usuario {current_user.username} obtuvo configuraciones de pago ({len(configs)} configuraciones)")
        return configs

    except Exception as e:
        logger.error(f"Error obteniendo payment configs: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/payment-config", response_model=PaymentConfigSchema)
async def create_payment_config(
    config_data: PaymentConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Crear nueva configuración de pago"""
    try:
        db_config = PaymentConfig(**config_data.dict())
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        
        logger.info(f"Usuario {current_user.username} creó configuración de pago: {config_data.payment_type}")
        return db_config
    except Exception as e:
        logger.error(f"Error creando configuración de pago: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.put("/payment-config/{config_id}", response_model=PaymentConfigSchema)
async def update_payment_config(
    config_id: int,
    config_data: PaymentConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Actualizar configuración de pago en la base de datos"""
    try:
        # Buscar configuración en la BD
        config = db.query(PaymentConfig).filter(PaymentConfig.id == config_id).first()

        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuración de pago no encontrada"
            )

        # Obtener datos de actualización
        update_data = config_data.dict(exclude_unset=True)

        # Validar surcharge_percentage si se proporciona
        if 'surcharge_percentage' in update_data:
            if update_data['surcharge_percentage'] < 0 or update_data['surcharge_percentage'] > 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El porcentaje de recargo debe estar entre 0 y 100"
                )
            update_data['surcharge_percentage'] = Decimal(str(update_data['surcharge_percentage']))

        # Actualizar campos en la BD
        for field, value in update_data.items():
            setattr(config, field, value)

        db.commit()
        db.refresh(config)

        logger.info(f"Usuario {current_user.username} actualizó configuración de pago ID: {config_id} con datos: {update_data}")
        return config

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando configuración de pago: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.delete("/payment-config/{config_id}")
async def delete_payment_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Eliminar configuración de pago"""
    try:
        config = db.query(PaymentConfig).filter(PaymentConfig.id == config_id).first()
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuración de pago no encontrada"
            )
        
        # Soft delete
        config.is_active = False
        db.commit()
        
        logger.info(f"Usuario {current_user.username} eliminó configuración de pago ID: {config_id}")
        return {"message": "Configuración eliminada exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando configuración de pago: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

# =================== LOGO UPLOAD ===================

@router.post("/upload-logo")
async def upload_store_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """Subir logo de la tienda a Cloudinary y actualizar configuración"""
    try:
        # Validar archivo
        allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WebP"
            )
        
        # Validar tamaño (5MB máximo)
        file_size = 0
        file_content = b""
        for chunk in iter(lambda: file.file.read(1024), b""):
            file_size += len(chunk)
            file_content += chunk
            if file_size > 5 * 1024 * 1024:  # 5MB
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El archivo es muy grande. Máximo 5MB"
                )
        
        # Obtener configuración actual
        config = db.query(EcommerceConfig).first()
        
        # Eliminar logo anterior si existe
        if config and config.store_logo:
            old_public_id = extract_public_id_from_url(config.store_logo)
            if old_public_id:
                delete_image_from_cloudinary(old_public_id)
        
        # Subir nueva imagen a Cloudinary
        upload_result = upload_image_to_cloudinary(
            file_content,
            file.filename or "store-logo",
            folder="store-logo"
        )
        
        # Actualizar o crear configuración
        if config:
            config.store_logo = upload_result["url"]
        else:
            config = EcommerceConfig(
                store_name="Mi Tienda Online",
                store_description="Descripción de la tienda",
                store_logo=upload_result["url"],
                is_active=True,
                tax_percentage=0,
                currency="ARS"
            )
            db.add(config)
        
        db.commit()
        
        logger.info(f"Usuario {current_user.username} subió nuevo logo de tienda")
        return {
            "message": "Logo subido exitosamente",
            "url": upload_result["url"],
            "public_id": upload_result["public_id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error subiendo logo: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


# =================== CUSTOM INSTALLMENTS ENDPOINTS ===================

@router.get("/custom-installments", response_model=List[CustomInstallmentSchema])
async def get_custom_installments(
    card_type: Optional[str] = Query(None, description="Filter by card type: 'bancarizadas' or 'no_bancarizadas'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # ✅ Permitir lectura a todos los usuarios
):
    """
    Get all custom installment plans, optionally filtered by card type (lectura permitida para todos los roles).

    **Query Parameters:**
    - `card_type`: Optional filter for card type ('bancarizadas' or 'no_bancarizadas')

    **Returns:**
    - List of custom installment plans

    **Permissions:**
    - Requires ADMIN or MANAGER role
    """
    try:
        payment_service = PaymentService(db)
        installments = payment_service.get_all_custom_installments(card_type=card_type)

        logger.info(
            f"Usuario {current_user.username} obtuvo custom installments "
            f"(total: {len(installments)}, card_type: {card_type or 'all'})"
        )
        return installments

    except Exception as e:
        logger.error(f"Error obteniendo custom installments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/custom-installments", response_model=CustomInstallmentSchema, status_code=status.HTTP_201_CREATED)
async def create_custom_installment(
    data: CustomInstallmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """
    Create a new custom installment plan.

    **Request Body:**
    - `card_type`: 'bancarizadas' or 'no_bancarizadas'
    - `installments`: Number of installments (1-60)
    - `surcharge_percentage`: Surcharge percentage (0.00-100.00)
    - `description`: Description of the plan

    **Validations:**
    - Installments must be between 1 and 60
    - Surcharge must be between 0% and 100%
    - No duplicate plans (same card_type + installments)

    **Returns:**
    - Created custom installment plan

    **Permissions:**
    - Requires ADMIN or MANAGER role
    """
    try:
        payment_service = PaymentService(db)
        installment = payment_service.create_custom_installment(data)

        logger.info(
            f"Usuario {current_user.username} creó custom installment: "
            f"{installment.installments} cuotas - {installment.card_type}"
        )
        return installment

    except ValueError as e:
        logger.warning(f"Validation error creating custom installment: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating custom installment: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.put("/custom-installments/{installment_id}", response_model=CustomInstallmentSchema)
async def update_custom_installment(
    installment_id: int,
    data: CustomInstallmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """
    Update an existing custom installment plan.

    **Path Parameters:**
    - `installment_id`: ID of the installment plan to update

    **Request Body:**
    - All fields are optional
    - `installments`: Number of installments (1-60)
    - `surcharge_percentage`: Surcharge percentage (0.00-100.00)
    - `description`: Description of the plan
    - `is_active`: Active status

    **Validations:**
    - Installments must be between 1 and 60 (if provided)
    - Surcharge must be between 0% and 100% (if provided)
    - No duplicate plans if changing installments

    **Returns:**
    - Updated custom installment plan

    **Permissions:**
    - Requires ADMIN or MANAGER role
    """
    try:
        payment_service = PaymentService(db)
        installment = payment_service.update_custom_installment(installment_id, data)

        if not installment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan de cuotas no encontrado"
            )

        logger.info(
            f"Usuario {current_user.username} actualizó custom installment ID: {installment_id}"
        )
        return installment

    except ValueError as e:
        logger.warning(f"Validation error updating custom installment: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating custom installment: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.delete("/custom-installments/{installment_id}")
async def delete_custom_installment(
    installment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """
    Delete a custom installment plan.

    **Path Parameters:**
    - `installment_id`: ID of the installment plan to delete

    **Returns:**
    - Success message

    **Permissions:**
    - Requires ADMIN or MANAGER role
    """
    try:
        payment_service = PaymentService(db)
        deleted = payment_service.delete_custom_installment(installment_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan de cuotas no encontrado"
            )

        logger.info(
            f"Usuario {current_user.username} eliminó custom installment ID: {installment_id}"
        )
        return {"message": "Plan de cuotas eliminado exitosamente"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting custom installment: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.patch("/custom-installments/{installment_id}/toggle", response_model=CustomInstallmentSchema)
async def toggle_custom_installment(
    installment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_manager_required)
):
    """
    Toggle the active status of a custom installment plan.

    **Path Parameters:**
    - `installment_id`: ID of the installment plan to toggle

    **Returns:**
    - Updated custom installment plan with toggled status

    **Permissions:**
    - Requires ADMIN or MANAGER role
    """
    try:
        payment_service = PaymentService(db)
        installment = payment_service.toggle_custom_installment(installment_id)

        if not installment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan de cuotas no encontrado"
            )

        status_text = "activado" if installment.is_active else "desactivado"
        logger.info(
            f"Usuario {current_user.username} {status_text} custom installment ID: {installment_id}"
        )
        return installment

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling custom installment: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )