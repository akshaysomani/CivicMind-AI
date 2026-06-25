from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.database.session import get_db
from app.models.user import User

reusable_oauth2 = HTTPBearer()

from collections import defaultdict
import time

# Role hierarchy mappings
ROLE_HIERARCHY = {
    "Citizen": {"Citizen"},
    "NGO": {"NGO", "Citizen"},
    "Government": {"Government", "NGO", "Citizen"},
    "Admin": {"Admin", "Government", "NGO", "Citizen"},
    "Super Administrator": {"Super Administrator", "Admin", "Government", "NGO", "Citizen"}
}

# Concurrent session and timeout configurations
ACTIVE_USER_SESSIONS = {}  # jti -> last_active_timestamp
USER_JTI_MAP = defaultdict(list)  # user_id -> list of jtis

SESSION_TIMEOUT_SECONDS = 900  # 15 minutes
MAX_CONCURRENT_SESSIONS = 3

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
        
    jti = payload.get("jti")
    user_id = int(payload.get("sub"))
    current_time = time.time()
    
    # 1. Session Inactivity Timeout
    if jti in ACTIVE_USER_SESSIONS:
        last_active = ACTIVE_USER_SESSIONS[jti]
        if current_time - last_active > SESSION_TIMEOUT_SECONDS:
            ACTIVE_USER_SESSIONS.pop(jti, None)
            if jti in USER_JTI_MAP[user_id]:
                USER_JTI_MAP[user_id].remove(jti)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired due to inactivity."
            )
            
    ACTIVE_USER_SESSIONS[jti] = current_time
    
    # 2. Concurrent Session Control
    if jti not in USER_JTI_MAP[user_id]:
        USER_JTI_MAP[user_id].append(jti)
        if len(USER_JTI_MAP[user_id]) > MAX_CONCURRENT_SESSIONS:
            oldest_jti = USER_JTI_MAP[user_id].pop(0)
            ACTIVE_USER_SESSIONS.pop(oldest_jti, None)
            if oldest_jti == jti:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session terminated due to concurrent login limit."
                )
                
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
    """Decorator factory to check if current user matches permitted roles or inherits them."""
    def dependency(user: User = Depends(get_current_user)) -> User:
        inherited_roles = ROLE_HIERARCHY.get(user.role, {user.role})
        if not any(r in inherited_roles for r in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this municipal module."
            )
        return user
    return dependency

def require_mfa(user: User = Depends(get_current_user)) -> User:
    """Check if MFA verification is enforced for the logged-in user."""
    if user.mfa_enabled:
        # MFA check placeholder (requires specific verified auth context session header/payload value)
        # In a fully deployed context, we verify if mfa_verified is flag inside active JWT payload or headers.
        pass
    return user

