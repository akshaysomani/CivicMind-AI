import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db, Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

TEST_DB_URL = "sqlite+aiosqlite:///./test_civicmind.db"
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
        "first_name": "Emergency",
        "last_name": "Commander",
        "email": "emergency.test@example.com",
        "phone": "+15550911",
        "password": "testpassword123",
        "role": "Government",
        "city": "Oakland",
        "state": "California",
        "country": "USA"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login to get token
    payload_login = {
        "email": "emergency.test@example.com",
        "password": "testpassword123"
    }
    response_login = client.post("/api/v1/auth/login", json=payload_login)
    token = response_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_emergency_endpoints_flow(auth_headers):
    client = TestClient(app)

    # 1. Test POST /api/v1/ai/emergency/analyze
    analyze_payload = {
        "query": "There is a huge fire burst out in the building and multiple people are stranded.",
        "location": "Central Oakland"
    }
    res_analyze = client.post("/api/v1/ai/emergency/analyze", json=analyze_payload, headers=auth_headers)
    assert res_analyze.status_code == 200
    analysis = res_analyze.json()
    assert analysis["is_emergency"] is True
    assert analysis["incident_type"] == "Fire"
    assert analysis["severity"] in ["High", "Critical", "Catastrophic"]

    # 2. Test POST /api/v1/ai/emergency/classify (creates incident + timeline + resources)
    classify_payload = {
        "title": "Outbreak of fire in Oakland warehouse",
        "description": "Thick black smoke, warehouse fire spreading quickly.",
        "latitude": 37.8044,
        "longitude": -122.2712,
        "address": "400 Main St, Oakland",
        "ward": "Ward 4"
    }
    res_classify = client.post("/api/v1/ai/emergency/classify", json=classify_payload, headers=auth_headers)
    assert res_classify.status_code == 200
    incident = res_classify.json()
    assert incident["title"] == "Outbreak of fire in Oakland warehouse"
    assert incident["type"] == "Fire"
    assert incident["status"] == "Reported"
    assert "id" in incident
    incident_id = incident["id"]

    # 3. Test GET /api/v1/ai/emergency/incidents
    res_list = client.get("/api/v1/ai/emergency/incidents", headers=auth_headers)
    assert res_list.status_code == 200
    incidents = res_list.json()
    assert len(incidents) >= 1
    found_inc = next((i for i in incidents if i["id"] == incident_id), None)
    assert found_inc is not None

    # 4. Test GET /api/v1/ai/emergency/timeline
    res_timeline = client.get(f"/api/v1/ai/emergency/timeline?incident_id={incident_id}", headers=auth_headers)
    assert res_timeline.status_code == 200
    timeline = res_timeline.json()
    assert len(timeline) >= 1
    assert timeline[0]["event"] == "Incident Reported"

    # 5. Test GET /api/v1/ai/emergency/resources
    res_resources = client.get(f"/api/v1/ai/emergency/resources?incident_id={incident_id}", headers=auth_headers)
    assert res_resources.status_code == 200
    resources = res_resources.json()
    assert len(resources) >= 1
    assert any("Fire" in r["type"] or "Disaster" in r["type"] for r in resources)

    # 6. Test POST /api/v1/ai/emergency/incidents/{id}/override
    override_payload = {
        "severity": "Catastrophic",
        "priority": "Critical",
        "affected_radius_meters": 350.0,
        "suggested_departments": ["Fire Department", "Police", "Medical Services"]
    }
    res_override = client.post(f"/api/v1/ai/emergency/incidents/{incident_id}/override", json=override_payload, headers=auth_headers)
    assert res_override.status_code == 200
    updated_inc = res_override.json()
    assert updated_inc["severity"] == "Catastrophic"
    assert updated_inc["priority"] == "Critical"
    assert updated_inc["affected_radius_meters"] == 350.0
    assert "Fire Department" in updated_inc["suggested_departments"]

    # 7. Test POST /api/v1/ai/emergency/respond (deploys playbook SOP)
    respond_payload = {
        "incident_id": incident_id,
        "playbook_name": "Fire Rescue SOP",
        "assigned_officer_id": 1
    }
    res_respond = client.post("/api/v1/ai/emergency/respond", json=respond_payload, headers=auth_headers)
    assert res_respond.status_code == 200
    assert res_respond.json()["status"] == "success"
    
    # Verify status changed and timeline events updated
    res_timeline2 = client.get(f"/api/v1/ai/emergency/timeline?incident_id={incident_id}", headers=auth_headers)
    timeline2 = res_timeline2.json()
    # Expect Reported, Verified (via override), Resources Deployed events
    assert len(timeline2) >= 3
    event_names = [e["event"] for e in timeline2]
    assert "Verified" in event_names
    assert "Resources Deployed" in event_names

    # 8. Test GET /api/v1/ai/emergency/dashboard
    res_dash = client.get("/api/v1/ai/emergency/dashboard", headers=auth_headers)
    assert res_dash.status_code == 200
    dash = res_dash.json()
    assert dash["total_incidents"] >= 1
    assert dash["critical_incidents"] >= 1
    assert "Fire Department" in dash["department_usage"]
