#!/bin/bash
# ShieldVPN - WireGuard Server Setup Script
# Run this on your VPN server to set up WireGuard

set -e

echo "=== ShieldVPN WireGuard Server Setup ==="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)"
  exit 1
fi

# Install WireGuard
echo "[1/5] Installing WireGuard..."
if command -v apt-get &> /dev/null; then
  apt-get update && apt-get install -y wireguard wireguard-tools
elif command -v dnf &> /dev/null; then
  dnf install -y wireguard-tools
elif command -v pacman &> /dev/null; then
  pacman -S --noconfirm wireguard-tools
else
  echo "Unsupported package manager. Install WireGuard manually."
  exit 1
fi

# Generate server keys
echo "[2/5] Generating server keys..."
WG_DIR="/etc/wireguard"
mkdir -p "$WG_DIR"
chmod 700 "$WG_DIR"

PRIVATE_KEY=$(wg genkey)
PUBLIC_KEY=$(echo "$PRIVATE_KEY" | wg pubkey)

echo "$PRIVATE_KEY" > "$WG_DIR/server_private.key"
echo "$PUBLIC_KEY" > "$WG_DIR/server_public.key"
chmod 600 "$WG_DIR/server_private.key"

# Get public IP
echo "[3/5] Detecting server IP..."
SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"

# Create WireGuard config
echo "[4/5] Creating WireGuard configuration..."
INTERFACE=$(ip route | grep default | awk '{print $5}' | head -1)

cat > "$WG_DIR/wg0.conf" << EOF
[Interface]
PrivateKey = $PRIVATE_KEY
Address = 10.8.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o $INTERFACE -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o $INTERFACE -j MASQUERADE
SaveConfig = false
EOF

chmod 600 "$WG_DIR/wg0.conf"

# Enable IP forwarding
echo "[5/5] Enabling IP forwarding..."
echo "net.ipv4.ip_forward=1" > /etc/sysctl.d/99-wireguard.conf
sysctl -p /etc/sysctl.d/99-wireguard.conf

# Start WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Server Public Key: $PUBLIC_KEY"
echo "Server IP: $SERVER_IP"
echo "Listen Port: 51820"
echo "VPN Subnet: 10.8.0.0/24"
echo ""
echo "Add these to your ShieldVPN server .env file:"
echo "  WG_SERVER_ENDPOINT=$SERVER_IP"
echo ""
echo "WireGuard status: systemctl status wg-quick@wg0"
