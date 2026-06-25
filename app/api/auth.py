import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from app.core.config import settings
from app.core import security
from app.database.session import get_db
from app.models.user import User
from app.api import deps
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    MessageResponse,
    MFASetupResponse,
    MFAEnableRequest,
    MFAVerifyRequest
)
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

LOCKOUT_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user in the platform with a secure password hash."""
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email address already exists in the system."
        )
    
    # Enforce Password Complexity Rules
    ok, err_msg = security.validate_password_strength(user_in.password)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )
        
    # Hash password and create user object
    hashed_password = security.get_password_hash(user_in.password)
    verification_token = str(uuid.uuid4())
    
    db_user = User(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=hashed_password,
        role=user_in.role,
        sub_role=user_in.sub_role,
        city=user_in.city,
        state=user_in.state,
        country=user_in.country,
        organization=user_in.organization,
        email_verified=False,
        account_status="active",
        email_verification_token=verification_token
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    print(f"[Verification Token Created] for {db_user.email}: {verification_token}")
    return db_user

@router.post("/login", response_model=TokenResponse)
async def login(response: Response, login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate credentials, handle lockout rules, update timestamps, and issue tokens."""
    result = await db.execute(select(User).where(User.email == login_in.email))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password credentials."
        )
        
    # Check if account is currently locked out
    if db_user.locked_until and db_user.locked_until > datetime.now(timezone.utc).replace(tzinfo=None):
        time_left = db_user.locked_until - datetime.now(timezone.utc).replace(tzinfo=None)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account locked out due to multiple failed attempts. Try again in {int(time_left.total_seconds() / 60) + 1} minutes."
        )
        
    # Verify password credentials
    if not security.verify_password(login_in.password, db_user.password_hash):
        # Increment failed login attempts
        db_user.failed_login_attempts += 1
        if db_user.failed_login_attempts >= LOCKOUT_ATTEMPTS:
            db_user.account_status = "locked"
            db_user.locked_until = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=LOCKOUT_MINUTES)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account locked out due to {LOCKOUT_ATTEMPTS} failed attempts. Try again in {LOCKOUT_MINUTES} minutes."
            )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password credentials."
        )
        
    # Reset failed login count on successful authentication
    db_user.failed_login_attempts = 0
    db_user.locked_until = None
    db_user.account_status = "active"
    db_user.last_login = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()
    
    # If Multi-Factor Authentication is enabled, issue challenge first
    if db_user.mfa_enabled:
        return {
            "mfa_required": True,
            "user": db_user
        }
        
    # Generate token sets
    access_token = security.create_access_token(subject=db_user.id)
    refresh_token = security.create_refresh_token(subject=db_user.id)
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    """Clear authorization cookies and sessions."""
    response.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out from active session."}

