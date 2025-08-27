from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Branch, User
from schemas import Branch as BranchSchema, BranchCreate, BranchUpdate
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
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    # Check if branch has users
    users_count = db.query(User).filter(User.branch_id == branch_id).count()
    if users_count > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete branch with assigned users"
        )
    
    db.delete(branch)
    db.commit()
    return {"message": "Branch deleted successfully"}