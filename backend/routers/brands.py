from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from app.models import Brand, User
from app.schemas import Brand as BrandSchema, BrandCreate, BrandUpdate
from app.repositories import BrandRepository
from auth_compat import get_current_active_user, require_manager_or_admin

router = APIRouter(prefix="/brands", tags=["brands"])

# Dependency to get BrandRepository
def get_brand_repo(db: Session = Depends(get_db)) -> BrandRepository:
    return BrandRepository(Brand, db)


@router.get("/debug")
async def debug_brands(db: Session = Depends(get_db)):
    """
    Debug endpoint to test database query directly (no auth required).
    TEMPORARY - Remove after debugging.
    """
    from sqlalchemy import text
    try:
        # Test raw SQL query
        result = db.execute(text("SELECT id, name, is_active FROM brands LIMIT 5"))
        rows = result.fetchall()
        return {
            "status": "ok",
            "query_result": [{"id": r[0], "name": r[1], "is_active": r[2]} for r in rows],
            "count": len(rows)
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@router.get("/debug-auth")
async def debug_brands_with_auth(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Debug endpoint to test auth + db query (auth required).
    TEMPORARY - Remove after debugging.
    """
    try:
        # Test with ORM
        brands = db.query(Brand).filter(Brand.is_active == True).all()
        return {
            "status": "ok",
            "user": current_user.username,
            "brands_count": len(brands),
            "brands": [{"id": b.id, "name": b.name} for b in brands]
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@router.get("/")
async def get_brands(
    skip: int = 0,
    limit: int = 100,
    brand_repo: BrandRepository = Depends(get_brand_repo),
    current_user: User = Depends(get_current_active_user)
):
    """Get all active brands using repository pattern."""
    try:
        brands = brand_repo.get_active_brands()
        # Convert to list of dicts to avoid relationship serialization issues
        result = []
        for brand in brands[skip:skip+limit]:
            result.append({
                "id": brand.id,
                "name": brand.name,
                "description": brand.description,
                "logo_url": brand.logo_url,
                "is_active": brand.is_active,
                "created_at": brand.created_at.isoformat() if brand.created_at else None,
                "updated_at": brand.updated_at.isoformat() if brand.updated_at else None
            })
        return result
    except Exception as e:
        import traceback
        print(f"Error in get_brands: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching brands: {str(e)}")

@router.get("/{brand_id}", response_model=BrandSchema)
async def get_brand(
    brand_id: int,
    brand_repo: BrandRepository = Depends(get_brand_repo),
    current_user: User = Depends(get_current_active_user)
):
    """Get brand by ID using repository pattern."""
    brand = brand_repo.get(brand_id)
    if brand is None:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@router.post("/", response_model=BrandSchema)
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
    return db_brand

@router.put("/{brand_id}", response_model=BrandSchema)
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
    return brand

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
