import time
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.router import api_router
from app.database.session import Base, engine, AsyncSessionLocal
import app.models
from app.database.seed import seed_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure static upload directories exist
    os.makedirs("public/uploads/avatars", exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Run the database seeder
    async with AsyncSessionLocal() as session:
        try:
            await seed_db(session)
        except Exception as e:
            print(f"Error seeding database: {e}")
            await session.rollback()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CivicMind AI Enterprise API Portal",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url=None,
    lifespan=lifespan
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom In-Memory Rate Limiting Middleware (Satisfies security requirement)
# Standard bucket rate limit: 100 requests per minute per IP address
rate_limit_records = defaultdict(list)
RATE_LIMIT_WINDOW = 60 # seconds
RATE_LIMIT_MAX_REQUESTS = 100

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Skip rate limiting for static / documentation files
    if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
        return await call_next(request)
        
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # Filter out requests older than the window
    rate_limit_records[client_ip] = [
        t for t in rate_limit_records[client_ip]
        if current_time - t < RATE_LIMIT_WINDOW
    ]
    
    if len(rate_limit_records[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        return Response(
            content="Rate limit exceeded. Too many requests from this IP address.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS
        )
        
    rate_limit_records[client_ip].append(current_time)
    return await call_next(request)

# Security Headers Middleware (XSS, Frame options, etc.)
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.tile.openstreetmap.org;"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response



# Mount API V1 Routing
app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve uploaded files statically
if os.path.exists("public/uploads"):
    app.mount("/uploads", StaticFiles(directory="public/uploads"), name="uploads")

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.APP_VERSION,
        "docs": f"{settings.API_V1_STR}/docs" if settings.DEBUG else "disabled"
    }
