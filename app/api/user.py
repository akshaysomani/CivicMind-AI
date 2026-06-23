import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core import security
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordUpdate
from app.schemas.auth import MessageResponse

router = APIRouter(prefix="/user", tags=["user"])

# Relative folder to store uploaded profile avatars
UPLOAD_DIR = "public/uploads/avatars"

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Fetch current authenticated user profile context."""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile fields (names, phone, address details)."""
    update_data = profile_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.put("/password", response_model=MessageResponse)
async def update_password(
    password_in: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify current password credentials and apply new hashed password."""
    if not security.verify_password(password_in.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed. Please try again."
        )
        
    current_user.password_hash = security.get_password_hash(password_in.new_password)
    await db.commit()
    return {"message": "Password updated successfully."}

@router.delete("/account", response_model=MessageResponse)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete authenticated user context from database."""
    await db.delete(current_user)
    await db.commit()
    return {"message": "User account was deleted successfully from CivicMind AI."}

@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and save profile avatar photo."""
    # Ensure upload folder exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Check extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Supported formats: JPG, PNG, WEBP."
        )
        
    # Generate unique filename to avoid collisions
    filename = f"{current_user.id}_{uuid.uuid4().hex}{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Save file contents
    try:
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save profile image: {str(e)}"
        )
        
    # Update user model (virtual link path)
    current_user.profile_image = f"/uploads/avatars/{filename}"
    await db.commit()
    await db.refresh(current_user)
    
    return current_user
