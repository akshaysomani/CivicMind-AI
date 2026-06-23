from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="Medium", nullable=False) # Low, Medium, High, Critical
    location: Mapped[str] = mapped_column(String(150), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    distance: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "1.2 miles", "500m"
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False) # Road Closure, Flood, Weather, Traffic, Power Outage, Water Supply, Medical
    status: Mapped[str] = mapped_column(String(20), default="Active", nullable=False) # Active, Resolved
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
