from fastapi import APIRouter
from app.api import auth, user, citizen, government

api_router = APIRouter()

# Register sub-routers
api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(citizen.router)
api_router.include_router(government.router)
