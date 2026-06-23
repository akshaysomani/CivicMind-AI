"""
Module 5 — Smart Issue Reporting API
Full CRUD + attachments + status tracking + history
"""
import os
import uuid
import shutil
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import (
    APIRouter, Depends, HTTPException, Query, UploadFile, File,
    status as http_status
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.models.report import Report, saved_reports
from app.models.attachment import Attachment
from app.models.status_history import StatusHistory

from app.schemas.report import (
    ReportCreate, ReportUpdate, ReportOut, ReportDetailOut,
    StatusUpdateRequest, TrackingOut, AttachmentOut
)

router = APIRouter(prefix="/issues", tags=["Smart Issue Reporting"])

# ── Constants ────────────────────────────────────────────────────────────────

UPLOAD_DIR = "public/uploads/issues"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo"}
ALLOWED_DOC_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_MIME_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES | ALLOWED_DOC_TYPES
MAX_FILE_SIZE_MB = 10
MAX_FILES_PER_REPORT = 6

STATUS_PROGRESS_MAP = {
    "Submitted": 5,
    "Verified": 20,
    "Assigned": 35,
    "In Progress": 55,
    "Under Inspection": 75,
    "Resolved": 95,
    "Closed": 100,
    "Rejected": 0,
}

CATEGORY_DEPT_MAP = {
    "Road Damage": "Public Works Department",
    "Potholes": "Public Works Department",
    "Street Lights": "Electricity Department",
    "Garbage Collection": "Sanitation Department",
    "Water Leakage": "Water & Sewage Department",
    "Water Supply": "Water & Sewage Department",
    "Drainage": "Water & Sewage Department",
    "Sewage": "Water & Sewage Department",
    "Traffic": "Traffic Police",
    "Illegal Parking": "Traffic Police",
    "Public Transport": "Transport Department",
    "Air Pollution": "Environment Department",
    "Noise Pollution": "Environment Department",
    "Tree Damage": "Forest & Horticulture Department",
    "Flooding": "Disaster Management Department",
    "Electricity": "Electricity Department",
    "Public Safety": "Police Department",
    "Healthcare": "Health Department",
    "Government Office": "General Administration Department",
    "Education": "Education Department",
    "Animal Rescue": "Municipal Corporation",
    "Fire Hazard": "Fire Department",
    "Disaster": "Disaster Management Department",
    "Illegal Construction": "Town Planning Department",
    "Others": "General Administration Department",
}

CATEGORY_ETA_MAP = {
    "Fire Hazard": 4,
    "Disaster": 6,
    "Flooding": 12,
    "Electricity": 24,
    "Public Safety": 24,
    "Water Leakage": 24,
    "Water Supply": 48,
    "Sewage": 48,
    "Animal Rescue": 24,
    "Healthcare": 48,
    "Road Damage": 72,
    "Potholes": 72,
    "Street Lights": 72,
    "Drainage": 72,
    "Traffic": 48,
    "Garbage Collection": 48,
    "Air Pollution": 96,
    "Noise Pollution": 96,
    "Tree Damage": 72,
    "Illegal Parking": 48,
    "Public Transport": 96,
    "Illegal Construction": 120,
    "Education": 120,
    "Government Office": 96,
    "Others": 72,
}


# ── Helper functions ──────────────────────────────────────────────────────────

def _get_file_type(mime: str) -> str:
    if mime in ALLOWED_IMAGE_TYPES:
        return "image"
    if mime in ALLOWED_VIDEO_TYPES:
        return "video"
    return "document"


async def _record_status_change(
    db: AsyncSession,
    report: Report,
    new_status: str,
    changed_by_id: Optional[int],
    note: Optional[str] = None,
):
    history = StatusHistory(
        report_id=report.id,
        old_status=report.status,
        new_status=new_status,
        changed_by_id=changed_by_id,
        note=note,
    )
    db.add(history)
    report.status = new_status
    report.progress = STATUS_PROGRESS_MAP.get(new_status, report.progress)
    if new_status == "Resolved":
        report.resolved_at = datetime.now(timezone.utc)


# ── POST /issues — Create a new issue report ─────────────────────────────────

@router.post("", response_model=ReportOut, status_code=http_status.HTTP_201_CREATED)
async def create_issue(
    payload: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen", "NGO"])),
):
    """Submit a new community issue report. Generates complaint ID and tracking number."""
    report = Report(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        severity=payload.severity,
        address=payload.address,
        ward=payload.ward,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        postal_code=payload.postal_code,
        latitude=payload.latitude,
        longitude=payload.longitude,
        nearby_landmark=payload.nearby_landmark,
        is_anonymous=payload.is_anonymous,
        contact_method=payload.contact_method,
        consent_given=payload.consent_given,
        citizen_id=current_user.id,
        assigned_department=CATEGORY_DEPT_MAP.get(payload.category, "General Administration Department"),
        estimated_response_hours=CATEGORY_ETA_MAP.get(payload.category, 72),
        status="Submitted",
        progress=STATUS_PROGRESS_MAP["Submitted"],
    )
    db.add(report)
    await db.flush()  # Get the ID before committing

    # Create initial status history entry
    history = StatusHistory(
        report_id=report.id,
        old_status=None,
        new_status="Submitted",
        changed_by_id=current_user.id,
        note="Issue report submitted by citizen.",
    )
    db.add(history)
    await db.commit()
    await db.refresh(report)
    return report


# ── GET /issues — List issues with filters/search/pagination ─────────────────

@router.get("", response_model=List[ReportOut])
async def list_issues(
    search: Optional[str] = Query(None, description="Search title/description"),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    limit: int = Query(12, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List issues — citizens see only their own; government/NGO/admin see all."""
    query = select(Report).where(Report.is_deleted == False)  # noqa: E712

    # Role-based scoping
    if current_user.role == "Citizen":
        query = query.where(Report.citizen_id == current_user.id)

    # Filters
    if search:
        query = query.where(
            or_(
                Report.title.ilike(f"%{search}%"),
                Report.description.ilike(f"%{search}%"),
                Report.complaint_id.ilike(f"%{search}%"),
            )
        )
    if category:
        query = query.where(Report.category == category)
    if priority:
        query = query.where(Report.priority == priority)
    if severity:
        query = query.where(Report.severity == severity)
    if status:
        query = query.where(Report.status == status)
    if ward:
        query = query.where(Report.ward.ilike(f"%{ward}%"))
    if date_from:
        query = query.where(Report.created_at >= date_from)
    if date_to:
        query = query.where(Report.created_at <= date_to)

    # Sorting
    sort_col = {
        "title": Report.title,
        "priority": Report.priority,
        "status": Report.status,
        "category": Report.category,
        "created_at": Report.created_at,
        "updated_at": Report.updated_at,
    }.get(sort_by, Report.created_at)
    direction = desc if sort_order == "desc" else asc
    query = query.order_by(direction(sort_col))

    # Pagination
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    reports = result.scalars().all()

    # Determine saved status for citizens
    saved_ids: set = set()
    if current_user.role == "Citizen":
        saved_query = select(saved_reports.c.report_id).where(
            saved_reports.c.user_id == current_user.id
        )
        saved_res = await db.execute(saved_query)
        saved_ids = set(saved_res.scalars().all())

    out = []
    for r in reports:
        item = ReportOut.model_validate(r)
        item.is_saved = r.id in saved_ids
        out.append(item)
    return out


# ── GET /issues/count — Quick count for stats ────────────────────────────────

@router.get("/count", response_model=dict)
async def count_issues(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return issue counts grouped by status for the current user."""
    base = select(Report.status, func.count(Report.id)).where(Report.is_deleted == False)  # noqa: E712
    if current_user.role == "Citizen":
        base = base.where(Report.citizen_id == current_user.id)
    base = base.group_by(Report.status)
    result = await db.execute(base)
    rows = result.all()
    return {row[0]: row[1] for row in rows}


# ── GET /issues/track/{complaint_id} — Public tracking (no auth) ─────────────

@router.get("/track/{complaint_id}", response_model=TrackingOut)
async def track_issue_public(
    complaint_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint to track an issue by complaint ID. No authentication required."""
    result = await db.execute(
        select(Report)
        .options(selectinload(Report.status_history))
        .where(
            and_(Report.complaint_id == complaint_id.upper(), Report.is_deleted == False)  # noqa: E712
        )
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="No report found with this complaint ID.",
        )
    return report


# ── GET /issues/{id} — Full issue detail ─────────────────────────────────────

@router.get("/{issue_id}", response_model=ReportDetailOut)
async def get_issue(
    issue_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch full issue detail including attachments and status history."""
    result = await db.execute(
        select(Report)
        .options(
            selectinload(Report.attachments),
            selectinload(Report.status_history)
        )
        .where(and_(Report.id == issue_id, Report.is_deleted == False))  # noqa: E712
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    # Citizens can only view their own reports
    if current_user.role == "Citizen" and report.citizen_id != current_user.id:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return report


# ── PUT /issues/{id} — Update issue details ───────────────────────────────────

@router.put("/{issue_id}", response_model=ReportOut)
async def update_issue(
    issue_id: int,
    payload: ReportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen", "NGO"])),
):
    """Update editable fields of an issue. Only the owner can edit their report."""
    result = await db.execute(
        select(Report).where(and_(Report.id == issue_id, Report.is_deleted == False))  # noqa: E712
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Issue not found.")
    if report.citizen_id != current_user.id:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Only the reporter can edit this issue.")
    if report.status not in {"Submitted", "Verified"}:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Issue can only be edited while in Submitted or Verified status.",
        )

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(report, field, value)

    await db.commit()
    await db.refresh(report)
    return report


# ── DELETE /issues/{id} — Soft delete issue ───────────────────────────────────

@router.delete("/{issue_id}", response_model=dict)
async def delete_issue(
    issue_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen", "NGO", "Admin"])),
):
    """Soft-delete an issue. Citizens can only delete their own Submitted reports."""
    result = await db.execute(
        select(Report).where(and_(Report.id == issue_id, Report.is_deleted == False))  # noqa: E712
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    if current_user.role not in {"Admin"} and report.citizen_id != current_user.id:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Access denied.")
    if current_user.role == "Citizen" and report.status != "Submitted":
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="You can only withdraw a report that has not yet been processed.",
        )

    report.is_deleted = True
    await db.commit()
    return {"message": "Issue report withdrawn successfully.", "id": issue_id}


# ── POST /issues/{id}/status — Update issue status (Gov/Admin) ───────────────

@router.post("/{issue_id}/status", response_model=ReportOut)
async def update_issue_status(
    issue_id: int,
    payload: StatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Government", "Admin"])),
):
    """Update the status of an issue. Government officers and admins only."""
    result = await db.execute(
        select(Report).where(and_(Report.id == issue_id, Report.is_deleted == False))  # noqa: E712
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Issue not found.")

    await _record_status_change(db, report, payload.new_status, current_user.id, payload.note)
    await db.commit()
    await db.refresh(report)
    return report


# ── GET /issues/{id}/history — Status audit trail ────────────────────────────

@router.get("/{issue_id}/history")
async def get_issue_history(
    issue_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch the full status change audit trail for an issue."""
    report_result = await db.execute(
        select(Report).where(and_(Report.id == issue_id, Report.is_deleted == False))  # noqa: E712
    )
    report = report_result.scalars().first()
    if not report:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Issue not found.")
    if current_user.role == "Citizen" and report.citizen_id != current_user.id:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Access denied.")

    result = await db.execute(
        select(StatusHistory)
        .where(StatusHistory.report_id == issue_id)
        .order_by(StatusHistory.created_at)
    )
    from app.schemas.report import StatusHistoryOut
    return [StatusHistoryOut.model_validate(h) for h in result.scalars().all()]


# ── POST /issues/{id}/attachments — Upload media files ───────────────────────

@router.post("/{issue_id}/attachments", response_model=List[AttachmentOut])
async def upload_attachments(
    issue_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen", "NGO"])),
):
    """Upload up to 6 media files (images/videos/docs) for an issue report."""
    report_result = await db.execute(
        select(Report).where(and_(Report.id == issue_id, Report.is_deleted == False))  # noqa: E712
    )
    report = report_result.scalars().first()
    if not report:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Issue not found.")
    if report.citizen_id != current_user.id:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Check existing attachment count
    existing_result = await db.execute(
        select(func.count(Attachment.id)).where(Attachment.report_id == issue_id)
    )
    existing_count = existing_result.scalar() or 0
    if existing_count + len(files) > MAX_FILES_PER_REPORT:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_FILES_PER_REPORT} files allowed per report.",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    created_attachments = []

    for upload in files:
        mime = upload.content_type or "application/octet-stream"
        if mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=http_status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"File type '{mime}' is not allowed. Supported: images, videos, PDFs, Word docs.",
            )

        # Read & size-check
        content = await upload.read()
        if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=http_status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File '{upload.filename}' exceeds {MAX_FILE_SIZE_MB}MB limit.",
            )

        # Save file to disk
        ext = os.path.splitext(upload.filename or "file")[1]
        safe_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(file_path, "wb") as f:
            f.write(content)

        attachment = Attachment(
            report_id=issue_id,
            filename=safe_name,
            original_name=upload.filename or safe_name,
            file_path=f"/uploads/issues/{safe_name}",
            file_type=_get_file_type(mime),
            mime_type=mime,
            file_size=len(content),
        )
        db.add(attachment)
        created_attachments.append(attachment)

    await db.commit()
    for a in created_attachments:
        await db.refresh(a)

    return [AttachmentOut.model_validate(a) for a in created_attachments]


# ── DELETE /issues/{id}/attachments/{att_id} — Remove an attachment ──────────

@router.delete("/{issue_id}/attachments/{att_id}", response_model=dict)
async def delete_attachment(
    issue_id: int,
    att_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen", "NGO"])),
):
    """Remove a single attachment from an issue report."""
    att_result = await db.execute(
        select(Attachment).where(
            and_(Attachment.id == att_id, Attachment.report_id == issue_id)
        )
    )
    att = att_result.scalars().first()
    if not att:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Attachment not found.")

    # Check ownership via report
    rep_result = await db.execute(select(Report).where(Report.id == issue_id))
    report = rep_result.scalars().first()
    if not report or report.citizen_id != current_user.id:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Remove file from disk if it exists
    disk_path = os.path.join("public", att.file_path.lstrip("/"))
    if os.path.exists(disk_path):
        os.remove(disk_path)

    await db.delete(att)
    await db.commit()
    return {"message": "Attachment removed successfully.", "id": att_id}
