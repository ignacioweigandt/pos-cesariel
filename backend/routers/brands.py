from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models import Brand, User
from app.schemas import BrandCreate, BrandUpdate
from app.repositories import BrandRepository
from auth_compat import get_current_active_user, require_manager_or_admin

router = APIRouter(prefix="/brands", tags=["brands"])

# Dependency to get BrandRepository
def get_brand_repo(db: Session = Depends(get_db)) -> BrandRepository:
    return BrandRepository(Brand, db)


def _serialize_brand(brand: Brand) -> dict:
    """Helper to serialize Brand model to dict with proper datetime handling."""
    return {
        "id": brand.id,
        "name": brand.name,
        "description": brand.description,
        "logo_url": brand.logo_url,
        "is_active": brand.is_active,
        "created_at": brand.created_at.isoformat() if brand.created_at else None,
        "updated_at": brand.updated_at.isoformat() if brand.updated_at else None
    }


@router.get("/")
async def get_brands(
    skip: int = 0,
    limit: int = 100,
    brand_repo: BrandRepository = Depends(get_brand_repo),
    current_user: User = Depends(get_current_active_user)
):
    """Get all active brands using repository pattern."""
    brands = brand_repo.get_active_brands()
    return [_serialize_brand(b) for b in brands[skip:skip+limit]]

@router.get("/{brand_id}")
async def get_brand(
    brand_id: int,
    brand_repo: BrandRepository = Depends(get_brand_repo),
    current_user: User = Depends(get_current_active_user)
):
    """Get brand by ID using repository pattern."""
    brand = brand_repo.get(brand_id)
    if brand is None:
        raise HTTPException(status_code=404, detail="Brand not found")
    return _serialize_brand(brand)

@router.post("/")
async def create_brand(
    brand: BrandCreate,
    brand_repo: BrandRepository = Depends(get_brand_repo),
    current_user: User = Depends(require_manager_or_admin)
):
    """Create new brand using repository pattern."""
    # Check if brand with same name already exists
    existing_brand = brand_repo.get_by_name(brand.name)
    if existing_brand:
        raise HTTPException(
            status_code=400,
            detail=f"Brand with name '{brand.name}' already exists"
        )

    db_brand = brand_repo.create(brand.model_dump())
    return _serialize_brand(db_brand)

@router.put("/{brand_id}")
async def update_brand(
    brand_id: int,
    brand_update: BrandUpdate,
    brand_repo: BrandRepository = Depends(get_brand_repo),
    current_user: User = Depends(require_manager_or_admin)
):
    """Update brand using repository pattern."""
    # Check if brand with new name already exists (excluding current brand)
    if brand_update.name:
        existing_brand = brand_repo.get_by_name(brand_update.name)
        if existing_brand and existing_brand.id != brand_id:
            raise HTTPException(
                status_code=400,
                detail=f"Brand with name '{brand_update.name}' already exists"
            )

    update_data = brand_update.model_dump(exclude_unset=True)
    brand = brand_repo.update(brand_id, update_data)
    if brand is None:
        raise HTTPException(status_code=404, detail="Brand not found")
    return _serialize_brand(brand)

@router.delete("/{brand_id}")
async def delete_brand(
    brand_id: int,
    brand_repo: BrandRepository = Depends(get_brand_repo),
    current_user: User = Depends(require_manager_or_admin)
):
    """Soft delete brand using repository pattern."""
    brand = brand_repo.get(brand_id)
    if brand is None:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Soft delete - just mark as inactive
    brand_repo.update(brand_id, {"is_active": False})
    return {"message": "Brand deleted successfully"}
