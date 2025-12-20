from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from app.models import (
    ProductImage, StoreBanner, WhatsAppSale, SocialMediaConfig, WhatsAppConfig,
    Product, Sale, User, EcommerceConfig, OrderStatus
)
from app.schemas import (
    ProductImage as ProductImageSchema,
    ProductImageCreate, ProductImageUpdate,
    StoreBanner as StoreBannerSchema,
    StoreBannerCreate, StoreBannerUpdate,
    WhatsAppSale as WhatsAppSaleSchema,
    WhatsAppSaleCreate, WhatsAppSaleUpdate,
    SocialMediaConfig as SocialMediaConfigSchema,
    SocialMediaConfigCreate, SocialMediaConfigUpdate,
    WhatsAppConfig as WhatsAppConfigSchema,
    WhatsAppConfigCreate, WhatsAppConfigUpdate,
    ProductWithImages, EcommerceStoreData,
    WhatsAppSaleWithDetails, EcommerceSalesReport,
    SaleStatusUpdate
)
from auth_compat import get_current_user
import os
from datetime import datetime
import uuid
import httpx
from cloudinary_config import (
    upload_image_to_cloudinary,
    delete_image_from_cloudinary,
    extract_public_id_from_url
)

router = APIRouter(prefix="/ecommerce-advanced", tags=["E-commerce Advanced"])

# E-commerce frontend URL for cache revalidation
ECOMMERCE_URL = os.getenv("ECOMMERCE_URL", "https://e-commerce-production-3634.up.railway.app")

async def revalidate_ecommerce_cache(tag: str = "banners"):
    """
    Revalidate Next.js cache in e-commerce frontend
    This ensures banner changes are immediately visible
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{ECOMMERCE_URL}/api/revalidate?tag={tag}")
            if response.status_code == 200:
                print(f"✅ E-commerce cache revalidated for tag: {tag}")
            else:
                print(f"⚠️  E-commerce cache revalidation failed: {response.status_code}")
    except Exception as e:
        # Don't fail the main operation if cache revalidation fails
        print(f"⚠️  Could not revalidate e-commerce cache: {str(e)}")

# File upload configuration
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file"""
    if not file.filename:
        return False
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        return False
        
    return True

async def upload_file_to_cloudinary(file: UploadFile, folder: str) -> dict:
    """Upload file to Cloudinary and return URL info"""
    # Read file content
    file_content = await file.read()
    # Reset file position for potential re-reading
    file.file.seek(0)
    
    # Upload to Cloudinary
    result = upload_image_to_cloudinary(
        file_content=file_content,
        filename=file.filename,
        folder=folder
    )
    
    return result

# ==================== PRODUCT IMAGES ENDPOINTS ====================

@router.get("/products/{product_id}/images", response_model=List[ProductImageSchema])
def get_product_images(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all images for a specific product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).order_by(ProductImage.image_order).all()
    
    return images

@router.post("/products/{product_id}/images", response_model=ProductImageSchema)
async def add_product_image(
    product_id: int,
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    is_main: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new image to a product (max 3 images per product)"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check image limit (max 3 images per product)
    existing_count = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).count()
    
    if existing_count >= 3:
        raise HTTPException(
            status_code=400, 
            detail="Maximum 3 images allowed per product"
        )
    
    # Validate file
    if not validate_file(file):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Allowed: jpg, jpeg, png, gif, webp"
        )
    
    # Upload file to Cloudinary
    try:
        upload_result = await upload_file_to_cloudinary(file, "products")
        
        # If this is set as main, remove main flag from other images
        if is_main:
            db.query(ProductImage).filter(
                ProductImage.product_id == product_id,
                ProductImage.is_main == True
            ).update({"is_main": False})
        
        # Create database record
        db_image = ProductImage(
            product_id=product_id,
            image_url=upload_result["url"],
            image_order=existing_count + 1,
            alt_text=alt_text or f"{product.name} - Image {existing_count + 1}",
            is_main=is_main
        )
        
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        return db_image
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")

