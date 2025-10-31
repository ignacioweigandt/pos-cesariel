# Router para gestión de contenido (Banners, Logo, Redes Sociales)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from auth_compat import get_current_user
from app.models import User, StoreBanner, SocialMediaConfig, EcommerceConfig
from app.schemas import (
    StoreBannerCreate, StoreBannerUpdate, StoreBanner as StoreBannerSchema,
    SocialMediaConfigCreate, SocialMediaConfigUpdate, SocialMediaConfig as SocialMediaConfigSchema,
    EcommerceConfigCreate, EcommerceConfigUpdate, EcommerceConfig as EcommerceConfigSchema
)

router = APIRouter(prefix="/content", tags=["Content Management"])

# ===== BANNERS =====

@router.get("/banners", response_model=List[StoreBannerSchema])
def get_banners(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    active_only: bool = Query(False)
):
    """
    Obtener todos los banners
    """
    query = db.query(StoreBanner)
    
    if active_only:
        query = query.filter(StoreBanner.is_active == True)
    
    banners = query.order_by(StoreBanner.banner_order, StoreBanner.id).all()
    return banners

@router.post("/banners", response_model=StoreBannerSchema)
def create_banner(
    banner_data: StoreBannerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear nuevo banner
    """
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear banners")
    
    db_banner = StoreBanner(**banner_data.dict())
    db.add(db_banner)
    db.commit()
    db.refresh(db_banner)
    
    return db_banner

@router.put("/banners/{banner_id}", response_model=StoreBannerSchema)
def update_banner(
    banner_id: int,
    banner_data: StoreBannerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar banner existente
    """
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar banners")
    
    db_banner = db.query(StoreBanner).filter(StoreBanner.id == banner_id).first()
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    
    # Actualizar solo los campos proporcionados
    for field, value in banner_data.dict(exclude_unset=True).items():
        setattr(db_banner, field, value)
    
    db_banner.updated_at = datetime.now()
    db.commit()
    db.refresh(db_banner)
    
    return db_banner

@router.delete("/banners/{banner_id}")
def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar banner
    """
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar banners")
    
    db_banner = db.query(StoreBanner).filter(StoreBanner.id == banner_id).first()
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner no encontrado")
    
    db.delete(db_banner)
    db.commit()
    
    return {"message": "Banner eliminado exitosamente"}

# ===== REDES SOCIALES =====

@router.get("/social-media", response_model=List[SocialMediaConfigSchema])
def get_social_media(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    active_only: bool = Query(False)
):
    """
    Obtener configuración de redes sociales
    """
    query = db.query(SocialMediaConfig)
    
    if active_only:
        query = query.filter(SocialMediaConfig.is_active == True)
    
    social_media = query.order_by(SocialMediaConfig.display_order, SocialMediaConfig.id).all()
    return social_media

@router.post("/social-media", response_model=SocialMediaConfigSchema)
def create_social_media(
    social_data: SocialMediaConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear nueva configuración de red social
    """
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear configuración de redes sociales")
    
    db_social = SocialMediaConfig(**social_data.dict())
    db.add(db_social)
    db.commit()
    db.refresh(db_social)
    
    return db_social

@router.put("/social-media/{social_id}", response_model=SocialMediaConfigSchema)
def update_social_media(
    social_id: int,
    social_data: SocialMediaConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar configuración de red social
    """
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar redes sociales")
    
    db_social = db.query(SocialMediaConfig).filter(SocialMediaConfig.id == social_id).first()
    if not db_social:
        raise HTTPException(status_code=404, detail="Configuración de red social no encontrada")
    
    # Actualizar solo los campos proporcionados
    for field, value in social_data.dict(exclude_unset=True).items():
        setattr(db_social, field, value)
    
    db_social.updated_at = datetime.now()
    db.commit()
    db.refresh(db_social)
    
    return db_social

@router.delete("/social-media/{social_id}")
def delete_social_media(
    social_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar configuración de red social
    """
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar redes sociales")
    
    db_social = db.query(SocialMediaConfig).filter(SocialMediaConfig.id == social_id).first()
    if not db_social:
        raise HTTPException(status_code=404, detail="Configuración de red social no encontrada")
    
    db.delete(db_social)
    db.commit()
    
    return {"message": "Configuración de red social eliminada exitosamente"}

# ===== CONFIGURACIÓN DE TIENDA =====

@router.get("/store-config", response_model=EcommerceConfigSchema)
def get_store_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener configuración de la tienda
    """
    config = db.query(EcommerceConfig).filter(EcommerceConfig.is_active == True).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuración de tienda no encontrada")
    
    return config

@router.put("/store-config", response_model=EcommerceConfigSchema)
def update_store_config(
    config_data: EcommerceConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar configuración de la tienda
    """
    if current_user.role not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar la configuración de la tienda")
    
    config = db.query(EcommerceConfig).filter(EcommerceConfig.is_active == True).first()
    
    if not config:
        # Crear nueva configuración si no existe
        config = EcommerceConfig(**config_data.dict())
        db.add(config)
    else:
        # Actualizar configuración existente
        for field, value in config_data.dict(exclude_unset=True).items():
            setattr(config, field, value)
        config.updated_at = datetime.now()
    
    db.commit()
    db.refresh(config)
    
    return config

@router.post("/store-config", response_model=EcommerceConfigSchema)
def create_store_config(
    config_data: EcommerceConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear configuración inicial de la tienda
    """
    if current_user.role not in ["ADMIN"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear configuración de tienda")
    
    # Verificar que no exista una configuración activa
    existing_config = db.query(EcommerceConfig).filter(EcommerceConfig.is_active == True).first()
    if existing_config:
        raise HTTPException(status_code=400, detail="Ya existe una configuración de tienda activa")
    
    db_config = EcommerceConfig(**config_data.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    
    return db_config