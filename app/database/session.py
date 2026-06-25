import time
import logging
from typing import AsyncGenerator
from sqlalchemy import event
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

logger = logging.getLogger("database")

# Build connection pooling arguments based on database URL type
connect_args = {}
pool_kwargs = {}

if "sqlite" in settings.DATABASE_URL:
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL specific pool optimizations
    pool_kwargs["pool_size"] = settings.DATABASE_POOL_SIZE
    pool_kwargs["max_overflow"] = settings.DATABASE_MAX_OVERFLOW
    pool_kwargs["pool_recycle"] = 1800
    pool_kwargs["pool_pre_ping"] = True

# Primary write-capable engine
engine = create_async_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **pool_kwargs
)

# Read replica engine (defaults to primary engine if replica URL matches or database is sqlite)
replica_url = settings.DATABASE_REPLICA_URL or settings.DATABASE_URL
replica_connect_args = {"check_same_thread": False} if "sqlite" in replica_url else {}
replica_pool_kwargs = {}
if "sqlite" not in replica_url:
    replica_pool_kwargs["pool_size"] = settings.DATABASE_POOL_SIZE
    replica_pool_kwargs["max_overflow"] = settings.DATABASE_MAX_OVERFLOW
    replica_pool_kwargs["pool_recycle"] = 1800
    replica_pool_kwargs["pool_pre_ping"] = True

read_engine = create_async_engine(
    replica_url,
    connect_args=replica_connect_args,
    **replica_pool_kwargs
)

# Async session factories
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

ReadAsyncSessionLocal = async_sessionmaker(
    bind=read_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy database models."""
    pass

# Keep count of slow queries for API observability dashboard
SLOW_QUERY_COUNT = 0
TOTAL_QUERY_COUNT = 0

@event.listens_for(engine.sync_engine, "before_cursor_execute")
@event.listens_for(read_engine.sync_engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, execmany):
    context._query_start_time = time.time()

@event.listens_for(engine.sync_engine, "after_cursor_execute")
@event.listens_for(read_engine.sync_engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, execmany):
    global SLOW_QUERY_COUNT, TOTAL_QUERY_COUNT
    TOTAL_QUERY_COUNT += 1
    duration_ms = (time.time() - context._query_start_time) * 1000
    if duration_ms > settings.SLOW_QUERY_THRESHOLD_MS:
        SLOW_QUERY_COUNT += 1
        logger.warning(
            f"[Slow Query Detected] {duration_ms:.2f}ms | Threshold: {settings.SLOW_QUERY_THRESHOLD_MS}ms | SQL: {statement[:150]}..."
        )

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency helper to inject database session instances into API routers."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def get_read_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency helper to inject read-replica database session instances into read-only API routers."""
    async with ReadAsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

