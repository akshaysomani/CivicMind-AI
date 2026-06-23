"""
Module 5 Tests — Smart Issue Reporting & Complaint Management
Tests cover: create, list, detail, update, delete, status, attachments, tracking
"""
import io
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.session import Base
from app.api.deps import get_db
from app.core.security import get_password_hash

TEST_DB_URL = "sqlite+aiosqlite:///./test_civicmind_issues.db"

engine_test = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True, scope="module")
async def setup_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="module")
async def citizen_token():
    """Register and log in a citizen user, return access token."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/register", json={
            "first_name": "Issue",
            "last_name": "Reporter",
            "email": "issue.reporter@civicmind.com",
            "phone": "9000000001",
            "password": "StrongPass@123",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "role": "Citizen",
        })
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "issue.reporter@civicmind.com",
            "password": "StrongPass@123",
        })
        assert login_res.status_code == 200
        return login_res.json()["access_token"]


@pytest_asyncio.fixture(scope="module")
async def gov_token():
    """Register a government user and return token."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/register", json={
            "first_name": "Gov",
            "last_name": "Officer",
            "email": "gov.issues@civicmind.com",
            "phone": "9000000002",
            "password": "StrongPass@123",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "role": "Government",
        })
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "gov.issues@civicmind.com",
            "password": "StrongPass@123",
        })
        assert login_res.status_code == 200
        return login_res.json()["access_token"]


# ── TEST: Create Issue ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_issue(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post(
            "/api/v1/issues",
            json={
                "title": "Large pothole on Main Street",
                "description": "A dangerous pothole has formed near the intersection of Main St and Park Ave.",
                "category": "Potholes",
                "priority": "High",
                "severity": "Major",
                "address": "123 Main Street",
                "ward": "Ward 5",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "postal_code": "400001",
                "latitude": 19.076,
                "longitude": 72.877,
                "is_anonymous": False,
                "contact_method": "email",
                "consent_given": True,
            },
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    assert res.status_code == 201, res.text
    data = res.json()
    assert data["complaint_id"].startswith("CIV-")
    assert data["tracking_number"].startswith("TRK-")
    assert data["status"] == "Submitted"
    assert data["progress"] == 5
    assert data["assigned_department"] == "Public Works Department"
    assert data["estimated_response_hours"] == 72


# ── TEST: List Issues (citizen sees only own) ─────────────────────────────────

@pytest.mark.asyncio
async def test_list_issues_citizen(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get(
            "/api/v1/issues",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    assert res.status_code == 200
    issues = res.json()
    assert isinstance(issues, list)
    assert len(issues) >= 1
    assert all(i["status"] is not None for i in issues)


# ── TEST: Get Issue Detail ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_issue_detail(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        list_res = await client.get(
            "/api/v1/issues",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        issue_id = list_res.json()[0]["id"]

        res = await client.get(
            f"/api/v1/issues/{issue_id}",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    assert res.status_code == 200
    data = res.json()
    assert "attachments" in data
    assert "status_history" in data
    assert len(data["status_history"]) >= 1
    assert data["status_history"][0]["new_status"] == "Submitted"


# ── TEST: Update Issue ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_update_issue(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        list_res = await client.get(
            "/api/v1/issues",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        issue_id = list_res.json()[0]["id"]

        res = await client.put(
            f"/api/v1/issues/{issue_id}",
            json={"priority": "Critical", "nearby_landmark": "Near Metro Station"},
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    assert res.status_code == 200
    assert res.json()["priority"] == "Critical"
    assert res.json()["nearby_landmark"] == "Near Metro Station"


# ── TEST: Status Update (Gov) ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_status_update_gov(citizen_token, gov_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        list_res = await client.get(
            "/api/v1/issues",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        issue_id = list_res.json()[0]["id"]

        res = await client.post(
            f"/api/v1/issues/{issue_id}/status",
            json={"new_status": "Assigned", "note": "Assigned to Ward 5 maintenance team."},
            headers={"Authorization": f"Bearer {gov_token}"},
        )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "Assigned"
    assert data["progress"] == 35


# ── TEST: Status History ──────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_status_history(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        list_res = await client.get(
            "/api/v1/issues",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        issue_id = list_res.json()[0]["id"]

        res = await client.get(
            f"/api/v1/issues/{issue_id}/history",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) >= 2  # Submitted + Assigned
    statuses = [h["new_status"] for h in history]
    assert "Submitted" in statuses
    assert "Assigned" in statuses


# ── TEST: Public Tracking ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_public_tracking(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        list_res = await client.get(
            "/api/v1/issues",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        complaint_id = list_res.json()[0]["complaint_id"]

        res = await client.get(f"/api/v1/issues/track/{complaint_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["complaint_id"] == complaint_id
    assert "status_history" in data


# ── TEST: Issue Count ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_issue_count(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get(
            "/api/v1/issues/count",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    assert res.status_code == 200
    assert isinstance(res.json(), dict)


# ── TEST: Filters & Search ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_filter_by_category(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get(
            "/api/v1/issues?category=Potholes",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    assert res.status_code == 200
    for issue in res.json():
        assert issue["category"] == "Potholes"


# ── TEST: Delete Issue ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cannot_delete_assigned_issue(citizen_token):
    """Citizens cannot delete issues that are already being processed."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        list_res = await client.get(
            "/api/v1/issues",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        issue_id = list_res.json()[0]["id"]

        res = await client.delete(
            f"/api/v1/issues/{issue_id}",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    # Status is "Assigned" so should be rejected
    assert res.status_code == 400


# ── TEST: Create fresh report then delete ─────────────────────────────────────

@pytest.mark.asyncio
async def test_create_and_delete_submitted_issue(citizen_token):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_res = await client.post(
            "/api/v1/issues",
            json={
                "title": "Broken streetlight on Park Road",
                "description": "Streetlight has been out for 3 days.",
                "category": "Street Lights",
                "priority": "Medium",
                "severity": "Moderate",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "consent_given": True,
            },
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        assert create_res.status_code == 201
        issue_id = create_res.json()["id"]

        del_res = await client.delete(
            f"/api/v1/issues/{issue_id}",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
    assert del_res.status_code == 200
    assert del_res.json()["id"] == issue_id
