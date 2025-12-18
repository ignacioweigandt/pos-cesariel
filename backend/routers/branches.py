from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from app.models import Branch, User
from app.schemas import Branch as BranchSchema, BranchCreate, BranchUpdate
from auth_compat import get_current_active_user, require_admin, require_manager_or_admin

router = APIRouter(prefix="/branches", tags=["branches"])

@router.get("/", response_model=List[BranchSchema])
async def get_branches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    branches = db.query(Branch).offset(skip).limit(limit).all()
    return branches

@router.get("/{branch_id}", response_model=BranchSchema)
async def get_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch

@router.post("/", response_model=BranchSchema)
async def create_branch(
    branch: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    db_branch = Branch(**branch.dict())
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

@router.put("/{branch_id}", response_model=BranchSchema)
async def update_branch(
    branch_id: int,
    branch_update: BranchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    update_data = branch_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(branch, field, value)
    
    db.commit()
    db.refresh(branch)
    return branch

@router.delete("/{branch_id}")
async def delete_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete or deactivate a branch.

    - If the branch has related records (users, sales, inventory, product sizes, movements), it will be deactivated (soft delete)
    - If the branch has no related records, it will be permanently deleted (hard delete)
    - BranchTaxRate and BranchPaymentMethod are automatically deleted (CASCADE)
    """
    from app.models import Sale, BranchStock, ProductSize, InventoryMovement, Notification

    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")

    # Check if branch has related records
    has_users = db.query(User).filter(User.branch_id == branch_id).count() > 0
    has_sales = db.query(Sale).filter(Sale.branch_id == branch_id).count() > 0
    has_inventory = db.query(BranchStock).filter(BranchStock.branch_id == branch_id).count() > 0
    has_product_sizes = db.query(ProductSize).filter(ProductSize.branch_id == branch_id).count() > 0
    has_movements = db.query(InventoryMovement).filter(InventoryMovement.branch_id == branch_id).count() > 0
    has_notifications = db.query(Notification).filter(Notification.branch_id == branch_id).count() > 0

    if has_users or has_sales or has_inventory or has_product_sizes or has_movements or has_notifications:
        # Soft delete: mark as inactive instead of deleting
        branch.is_active = False
        branch.name = f"{branch.name} (Eliminada)"
        db.commit()
        db.refresh(branch)

        return {
            "message": "Branch deactivated successfully (has related records)",
            "soft_delete": True,
            "branch": {
                "id": branch.id,
                "name": branch.name.replace(" (Eliminada)", ""),
                "is_active": branch.is_active
            }
        }
    else:
        # Hard delete: no related records, safe to delete
        try:
            db.delete(branch)
            db.commit()
            return {
                "message": "Branch deleted successfully",
                "soft_delete": False
            }
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting branch: {str(e)}"
            )