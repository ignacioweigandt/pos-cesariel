"""
Servicio de Inventario - Lógica de Negocio.

Gestiona stock multi-sucursal con soporte para productos con talles.
Coordina BranchStock y ProductSize para cálculos precisos de inventario.

Responsabilidades:
    - Cálculo de stock por sucursal y total
    - Validación de stock disponible (no reservado)
    - Disminución de stock con tracking (InventoryMovement)
    - Soporte para productos con/sin talles
    - Identificación de sucursales con stock

Notas Importantes:
    - BranchStock es la fuente única de verdad para cantidades
    - Productos con has_sizes=True usan ProductSize
    - Productos sin talles usan BranchStock directo
    - Cada cambio de stock crea InventoryMovement para auditoría

Este servicio reemplaza métodos de negocio que antes estaban en Product model.
"""

from typing import Optional, List, Literal, Dict
from sqlalchemy.orm import Session
from app.repositories.inventory import (
    BranchStockRepository,
    ProductSizeRepository,
    InventoryMovementRepository
)
from app.repositories.product import ProductRepository
from app.models import Product, BranchStock, ProductSize, InventoryMovement
from app.services.stock_service import StockService, InsufficientStockError, StockConflictError


class InventoryService:
    """
    Servicio de gestión de inventario multi-sucursal.
    
    Coordina cálculos de stock considerando productos con/sin talles.
    """

    def __init__(self, db: Session):
        """
        Inicializa servicio con sesión de BD.
        
        Args:
            db: Sesión de SQLAlchemy
        """
        self.db = db
        self.branch_stock_repo = BranchStockRepository(BranchStock, db)
        self.product_size_repo = ProductSizeRepository(ProductSize, db)
        self.inventory_movement_repo = InventoryMovementRepository(InventoryMovement, db)
        self.product_repo = ProductRepository(Product, db)

    def get_product_stock_for_branch(self, product_id: int, branch_id: int) -> int:
        """
        Obtiene stock de un producto en una sucursal.
        
        Maneja automáticamente productos con/sin talles:
        - Con talles: suma stock de todos los ProductSize
        - Sin talles: consulta BranchStock directo
        
        Args:
            product_id: ID del producto
            branch_id: ID de la sucursal
        
        Returns:
            Cantidad de stock (0 si no existe)
        
        Reemplaza: Product.get_stock_for_branch()
        """
        product = self.product_repo.get(product_id)
        if not product:
            return 0

        if product.has_sizes:
            # Sum stock from ProductSize for this branch
            sizes = self.product_size_repo.get_by_product_and_branch(product_id, branch_id)
            return sum(size.stock_quantity for size in sizes)
        else:
            # Get BranchStock
            branch_stock = self.branch_stock_repo.get_by_branch_and_product(branch_id, product_id)
            return branch_stock.stock_quantity if branch_stock else 0

    def get_available_stock_for_branch(self, product_id: int, branch_id: int) -> int:
        """
        Obtiene stock disponible (no reservado) en una sucursal.
        
        Args:
            product_id: ID del producto
            branch_id: ID de la sucursal
        
        Returns:
            Stock disponible (excluye reservas)
        
        Reemplaza: Product.get_available_stock_for_branch()
        """
        product = self.product_repo.get(product_id)
        if not product:
            return 0

        if product.has_sizes:
            return self.get_product_stock_for_branch(product_id, branch_id)
        else:
            branch_stock = self.branch_stock_repo.get_by_branch_and_product(branch_id, product_id)
            return branch_stock.available_stock if branch_stock else 0

    def calculate_total_stock(self, product_id: int) -> int:
        """
        Calcula stock total en todas las sucursales.
        
        Args:
            product_id: ID del producto
        
        Returns:
            Suma de stock en todas las sucursales
        
        Reemplaza: Product.calculate_total_stock()
        """
        product = self.product_repo.get(product_id)
        if not product:
            return 0

        if product.has_sizes:
            sizes = self.product_size_repo.get_by_product(product_id)
            return sum(size.stock_quantity for size in sizes)
        else:
            stocks = self.branch_stock_repo.get_many_by_field("product_id", product_id)
            return sum(stock.stock_quantity for stock in stocks)

    def calculate_total_available_stock(self, product_id: int) -> int:
        """
        Calcula stock disponible total en todas las sucursales.
        
        Args:
            product_id: ID del producto
        
        Returns:
            Suma de stock disponible en todas las sucursales
        
        Reemplaza: Product.calculate_total_available_stock()
        """
        product = self.product_repo.get(product_id)
        if not product:
            return 0

        if product.has_sizes:
            return self.calculate_total_stock(product_id)
        else:
            stocks = self.branch_stock_repo.get_many_by_field("product_id", product_id)
            return sum(stock.available_stock for stock in stocks)

    def has_sufficient_stock(
        self, 
        product_id: int, 
        branch_id: int, 
        quantity: int = 1,
        size: Optional[str] = None
    ) -> bool:
        """
        Verifica si hay stock suficiente para vender.
        
        Validación crítica antes de confirmar ventas.
        
        Args:
            product_id: ID del producto
            branch_id: ID de la sucursal
            quantity: Cantidad requerida
            size: Talle requerido (si producto has_sizes=True)
        
        Returns:
            True si hay stock suficiente, False si no
        
        Reemplaza: Product.has_stock_in_branch()
        """
        product = self.product_repo.get(product_id)
        if not product:
            return False

        if product.has_sizes and size:
            sizes = self.product_size_repo.get_by_product_and_branch(product_id, branch_id)
            size_stock = next((s for s in sizes if s.size == size), None)
            return size_stock.stock_quantity >= quantity if size_stock else False
        else:
            available = self.get_available_stock_for_branch(product_id, branch_id)
            return available >= quantity

    def get_branches_with_stock(self, product_id: int) -> List[int]:
        """
        Obtiene IDs de sucursales que tienen stock del producto.
        
        Args:
            product_id: ID del producto
        
        Returns:
            Lista de branch_id con stock > 0
        
        Reemplaza: Product.get_branches_with_stock()
        """
        stocks = self.branch_stock_repo.get_many_by_field("product_id", product_id)
        return [stock.branch_id for stock in stocks if stock.stock_quantity > 0]

    def decrease_stock(
        self,
        product_id: int,
        branch_id: int,
        quantity: int,
        size: Optional[str] = None,
        reference_type: str = "SALE",
        reference_id: Optional[int] = None,
        notes: Optional[str] = None
    ) -> bool:
        """
        Disminuye stock con tracking de movimiento y optimistic locking.
        
        ACTUALIZADO: Ahora usa StockService para prevenir race conditions.
        
        Operación crítica que:
        1. Valida stock suficiente
        2. Actualiza BranchStock o ProductSize con optimistic locking
        3. Crea InventoryMovement para auditoría
        4. Reintenta automáticamente en caso de conflicto (max 3 veces)
        
        Args:
            product_id: ID del producto
            branch_id: ID de la sucursal
            quantity: Cantidad a disminuir
            size: Talle (requerido si has_sizes=True)
            reference_type: Tipo de referencia ("SALE", "ADJUSTMENT", etc.)
            reference_id: ID de la venta/ajuste relacionado
            notes: Notas adicionales
        
        Returns:
            True si exitoso, False si stock insuficiente o producto no existe
        
        Raises:
            StockConflictError: Si después de 3 reintentos aún hay conflictos
        
        Efectos Secundarios:
            - Modifica BranchStock.stock_quantity o ProductSize.stock_quantity
            - Crea registro en InventoryMovement
        """
        try:
            StockService.decrement_stock_with_locking(
                db=self.db,
                product_id=product_id,
                branch_id=branch_id,
                quantity=quantity,
                size=size,
                reference_type=reference_type,
                reference_id=reference_id,
                notes=notes
            )
            return True
        except InsufficientStockError:
            # No hay stock suficiente
            return False
        except StockConflictError:
            # Race condition después de 3 reintentos
            # El llamador debe manejar esto (ej: mostrar error al usuario)
            raise
        except ValueError:
            # Producto no existe u otro error de validación
            return False


