# Testing Guide — Developer Reference

This guide explains how developers can run the automated test suite, mock external connections, and write new tests.

## 1. Prerequisites

Verify Python development dependencies are installed:
```bash
pip install pytest pytest-asyncio pytest-cov httpx
```

---

## 2. Running Automated Tests

To execute all tests within the backend suite, run the following command in the workspace root:
```bash
python -m pytest
```

To run a specific module test suite:
```bash
python -m pytest app/tests/test_gis_map.py
```

### Coverage Reports
Generate a HTML code coverage report by executing:
```bash
python -m pytest --cov=app --cov-report=html
```
This writes reports to `htmlcov/index.html` details covered and uncovered branches.

---

## 3. Database Isolation in Testing

We enforce complete database isolation across test suites:
- Each module test has its own SQLite database definition:
  - `TEST_DB_URL = "sqlite+aiosqlite:///./test_civicmind_gis.db"`
- Setup fixtures run migrations and clear tables at tear down:
```python
@pytest_asyncio.fixture(autouse=True, scope="module")
async def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.clear()
```
> [!IMPORTANT]
> If a test modifies data, make sure to execute a `delete` command in the setup block to bypass conflicts with lifespan startup seeding routines.
