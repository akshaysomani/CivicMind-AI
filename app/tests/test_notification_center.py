import pytest
import asyncio
from fastapi.testclient import TestClient
import app.models
from app.main import app
from app.database.session import get_db, Base, AsyncSessionLocal
from app.utils.notification_engine import set_session_maker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession


TEST_DB_URL = "sqlite+aiosqlite:///./test_notification_civicmind.db"
test_engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

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
    set_session_maker(TestSessionLocal)
    
    async def create_all():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    asyncio.run(create_all())
    
    yield
    
    async def drop_all():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(drop_all())
    
    app.dependency_overrides.clear()
    set_session_maker(AsyncSessionLocal)


@pytest.fixture(scope="module")
def auth_headers():
    client = TestClient(app)
    # Register test user
    payload_reg = {
        "first_name": "Notif",
        "last_name": "Tester",
        "email": "notif.test@example.com",
        "phone": "+1555123456",
        "password": "StrongPass@123",
        "role": "Citizen",
        "city": "San Francisco",
        "state": "California",
        "country": "USA"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login to get token
    payload_login = {
        "email": "notif.test@example.com",
        "password": "StrongPass@123"
    }
    response_login = client.post("/api/v1/auth/login", json=payload_login)
    token = response_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_notification_preferences_default(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/notifications/preferences", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email_enabled"] is True
    assert data["sms_enabled"] is True
    assert data["quiet_hours_start"] is None

def test_save_notification_preferences(auth_headers):
    client = TestClient(app)
    update_payload = {
        "email_enabled": True,
        "sms_enabled": False,
        "in_app_enabled": True,
        "push_enabled": False,
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "07:00"
    }
    response = client.post("/api/v1/notifications/preferences", json=update_payload, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Preferences updated successfully."

    # Verify changes persisted
    response_get = client.get("/api/v1/notifications/preferences", headers=auth_headers)
    assert response_get.status_code == 200
    data = response_get.json()
    assert data["sms_enabled"] is False
    assert data["push_enabled"] is False
    assert data["quiet_hours_start"] == "22:00"
    assert data["quiet_hours_end"] == "07:00"

def test_create_workflow_rule(auth_headers):
    client = TestClient(app)
    rule_payload = {
        "name": "Critical Water issue Alert",
        "trigger": "issue_created",
        "condition": '{"severity": "critical"}',
        "action": '{"channels": ["in_app", "email"], "roles": ["Citizen"], "title": "Critical Water Alert: {title}", "message": "Citizen reported water leak: {description}"}',
        "delay": 0,
        "is_active": True
    }
    response = client.post("/api/v1/notifications/workflow/rules", json=rule_payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["name"] == "Critical Water issue Alert"

def test_list_workflow_rules(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/notifications/workflow/rules", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["trigger"] == "issue_created"

def test_simulate_event_and_check_notifications(auth_headers):
    client = TestClient(app)
    
    # 1. Simulate non-matching condition (severity: info)
    sim_payload_ignored = {
        "trigger": "issue_created",
        "data": {
            "severity": "info",
            "title": "Low water pressure",
            "description": "Pressure slightly low"
        }
    }
    response = client.post("/api/v1/notifications/workflow/rules/simulate", json=sim_payload_ignored, headers=auth_headers)
    assert response.status_code == 200
    
    # Check that no notifications were created
    response_notif = client.get("/api/v1/notifications", headers=auth_headers)
    assert len(response_notif.json()) == 0

    # 2. Simulate matching condition (severity: critical)
    sim_payload_match = {
        "trigger": "issue_created",
        "data": {
            "severity": "critical",
            "title": "Main St Pipe Burst",
            "description": "Huge flooding near City Hall"
        }
    }
    response_match = client.post("/api/v1/notifications/workflow/rules/simulate", json=sim_payload_match, headers=auth_headers)
    assert response_match.status_code == 200
    
    # Give some room for processing and check notifications
    response_notif2 = client.get("/api/v1/notifications", headers=auth_headers)
    assert len(response_notif2.json()) == 1
    notif = response_notif2.json()[0]
    assert notif["title"] == "Critical Water Alert: Main St Pipe Burst"
    assert notif["message"] == "Citizen reported water leak: Huge flooding near City Hall"
    assert notif["is_read"] is False

def test_workflow_history(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/notifications/workflow/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["trigger_event"] == "issue_created"
    assert data[0]["execution_status"] == "success"

def test_mark_as_read_and_archive(auth_headers):
    client = TestClient(app)
    # Get notifications
    response_get = client.get("/api/v1/notifications", headers=auth_headers)
    notif_id = response_get.json()[0]["id"]

    # Mark as read
    response_read = client.post("/api/v1/notifications/read", json={"ids": [notif_id]}, headers=auth_headers)
    assert response_read.status_code == 200
    
    # Check unread is 0
    response_unread = client.get("/api/v1/notifications/unread", headers=auth_headers)
    assert response_unread.json()["count"] == 0

    # Archive
    response_archive = client.post("/api/v1/notifications/archive", json={"ids": [notif_id]}, headers=auth_headers)
    assert response_archive.status_code == 200
    
    # Check list is empty
    response_get_after = client.get("/api/v1/notifications", headers=auth_headers)
    assert len(response_get_after.json()) == 0
