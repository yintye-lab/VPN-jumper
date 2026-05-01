"""VPN Server database model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class VPNServer(Base):
    __tablename__ = "vpn_servers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(
        String(36), unique=True, default=lambda: str(uuid.uuid4()), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False)
    hostname: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    port: Mapped[int] = mapped_column(Integer, default=51820)
    public_key: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    load: Mapped[float] = mapped_column(Float, default=0.0)
    max_clients: Mapped[int] = mapped_column(Integer, default=100)
    current_clients: Mapped[int] = mapped_column(Integer, default=0)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    peers: Mapped[list["Peer"]] = relationship("Peer", back_populates="server")  # noqa: F821

    def __repr__(self) -> str:
        return f"<VPNServer(id={self.id}, name={self.name}, country={self.country})>"