@router.put("/products/images/{image_id}", response_model=ProductImageSchema)
def update_product_image(
    image_id: int,
    image_update: ProductImageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update product image metadata"""
    db_image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # If setting as main, remove main flag from other images of the same product
    if image_update.is_main:
        db.query(ProductImage).filter(
            ProductImage.product_id == db_image.product_id,
            ProductImage.id != image_id,
            ProductImage.is_main == True
        ).update({"is_main": False})
    
    # Update fields
    for field, value in image_update.model_dump(exclude_unset=True).items():
        setattr(db_image, field, value)
    
    db.commit()
    db.refresh(db_image)
    return db_image

@router.delete("/products/images/{image_id}")
def delete_product_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a product image"""
    db_image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete file from Cloudinary
    try:
        public_id = extract_public_id_from_url(db_image.image_url)
        if public_id:
            delete_image_from_cloudinary(public_id)
    except Exception as e:
        print(f"Warning: Could not delete file from Cloudinary {db_image.image_url}: {e}")
    
    # Delete from database
    db.delete(db_image)
    db.commit()
    
    return {"message": "Image deleted successfully"}

# ==================== STORE BANNERS ENDPOINTS ====================

@router.get("/banners", response_model=List[StoreBannerSchema])
def get_store_banners(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all store banners"""
    query = db.query(StoreBanner)
    
    if active_only:
        query = query.filter(StoreBanner.is_active == True)
    
    banners = query.order_by(StoreBanner.banner_order).all()
    return banners

@router.post("/banners", response_model=StoreBannerSchema)
async def create_store_banner(
    title: str = Form(...),
    subtitle: Optional[str] = Form(None),
    button_text: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new store banner (max 3 banners)"""
    # Check banner limit (max 3 banners)
    existing_count = db.query(StoreBanner).count()
    if existing_count >= 3:
        raise HTTPException(
            status_code=400,
            detail="Maximum 3 banners allowed"
        )
    
    # Validate file
    if not validate_file(file):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Allowed: jpg, jpeg, png, gif, webp"
        )
    
    # Upload file to Cloudinary
    try:
        upload_result = await upload_file_to_cloudinary(file, "banners")
        
        # Create database record
        db_banner = StoreBanner(
            title=title,
            subtitle=subtitle,
            image_url=upload_result["url"],
            button_text=button_text,
            banner_order=existing_count + 1
        )
        
        db.add(db_banner)
        db.commit()
        db.refresh(db_banner)

        # Revalidate e-commerce cache so new banner appears immediately
        await revalidate_ecommerce_cache("banners")

        return db_banner

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving banner: {str(e)}")

@router.put("/banners/{banner_id}", response_model=StoreBannerSchema)
async def update_store_banner(
    banner_id: int,
    banner_update: StoreBannerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update store banner"""
    db_banner = db.query(StoreBanner).filter(StoreBanner.id == banner_id).first()
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    # Update fields
    for field, value in banner_update.model_dump(exclude_unset=True).items():
        setattr(db_banner, field, value)

    db.commit()
    db.refresh(db_banner)

    # Revalidate e-commerce cache
    await revalidate_ecommerce_cache("banners")

    return db_banner

@router.put("/banners/{banner_id}/image", response_model=StoreBannerSchema)
async def update_store_banner_with_image(
    banner_id: int,
    title: str = Form(...),
    subtitle: Optional[str] = Form(None),
    button_text: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update store banner with new image"""
    db_banner = db.query(StoreBanner).filter(StoreBanner.id == banner_id).first()
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    # Validate file
    if not validate_file(file):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Allowed: jpg, jpeg, png, gif, webp"
        )
    
    # Delete old image from Cloudinary
    try:
        old_public_id = extract_public_id_from_url(db_banner.image_url)
        if old_public_id:
            delete_image_from_cloudinary(old_public_id)
    except Exception as e:
        print(f"Warning: Could not delete old file from Cloudinary {db_banner.image_url}: {e}")
    
    # Upload new file to Cloudinary
    try:
        # Use the same upload function as create_store_banner
        upload_result = await upload_file_to_cloudinary(file, "banners")
        
        image_url = upload_result["url"]
        
        # Update banner fields
        db_banner.title = title
        db_banner.subtitle = subtitle
        db_banner.button_text = button_text
        db_banner.image_url = image_url

        db.commit()
        db.refresh(db_banner)

        # Revalidate e-commerce cache
        await revalidate_ecommerce_cache("banners")

        return db_banner

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )

@router.delete("/banners/{banner_id}")
async def delete_store_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a store banner"""
    db_banner = db.query(StoreBanner).filter(StoreBanner.id == banner_id).first()
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    # Delete file from Cloudinary
    try:
        public_id = extract_public_id_from_url(db_banner.image_url)
        if public_id:
            delete_image_from_cloudinary(public_id)
    except Exception as e:
        print(f"Warning: Could not delete file from Cloudinary {db_banner.image_url}: {e}")

    # Delete from database
    db.delete(db_banner)
    db.commit()

    # Revalidate e-commerce cache
    await revalidate_ecommerce_cache("banners")

    return {"message": "Banner deleted successfully"}

# ==================== WHATSAPP SALES ENDPOINTS ====================

@router.get("/whatsapp-sales", response_model=List[WhatsAppSaleWithDetails])
def get_whatsapp_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all WhatsApp sales with details"""
    whatsapp_sales = db.query(WhatsAppSale).join(Sale).order_by(
        WhatsAppSale.created_at.desc()
    ).all()
    
    return whatsapp_sales

