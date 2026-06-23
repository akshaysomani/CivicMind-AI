from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ReportBase(BaseModel):
    title: str
    description: str
    category: str
    priority: str

class ReportCreate(ReportBase):
    pass

class ReportOut(ReportBase):
    id: int
    status: str
    assigned_department: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    ward: Optional[str] = None
    citizen_id: int
    city: str
    state: str
    country: str
    progress: int
    created_at: datetime
    updated_at: datetime
    is_saved: bool = False

    model_config = ConfigDict(from_attributes=True)
