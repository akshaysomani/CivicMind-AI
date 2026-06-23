from fastapi import APIRouter
from app.api import auth, user, citizen, government, issues, map, ai, emergency_api

api_router = APIRouter()

# Register sub-routers
api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(citizen.router)
api_router.include_router(government.router)
api_router.include_router(issues.router)
api_router.include_router(map.router)
api_router.include_router(ai.router)
api_router.include_router(emergency_api.router)


