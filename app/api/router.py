from fastapi import APIRouter
from app.api import auth, user, citizen, government, issues, map, ai, emergency_api, health, schemes_api, analytics_api, forecast_api, notification_api, reporting_api, system

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
api_router.include_router(health.router)
api_router.include_router(schemes_api.router)
api_router.include_router(analytics_api.router)
api_router.include_router(forecast_api.router)
api_router.include_router(notification_api.router)
api_router.include_router(reporting_api.router)
api_router.include_router(system.router)





