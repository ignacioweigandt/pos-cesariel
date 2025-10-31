from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from app.models import Category, User
from app.schemas import Category as CategorySchema, CategoryCreate, CategoryUpdate
from app.repositories import CategoryRepository
from auth_compat import get_current_active_user, require_manager_or_admin

router = APIRouter(prefix="/categories", tags=["categories"])

# Dependency to get CategoryRepository
def get_category_repo(db: Session = Depends(get_db)) -> CategoryRepository:
    return CategoryRepository(Category, db)

@router.get("/", response_model=List[CategorySchema])
async def get_categories(
    skip: int = 0,
    limit: int = 100,
    category_repo: CategoryRepository = Depends(get_category_repo),
    current_user: User = Depends(get_current_active_user)
):
    """Get all active categories using repository pattern."""
    categories = category_repo.get_active_categories()
    return categories[skip:skip+limit]

@router.get("/{category_id}", response_model=CategorySchema)
async def get_category(
    category_id: int,
    category_repo: CategoryRepository = Depends(get_category_repo),
    current_user: User = Depends(get_current_active_user)
):
    """Get category by ID using repository pattern."""
    category = category_repo.get(category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=CategorySchema)
async def create_category(
    category: CategoryCreate,
    category_repo: CategoryRepository = Depends(get_category_repo),
    current_user: User = Depends(require_manager_or_admin)
):
    """Create new category using repository pattern."""
    db_category = category_repo.create(category.dict())
    return db_category

@router.put("/{category_id}", response_model=CategorySchema)
async def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    category_repo: CategoryRepository = Depends(get_category_repo),
    current_user: User = Depends(require_manager_or_admin)
):
    """Update category using repository pattern."""
    update_data = category_update.dict(exclude_unset=True)
    category = category_repo.update(category_id, update_data)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    category_repo: CategoryRepository = Depends(get_category_repo),
    current_user: User = Depends(require_manager_or_admin)
):
    """Soft delete category using repository pattern."""
    category = category_repo.get(category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    # Soft delete - just mark as inactive
    category_repo.update(category_id, {"is_active": False})
    return {"message": "Category deleted successfully"}