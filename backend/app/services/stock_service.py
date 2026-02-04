"""
Servicio de gestión de stock con optimistic locking.

Este servicio maneja las operaciones de stock garantizando
consistencia en escenarios de concurrencia (múltiples vendedores).
"""

from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import StaleDataError
from sqlalchemy import text
from typing import Optional
from app.models import BranchStock, ProductSize, Product, InventoryMovement


class StockConflictError(Exception):
    """Excepción lanzada cuando hay conflicto de concurrencia en stock."""
    pass


class InsufficientStockError(Exception):
    """Excepción lanzada cuando no hay stock suficiente."""
    pass


class StockService:
    """Servicio para operaciones de stock thread-safe."""
    
    @staticmethod
    def decrement_stock_with_locking(
        db: Session,
        product_id: int,
        branch_id: int,
        quantity: int,
        size: Optional[str] = None,
        reference_type: str = "SALE",
        reference_id: Optional[int] = None,
        notes: Optional[str] = None,
        max_retries: int = 3
    ) -> None:
        """
        Decrementa stock con optimistic locking (previene race conditions).
        
        Args:
            db: Sesión de base de datos
            product_id: ID del producto
            branch_id: ID de la sucursal
            quantity: Cantidad a descontar
            size: Talle (si aplica)
            reference_type: Tipo de operación (SALE, ADJUSTMENT, etc)
            reference_id: ID de la operación origen
            notes: Notas adicionales
            max_retries: Máximo de reintentos en caso de conflicto
        
        Raises:
            InsufficientStockError: Si no hay stock suficiente
            StockConflictError: Si después de max_retries sigue habiendo conflictos
        
        Example:
            try:
                StockService.decrement_stock_with_locking(
                    db=db,
                    product_id=100,
                    branch_id=1,
                    quantity=2,
                    size="M",
                    reference_type="SALE",
                    reference_id=sale.id
                )
            except InsufficientStockError:
                # Mostrar error al usuario
                raise HTTPException(status_code=400, detail="Stock insuficiente")
            except StockConflictError:
                # Otro vendedor modificó el stock, reintentar
                raise HTTPException(status_code=409, detail="Conflicto de stock, reintentar")
        """
        
        # Obtener producto para saber si tiene talles
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError(f"Producto {product_id} no existe")
        
        retries = 0
        while retries < max_retries:
            try:
                if product.has_sizes:
                    # Producto con talles → usar ProductSize
                    return StockService._decrement_product_size(
                        db, product_id, branch_id, quantity, size,
                        reference_type, reference_id, notes
                    )
                else:
                    # Producto sin talles → usar BranchStock
                    return StockService._decrement_branch_stock(
                        db, product_id, branch_id, quantity,
                        reference_type, reference_id, notes
                    )
            except StaleDataError:
                # Conflicto de concurrencia, reintentar
                db.rollback()
                retries += 1
                if retries >= max_retries:
                    raise StockConflictError(
                        f"No se pudo actualizar stock después de {max_retries} intentos. "
                        "Otro usuario modificó el stock simultáneamente."
                    )
    
    @staticmethod
    def _decrement_branch_stock(
        db: Session,
        product_id: int,
        branch_id: int,
        quantity: int,
        reference_type: str,
        reference_id: Optional[int],
        notes: Optional[str]
    ) -> None:
        """Decrementa BranchStock con locking optimista."""
        
        # Buscar stock
        stock = db.query(BranchStock).filter(
            BranchStock.product_id == product_id,
            BranchStock.branch_id == branch_id
        ).first()
        
        if not stock:
            raise InsufficientStockError(
                f"No existe stock para producto {product_id} en sucursal {branch_id}"
            )
        
        # Verificar disponibilidad
        if stock.stock_quantity < quantity:
            raise InsufficientStockError(
                f"Stock insuficiente. Disponible: {stock.stock_quantity}, "
                f"Requerido: {quantity}"
            )
        
        # Guardar valores para auditoría
        previous_stock = stock.stock_quantity
        current_version = stock.version
        
        # UPDATE con optimistic locking
        # Si version cambió, SQLAlchemy lanza StaleDataError
        from datetime import datetime
        rows_updated = db.execute(
            text("""
            UPDATE branch_stock
            SET stock_quantity = stock_quantity - :quantity,
                version = version + 1,
                updated_at = :updated_at
            WHERE id = :stock_id
              AND version = :expected_version
              AND stock_quantity >= :quantity
            """),
            {
                "stock_id": stock.id,
                "quantity": quantity,
                "expected_version": current_version,
                "updated_at": datetime.now()
            }
        ).rowcount
        
        if rows_updated == 0:
            # Version cambió o stock insuficiente
            db.rollback()
            raise StaleDataError(
                "Stock modificado por otro usuario simultáneamente"
            )
        
        # Crear InventoryMovement para auditoría
        movement = InventoryMovement(
            product_id=product_id,
            branch_id=branch_id,
            movement_type="OUT",
            quantity=-quantity,
            previous_stock=previous_stock,
            new_stock=previous_stock - quantity,
            reference_type=reference_type,
            reference_id=reference_id,
            notes=notes
        )
        db.add(movement)
        db.commit()
    
    @staticmethod
    def _decrement_product_size(
        db: Session,
        product_id: int,
        branch_id: int,
        quantity: int,
        size: Optional[str],
        reference_type: str,
        reference_id: Optional[int],
        notes: Optional[str]
    ) -> None:
        """Decrementa ProductSize con locking optimista."""
        
        if not size:
            raise ValueError("Talle obligatorio para productos con has_sizes=True")
        
        # Buscar stock de talle
        stock = db.query(ProductSize).filter(
            ProductSize.product_id == product_id,
            ProductSize.branch_id == branch_id,
            ProductSize.size == size
        ).first()
        
        if not stock:
            raise InsufficientStockError(
                f"No existe stock de talle {size} para producto {product_id} "
                f"en sucursal {branch_id}"
            )
        
        # Verificar disponibilidad
        if stock.stock_quantity < quantity:
            raise InsufficientStockError(
                f"Stock insuficiente de talle {size}. "
                f"Disponible: {stock.stock_quantity}, Requerido: {quantity}"
            )
        
        # Guardar valores para auditoría
        previous_stock = stock.stock_quantity
        current_version = stock.version
        
        # UPDATE con optimistic locking
        from datetime import datetime
        rows_updated = db.execute(
            text("""
            UPDATE product_sizes
            SET stock_quantity = stock_quantity - :quantity,
                version = version + 1,
                updated_at = :updated_at
            WHERE id = :stock_id
              AND version = :expected_version
              AND stock_quantity >= :quantity
            """),
            {
                "stock_id": stock.id,
                "quantity": quantity,
                "expected_version": current_version,
                "updated_at": datetime.now()
            }
        ).rowcount
        
        if rows_updated == 0:
            # Version cambió o stock insuficiente
            db.rollback()
            raise StaleDataError(
                f"Stock de talle {size} modificado por otro usuario simultáneamente"
            )
        
        # Crear InventoryMovement para auditoría
        movement = InventoryMovement(
            product_id=product_id,
            branch_id=branch_id,
            movement_type="OUT",
            quantity=-quantity,
            previous_stock=previous_stock,
            new_stock=previous_stock - quantity,
            reference_type=reference_type,
            reference_id=reference_id,
            notes=f"Talle: {size}. {notes or ''}"
        )
        db.add(movement)
        db.commit()
    
    @staticmethod
    def increment_stock(
        db: Session,
        product_id: int,
        branch_id: int,
        quantity: int,
        size: Optional[str] = None,
        reference_type: str = "PURCHASE",
        reference_id: Optional[int] = None,
        notes: Optional[str] = None
    ) -> None:
        """
        Incrementa stock (compras, ajustes positivos, devoluciones).
        
        Similar a decrement_stock pero suma en lugar de restar.
        """
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError(f"Producto {product_id} no existe")
        
        if product.has_sizes:
            if not size:
                raise ValueError("Talle obligatorio para productos con has_sizes=True")
            
            # Buscar o crear ProductSize
            stock = db.query(ProductSize).filter(
                ProductSize.product_id == product_id,
                ProductSize.branch_id == branch_id,
                ProductSize.size == size
            ).first()
            
            if not stock:
                # Crear nuevo registro
                stock = ProductSize(
                    product_id=product_id,
                    branch_id=branch_id,
                    size=size,
                    stock_quantity=0
                )
                db.add(stock)
                db.flush()
            
            previous_stock = stock.stock_quantity
            stock.stock_quantity += quantity
            stock.version += 1
            
        else:
            # Buscar o crear BranchStock
            stock = db.query(BranchStock).filter(
                BranchStock.product_id == product_id,
                BranchStock.branch_id == branch_id
            ).first()
            
            if not stock:
                # Crear nuevo registro
                stock = BranchStock(
                    product_id=product_id,
                    branch_id=branch_id,
                    stock_quantity=0
                )
                db.add(stock)
                db.flush()
            
            previous_stock = stock.stock_quantity
            stock.stock_quantity += quantity
            stock.version += 1
        
        # Crear InventoryMovement
        movement = InventoryMovement(
            product_id=product_id,
            branch_id=branch_id,
            movement_type="IN",
            quantity=quantity,
            previous_stock=previous_stock,
            new_stock=previous_stock + quantity,
            reference_type=reference_type,
            reference_id=reference_id,
            notes=f"Talle: {size}. {notes or ''}" if size else notes
        )
        db.add(movement)
        db.commit()
