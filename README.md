# ShieldVPN

A full-stack, cross-platform VPN solution built on **WireGuard** — the modern, high-performance VPN protocol.

![ShieldVPN](https://img.shields.io/badge/Protocol-WireGuard-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Platform](https://img.shields.io/badge/Platform-Cross--Platform-orange)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ShieldVPN                         │
├──────────┬──────────┬──────────┬────────────────────┤
│  Server  │   Web    │ Desktop  │      Mobile        │
│ (FastAPI)│ (React)  │(Electron)│  (React Native)    │
├──────────┴──────────┴──────────┴────────────────────┤
│              WireGuard Protocol Layer                │
└─────────────────────────────────────────────────────┘
```

### Components

| Component | Tech Stack | Description |
|-----------|-----------|-------------|
| **Server** | Python, FastAPI, SQLAlchemy, WireGuard | REST API for user auth, server management, peer/device management |
| **Web** | React, TypeScript, Vite, Tailwind CSS | Admin dashboard & user management panel |
| **Desktop** | Electron, React, TypeScript, Tailwind CSS | Native desktop client with system tray, kill switch, split tunneling |
| **Mobile** | React Native, Expo, TypeScript | iOS & Android client with native VPN tunnel support |

## Features

- **WireGuard Protocol** — Fast, modern, cryptographically sound
- **User Authentication** — JWT-based auth with registration/login
- **Multi-Server Support** — Connect to servers worldwide with real-time load info
- **Device Management** — Register and manage multiple devices per account
- **QR Code Config** — Scan to import WireGuard config on mobile
- **Kill Switch** — Block internet traffic if VPN connection drops
- **Split Tunneling** — Choose which apps route through the VPN
- **Auto Connect** — Automatically connect on app startup
- **Subscription Plans** — Free, Pro, and Enterprise tiers
- **Admin Dashboard** — Server management, user oversight, analytics

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- WireGuard tools (`wg`, `wg-quick`) — for production server
- Docker (optional, for containerized deployment)

### Server

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env  # Edit with your settings
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000` with interactive docs at `/docs`.

### Web Dashboard

```bash
cd web
npm install
npm run dev
```

Opens at `http://localhost:5173`. The dev server proxies API requests to the backend.

### Desktop App

```bash
cd desktop
npm install
npm run dev          # Web preview
npm run electron:dev # Full Electron app
npm run electron:build # Package for distribution
```

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS / `a` for Android simulator.

## Project Structure

```
vpn-app/
├── server/                 # FastAPI backend
│   ├── app/
│   │   ├── api/           # REST API endpoints
│   │   │   ├── auth.py    # Authentication (register, login, profile)
│   │   │   ├── servers.py # VPN server CRUD
│   │   │   ├── peers.py   # Device/peer management
│   │   │   └── router.py  # API router
│   │   ├── core/          # Configuration & utilities
│   │   │   ├── config.py  # App settings (env-based)
│   │   │   ├── database.py# Async SQLAlchemy setup
│   │   │   └── security.py# JWT & password hashing
│   │   ├── models/        # Database models
│   │   │   ├── user.py    # User model
│   │   │   ├── server.py  # VPN server model
│   │   │   └── peer.py    # WireGuard peer model
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/      # Business logic
│   │   │   ├── auth.py    # Auth dependencies
│   │   │   └── wireguard.py # WireGuard key gen, config, IP allocation
│   │   └── main.py        # FastAPI app entry point
│   └── pyproject.toml
├── web/                    # React web dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Dashboard, Servers, Devices, Account)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client
│   │   └── styles/        # Global styles (Tailwind)
│   └── package.json
├── desktop/                # Electron desktop app
│   ├── src/
│   │   ├── main/          # Electron main process
│   │   └── renderer/      # React renderer (UI)
│   └── package.json
├── mobile/                 # React Native mobile app
│   ├── src/
│   ├── App.tsx            # Main app component
│   └── package.json
├── scripts/               # Deployment & utility scripts
└── docs/                  # Additional documentation
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/v1/auth/register` | Create new account |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/me` | Get current user profile |
| PATCH | `/api/v1/auth/me` | Update profile |
| POST | `/api/v1/auth/change-password` | Change password |

### Servers
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/v1/servers/` | List all servers |
| GET | `/api/v1/servers/{uuid}` | Get server details |
| POST | `/api/v1/servers/` | Create server (admin) |
| PATCH | `/api/v1/servers/{uuid}` | Update server (admin) |
| DELETE | `/api/v1/servers/{uuid}` | Delete server (admin) |

### Peers (Devices)
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/v1/peers/` | List user's devices |
| POST | `/api/v1/peers/` | Register new device (returns WireGuard config + QR) |
| GET | `/api/v1/peers/{uuid}` | Get device details |
| PATCH | `/api/v1/peers/{uuid}/toggle` | Enable/disable device |
| DELETE | `/api/v1/peers/{uuid}` | Remove device |
| GET | `/api/v1/peers/{uuid}/config` | Re-download WireGuard config |

## Deployment

### Server Deployment

1. Set up a VPS with WireGuard installed
2. Configure environment variables in `.env`
3. Run with `uvicorn app.main:app --host 0.0.0.0 --port 8000`
4. Set up nginx as a reverse proxy with SSL

### Desktop Distribution

```bash
cd desktop
npm run electron:build
```

Produces platform-specific installers in `desktop/release/`.

### Mobile Distribution

Use Expo EAS Build for production builds:

```bash
cd mobile
npx eas build --platform all
```

## Security

- All traffic encrypted with WireGuard (ChaCha20, Curve25519, BLAKE2s)
- JWT tokens for API authentication
- Passwords hashed with bcrypt
- Preshared keys for additional peer security
- No logging of user traffic

## License

MIT License — see [LICENSE](LICENSE) for details.
