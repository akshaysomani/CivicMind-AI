from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    email_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sms_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    in_app_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    push_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    quiet_hours_start: Mapped[str] = mapped_column(String(5), nullable=True)  # HH:MM format
    quiet_hours_end: Mapped[str] = mapped_column(String(5), nullable=True)    # HH:MM format
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="notification_preference")

class WorkflowRule(Base):
    __tablename__ = "workflow_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    trigger: Mapped[str] = mapped_column(String(50), nullable=False)  # issue_created, issue_updated, emergency_triggered, health_advisory_published, scheme_recommended, prediction_generated
    condition: Mapped[str] = mapped_column(String(500), nullable=True)  # JSON or simple filter expression
    action: Mapped[str] = mapped_column(String(500), nullable=False)     # JSON action definitions
    delay: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # in seconds
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="workflow_rules")

class WorkflowHistory(Base):
    __tablename__ = "workflow_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rule_id: Mapped[int] = mapped_column(Integer, ForeignKey("workflow_rules.id", ondelete="SET NULL"), nullable=True)
    rule_name: Mapped[str] = mapped_column(String(100), nullable=False)
    trigger_event: Mapped[str] = mapped_column(String(50), nullable=False)
    execution_status: Mapped[str] = mapped_column(String(30), nullable=False)  # success, failed, delayed
    details: Mapped[str] = mapped_column(String(500), nullable=True)
    executed_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    rule = relationship("WorkflowRule", backref="execution_history")
