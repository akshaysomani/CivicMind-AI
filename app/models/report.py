from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Table, Column
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
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # Infrastructure, Waste, Safety, Water, Utilities, etc.
    priority: Mapped[str] = mapped_column(String(20), default="Medium", nullable=False) # Low, Medium, High, Critical
    status: Mapped[str] = mapped_column(String(20), default="Open", nullable=False) # Open, In Progress, Resolved, Rejected
    assigned_department: Mapped[str] = mapped_column(String(100), nullable=True)
    assigned_officer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    ward: Mapped[str] = mapped_column(String(50), nullable=True)
    citizen_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], backref="reported_issues")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], backref="assigned_reports")
    saved_by_users = relationship("User", secondary=saved_reports, backref="saved_issues")
