import asyncio
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database.session import get_db, Base
from app.models.user import User

# Setup a clean in-memory or file test database
TEST_DB_URL = "sqlite+aiosqlite:///./test_civicmind.db"

test_engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

# Override get_db dependency in app
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
    
    # Synchronous wrapper to run async database commands
    async def create_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    asyncio.run(create_tables())
    
    yield
    
    async def drop_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(drop_tables())
    
    app.dependency_overrides.clear()

def test_root():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_register():
    client = TestClient(app)
    payload = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "+15550199",
        "password": "StrongPass@123",
        "role": "Citizen",
        "city": "San Francisco",
        "state": "California",
        "country": "USA"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "john.doe@example.com"
    assert data["first_name"] == "John"
    assert data["role"] == "Citizen"

def test_login_success():
    client = TestClient(app)
    payload = {
        "email": "john.doe@example.com",
        "password": "StrongPass@123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "john.doe@example.com"

def test_login_failure_lockout():
    client = TestClient(app)
    # Register another user to avoid interfering with John
    payload_reg = {
        "first_name": "Lock",
        "last_name": "User",
        "email": "lock.user@example.com",
        "phone": "+15550299",
        "password": "LockPass@123",
        "role": "Citizen",
        "city": "Seattle",
        "state": "Washington",
        "country": "USA"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Attempt login with incorrect password 5 times
    login_payload = {
        "email": "lock.user@example.com",
        "password": "wrongpassword"
    }
    for i in range(4):
        response = client.post("/api/v1/auth/login", json=login_payload)
        assert response.status_code == 401

    # The 5th attempt should lock the account
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 403
    assert "locked out" in response.json()["detail"]
