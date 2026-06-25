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
        "first_name": "Citizen",
        "last_name": "Test",
        "email": "citizen.test.agent@example.com",
        "phone": "+155503001",
        "password": "StrongPass@123",
        "role": "Citizen",
        "city": "Oakland",
        "state": "California",
        "country": "USA"
    }
    client.post("/api/v1/auth/register", json=payload_reg)

    # Login to get token
    payload_login = {
        "email": "citizen.test.agent@example.com",
        "password": "StrongPass@123"
    }
    response_login = client.post("/api/v1/auth/login", json=payload_login)
    token = response_login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_suggestions(auth_headers):
    client = TestClient(app)
    response = client.get("/api/v1/ai/suggestions", headers=auth_headers)
    assert response.status_code == 200
    suggestions = response.json()
    assert isinstance(suggestions, list)
    assert len(suggestions) > 0
    assert "I want to report a pothole." in suggestions

def test_conversation_lifecycle_and_messages(auth_headers):
    client = TestClient(app)
    
    # 1. Create a conversation
    create_payload = {
        "title": "General Inquiries",
        "category": "Citizen Query"
    }
    res_create = client.post("/api/v1/ai/conversation", json=create_payload, headers=auth_headers)
    assert res_create.status_code == 200
    conv_data = res_create.json()
    assert conv_data["title"] == "General Inquiries"
    assert conv_data["category"] == "Citizen Query"
    assert "id" in conv_data
    conv_id = conv_data["id"]

    # 2. Fetch history list, verifying it shows the newly created conversation
    res_hist = client.get("/api/v1/ai/history", headers=auth_headers)
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) >= 1
    found_conv = next((c for c in history if c["id"] == conv_id), None)
    assert found_conv is not None
    assert found_conv["title"] == "General Inquiries"
    assert found_conv["message_count"] == 0

    # 3. Send message query to conversation
    msg_payload = {
        "conversation_id": conv_id,
        "text": "How do I report water logging in Ward 5?"
    }
    res_msg = client.post("/api/v1/ai/message", json=msg_payload, headers=auth_headers)
    assert res_msg.status_code == 200
    msg_data = res_msg.json()
    assert msg_data["conversation_id"] == conv_id
    assert "user_message" in msg_data
    assert "agent_message" in msg_data
    
    user_msg = msg_data["user_message"]
    agent_msg = msg_data["agent_message"]
    
    assert user_msg["text"] == "How do I report water logging in Ward 5?"
    assert user_msg["sender"] == "user"
    assert agent_msg["sender"] == "agent"
    assert "text" in agent_msg
    assert isinstance(agent_msg["knowledge_sources"], list)
    
    agent_message_id = agent_msg["id"]

    # 4. Get conversation details and messages inside
    res_details = client.get(f"/api/v1/ai/conversation/{conv_id}", headers=auth_headers)
    assert res_details.status_code == 200
    details = res_details.json()
    assert details["id"] == conv_id
    assert len(details["messages"]) == 2
    assert details["messages"][0]["sender"] == "user"
    assert details["messages"][1]["sender"] == "agent"

    # 5. Toggle Pin Conversation
    res_pin = client.post(f"/api/v1/ai/conversation/{conv_id}/pin", headers=auth_headers)
    assert res_pin.status_code == 200
    assert res_pin.json()["is_pinned"] is True

    # 6. Submit feedback rating for agent response
    feedback_payload = {
        "message_id": agent_message_id,
        "feedback": "like"
    }
    res_feedback = client.post("/api/v1/ai/feedback", json=feedback_payload, headers=auth_headers)
    assert res_feedback.status_code == 200
    assert res_feedback.json()["feedback"] == "like"

    # 7. Check session state endpoint
    res_session = client.get(f"/api/v1/ai/session?session_id=db_session_{conv_id}", headers=auth_headers)
    assert res_session.status_code == 200
    session_data = res_session.json()
    assert session_data["session_id"] == f"db_session_{conv_id}"
    assert len(session_data["messages"]) >= 2

    # 8. Delete the conversation thread
    res_del = client.delete(f"/api/v1/ai/conversation/{conv_id}", headers=auth_headers)
    assert res_del.status_code == 200
    assert res_del.json()["status"] == "deleted"

    # 9. Verifying it's gone
    res_details_gone = client.get(f"/api/v1/ai/conversation/{conv_id}", headers=auth_headers)
    assert res_details_gone.status_code == 404
