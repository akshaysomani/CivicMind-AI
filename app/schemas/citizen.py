from typing import List, Optional
from pydantic import BaseModel

class DashboardStatsOut(BaseModel):
    issues_reported: int
    resolved_issues: int
    pending_issues: int
    nearby_alerts: int
    ai_insights: int
    participation_score: int

class InsightCardOut(BaseModel):
    id: str
    message: str
    category: str
    trend: Optional[str] = None

class AchievementBadgeOut(BaseModel):
    id: str
    title: str
    description: str
    progress: int # 0 to 100
    unlocked: bool
    icon_name: str
