from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
import string
from database import get_db
from app.models import User, UserRole
from app.schemas import User as UserSchema, UserCreate, UserUpdate
from auth_compat import get_current_active_user, require_admin, require_manager_or_admin, get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

def generate_temporary_password(length: int = 12) -> str:
    """
    Generate a secure random temporary password.

    The password will contain:
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    - Total length of 'length' characters (default 12)

    Args:
        length: Length of the password (minimum 8, default 12)

    Returns:
        A secure random password string
    """
    if length < 8:
        length = 8

    # Define character sets
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special = "!@#$%&*"

    # Ensure at least one character from each set
    password = [
        secrets.choice(uppercase),
        secrets.choice(lowercase),
        secrets.choice(digits),
        secrets.choice(special),
    ]

    # Fill the rest with random characters from all sets
    all_characters = uppercase + lowercase + digits + special
    password += [secrets.choice(all_characters) for _ in range(length - 4)]

    # Shuffle to avoid predictable patterns
    secrets.SystemRandom().shuffle(password)

    return ''.join(password)

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/", response_model=List[UserSchema])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    branch_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(User)
    
    # If not admin, only show users from same branch
    if current_user.role != UserRole.ADMIN:
        query = query.filter(User.branch_id == current_user.branch_id)
    elif branch_id:
        query = query.filter(User.branch_id == branch_id)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check permissions
    if current_user.role != UserRole.ADMIN and user.branch_id != current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    return user

@router.post("/", response_model=UserSchema)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    # Check if username already exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Check if email already exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Non-admin users can only create users in their branch
    if current_user.role != UserRole.ADMIN:
        if user.branch_id != current_user.branch_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only create users in your branch"
            )
    
    hashed_password = get_password_hash(user.password)
    user_data = user.dict(exclude={"password"})
    user_data["hashed_password"] = hashed_password
    
    db_user = User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check permissions
    if current_user.role != UserRole.ADMIN:
        if user.branch_id != current_user.branch_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this user"
            )
        if current_user.role != UserRole.MANAGER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Manager or Admin access required"
            )
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Reset user password to a secure random temporary password.
    Only admins can reset passwords.

    The generated password will be:
    - 12 characters long
    - Contain uppercase, lowercase, digits, and special characters
    - Cryptographically secure random
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate a secure random temporary password
    temporary_password = generate_temporary_password(length=12)
    user.hashed_password = get_password_hash(temporary_password)

    db.commit()
    db.refresh(user)

    return {
        "message": "Password reset successfully",
        "temporary_password": temporary_password,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )

    # Check if user has related records (sales, notifications, etc.)
    from app.models import Sale, Notification

    has_sales = db.query(Sale).filter(Sale.user_id == user_id).count() > 0
    has_notifications = db.query(Notification).filter(Notification.user_id == user_id).count() > 0

    if has_sales or has_notifications:
        # Soft delete: mark as inactive instead of deleting
        user.is_active = False
        user.username = f"{user.username}_deleted_{user_id}"  # Prevent username conflicts
        # Keep email format valid for Pydantic validation
        email_parts = user.email.split('@')
        if len(email_parts) == 2:
            user.email = f"{email_parts[0]}_deleted_{user_id}@{email_parts[1]}"
        else:
            user.email = f"deleted_{user_id}@deleted.local"
        db.commit()
        db.refresh(user)
        return {
            "message": "User deactivated successfully (has related records)",
            "soft_delete": True,
            "user": {
                "id": user.id,
                "username": user.username.split('_deleted_')[0],  # Return original username
                "is_active": user.is_active
            }
        }
    else:
        # Hard delete: no related records, safe to delete
        try:
            db.delete(user)
            db.commit()
            return {
                "message": "User deleted successfully",
                "soft_delete": False
            }
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting user: {str(e)}"
            )