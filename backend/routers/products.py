from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
import pandas as pd
import io
from datetime import datetime
from database import get_db
from app.models import Product, User, InventoryMovement, BranchStock, ProductSize, ImportLog, Category, Branch
from app.schemas import (
    Product as ProductSchema, ProductCreate, ProductUpdate,
    InventoryMovement as InventoryMovementSchema, StockAdjustment,
    BulkImportResponse, ProductImportData, BranchStock as BranchStockSchema,
    ProductSize as ProductSizeSchema, UpdateSizeStocks, ProductWithMultiBranchStock
)
from auth_compat import get_current_active_user, require_manager_or_admin
from websocket_manager import notify_inventory_change, notify_low_stock

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
async def get_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    low_stock: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Obtener la sucursal del usuario para filtros específicos
    user_branch_id = current_user.branch_id if current_user.branch_id else None
    
    query = db.query(Product).filter(Product.is_active == True)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                Product.barcode.ilike(f"%{search}%")
            )
        )
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # Para filtro low_stock, consideramos stock de la sucursal específica
    if low_stock and user_branch_id:
        # Filtrar productos con stock bajo en la sucursal del usuario
        query = query.join(BranchStock).filter(
            BranchStock.branch_id == user_branch_id,
            BranchStock.stock_quantity <= Product.min_stock
        )
    elif low_stock:
        # Admin sin sucursal específica - usar stock global
        query = query.filter(Product.stock_quantity <= Product.min_stock)
    
    products = query.offset(skip).limit(limit).all()
    
    # Construir respuesta con stock específico de la sucursal
    result = []
    for product in products:
        if user_branch_id:
            # Usuario con sucursal - mostrar stock de su sucursal
            branch_stock = product.get_stock_for_branch(user_branch_id)
        else:
            # Admin sin sucursal - mostrar stock total calculado
            branch_stock = product.calculate_total_stock()
        
        product_data = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "sku": product.sku,
            "barcode": product.barcode,
            "category_id": product.category_id,
            "price": float(product.price),
            "cost": float(product.cost) if product.cost else None,
            "stock_quantity": branch_stock,
            "min_stock": product.min_stock,
            "is_active": product.is_active,
            "show_in_ecommerce": product.show_in_ecommerce,
            "ecommerce_price": float(product.ecommerce_price) if product.ecommerce_price else None,
            "has_sizes": product.has_sizes,
            "image_url": product.image_url,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "updated_at": product.updated_at.isoformat() if product.updated_at else None
        }
        result.append(product_data)
    
    return result

@router.get("/search")
async def search_products(
    q: str = Query(..., min_length=1),
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    products = db.query(Product).filter(
        Product.is_active == True,
        or_(
            Product.name.ilike(f"%{q}%"),
            Product.sku.ilike(f"%{q}%"),
            Product.barcode.ilike(f"%{q}%")
        )
    ).limit(limit).all()
    
    # Obtener la sucursal del usuario para mostrar stock específico
    user_branch_id = current_user.branch_id if current_user.branch_id else None
    
    result = []
    for product in products:
        # Si el usuario tiene sucursal asignada, mostrar stock de esa sucursal
        if user_branch_id:
            branch_stock = product.get_stock_for_branch(user_branch_id)
        else:
            # Admin sin sucursal específica ve stock total
            branch_stock = product.calculate_total_stock()
            
        result.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "barcode": product.barcode,
            "price": product.price,
            "stock_quantity": branch_stock
        })
    
    return result

@router.get("/barcode/{barcode}")
async def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    product = db.query(Product).filter(
        Product.barcode == barcode,
        Product.is_active == True
    ).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Determinar stock específico según la sucursal del usuario
    user_branch_id = current_user.branch_id if current_user.branch_id else None
    
    if user_branch_id:
        # Usuario con sucursal específica - mostrar stock de su sucursal
        branch_stock = product.get_stock_for_branch(user_branch_id)
    else:
        # Admin sin sucursal específica - mostrar stock total
        branch_stock = product.calculate_total_stock()
    
    # Crear respuesta con stock específico de la sucursal
    product_data = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "sku": product.sku,
        "barcode": product.barcode,
        "category_id": product.category_id,
        "price": float(product.price),
        "cost": float(product.cost) if product.cost else None,
        "stock_quantity": branch_stock,
        "min_stock": product.min_stock,
        "is_active": product.is_active,
        "show_in_ecommerce": product.show_in_ecommerce,
        "ecommerce_price": float(product.ecommerce_price) if product.ecommerce_price else None,
        "has_sizes": product.has_sizes,
        "image_url": product.image_url,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "updated_at": product.updated_at.isoformat() if product.updated_at else None
    }
    
    return product_data

