"""WireGuard management service."""

import base64
import io
import ipaddress
import subprocess
from pathlib import Path

import qrcode
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.peer import Peer


class WireGuardService:
    @staticmethod
    def generate_keypair() -> tuple[str, str]:
        """Generate a WireGuard key pair (private_key, public_key)."""
        private_key = subprocess.run(
            ["wg", "genkey"], capture_output=True, text=True, check=True
        ).stdout.strip()
        public_key = subprocess.run(
            ["wg", "pubkey"],
            input=private_key,
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
        return private_key, public_key

    @staticmethod
    def generate_preshared_key() -> str:
        """Generate a WireGuard preshared key."""
        return subprocess.run(
            ["wg", "genpsk"], capture_output=True, text=True, check=True
        ).stdout.strip()

    @staticmethod
    async def allocate_ip(db: AsyncSession) -> str:
        """Allocate the next available IP address from the VPN subnet."""
        network = ipaddress.IPv4Network(settings.WG_NETWORK)
        hosts = list(network.hosts())

        # Reserve .1 for the server
        available_hosts = hosts[1:]

        result = await db.execute(select(Peer.assigned_ip))
        used_ips = {row[0] for row in result.fetchall()}

        for host in available_hosts:
            ip_str = str(host)
            if ip_str not in used_ips:
                return ip_str

        raise ValueError("No available IP addresses in the VPN subnet")

    @staticmethod
    def generate_client_config(
        peer_private_key: str,
        peer_address: str,
        server_public_key: str,
        server_endpoint: str,
        server_port: int,
        dns: str | None = None,
        preshared_key: str | None = None,
    ) -> str:
        """Generate a WireGuard client configuration file."""
        config = f"""[Interface]
PrivateKey = {peer_private_key}
Address = {peer_address}/32
DNS = {dns or settings.WG_DNS}

[Peer]
PublicKey = {server_public_key}
Endpoint = {server_endpoint}:{server_port}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25"""

        if preshared_key:
            config += f"\nPresharedKey = {preshared_key}"

        return config

    @staticmethod
    def generate_qr_code(config_text: str) -> str:
        """Generate a QR code for the config and return as base64 PNG."""
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(config_text)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return base64.b64encode(buffer.read()).decode("utf-8")

    @staticmethod
    def add_peer_to_interface(
        interface: str,
        public_key: str,
        allowed_ips: str,
        preshared_key: str | None = None,
    ) -> bool:
        """Add a peer to the WireGuard interface."""
        try:
            cmd = ["wg", "set", interface, "peer", public_key, "allowed-ips", allowed_ips]
            if preshared_key:
                cmd.extend(["preshared-key", "/dev/stdin"])
                subprocess.run(cmd, input=preshared_key, text=True, check=True)
            else:
                subprocess.run(cmd, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    @staticmethod
    def remove_peer_from_interface(interface: str, public_key: str) -> bool:
        """Remove a peer from the WireGuard interface."""
        try:
            subprocess.run(
                ["wg", "set", interface, "peer", public_key, "remove"],
                check=True,
            )
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    @staticmethod
    def save_server_config(interface: str, config_content: str) -> bool:
        """Save server configuration to the WireGuard config directory."""
        try:
            config_path = Path(settings.WG_CONFIG_DIR) / f"{interface}.conf"
            config_path.write_text(config_content)
            return True
        except OSError:
            return False


wireguard_service = WireGuardService()
