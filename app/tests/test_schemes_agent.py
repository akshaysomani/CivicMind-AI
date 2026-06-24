import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db, Base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

TEST_DB_URL = "sqlite+aiosqlite:///./test_schemes_civicmind.db"
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
        "first_name": "Scheme",
        "last_name": "Test",
        "email": "scheme.test@example.com",
        "phone": "+155508888",
        "password": "testpassword123",
        "role": "Citizen",
        "city": "San Francisco",
        "state": "California",
        "country": "USA"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login to get token
    payload_login = {
        "email": "scheme.test@example.com",
        "password": "testpassword123"
    }
    response_login = client.post("/api/v1/auth/login", json=payload_login)
    token = response_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_scheme_chat(auth_headers):
    client = TestClient(app)
    payload = {
        "query": "Is there a farmer scheme under PM-KISAN?",
        "session_id": "test_scheme_session"
    }
    response = client.post("/api/v1/ai/schemes/chat", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert data["category"] == "Government Scheme"
    assert data["agent"] == "SchemeAdvisor"
    assert "pm-kisan" in data["response"].lower() or "farmer" in data["response"].lower()


def test_search_schemes(auth_headers):
    client = TestClient(app)
    
    # 1. Search by query
    response = client.get("/api/v1/ai/schemes/search?query=kisan", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "pm-kisan" in data[0]["title"].lower()

    # 2. Search by category
    response = client.get("/api/v1/ai/schemes/search?category=healthcare", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert any(s["category"] == "Healthcare" for s in data)


def test_check_eligibility(auth_headers):
    client = TestClient(app)
    payload = {
        "age": 25,
        "occupation": "farmer",
        "student_status": False,
        "income": 200000.0,
        "location": "Rural Area",
        "rural_urban": "Rural",
        "gender": "Male",
        "business_owner": False,
        "farmer": True,
        "senior_citizen": False,
        "education_level": "Graduate"
    }
    response = client.post("/api/v1/ai/schemes/eligibility", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    # Find PM-KISAN in results
    kisan_result = next((r for r in data if "PM-KISAN" in r["scheme"]["title"]), None)
    assert kisan_result is not None
    assert kisan_result["status"] == "Eligible"


def test_get_recommendations(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/ai/schemes/recommendations", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_compare_schemes(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/ai/schemes/compare?ids=1&ids=2", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["id"] == 1
    assert data[1]["id"] == 2


def test_get_offices(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/ai/schemes/offices?lat=37.7749&lng=-122.4194&radius_km=15", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "distance_km" in data[0]


def test_get_resources(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/ai/schemes/resources", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "question" in data[0]


def test_bookmark_flow(auth_headers):
    client = TestClient(app)
    
    # 1. Bookmark a scheme
    payload = {
        "scheme_id": 1,
        "scheme_title": "PM-KISAN (Income Support for Farmers)",
        "scheme_category": "Agriculture"
    }
    response = client.post("/api/v1/ai/schemes/save", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["success", "already_saved"]
    
    # 2. Get bookmarked schemes
    response = client.get("/api/v1/ai/schemes/saved", headers=auth_headers)
    assert response.status_code == 200
    saved_list = response.json()
    assert isinstance(saved_list, list)
    assert len(saved_list) > 0
    
    # 3. Delete bookmark
    bookmark_id = saved_list[0]["id"]
    response = client.delete(f"/api/v1/ai/schemes/saved/{bookmark_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
