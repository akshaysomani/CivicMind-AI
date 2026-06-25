import asyncio
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database.session import get_db, Base
from app.models.user import User
from app.models.report import Report
from app.models.announcement import Announcement
from app.models.resource import Resource

# Dedicated clean test database for government operations tests
TEST_DB_URL = "sqlite+aiosqlite:///./test_civicmind_government.db"

test_engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

# Override get_db dependency
async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

@pytest.fixture(autouse=True, scope="module")
def setup_database():
    app.dependency_overrides[get_db] = override_get_db
    
    async def init_db():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        async with TestSessionLocal() as session:
            # Create a default citizen first so seed_db can generate reports for them
            from app.core import security
            hashed_pwd = security.get_password_hash("StrongPass@123")
            default_citizen = User(
                first_name="Test",
                last_name="Citizen",
                email="test.citizen@example.com",
                phone="+15559876",
                password_hash=hashed_pwd,
                role="Citizen",
                city="San Francisco",
                state="California",
                country="USA",
                email_verified=True
            )
            session.add(default_citizen)
            await session.commit()
            
            from app.database.seed import seed_db
            # Seed default users, alerts, reports, resources, announcements
            await seed_db(session)
            
    asyncio.run(init_db())
    yield
    
    async def drop_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(drop_tables())
    
    app.dependency_overrides.clear()

def get_auth_headers(email: str):
    client = TestClient(app)
    
    # Check if this user exists, if not register them
    async def ensure_user():
        async with TestSessionLocal() as session:
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            if not user:
                # Add default citizen or officer
                from app.core import security
                hashed_pwd = security.get_password_hash("StrongPass@123")
                role = "Citizen" if "citizen" in email else "Government"
                sub_role = "Municipal Officer" if "officer" in email else None
                new_user = User(
                    first_name="Test",
                    last_name="User",
                    email=email,
                    phone="+15559999",
                    password_hash=hashed_pwd,
                    role=role,
                    sub_role=sub_role,
                    city="San Francisco",
                    state="California",
                    country="USA",
                    email_verified=True
                )
                session.add(new_user)
                await session.commit()
    asyncio.run(ensure_user())
    
    login_payload = {
        "email": email,
        "password": "StrongPass@123"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_government_dashboard_stats():
    client = TestClient(app)
    headers = get_auth_headers("municipal.officer@civicmind.gov")
    
    response = client.get("/api/v1/government/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_issues" in data
    assert "critical_issues" in data
    assert "avg_resolution_time" in data

def test_get_triaged_issues():
    client = TestClient(app)
    headers = get_auth_headers("municipal.officer@civicmind.gov")
    
    # 1. Fetch all
    response = client.get("/api/v1/government/issues", headers=headers)
    assert response.status_code == 200
    issues_list = response.json()
    assert len(issues_list) > 0
    
    # 2. Filter by status
    response_filter = client.get("/api/v1/government/issues?status=Resolved", headers=headers)
    assert response_filter.status_code == 200
    for issue in response_filter.json():
        assert issue["status"] == "Resolved"

def test_issue_triage_actions():
    client = TestClient(app)
    headers = get_auth_headers("municipal.officer@civicmind.gov")
    
    # Get a seeded report ID
    response = client.get("/api/v1/government/issues", headers=headers)
    issue_id = response.json()[0]["id"]
    
    # 1. Update status
    status_payload = {"status": "In Progress", "progress": 55}
    status_res = client.post(f"/api/v1/government/issues/{issue_id}/status", json=status_payload, headers=headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "In Progress"
    assert status_res.json()["progress"] == 55
    
    # 2. Assign officer (assign to self or another officer)
    async def get_officer():
        async with TestSessionLocal() as session:
            res = await session.execute(select(User).where(User.email == "dept.officer@civicmind.gov"))
            return res.scalars().first()
    off = asyncio.run(get_officer())
    
    assign_payload = {"officer_id": off.id}
    assign_res = client.post(f"/api/v1/government/issues/{issue_id}/assign", json=assign_payload, headers=headers)
    assert assign_res.status_code == 200
    assert assign_res.json()["assigned_officer_id"] == off.id

def test_departments_and_wards_analytics():
    client = TestClient(app)
    headers = get_auth_headers("municipal.officer@civicmind.gov")
    
    # Departments Workload
    dept_res = client.get("/api/v1/government/departments", headers=headers)
    assert dept_res.status_code == 200
    assert len(dept_res.json()) == 9
    assert dept_res.json()[0]["name"] == "Roads"
    
    # Wards performance
    ward_res = client.get("/api/v1/government/wards", headers=headers)
    assert ward_res.status_code == 200
    assert len(ward_res.json()) == 5
    assert "resolution_rate" in ward_res.json()[0]

def test_resources_and_citizens():
    client = TestClient(app)
    headers = get_auth_headers("municipal.officer@civicmind.gov")
    
    # Resources overview
    res_res = client.get("/api/v1/government/resources", headers=headers)
    assert res_res.status_code == 200
    assert "available_officers" in res_res.json()
    
    # Citizens directory
    cit_res = client.get("/api/v1/government/citizens", headers=headers)
    assert cit_res.status_code == 200
    assert isinstance(cit_res.json(), list)

def test_announcements_flow():
    client = TestClient(app)
    headers = get_auth_headers("municipal.officer@civicmind.gov")
    
    ann_payload = {
        "title": "Test Weather Warning",
        "content": "A test announcement about severe lightning warnings.",
        "priority": "High",
        "target_audience": "All"
    }
    
    # 1. Create announcement
    post_res = client.post("/api/v1/government/announcements", json=ann_payload, headers=headers)
    assert post_res.status_code == 201
    assert post_res.json()["title"] == "Test Weather Warning"
    
    # 2. Get list
    get_res = client.get("/api/v1/government/announcements", headers=headers)
    assert get_res.status_code == 200
    assert any(a["title"] == "Test Weather Warning" for a in get_res.json())

def test_reports_generation():
    client = TestClient(app)
    headers = get_auth_headers("municipal.officer@civicmind.gov")
    
    response = client.get("/api/v1/government/reports/generate?type=Daily&format=CSV", headers=headers)
    assert response.status_code == 200
    assert "attachment; filename=civicmind_daily_report.csv" in response.headers["content-disposition"]
    assert "CivicMind AI Operational Report" in response.text

def test_rbac_security_gates():
    client = TestClient(app)
    
    # Citizens register/login to get citizen headers
    headers = get_auth_headers("test.citizen@example.com")
    
    # Hitting government endpoints as a citizen should return 403 Forbidden
    response = client.get("/api/v1/government/dashboard/stats", headers=headers)
    assert response.status_code == 403
    assert "Insufficient permissions" in response.json()["detail"]