def adjust_stock_for_sale(
    db: Session,
    sale: "Sale",
    operation: Literal["deduct", "revert"]
) -> List[Dict]:
    """
    Ajusta el stock para todos los items de una venta.
    
    Función helper para workflow de ventas WhatsApp/E-commerce.
    Maneja automáticamente productos con/sin talles.
    
    Args:
        db: Sesión de base de datos
        sale: Venta con sale_items cargados (eager loading recomendado)
        operation: 
            - "deduct": Descuenta stock (PENDING → PROCESSING)
            - "revert": Revierte stock (cancelación)
    
    Returns:
        Lista de cambios de stock realizados:
        [
            {
                "product_id": 10,
                "product_name": "Remera Negra",
                "size": "M",
                "quantity_adjusted": -2,  # Negativo = descuento, Positivo = reversión
                "new_stock": 48
            }
        ]
    
    Raises:
        ValueError: Si no hay stock suficiente (solo en operation="deduct")
    
    Effects:
        - Actualiza BranchStock.stock_quantity o ProductSize.stock_quantity
        - Crea InventoryMovement por cada item para auditoría
    
    Example:
        >>> from app.models import Sale
        >>> sale = db.query(Sale).filter(Sale.id == 123).first()
        >>> # Confirmar pago (descuenta stock)
        >>> changes = adjust_stock_for_sale(db, sale, operation="deduct")
        >>> # Cancelar (revierte stock)
        >>> changes = adjust_stock_for_sale(db, sale, operation="revert")
    """
    from app.models import Sale, BranchStock, ProductSize, InventoryMovement
    
    multiplier = -1 if operation == "deduct" else +1
    stock_changes = []
    
    # 1. Validar stock disponible (solo si es deduct)
    if operation == "deduct":
        for item in sale.sale_items:
            product = item.product
            
            if product.has_sizes and item.size:
                # Producto con talle
                product_size = db.query(ProductSize).filter(
                    ProductSize.product_id == item.product_id,
                    ProductSize.branch_id == sale.branch_id,
                    ProductSize.size == item.size
                ).first()
                
                if not product_size or product_size.stock_quantity < item.quantity:
                    raise ValueError(
                        f"Stock insuficiente para {product.name} talle {item.size}: "
                        f"disponible {product_size.stock_quantity if product_size else 0}, "
                        f"requerido {item.quantity}"
                    )
            else:
                # Producto sin talle
                branch_stock = db.query(BranchStock).filter(
                    BranchStock.product_id == item.product_id,
                    BranchStock.branch_id == sale.branch_id
                ).first()
                
                if not branch_stock or branch_stock.stock_quantity < item.quantity:
                    raise ValueError(
                        f"Stock insuficiente para {product.name}: "
                        f"disponible {branch_stock.stock_quantity if branch_stock else 0}, "
                        f"requerido {item.quantity}"
                    )
    
    # 2. Ajustar stock
    for item in sale.sale_items:
        product = item.product
        quantity_change = item.quantity * multiplier
        
        if product.has_sizes and item.size:
            # Producto con talle
            product_size = db.query(ProductSize).filter(
                ProductSize.product_id == item.product_id,
                ProductSize.branch_id == sale.branch_id,
                ProductSize.size == item.size
            ).first()
            
            previous_stock = product_size.stock_quantity
            product_size.stock_quantity += quantity_change
            new_stock = product_size.stock_quantity
        else:
            # Producto sin talle
            branch_stock = db.query(BranchStock).filter(
                BranchStock.product_id == item.product_id,
                BranchStock.branch_id == sale.branch_id
            ).first()
            
            previous_stock = branch_stock.stock_quantity
            branch_stock.stock_quantity += quantity_change
            new_stock = branch_stock.stock_quantity
        
        # 3. Crear InventoryMovement para auditoría
        notes_text = (
            f"Venta WhatsApp #{sale.sale_number} confirmada"
            if operation == "deduct"
            else f"Cancelación venta WhatsApp #{sale.sale_number}"
        )
        
        movement = InventoryMovement(
            product_id=item.product_id,
            branch_id=sale.branch_id,
            movement_type="OUT" if operation == "deduct" else "ADJUSTMENT",
            quantity=quantity_change,  # Negativo si deduct, positivo si revert
            previous_stock=previous_stock,
            new_stock=new_stock,
            reference_type="SALE",
            reference_id=sale.id,
            notes=notes_text
        )
        db.add(movement)
        
        # 4. Registrar cambio para respuesta
        stock_changes.append({
            "product_id": item.product_id,
            "product_name": product.name,
            "size": item.size,
            "quantity_adjusted": quantity_change,
            "new_stock": new_stock
        })
    
    return stock_changes
