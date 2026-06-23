from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy import select, update, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.user import User
from app.models.report import Report
from app.models.emergency import EmergencyIncident, EmergencyTimelineEvent, EmergencyResource
from app.ai.orchestrator.core import orchestrator
from app.ai.registry.core import agent_registry
from app.ai.config.settings import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/ai/emergency", tags=["Emergency AI Agent"])

# Pydantic Request/Response models
class AnalyzeRequest(BaseModel):
    query: str
    location: Optional[str] = None

class ClassifyRequest(BaseModel):
    report_id: Optional[int] = None
    title: str
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    ward: Optional[str] = None

class RespondRequest(BaseModel):
    incident_id: int
    playbook_name: str
    assigned_officer_id: Optional[int] = None

class OverrideRequest(BaseModel):
    severity: str
    priority: str
    affected_radius_meters: float
    suggested_departments: List[str]


@router.post("/analyze")
async def analyze_emergency(
    req: AnalyzeRequest,
    current_user: User = Depends(deps.get_current_user)
):
    agent = agent_registry.get_agent("EmergencyAdvisor")
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="EmergencyAdvisor agent not registered in Multi-Agent ecosystem."
        )
    res = await agent.execute(req.query, {"location": req.location})
    return res.get("analysis") or res


@router.post("/classify")
async def classify_incident(
    req: ClassifyRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    # Retrieve AI classification details
    agent = agent_registry.get_agent("EmergencyAdvisor")
    analysis = {}
    if agent:
        res = await agent.execute(f"{req.title}: {req.description}")
        analysis = res.get("analysis", {})

    try:
        incident = EmergencyIncident(
            report_id=req.report_id,
            title=req.title,
            description=req.description,
            type=analysis.get("incident_type", "Unknown Emergency"),
            severity=analysis.get("severity", "Moderate"),
            priority=analysis.get("priority", "High"),
            status="Reported",
            latitude=req.latitude,
            longitude=req.longitude,
            address=req.address or analysis.get("address"),
            ward=req.ward or analysis.get("ward"),
            affected_radius_meters=analysis.get("radius_meters", 150.0),
            ai_confidence=analysis.get("confidence_score", 0.90),
            ai_reasoning=analysis.get("reasoning_summary", "Incident classified and triaged automatically."),
            suggested_departments=analysis.get("suggested_departments", ["Disaster Management"]),
            estimated_response_minutes=analysis.get("estimated_response_minutes", 25)
        )
        db.add(incident)
        await db.flush()

        # Add initial timeline log
        timeline_event = EmergencyTimelineEvent(
            incident_id=incident.id,
            event="Incident Reported",
            note=f"Emergency of type '{incident.type}' reported at location. AI routing confidence: {round(incident.ai_confidence*100)}%."
        )
        db.add(timeline_event)

        # Allocate recommended resources on Standby
        recs = analysis.get("recommended_resources", [])
        if not recs:
            # Fallback resource list
            recs = [{"type": "Disaster Response Teams", "count": 1}]

        for r in recs:
            res_obj = EmergencyResource(
                incident_id=incident.id,
                name=f"Recommended {r.get('type')}",
                type=r.get('type'),
                status="Standby",
                allocated_count=r.get('count', 1),
                confidence=0.90
            )
            db.add(res_obj)

        await db.commit()
        await db.refresh(incident)
        return incident

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification write failed: {str(e)}"
        )


@router.post("/respond")
async def respond_to_incident(
    req: RespondRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    stmt = select(EmergencyIncident).where(EmergencyIncident.id == req.incident_id)
    res = await db.execute(stmt)
    incident = res.scalars().first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency incident not found."
        )

    try:
        incident.status = "Resources Deployed"
        if req.assigned_officer_id:
            incident.assigned_officer_id = req.assigned_officer_id

        # Update associated resource statuses to Dispatched
        res_stmt = select(EmergencyResource).where(EmergencyResource.incident_id == incident.id)
        res_exec = await db.execute(res_stmt)
        resources = res_exec.scalars().all()
        for r in resources:
            r.status = "Dispatched"

        # Log timeline event
        timeline_event = EmergencyTimelineEvent(
            incident_id=incident.id,
            event="Resources Deployed",
            note=f"Emergency Playbook '{req.playbook_name}' deployed by Government. Responders dispatched."
        )
        db.add(timeline_event)
        await db.commit()
        await db.refresh(incident)
        return {"status": "success", "incident": incident}

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Response deployment execution failed: {str(e)}"
        )


