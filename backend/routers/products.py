from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
import pandas as pd
import io
from datetime import datetime
from database import get_db
from models import Product, User, InventoryMovement, BranchStock, ProductSize, ImportLog, Category
from schemas import (
    Product as ProductSchema, ProductCreate, ProductUpdate, 
    InventoryMovement as InventoryMovementSchema, StockAdjustment,
    BulkImportResponse, ProductImportData, BranchStock as BranchStockSchema,
    ProductSize as ProductSizeSchema, UpdateSizeStocks, ProductWithMultiBranchStock
)
from auth import get_current_active_user, require_manager_or_admin
from websocket_manager import notify_inventory_change, notify_low_stock

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductSchema])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    low_stock: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
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
    
    if low_stock:
        query = query.filter(Product.stock_quantity <= Product.min_stock)
    
    products = query.offset(skip).limit(limit).all()
    return products

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
    
    return [
        {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "barcode": product.barcode,
            "price": product.price,
            "stock_quantity": product.stock_quantity
        }
        for product in products
    ]

@router.get("/barcode/{barcode}", response_model=ProductSchema)
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
    return product

@router.get("/multi-branch-stock")
async def get_products_with_multi_branch_stock(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener productos con stock por sucursal"""
    products = db.query(Product).filter(Product.is_active == True).offset(skip).limit(limit).all()
    
    result = []
    for product in products:
        # Obtener stock por sucursales
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
            # Si no tiene stock específico por sucursal, usar stock general
            total_stock = product.stock_quantity
            branch_stock_data = []
        
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
    from models import Branch
    
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
    """Obtener talles disponibles para POS (solo con stock > 0)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.has_sizes:
        return {
            "product_id": product_id,
            "product_name": product.name,
            "has_sizes": False,
            "available_sizes": []
        }
    
    # Get sizes with stock > 0 for current branch
    branch_id = current_user.branch_id or 1
    
    available_sizes = db.query(ProductSize).filter(
        ProductSize.product_id == product_id,
        ProductSize.branch_id == branch_id,
        ProductSize.stock_quantity > 0
    ).all()
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "has_sizes": True,
        "available_sizes": [
            {
                "size": size.size,
                "stock_quantity": size.stock_quantity
            }
            for size in available_sizes
        ]
    }

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
    
    db.commit()
    
    return {"message": "Stock de talles actualizado correctamente"}

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