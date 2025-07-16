# Rutas públicas para e-commerce (sin autenticación)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
from database import get_db
from models import Product, Category, Sale, SaleItem, InventoryMovement, User, Branch, SaleType, StoreBanner, SocialMediaConfig, EcommerceConfig, WhatsAppSale, ProductSize, WhatsAppConfig, ProductImage
from schemas import SaleCreate
from websocket_manager import notify_new_sale

def generate_sale_number(sale_type: SaleType) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    prefix = "POS" if sale_type == SaleType.POS else "ECM"
    return f"{prefix}-{timestamp}-{str(uuid.uuid4())[:8].upper()}"

def get_whatsapp_config(db: Session):
    """Get active WhatsApp configuration from database"""
    try:
        config = db.query(WhatsAppConfig).filter(
            WhatsAppConfig.is_active == True
        ).first()
        return config
    except Exception as e:
        print(f"Error getting WhatsApp config: {str(e)}")
        return None

def format_whatsapp_phone(phone: str, config_phone: str = None) -> str:
    """Format phone number for WhatsApp with fallback to configured business number"""
    if not phone:
        if config_phone:
            return config_phone.replace("+", "").replace(" ", "").replace("-", "")
        return "549111234567"  # Fallback number
    
    # Clean the provided phone number
    clean_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
    
    # Add Argentina country code if needed
    if not clean_phone.startswith("549"):
        if clean_phone.startswith("9"):
            clean_phone = "54" + clean_phone
        else:
            clean_phone = "549" + clean_phone
    
    return clean_phone

def generate_whatsapp_message(customer_name: str, sale_number: str, config: WhatsAppConfig = None) -> str:
    """Generate WhatsApp message using configuration template or default"""
    if config and config.welcome_message:
        # Replace template variables
        message = config.welcome_message.replace("{customer_name}", customer_name)
        message = message.replace("{sale_number}", sale_number)
        return message
    else:
        # Default message
        return f"Hola {customer_name}, gracias por tu compra en nuestro e-commerce. Tu pedido #{sale_number} está siendo procesado."

router = APIRouter(prefix="/ecommerce", tags=["E-commerce Public"])

@router.get("/health")
def ecommerce_health():
    """
    Health check para endpoints de e-commerce
    """
    return {
        "status": "healthy",
        "service": "E-commerce Public API",
        "endpoints": [
            "/ecommerce/products",
            "/ecommerce/products/{id}",
            "/ecommerce/products/{id}/sizes",
            "/ecommerce/products/{id}/images",
            "/ecommerce/categories", 
            "/ecommerce/banners",
            "/ecommerce/social-media",
            "/ecommerce/store-config",
            "/ecommerce/whatsapp-config",
            "/ecommerce/sales"
        ]
    }

@router.get("/products")
def get_ecommerce_products(
    db: Session = Depends(get_db),
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    in_stock: Optional[bool] = None
):
    """
    Obtener productos habilitados para e-commerce (sin autenticación requerida)
    """
    try:
        query = db.query(Product).filter(
            Product.show_in_ecommerce == True,
            Product.is_active == True
        )
        
        # Filtros opcionales
        if category:
            query = query.join(Category).filter(Category.name.ilike(f"%{category}%"))
        
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%"))
            
        if featured is not None:
            # Usar ecommerce_price como indicador de productos destacados
            if featured:
                query = query.filter(Product.ecommerce_price.isnot(None))
            else:
                query = query.filter(Product.ecommerce_price.is_(None))
            
        if in_stock:
            query = query.filter(Product.stock_quantity > 0)
        
        # Ordenar por productos con ecommerce_price primero (destacados), luego por nombre
        query = query.order_by(Product.ecommerce_price.desc().nullslast(), Product.name)
        
        products = query.offset(offset).limit(limit).all()
        
        # Convertir a diccionario para la respuesta
        result = []
        for product in products:
            result.append({
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": float(product.ecommerce_price) if product.ecommerce_price else float(product.price),
                "stock": product.stock_quantity,
                "featured": product.ecommerce_price is not None,
                "is_active": product.is_active,
                "show_in_ecommerce": product.show_in_ecommerce,
                "category_id": product.category_id,
                "image_url": product.image_url,
                "has_sizes": product.has_sizes,
                "created_at": product.created_at.isoformat() if product.created_at else None
            })
        
        return {"data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener productos: {str(e)}")

