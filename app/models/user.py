from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), default="Citizen", nullable=False) # Citizen, Government, NGO, Admin
    sub_role: Mapped[str] = mapped_column(String(50), nullable=True) # Municipal Officer, Department Officer, etc.
    
    # Profile & Address Info
    profile_image: Mapped[str] = mapped_column(String(255), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    organization: Mapped[str] = mapped_column(String(100), nullable=True)
    
    # Authentication & Lockout States
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    account_status: Mapped[str] = mapped_column(String(20), default="active", nullable=False) # active, locked, suspended
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Tokens for verification / reset flows
    email_verification_token: Mapped[str] = mapped_column(String(255), nullable=True)
    password_reset_token: Mapped[str] = mapped_column(String(255), nullable=True)
    password_reset_expires: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    last_login: Mapped[datetime] = mapped_column(DateTime, nullable=True)
