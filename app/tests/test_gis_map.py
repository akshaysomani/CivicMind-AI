import pytest
import pytest_asyncio
import json
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database.session import Base
from app.api.deps import get_db
from app.utils.spatial import point_in_geojson, haversine_distance
from app.models.gis import Ward, AdminBoundary
from app.models.report import Report
from app.models.user import User

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core import security

TEST_DB_URL = "sqlite+aiosqlite:///./test_civicmind_gis.db"
engine_test = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestSessionLocal() as session:
        yield session

@pytest_asyncio.fixture(autouse=True, scope="module")
async def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.clear()



@pytest_asyncio.fixture(scope="module")
async def citizen_auth():
    """Register and log in a citizen user, return access token headers."""
    async with TestSessionLocal() as session:
        user_res = await session.execute(select(User).where(User.email == "gis.citizen@civicmind.com"))
        user = user_res.scalars().first()
        if not user:
            user = User(
                first_name="Gis",
                last_name="Citizen",
                email="gis.citizen@civicmind.com",
                phone="9999999901",
                password_hash=security.get_password_hash("StrongPass@123"),
                city="San Francisco",
                state="California",
                country="USA",
                role="Citizen",
                email_verified=True,
                account_status="active"
            )
            session.add(user)
            await session.commit()
            
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "gis.citizen@civicmind.com",
            "password": "StrongPass@123",
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="module")
async def gov_auth():
    """Register and log in a government user, return headers."""
    async with TestSessionLocal() as session:
        user_res = await session.execute(select(User).where(User.email == "gis.officer@civicmind.com"))
        user = user_res.scalars().first()
        if not user:
            user = User(
                first_name="Gis",
                last_name="Officer",
                email="gis.officer@civicmind.com",
                phone="9999999902",
                password_hash=security.get_password_hash("StrongPass@123"),
                city="San Francisco",
                state="California",
                country="USA",
                role="Government",
                email_verified=True,
                account_status="active"
            )
            session.add(user)
            await session.commit()
            
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "gis.officer@civicmind.com",
            "password": "StrongPass@123",
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}



# ── Tests for Spatial Utilities ──────────────────────────────────────────────

def test_point_in_geojson_ray_casting():
    # Simple polygon enclosing [lng, lat] bounds: lng -122.5 to -122.4, lat 37.7 to 37.8
    polygon_geojson = json.dumps({
        "type": "Polygon",
        "coordinates": [
            [
                [-122.5, 37.7],
                [-122.4, 37.7],
                [-122.4, 37.8],
                [-122.5, 37.8],
                [-122.5, 37.7]
            ]
        ]
    })
    
    # Inside point
    assert point_in_geojson(37.75, -122.45, polygon_geojson) is True
    # Outside point
    assert point_in_geojson(37.65, -122.45, polygon_geojson) is False


def test_haversine_distance():
    # Distance between Richmond and Mission districts in SF (roughly 5km)
    dist = haversine_distance(37.7799, -122.4644, 37.7628, -122.4219)
    assert 4.0 <= dist <= 6.0


# ── Tests for GIS Endpoints ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_map_boundaries(citizen_auth):
    # Seed boundary first
    async with TestSessionLocal() as session:
        await session.execute(delete(AdminBoundary))
        boundary = AdminBoundary(
            name="San Francisco Test City",
            boundary_type="City",
            geojson_polygon=json.dumps({
                "type": "Polygon",
                "coordinates": [[[-122.5, 37.7], [-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7]]]
            })
        )
        session.add(boundary)
        await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/map/boundaries", headers=citizen_auth)
        assert res.status_code == 200
        data = res.json()
        assert data["name"] == "San Francisco Test City"
        assert data["geojson_polygon"]["type"] == "Polygon"



@pytest.mark.asyncio
async def test_get_map_layers(citizen_auth):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/map/layers", headers=citizen_auth)
        assert res.status_code == 200
        data = res.json()
        assert "police" in data
        assert "healthcare" in data
        assert "fire" in data
        assert "schools" in data
        assert data["police"]["type"] == "FeatureCollection"


