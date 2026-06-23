from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_validator


# ─── Attachment ───────────────────────────────────────────────────
class AttachmentOut(BaseModel):
    id: int
    report_id: int
    filename: str
    original_name: str
    file_path: str
    file_type: str
    mime_type: Optional[str] = None
    file_size: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Status History ───────────────────────────────────────────────
class StatusHistoryOut(BaseModel):
    id: int
    report_id: int
    old_status: Optional[str] = None
    new_status: str
    note: Optional[str] = None
    changed_by_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Report Schemas ───────────────────────────────────────────────
class ReportBase(BaseModel):
    title: str
    description: str
    category: str
    priority: str = "Medium"
    severity: str = "Moderate"


class ReportCreate(ReportBase):
    address: Optional[str] = None
    ward: Optional[str] = None
    city: str
    state: str
    country: str = "India"
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nearby_landmark: Optional[str] = None
    is_anonymous: bool = False
    contact_method: str = "email"
    consent_given: bool = True

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        allowed = {"Low", "Medium", "High", "Critical"}
        if v not in allowed:
            raise ValueError(f"Priority must be one of {allowed}")
        return v

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        allowed = {"Minor", "Moderate", "Major", "Emergency"}
        if v not in allowed:
            raise ValueError(f"Severity must be one of {allowed}")
        return v


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    severity: Optional[str] = None
    address: Optional[str] = None
    ward: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nearby_landmark: Optional[str] = None
    contact_method: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    new_status: str
    note: Optional[str] = None

    @field_validator("new_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"Submitted", "Verified", "Assigned", "In Progress",
                   "Under Inspection", "Resolved", "Closed", "Rejected"}
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v


class ReportOut(ReportBase):
    id: int
    complaint_id: str
    tracking_number: str
    status: str
    progress: int
    assigned_department: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    address: Optional[str] = None
    ward: Optional[str] = None
    city: str
    state: str
    country: str
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nearby_landmark: Optional[str] = None
    is_anonymous: bool
    contact_method: str
    estimated_response_hours: Optional[int] = None
    resolution_note: Optional[str] = None
    resolved_at: Optional[datetime] = None
    citizen_id: int
    created_at: datetime
    updated_at: datetime
    is_saved: bool = False

    model_config = ConfigDict(from_attributes=True)


class ReportDetailOut(ReportOut):
    """Full report detail with attachments and status history."""
    attachments: List[AttachmentOut] = []
    status_history: List[StatusHistoryOut] = []


class TrackingOut(BaseModel):
    complaint_id: str
    tracking_number: str
    title: str
    category: str
    status: str
    progress: int
    priority: str
    severity: str
    assigned_department: Optional[str] = None
    estimated_response_hours: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    status_history: List[StatusHistoryOut] = []

    model_config = ConfigDict(from_attributes=True)
