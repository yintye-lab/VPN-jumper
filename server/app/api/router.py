"""Main API router that combines all endpoint modules."""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.peers import router as peers_router
from app.api.servers import router as servers_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(servers_router)
api_router.include_router(peers_router)
