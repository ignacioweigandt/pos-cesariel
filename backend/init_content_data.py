#!/usr/bin/env python3
"""
Script para inicializar datos de contenido (banners, redes sociales, configuración de tienda)
"""

import os
import sys
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from app.models import StoreBanner, SocialMediaConfig, EcommerceConfig

def create_sample_banners(db: Session):
    """
    Crear banners de ejemplo
    """
    print("Creando banners de ejemplo...")
    
    banners_data = [
        {
            "title": "Nueva Colección Primavera-Verano",
            "subtitle": "Hasta 50% de descuento en toda la colección",
            "image_url": "/placeholder.svg?height=400&width=800&text=Banner+1",
            "link_url": "/productos?categoria=ropa",
            "button_text": "Ver Colección",
            "banner_order": 1,
            "is_active": True
        },
        {
            "title": "Calzado Deportivo",
            "subtitle": "Las mejores marcas al mejor precio",
            "image_url": "/placeholder.svg?height=400&width=800&text=Banner+2",
            "link_url": "/productos?categoria=calzado",
            "button_text": "Comprar Ahora",
            "banner_order": 2,
            "is_active": True
        },
        {
            "title": "Accesorios Únicos",
            "subtitle": "Encuentra tu estilo personal",
            "image_url": "/placeholder.svg?height=400&width=800&text=Banner+3",
            "link_url": "/productos?categoria=accesorios",
            "button_text": "Explorar",
            "banner_order": 3,
            "is_active": True
        }
    ]
    
    for banner_data in banners_data:
        # Verificar si ya existe
        existing = db.query(StoreBanner).filter(StoreBanner.title == banner_data["title"]).first()
        if not existing:
            banner = StoreBanner(**banner_data)
            db.add(banner)
            print(f"  ✓ Banner creado: {banner_data['title']}")
        else:
            print(f"  - Banner ya existe: {banner_data['title']}")

def create_sample_social_media(db: Session):
    """
    Crear configuración de redes sociales de ejemplo
    """
    print("Creando configuración de redes sociales...")
    
    social_media_data = [
        {
            "platform": "instagram",
            "username": "@poscesariel",
            "url": "https://instagram.com/poscesariel",
            "is_active": True,
            "display_order": 1
        },
        {
            "platform": "facebook",
            "username": "POS Cesariel",
            "url": "https://facebook.com/poscesariel",
            "is_active": True,
            "display_order": 2
        },
        {
            "platform": "whatsapp",
            "username": "+54 9 11 1234-5678",
            "url": "https://wa.me/5491112345678",
            "is_active": True,
            "display_order": 3
        },
        {
            "platform": "twitter",
            "username": "@poscesariel",
            "url": "https://twitter.com/poscesariel",
            "is_active": False,
            "display_order": 4
        }
    ]
    
    for social_data in social_media_data:
        # Verificar si ya existe
        existing = db.query(SocialMediaConfig).filter(
            SocialMediaConfig.platform == social_data["platform"]
        ).first()
        if not existing:
            social = SocialMediaConfig(**social_data)
            db.add(social)
            print(f"  ✓ Red social creada: {social_data['platform']} - {social_data['username']}")
        else:
            print(f"  - Red social ya existe: {social_data['platform']}")

def create_sample_store_config(db: Session):
    """
    Crear configuración de tienda de ejemplo
    """
    print("Creando configuración de tienda...")
    
    # Verificar si ya existe una configuración activa
    existing_config = db.query(EcommerceConfig).filter(EcommerceConfig.is_active == True).first()
    
    if not existing_config:
        config_data = {
            "store_name": "POS Cesariel - Tienda Online",
            "store_description": "Tu tienda de moda y estilo con los mejores productos y precios",
            "store_logo": "/logo-cesariel.png",
            "contact_email": "info@poscesariel.com",
            "contact_phone": "+54 9 11 1234-5678",
            "address": "Buenos Aires, Argentina",
            "is_active": True,
            "tax_percentage": 21.0,  # IVA Argentina
            "currency": "ARS"
        }
        
        config = EcommerceConfig(**config_data)
        db.add(config)
        print(f"  ✓ Configuración de tienda creada: {config_data['store_name']}")
    else:
        print(f"  - Configuración de tienda ya existe: {existing_config.store_name}")

def main():
    """
    Función principal
    """
    print("=== Inicializando datos de contenido para POS Cesariel ===\n")
    
    # Crear sesión de base de datos
    db = SessionLocal()
    
    try:
        # Crear datos de ejemplo
        create_sample_banners(db)
        print()
        create_sample_social_media(db)
        print()
        create_sample_store_config(db)
        
        # Confirmar cambios
        db.commit()
        print("\n✅ Datos de contenido inicializados correctamente!")
        
    except Exception as e:
        print(f"\n❌ Error al inicializar datos: {str(e)}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()