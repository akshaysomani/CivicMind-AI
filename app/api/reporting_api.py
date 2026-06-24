import json
import base64
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.reporting import ExecutiveReport, Briefing, ScheduledReport
from app.ai.registry.core import agent_registry

router = APIRouter(prefix="/reports", tags=["AI Executive Reporting & Decision Briefings"])

# Pydantic models
class ReportGenerateSchema(BaseModel):
    report_type: str = Field(..., description="Daily Executive Brief, Weekly, etc.")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    department: Optional[str] = None
    ward: Optional[str] = None
    category: Optional[str] = None

class ScheduleCreateSchema(BaseModel):
    name: str = Field(..., max_length=100)
    report_type: str
    frequency: str  # daily, weekly, monthly
    recipients: List[str]  # roles or emails

class ExportRequestSchema(BaseModel):
    report_id: int
    format: str  # pdf, csv, excel, pptx, json


# Endpoints
@router.get("", response_model=List[Dict[str, Any]])
async def get_saved_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all previously generated and saved AI Executive Reports."""
    query = select(ExecutiveReport).order_by(ExecutiveReport.created_at.desc())
    result = await db.execute(query)
    reports = result.scalars().all()
    
    return [
        {
            "id": r.id,
            "title": r.title,
            "report_type": r.report_type,
            "created_at": r.created_at.isoformat(),
            "content": json.loads(r.content)
        } for r in reports
    ]

@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_report_templates(
    current_user: User = Depends(get_current_user)
):
    """List available reporting templates."""
    return [
        {"id": "daily_brief", "name": "Daily Executive Brief", "description": "High-level summary of city metrics in the last 24 hours."},
        {"id": "weekly_report", "name": "Weekly Executive Report", "description": "Detailed multi-department trends and risk analysis."},
        {"id": "monthly_perf", "name": "Monthly Performance Report", "description": "Long-term operational KPIs and resource recommendations."},
        {"id": "health_summary", "name": "Healthcare Summary", "description": "Summarizes clinic demand, public health advisory coverage, and sanitary issues."},
        {"id": "emergency_sitrep", "name": "Emergency Situation Report", "description": "Active emergency incident reviews and resource requests."},
        {"id": "dept_perf", "name": "Department Performance Report", "description": "Details grievance resolution speed and completion rates."},
        {"id": "ward_perf", "name": "Ward Performance Report", "description": "Compares hotspots and citizen feedback across wards."},
        {"id": "infra_report", "name": "Infrastructure Report", "description": "Summarizes road, water works, and structural hazard reports."}
    ]

@router.post("/generate", response_model=Dict[str, Any])
async def generate_executive_report(
    payload: ReportGenerateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger the AI Executive Reporting Agent to compile statistics and write a report."""
    agent = agent_registry.get_agent("ExecutiveReporting")
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Executive Reporting AI Agent is not registered."
        )

    # Execute the agent, passing db in context to fetch actual metrics
    context = {
        "db": db,
        "report_type": payload.report_type,
        "filters": payload.model_dump(exclude={"report_type"})
    }
    
    agent_res = await agent.execute(query=f"Generate {payload.report_type}", context=context)
    report_content = agent_res.get("content")
    
    # Save to Database
    db_report = ExecutiveReport(
        title=f"{payload.report_type} - {datetime.now().strftime('%b %d, %Y')}",
        report_type=payload.report_type,
        content=json.dumps(report_content),
        user_id=current_user.id
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    
    return {
        "id": db_report.id,
        "title": db_report.title,
        "report_type": db_report.report_type,
        "created_at": db_report.created_at.isoformat(),
        "content": report_content
    }

@router.delete("/{report_id}")
async def delete_saved_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a saved executive report."""
    query = select(ExecutiveReport).where(ExecutiveReport.id == report_id)
    result = await db.execute(query)
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Executive report not found."
        )
        
    await db.delete(report)
    await db.commit()
    return {"message": "Report deleted successfully."}

@router.post("/schedule", response_model=Dict[str, Any])
async def schedule_report(
    payload: ScheduleCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule a recurring executive report generation."""
    schedule = ScheduledReport(
        name=payload.name,
        report_type=payload.report_type,
        frequency=payload.frequency,
        recipients=json.dumps(payload.recipients),
        user_id=current_user.id
    )
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    
    return {
        "id": schedule.id,
        "name": schedule.name,
        "report_type": schedule.report_type,
        "frequency": schedule.frequency,
        "recipients": payload.recipients,
        "is_active": schedule.is_active,
        "created_at": schedule.created_at.isoformat()
    }

@router.get("/scheduled", response_model=List[Dict[str, Any]])
async def list_scheduled_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all scheduled reports."""
    query = select(ScheduledReport).order_by(ScheduledReport.created_at.desc())
    result = await db.execute(query)
    schedules = result.scalars().all()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "report_type": s.report_type,
            "frequency": s.frequency,
            "recipients": json.loads(s.recipients),
            "is_active": s.is_active,
            "created_at": s.created_at.isoformat()
        } for s in schedules
    ]

@router.delete("/scheduled/{schedule_id}")
async def delete_scheduled_report(
    schedule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a scheduled report setup."""
    query = select(ScheduledReport).where(ScheduledReport.id == schedule_id)
    result = await db.execute(query)
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled report configuration not found."
        )
        
    await db.delete(schedule)
    await db.commit()
    return {"message": "Scheduled report cancelled."}

