from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.alert import Alert
from app.models.feed import FeedPost
from app.models.report import Report
from app.models.user import User
from app.models.announcement import Announcement
from app.models.resource import Resource
from app.models.gis import Ward, AdminBoundary
from app.core import security
import json

async def seed_db(session: AsyncSession):
    # 1. Seed Alerts if empty
    result = await session.execute(select(Alert))
    if not result.scalars().first():
        alerts = [
            Alert(
                title="Road Closure: Main Street Pipeline Maintenance",
                message="Water pipeline repair on Main St. Road blocked between 4th Ave and 7th Ave. Alternate routes advised.",
                severity="Medium",
                location="Main St & 5th Ave",
                city="San Francisco",
                state="California",
                distance="0.4 miles",
                alert_type="Road Closure",
                status="Active"
            ),
            Alert(
                title="Flood Warning: Bay Area Shoreline",
                message="High tide and heavy rainfall may cause localized coastal flooding. Residents in low-lying zones stay alert.",
                severity="High",
                location="Bay Area Shoreline",
                city="San Francisco",
                state="California",
                distance="1.8 miles",
                alert_type="Flood",
                status="Active"
            ),
            Alert(
                title="Power Outage: Grid Sector 4B",
                message="Scheduled transformer upgrades in Sector 4B. Outage expected to resolve by 6 PM.",
                severity="Medium",
                location="District 4",
                city="San Francisco",
                state="California",
                distance="2.1 miles",
                alert_type="Power Outage",
                status="Active"
            ),
            Alert(
                title="Traffic Advisory: 101 Freeway Collision",
                message="Three-car pileup on 101-Northbound near Bay Bridge exit. Heavy congestion, expect 30-min delays.",
                severity="Low",
                location="101-Northbound Exit 14",
                city="San Francisco",
                state="California",
                distance="3.5 miles",
                alert_type="Traffic",
                status="Active"
            )
        ]
        session.add_all(alerts)

    # 2. Seed FeedPosts if empty
    result = await session.execute(select(FeedPost))
    if not result.scalars().first():
        posts = [
            FeedPost(
                title="Pothole on 8th Avenue resolved!",
                content="Huge shoutout to the zoning department! Reported a critical pothole near the school zone and it was fully patched within 48 hours. CivicMind's routing is really fast.",
                category="Community Issue",
                author_name="Sarah Jenkins",
                author_role="Citizen",
                likes_count=18,
                comments_count=4
            ),
            FeedPost(
                title="City Green Initiative Launch Event",
                content="Join us this Saturday at Golden Gate Park for the annual community tree planting drive. Tools and refreshments will be provided. Let's make our district green!",
                category="Event",
                author_name="District 5 Council",
                author_role="Government",
                likes_count=42,
                comments_count=12
            ),
            FeedPost(
                title="Emergency Advisory: High Wind Warnings",
                content="National Weather Service has issued a high wind warning for the city. Wind gusts up to 55 mph expected tonight. Secure outdoor furniture and avoid driving high-profile vehicles. Local response teams are on standby.",
                category="Emergency",
                author_name="Emergency Response Team",
                author_role="Government",
                likes_count=55,
                comments_count=7
            )
        ]
        session.add_all(posts)

    # 3. Seed Government Users if empty
    gov_result = await session.execute(select(User).where(User.role.in_(["Government", "Admin"])))
    gov_users = gov_result.scalars().all()
    if not gov_users:
        hashed_password = security.get_password_hash("securepassword123")
        gov_users = [
            User(
                first_name="John",
                last_name="Municipal",
                email="municipal.officer@civicmind.gov",
                phone="+15550001",
                password_hash=hashed_password,
                role="Government",
                sub_role="Municipal Officer",
                city="San Francisco",
                state="California",
                country="USA",
                organization="San Francisco City Hall",
                email_verified=True
            ),
            User(
                first_name="Jane",
                last_name="Department",
                email="dept.officer@civicmind.gov",
                phone="+15550002",
                password_hash=hashed_password,
                role="Government",
                sub_role="Department Officer",
                city="San Francisco",
                state="California",
                country="USA",
                organization="Public Works Dept",
                email_verified=True
            ),
            User(
                first_name="Bob",
                last_name="Ward",
                email="ward.officer@civicmind.gov",
                phone="+15550003",
                password_hash=hashed_password,
                role="Government",
                sub_role="Ward Officer",
                city="San Francisco",
                state="California",
                country="USA",
                organization="District 4 Administration",
                email_verified=True
            ),
            User(
                first_name="Admin",
                last_name="Super",
                email="super.admin@civicmind.gov",
                phone="+15550004",
                password_hash=hashed_password,
                role="Admin",
                sub_role="Super Administrator",
                city="San Francisco",
                state="California",
                country="USA",
                organization="CivicMind Operations",
                email_verified=True
            ),
            User(
                first_name="District",
                last_name="Admin",
                email="district.admin@civicmind.gov",
                phone="+15550005",
                password_hash=hashed_password,
                role="Government",
                sub_role="District Administrator",
                city="San Francisco",
                state="California",
                country="USA",
                organization="SF District Office",
                email_verified=True
            )
        ]
        session.add_all(gov_users)
        # Commit users so they have IDs for reports assignment
        await session.commit()
        
        # Re-fetch gov users to get IDs
        gov_result = await session.execute(select(User).where(User.role.in_(["Government", "Admin"])))
        gov_users = gov_result.scalars().all()

    # Get a department officer ID and ward officer ID for assignment
    dept_officer = next((u for u in gov_users if u.sub_role == "Department Officer"), gov_users[0])
    ward_officer = next((u for u in gov_users if u.sub_role == "Ward Officer"), gov_users[0])

    # 4. Seed Resources if empty
    res_result = await session.execute(select(Resource))
    if not res_result.scalars().first():
        resources = [
            Resource(name="Available Officers", category="staff", value=45, status="Optimal"),
            Resource(name="Active Teams", category="staff", value=12, status="Optimal"),
            Resource(name="Emergency Vehicles", category="vehicles", value=8, status="Optimal"),
            Resource(name="Maintenance Teams", category="staff", value=6, status="Optimal"),
            Resource(name="Medical Units", category="staff", value=5, status="Optimal"),
            Resource(name="Equipment Status", category="equipment", value=92, status="Optimal"),
            Resource(name="Budget Utilization", category="budget", value=850000, float_value=68.5, status="Optimal")
        ]
        session.add_all(resources)

    # 5. Seed Announcements if empty
    ann_result = await session.execute(select(Announcement))
    if not ann_result.scalars().first():
        announcements = [
            Announcement(
                title="Road Repair Advisory: Ward 1",
                content="Main street road repairs scheduled from June 25 to June 30. Single-lane closures, expect heavy congestion.",
                priority="Medium",
                target_audience="Ward 1 - Richmond",
                status="Published"
            ),
            Announcement(
                title="Water Reservoir Cleaning Operation",
                content="Scheduled cleaning of the primary water reservoir. Low water pressure expected in Ward 2 on June 28 from 9 AM to 3 PM.",
                priority="High",
                target_audience="Ward 2 - Marina",
                status="Published"
            ),
            Announcement(
                title="Annual Budget Allocations Finalized",
                content="The District Council has approved the $1.2M funding allocation for green space restoration and parks sanitation upgrades.",
                priority="Low",
                target_audience="All",
                status="Published"
            ),
            Announcement(
                title="Upcoming Community Safety Webinar",
                content="Draft: A public briefing on community policing initiatives and disaster preparedness workflows.",
                priority="Low",
                target_audience="All",
                status="Draft"
            )
        ]
        session.add_all(announcements)

    # 6. Seed Reports for any existing User if they have 0 reports
    user_result = await session.execute(select(User).where(User.role == "Citizen"))
    users = user_result.scalars().all()
    for user in users:
        # Check if this user already has reports
        rep_result = await session.execute(select(Report).where(Report.citizen_id == user.id))
        if not rep_result.scalars().first():
            reports = [
                Report(
                    title="Clogged Storm Drain on Market St",
                    description="Heavy rain is causing water to accumulate on the sidewalk due to leaves and trash clogging the storm drain inlet.",
                    category="Water Supply",
                    priority="High",
                    status="In Progress",
                    assigned_department="Water Supply",
                    assigned_officer_id=dept_officer.id,
                    ward="Ward 3 - Financial",
                    citizen_id=user.id,
                    city=user.city,
                    state=user.state,
                    country=user.country,
                    progress=45,
                    latitude=37.7892,
                    longitude=-122.4014
                ),
                Report(
                    title="Flickering Streetlight near 22nd Street Station",
                    description="The streetlight directly outside the transit station entrance is flashing rapidly, creating visibility issues at night.",
                    category="Electricity",
                    priority="Low",
                    status="Open",
                    assigned_department="Electricity",
                    assigned_officer_id=None,
                    ward="Ward 1 - Richmond",
                    citizen_id=user.id,
                    city=user.city,
                    state=user.state,
                    country=user.country,
                    progress=10,
                    latitude=37.7785,
                    longitude=-122.4820
                ),
                Report(
                    title="Illegal Dumping in Alleyway",
                    description="Multiple mattresses and electronic waste have been left in the alley behind 452 Mission Street.",
                    category="Sanitation",
                    priority="Medium",
                    status="Resolved",
                    assigned_department="Sanitation",
                    assigned_officer_id=ward_officer.id,
                    ward="Ward 4 - Mission",
                    citizen_id=user.id,
                    city=user.city,
                    state=user.state,
                    country=user.country,
                    progress=100,
                    latitude=37.7610,
                    longitude=-122.4162
                ),
                Report(
                    title="Exposed Electrical Wiring near Public Park",
                    description="Damaged ground junction box exposing high-voltage wiring right next to the children's play area.",
                    category="Electricity",
                    priority="Critical",
                    status="New",
                    assigned_department="Electricity",
                    assigned_officer_id=None,
                    ward="Ward 2 - Marina",
                    citizen_id=user.id,
                    city=user.city,
                    state=user.state,
                    country=user.country,
                    progress=0,
                    latitude=37.8035,
                    longitude=-122.4371
                ),
                Report(
                    title="Water Pipeline Burst on 19th Ave",
                    description="Gushing water is flooding the street, threatening surrounding shop basements. Critical pressure drop reported.",
                    category="Water Supply",
                    priority="Critical",
                    status="Under Review",
                    assigned_department="Water Supply",
                    assigned_officer_id=None,
                    ward="Ward 5 - Sunset",
                    citizen_id=user.id,
                    city=user.city,
                    state=user.state,
                    country=user.country,
                    progress=15,
                    latitude=37.7510,
                    longitude=-122.4760
                ),
                Report(
                    title="Unregulated Construction Noise",
                    description="Jackhammers and heavy trucks operating past 11 PM, violating city noise ordinances near residential zones.",
                    category="Public Safety",
                    priority="Low",
                    status="Waiting for Citizen",
                    assigned_department="Public Safety",
                    assigned_officer_id=ward_officer.id,
                    ward="Ward 1 - Richmond",
                    citizen_id=user.id,
                    city=user.city,
                    state=user.state,
                    country=user.country,
                    progress=30,
                    latitude=37.7720,
                    longitude=-122.4780
                ),
                Report(
                    title="Damaged Guardrail on Overpass",
                    description="A collision has destroyed a 15-foot section of the safety guardrail on the freeway overpass.",
                    category="Roads",
                    priority="High",
                    status="Assigned",
                    assigned_department="Roads",
                    assigned_officer_id=dept_officer.id,
                    ward="Ward 3 - Financial",
                    citizen_id=user.id,
                    city=user.city,
                    state=user.state,
                    country=user.country,
                    progress=20,
                    latitude=37.7942,
                    longitude=-122.3995
                )
            ]
            session.add_all(reports)
    
    # 7. Seed Wards if empty
    result = await session.execute(select(Ward))
    if not result.scalars().first():
        wards = [
            Ward(
                name="Ward 1 - Richmond",
                city="San Francisco",
                population=62000,
                geojson_polygon=json.dumps({
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-122.51, 37.76],
                            [-122.45, 37.76],
                            [-122.45, 37.79],
                            [-122.51, 37.79],
                            [-122.51, 37.76]
                        ]
                    ]
                })
            ),
            Ward(
                name="Ward 2 - Marina",
                city="San Francisco",
                population=48000,
                geojson_polygon=json.dumps({
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-122.46, 37.79],
                            [-122.42, 37.79],
                            [-122.42, 37.81],
                            [-122.46, 37.81],
                            [-122.46, 37.79]
                        ]
                    ]
                })
            ),
            Ward(
                name="Ward 3 - Financial",
                city="San Francisco",
                population=35000,
                geojson_polygon=json.dumps({
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-122.42, 37.78],
                            [-122.39, 37.78],
                            [-122.39, 37.81],
                            [-122.42, 37.81],
                            [-122.42, 37.78]
                        ]
                    ]
                })
            ),
            Ward(
                name="Ward 4 - Mission",
                city="San Francisco",
                population=81000,
                geojson_polygon=json.dumps({
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-122.43, 37.74],
                            [-122.40, 37.74],
                            [-122.40, 37.77],
                            [-122.43, 37.77],
                            [-122.43, 37.74]
                        ]
                    ]
                })
            ),
            Ward(
                name="Ward 5 - Sunset",
                city="San Francisco",
                population=74000,
                geojson_polygon=json.dumps({
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-122.51, 37.71],
                            [-122.45, 37.71],
                            [-122.45, 37.76],
                            [-122.51, 37.76],
                            [-122.51, 37.71]
                        ]
                    ]
                })
            )
        ]
        session.add_all(wards)

    # 8. Seed Admin Boundary if empty
    result = await session.execute(select(AdminBoundary))
    if not result.scalars().first():
        boundary = AdminBoundary(
            name="San Francisco City Boundary",
            boundary_type="City",
            geojson_polygon=json.dumps({
                "type": "Polygon",
                "coordinates": [
                    [
                        [-122.52, 37.70],
                        [-122.38, 37.70],
                        [-122.38, 37.82],
                        [-122.52, 37.82],
                        [-122.52, 37.70]
                    ]
                ]
            })
        )
        session.add(boundary)

    await session.commit()

