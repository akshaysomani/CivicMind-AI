from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc

from app.api.deps import get_db, get_current_user, require_role
from app.models.user import User
from app.models.report import Report, saved_reports
from app.models.notification import Notification
from app.models.feed import FeedPost, liked_feed_posts, bookmarked_feed_posts
from app.models.alert import Alert

from app.schemas.report import ReportOut, ReportCreate
from app.schemas.notification import NotificationOut
from app.schemas.feed import FeedPostOut
from app.schemas.alert import AlertOut
from app.schemas.citizen import DashboardStatsOut, InsightCardOut, AchievementBadgeOut

router = APIRouter(prefix="/citizen", tags=["Citizen Operations"])

@router.get("/dashboard/stats", response_model=DashboardStatsOut)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Fetch aggregated statistics for the citizen's command center dashboard."""
    # Count reported issues for this user
    reported_query = select(func.count(Report.id)).where(Report.citizen_id == current_user.id)
    reported_result = await db.execute(reported_query)
    issues_reported = reported_result.scalar() or 0

    # Resolved count
    resolved_query = select(func.count(Report.id)).where(
        and_(Report.citizen_id == current_user.id, Report.status == "Resolved")
    )
    resolved_result = await db.execute(resolved_query)
    resolved_issues = resolved_result.scalar() or 0

    # Pending count (everything except Resolved and Rejected)
    pending_query = select(func.count(Report.id)).where(
        and_(
            Report.citizen_id == current_user.id, 
            Report.status.in_(["Open", "In Progress"])
        )
    )
    pending_result = await db.execute(pending_query)
    pending_issues = pending_result.scalar() or 0

    # Nearby active alerts in citizen's city
    alerts_query = select(func.count(Alert.id)).where(
        and_(Alert.city == current_user.city, Alert.status == "Active")
    )
    alerts_result = await db.execute(alerts_query)
    nearby_alerts = alerts_result.scalar() or 0

    # Participation Score = (resolved * 15) + (total reported * 10) + 50 (base points)
    participation_score = (resolved_issues * 15) + (issues_reported * 10) + 50

    return DashboardStatsOut(
        issues_reported=issues_reported,
        resolved_issues=resolved_issues,
        pending_issues=pending_issues,
        nearby_alerts=nearby_alerts,
        ai_insights=4,  # Static threshold for simulated suggestions
        participation_score=participation_score
    )

@router.get("/reports", response_model=List[ReportOut])
async def get_citizen_reports(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Fetch sorted, filtered, and paginated reports for the current citizen."""
    # Base query for user's reports
    query = select(Report).where(Report.citizen_id == current_user.id)

    # Search filter
    if search:
        query = query.where(
            or_(
                Report.title.ilike(f"%{search}%"),
                Report.description.ilike(f"%{search}%"),
                Report.assigned_department.ilike(f"%{search}%")
            )
        )

    # Filters
    if status:
        query = query.where(Report.status == status)
    if priority:
        query = query.where(Report.priority == priority)
    if category:
        query = query.where(Report.category == category)

    # Sorting
    direction = desc if sort_order == "desc" else asc
    if sort_by == "title":
        query = query.order_by(direction(Report.title))
    elif sort_by == "priority":
        query = query.order_by(direction(Report.priority))
    elif sort_by == "status":
        query = query.order_by(direction(Report.status))
    elif sort_by == "progress":
        query = query.order_by(direction(Report.progress))
    else:
        query = query.order_by(direction(Report.created_at))

    # Pagination
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    reports = result.scalars().all()

    # Determine if they are saved/bookmarked by fetching saved reports list
    saved_query = select(saved_reports.c.report_id).where(saved_reports.c.user_id == current_user.id)
    saved_res = await db.execute(saved_query)
    saved_ids = set(saved_res.scalars().all())

    reports_out = []
    for r in reports:
        report_data = ReportOut.model_validate(r)
        report_data.is_saved = r.id in saved_ids
        reports_out.append(report_data)

    return reports_out

@router.post("/reports/{report_id}/save", response_model=dict)
async def toggle_save_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Toggle saving/bookmarking a community report."""
    # Verify report exists
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )

    # Check if already bookmarked
    bookmark_query = select(saved_reports).where(
        and_(saved_reports.c.user_id == current_user.id, saved_reports.c.report_id == report_id)
    )
    bookmark_res = await db.execute(bookmark_query)
    is_saved = bookmark_res.first() is not None

    if is_saved:
        # Remove bookmark
        stmt = saved_reports.delete().where(
            and_(saved_reports.c.user_id == current_user.id, saved_reports.c.report_id == report_id)
        )
        await db.execute(stmt)
        msg = "Report removed from saved catalog."
        saved_flag = False
    else:
        # Add bookmark
        stmt = saved_reports.insert().values(user_id=current_user.id, report_id=report_id)
        await db.execute(stmt)
        msg = "Report added to saved catalog."
        saved_flag = True

    await db.commit()
    return {"message": msg, "is_saved": saved_flag}

