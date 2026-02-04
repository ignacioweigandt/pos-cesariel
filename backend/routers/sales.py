"""
Router de Ventas - Endpoints de Transacciones.

Gestión completa del ciclo de vida de ventas POS/Ecommerce/WhatsApp.
Integración con inventario y notificaciones en tiempo real.

Endpoints:
    GET /sales: Lista ventas con filtros avanzados
    POST /sales: Crear venta (valida stock, actualiza inventario)
    GET /sales/{id}: Detalle de venta con ítems
    PATCH /sales/{id}/status: Cambiar estado (e-commerce orders)
    DELETE /sales/{id}: Cancelar venta (revierte stock)
    
    === REPORTES ===
    GET /sales/report: Reporte agregado de ventas
    GET /sales/dashboard: Métricas del dashboard
    GET /sales/daily: Ventas diarias para gráficos

Flujo de Creación de Venta:
    1. Validar stock de TODOS los ítems
    2. Generar sale_number único
    3. Calcular totales (subtotal + tax - discount)
    4. Crear Sale + SaleItems
    5. Disminuir stock (BranchStock/ProductSize)
    6. Crear InventoryMovement por cada ítem
    7. Notificar vía WebSocket (nuevo_venta, cambio_stock, stock_bajo)
    8. Actualizar dashboard en tiempo real

Tipos de Venta:
    - POS: Venta en tienda física
    - ECOMMERCE: Orden online
    - WHATSAPP: Venta por WhatsApp

Estados de Orden (Ecommerce):
    - PENDING: Esperando confirmación
    - CONFIRMED: Confirmada por admin
    - COMPLETED: Entregada/completada
    - CANCELLED: Cancelada (revierte stock)

Filtros Disponibles:
    - sale_type: POS/ECOMMERCE/WHATSAPP
    - branch_id: Sucursal
    - start_date, end_date: Rango de fechas
    - has_whatsapp_sale: Ventas con metadata de WhatsApp
    - skip, limit: Paginación

Validaciones:
    - Stock suficiente antes de crear venta
    - Stock por sucursal y talle (si aplica)
    - Usuario autenticado y activo
    - Sucursal válida y activa

Notificaciones WebSocket:
    - notify_new_sale(): Nueva venta registrada
    - notify_inventory_change(): Stock actualizado
    - notify_low_stock(): Alerta si stock ≤ min_stock
    - notify_dashboard_update(): Actualiza métricas

Características:
    - Generación de sale_number: POS-YYYYMMDDHHMMSS-XXXXXXXX
    - Transacciones atómicas (venta + stock)
    - Reversión de stock en cancelación
    - Tracking completo con InventoryMovement
    - Cálculo automático de totales
    - WebSocket real-time updates
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import List, Optional
from datetime import datetime, date, time, timedelta
from decimal import Decimal
from database import get_db
from app.models import Sale, SaleItem, Product, User, InventoryMovement, SaleType, OrderStatus, ProductSize, BranchStock, Branch
from app.schemas import Sale as SaleSchema, SaleCreate, SaleStatusUpdate, SalesReport, DashboardStats, DailySales, ChartData
from auth_compat import get_current_active_user, require_manager_or_admin
from websocket_manager import notify_new_sale, notify_inventory_change, notify_low_stock, notify_dashboard_update
from app.services.stock_service import StockConflictError
import uuid
from pydantic import ValidationError

router = APIRouter(prefix="/sales", tags=["sales"])

def generate_sale_number(sale_type: SaleType) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    prefix = "POS" if sale_type == SaleType.POS else "ECM"
    return f"{prefix}-{timestamp}-{str(uuid.uuid4())[:8].upper()}"

def date_to_datetime_end(d: date) -> datetime:
    """Convert a date to datetime at end of day (23:59:59.999999)"""
    return datetime.combine(d, time(23, 59, 59, 999999))

@router.get("/", response_model=List[SaleSchema])
async def get_sales(
    skip: int = 0,
    limit: int = 100,
    sale_type: Optional[SaleType] = None,
    branch_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    has_whatsapp_sale: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get sales with optional filters.

    Parameters:
    - has_whatsapp_sale: Filter by whether sale has associated WhatsApp record
      - True: Only sales WITH WhatsApp record (from public e-commerce)
      - False: Only sales WITHOUT WhatsApp record (from admin sales tab)
      - None: All sales (no filter)
    """
    from app.models import WhatsAppSale

    query = db.query(Sale)

    # Filter by branch if not admin, but always show ECOMMERCE sales
    if current_user.role.value.upper() != "ADMIN":
        # Include both sales from user's branch AND all ecommerce sales
        query = query.filter(
            or_(
                Sale.branch_id == current_user.branch_id,
                Sale.sale_type == SaleType.ECOMMERCE
            )
        )
    elif branch_id:
        query = query.filter(Sale.branch_id == branch_id)

    if sale_type:
        query = query.filter(Sale.sale_type == sale_type)

    if start_date:
        query = query.filter(Sale.created_at >= start_date)

    if end_date:
        # Include the entire end_date day (until 23:59:59.999999)
        query = query.filter(Sale.created_at <= date_to_datetime_end(end_date))

    # Filter by WhatsApp sale association
    if has_whatsapp_sale is not None:
        whatsapp_sale_exists = db.query(WhatsAppSale.sale_id).filter(
            WhatsAppSale.sale_id == Sale.id
        ).exists()

        if has_whatsapp_sale:
            # Only sales WITH WhatsApp record
            query = query.filter(whatsapp_sale_exists)
        else:
            # Only sales WITHOUT WhatsApp record
            query = query.filter(~whatsapp_sale_exists)

    sales = query.order_by(desc(Sale.created_at)).offset(skip).limit(limit).all()
    return sales

