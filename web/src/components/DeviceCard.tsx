import { Monitor, Smartphone, Tablet, Laptop, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { Peer } from '../services/api';

interface DeviceCardProps {
  peer: Peer;
  onToggle: (uuid: string, active: boolean) => void;
  onDelete: (uuid: string) => void;
  onShowConfig: (uuid: string) => void;
}

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  laptop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
};

export default function DeviceCard({ peer, onToggle, onDelete, onShowConfig }: DeviceCardProps) {
  const Icon = DEVICE_ICONS[peer.device_type] || Monitor;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            peer.is_active ? 'bg-brand-600/20' : 'bg-gray-800'
          )}>
            <Icon className={clsx('w-5 h-5', peer.is_active ? 'text-brand-400' : 'text-gray-500')} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">{peer.name}</h3>
            <p className="text-xs text-gray-500">{peer.assigned_ip}</p>
          </div>
        </div>
        <span className={peer.is_active ? 'badge-green' : 'badge-red'}>
          {peer.is_active ? 'Active' : 'Disabled'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-gray-500">Download</p>
          <p className="text-gray-200 font-mono">{formatBytes(peer.total_rx)}</p>
        </div>
        <div>
          <p className="text-gray-500">Upload</p>
          <p className="text-gray-200 font-mono">{formatBytes(peer.total_tx)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
        <button
          onClick={() => onToggle(peer.uuid, !peer.is_active)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          {peer.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
          {peer.is_active ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => onShowConfig(peer.uuid)}
          className="text-sm text-brand-400 hover:text-brand-300 transition-colors ml-auto"
        >
          Config
        </button>
        <button
          onClick={() => onDelete(peer.uuid)}
          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