@router.post("/fix-whatsapp-sales-shipping")
def fix_whatsapp_sales_shipping(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fix shipping method detection for existing WhatsApp sales"""
    whatsapp_sales = db.query(WhatsAppSale).join(Sale).all()
    fixed_count = 0
    
    for whatsapp_sale in whatsapp_sales:
        if whatsapp_sale.sale and whatsapp_sale.sale.notes:
            notes = whatsapp_sale.sale.notes
            original_method = whatsapp_sale.shipping_method
            
            # Detectar método de envío correcto
            new_shipping_method = "pickup"
            new_customer_address = None
            new_shipping_cost = 0
            
            if ("Domicilio" in notes or 
                "ENVÍO A DOMICILIO" in notes or 
                "Envío a Domicilio" in notes or
                "delivery" in notes.lower()):
                new_shipping_method = "delivery"
                # Calcular costo de envío
                if whatsapp_sale.sale.total_amount < 10000:
                    new_shipping_cost = 1500
            elif ("Retiro" in notes or 
                  "pickup" in notes.lower()):
                new_shipping_method = "pickup"
            
            # Extraer dirección de las notas
            lines = notes.split('\n')
            for line in lines:
                if line.startswith('Dirección:'):
                    new_customer_address = line.replace('Dirección:', '').strip()
                    break
            
            # Actualizar si hay cambios
            if (original_method != new_shipping_method or 
                whatsapp_sale.customer_address != new_customer_address or
                whatsapp_sale.shipping_cost != new_shipping_cost):
                
                whatsapp_sale.shipping_method = new_shipping_method
                whatsapp_sale.customer_address = new_customer_address
                whatsapp_sale.shipping_cost = new_shipping_cost
                fixed_count += 1
    
    db.commit()
    
    return {
        "message": f"Fixed shipping information for {fixed_count} WhatsApp sales",
        "fixed_count": fixed_count
    }

@router.post("/whatsapp-sales", response_model=WhatsAppSaleSchema)
def create_whatsapp_sale(
    whatsapp_sale: WhatsAppSaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new WhatsApp sale record"""
    # Verify sale exists
    sale = db.query(Sale).filter(Sale.id == whatsapp_sale.sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Generate WhatsApp chat URL
    phone_number = whatsapp_sale.customer_whatsapp.replace("+", "").replace(" ", "")
    message = f"Hola {whatsapp_sale.customer_name}, gracias por tu compra. Tu pedido #{sale.sale_number} está siendo procesado."
    whatsapp_url = f"https://wa.me/{phone_number}?text={message}"
    
    # Create WhatsApp sale record
    db_whatsapp_sale = WhatsAppSale(
        **whatsapp_sale.model_dump(),
        whatsapp_chat_url=whatsapp_url
    )
    
    db.add(db_whatsapp_sale)
    db.commit()
    db.refresh(db_whatsapp_sale)
    
    return db_whatsapp_sale

@router.put("/whatsapp-sales/{whatsapp_sale_id}", response_model=WhatsAppSaleSchema)
def update_whatsapp_sale(
    whatsapp_sale_id: int,
    whatsapp_sale_update: WhatsAppSaleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update WhatsApp sale"""
    db_whatsapp_sale = db.query(WhatsAppSale).filter(
        WhatsAppSale.id == whatsapp_sale_id
    ).first()
    
    if not db_whatsapp_sale:
        raise HTTPException(status_code=404, detail="WhatsApp sale not found")
    
    # Update fields
    for field, value in whatsapp_sale_update.model_dump(exclude_unset=True).items():
        setattr(db_whatsapp_sale, field, value)
    
    # Update WhatsApp URL if phone number changed
    if whatsapp_sale_update.customer_whatsapp:
        phone_number = db_whatsapp_sale.customer_whatsapp.replace("+", "").replace(" ", "")
        message = f"Hola {db_whatsapp_sale.customer_name}, gracias por tu compra."
        db_whatsapp_sale.whatsapp_chat_url = f"https://wa.me/{phone_number}?text={message}"
    
    db.commit()
    db.refresh(db_whatsapp_sale)
    
    return db_whatsapp_sale

# ==================== SOCIAL MEDIA CONFIG ENDPOINTS ====================

@router.get("/social-media", response_model=List[SocialMediaConfigSchema])
def get_social_media_configs(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all social media configurations"""
    query = db.query(SocialMediaConfig)
    
    if active_only:
        query = query.filter(SocialMediaConfig.is_active == True)
    
    configs = query.order_by(SocialMediaConfig.display_order).all()
    return configs

@router.post("/social-media", response_model=SocialMediaConfigSchema)
def create_social_media_config(
    social_config: SocialMediaConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new social media configuration"""
    # Check if platform already exists
    existing = db.query(SocialMediaConfig).filter(
        SocialMediaConfig.platform == social_config.platform
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Configuration for {social_config.platform} already exists"
        )
    
    db_config = SocialMediaConfig(**social_config.model_dump())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    
    return db_config

@router.put("/social-media/{config_id}", response_model=SocialMediaConfigSchema)
def update_social_media_config(
    config_id: int,
    config_update: SocialMediaConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update social media configuration"""
    db_config = db.query(SocialMediaConfig).filter(
        SocialMediaConfig.id == config_id
    ).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="Social media config not found")
    
    # Update fields
    for field, value in config_update.model_dump(exclude_unset=True).items():
        setattr(db_config, field, value)
    
    db.commit()
    db.refresh(db_config)
    
    return db_config

@router.delete("/social-media/{config_id}")
def delete_social_media_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete social media configuration"""
    db_config = db.query(SocialMediaConfig).filter(
        SocialMediaConfig.id == config_id
    ).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="Social media config not found")
    
    db.delete(db_config)
    db.commit()
    
    return {"message": "Social media configuration deleted successfully"}

# ==================== DASHBOARD ENDPOINTS ====================

@router.get("/store-data", response_model=EcommerceStoreData)
def get_ecommerce_store_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete store data for e-commerce frontend"""
    # Get store configuration
    store_config = db.query(EcommerceConfig).first()
    if not store_config:
        raise HTTPException(status_code=404, detail="Store configuration not found")
    
    # Get active banners
    banners = db.query(StoreBanner).filter(
        StoreBanner.is_active == True
    ).order_by(StoreBanner.banner_order).all()
    
    # Get active social media configs
    social_media = db.query(SocialMediaConfig).filter(
        SocialMediaConfig.is_active == True
    ).order_by(SocialMediaConfig.display_order).all()
    
    # Get featured products with images
    featured_products = db.query(Product).filter(
        Product.show_in_ecommerce == True,
        Product.is_active == True
    ).limit(8).all()
    
    return EcommerceStoreData(
        store_config=store_config,
        banners=banners,
        social_media=social_media,
        featured_products=featured_products
    )

@router.get("/sales-report", response_model=EcommerceSalesReport)
def get_ecommerce_sales_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get e-commerce sales report with WhatsApp sales data"""
    # Get WhatsApp sales statistics
    whatsapp_sales = db.query(WhatsAppSale).join(Sale).all()
    
    total_whatsapp_sales = len(whatsapp_sales)
    total_whatsapp_revenue = sum(sale.sale.total_amount for sale in whatsapp_sales)
    
    # Get recent sales
    recent_sales = db.query(WhatsAppSale).join(Sale).order_by(
        WhatsAppSale.created_at.desc()
    ).limit(10).all()
    
    # Count pending and completed orders
    pending_orders = db.query(WhatsAppSale).join(Sale).filter(
        Sale.order_status.in_(["PENDING", "PROCESSING"])
    ).count()
    
    completed_orders = db.query(WhatsAppSale).join(Sale).filter(
        Sale.order_status.in_(["DELIVERED"])
    ).count()
    
    return EcommerceSalesReport(
        total_whatsapp_sales=total_whatsapp_sales,
        total_whatsapp_revenue=total_whatsapp_revenue,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        recent_sales=recent_sales
    )

# ==================== WHATSAPP CONFIG ENDPOINTS ====================

@router.get("/whatsapp-config", response_model=WhatsAppConfigSchema)
def get_whatsapp_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get WhatsApp business configuration"""
    config = db.query(WhatsAppConfig).filter(WhatsAppConfig.is_active == True).first()
    
    if not config:
        # Return default config if none exists
        return WhatsAppConfigSchema(
            id=0,
            business_phone="",
            business_name="Mi Negocio",
            welcome_message="¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?",
            business_hours="Lunes a Viernes: 9:00 - 18:00",
            auto_response_enabled=False,
            is_active=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    return config

@router.post("/whatsapp-config", response_model=WhatsAppConfigSchema)
def create_or_update_whatsapp_config(
    config_data: WhatsAppConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update WhatsApp business configuration"""
    # Check if config already exists
    existing_config = db.query(WhatsAppConfig).filter(WhatsAppConfig.is_active == True).first()
    
    if existing_config:
        # Update existing config
        for field, value in config_data.model_dump(exclude_unset=True).items():
            setattr(existing_config, field, value)
        
        db.commit()
        db.refresh(existing_config)
        return existing_config
    else:
        # Create new config
        db_config = WhatsAppConfig(**config_data.model_dump())
        db.add(db_config)
        db.commit()
        db.refresh(db_config)
        return db_config

@router.put("/whatsapp-config/{config_id}", response_model=WhatsAppConfigSchema)
def update_whatsapp_config(
    config_id: int,
    config_update: WhatsAppConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update WhatsApp business configuration"""
    db_config = db.query(WhatsAppConfig).filter(WhatsAppConfig.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="WhatsApp configuration not found")
    
    # Update fields
    for field, value in config_update.model_dump(exclude_unset=True).items():
        setattr(db_config, field, value)
    
    db.commit()
    db.refresh(db_config)
    return db_config

@router.delete("/whatsapp-config/{config_id}")
def delete_whatsapp_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete WhatsApp business configuration"""
    db_config = db.query(WhatsAppConfig).filter(WhatsAppConfig.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="WhatsApp configuration not found")
    
    db.delete(db_config)
    db.commit()
    
    return {"message": "WhatsApp configuration deleted successfully"}

@router.put("/sales/{sale_id}/status")
async def update_ecommerce_sale_status(
    sale_id: int,
    status_update: SaleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update e-commerce sale status with more permissive authorization"""
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # More permissive authorization for e-commerce sales
    # Allow ADMIN and MANAGER roles to update any e-commerce sale
    if current_user.role.value not in ["ADMIN", "MANAGER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators and managers can update sale status"
        )
    
    # For e-commerce sales, allow any admin/manager to update
    # For POS sales, check branch ownership
    if sale.sale_type.value == "POS" and current_user.role.value != "ADMIN" and sale.branch_id != current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this POS sale"
        )
    
    sale.order_status = status_update.new_status
    db.commit()
    db.refresh(sale)

    return {"message": "Sale status updated successfully", "new_status": status_update.new_status}

# ==================== DASHBOARD STATS ENDPOINT ====================

@router.get("/dashboard/stats")
def get_ecommerce_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get real-time e-commerce dashboard statistics
    Returns:
    - total_online_products: Number of active products shown in e-commerce
    - total_online_sales: Total revenue from e-commerce sales
    - total_online_orders: Number of e-commerce orders
    - pending_orders: Number of orders with pending status
    - conversion_rate: Percentage based on completed vs total orders
    """
    try:
        from sqlalchemy import func
        from decimal import Decimal
        from app.models import SaleType, OrderStatus

        # Count products visible in e-commerce
        total_online_products = db.query(Product).filter(
            Product.show_in_ecommerce == True,
            Product.is_active == True
        ).count()

        # Get e-commerce sales statistics
        ecommerce_sales_query = db.query(Sale).filter(
            Sale.sale_type == SaleType.ECOMMERCE
        )

        # Total e-commerce revenue (excluding cancelled orders)
        total_online_sales = ecommerce_sales_query.filter(
            Sale.order_status != OrderStatus.CANCELLED
        ).with_entities(func.sum(Sale.total_amount)).scalar() or Decimal("0.00")

        # Total e-commerce orders
        total_online_orders = ecommerce_sales_query.count()

        # Pending orders count
        pending_orders = ecommerce_sales_query.filter(
            Sale.order_status == OrderStatus.PENDING
        ).count()

        # Delivered orders count (completed)
        delivered_orders = ecommerce_sales_query.filter(
            Sale.order_status == OrderStatus.DELIVERED
        ).count()

        # Calculate conversion rate (delivered orders / total orders * 100)
        conversion_rate = 0.0
        if total_online_orders > 0:
            conversion_rate = round((delivered_orders / total_online_orders) * 100, 2)

        return {
            "data": {
                "total_online_products": total_online_products,
                "total_online_sales": float(total_online_sales),
                "total_online_orders": total_online_orders,
                "pending_orders": pending_orders,
                "delivered_orders": delivered_orders,
                "conversion_rate": conversion_rate
            }
        }

    except Exception as e:
        print(f"Error getting e-commerce dashboard stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener estadísticas del dashboard: {str(e)}"
        )