import { useState } from 'react';
import {
  Shield, Globe, ChevronDown, Settings, Power, Minus, X, Square,
  ArrowDownUp, Timer, Wifi,
} from 'lucide-react';
import { clsx } from 'clsx';

interface VPNServer {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  load: number;
  ping: number;
}

const SERVERS: VPNServer[] = [
  { id: '1', name: 'US East', country: 'United States', city: 'New York', flag: '\u{1F1FA}\u{1F1F8}', load: 23, ping: 15 },
  { id: '2', name: 'US West', country: 'United States', city: 'Los Angeles', flag: '\u{1F1FA}\u{1F1F8}', load: 35, ping: 42 },
  { id: '3', name: 'UK London', country: 'United Kingdom', city: 'London', flag: '\u{1F1EC}\u{1F1E7}', load: 45, ping: 89 },
  { id: '4', name: 'DE Frankfurt', country: 'Germany', city: 'Frankfurt', flag: '\u{1F1E9}\u{1F1EA}', load: 18, ping: 95 },
  { id: '5', name: 'JP Tokyo', country: 'Japan', city: 'Tokyo', flag: '\u{1F1EF}\u{1F1F5}', load: 52, ping: 142 },
  { id: '6', name: 'SG Singapore', country: 'Singapore', city: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}', load: 31, ping: 168 },
  { id: '7', name: 'AU Sydney', country: 'Australia', city: 'Sydney', flag: '\u{1F1E6}\u{1F1FA}', load: 28, ping: 195 },
  { id: '8', name: 'CA Toronto', country: 'Canada', city: 'Toronto', flag: '\u{1F1E8}\u{1F1E6}', load: 15, ping: 22 },
];

export default function App() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]!);
  const [showServers, setShowServers] = useState(false);
  const [duration, setDuration] = useState(0);

  const handleToggle = () => {
    if (connected) {
      setConnected(false);
      setDuration(0);
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      const interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-semibold">ShieldVPN</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
            <Minus className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
            <Square className="w-3 h-3 text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-red-900/50 rounded transition-colors group">
            <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Connection status */}
        <div className="text-center space-y-6">
          <div
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium',
              connected ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-400 border border-gray-700'
            )}
          >
            <span className={clsx('w-2 h-2 rounded-full', connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500')} />
            {connecting ? 'Connecting...' : connected ? 'Protected' : 'Not Protected'}
          </div>

          {/* Power button */}
          <button
            onClick={handleToggle}
            disabled={connecting}
            className={clsx(
              'mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700',
              connected
                ? 'bg-green-600/10 ring-[3px] ring-green-500 shadow-[0_0_80px_rgba(34,197,94,0.25)]'
                : 'bg-gray-800/50 ring-[3px] ring-gray-700 hover:ring-brand-500 hover:shadow-[0_0_60px_rgba(51,141,252,0.15)]',
              connecting && 'animate-pulse ring-brand-500'
            )}
          >
            <Power className={clsx('w-12 h-12', connected ? 'text-green-400' : 'text-gray-500')} />
          </button>

          {/* Stats */}
          {connected && (
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Timer className="w-4 h-4" />
                <span className="font-mono">{formatDuration(duration)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Wifi className="w-4 h-4 text-green-400" />
                <span>{selectedServer.ping}ms</span>
              </div>
            </div>
          )}
        </div>

        {/* Server selector */}
        <div className="card">
          <button
            onClick={() => setShowServers(!showServers)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{selectedServer.flag}</span>
              <div className="text-left">
                <p className="font-medium text-sm">{selectedServer.name}</p>
                <p className="text-xs text-gray-500">{selectedServer.city}, {selectedServer.country}</p>
              </div>
            </div>
            <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', showServers && 'rotate-180')} />
          </button>

          {showServers && (
            <div className="mt-4 space-y-1 max-h-64 overflow-y-auto">
              {SERVERS.map((server) => (
                <button
                  key={server.id}
                  onClick={() => {
                    setSelectedServer(server);
                    setShowServers(false);
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-sm',
                    selectedServer.id === server.id ? 'bg-brand-600/20 text-brand-300' : 'hover:bg-gray-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span>{server.flag}</span>
                    <div className="text-left">
                      <p className="font-medium">{server.name}</p>
                      <p className="text-xs text-gray-500">{server.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{server.ping}ms</span>
                    <span className={server.load < 40 ? 'text-green-400' : server.load < 70 ? 'text-yellow-400' : 'text-red-400'}>
                      {server.load}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick settings */}
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Quick Settings</h3>
          <ToggleRow icon={Shield} label="Kill Switch" description="Block internet if VPN drops" defaultOn />
          <ToggleRow icon={ArrowDownUp} label="Split Tunneling" description="Choose which apps use VPN" />
          <ToggleRow icon={Globe} label="Auto Connect" description="Connect on startup" defaultOn />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span>WireGuard Protocol</span>
        <button className="flex items-center gap-1 hover:text-gray-300 transition-colors">
          <Settings className="w-3.5 h-3.5" /> Settings
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, description, defaultOn }: {
  icon: typeof Shield;
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultOn || false);

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={clsx(
          'w-10 h-5 rounded-full transition-colors relative',
          enabled ? 'bg-brand-600' : 'bg-gray-700'
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}