@router.get("/saved-reports", response_model=List[ReportOut])
async def get_saved_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Fetch the list of all reports bookmarked by this citizen."""
    query = select(Report).join(saved_reports).where(saved_reports.c.user_id == current_user.id)
    result = await db.execute(query)
    reports = result.scalars().all()

    reports_out = []
    for r in reports:
        report_data = ReportOut.model_validate(r)
        report_data.is_saved = True
        reports_out.append(report_data)

    return reports_out

@router.get("/notifications", response_model=List[NotificationOut])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Fetch in-app notifications for the active user."""
    query = select(Notification).where(Notification.user_id == current_user.id).order_by(desc(Notification.created_at))
    result = await db.execute(query)
    return result.scalars().all()

@router.put("/notifications/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Mark a notification as read."""
    result = await db.execute(
        select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == current_user.id)
        )
    )
    noti = result.scalars().first()
    if not noti:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    noti.is_read = True
    await db.commit()
    return noti

@router.delete("/notifications/{notification_id}", response_model=dict)
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Permanently delete a notification."""
    result = await db.execute(
        select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == current_user.id)
        )
    )
    noti = result.scalars().first()
    if not noti:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    await db.delete(noti)
    await db.commit()
    return {"message": "Notification deleted successfully."}

@router.get("/feed", response_model=List[FeedPostOut])
async def get_community_feed(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Fetch the community feed posts, including individual liked and bookmarked status flags."""
    query = select(FeedPost).order_by(desc(FeedPost.created_at))
    result = await db.execute(query)
    posts = result.scalars().all()

    # Get posts liked by user
    liked_query = select(liked_feed_posts.c.post_id).where(liked_feed_posts.c.user_id == current_user.id)
    liked_res = await db.execute(liked_query)
    liked_ids = set(liked_res.scalars().all())

    # Get posts bookmarked by user
    bookmarked_query = select(bookmarked_feed_posts.c.post_id).where(bookmarked_feed_posts.c.user_id == current_user.id)
    bookmarked_res = await db.execute(bookmarked_query)
    bookmarked_ids = set(bookmarked_res.scalars().all())

    posts_out = []
    for p in posts:
        post_data = FeedPostOut.model_validate(p)
        post_data.is_liked = p.id in liked_ids
        post_data.is_bookmarked = p.id in bookmarked_ids
        posts_out.append(post_data)

    return posts_out

