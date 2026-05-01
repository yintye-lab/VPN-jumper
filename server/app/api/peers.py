"""Peer (device) management API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.peer import Peer
from app.models.server import VPNServer
from app.models.user import User
from app.schemas.peer import PeerConfig, PeerCreate, PeerResponse, PeerToggle
from app.services.auth import get_current_user
from app.services.wireguard import wireguard_service

router = APIRouter(prefix="/peers", tags=["Peers"])


@router.get("/", response_model=list[PeerResponse])
async def list_peers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all peers (devices) for the current user."""
    result = await db.execute(
        select(Peer).where(Peer.user_id == current_user.id).order_by(Peer.created_at.desc())
    )
    peers = result.scalars().all()
    response = []
    for peer in peers:
        await db.refresh(peer, ["server"])
        peer_data = PeerResponse(
            uuid=peer.uuid,
            name=peer.name,
            device_type=peer.device_type,
            public_key=peer.public_key,
            assigned_ip=peer.assigned_ip,
            is_active=peer.is_active,
            last_handshake=peer.last_handshake,
            total_rx=peer.total_rx,
            total_tx=peer.total_tx,
            server_uuid=peer.server.uuid,
            created_at=peer.created_at,
        )
        response.append(peer_data)
    return response


@router.post("/", response_model=PeerConfig, status_code=status.HTTP_201_CREATED)
async def create_peer(
    peer_data: PeerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new peer (register a device) and return the WireGuard config."""
    # Check device limit
    result = await db.execute(
        select(func.count()).where(Peer.user_id == current_user.id)
    )
    device_count = result.scalar() or 0
    if device_count >= current_user.max_devices:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum device limit ({current_user.max_devices}) reached",
        )

    # Find the server
    result = await db.execute(
        select(VPNServer).where(VPNServer.uuid == peer_data.server_uuid)
    )
    server = result.scalar_one_or_none()
    if not server or not server.is_active:
        raise HTTPException(status_code=404, detail="Server not found or inactive")

    # Generate keys and allocate IP
    try:
        private_key, public_key = wireguard_service.generate_keypair()
        preshared_key = wireguard_service.generate_preshared_key()
    except (FileNotFoundError, OSError):
        # WireGuard tools not available; generate placeholder keys for demo
        import secrets as sec

        private_key = sec.token_urlsafe(32)
        public_key = sec.token_urlsafe(32)
        preshared_key = sec.token_urlsafe(32)

    assigned_ip = await wireguard_service.allocate_ip(db)

    peer = Peer(
        name=peer_data.name,
        device_type=peer_data.device_type,
        public_key=public_key,
        private_key=private_key,
        preshared_key=preshared_key,
        assigned_ip=assigned_ip,
        user_id=current_user.id,
        server_id=server.id,
    )
    db.add(peer)

    # Update server client count
    server.current_clients += 1
    await db.flush()

    # Try to add peer to live WireGuard interface
    wireguard_service.add_peer_to_interface(
        settings.WG_INTERFACE,
        public_key,
        f"{assigned_ip}/32",
        preshared_key,
    )

    # Generate client config
    endpoint = settings.WG_SERVER_ENDPOINT or server.ip_address
    config_text = wireguard_service.generate_client_config(
        peer_private_key=private_key,
        peer_address=assigned_ip,
        server_public_key=server.public_key,
        server_endpoint=endpoint,
        server_port=server.port,
        preshared_key=preshared_key,
    )

    qr_code = wireguard_service.generate_qr_code(config_text)

    return PeerConfig(config_text=config_text, qr_code_base64=qr_code)


@router.get("/{peer_uuid}", response_model=PeerResponse)
async def get_peer(
    peer_uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific peer."""
    result = await db.execute(
        select(Peer).where(Peer.uuid == peer_uuid, Peer.user_id == current_user.id)
    )
    peer = result.scalar_one_or_none()
    if not peer:
        raise HTTPException(status_code=404, detail="Peer not found")

    await db.refresh(peer, ["server"])
    return PeerResponse(
        uuid=peer.uuid,
        name=peer.name,
        device_type=peer.device_type,
        public_key=peer.public_key,
        assigned_ip=peer.assigned_ip,
        is_active=peer.is_active,
        last_handshake=peer.last_handshake,
        total_rx=peer.total_rx,
        total_tx=peer.total_tx,
        server_uuid=peer.server.uuid,
        created_at=peer.created_at,
    )


@router.patch("/{peer_uuid}/toggle", response_model=PeerResponse)
async def toggle_peer(
    peer_uuid: str,
    toggle: PeerToggle,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a peer."""
    result = await db.execute(
        select(Peer).where(Peer.uuid == peer_uuid, Peer.user_id == current_user.id)
    )
    peer = result.scalar_one_or_none()
    if not peer:
        raise HTTPException(status_code=404, detail="Peer not found")

    peer.is_active = toggle.is_active

    if not toggle.is_active:
        wireguard_service.remove_peer_from_interface(settings.WG_INTERFACE, peer.public_key)
    else:
        wireguard_service.add_peer_to_interface(
            settings.WG_INTERFACE,
            peer.public_key,
            f"{peer.assigned_ip}/32",
            peer.preshared_key,
        )

    await db.flush()
    await db.refresh(peer, ["server"])
    return PeerResponse(
        uuid=peer.uuid,
        name=peer.name,
        device_type=peer.device_type,
        public_key=peer.public_key,
        assigned_ip=peer.assigned_ip,
        is_active=peer.is_active,
        last_handshake=peer.last_handshake,
        total_rx=peer.total_rx,
        total_tx=peer.total_tx,
        server_uuid=peer.server.uuid,
        created_at=peer.created_at,
    )


@router.delete("/{peer_uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_peer(
    peer_uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a peer (remove device)."""
    result = await db.execute(
        select(Peer).where(Peer.uuid == peer_uuid, Peer.user_id == current_user.id)
    )
    peer = result.scalar_one_or_none()
    if not peer:
        raise HTTPException(status_code=404, detail="Peer not found")

    # Remove from WireGuard interface
    wireguard_service.remove_peer_from_interface(settings.WG_INTERFACE, peer.public_key)

    # Update server client count
    await db.refresh(peer, ["server"])
    if peer.server.current_clients > 0:
        peer.server.current_clients -= 1

    await db.delete(peer)


@router.get("/{peer_uuid}/config", response_model=PeerConfig)
async def get_peer_config(
    peer_uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Re-download the WireGuard config for a peer."""
    result = await db.execute(
        select(Peer).where(Peer.uuid == peer_uuid, Peer.user_id == current_user.id)
    )
    peer = result.scalar_one_or_none()
    if not peer:
        raise HTTPException(status_code=404, detail="Peer not found")

    await db.refresh(peer, ["server"])
    endpoint = settings.WG_SERVER_ENDPOINT or peer.server.ip_address
    config_text = wireguard_service.generate_client_config(
        peer_private_key=peer.private_key,
        peer_address=peer.assigned_ip,
        server_public_key=peer.server.public_key,
        server_endpoint=endpoint,
        server_port=peer.server.port,
        preshared_key=peer.preshared_key,
    )

    qr_code = wireguard_service.generate_qr_code(config_text)
    return PeerConfig(config_text=config_text, qr_code_base64=qr_code)