@router.get("/incidents")
async def get_incidents(
    status: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        stmt = select(EmergencyIncident)
        if status:
            stmt = stmt.where(EmergencyIncident.status == status)
        stmt = stmt.order_by(desc(EmergencyIncident.created_at))
        res = await db.execute(stmt)
        return res.scalars().all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query incidents: {str(e)}"
        )


@router.get("/timeline")
async def get_timeline(
    incident_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        stmt = select(EmergencyTimelineEvent).where(EmergencyTimelineEvent.incident_id == incident_id).order_by(EmergencyTimelineEvent.timestamp)
        res = await db.execute(stmt)
        return res.scalars().all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query timeline events: {str(e)}"
        )


@router.get("/resources")
async def get_resources(
    incident_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        stmt = select(EmergencyResource).where(EmergencyResource.incident_id == incident_id)
        res = await db.execute(stmt)
        return res.scalars().all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query resources: {str(e)}"
        )


@router.get("/dashboard")
async def get_dashboard_metrics(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    try:
        stmt = select(EmergencyIncident)
        res = await db.execute(stmt)
        all_incidents = res.scalars().all()

        total = len(all_incidents)
        active = len([i for i in all_incidents if i.status not in ["Resolved", "Closed"]])
        critical = len([i for i in all_incidents if i.severity in ["Critical", "Catastrophic"] and i.status not in ["Resolved", "Closed"]])
        escalated = len([i for i in all_incidents if i.escalation_level > 1])

        avg_response = 25.0
        if total > 0:
            avg_response = sum(i.estimated_response_minutes for i in all_incidents) / total

        severity_dist = {"Minor": 0, "Moderate": 0, "High": 0, "Critical": 0, "Catastrophic": 0}
        dept_usage = {}
        conf_sum = 0.0

        for i in all_incidents:
            if i.severity in severity_dist:
                severity_dist[i.severity] += 1
            conf_sum += i.ai_confidence
            for dept in i.suggested_departments:
                dept_usage[dept] = dept_usage.get(dept, 0) + 1

        avg_conf = conf_sum / total if total > 0 else 0.95

        return {
            "total_incidents": total,
            "active_incidents": active,
            "critical_incidents": critical,
            "avg_response_time": f"{avg_response:.1f} mins",
            "escalated_count": escalated,
            "severity_distribution": severity_dist,
            "department_usage": dept_usage,
            "ai_average_confidence": round(avg_conf, 2)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute dashboard telemetry: {str(e)}"
        )


@router.post("/incidents/{id}/override")
async def override_incident(
    id: int,
    req: OverrideRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    stmt = select(EmergencyIncident).where(EmergencyIncident.id == id)
    res = await db.execute(stmt)
    incident = res.scalars().first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency incident not found."
        )

    try:
        incident.severity = req.severity
        incident.priority = req.priority
        incident.affected_radius_meters = req.affected_radius_meters
        incident.suggested_departments = req.suggested_departments
        incident.escalation_level += 1

        # Add manual verification timeline entry
        timeline_event = EmergencyTimelineEvent(
            incident_id=incident.id,
            event="Verified",
            note=f"Government manual override applied. Target Severity={req.severity}, Priority={req.priority}, Evacuation Radius={req.affected_radius_meters}m."
        )
        db.add(timeline_event)

        await db.commit()
        await db.refresh(incident)
        return incident

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Manual override commit failed: {str(e)}"
        )
