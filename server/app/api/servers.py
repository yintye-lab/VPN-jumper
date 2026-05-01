"""VPN Server management API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.server import VPNServer
from app.models.user import User
from app.schemas.server import ServerCreate, ServerListResponse, ServerResponse, ServerUpdate
from app.services.auth import get_admin_user, get_current_user

router = APIRouter(prefix="/servers", tags=["Servers"])


@router.get("/", response_model=list[ServerListResponse])
async def list_servers(
    country: str | None = None,
    premium_only: bool = False,
    _current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all available VPN servers."""
    query = select(VPNServer).where(VPNServer.is_active.is_(True))

    if country:
        query = query.where(VPNServer.country_code == country.upper())
    if premium_only:
        query = query.where(VPNServer.is_premium.is_(True))

    query = query.order_by(VPNServer.country, VPNServer.city)
    result = await db.execute(query)
    servers = result.scalars().all()
    return [ServerListResponse.model_validate(s) for s in servers]


@router.get("/{server_uuid}", response_model=ServerResponse)
async def get_server(
    server_uuid: str,
    _current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific server."""
    result = await db.execute(select(VPNServer).where(VPNServer.uuid == server_uuid))
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    return ServerResponse.model_validate(server)


@router.post("/", response_model=ServerResponse, status_code=status.HTTP_201_CREATED)
async def create_server(
    server_data: ServerCreate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new VPN server (admin only)."""
    server = VPNServer(**server_data.model_dump())
    db.add(server)
    await db.flush()
    await db.refresh(server)
    return ServerResponse.model_validate(server)


@router.patch("/{server_uuid}", response_model=ServerResponse)
async def update_server(
    server_uuid: str,
    update_data: ServerUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a VPN server (admin only)."""
    result = await db.execute(select(VPNServer).where(VPNServer.uuid == server_uuid))
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(server, field, value)

    await db.flush()
    await db.refresh(server)
    return ServerResponse.model_validate(server)


@router.delete("/{server_uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_server(
    server_uuid: str,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a VPN server (admin only)."""
    result = await db.execute(select(VPNServer).where(VPNServer.uuid == server_uuid))
    server = result.scalar_one_or_none()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    await db.delete(server)
