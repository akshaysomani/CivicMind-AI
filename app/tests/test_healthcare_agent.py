import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db, Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

TEST_DB_URL = "sqlite+aiosqlite:///./test_health_civicmind.db"
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
        "first_name": "Health",
        "last_name": "Test",
        "email": "health.test@example.com",
        "phone": "+155509999",
        "password": "testpassword123",
        "role": "Citizen",
        "city": "San Francisco",
        "state": "California",
        "country": "USA"
      }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login to get token
    payload_login = {
        "email": "health.test@example.com",
        "password": "testpassword123"
    }
    response_login = client.post("/api/v1/auth/login", json=payload_login)
    token = response_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_healthcare_chat(auth_headers):
    client = TestClient(app)
    payload = {
        "query": "Where can I find the vaccine schedule for babies?",
        "session_id": "test_health_session"
    }
    response = client.post("/api/v1/ai/health/chat", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "Disclaimer:" in data["response"]
    assert data["category"] == "Healthcare"
    assert data["agent"] == "HealthcareAdvisor"
    assert "vaccin" in data["response"].lower() or "schedule" in data["response"].lower()


def test_healthcare_emergency_detection(auth_headers):
    client = TestClient(app)
    payload = {
        "query": "Help! I am having chest pain, severe shortness of breath and I think I am having a heart attack!",
        "session_id": "test_health_emergency_session"
    }
    response = client.post("/api/v1/ai/health/chat", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "analysis" in data
    assert data["analysis"]["is_emergency"] is True
    assert "108" in data["response"] or "911" in data["response"]


def test_get_facilities(auth_headers):
    client = TestClient(app)
    
    # 1. Search all facilities near SF coordinates
    response = client.get("/api/v1/ai/health/facilities?lat=37.7749&lng=-122.4194&radius_km=15", headers=auth_headers)
    assert response.status_code == 200
    facilities = response.json()
    assert isinstance(facilities, list)
    assert len(facilities) > 0
    assert "name" in facilities[0]
    assert "distance_km" in facilities[0]
    assert "estimated_travel_time_minutes" in facilities[0]

    # 2. Filter hospitals
    res_hosp = client.get("/api/v1/ai/health/hospitals?lat=37.7749&lng=-122.4194", headers=auth_headers)
    assert res_hosp.status_code == 200
    hospitals = res_hosp.json()
    assert all(h["type"] == "Hospital" for h in hospitals)

    # 3. Filter pharmacies
    res_pharm = client.get("/api/v1/ai/health/pharmacies?lat=37.7749&lng=-122.4194", headers=auth_headers)
    assert res_pharm.status_code == 200
    pharmacies = res_pharm.json()
    assert all(p["type"] == "Pharmacy" for p in pharmacies)


def test_get_advisories(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/ai/health/advisories", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(a["type"] == "Heatwave" for a in data)
    assert "checklist" in data[0]


def test_get_programs(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/ai/health/programs", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "title" in data[0]


def test_get_resources(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/ai/health/resources", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "category" in data[0]


def test_emergency_escalation(auth_headers):
    client = TestClient(app)
    payload = {
        "title": "Severe Cardiac Arrest Alert",
        "description": "Citizen reports loss of consciousness and suspected cardiac event. Urgent dispatch needed.",
        "latitude": 37.7610,
        "longitude": -122.4162,
        "address": "2480 Mission St, San Francisco, CA",
        "ward": "Ward 4 - Mission"
    }
    response = client.post("/api/v1/ai/health/escalate", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "incident" in data
    incident = data["incident"]
    assert incident["type"] == "Medical Emergency"
    assert incident["severity"] == "Critical"
    assert incident["priority"] == "Urgent"
    assert incident["latitude"] == 37.7610
