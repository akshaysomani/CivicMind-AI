from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class AssignOfficerRequest(BaseModel):
    officer_id: Optional[int] = None

class UpdateStatusRequest(BaseModel):
    status: str = Field(..., description="New, Under Review, Assigned, In Progress, Waiting for Citizen, Resolved, Rejected, Closed")
    progress: Optional[int] = Field(None, ge=0, le=100)

class AnnouncementCreate(BaseModel):
    title: str = Field(..., max_length=150)
    content: str = Field(..., max_length=1000)
    priority: str = Field("Medium", description="Low, Medium, High, Critical")
    target_audience: str = Field("All", description="All, Ward-specific, etc.")

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    priority: str
    target_audience: str
    status: str  # Published, Draft, Scheduled, Archived
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardKPIResponse(BaseModel):
    total_issues: int
    open_issues: int
    resolved_today: int
    pending_approval: int
    critical_issues: int
    avg_resolution_time: str
    citizen_satisfaction: float
    department_efficiency: float

class DepartmentStatsResponse(BaseModel):
    name: str
    open_cases: int
    resolved_cases: int
    avg_response_time: str
    performance: float

class WardStatsResponse(BaseModel):
    name: str
    open_cases: int
    resolution_rate: float
    population_coverage: int
    response_time: str
    trend: List[int]

class ResourceStatsResponse(BaseModel):
    available_officers: int
    active_teams: int
    emergency_vehicles: int
    maintenance_teams: int
    medical_units: int
    equipment_status: str
    budget_utilization: float
