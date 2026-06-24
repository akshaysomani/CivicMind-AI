import json
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.models.workflow import NotificationPreference, WorkflowRule, WorkflowHistory
from app.utils.event_bus import event_bus
from app.utils.notification_engine import handle_system_event


router = APIRouter(prefix="/notifications", tags=["Notifications & Workflows"])

# Pydantic Schemas
class PreferenceUpdateSchema(BaseModel):
    email_enabled: bool = True
    sms_enabled: bool = True
    in_app_enabled: bool = True
    push_enabled: bool = True
    quiet_hours_start: Optional[str] = Field(None, description="HH:MM format, e.g. 22:00")
    quiet_hours_end: Optional[str] = Field(None, description="HH:MM format, e.g. 07:00")

class RuleCreateSchema(BaseModel):
    name: str = Field(..., max_length=100)
    trigger: str = Field(..., description="issue_created, emergency_triggered, etc.")
    condition: Optional[str] = Field(None, description="JSON condition string")
    action: str = Field(..., description="JSON action string detailing recipient / channel / template details")
    delay: int = Field(0, description="delay in seconds")
    is_active: bool = True

class RuleSimulateSchema(BaseModel):
    trigger: str
    data: Dict[str, Any]

class ReadNotificationsSchema(BaseModel):
    ids: Optional[List[int]] = None

class ArchiveNotificationsSchema(BaseModel):
    ids: Optional[List[int]] = None


# Endpoints
@router.get("", response_model=List[Dict[str, Any]])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all notifications for the current logged-in user."""
    query = select(Notification).where(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc())
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        } for n in notifications
    ]

@router.get("/unread", response_model=Dict[str, int])
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch count of unread notifications for the user."""
    query = select(func.count(Notification.id)).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    result = await db.execute(query)
    count = result.scalar_one()
    return {"count": count}

