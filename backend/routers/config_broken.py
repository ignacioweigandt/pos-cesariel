from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth_compat import get_current_active_user
from models import User, EcommerceConfig, PaymentConfig, UserRole
from schemas import (
    EcommerceConfig as EcommerceConfigSchema, 
    EcommerceConfigCreate, 
    EcommerceConfigUpdate,
    PaymentConfig as PaymentConfigSchema,
    PaymentConfigCreate,
    PaymentConfigUpdate
)
from cloudinary_config import upload_image_to_cloudinary, delete_image_from_cloudinary, extract_public_id_from_url
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/config",
    tags=["config"],
    responses={404: {"description": "Not found"}},
)

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

@router.get("/system")
async def get_system_config(
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener configuración general del sistema"""
    try:
        system_config = {
            "app_name": "POS Cesariel",
            "version": "1.0.0",
            "environment": "development",
            "features": {
                "pos": True,
                "ecommerce": True,
                "multi_branch": True,
                "inventory": True,
                "reports": True,
                "websockets": True
            },
            "default_currency": "USD",
            "default_tax_rate": 0.0,
            "max_upload_size": "10MB",
            "session_timeout": 30  # minutos
        }
        
        logger.info(f"Usuario {current_user.username} obtuvo configuración del sistema")
        return system_config
    except Exception as e:
        logger.error(f"Error obteniendo configuración del sistema: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/payment-methods")
async def get_payment_methods(
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener métodos de pago configurados"""
    try:
        payment_methods = [
            {
                "id": 1,
                "name": "Efectivo",
                "code": "CASH",
                "is_active": True,
                "requires_change": True,
                "icon": "💵"
            },
            {
                "id": 2,
                "name": "Tarjeta de Débito",
                "code": "DEBIT_CARD",
                "is_active": True,
                "requires_change": False,
                "icon": "💳"
            },
            {
                "id": 3,
                "name": "Tarjeta de Crédito",
                "code": "CREDIT_CARD",
                "is_active": True,
                "requires_change": False,
                "icon": "💳"
            },
            {
                "id": 4,
                "name": "Transferencia",
                "code": "TRANSFER",
                "is_active": True,
                "requires_change": False,
                "icon": "🏦"
            }
        ]
        
        logger.info(f"Usuario {current_user.username} obtuvo métodos de pago")
        return payment_methods
    except Exception as e:
        logger.error(f"Error obteniendo métodos de pago: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/tax-rates")
async def get_tax_rates(
    current_user: User = Depends(admin_or_manager_required)
):
    """Obtener configuración de impuestos"""
    try:
        tax_rates = [
            {
                "id": 1,
                "name": "IVA General",
                "rate": 21.0,
                "is_active": True,
                "is_default": True,
                "description": "Impuesto al Valor Agregado general"
            },
            {
                "id": 2,
                "name": "IVA Reducido",
                "rate": 10.5,
                "is_active": True,
                "is_default": False,
                "description": "IVA reducido para productos básicos"
            },
            {
                "id": 3,
                "name": "Exento",
                "rate": 0.0,
                "is_active": True,
                "is_default": False,
                "description": "Productos exentos de impuestos"
            }
        ]
        
        logger.info(f"Usuario {current_user.username} obtuvo configuración de impuestos")
        return tax_rates
    except Exception as e:
        logger.error(f"Error obteniendo configuración de impuestos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

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
async def get_payment_configs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener configuraciones de pagos y recargos - versión simplificada"""
    try:
        # Return default payment configurations for now to fix timeout issues
        # TODO: Implement actual database queries once performance is optimized
        from decimal import Decimal
        
        default_configs = [
            {
                "id": 1,
                "payment_type": "efectivo",
                "card_type": None,
                "installments": 1,
                "surcharge_percentage": Decimal("0.00"),
                "is_active": True,
                "description": "Pago en efectivo",
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            },
            {
                "id": 2,
                "payment_type": "tarjeta",
                "card_type": "debito",
                "installments": 1,
                "surcharge_percentage": Decimal("2.50"),
                "is_active": True,
                "description": "Tarjeta de débito",
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            },
            {
                "id": 3,
                "payment_type": "tarjeta",
                "card_type": "credito",
                "installments": 1,
                "surcharge_percentage": Decimal("3.50"),
                "is_active": True,
                "description": "Tarjeta de crédito 1 cuota",
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        ]
        
        return default_configs
        
    except Exception as e:
        logger.error(f"Error obteniendo payment configs: {str(e)}")
        # Return empty list on any error
        return []
        
        # Si no hay configuraciones, crear las por defecto
        if not configs:
            default_configs = [
                # Efectivo
                PaymentConfig(
                    payment_type="efectivo",
                    installments=1,
                    surcharge_percentage=0,
                    description="Pago en efectivo sin recargo"
                ),
                # Transferencia
                PaymentConfig(
                    payment_type="transferencia",
                    installments=1,
                    surcharge_percentage=0,
                    description="Transferencia bancaria sin recargo"
                ),
                # Tarjetas Bancarizadas
                PaymentConfig(
                    payment_type="tarjeta",
                    card_type="bancarizadas",
                    installments=1,
                    surcharge_percentage=0,
                    description="Tarjetas bancarizadas - 1 cuota"
                ),
                PaymentConfig(
                    payment_type="tarjeta",
                    card_type="bancarizadas",
                    installments=3,
                    surcharge_percentage=8,
                    description="Tarjetas bancarizadas - 3 cuotas"
                ),
                PaymentConfig(
                    payment_type="tarjeta",
                    card_type="bancarizadas",
                    installments=6,
                    surcharge_percentage=14,
                    description="Tarjetas bancarizadas - 6 cuotas"
                ),
                PaymentConfig(
                    payment_type="tarjeta",
                    card_type="bancarizadas",
                    installments=9,
                    surcharge_percentage=20,
                    description="Tarjetas bancarizadas - 9 cuotas"
                ),
                PaymentConfig(
                    payment_type="tarjeta",
                    card_type="bancarizadas",
                    installments=12,
                    surcharge_percentage=26,
                    description="Tarjetas bancarizadas - 12 cuotas"
                ),
                # Tarjetas No Bancarizadas
                PaymentConfig(
                    payment_type="tarjeta",
                    card_type="no_bancarizadas",
                    installments=1,
                    surcharge_percentage=15,
                    description="Tarjetas no bancarizadas"
                ),
                # Tarjeta Naranja
                PaymentConfig(
                    payment_type="tarjeta",
                    card_type="tarjeta_naranja",
                    installments=1,
                    surcharge_percentage=15,
                    description="Tarjeta Naranja"
                ),
            ]
            
            for config in default_configs:
                db.add(config)
            
            db.commit()
            
            # Recargar configuraciones
            configs = db.query(PaymentConfig).filter(PaymentConfig.is_active == True).all()
        
        logger.info(f"Usuario {current_user.username} obtuvo configuraciones de pago")
        return configs
    except Exception as e:
        logger.error(f"Error obteniendo configuraciones de pago: {e}")
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
    """Actualizar configuración de pago"""
    try:
        config = db.query(PaymentConfig).filter(PaymentConfig.id == config_id).first()
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuración de pago no encontrada"
            )
        
        # Actualizar solo los campos proporcionados
        update_data = config_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(config, field, value)
        
        db.commit()
        db.refresh(config)
        
        logger.info(f"Usuario {current_user.username} actualizó configuración de pago ID: {config_id}")
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