@router.get("/{sale_id}", response_model=SaleSchema)
async def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Check permissions
    if current_user.role.value != "ADMIN" and sale.branch_id != current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this sale"
        )
    
    return sale

@router.post("/", response_model=SaleSchema)
async def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Crea venta con validación de stock y optimistic locking.
    
    Utiliza SaleService para lógica de negocio protegida.
    Maneja race conditions con HTTP 409 para reintentos del cliente.
    
    Flujo:
        1. SaleService valida stock + crea Sale + decrementa inventario (con locking)
        2. Enviar notificaciones WebSocket
    
    Errors:
        400: Stock insuficiente, producto no existe, validación falla
        409: Conflicto de stock (otro usuario modificó simultáneamente) - RETRY
        500: Error interno
    """
    from app.services.sale_service import SaleService
    
    try:
        # Initialize service
        sale_service = SaleService(db)
        
        # Determine branch
        branch_id = sale.branch_id or current_user.branch_id or 1
        
        # Create sale with stock protection (optimistic locking)
        db_sale = sale_service.create_sale(
            sale_data=sale,
            user_id=current_user.id,
            branch_id=branch_id
        )
        
        # Send WebSocket notifications
        # 1. Notify new sale
        await notify_new_sale(
            sale_id=db_sale.id,
            total_amount=float(db_sale.total_amount),
            branch_id=db_sale.branch_id,
            user_name=current_user.full_name
        )
        
        # 2. Notify inventory changes for each product and check for low stock
        for item in db_sale.sale_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                # Calculate stock before sale for notification
                old_stock = product.stock_quantity + item.quantity
                new_stock = product.stock_quantity
                
                # Notify inventory change
                await notify_inventory_change(
                    product_id=product.id,
                    old_stock=old_stock,
                    new_stock=new_stock,
                    branch_id=db_sale.branch_id,
                    user_name=current_user.full_name
                )
                
                # Check for low stock and send alert if needed
                if new_stock <= product.min_stock:
                    await notify_low_stock(
                        product_id=product.id,
                        product_name=product.name,
                        current_stock=new_stock,
                        min_stock=product.min_stock,
                        branch_id=db_sale.branch_id
                    )
        
        # 3. Notify dashboard update
        await notify_dashboard_update(
            branch_id=db_sale.branch_id,
            update_type="new_transaction",
            data={
                "sale_id": db_sale.id,
                "sale_number": db_sale.sale_number,
                "total_amount": float(db_sale.total_amount),
                "sale_type": db_sale.sale_type.value,
                "timestamp": db_sale.created_at.isoformat() if db_sale.created_at else datetime.now().isoformat()
            }
        )
        
        return db_sale
        
    except ValueError as e:
        # Stock insuficiente, producto no existe, o validación falla
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except StockConflictError as e:
        # Race condition: otro vendedor modificó el stock simultáneamente
        # Cliente debe reintentar la operación
        raise HTTPException(
            status_code=409,  # Conflict
            detail=f"Stock conflict: {str(e)}. Another user modified the stock simultaneously. Please retry the operation."
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{sale_id}/status")
async def update_sale_status(
    sale_id: int,
    status_update: SaleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Check permissions
    if current_user.role.value != "ADMIN" and sale.branch_id != current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this sale"
        )
    
    sale.order_status = status_update.new_status
    db.commit()
    db.refresh(sale)
    
    return {"message": "Sale status updated successfully", "new_status": status_update.new_status}

@router.delete("/{sale_id}")
async def cancel_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Check permissions
    if current_user.role.value != "ADMIN" and sale.branch_id != current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this sale"
        )
    
    # Only allow cancellation if not already cancelled
    if sale.order_status == OrderStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Sale already cancelled")
    
    # Restore inventory
    for sale_item in sale.sale_items:
        product = db.query(Product).filter(Product.id == sale_item.product_id).first()
        if product:
            old_stock = product.stock_quantity
            new_stock = old_stock + sale_item.quantity
            product.stock_quantity = new_stock
            
            # Create inventory movement
            inventory_movement = InventoryMovement(
                product_id=product.id,
                movement_type="IN",
                quantity=sale_item.quantity,
                previous_stock=old_stock,
                new_stock=new_stock,
                reference_id=sale.id,
                reference_type="SALE_CANCELLATION",
                notes=f"Sale cancellation {sale.sale_number}"
            )
            db.add(inventory_movement)
    
    # Update sale status
    sale.order_status = OrderStatus.CANCELLED
    db.commit()
    
    return {"message": "Sale cancelled successfully"}

@router.get("/reports/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get real-time dashboard statistics from database"""
    try:
        from datetime import timedelta
        from app.models import Branch

        # Get today's date range
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)

        # Get month's date range
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Base query for sales (exclude cancelled)
        sales_query = db.query(Sale).filter(Sale.order_status != OrderStatus.CANCELLED)

        # Filter by branch
        if current_user.role.value.upper() != "ADMIN":
            # Non-admin users can only see their own branch
            sales_query = sales_query.filter(Sale.branch_id == current_user.branch_id)
        elif branch_id is not None:
            # Admin users can filter by specific branch
            sales_query = sales_query.filter(Sale.branch_id == branch_id)

        # Today's sales
        total_sales_today = sales_query.filter(
            Sale.created_at >= today_start,
            Sale.created_at <= today_end
        ).with_entities(func.sum(Sale.total_amount)).scalar() or Decimal("0.00")

        # This month's sales
        total_sales_month = sales_query.filter(
            Sale.created_at >= month_start
        ).with_entities(func.sum(Sale.total_amount)).scalar() or Decimal("0.00")

        # Total products count
        product_query = db.query(Product).filter(Product.is_active == True)
        total_products = product_query.count()

        # Low stock products (stock <= min_stock)
        low_stock_products = 0
        products = product_query.all()
        for product in products:
            try:
                total_stock = product.calculate_total_stock()
                if total_stock <= product.min_stock:
                    low_stock_products += 1
            except:
                pass

        # Active branches count
        active_branches = db.query(Branch).filter(Branch.is_active == True).count()

        # Total users count
        total_users = db.query(User).filter(User.is_active == True).count()

        return DashboardStats(
            total_sales_today=total_sales_today,
            total_sales_month=total_sales_month,
            total_products=total_products,
            low_stock_products=low_stock_products,
            active_branches=active_branches,
            total_users=total_users
        )
    except Exception as e:
        print(f"Error in dashboard stats: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return default stats on any error
        return DashboardStats(
            total_sales_today=Decimal("0.00"),
            total_sales_month=Decimal("0.00"),
            total_products=0,
            low_stock_products=0,
            active_branches=1,
            total_users=1
        )

@router.get("/reports/sales-report", response_model=SalesReport)
async def get_sales_report(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Convert end_date to include the entire day
    end_datetime = date_to_datetime_end(end_date)

    # Base query
    sales_query = db.query(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_datetime,
        Sale.order_status != OrderStatus.CANCELLED
    )

    # Filter by branch
    if current_user.role.value != "ADMIN":
        # Non-admin users can only see their own branch
        sales_query = sales_query.filter(Sale.branch_id == current_user.branch_id)
    elif branch_id is not None:
        # Admin users can filter by specific branch
        sales_query = sales_query.filter(Sale.branch_id == branch_id)
    
    # Total sales and transactions
    total_sales = sales_query.with_entities(func.sum(Sale.total_amount)).scalar() or Decimal(0)
    total_transactions = sales_query.count()
    average_sale = total_sales / total_transactions if total_transactions > 0 else Decimal(0)
    
    # Top products
    top_products_query = db.query(
        Product.name,
        func.sum(SaleItem.quantity).label('total_quantity'),
        func.sum(SaleItem.total_price).label('total_revenue')
    ).join(SaleItem).join(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_datetime,
        Sale.order_status != OrderStatus.CANCELLED
    )
    
    if current_user.role.value != "ADMIN":
        top_products_query = top_products_query.filter(Sale.branch_id == current_user.branch_id)
    
    top_products = top_products_query.group_by(Product.name).order_by(
        func.sum(SaleItem.quantity).desc()
    ).limit(10).all()
    
    # Sales by branch (admin only)
    sales_by_branch = []
    if current_user.role.value == "ADMIN":
        sales_by_branch_query = db.query(
            Branch.name,
            func.sum(Sale.total_amount).label('total_sales'),
            func.count(Sale.id).label('total_transactions')
        ).join(Sale).filter(
            Sale.created_at >= start_date,
            Sale.created_at <= end_datetime,
            Sale.order_status != OrderStatus.CANCELLED
        ).group_by(Branch.name).all()
        
        sales_by_branch = [
            {
                "branch_name": branch.name,
                "total_sales": branch.total_sales,
                "total_transactions": branch.total_transactions
            }
            for branch in sales_by_branch_query
        ]
    
    return SalesReport(
        period=f"{start_date} to {end_date}",
        total_sales=total_sales,
        total_transactions=total_transactions,
        average_sale=average_sale,
        top_products=[
            {
                "name": product.name,
                "quantity": product.total_quantity,
                "revenue": product.total_revenue
            }
            for product in top_products
        ],
        sales_by_branch=sales_by_branch
    )

@router.get("/reports/daily-sales", response_model=List[DailySales])
async def get_daily_sales(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Convert end_date to include the entire day
    end_datetime = date_to_datetime_end(end_date)

    # Base query
    sales_query = db.query(
        func.date(Sale.created_at).label('sale_date'),
        func.sum(Sale.total_amount).label('daily_sales'),
        func.count(Sale.id).label('daily_transactions')
    ).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_datetime,
        Sale.order_status != OrderStatus.CANCELLED
    )

    # Filter by branch
    if current_user.role.value != "ADMIN":
        # Non-admin users can only see their own branch
        sales_query = sales_query.filter(Sale.branch_id == current_user.branch_id)
    elif branch_id is not None:
        # Admin users can filter by specific branch
        sales_query = sales_query.filter(Sale.branch_id == branch_id)
    
    daily_sales = sales_query.group_by(
        func.date(Sale.created_at)
    ).order_by(
        func.date(Sale.created_at)
    ).all()
    
    return [
        DailySales(
            date=day.sale_date.isoformat(),
            sales=day.daily_sales or Decimal(0),
            transactions=day.daily_transactions or 0
        )
        for day in daily_sales
    ]

@router.get("/reports/products-chart", response_model=List[ChartData])
async def get_products_chart_data(
    start_date: date,
    end_date: date,
    limit: int = 10,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Convert end_date to include the entire day
    end_datetime = date_to_datetime_end(end_date)

    # Top products query
    products_query = db.query(
        Product.name,
        func.sum(SaleItem.quantity).label('total_quantity')
    ).join(SaleItem).join(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_datetime,
        Sale.order_status != OrderStatus.CANCELLED
    )

    # Filter by branch
    if current_user.role.value != "ADMIN":
        # Non-admin users can only see their own branch
        products_query = products_query.filter(Sale.branch_id == current_user.branch_id)
    elif branch_id is not None:
        # Admin users can filter by specific branch
        products_query = products_query.filter(Sale.branch_id == branch_id)
    
    top_products = products_query.group_by(Product.name).order_by(
        func.sum(SaleItem.quantity).desc()
    ).limit(limit).all()
    
    return [
        ChartData(
            name=product.name,
            value=float(product.total_quantity)
        )
        for product in top_products
    ]

@router.get("/reports/branches-chart", response_model=List[ChartData])
async def get_branches_chart_data(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Only admins can see branch comparison
    if current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # Convert end_date to include the entire day
    end_datetime = date_to_datetime_end(end_date)

    branches_query = db.query(
        Branch.name,
        func.sum(Sale.total_amount).label('total_sales')
    ).join(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_datetime,
        Sale.order_status != OrderStatus.CANCELLED
    ).group_by(Branch.name).all()
    
    return [
        ChartData(
            name=branch.name,
            value=float(branch.total_sales or 0)
        )
        for branch in branches_query
    ]