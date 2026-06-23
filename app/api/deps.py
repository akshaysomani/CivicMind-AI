from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.database.session import get_db
from app.models.user import User

reusable_oauth2 = HTTPBearer()

async def get_current_user(
    http_auth: HTTPAuthorizationCredentials = Depends(reusable_oauth2),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency injection helper checking active JWT session and returning User model."""
    token = http_auth.credentials
    payload = security.verify_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid authentication credentials."
        )
        
    user_id = int(payload.get("sub"))
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found."
        )
        
    if db_user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is locked or suspended."
        )
        
    return db_user

def require_role(allowed_roles: list[str]):
    """Decorator factory to check if current user matches permitted roles."""
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this municipal module."
            )
        return user
    return dependency
