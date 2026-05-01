"""VPN Server request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class ServerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    country: str
    city: str
    country_code: str = Field(min_length=2, max_length=2)
    hostname: str
    ip_address: str
    port: int = 51820
    public_key: str
    is_premium: bool = False
    max_clients: int = 100
    latitude: float | None = None
    longitude: float | None = None


class ServerResponse(BaseModel):
    uuid: str
    name: str
    country: str
    city: str
    country_code: str
    hostname: str
    ip_address: str
    port: int
    public_key: str
    is_active: bool
    is_premium: bool
    load: float
    max_clients: int
    current_clients: int
    latitude: float | None
    longitude: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ServerListResponse(BaseModel):
    uuid: str
    name: str
    country: str
    city: str
    country_code: str
    is_active: bool
    is_premium: bool
    load: float
    current_clients: int
    max_clients: int
    latitude: float | None
    longitude: float | None

    model_config = {"from_attributes": True}


class ServerUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None
    is_premium: bool | None = None
    max_clients: int | None = None
