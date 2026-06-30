from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

class EmergencyIncident(Base):
    __tablename__ = "emergency_incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # "Flood", "Fire", "Earthquake", "Building Collapse", "Road Accident", "Gas Leak", "Water Contamination", etc.
    severity: Mapped[str] = mapped_column(String(20), default="Moderate", nullable=False)  # "Minor", "Moderate", "High", "Critical", "Catastrophic"
    priority: Mapped[str] = mapped_column(String(20), default="High", nullable=False)  # "Low", "Medium", "High", "Urgent", "Emergency", "Critical"
    status: Mapped[str] = mapped_column(String(30), default="Reported", nullable=False)  # "Reported", "Verified", "Assigned", "Response Started", "Resources Deployed", "Citizen Updated", "Resolved", "Closed"
    
    # Location coordinates & geo indicators
    address: Mapped[str] = mapped_column(String(300), nullable=True)
    ward: Mapped[str] = mapped_column(String(50), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    affected_radius_meters: Mapped[float] = mapped_column(Float, default=150.0, nullable=False)
    
    # AI Reasoning outputs
    ai_confidence: Mapped[float] = mapped_column(Float, default=0.90, nullable=False)
    ai_reasoning: Mapped[str] = mapped_column(Text, nullable=True)  # Structured analysis / context rationale
    suggested_departments: Mapped[list] = mapped_column(JSON, default=list, nullable=True)  # List of municipal agencies recommended
    estimated_response_minutes: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    escalation_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # Assignment
    assigned_officer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)

    # Relationships
    report = relationship("Report")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])
    timeline = relationship("EmergencyTimelineEvent", back_populates="incident", cascade="all, delete-orphan", order_by="EmergencyTimelineEvent.timestamp")
    resources = relationship("EmergencyResource", back_populates="incident", cascade="all, delete-orphan")


class EmergencyTimelineEvent(Base):
    __tablename__ = "emergency_timeline_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(Integer, ForeignKey("emergency_incidents.id", ondelete="CASCADE"), nullable=False)
    event: Mapped[str] = mapped_column(String(50), nullable=False)  # "Incident Reported", "Verified", "Assigned", "Response Started", "Resources Deployed", "Citizen Updated", "Resolved", "Closed"
    note: Mapped[str] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)

    incident = relationship("EmergencyIncident", back_populates="timeline")


class EmergencyResource(Base):
    __tablename__ = "emergency_resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(Integer, ForeignKey("emergency_incidents.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)  # "Fire Team Delta", "Ambulance Crew 12", etc.
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # "Fire Teams", "Medical Teams", "Police", "Engineers", etc.
    status: Mapped[str] = mapped_column(String(30), default="Standby", nullable=False)  # "Standby", "Dispatched", "On Site", "Released"
    allocated_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.90, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)

    incident = relationship("EmergencyIncident", back_populates="resources")
