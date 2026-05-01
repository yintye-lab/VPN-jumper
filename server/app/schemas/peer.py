"""Peer (device) request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class PeerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    device_type: str = "desktop"
    server_uuid: str


class PeerResponse(BaseModel):
    uuid: str
    name: str
    device_type: str
    public_key: str
    assigned_ip: str
    is_active: bool
    last_handshake: datetime | None
    total_rx: int
    total_tx: int
    server_uuid: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PeerConfig(BaseModel):
    config_text: str
    qr_code_base64: str | None = None


class PeerToggle(BaseModel):
    is_active: bool


class ConnectionStatus(BaseModel):
    connected: bool
    server_name: str | None = None
    server_country: str | None = None
    assigned_ip: str | None = None
    connected_since: datetime | None = None
    bytes_received: int = 0
    bytes_sent: int = 0