@router.get("/products/{product_id}")
def get_ecommerce_product(product_id: int, db: Session = Depends(get_db)):
    """
    Obtener un producto específico para e-commerce
    """
    try:
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.show_in_ecommerce == True,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
            
        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": float(product.ecommerce_price) if product.ecommerce_price else float(product.price),
            "stock": product.stock_quantity,
            "featured": product.ecommerce_price is not None,
            "is_active": product.is_active,
            "show_in_ecommerce": product.show_in_ecommerce,
            "category_id": product.category_id,
            "image_url": product.image_url,
            "has_sizes": product.has_sizes,
            "created_at": product.created_at.isoformat() if product.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener producto: {str(e)}")

@router.get("/products/{product_id}/sizes")
def get_ecommerce_product_sizes(product_id: int, db: Session = Depends(get_db)):
    """
    Obtener talles disponibles para un producto específico en e-commerce (sin autenticación)
    """
    try:
        # Verificar que el producto existe y está habilitado para e-commerce
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.show_in_ecommerce == True,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # Si el producto no tiene talles, retornar respuesta vacía
        if not product.has_sizes:
            return {
                "product_id": product_id,
                "product_name": product.name,
                "has_sizes": False,
                "available_sizes": []
            }
        
        # Obtener talles disponibles con stock > 0 de todas las sucursales
        # Para e-commerce, mostramos talles que tengan stock en cualquier sucursal
        available_sizes = db.query(ProductSize).filter(
            ProductSize.product_id == product_id,
            ProductSize.stock_quantity > 0
        ).all()
        
        # Agrupar por talle y sumar stock de todas las sucursales
        size_stock_map = {}
        for size_item in available_sizes:
            size = size_item.size
            if size in size_stock_map:
                size_stock_map[size] += size_item.stock_quantity
            else:
                size_stock_map[size] = size_item.stock_quantity
        
        # Convertir a lista de diccionarios
        sizes_list = []
        for size, total_stock in size_stock_map.items():
            sizes_list.append({
                "size": size,
                "stock": total_stock
            })
        
        # Ordenar talles (numeros primero, luego letras)
        def sort_sizes(size_dict):
            size = size_dict["size"]
            # Intentar convertir a número para ordenar numéricamente
            try:
                return (0, int(size))  # Números van primero
            except ValueError:
                return (1, size.upper())  # Letras van después, ordenadas alfabéticamente
        
        sizes_list.sort(key=sort_sizes)
        
        return {
            "product_id": product_id,
            "product_name": product.name,
            "has_sizes": True,
            "available_sizes": sizes_list
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener talles del producto: {str(e)}")

@router.get("/products/{product_id}/images")
def get_ecommerce_product_images(product_id: int, db: Session = Depends(get_db)):
    """
    Obtener imágenes de un producto específico para e-commerce (sin autenticación)
    """
    try:
        # Verificar que el producto existe y está habilitado para e-commerce
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.show_in_ecommerce == True,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        # Obtener imágenes del producto ordenadas por orden y fecha de creación
        images = db.query(ProductImage).filter(
            ProductImage.product_id == product_id
        ).order_by(ProductImage.image_order.asc(), ProductImage.created_at.asc()).all()
        
        # Convertir a formato esperado por el frontend
        result = []
        for image in images:
            result.append({
                "id": image.id,
                "product_id": image.product_id,
                "image_url": image.image_url,
                "alt_text": image.alt_text,
                "is_main": image.is_main,
                "order": image.image_order,
                "created_at": image.created_at.isoformat() if image.created_at else None
            })
        
        return {"data": result}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener imágenes del producto: {str(e)}")

@router.get("/categories")
def get_ecommerce_categories(db: Session = Depends(get_db)):
    """
    Obtener categorías activas para e-commerce
    """
    try:
        categories = db.query(Category).filter(Category.is_active == True).all()
        
        result = []
        for category in categories:
            result.append({
                "id": category.id,
                "name": category.name,
                "is_active": category.is_active
            })
            
        return {"data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener categorías: {str(e)}")

@router.get("/banners")
def get_ecommerce_banners(db: Session = Depends(get_db)):
    """
    Obtener banners activos para e-commerce desde la base de datos
    """
    try:
        # Obtener banners activos ordenados por posición
        banners = db.query(StoreBanner).filter(
            StoreBanner.is_active == True
        ).order_by(StoreBanner.banner_order, StoreBanner.id).all()
        
        # Convertir a formato esperado por el frontend
        result = []
        for banner in banners:
            result.append({
                "id": str(banner.id),
                "title": banner.title,
                "subtitle": banner.subtitle,
                "image": banner.image_url,
                "link": banner.link_url,
                "button_text": banner.button_text,
                "active": banner.is_active,
                "order": banner.banner_order
            })
        
        return {"data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener banners: {str(e)}")

@router.get("/social-media")
def get_ecommerce_social_media(db: Session = Depends(get_db)):
    """
    Obtener configuración de redes sociales activas para e-commerce
    """
    try:
        social_media = db.query(SocialMediaConfig).filter(
            SocialMediaConfig.is_active == True
        ).order_by(SocialMediaConfig.display_order, SocialMediaConfig.id).all()
        
        result = []
        for social in social_media:
            result.append({
                "id": social.id,
                "platform": social.platform,
                "username": social.username,
                "url": social.url,
                "display_order": social.display_order
            })
        
        return {"data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener redes sociales: {str(e)}")

@router.get("/store-config")
def get_ecommerce_store_config(db: Session = Depends(get_db)):
    """
    Obtener configuración de la tienda para e-commerce
    """
    try:
        config = db.query(EcommerceConfig).filter(
            EcommerceConfig.is_active == True
        ).first()
        
        if not config:
            # Retornar configuración por defecto si no existe
            return {
                "data": {
                    "store_name": "POS Cesariel",
                    "store_description": "Tu tienda online",
                    "store_logo": None,
                    "contact_email": "info@poscesariel.com",
                    "contact_phone": "+54 9 11 1234-5678",
                    "address": "Buenos Aires, Argentina",
                    "currency": "ARS",
                    "tax_percentage": 0
                }
            }
        
        return {
            "data": {
                "store_name": config.store_name,
                "store_description": config.store_description,
                "store_logo": config.store_logo,
                "contact_email": config.contact_email,
                "contact_phone": config.contact_phone,
                "address": config.address,
                "currency": config.currency,
                "tax_percentage": float(config.tax_percentage)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener configuración de tienda: {str(e)}")

@router.get("/whatsapp-config")
def get_ecommerce_whatsapp_config(db: Session = Depends(get_db)):
    """
    Obtener configuración de WhatsApp para e-commerce (sin autenticación requerida)
    """
    try:
        config = get_whatsapp_config(db)
        
        if not config:
            # Retornar configuración por defecto si no existe
            return {
                "data": {
                    "business_phone": "+54 9 11 1234-5678",
                    "business_name": "POS Cesariel",
                    "welcome_message": "¡Hola! Gracias por tu compra. Te contactaremos pronto para coordinar la entrega.",
                    "business_hours": "Lunes a Viernes: 9:00 - 18:00",
                    "auto_response_enabled": False,
                    "is_active": True
                }
            }
        
        return {
            "data": {
                "business_phone": config.business_phone,
                "business_name": config.business_name,
                "welcome_message": config.welcome_message,
                "business_hours": config.business_hours,
                "auto_response_enabled": config.auto_response_enabled,
                "is_active": config.is_active
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener configuración de WhatsApp: {str(e)}")

@router.post("/sales")
async def create_ecommerce_sale(sale_data: SaleCreate, db: Session = Depends(get_db)):
    """
    Crear venta desde e-commerce (sin autenticación requerida)
    """
    try:
        # Obtener el primer usuario admin/manager para asignar la venta
        default_user = db.query(User).filter(
            User.role.in_(["ADMIN", "MANAGER"]),
            User.is_active == True
        ).first()
        
        if not default_user:
            raise HTTPException(status_code=500, detail="No se encontró usuario para procesar la venta")
        
        # Obtener la primera sucursal activa
        default_branch = db.query(Branch).filter(Branch.is_active == True).first()
        
        if not default_branch:
            raise HTTPException(status_code=500, detail="No se encontró sucursal para procesar la venta")
        
        # Validar que todos los productos existan y tengan stock
        total_amount = 0
        validated_items = []
        
        for item in sale_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=400, detail=f"Producto {item.product_id} no encontrado")
            
            if not product.is_active:
                raise HTTPException(status_code=400, detail=f"Producto {product.name} no está disponible")
            
            # Check stock based on whether product has sizes
            if product.has_sizes:
                # Products with sizes must have a size specified
                if not item.size:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Producto {product.name} requiere especificar un talle"
                    )
                
                # Check size-specific stock
                from models import ProductSize
                size_stock = db.query(ProductSize).filter(
                    ProductSize.product_id == item.product_id,
                    ProductSize.branch_id == default_branch.id,
                    ProductSize.size == item.size
                ).first()
                
                if not size_stock:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Talle {item.size} no disponible para producto {product.name}"
                    )
                
                if size_stock.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Stock insuficiente para producto {product.name} talle {item.size}. Disponible: {size_stock.stock_quantity}, Solicitado: {item.quantity}"
                    )
            else:
                # Check general stock for products without sizes
                if product.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Stock insuficiente para {product.name}. Disponible: {product.stock_quantity}, Solicitado: {item.quantity}"
                    )
            
            item_total = item.unit_price * item.quantity
            total_amount += item_total
            
            validated_items.append({
                "product": product,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item_total,
                "size": getattr(item, 'size', None)
            })
        
        # Generar número de venta
        sale_number = generate_sale_number(SaleType.ECOMMERCE)
        
        # Las ventas desde el endpoint público siempre son ECOMMERCE
        # Solo las ventas desde el admin POS pueden ser tipo POS
        actual_sale_type = sale_data.sale_type if sale_data.sale_type == "POS" else "ECOMMERCE"
        
        # Determinar estado según tipo de venta
        # POS: venta confirmada (producto ya entregado)
        # ECOMMERCE: venta pendiente (requiere coordinación por WhatsApp)
        order_status = "DELIVERED" if actual_sale_type == "POS" else "PENDING"
        
        # Crear la venta
        db_sale = Sale(
            sale_number=sale_number,
            user_id=default_user.id,
            branch_id=default_branch.id,
            customer_name=sale_data.customer_name,
            customer_email=sale_data.customer_email,
            customer_phone=sale_data.customer_phone,
            subtotal=total_amount,
            tax_amount=0,  # Sin impuestos para e-commerce por ahora
            discount_amount=0,
            total_amount=total_amount,
            payment_method=sale_data.payment_method or "WHATSAPP",
            sale_type=actual_sale_type,
            notes=sale_data.notes,
            order_status=order_status
        )
        
        db.add(db_sale)
        db.flush()  # Para obtener el ID
        
        # Crear los items de venta y actualizar stock SOLO para ventas POS confirmadas
        for item_data in validated_items:
            # Crear item de venta
            sale_item = SaleItem(
                sale_id=db_sale.id,
                product_id=item_data["product"].id,
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"],
                size=item_data["size"]
            )
            db.add(sale_item)
            
            # SOLO actualizar stock para ventas POS (confirmadas)
            # Las ventas ECOMMERCE no desconfan stock hasta que se confirmen por admin
            if actual_sale_type == "POS":
                # Actualizar stock del producto
                product = item_data["product"]
                
                # Update stock based on whether product has sizes
                if product.has_sizes and item_data["size"]:
                    # Update size-specific stock
                    from models import ProductSize
                    size_stock = db.query(ProductSize).filter(
                        ProductSize.product_id == product.id,
                        ProductSize.branch_id == default_branch.id,
                        ProductSize.size == item_data["size"]
                    ).first()
                    
                    if size_stock:
                        old_size_stock = size_stock.stock_quantity
                        new_size_stock = old_size_stock - item_data["quantity"]
                        size_stock.stock_quantity = new_size_stock
                        
                        # Also update general product stock
                        previous_stock = product.stock_quantity
                        product.stock_quantity -= item_data["quantity"]
                        new_stock = product.stock_quantity
                        
                        # Create inventory movement for size stock
                        inventory_movement = InventoryMovement(
                            product_id=product.id,
                            movement_type="OUT",
                            quantity=item_data["quantity"],
                            previous_stock=old_size_stock,
                            new_stock=new_size_stock,
                            reference_id=db_sale.id,
                            reference_type="SALE",
                            notes=f"Venta POS #{db_sale.sale_number or db_sale.id} - Talle {item_data['size']}"
                        )
                        db.add(inventory_movement)
                else:
                    # Update general stock for products without sizes
                    previous_stock = product.stock_quantity
                    product.stock_quantity -= item_data["quantity"]
                    new_stock = product.stock_quantity
                    
                    # Create inventory movement
                    inventory_movement = InventoryMovement(
                        product_id=product.id,
                        movement_type="OUT",
                        quantity=item_data["quantity"],
                        previous_stock=previous_stock,
                        new_stock=new_stock,
                        reference_id=db_sale.id,
                        reference_type="SALE",
                        notes=f"Venta POS #{db_sale.sale_number or db_sale.id}"
                    )
                    db.add(inventory_movement)
        
        # Si es una venta de WhatsApp (solo para ventas ECOMMERCE), crear automáticamente el registro de WhatsApp
        whatsapp_sale_id = None
        if (actual_sale_type == "ECOMMERCE" and 
            db_sale.payment_method == "WHATSAPP" and 
            db_sale.customer_phone and 
            db_sale.customer_name):
            try:
                # Obtener configuración de WhatsApp
                whatsapp_config = get_whatsapp_config(db)
                
                # Extraer información de entrega de las notas
                shipping_method = "pickup"  # Por defecto
                customer_address = None
                shipping_cost = 0
                
                if db_sale.notes:
                    # Detectar método de envío
                    if ("Domicilio" in db_sale.notes or 
                        "ENVÍO A DOMICILIO" in db_sale.notes or 
                        "Envío a Domicilio" in db_sale.notes or
                        "delivery" in db_sale.notes.lower()):
                        shipping_method = "delivery"
                        # Calcular costo de envío
                        if db_sale.total_amount < 10000:
                            shipping_cost = 1500
                    elif ("Retiro" in db_sale.notes or 
                          "pickup" in db_sale.notes.lower()):
                        shipping_method = "pickup"
                    
                    # Extraer dirección de las notas si está disponible
                    lines = db_sale.notes.split('\n')
                    for line in lines:
                        if line.startswith('Dirección:'):
                            customer_address = line.replace('Dirección:', '').strip()
                            break
                
                # Formatear número de teléfono para WhatsApp usando configuración
                phone_number = format_whatsapp_phone(
                    db_sale.customer_phone, 
                    whatsapp_config.business_phone if whatsapp_config else None
                )
                
                # Generar mensaje personalizado usando configuración
                message = generate_whatsapp_message(
                    db_sale.customer_name, 
                    db_sale.sale_number,
                    whatsapp_config
                )
                
                # Decidir a qué número enviar el mensaje
                # Si el cliente no proporcionó teléfono, usar el número de negocio configurado
                target_phone = phone_number
                if not db_sale.customer_phone and whatsapp_config and whatsapp_config.business_phone:
                    target_phone = format_whatsapp_phone(None, whatsapp_config.business_phone)
                    message = f"Nueva venta e-commerce - Cliente: {db_sale.customer_name}, Pedido: #{db_sale.sale_number}, Total: ${db_sale.total_amount}"
                
                # Generar URL de WhatsApp  
                whatsapp_url = f"https://wa.me/{target_phone}?text={message}"
                
                # Crear registro de WhatsApp
                whatsapp_sale = WhatsAppSale(
                    sale_id=db_sale.id,
                    customer_whatsapp=target_phone,
                    customer_name=db_sale.customer_name,
                    customer_address=customer_address,
                    shipping_method=shipping_method,
                    shipping_cost=shipping_cost,
                    notes=f"Venta creada automáticamente desde e-commerce. {db_sale.notes or ''}".strip(),
                    whatsapp_chat_url=whatsapp_url
                )
                
                db.add(whatsapp_sale)
                db.flush()
                whatsapp_sale_id = whatsapp_sale.id
                
            except Exception as e:
                # Si hay error creando el registro de WhatsApp, log pero no fallar la venta
                print(f"Error creando registro de WhatsApp para venta {db_sale.id}: {str(e)}")
        
        db.commit()
        db.refresh(db_sale)
        
        # Enviar notificación WebSocket para nuevas ventas
        try:
            await notify_new_sale(
                sale_id=db_sale.id,
                total_amount=float(db_sale.total_amount),
                branch_id=db_sale.branch_id,
                user_name=f"E-commerce ({db_sale.customer_name})"
            )
        except Exception as e:
            # No fallar la venta si hay error en WebSocket
            print(f"Error enviando notificación WebSocket: {str(e)}")
        
        return {
            "id": db_sale.id,
            "sale_id": db_sale.id,
            "sale_number": db_sale.sale_number,
            "total_amount": float(db_sale.total_amount),
            "customer_name": db_sale.customer_name,
            "order_status": db_sale.order_status,
            "created_at": db_sale.created_at.isoformat(),
            "whatsapp_sale_id": whatsapp_sale_id  # Incluir ID del registro de WhatsApp si se creó
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear la venta: {str(e)}")