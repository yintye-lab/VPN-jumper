import { useState, useEffect } from 'react';
import { Shield, Globe, Monitor, Activity } from 'lucide-react';
import ConnectionToggle from '../components/ConnectionToggle';
import { api } from '../services/api';
import type { Server, Peer } from '../services/api';

export default function DashboardPage() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  useEffect(() => {
    Promise.all([api.getServers(), api.getPeers()])
      .then(([s, p]) => {
        setServers(s);
        setPeers(p);
        if (s.length > 0) setSelectedServer(s[0] ?? null);
      })
      .catch(() => {});
  }, []);

  const handleToggle = () => {
    if (connected) {
      setConnected(false);
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1500);
  };

  const activePeers = peers.filter((p) => p.is_active).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage your VPN connection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Shield} label="Status" value={connected ? 'Protected' : 'Unprotected'} color={connected ? 'green' : 'red'} />
        <StatCard icon={Globe} label="Servers" value={String(servers.length)} color="blue" />
        <StatCard icon={Monitor} label="Devices" value={String(activePeers)} color="brand" />
        <StatCard icon={Activity} label="Uptime" value={connected ? 'Active' : '--'} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card flex items-center justify-center py-12">
          <ConnectionToggle
            connected={connected}
            connecting={connecting}
            onToggle={handleToggle}
            serverName={selectedServer?.name}
          />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Connect</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {servers.slice(0, 6).map((server) => (
              <button
                key={server.uuid}
                onClick={() => setSelectedServer(server)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  selectedServer?.uuid === server.uuid
                    ? 'bg-brand-600/20 border border-brand-700'
                    : 'bg-gray-800 hover:bg-gray-750 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{server.name}</p>
                    <p className="text-xs text-gray-500">{server.city}, {server.country}</p>
                  </div>
                </div>
                <span className={`text-xs ${server.load < 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {server.load}%
                </span>
              </button>
            ))}
            {servers.length === 0 && (
              <p className="text-center text-gray-500 py-8">No servers available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: typeof Shield;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorMap: Record<string, string> = {
    green: 'text-green-400 bg-green-900/20',
    red: 'text-red-400 bg-red-900/20',
    blue: 'text-blue-400 bg-blue-900/20',
    brand: 'text-brand-400 bg-brand-900/20',
    yellow: 'text-yellow-400 bg-yellow-900/20',
  };
  const classes = colorMap[color] || colorMap['blue'];
  const [textColor] = (classes ?? '').split(' ');

  return (
    <div className="card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${classes}`}>
        <Icon className={`w-5 h-5 ${textColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}
