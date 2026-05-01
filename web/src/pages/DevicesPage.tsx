import { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import DeviceCard from '../components/DeviceCard';
import { api } from '../services/api';
import type { Peer, PeerConfig, Server } from '../services/api';

export default function DevicesPage() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showConfig, setShowConfig] = useState<PeerConfig | null>(null);
  const [newDevice, setNewDevice] = useState({ name: '', device_type: 'desktop', server_uuid: '' });

  const loadData = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([api.getPeers(), api.getServers()]);
      setPeers(p);
      setServers(s);
      if (s.length > 0 && !newDevice.server_uuid) {
        setNewDevice((d) => ({ ...d, server_uuid: s[0]?.uuid ?? '' }));
      }
    } catch {
      // ignored
    } finally {
      setLoading(false);
    }
  }, [newDevice.server_uuid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = await api.createPeer(newDevice.name, newDevice.device_type, newDevice.server_uuid);
      setShowConfig(config);
      setShowAdd(false);
      setNewDevice({ name: '', device_type: 'desktop', server_uuid: servers[0]?.uuid ?? '' });
      await loadData();
    } catch {
      // ignored
    }
  };

  const handleToggle = async (uuid: string, active: boolean) => {
    await api.togglePeer(uuid, active);
    await loadData();
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm('Remove this device? The WireGuard config will stop working.')) return;
    await api.deletePeer(uuid);
    await loadData();
  };

  const handleShowConfig = async (uuid: string) => {
    const config = await api.getPeerConfig(uuid);
    setShowConfig(config);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Devices</h1>
          <p className="text-gray-400 mt-1">Manage your connected devices</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Device
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading devices...</div>
      ) : peers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">No devices registered yet</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            Add Your First Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {peers.map((peer) => (
            <DeviceCard
              key={peer.uuid}
              peer={peer}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onShowConfig={handleShowConfig}
            />
          ))}
        </div>
      )}

      {/* Add Device Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add New Device">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Device Name</label>
              <input
                type="text"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                className="input-field"
                placeholder="My Laptop"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Device Type</label>
              <select
                value={newDevice.device_type}
                onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })}
                className="input-field"
              >
                <option value="desktop">Desktop</option>
                <option value="laptop">Laptop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Server</label>
              <select
                value={newDevice.server_uuid}
                onChange={(e) => setNewDevice({ ...newDevice, server_uuid: e.target.value })}
                className="input-field"
              >
                {servers.map((s) => (
                  <option key={s.uuid} value={s.uuid}>
                    {s.name} - {s.city}, {s.country}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Create Device
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Config Modal */}
      {showConfig && (
        <Modal onClose={() => setShowConfig(null)} title="WireGuard Configuration">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Configuration File
              </label>
              <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-green-400 overflow-x-auto font-mono">
                {showConfig.config_text}
              </pre>
            </div>
            {showConfig.qr_code_base64 && (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Scan with WireGuard mobile app</p>
                <img
                  src={`data:image/png;base64,${showConfig.qr_code_base64}`}
                  alt="QR Code"
                  className="mx-auto w-48 h-48 rounded-lg"
                />
              </div>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(showConfig.config_text);
              }}
              className="btn-primary w-full"
            >
              Copy Configuration
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
