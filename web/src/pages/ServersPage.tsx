import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ServerCard from '../components/ServerCard';
import { api } from '../services/api';
import type { Server } from '../services/api';

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [search, setSearch] = useState('');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getServers()
      .then(setServers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = servers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Servers</h1>
        <p className="text-gray-400 mt-1">Browse and connect to VPN servers worldwide</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
          placeholder="Search by name, country, or city..."
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading servers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {search ? 'No servers match your search' : 'No servers available'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((server) => (
            <ServerCard
              key={server.uuid}
              server={server}
              selected={selectedServer?.uuid === server.uuid}
              onSelect={setSelectedServer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
