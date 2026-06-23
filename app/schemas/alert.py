from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AlertOut(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    location: str
    city: str
    state: str
    distance: str
    alert_type: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
