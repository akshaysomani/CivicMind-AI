import asyncio
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database.session import get_db, Base
from app.models.user import User
from app.models.report import Report
from app.models.notification import Notification
from app.models.feed import FeedPost
from app.models.alert import Alert

# Setup a clean in-memory or file test database
TEST_DB_URL = "sqlite+aiosqlite:///./test_civicmind_citizen.db"

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
    
    # Synchronous wrapper to run async database commands and seed data
    async def init_db():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
        async with TestSessionLocal() as session:
            from app.database.seed import seed_db
            # Seeding is tied to the existence of a user, but since users don't exist yet,
            # seed_db will seed global alerts and feed posts. Then when get_auth_headers runs
            # and registers the test citizen, we can run seed_db again to seed user reports!
            await seed_db(session)
            
    asyncio.run(init_db())
    
    yield
    
    async def drop_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(drop_tables())
    
    app.dependency_overrides.clear()

# Helper to register and login a test citizen
def get_auth_headers():
    client = TestClient(app)
    
    # 1. Register Citizen
    payload_reg = {
        "first_name": "Test",
        "last_name": "Citizen",
        "email": "test.citizen@example.com",
        "phone": "+15559876",
        "password": "securepassword123",
        "role": "Citizen",
        "city": "San Francisco",
        "state": "California",
        "country": "USA"
      }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Trigger seeding for user specific reports
    async def seed_new_user():
        async with TestSessionLocal() as session:
            from app.database.seed import seed_db
            await seed_db(session)
    asyncio.run(seed_new_user())

    # 2. Login
    login_payload = {
        "email": "test.citizen@example.com",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}

def test_get_dashboard_stats():
    client = TestClient(app)
    headers = get_auth_headers()
    
    response = client.get("/api/v1/citizen/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "issues_reported" in data
    assert "resolved_issues" in data
    assert "participation_score" in data

def test_get_reports_empty_initially():
    client = TestClient(app)
    headers = get_auth_headers()
    
    # Fetch reports
    response = client.get("/api/v1/citizen/reports", headers=headers)
    assert response.status_code == 200
    # On first fetch, seed_db runs inside lifespan and populates reports since test user now exists
    data = response.json()
    assert isinstance(data, list)

def test_notifications_lifecycle():
    client = TestClient(app)
    headers = get_auth_headers()
    
    # 1. Get notifications
    response = client.get("/api/v1/citizen/notifications", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    # Let's seed a notification first if empty
    if not data:
        async def insert_noti():
            async with TestSessionLocal() as session:
                user_res = await session.execute(select(User).where(User.email == "test.citizen@example.com"))
                user = user_res.scalars().first()
                noti = Notification(
                    user_id=user.id,
                    title="Mock Notification",
                    message="Your street drain report was updated.",
                    type="issue_update"
                )
                session.add(noti)
                await session.commit()
        asyncio.run(insert_noti())
        
        # Refetch
        response = client.get("/api/v1/citizen/notifications", headers=headers)
        data = response.json()
        
    assert len(data) > 0
    noti_id = data[0]["id"]
    
    # 2. Mark Read
    read_res = client.put(f"/api/v1/citizen/notifications/{noti_id}/read", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True
    
    # 3. Delete
    del_res = client.delete(f"/api/v1/citizen/notifications/{noti_id}", headers=headers)
    assert del_res.status_code == 200
    assert "deleted successfully" in del_res.json()["message"]

def test_feed_and_like_bookmark():
    client = TestClient(app)
    headers = get_auth_headers()
    
    # 1. Fetch Feed
    response = client.get("/api/v1/citizen/feed", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    post_id = data[0]["id"]
    
    # 2. Like post
    like_res = client.post(f"/api/v1/citizen/feed/{post_id}/like", headers=headers)
    assert like_res.status_code == 200
    assert "is_liked" in like_res.json()
    
    # 3. Bookmark post
    bm_res = client.post(f"/api/v1/citizen/feed/{post_id}/bookmark", headers=headers)
    assert bm_res.status_code == 200
    assert "is_bookmarked" in bm_res.json()

def test_alerts_and_insights():
    client = TestClient(app)
    headers = get_auth_headers()
    
    # Fetch alerts
    alerts_res = client.get("/api/v1/citizen/alerts", headers=headers)
    assert alerts_res.status_code == 200
    assert isinstance(alerts_res.json(), list)
    
    # Fetch insights
    insights_res = client.get("/api/v1/citizen/insights", headers=headers)
    assert insights_res.status_code == 200
    assert len(insights_res.json()) == 4