@router.get("/briefings", response_model=List[Dict[str, Any]])
async def get_role_briefings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate and return role-aware concise briefings for city administrators."""
    from app.ai.agents.reporting import fetch_database_aggregates
    stats = await fetch_database_aggregates(db)
    
    roles = [
        {"role": "Mayor", "title": "Mayor's Morning Briefing"},
        {"role": "Ward Officer", "title": "Ward Officer Dashboard Briefing"},
        {"role": "Administrator", "title": "City Administrator briefing"},
        {"role": "NGO Coordinator", "title": "NGO Community Relief Briefing"}
    ]
    
    briefings = []
    for r in roles:
        role_type = r["role"]
        brief_text = ""
        urgent_actions = []
        
        if role_type == "Mayor":
            brief_text = (
                f"Good morning, Mayor. Here is your executive briefing. There are currently {stats['active_emergencies']} active emergency incidents "
                f"requiring coordination. Citizen reports are at {stats['total_reports']} with a {stats['resolved_reports']} resolution count. "
                "The IT / Workflow automation engine is running optimally."
            )
            urgent_actions = [
                {"title": "Review active emergency dispatch operations.", "priority": "Critical"},
                {"title": "Authorize funding reallocation for Ward 7 drainage systems.", "priority": "High"}
            ]
        elif role_type == "Ward Officer":
            brief_text = (
                f"Attention Ward Officers. Ward hotspots indicate heightened citizen complaints in Metro sectors. "
                f"Total unresolved complaints is currently {stats['active_reports']}. Please coordinate department cleanup teams."
            )
            urgent_actions = [
                {"title": "Dispatch sewer cleaning squad to Metro Ward 4.", "priority": "High"}
            ]
        elif role_type == "Administrator":
            brief_text = (
                f"System Health Update: Global registered users are at {stats['total_users']}. "
                f"Active workflow rules: {stats['active_rules_count']} rules deployed, with {stats['workflow_success_count']} successful runs."
            )
            urgent_actions = [
                {"title": "Inspect failed workflow alerts history logs.", "priority": "Medium"}
            ]
        else: # NGO
            brief_text = (
                f"Community update for NGO partners: Active emergencies count is {stats['active_emergencies']}. "
                "Citizen engagement points are rising. Healthcare summaries indicate public health advisory campaigns are active."
            )
            urgent_actions = [
                {"title": "Coordinate shelter supplies with Emergency command.", "priority": "High"}
            ]

        briefings.append({
            "role": role_type,
            "title": r["title"],
            "briefing_text": brief_text,
            "urgent_actions": urgent_actions,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    return briefings

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_executive_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve summarized executive metrics widgets."""
    from app.ai.agents.reporting import fetch_database_aggregates
    stats = await fetch_database_aggregates(db)
    
    # Generate critical risks list
    critical_risks = []
    if stats["active_emergencies"] > 0:
        critical_risks.append({
            "domain": "Emergency Dispatch",
            "description": f"Handling {stats['active_emergencies']} active dispatch events.",
            "severity": "Critical"
        })
    else:
        critical_risks.append({
            "domain": "Utility Systems",
            "description": "Minor water logging risks reported in suburban boundaries.",
            "severity": "Medium"
        })

    return {
        "latest_reports_count": stats["total_reports"],
        "resolved_reports_count": stats["resolved_reports"],
        "active_emergencies_count": stats["active_emergencies"],
        "critical_risks": critical_risks,
        "executive_kpis": {
            "resolution_rate": f"{round((stats['resolved_reports'] / stats['total_reports']) * 100) if stats['total_reports'] > 0 else 100}%",
            "system_users": stats["total_users"],
            "deployed_rules": stats["active_rules_count"]
        },
        "department_performance": [
            {"name": "Water Works", "score": 88, "status": "Stable"},
            {"name": "Emergency Command", "score": 94, "status": "High Workload"},
            {"name": "Healthcare & Sanitation", "score": 85, "status": "Optimized"}
        ]
    }

@router.post("/export")
async def export_report(
    payload: ExportRequestSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Simulates exporting a report. Generates a download stream according to requested format."""
    query = select(ExecutiveReport).where(ExecutiveReport.id == payload.report_id)
    result = await db.execute(query)
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Executive report not found."
        )
        
    report_data = json.loads(report.content)
    
    # Simulating exports
    export_format = payload.format.lower()
    if export_format == "json":
        export_bytes = json.dumps(report_data, indent=2).encode("utf-8")
        media_type = "application/json"
        filename = f"{report.title.replace(' ', '_')}.json"
    elif export_format == "csv":
        # Compile simple key-value metrics table as CSV
        csv_lines = ["Metric,Value"]
        metrics = report_data.get("key_metrics", {})
        for k, v in metrics.items():
            csv_lines.append(f"{k},{v}")
        export_bytes = "\n".join(csv_lines).encode("utf-8")
        media_type = "text/csv"
        filename = f"{report.title.replace(' ', '_')}.csv"
    else:
        # Mock streams for PDF, Excel, PowerPoint placeholder
        mock_content = f"--- CivicMind AI Executive Document Export ({export_format.upper()}) ---\n"
        mock_content += f"Report: {report.title}\n"
        mock_content += f"Summary: {report_data.get('executive_summary')}\n"
        export_bytes = mock_content.encode("utf-8")
        media_type = "application/octet-stream"
        filename = f"{report.title.replace(' ', '_')}.{export_format}"

    return Response(
        content=export_bytes,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
