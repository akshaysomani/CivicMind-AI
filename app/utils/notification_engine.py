import json
import logging
from datetime import datetime, time, timezone
from typing import Dict, Any, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.models.notification import Notification
from app.models.workflow import WorkflowRule, WorkflowHistory, NotificationPreference
from app.utils.event_bus import event_bus

logger = logging.getLogger("notification_engine")

# Session maker can be overridden for testing
_session_maker = AsyncSessionLocal

def set_session_maker(session_maker):
    global _session_maker
    _session_maker = session_maker

def is_in_quiet_hours(start_str: str, end_str: str) -> bool:
    """Check if the current local time falls within user's quiet hours."""
    if not start_str or not end_str:
        return False
    try:
        now = datetime.now().time()
        start_h, start_m = map(int, start_str.split(":"))
        end_h, end_m = map(int, end_str.split(":"))
        start_time = time(start_h, start_m)
        end_time = time(end_h, end_m)
        
        if start_time <= end_time:
            return start_time <= now <= end_time
        else:  # quiet hours cross midnight (e.g. 22:00 to 07:00)
            return now >= start_time or now <= end_time
    except Exception as e:
        logger.warning(f"Error parsing quiet hours: {e}")
        return False

def evaluate_condition(condition_str: str, data: Dict[str, Any]) -> bool:
    """Evaluate condition filters JSON against event data."""
    if not condition_str:
        return True
    try:
        conds = json.loads(condition_str)
        if not isinstance(conds, dict):
            return True
        for key, value in conds.items():
            if key not in data:
                return False
            # Check for value match
            if data[key] != value:
                return False
        return True
    except Exception as e:
        logger.warning(f"Error evaluating condition '{condition_str}': {e}")
        return True

async def get_recipient_users(db: AsyncSession, action_dict: Dict[str, Any], data: Dict[str, Any]) -> List[User]:
    """Resolve which users should receive notifications based on rule action filters and data."""
    users = []
    
    # 1. Direct user reference from event data or action
    user_ids = action_dict.get("user_ids") or []
    if not user_ids:
        # Check standard properties
        for key in ["user_id", "reporter_id", "assigned_to_id", "citizen_id"]:
            if key in data and data[key]:
                user_ids.append(data[key])
                
    if user_ids:
        query = select(User).where(User.id.in_(user_ids))
        res = await db.execute(query)
        users.extend(res.scalars().all())
        
    # 2. Filter by Roles and Sub-roles
    roles = action_dict.get("roles")
    sub_roles = action_dict.get("sub_roles")
    
    if roles or sub_roles:
        query = select(User)
        if roles:
            query = query.where(User.role.in_(roles))
        if sub_roles:
            query = query.where(User.sub_role.in_(sub_roles))
        res = await db.execute(query)
        existing_ids = {u.id for u in users}
        for u in res.scalars().all():
            if u.id not in existing_ids:
                users.append(u)
                
    # 3. Fallback: If no users matched, notify Admin users
    if not users:
        query = select(User).where(User.role == "Admin")
        res = await db.execute(query)
        users.extend(res.scalars().all())
        
    return users

def format_template(template: str, data: Dict[str, Any]) -> str:
    """Format string using dictionary keys if present."""
    try:
        return template.format(**data)
    except Exception:
        return template

