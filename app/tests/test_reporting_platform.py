import pytest
import asyncio
from fastapi.testclient import TestClient
import app.models
from app.main import app
from app.database.session import get_db, Base, AsyncSessionLocal
from app.ai.agents.reporting import ExecutiveReportingAgent
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

TEST_DB_URL = "sqlite+aiosqlite:///./test_reporting_civicmind.db"
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

@pytest.fixture(scope="module")
def auth_headers():
    client = TestClient(app)
    # Register test user
    payload_reg = {
        "first_name": "Report",
        "last_name": "Tester",
        "email": "report.test@example.com",
        "phone": "+1555987654",
        "password": "securepassword123",
        "role": "Government",
        "city": "San Francisco",
        "state": "California",
        "country": "USA"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login to get token
    payload_login = {
        "email": "report.test@example.com",
        "password": "securepassword123"
    }
    response_login = client.post("/api/v1/auth/login", json=payload_login)
    token = response_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_saved_reports_empty(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/reports", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 0

def test_get_report_templates(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/reports/templates", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8
    assert data[0]["id"] == "daily_brief"

def test_generate_executive_report(auth_headers):
    client = TestClient(app)
    payload = {
        "report_type": "Daily Executive Brief"
    }
    response = client.post("/api/v1/reports/generate", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "Daily Executive Brief" in data["title"]
    assert "content" in data
    assert "executive_summary" in data["content"]
    assert "key_metrics" in data["content"]

def test_get_saved_reports_after_generation(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/reports", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_schedule_report(auth_headers):
    client = TestClient(app)
    payload = {
        "name": "Weekly Audit Briefing",
        "report_type": "Weekly Executive Report",
        "frequency": "weekly",
        "recipients": ["Government", "Admin"]
    }
    response = client.post("/api/v1/reports/schedule", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Weekly Audit Briefing"
    assert data["frequency"] == "weekly"

def test_list_scheduled_reports(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/reports/scheduled", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["report_type"] == "Weekly Executive Report"

def test_get_role_briefings(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/reports/briefings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    assert data[0]["role"] == "Mayor"
    assert "briefing_text" in data[0]
    assert len(data[0]["urgent_actions"]) >= 1

def test_get_executive_dashboard(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/reports/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "latest_reports_count" in data
    assert "critical_risks" in data
    assert "executive_kpis" in data
    assert "department_performance" in data

def test_export_report_json(auth_headers):
    client = TestClient(app)
    # Get the generated report ID first
    reports_res = client.get("/api/v1/reports", headers=auth_headers)
    report_id = reports_res.json()[0]["id"]
    
    export_payload = {
        "report_id": report_id,
        "format": "json"
    }
    response = client.post("/api/v1/reports/export", json=export_payload, headers=auth_headers)
    assert response.status_code == 200
    assert "Content-Disposition" in response.headers
    assert ".json" in response.headers["Content-Disposition"]
    assert "executive_summary" in response.json()
