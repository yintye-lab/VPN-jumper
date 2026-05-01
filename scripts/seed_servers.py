"""Seed script to populate the database with sample VPN servers."""

import asyncio
import secrets

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session, engine
from app.models.base import Base
from app.models.server import VPNServer

SEED_SERVERS = [
    {
        "name": "US East",
        "country": "United States",
        "city": "New York",
        "country_code": "US",
        "hostname": "us-east.shieldvpn.com",
        "ip_address": "203.0.113.10",
        "load": 23.0,
        "latitude": 40.7128,
        "longitude": -74.0060,
    },
    {
        "name": "US West",
        "country": "United States",
        "city": "Los Angeles",
        "country_code": "US",
        "hostname": "us-west.shieldvpn.com",
        "ip_address": "203.0.113.11",
        "load": 35.0,
        "latitude": 34.0522,
        "longitude": -118.2437,
    },
    {
        "name": "UK London",
        "country": "United Kingdom",
        "city": "London",
        "country_code": "GB",
        "hostname": "uk.shieldvpn.com",
        "ip_address": "203.0.113.20",
        "load": 45.0,
        "latitude": 51.5074,
        "longitude": -0.1278,
    },
    {
        "name": "DE Frankfurt",
        "country": "Germany",
        "city": "Frankfurt",
        "country_code": "DE",
        "hostname": "de.shieldvpn.com",
        "ip_address": "203.0.113.30",
        "load": 18.0,
        "latitude": 50.1109,
        "longitude": 8.6821,
    },
    {
        "name": "JP Tokyo",
        "country": "Japan",
        "city": "Tokyo",
        "country_code": "JP",
        "hostname": "jp.shieldvpn.com",
        "ip_address": "203.0.113.40",
        "load": 52.0,
        "latitude": 35.6762,
        "longitude": 139.6503,
    },
    {
        "name": "SG Singapore",
        "country": "Singapore",
        "city": "Singapore",
        "country_code": "SG",
        "hostname": "sg.shieldvpn.com",
        "ip_address": "203.0.113.50",
        "load": 31.0,
        "latitude": 1.3521,
        "longitude": 103.8198,
    },
    {
        "name": "AU Sydney",
        "country": "Australia",
        "city": "Sydney",
        "country_code": "AU",
        "hostname": "au.shieldvpn.com",
        "ip_address": "203.0.113.60",
        "load": 28.0,
        "latitude": -33.8688,
        "longitude": 151.2093,
    },
    {
        "name": "CA Toronto",
        "country": "Canada",
        "city": "Toronto",
        "country_code": "CA",
        "hostname": "ca.shieldvpn.com",
        "ip_address": "203.0.113.70",
        "load": 15.0,
        "latitude": 43.6532,
        "longitude": -79.3832,
    },
    {
        "name": "NL Amsterdam",
        "country": "Netherlands",
        "city": "Amsterdam",
        "country_code": "NL",
        "hostname": "nl.shieldvpn.com",
        "ip_address": "203.0.113.80",
        "load": 42.0,
        "is_premium": True,
        "latitude": 52.3676,
        "longitude": 4.9041,
    },
    {
        "name": "CH Zurich",
        "country": "Switzerland",
        "city": "Zurich",
        "country_code": "CH",
        "hostname": "ch.shieldvpn.com",
        "ip_address": "203.0.113.90",
        "load": 12.0,
        "is_premium": True,
        "latitude": 47.3769,
        "longitude": 8.5417,
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        session: AsyncSession
        for server_data in SEED_SERVERS:
            server = VPNServer(
                public_key=secrets.token_urlsafe(32),
                port=51820,
                max_clients=100,
                **server_data,
            )
            session.add(server)
        await session.commit()
        print(f"Seeded {len(SEED_SERVERS)} VPN servers successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