async def dispatch_notification(
    db: AsyncSession, 
    user: User, 
    title: str, 
    message: str, 
    type_str: str, 
    channels: List[str]
) -> Tuple[List[str], bool]:
    """Fetch user preferences, evaluate quiet hours, and log mocks for channels."""
    # Fetch user preferences
    pref_query = select(NotificationPreference).where(NotificationPreference.user_id == user.id)
    pref_res = await db.execute(pref_query)
    pref = pref_res.scalar_one_or_none()
    
    email_enabled = pref.email_enabled if pref else True
    sms_enabled = pref.sms_enabled if pref else True
    push_enabled = pref.push_enabled if pref else True
    in_app_enabled = pref.in_app_enabled if pref else True
    quiet_start = pref.quiet_hours_start if pref else None
    quiet_end = pref.quiet_hours_end if pref else None
    
    # Check quiet hours
    quiet_active = is_in_quiet_hours(quiet_start, quiet_end)
    
    # In-App notifications are saved to db if user preferences allow
    if in_app_enabled:
        new_notif = Notification(
            user_id=user.id,
            title=title,
            message=message,
            type=type_str,
            is_read=False
        )
        db.add(new_notif)
        
    dispatched_channels = []
    if not quiet_active:
        if "email" in channels and email_enabled:
            logger.info(f"[MOCK EMAIL] Sent to {user.email} -> {title}: {message}")
            dispatched_channels.append("email")
        if "sms" in channels and sms_enabled:
            logger.info(f"[MOCK SMS] Sent to {user.phone} -> {message}")
            dispatched_channels.append("sms")
        if "push" in channels and push_enabled:
            logger.info(f"[MOCK PUSH] Sent to User ID {user.id} -> {title}")
            dispatched_channels.append("push")
    else:
        logger.info(f"[QUIET HOURS] Suppressed email/sms/push delivery for User ID {user.id}")
        
    return dispatched_channels, quiet_active

async def handle_system_event(event_type: str, data: Dict[str, Any]):
    """System event callback. Evaluates rules and executes notifications."""
    logger.info(f"System Notification Engine handling event: {event_type}")
    
    async with _session_maker() as db:
        try:
            # Query active rules for this trigger event
            rules_query = select(WorkflowRule).where(
                WorkflowRule.trigger == event_type, 
                WorkflowRule.is_active == True
            )
            rules_res = await db.execute(rules_query)
            rules = rules_res.scalars().all()
            
            if not rules:
                logger.debug(f"No active workflow rules found for event: {event_type}")
                return
                
            for rule in rules:
                # 1. Evaluate Condition
                if not evaluate_condition(rule.condition, data):
                    logger.info(f"Rule '{rule.name}' condition did not match event data.")
                    continue
                
                # 2. Parse Action config
                try:
                    action_dict = json.loads(rule.action)
                except Exception as e:
                    logger.error(f"Failed to parse action JSON for rule '{rule.name}': {e}")
                    continue
                
                channels = action_dict.get("channels", ["in_app"])
                title_template = action_dict.get("title", f"Alert: {rule.name}")
                message_template = action_dict.get("message", f"An event of type {event_type} occurred.")
                
                # Format templated values
                title = format_template(title_template, data)
                message = format_template(message_template, data)
                
                # 3. Resolve target users
                recipients = await get_recipient_users(db, action_dict, data)
                
                execution_details = []
                success = True
                
                # 4. Dispatch notification to each recipient
                for user in recipients:
                    try:
                        dispatched, quiet = await dispatch_notification(
                            db, user, title, message, event_type, channels
                        )
                        detail = f"User {user.id} (Dispatched: {', '.join(dispatched)}"
                        if quiet:
                            detail += "; Quiet Hours Active"
                        detail += ")"
                        execution_details.append(detail)
                    except Exception as ex:
                        success = False
                        logger.error(f"Error dispatching for User {user.id}: {ex}")
                        execution_details.append(f"User {user.id} failed: {str(ex)}")
                
                # 5. Record Workflow History log
                history = WorkflowHistory(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    trigger_event=event_type,
                    execution_status="success" if success else "failed",
                    details=", ".join(execution_details)[:500]
                )
                db.add(history)
                
            await db.commit()
            
        except Exception as e:
            logger.error(f"Error running notification engine for event {event_type}: {e}", exc_info=True)
            await db.rollback()

# Subscription functions helper
def make_handler(event_type: str):
    async def handler(data: Dict[str, Any]):
        await handle_system_event(event_type, data)
    return handler

# Register the handlers to the event bus singleton
for et in [
    "issue_created", 
    "issue_updated", 
    "emergency_triggered", 
    "health_advisory_published", 
    "scheme_recommended", 
    "prediction_generated"
]:
    event_bus.subscribe(et, make_handler(et))