@router.get("/multi-branch-stock")
async def get_products_with_multi_branch_stock(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener productos con stock por sucursal (corregido para manejar productos con y sin talles)"""
    products = db.query(Product).filter(Product.is_active == True).offset(skip).limit(limit).all()
    branches = db.query(Branch).filter(Branch.is_active == True).all()
    
    result = []
    for product in products:
        branch_stock_data = []
        total_stock = 0
        
        if product.has_sizes:
            # Para productos con talles, usar ProductSize
            product_sizes = db.query(ProductSize).filter(
                ProductSize.product_id == product.id
            ).all()
            
            # Agrupar por sucursal
            branch_totals = {}
            for branch in branches:
                branch_total = sum(
                    ps.stock_quantity for ps in product_sizes 
                    if ps.branch_id == branch.id
                )
                branch_totals[branch.id] = branch_total
                total_stock += branch_total
                
                branch_stock_data.append({
                    "branch_id": branch.id,
                    "branch_name": branch.name,
                    "stock_quantity": branch_total,
                    "min_stock": 0  # Los productos con talles no usan min_stock por sucursal
                })
        else:
            # Para productos sin talles, usar BranchStock
            branch_stocks = db.query(BranchStock).filter(
                BranchStock.product_id == product.id
            ).all()
            
            if branch_stocks:
                total_stock = sum(bs.stock_quantity for bs in branch_stocks)
                branch_stock_data = [
                    {
                        "branch_id": bs.branch_id,
                        "branch_name": bs.branch.name,
                        "stock_quantity": bs.stock_quantity,
                        "min_stock": bs.min_stock
                    }
                    for bs in branch_stocks
                ]
            else:
                # Si no tiene stock específico por sucursal, crear entradas con 0
                total_stock = product.stock_quantity
                for branch in branches:
                    branch_stock_data.append({
                        "branch_id": branch.id,
                        "branch_name": branch.name,
                        "stock_quantity": 0,
                        "min_stock": 0
                    })
        
        result.append({
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "has_sizes": product.has_sizes,
            "total_stock": total_stock,
            "branch_stocks": branch_stock_data
        })
    
    return result

@router.get("/{product_id}", response_model=ProductSchema)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductSchema)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    # Check if SKU already exists
    if db.query(Product).filter(Product.sku == product.sku).first():
        raise HTTPException(
            status_code=400,
            detail="SKU already exists"
        )
    
    # Check if barcode already exists
    if product.barcode and db.query(Product).filter(Product.barcode == product.barcode).first():
        raise HTTPException(
            status_code=400,
            detail="Barcode already exists"
        )
    
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Create initial inventory movement
    if db_product.stock_quantity > 0:
        inventory_movement = InventoryMovement(
            product_id=db_product.id,
            movement_type="IN",
            quantity=db_product.stock_quantity,
            previous_stock=0,
            new_stock=db_product.stock_quantity,
            reference_type="INITIAL_STOCK",
            notes="Initial stock"
        )
        db.add(inventory_movement)
        db.commit()
    
    return db_product

@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if SKU already exists (excluding current product)
    if product_update.sku and product_update.sku != product.sku:
        if db.query(Product).filter(Product.sku == product_update.sku, Product.id != product_id).first():
            raise HTTPException(
                status_code=400,
                detail="SKU already exists"
            )
    
    # Check if barcode already exists (excluding current product)
    if product_update.barcode and product_update.barcode != product.barcode:
        if db.query(Product).filter(Product.barcode == product_update.barcode, Product.id != product_id).first():
            raise HTTPException(
                status_code=400,
                detail="Barcode already exists"
            )
    
    update_data = product_update.dict(exclude_unset=True)
    
    # Handle stock quantity change
    if "stock_quantity" in update_data:
        old_stock = product.stock_quantity
        new_stock = update_data["stock_quantity"]
        
        if old_stock != new_stock:
            # Create inventory movement for manual adjustment
            movement_type = "IN" if new_stock > old_stock else "OUT"
            quantity = abs(new_stock - old_stock)
            
            inventory_movement = InventoryMovement(
                product_id=product.id,
                movement_type=movement_type,
                quantity=quantity,
                previous_stock=old_stock,
                new_stock=new_stock,
                reference_type="ADJUSTMENT",
                notes="Manual stock adjustment"
            )
            db.add(inventory_movement)
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Soft delete - just mark as inactive
    product.is_active = False
    db.commit()
    return {"message": "Product deleted successfully"}

@router.get("/{product_id}/inventory-movements", response_model=List[InventoryMovementSchema])
async def get_product_inventory_movements(
    product_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    movements = db.query(InventoryMovement).filter(
        InventoryMovement.product_id == product_id
    ).order_by(InventoryMovement.created_at.desc()).offset(skip).limit(limit).all()
    
    return movements

@router.post("/{product_id}/adjust-stock")
async def adjust_product_stock(
    product_id: int,
    stock_data: StockAdjustment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if stock_data.new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")
    
    old_stock = product.stock_quantity
    
    if old_stock != stock_data.new_stock:
        movement_type = "IN" if stock_data.new_stock > old_stock else "OUT"
        quantity = abs(stock_data.new_stock - old_stock)
        
        # Create inventory movement
        inventory_movement = InventoryMovement(
            product_id=product.id,
            movement_type=movement_type,
            quantity=quantity,
            previous_stock=old_stock,
            new_stock=stock_data.new_stock,
            reference_type="ADJUSTMENT",
            notes=stock_data.notes or "Stock adjustment"
        )
        db.add(inventory_movement)
        
        # Update product stock
        product.stock_quantity = stock_data.new_stock
        
        # For products without sizes, also update BranchStock for current user's branch
        if not product.has_sizes:
            user_branch_id = current_user.branch_id or 1
            
            # Find or create BranchStock for this product and branch
            branch_stock = db.query(BranchStock).filter(
                BranchStock.product_id == product.id,
                BranchStock.branch_id == user_branch_id
            ).first()
            
            if branch_stock:
                # Update existing BranchStock
                old_branch_stock = branch_stock.stock_quantity
                branch_stock.stock_quantity = stock_data.new_stock
                print(f"📦 Updated BranchStock for product {product.id} in branch {user_branch_id}: {old_branch_stock} → {stock_data.new_stock}")
            else:
                # Create new BranchStock entry
                branch_stock = BranchStock(
                    product_id=product.id,
                    branch_id=user_branch_id,
                    stock_quantity=stock_data.new_stock,
                    min_stock=product.min_stock
                )
                db.add(branch_stock)
                print(f"📦 Created new BranchStock for product {product.id} in branch {user_branch_id}: {stock_data.new_stock}")
        
        db.commit()
        db.refresh(product)
        
        # Send WebSocket notification for inventory change
        await notify_inventory_change(
            product_id=product.id,
            old_stock=old_stock,
            new_stock=stock_data.new_stock,
            branch_id=current_user.branch_id or 1,
            user_name=current_user.full_name
        )
        
        # Check for low stock and send alert if needed
        if stock_data.new_stock <= product.min_stock:
            await notify_low_stock(
                product_id=product.id,
                product_name=product.name,
                current_stock=stock_data.new_stock,
                min_stock=product.min_stock,
                branch_id=current_user.branch_id or 1
            )
    
    return {
        "message": "Stock adjusted successfully",
        "previous_stock": old_stock,
        "new_stock": stock_data.new_stock
    }

@router.post("/import-preview")
async def import_products_preview(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """
    Vista previa de importación masiva de productos
    Columnas esperadas: codigo_barra, modelo, efectivo
    """
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="Formato de archivo no soportado. Use CSV o Excel."
        )
    
    try:
        # Leer archivo
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Validar columnas requeridas
        required_columns = ['codigo_barra', 'modelo', 'efectivo']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Columnas requeridas faltantes: {', '.join(missing_columns)}"
            )
        
        # Procesar productos para preview
        preview_data = []
        
        for index, row in df.iterrows():
            try:
                # Validar datos
                if pd.isna(row['codigo_barra']) or pd.isna(row['modelo']) or pd.isna(row['efectivo']):
                    continue
                
                codigo_barra = str(row['codigo_barra']).strip()
                modelo = str(row['modelo']).strip()
                precio = float(row['efectivo'])
                
                # Crear SKU único basado en el modelo
                sku_base = modelo.replace(' ', '_').upper()
                sku_counter = 1
                sku = sku_base
                
                while db.query(Product).filter(Product.sku == sku).first():
                    sku = f"{sku_base}_{sku_counter}"
                    sku_counter += 1
                
                preview_data.append({
                    "name": modelo,
                    "sku": sku,
                    "barcode": codigo_barra,
                    "price": precio,
                    "stock_quantity": 0,
                    "min_stock": 1,
                    "category_id": None,
                    "has_sizes": False
                })
                
            except Exception as e:
                continue
        
        return {
            "preview_data": preview_data,
            "total_rows": len(preview_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")

@router.post("/import-confirm", response_model=BulkImportResponse)
async def import_products_confirm(
    import_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """
    Confirmar importación masiva de productos
    """
    products_data = import_data.get("products", [])
    
    if not products_data:
        raise HTTPException(
            status_code=400,
            detail="No hay productos para importar"
        )
    
    # Crear log de importación
    import_log = ImportLog(
        filename="import_confirm.json",
        user_id=current_user.id,
        status="PROCESSING"
    )
    db.add(import_log)
    db.commit()
    db.refresh(import_log)
    
    try:
        total_rows = len(products_data)
        successful_rows = 0
        failed_rows = 0
        errors = []
        
        for index, product_data in enumerate(products_data):
            try:
                # Verificar si el producto ya existe por código de barras
                existing_product = db.query(Product).filter(Product.barcode == product_data.get('barcode')).first()
                if existing_product:
                    failed_rows += 1
                    errors.append({
                        "row": index + 1,
                        "error": f"Producto con código de barras {product_data.get('barcode')} ya existe"
                    })
                    continue
                
                # Verificar SKU único
                existing_sku = db.query(Product).filter(Product.sku == product_data.get('sku')).first()
                if existing_sku:
                    failed_rows += 1
                    errors.append({
                        "row": index + 1,
                        "error": f"SKU {product_data.get('sku')} ya existe"
                    })
                    continue
                
                # Crear producto
                product = Product(
                    name=product_data.get('name'),
                    sku=product_data.get('sku'),
                    barcode=product_data.get('barcode'),
                    price=product_data.get('price'),
                    cost=product_data.get('price', 0) * 0.7,  # Costo estimado al 70% del precio
                    stock_quantity=product_data.get('stock_quantity', 0),
                    min_stock=product_data.get('min_stock', 1),
                    category_id=product_data.get('category_id'),
                    has_sizes=product_data.get('has_sizes', False)
                )
                
                db.add(product)
                db.flush()  # Para obtener el ID del producto
                
                # Crear movimiento de inventario si hay stock inicial
                if product.stock_quantity > 0:
                    inventory_movement = InventoryMovement(
                        product_id=product.id,
                        movement_type="IN",
                        quantity=product.stock_quantity,
                        previous_stock=0,
                        new_stock=product.stock_quantity,
                        reference_type="IMPORT",
                        notes="Imported product stock"
                    )
                    db.add(inventory_movement)
                
                successful_rows += 1
                
            except Exception as e:
                failed_rows += 1
                errors.append({
                    "row": index + 1,
                    "error": str(e)
                })
        
        # Actualizar log de importación
        import_log.total_rows = total_rows
        import_log.successful_rows = successful_rows
        import_log.failed_rows = failed_rows
        import_log.status = "COMPLETED"
        import_log.completed_at = datetime.now()
        
        if errors:
            import_log.error_details = f"Errores en {len(errors)} filas"
        
        db.commit()
        
        return BulkImportResponse(
            import_log_id=import_log.id,
            message=f"Importación completada: {successful_rows} exitosos, {failed_rows} fallidos",
            total_rows=total_rows,
            successful_rows=successful_rows,
            failed_rows=failed_rows,
            errors=errors[:10]  # Solo los primeros 10 errores
        )
        
    except Exception as e:
        import_log.status = "FAILED"
        import_log.error_details = str(e)
        import_log.completed_at = datetime.now()
        db.commit()
        raise HTTPException(status_code=500, detail=f"Error procesando importación: {str(e)}")

@router.post("/import", response_model=BulkImportResponse)
async def import_products_bulk(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """
    Importar productos masivamente desde archivo CSV/Excel (método legacy)
    Columnas esperadas: codigo_barra, modelo, efectivo
    """
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="Formato de archivo no soportado. Use CSV o Excel."
        )
    
    # Crear log de importación
    import_log = ImportLog(
        filename=file.filename,
        user_id=current_user.id,
        status="PROCESSING"
    )
    db.add(import_log)
    db.commit()
    db.refresh(import_log)
    
    try:
        # Leer archivo
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Validar columnas requeridas
        required_columns = ['codigo_barra', 'modelo', 'efectivo']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            import_log.status = "FAILED"
            import_log.error_details = f"Columnas faltantes: {', '.join(missing_columns)}"
            import_log.completed_at = datetime.now()
            db.commit()
            raise HTTPException(
                status_code=400,
                detail=f"Columnas requeridas faltantes: {', '.join(missing_columns)}"
            )
        
        # Procesar productos
        total_rows = len(df)
        successful_rows = 0
        failed_rows = 0
        errors = []
        
        # Obtener o crear categoría "Importados"
        category = db.query(Category).filter(Category.name == "Importados").first()
        if not category:
            category = Category(name="Importados", description="Productos importados masivamente")
            db.add(category)
            db.commit()
            db.refresh(category)
        
        for index, row in df.iterrows():
            try:
                # Validar datos
                if pd.isna(row['codigo_barra']) or pd.isna(row['modelo']) or pd.isna(row['efectivo']):
                    failed_rows += 1
                    errors.append({
                        "row": index + 1,
                        "error": "Datos requeridos faltantes"
                    })
                    continue
                
                codigo_barra = str(row['codigo_barra']).strip()
                modelo = str(row['modelo']).strip()
                precio = float(row['efectivo'])
                
                # Verificar si el producto ya existe por código de barras
                existing_product = db.query(Product).filter(Product.barcode == codigo_barra).first()
                if existing_product:
                    failed_rows += 1
                    errors.append({
                        "row": index + 1,
                        "error": f"Producto con código de barras {codigo_barra} ya existe"
                    })
                    continue
                
                # Crear SKU único basado en el modelo
                sku_base = modelo.replace(' ', '_').upper()
                sku_counter = 1
                sku = sku_base
                
                while db.query(Product).filter(Product.sku == sku).first():
                    sku = f"{sku_base}_{sku_counter}"
                    sku_counter += 1
                
                # Crear producto
                product = Product(
                    name=modelo,
                    sku=sku,
                    barcode=codigo_barra,
                    price=precio,
                    cost=precio * 0.7,  # Costo estimado al 70% del precio
                    stock_quantity=0,  # Stock inicial 0, se cargará después
                    min_stock=5,
                    category_id=category.id,
                    has_sizes=False
                )
                
                db.add(product)
                successful_rows += 1
                
            except Exception as e:
                failed_rows += 1
                errors.append({
                    "row": index + 1,
                    "error": str(e)
                })
        
        # Actualizar log de importación
        import_log.total_rows = total_rows
        import_log.successful_rows = successful_rows
        import_log.failed_rows = failed_rows
        import_log.status = "COMPLETED"
        import_log.completed_at = datetime.now()
        
        if errors:
            import_log.error_details = f"Errores en {len(errors)} filas"
        
        db.commit()
        
        return BulkImportResponse(
            import_log_id=import_log.id,
            message=f"Importación completada: {successful_rows} exitosos, {failed_rows} fallidos",
            total_rows=total_rows,
            successful_rows=successful_rows,
            failed_rows=failed_rows,
            errors=errors[:10]  # Solo los primeros 10 errores
        )
        
    except Exception as e:
        import_log.status = "FAILED"
        import_log.error_details = str(e)
        import_log.completed_at = datetime.now()
        db.commit()
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")

@router.get("/{product_id}/stock-by-branch")
async def get_product_stock_by_branch(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener stock del producto por todas las sucursales"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Obtener stock por sucursales
    branch_stocks = db.query(BranchStock).filter(
        BranchStock.product_id == product_id
    ).all()
    
    # Si no tiene stock específico por sucursal, retornar stock general
    if not branch_stocks:
        return {
            "product_id": product_id,
            "product_name": product.name,
            "total_stock": product.stock_quantity,
            "branch_stocks": []
        }
    
    total_stock = sum(bs.stock_quantity for bs in branch_stocks)
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "total_stock": total_stock,
        "branch_stocks": [
            {
                "branch_id": bs.branch_id,
                "branch_name": bs.branch.name,
                "stock_quantity": bs.stock_quantity,
                "min_stock": bs.min_stock
            }
            for bs in branch_stocks
        ]
    }

@router.get("/{product_id}/sizes-by-branch")
async def get_product_sizes_by_branch(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener stock de talles por todas las sucursales"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.has_sizes:
        raise HTTPException(
            status_code=400, 
            detail="Este producto no maneja talles"
        )
    
    # Obtener todas las sucursales activas
    branches = db.query(Branch).filter(Branch.is_active == True).all()
    
    # Obtener todos los talles para este producto en todas las sucursales
    product_sizes = db.query(ProductSize).filter(
        ProductSize.product_id == product_id
    ).all()
    
    # Organizar datos por sucursal y talle
    branch_data = {}
    all_sizes = set()
    
    for branch in branches:
        branch_data[branch.id] = {
            "branch_id": branch.id,
            "branch_name": branch.name,
            "sizes": {}
        }
    
    # Llenar los datos de talles por sucursal
    for size_stock in product_sizes:
        branch_id = size_stock.branch_id
        size = size_stock.size
        all_sizes.add(size)
        
        if branch_id in branch_data:
            branch_data[branch_id]["sizes"][size] = {
                "size": size,
                "stock_quantity": size_stock.stock_quantity
            }
    
    # Convertir all_sizes a lista ordenada
    all_sizes_list = sorted(list(all_sizes), key=lambda x: (
        int(x) if x.isdigit() else ord(x[0]) if len(x) == 1 else len(x)
    ))
    
    # Asegurarse de que todas las sucursales tengan todos los talles (con stock 0 si no existen)
    for branch_id in branch_data:
        for size in all_sizes_list:
            if size not in branch_data[branch_id]["sizes"]:
                branch_data[branch_id]["sizes"][size] = {
                    "size": size,
                    "stock_quantity": 0
                }
    
    # Calcular totales por talle
    size_totals = {}
    for size in all_sizes_list:
        total_stock = sum(
            branch_data[branch_id]["sizes"][size]["stock_quantity"]
            for branch_id in branch_data
        )
        size_totals[size] = total_stock
    
    # Convertir a formato final
    result = {
        "product_id": product_id,
        "product_name": product.name,
        "has_sizes": product.has_sizes,
        "all_sizes": all_sizes_list,
        "size_totals": size_totals,
        "total_stock": sum(size_totals.values()),
        "branches": list(branch_data.values())
    }
    
    return result

@router.get("/{product_id}/available-sizes")
async def get_available_sizes_for_pos(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener talles disponibles para POS (solo con stock > 0 y válidos para la categoría)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.has_sizes:
        return {
            "product_id": product_id,
            "product_name": product.name,
            "has_sizes": False,
            "category_name": product.category.name if product.category else None,
            "available_sizes": []
        }
    
    # Get sizes with stock > 0 for current branch
    branch_id = current_user.branch_id or 1
    
    # Get all sizes with stock for this product and branch
    available_sizes = db.query(ProductSize).filter(
        ProductSize.product_id == product_id,
        ProductSize.branch_id == branch_id,
        ProductSize.stock_quantity > 0
    ).all()
    
    # Filter by valid sizes for category and sort
    from utils.size_validators import get_size_display_info, sort_sizes
    
    size_info = get_size_display_info(product.category.name if product.category else "")
    valid_sizes = size_info["valid_sizes"]
    
    # Filter to only include valid sizes for this category
    filtered_sizes = []
    for size in available_sizes:
        if size.size in valid_sizes:
            filtered_sizes.append({
                "size": size.size,
                "stock_quantity": size.stock_quantity
            })
    
    # Sort sizes appropriately
    sorted_sizes = sorted(filtered_sizes, key=lambda x: valid_sizes.index(x["size"]) if x["size"] in valid_sizes else 999)
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "has_sizes": True,
        "category_name": product.category.name if product.category else None,
        "category_type": size_info["category_type"],
        "size_type_label": size_info["size_type_label"],
        "available_sizes": sorted_sizes,
        "all_valid_sizes": valid_sizes  # Para mostrar todos los talles posibles en el frontend
    }

def calculate_total_stock_from_sizes(db: Session, product_id: int, branch_id: int) -> int:
    """
    Calcula el stock total sumando todos los talles de un producto en una sucursal específica
    """
    sizes = db.query(ProductSize).filter(
        ProductSize.product_id == product_id,
        ProductSize.branch_id == branch_id
    ).all()
    
    total_stock = sum(size.stock_quantity for size in sizes)
    return total_stock

@router.post("/{product_id}/sizes")
async def manage_product_sizes(
    product_id: int,
    size_data: UpdateSizeStocks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Gestionar stock de talles para productos de indumentaria/calzado"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.has_sizes:
        raise HTTPException(
            status_code=400, 
            detail="Este producto no maneja talles"
        )
    
    branch_id = current_user.branch_id or 1
    
    # Validar talles según la categoría del producto
    from utils.size_validators import validate_sizes_for_product, get_size_display_info
    
    sizes_to_validate = [size_info.size for size_info in size_data.sizes]
    validation_result = validate_sizes_for_product(db, sizes_to_validate, product_id)
    
    if validation_result["invalid"]:
        size_info = get_size_display_info(product.category.name if product.category else "")
        raise HTTPException(
            status_code=400,
            detail=f"Talles inválidos para esta categoría ({product.category.name if product.category else 'Sin categoría'}): {', '.join(validation_result['invalid'])}. Talles válidos: {', '.join(size_info['valid_sizes'])}"
        )
    
    # Actualizar o crear stock por talle
    for size_info in size_data.sizes:
        existing_size = db.query(ProductSize).filter(
            ProductSize.product_id == product_id,
            ProductSize.branch_id == branch_id,
            ProductSize.size == size_info.size
        ).first()
        
        if existing_size:
            existing_size.stock_quantity = size_info.stock_quantity
            existing_size.updated_at = datetime.now()
        else:
            new_size = ProductSize(
                product_id=product_id,
                branch_id=branch_id,
                size=size_info.size,
                stock_quantity=size_info.stock_quantity
            )
            db.add(new_size)
    
    # Commit los cambios de talles primero
    db.commit()
    
    # Calcular y actualizar el stock general del producto (suma de TODAS las sucursales)
    old_stock = product.stock_quantity
    # Usar el método del modelo que suma todas las sucursales
    total_stock = product.calculate_total_stock()
    product.stock_quantity = total_stock
    product.updated_at = datetime.now()
    
    # Commit el cambio del stock general
    db.commit()
    
    # Notificar cambio de inventario via WebSocket
    await notify_inventory_change(
        product_id=product_id,
        old_stock=old_stock,
        new_stock=total_stock,
        branch_id=branch_id,
        user_name=current_user.full_name
    )
    
    return {
        "message": "Stock de talles actualizado correctamente",
        "total_stock": total_stock,
        "updated_sizes": len(size_data.sizes)
    }

@router.get("/{product_id}/sizes")
async def get_product_sizes(
    product_id: int,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener stock de talles para un producto"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.has_sizes:
        return {"product_id": product_id, "has_sizes": False, "sizes": []}
    
    if not branch_id:
        branch_id = current_user.branch_id or 1
    
    sizes = db.query(ProductSize).filter(
        ProductSize.product_id == product_id,
        ProductSize.branch_id == branch_id
    ).all()
    
    return {
        "product_id": product_id,
        "has_sizes": True,
        "branch_id": branch_id,
        "sizes": [
            {
                "size": size.size,
                "stock_quantity": size.stock_quantity
            }
            for size in sizes
        ]
    }

@router.post("/{product_id}/stock/adjust")
async def adjust_branch_stock(
    product_id: int,
    branch_id: int,
    quantity: int,
    reason: str = "Manual adjustment",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """
    Ajustar stock de un producto específico en una sucursal.
    
    Args:
        product_id: ID del producto
        branch_id: ID de la sucursal 
        quantity: Nueva cantidad de stock
        reason: Razón del ajuste (opcional)
    """
    # Verificar que el producto existe
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Verificar que la sucursal existe
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    # Verificar permisos: solo admins pueden ajustar stock de cualquier sucursal
    if current_user.role.value != "ADMIN" and current_user.branch_id != branch_id:
        raise HTTPException(
            status_code=403, 
            detail="You can only adjust stock for your own branch"
        )
    
    # Buscar o crear registro de stock para la sucursal
    branch_stock = db.query(BranchStock).filter(
        BranchStock.branch_id == branch_id,
        BranchStock.product_id == product_id
    ).first()
    
    if branch_stock:
        old_stock = branch_stock.stock_quantity
        branch_stock.stock_quantity = quantity
        branch_stock.updated_at = func.now()
    else:
        old_stock = 0
        branch_stock = BranchStock(
            branch_id=branch_id,
            product_id=product_id,
            stock_quantity=quantity,
            min_stock=product.min_stock
        )
        db.add(branch_stock)
    
    # Crear movimiento de inventario para auditoría
    movement = InventoryMovement(
        product_id=product_id,
        branch_id=branch_id,
        movement_type="ADJUSTMENT",
        quantity=quantity - old_stock,
        previous_stock=old_stock,
        new_stock=quantity,
        reference_type="MANUAL_ADJUSTMENT",
        notes=f"Manual adjustment by {current_user.username}: {reason}"
    )
    db.add(movement)
    
    # Recalcular stock global del producto
    total_stock = product.calculate_total_stock()
    product.stock_quantity = total_stock
    
    db.commit()
    
    # Notificar cambio via WebSocket
    await notify_inventory_change(product_id, branch_id, quantity)
    
    # Verificar si necesita alerta de stock bajo
    if quantity <= branch_stock.min_stock:
        await notify_low_stock(product_id, branch_id, quantity)
    
    return {
        "success": True,
        "message": f"Stock adjusted for {product.name} in {branch.name}",
        "old_stock": old_stock,
        "new_stock": quantity,
        "total_product_stock": total_stock
    }

@router.get("/stock-by-branch")
async def get_all_products_stock_by_branch(
    skip: int = 0,
    limit: int = 50,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener stock de todos los productos organizados por sucursal.
    
    Args:
        branch_id: Filtrar por sucursal específica (opcional)
    """
    query = db.query(Product).filter(Product.is_active == True)
    
    # Si no es admin, solo puede ver productos de su sucursal
    if current_user.role.value != "ADMIN" and current_user.branch_id:
        branch_id = current_user.branch_id
    
    products = query.offset(skip).limit(limit).all()
    
    result = []
    for product in products:
        product_data = {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "branches": []
        }
        
        # Obtener stock por cada sucursal
        branch_stocks = db.query(BranchStock).filter(
            BranchStock.product_id == product.id
        ).all()
        
        if branch_id:
            branch_stocks = [bs for bs in branch_stocks if bs.branch_id == branch_id]
        
        for bs in branch_stocks:
            branch_data = {
                "branch_id": bs.branch_id,
                "branch_name": bs.branch.name,
                "stock_quantity": bs.stock_quantity,
                "available_stock": bs.available_stock,
                # "reserved_stock": bs.reserved_stock,
                "min_stock": bs.min_stock,
                "low_stock": bs.stock_quantity <= bs.min_stock
            }
            product_data["branches"].append(branch_data)
        
        # Calcular totales
        product_data["total_stock"] = sum(b["stock_quantity"] for b in product_data["branches"])
        product_data["total_available"] = sum(b["available_stock"] for b in product_data["branches"])
        
        result.append(product_data)
    
    return result