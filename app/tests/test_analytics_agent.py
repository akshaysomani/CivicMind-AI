import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db, Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

TEST_DB_URL = "sqlite+aiosqlite:///./test_analytics_civicmind.db"
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
        "first_name": "Analytics",
        "last_name": "Test",
        "email": "analytics.test@example.com",
        "phone": "+155507777",
        "password": "testpassword123",
        "role": "Citizen",
        "city": "San Francisco",
        "state": "California",
        "country": "USA"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login to get token
    payload_login = {
        "email": "analytics.test@example.com",
        "password": "testpassword123"
    }
    response_login = client.post("/api/v1/auth/login", json=payload_login)
    token = response_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_dashboard_summary(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/analytics/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "overall_civic_intelligence_index" in data
    assert "community_health_score" in data
    assert "infrastructure_health_score" in data


def test_get_analytics_kpis(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/analytics/kpis", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_reports" in data
    assert "avg_resolution_time" in data
    assert "active_emergencies" in data


def test_get_trends(auth_headers):
    client = TestClient(app)
    # 1. Total trends
    response = client.get("/api/v1/analytics/trends", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "labels" in data
    assert "reports_trend" in data
    
    # 2. Ward specific trends
    response = client.get("/api/v1/analytics/trends?ward=Ward+4+-+Mission", headers=auth_headers)
    assert response.status_code == 200
    data_ward = response.json()
    assert "category_counts" in data_ward


def test_get_ai_insights(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/analytics/insights", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "title" in data[0]
    assert "suggested_actions" in data[0]


def test_get_decision_recommendations(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/analytics/recommendations", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "priority" in data[0]
    assert "affected_departments" in data[0]


def test_get_scorecards(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/analytics/scorecards", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "scope" in data[0]
    assert "strengths" in data[0]


def test_get_community_engagement(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/analytics/community", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "participation_index" in data
    assert "total_notifications_sent" in data


def test_get_executive_summary(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/analytics/summary?scope=city", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["scope"] == "city"
    assert "summary" in data