@router.post("/feed/{post_id}/like", response_model=dict)
async def toggle_like_feed_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Toggle a like on a community feed post."""
    result = await db.execute(select(FeedPost).where(FeedPost.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found."
        )

    like_query = select(liked_feed_posts).where(
        and_(liked_feed_posts.c.user_id == current_user.id, liked_feed_posts.c.post_id == post_id)
    )
    like_res = await db.execute(like_query)
    is_liked = like_res.first() is not None

    if is_liked:
        stmt = liked_feed_posts.delete().where(
            and_(liked_feed_posts.c.user_id == current_user.id, liked_feed_posts.c.post_id == post_id)
        )
        await db.execute(stmt)
        post.likes_count = max(0, post.likes_count - 1)
        msg = "Post unliked."
        liked_flag = False
    else:
        stmt = liked_feed_posts.insert().values(user_id=current_user.id, post_id=post_id)
        await db.execute(stmt)
        post.likes_count += 1
        msg = "Post liked."
        liked_flag = True

    await db.commit()
    return {"message": msg, "is_liked": liked_flag, "likes_count": post.likes_count}

@router.post("/feed/{post_id}/bookmark", response_model=dict)
async def toggle_bookmark_feed_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Toggle a bookmark on a community feed post."""
    result = await db.execute(select(FeedPost).where(FeedPost.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found."
        )

    bm_query = select(bookmarked_feed_posts).where(
        and_(bookmarked_feed_posts.c.user_id == current_user.id, bookmarked_feed_posts.c.post_id == post_id)
    )
    bm_res = await db.execute(bm_query)
    is_bookmarked = bm_res.first() is not None

    if is_bookmarked:
        stmt = bookmarked_feed_posts.delete().where(
            and_(bookmarked_feed_posts.c.user_id == current_user.id, bookmarked_feed_posts.c.post_id == post_id)
        )
        await db.execute(stmt)
        msg = "Post removed from bookmarks."
        bm_flag = False
    else:
        stmt = bookmarked_feed_posts.insert().values(user_id=current_user.id, post_id=post_id)
        await db.execute(stmt)
        msg = "Post bookmarked."
        bm_flag = True

    await db.commit()
    return {"message": msg, "is_bookmarked": bm_flag}

@router.get("/alerts", response_model=List[AlertOut])
async def get_nearby_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Fetch nearby active emergency alerts based on the citizen's registered city."""
    query = select(Alert).where(
        and_(Alert.city == current_user.city, Alert.status == "Active")
    ).order_by(desc(Alert.created_at))
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/insights", response_model=List[InsightCardOut])
async def get_citizen_insights(
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Fetch simulated AI-powered recommendation cards for the active citizen."""
    return [
        InsightCardOut(
            id="ins_1",
            message="Your zoning area has shown an 18% increase in infrastructure repair updates this month.",
            category="Infrastructure",
            trend="Positive"
        ),
        InsightCardOut(
            id="ins_2",
            message="Your community participation score is above average. Keep reporting to unlock new contributor badges!",
            category="Achievements",
            trend="Increase"
        ),
        InsightCardOut(
            id="ins_3",
            message="Alert: Water mains repair schedules overlap with your state sector routes tomorrow.",
            category="Alerts",
            trend="Warning"
        ),
        InsightCardOut(
            id="ins_4",
            message="New municipal grants available for resident-led green space expansions in your city.",
            category="Schemes",
            trend="Opportunity"
        )
    ]

@router.get("/achievements", response_model=List[AchievementBadgeOut])
async def get_achievements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Citizen"]))
):
    """Fetch user achievements linked to their real database metrics."""
    # Count reported issues for this user
    reported_query = select(func.count(Report.id)).where(Report.citizen_id == current_user.id)
    reported_result = await db.execute(reported_query)
    total_reported = reported_result.scalar() or 0

    # Count resolved issues
    resolved_query = select(func.count(Report.id)).where(
        and_(Report.citizen_id == current_user.id, Report.status == "Resolved")
    )
    resolved_result = await db.execute(resolved_query)
    total_resolved = resolved_result.scalar() or 0

    # Feed interactions (likes)
    likes_query = select(func.count(liked_feed_posts.c.post_id)).where(liked_feed_posts.c.user_id == current_user.id)
    likes_result = await db.execute(likes_query)
    total_likes = likes_result.scalar() or 0

    # 1. Community Contributor (Needs 1 report)
    badge1_progress = min(100, int((total_reported / 1) * 100))
    # 2. Problem Solver (Needs 1 resolved issue)
    badge2_progress = min(100, int((total_resolved / 1) * 100))
    # 3. Environmental Hero (Needs 1 waste or environmental report - mock check total reports >= 2)
    badge3_progress = min(100, int((total_reported / 2) * 100))
    # 4. Volunteer (Needs 2 community feed likes)
    badge4_progress = min(100, int((total_likes / 2) * 100))
    # 5. Early Reporter (Needs 3 reports submitted)
    badge5_progress = min(100, int((total_reported / 3) * 100))

    return [
        AchievementBadgeOut(
            id="ac_1",
            title="Community Contributor",
            description="Submit your first local coordinate report to help municipal zoning.",
            progress=badge1_progress,
            unlocked=badge1_progress >= 100,
            icon_name="Users"
        ),
        AchievementBadgeOut(
            id="ac_2",
            title="Problem Solver",
            description="Have at least one of your submitted reports successfully resolved.",
            progress=badge2_progress,
            unlocked=badge2_progress >= 100,
            icon_name="CheckSquare"
        ),
        AchievementBadgeOut(
            id="ac_3",
            title="Environmental Hero",
            description="Report environmental or sanitation concerns to protect district health.",
            progress=badge3_progress,
            unlocked=badge3_progress >= 100,
            icon_name="Leaf"
        ),
        AchievementBadgeOut(
            id="ac_4",
            title="Volunteer Spirit",
            description="Actively support other community reports by liking feed posts.",
            progress=badge4_progress,
            unlocked=badge4_progress >= 100,
            icon_name="Heart"
        ),
        AchievementBadgeOut(
            id="ac_5",
            title="Early Reporter",
            description="Establish baseline reporting credentials with 3 submitted issues.",
            progress=badge5_progress,
            unlocked=badge5_progress >= 100,
            icon_name="Zap"
        )
    ]