@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_in: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Generate a new access token via a valid refresh token validation (with rotation)."""
    payload = security.verify_token(refresh_in.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        # Check if reuse of a blacklisted token occurred (hijack indicator)
        if security.is_refresh_token_blacklisted(refresh_in.refresh_token):
            # Invalidate all user sessions to secure the account
            try:
                user_id = int(jwt.decode(refresh_in.refresh_token, settings.SECRET_KEY, options={"verify_signature": False}).get("sub"))
                deps.USER_JTI_MAP[user_id].clear()
                for key in list(deps.ACTIVE_USER_SESSIONS.keys()):
                    if key in deps.USER_JTI_MAP[user_id]:
                        deps.ACTIVE_USER_SESSIONS.pop(key, None)
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token reuse detected. Revoking all sessions for security."
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session refresh token."
        )
        
    user_id = int(payload.get("sub"))
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    
    if not db_user or db_user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or suspended."
        )
        
    # Rotate token: invalidate the used refresh token
    security.blacklist_refresh_token(refresh_in.refresh_token)
    
    new_access_token = security.create_access_token(subject=db_user.id)
    new_refresh_token = security.create_refresh_token(subject=db_user.id)
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(forgot_in: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Generate password reset token and expire threshold."""
    result = await db.execute(select(User).where(User.email == forgot_in.email))
    db_user = result.scalars().first()
    
    if not db_user:
        return {"message": "If this email is registered, a password reset link has been generated."}
        
    reset_token = str(uuid.uuid4())
    db_user.password_reset_token = reset_token
    db_user.password_reset_expires = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=1)
    await db.commit()
    
    print(f"[Password Reset Token Created] for {db_user.email}: {reset_token}")
    return {
        "message": f"If this email is registered, a password reset link has been generated. Token for testing: {reset_token}"
    }

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(reset_in: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Check reset token expiry and configure new hashed password credentials."""
    result = await db.execute(
        select(User).where(
            User.password_reset_token == reset_in.token,
            User.password_reset_expires > datetime.now(timezone.utc).replace(tzinfo=None)
        )
    )
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )
        
    # Enforce password strength rules
    ok, err_msg = security.validate_password_strength(reset_in.new_password)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )
        
    db_user.password_hash = security.get_password_hash(reset_in.new_password)
    db_user.password_reset_token = None
    db_user.password_reset_expires = None
    db_user.failed_login_attempts = 0
    db_user.locked_until = None
    await db.commit()
    
    return {"message": "Password reset successfully. You can now log in with your new credentials."}

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(verify_in: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """Validate verification token and set email status to active."""
    result = await db.execute(select(User).where(User.email_verification_token == verify_in.token))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token."
        )
        
    db_user.email_verified = True
    db_user.email_verification_token = None
    await db.commit()
    
    return {"message": "Email address verified successfully. Welcome to CivicMind AI!"}

# --- MFA Setup & Verification Routes ---

@router.get("/mfa/setup", response_model=MFASetupResponse)
async def mfa_setup(current_user: User = Depends(deps.get_current_user), db: AsyncSession = Depends(get_db)):
    """Generate TOTP MFA secret and QR code URI."""
    secret = security.generate_mfa_secret()
    current_user.mfa_secret = secret
    await db.commit()
    
    # Generate Google Authenticator compatible QR Code URI scheme
    qr_uri = f"otpauth://totp/{settings.MFA_ISSUER}:{current_user.email}?secret={secret}&issuer={settings.MFA_ISSUER}"
    return {
        "secret": secret,
        "qr_code_url": qr_uri
    }

@router.post("/mfa/enable", response_model=MessageResponse)
async def mfa_enable(req: MFAEnableRequest, current_user: User = Depends(deps.get_current_user), db: AsyncSession = Depends(get_db)):
    """Validate OTP code and activate Multi-Factor Authentication protection."""
    if not current_user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA secret not generated. Initiate setup first."
        )
        
    if not security.verify_mfa_code(current_user.mfa_secret, req.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification failed. Invalid authentication code."
        )
        
    current_user.mfa_enabled = True
    await db.commit()
    return {"message": "Multi-Factor Authentication enabled successfully."}

@router.post("/mfa/verify", response_model=TokenResponse)
async def mfa_verify(response: Response, req: MFAVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Complete login flow by validating TOTP code for MFA-enabled accounts."""
    result = await db.execute(select(User).where(User.email == req.email))
    db_user = result.scalars().first()
    
    if not db_user or not db_user.mfa_enabled or not db_user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled on this account."
        )
        
    if not security.verify_mfa_code(db_user.mfa_secret, req.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid multi-factor authentication code."
        )
        
    # Successful MFA login: Issue session tokens
    access_token = security.create_access_token(subject=db_user.id)
    refresh_token = security.create_refresh_token(subject=db_user.id)
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/mfa/disable", response_model=MessageResponse)
async def mfa_disable(current_user: User = Depends(deps.get_current_user), db: AsyncSession = Depends(get_db)):
    """Deactivate Multi-Factor Authentication protection."""
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    await db.commit()
    return {"message": "Multi-Factor Authentication disabled successfully."}

