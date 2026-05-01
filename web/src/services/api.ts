const API_BASE = '/api/v1';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('shieldvpn_token', token);
    } else {
      localStorage.removeItem('shieldvpn_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('shieldvpn_token');
    }
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const token = this.getToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(email: string, username: string, password: string) {
    return this.request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: { email, username, password },
    });
  }

  async login(username: string, password: string) {
    return this.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  async getProfile() {
    return this.request<User>('/auth/me');
  }

  // Servers
  async getServers(country?: string) {
    const params = country ? `?country=${country}` : '';
    return this.request<Server[]>(`/servers/${params}`);
  }

  async getServer(uuid: string) {
    return this.request<Server>(`/servers/${uuid}`);
  }

  // Peers
  async getPeers() {
    return this.request<Peer[]>('/peers/');
  }

  async createPeer(name: string, deviceType: string, serverUuid: string) {
    return this.request<PeerConfig>('/peers/', {
      method: 'POST',
      body: { name, device_type: deviceType, server_uuid: serverUuid },
    });
  }

  async deletePeer(uuid: string) {
    return this.request<void>(`/peers/${uuid}`, { method: 'DELETE' });
  }

  async togglePeer(uuid: string, isActive: boolean) {
    return this.request<Peer>(`/peers/${uuid}/toggle`, {
      method: 'PATCH',
      body: { is_active: isActive },
    });
  }

  async getPeerConfig(uuid: string) {
    return this.request<PeerConfig>(`/peers/${uuid}/config`);
  }
}

// Types
export interface User {
  uuid: string;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  max_devices: number;
  subscription_plan: string;
  avatar_url: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Server {
  uuid: string;
  name: string;
  country: string;
  city: string;
  country_code: string;
  is_active: boolean;
  is_premium: boolean;
  load: number;
  current_clients: number;
  max_clients: number;
  latitude: number | null;
  longitude: number | null;
}

export interface Peer {
  uuid: string;
  name: string;
  device_type: string;
  public_key: string;
  assigned_ip: string;
  is_active: boolean;
  last_handshake: string | null;
  total_rx: number;
  total_tx: number;
  server_uuid: string;
  created_at: string;
}

export interface PeerConfig {
  config_text: string;
  qr_code_base64: string | null;
}

export const api = new ApiClient();