@pytest.mark.asyncio
async def test_get_map_wards_and_stats(citizen_auth):
    # Seed Ward first
    async with TestSessionLocal() as session:
        ward = Ward(
            name="Ward 1 - Richmond",
            city="San Francisco",
            population=62000,
            geojson_polygon=json.dumps({
                "type": "Polygon",
                "coordinates": [[[-122.5, 37.7], [-122.45, 37.7], [-122.45, 37.8], [-122.5, 37.8], [-122.5, 37.7]]]
            })
        )
        session.add(ward)
        await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/map/wards", headers=citizen_auth)
        assert res.status_code == 200
        data = res.json()
        assert len(data) > 0
        assert data[0]["name"] == "Ward 1 - Richmond"
        
        stats_res = await client.get("/api/v1/map/statistics", headers=citizen_auth)
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert "total_issues" in stats
        assert "resolution_rate" in stats


@pytest.mark.asyncio
async def test_get_map_location_and_nearby(citizen_auth):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Geocode
        res = await client.get("/api/v1/map/location?address=market", headers=citizen_auth)
        assert res.status_code == 200
        data = res.json()
        assert data["latitude"] == 37.7892
        
        # Reverse Geocode
        res_rev = await client.get("/api/v1/map/location?lat=37.7785&lng=-122.4820", headers=citizen_auth)
        assert res_rev.status_code == 200
        assert "ward" in res_rev.json()

        # Nearby
        res_nearby = await client.get("/api/v1/map/nearby?lat=37.7785&lng=-122.4820&radius=2.0", headers=citizen_auth)
        assert res_nearby.status_code == 200
        nearby = res_nearby.json()
        assert "issues" in nearby
        assert "amenities" in nearby


@pytest.mark.asyncio
async def test_get_map_issues_rbac_masking(citizen_auth, gov_auth):
    # Seed a citizen user and their issue
    async with TestSessionLocal() as session:
        user_res = await session.execute(select(User).where(User.email == "gis.citizen@civicmind.com"))
        user = user_res.scalars().first()
        
        report = Report(
            title="Pothole in SF",
            description="Large pothole blocking lanes",
            category="Roads",
            priority="Critical",
            severity="Emergency",
            status="Submitted",
            latitude=37.7750,
            longitude=-122.4180,
            citizen_id=user.id,
            city="San Francisco",
            state="California",
            country="USA",
            is_anonymous=False
        )
        session.add(report)
        await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Citizen queries issues
        res_cit = await client.get("/api/v1/map/issues", headers=citizen_auth)
        assert res_cit.status_code == 200
        issues_cit = res_cit.json()
        assert len(issues_cit) > 0
        
        # Find the issue and check it shows the correct details (citizen is the reporter)
        citizen_issue = next(i for i in issues_cit if i["title"] == "Pothole in SF")
        assert citizen_issue["reporter"]["name"] == "Gis Citizen"
        assert citizen_issue["reporter"]["phone"] == "9999999901"

        # Register another citizen, log them in, check if reporter details are masked
        await client.post("/api/v1/auth/register", json={
            "first_name": "Other",
            "last_name": "Citizen",
            "email": "other.citizen@civicmind.com",
            "phone": "9999999903",
            "password": "StrongPass@123",
            "city": "San Francisco",
            "state": "California",
            "country": "USA",
            "role": "Citizen",
        })
        login_other = await client.post("/api/v1/auth/login", json={
            "email": "other.citizen@civicmind.com",
            "password": "StrongPass@123",
        })
        token_other = login_other.json()["access_token"]
        headers_other = {"Authorization": f"Bearer {token_other}"}

        res_other = await client.get("/api/v1/map/issues", headers=headers_other)
        assert res_other.status_code == 200
        other_issues = res_other.json()
        masked_issue = next(i for i in other_issues if i["title"] == "Pothole in SF")
        assert masked_issue["reporter"]["name"] == "Citizen (Masked)"
        assert masked_issue["reporter"]["phone"] == "Masked"

        # 2. Gov queries issues
        res_gov = await client.get("/api/v1/map/issues", headers=gov_auth)
        assert res_gov.status_code == 200
        issues_gov = res_gov.json()
        gov_issue = next(i for i in issues_gov if i["title"] == "Pothole in SF")
        assert gov_issue["reporter"]["name"] == "Gis Citizen"
        assert gov_issue["reporter"]["phone"] == "9999999901"
