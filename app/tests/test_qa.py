import asyncio
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database.session import get_db, Base
from app.models.user import User
from app.core import security

TEST_DB_URL = "sqlite+aiosqlite:///./test_civicmind_qa.db"
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
    
    async def create_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        async with TestSessionLocal() as session:
            # Seed super admin
            hashed_pwd = security.get_password_hash("StrongPass@123")
            admin = User(
                first_name="Admin",
                last_name="User",
                email="admin.qa@civicmind.gov",
                phone="+15551999",
                password_hash=hashed_pwd,
                role="Admin",
                sub_role="Super Administrator",
                city="San Francisco",
                state="California",
                country="USA",
                email_verified=True
            )
            session.add(admin)
            await session.commit()
            
    asyncio.run(create_tables())
    yield
    
    async def drop_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(drop_tables())
    app.dependency_overrides.clear()

@pytest.fixture(scope="module")
def admin_headers():
    client = TestClient(app)
    response = client.post("/api/v1/auth/login", json={
        "email": "admin.qa@civicmind.gov",
        "password": "StrongPass@123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_qa_unauthorized():
    client = TestClient(app)
    response = client.get("/api/v1/qa/results")
    assert response.status_code == 401

def test_get_qa_results(admin_headers):
    client = TestClient(app)
    response = client.get("/api/v1/qa/results", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "summary" in data
    assert "suites" in data

def test_get_qa_coverage(admin_headers):
    client = TestClient(app)
    response = client.get("/api/v1/qa/coverage", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "overall_coverage" in data
    assert "by_module" in data

def test_get_qa_accessibility(admin_headers):
    client = TestClient(app)
    response = client.get("/api/v1/qa/accessibility", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert data["wcag_level"] == "AA"
    assert len(data["rules"]) > 0

def test_get_qa_performance(admin_headers):
    client = TestClient(app)
    response = client.get("/api/v1/qa/performance", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "dashboard_load_time_ms" in data
    assert "ai_response_time_ms" in data
    assert "history" in data

def test_get_qa_release(admin_headers):
    client = TestClient(app)
    response = client.get("/api/v1/qa/release", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert len(data["checklist"]) > 0

def test_get_qa_health(admin_headers):
    client = TestClient(app)
    response = client.get("/api/v1/qa/health", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["Healthy", "Degraded"]
    assert "components" in data
