import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db, Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

TEST_DB_URL = "sqlite+aiosqlite:///./test_forecast_civicmind.db"
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
        "first_name": "Forecast",
        "last_name": "Test",
        "email": "forecast.test@example.com",
        "phone": "+155506666",
        "password": "StrongPass@123",
        "role": "Citizen",
        "city": "San Francisco",
        "state": "California",
        "country": "USA"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login to get token
    payload_login = {
        "email": "forecast.test@example.com",
        "password": "StrongPass@123"
    }
    response_login = client.post("/api/v1/auth/login", json=payload_login)
    token = response_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_forecast_dashboard(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/forecast/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "overall_forecast_index" in data
    assert "total_warnings_active" in data
    assert "top_risks" in data


def test_get_forecast_trends(auth_headers):
    client = TestClient(app)
    # 1. Default trends (7days)
    response = client.get("/api/v1/forecast/trends", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "range" in data
    assert "infrastructure_forecast" in data
    assert len(data["labels"]) == 7

    # 2. Custom timeframe range (30days)
    response = client.get("/api/v1/forecast/trends?range=30days", headers=auth_headers)
    assert response.status_code == 200
    data_30 = response.json()
    assert len(data_30["labels"]) == 4


def test_get_forecast_risks(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/forecast/risks", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "domain" in data[0]
    assert "likelihood" in data[0]


def test_get_early_warnings(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/forecast/warnings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "pattern" in data[0]
    assert "confidence" in data[0]


def test_get_preventive_recommendations(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/forecast/recommendations", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "responsible_departments" in data[0]


def test_run_scenario_simulation(auth_headers):
    client = TestClient(app)
    payload = {
        "staff_increase": 5,
        "maintenance_teams": 3,
        "awareness_campaigns": True
    }
    response = client.post("/api/v1/forecast/scenario", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "simulated_complaints_reduction_percent" in data
    assert "readiness_boost_percent" in data
    assert data["simulated_complaints_reduction_percent"] > 0


def test_get_forecast_confidence(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/forecast/confidence", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "overall_accuracy_score" in data
    assert "historical_match_rate" in data


def test_get_forecast_geospatial(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/forecast/geospatial", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "risk_score" in data[0]
    assert "latitude" in data[0]
