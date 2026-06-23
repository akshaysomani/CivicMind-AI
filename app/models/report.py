from datetime import datetime, timezone
import uuid
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Table, Column, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

# Association table for saved/bookmarked reports
saved_reports = Table(
    "saved_reports",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("report_id", Integer, ForeignKey("reports.id", ondelete="CASCADE"), primary_key=True)
)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Identity
    complaint_id: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False,
                                              default=lambda: f"CIV-{uuid.uuid4().hex[:8].upper()}")
    tracking_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False,
                                                  default=lambda: f"TRK-{uuid.uuid4().hex[:10].upper()}")

    # Core fields
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="Medium", nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="Moderate", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Submitted", nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Location
    address: Mapped[str] = mapped_column(String(300), nullable=True)
    ward: Mapped[str] = mapped_column(String(50), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    nearby_landmark: Mapped[str] = mapped_column(String(200), nullable=True)

    # Reporting preferences
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    contact_method: Mapped[str] = mapped_column(String(20), default="email", nullable=False)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Assignment
    assigned_department: Mapped[str] = mapped_column(String(100), nullable=True)
    assigned_officer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    citizen_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Resolution
    estimated_response_hours: Mapped[int] = mapped_column(Integer, nullable=True)
    resolution_note: Mapped[str] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc),
                                                  onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], backref="reported_issues")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], backref="assigned_reports")
    saved_by_users = relationship("User", secondary=saved_reports, backref="saved_issues")
    attachments = relationship("Attachment", back_populates="report", cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="report", cascade="all, delete-orphan",
                                  order_by="StatusHistory.created_at")
    comments = relationship("IssueComment", back_populates="report", cascade="all, delete-orphan")