@router.post("/read")
async def mark_notifications_read(
    payload: ReadNotificationsSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark specific or all notifications for the user as read."""
    query = select(Notification).where(Notification.user_id == current_user.id)
    if payload.ids:
        query = query.where(Notification.id.in_(payload.ids))
    else:
        query = query.where(Notification.is_read == False)
        
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    for n in notifications:
        n.is_read = True
        
    await db.commit()
    return {"message": f"Successfully marked {len(notifications)} notifications as read."}

@router.post("/archive")
async def archive_notifications(
    payload: ArchiveNotificationsSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete/archive notifications for the current user."""
    if payload.ids:
        query = delete(Notification).where(
            Notification.user_id == current_user.id,
            Notification.id.in_(payload.ids)
        )
    else:
        query = delete(Notification).where(Notification.user_id == current_user.id)
        
    result = await db.execute(query)
    await db.commit()
    return {"message": "Notifications archived successfully."}

@router.get("/preferences", response_model=Dict[str, Any])
async def get_notification_preferences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get or initialize notification channel and quiet hours preferences for the user."""
    query = select(NotificationPreference).where(NotificationPreference.user_id == current_user.id)
    result = await db.execute(query)
    pref = result.scalar_one_or_none()
    
    if not pref:
        # Create default preferences
        pref = NotificationPreference(
            user_id=current_user.id,
            email_enabled=True,
            sms_enabled=True,
            in_app_enabled=True,
            push_enabled=True,
            quiet_hours_start=None,
            quiet_hours_end=None
        )
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
        
    return {
        "email_enabled": pref.email_enabled,
        "sms_enabled": pref.sms_enabled,
        "in_app_enabled": pref.in_app_enabled,
        "push_enabled": pref.push_enabled,
        "quiet_hours_start": pref.quiet_hours_start,
        "quiet_hours_end": pref.quiet_hours_end
    }

@router.post("/preferences", response_model=Dict[str, Any])
async def save_notification_preferences(
    payload: PreferenceUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notification preferences."""
    query = select(NotificationPreference).where(NotificationPreference.user_id == current_user.id)
    result = await db.execute(query)
    pref = result.scalar_one_or_none()
    
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        
    pref.email_enabled = payload.email_enabled
    pref.sms_enabled = payload.sms_enabled
    pref.in_app_enabled = payload.in_app_enabled
    pref.push_enabled = payload.push_enabled
    pref.quiet_hours_start = payload.quiet_hours_start
    pref.quiet_hours_end = payload.quiet_hours_end
    
    await db.commit()
    return {"message": "Preferences updated successfully."}

@router.get("/alerts/dashboard", response_model=Dict[str, Any])
async def get_alerts_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve high-level metrics for the notification and alerting dashboard."""
    # 1. Total sent to this user
    total_query = select(func.count(Notification.id)).where(Notification.user_id == current_user.id)
    total_res = await db.execute(total_query)
    total_sent = total_res.scalar_one()

    # 2. Unread count
    unread_query = select(func.count(Notification.id)).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    unread_res = await db.execute(unread_query)
    unread_count = unread_res.scalar_one()

    # 3. Sent by type for this user
    type_query = select(Notification.type, func.count(Notification.id)).where(
        Notification.user_id == current_user.id
    ).group_by(Notification.type)
    type_res = await db.execute(type_query)
    sent_by_type = {r[0]: r[1] for r in type_res.all()}

    # 4. Global active rules count
    rules_query = select(func.count(WorkflowRule.id)).where(WorkflowRule.is_active == True)
    rules_res = await db.execute(rules_query)
    active_rules_count = rules_res.scalar_one()

    # 5. Global failed workflow executions
    failed_query = select(func.count(WorkflowHistory.id)).where(WorkflowHistory.execution_status == "failed")
    failed_res = await db.execute(failed_query)
    failed_runs_count = failed_res.scalar_one()

    # 6. Global success workflow executions
    success_query = select(func.count(WorkflowHistory.id)).where(WorkflowHistory.execution_status == "success")
    success_res = await db.execute(success_query)
    success_runs_count = success_res.scalar_one()

    return {
        "total_sent": total_sent,
        "unread_count": unread_count,
        "sent_by_type": sent_by_type,
        "active_rules_count": active_rules_count,
        "failed_runs_count": failed_runs_count,
        "success_runs_count": success_runs_count
    }

# Workflow Rule Endpoints
@router.get("/workflow/rules", response_model=List[Dict[str, Any]])
async def list_workflow_rules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve list of all active/inactive workflow rules."""
    query = select(WorkflowRule).order_by(WorkflowRule.created_at.desc())
    result = await db.execute(query)
    rules = result.scalars().all()
    
    return [
        {
            "id": r.id,
            "name": r.name,
            "trigger": r.trigger,
            "condition": r.condition,
            "action": r.action,
            "delay": r.delay,
            "is_active": r.is_active,
            "created_at": r.created_at.isoformat()
        } for r in rules
    ]

@router.post("/workflow/rules", response_model=Dict[str, Any])
async def create_workflow_rule(
    payload: RuleCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new custom workflow rule."""
    rule = WorkflowRule(
        name=payload.name,
        trigger=payload.trigger,
        condition=payload.condition,
        action=payload.action,
        delay=payload.delay,
        is_active=payload.is_active,
        user_id=current_user.id
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return {
        "id": rule.id,
        "name": rule.name,
        "message": "Workflow rule created successfully."
    }

@router.delete("/workflow/rules/{rule_id}")
async def delete_workflow_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a workflow rule."""
    query = select(WorkflowRule).where(WorkflowRule.id == rule_id)
    result = await db.execute(query)
    rule = result.scalar_one_or_none()
    
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow rule not found."
        )
        
    await db.delete(rule)
    await db.commit()
    return {"message": "Workflow rule deleted successfully."}

@router.get("/workflow/history", response_model=List[Dict[str, Any]])
async def get_workflow_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve execution logs for all workflow rules."""
    query = select(WorkflowHistory).order_by(WorkflowHistory.executed_at.desc()).limit(100)
    result = await db.execute(query)
    history = result.scalars().all()
    
    return [
        {
            "id": h.id,
            "rule_id": h.rule_id,
            "rule_name": h.rule_name,
            "trigger_event": h.trigger_event,
            "execution_status": h.execution_status,
            "details": h.details,
            "executed_at": h.executed_at.isoformat()
        } for h in history
    ]

@router.post("/workflow/rules/simulate")
async def simulate_rule_trigger(
    payload: RuleSimulateSchema,
    current_user: User = Depends(get_current_user)
):
    """Simulate a workflow event trigger by broadcasting it to the event bus."""
    # Ensure current user is in data as a recipient fallback if needed
    data = dict(payload.data)
    if "user_id" not in data:
        data["user_id"] = current_user.id
        
    # Publish to internal pub/sub event bus
    await event_bus.publish(payload.trigger, data)
    
    return {
        "status": "event_published",
        "trigger": payload.trigger,
        "message": f"Successfully simulated trigger: {payload.trigger}"
    }
