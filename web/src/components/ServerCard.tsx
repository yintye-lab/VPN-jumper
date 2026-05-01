import { Globe, Users, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import type { Server } from '../services/api';

interface ServerCardProps {
  server: Server;
  selected?: boolean;
  onSelect?: (server: Server) => void;
}

function getLoadColor(load: number): string {
  if (load < 40) return 'text-green-400';
  if (load < 70) return 'text-yellow-400';
  return 'text-red-400';
}

function getLoadBg(load: number): string {
  if (load < 40) return 'bg-green-400';
  if (load < 70) return 'bg-yellow-400';
  return 'bg-red-400';
}

const FLAG_EMOJI: Record<string, string> = {
  US: '\u{1F1FA}\u{1F1F8}', DE: '\u{1F1E9}\u{1F1EA}', GB: '\u{1F1EC}\u{1F1E7}',
  JP: '\u{1F1EF}\u{1F1F5}', SG: '\u{1F1F8}\u{1F1EC}', NL: '\u{1F1F3}\u{1F1F1}',
  CA: '\u{1F1E8}\u{1F1E6}', AU: '\u{1F1E6}\u{1F1FA}', FR: '\u{1F1EB}\u{1F1F7}',
  CH: '\u{1F1E8}\u{1F1ED}', SE: '\u{1F1F8}\u{1F1EA}', BR: '\u{1F1E7}\u{1F1F7}',
  IN: '\u{1F1EE}\u{1F1F3}', KR: '\u{1F1F0}\u{1F1F7}',
};

export default function ServerCard({ server, selected, onSelect }: ServerCardProps) {
  const flag = FLAG_EMOJI[server.country_code] || '\u{1F310}';

  return (
    <button
      onClick={() => onSelect?.(server)}
      className={clsx(
        'card w-full text-left transition-all hover:border-brand-700 cursor-pointer',
        selected && 'border-brand-500 ring-1 ring-brand-500'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{flag}</span>
          <div>
            <h3 className="font-semibold text-gray-100">{server.name}</h3>
            <p className="text-sm text-gray-400">{server.city}, {server.country}</p>
          </div>
        </div>
        {server.is_premium && (
          <span className="badge-yellow flex items-center gap-1">
            <Zap className="w-3 h-3" /> Premium
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>{server.current_clients}/{server.max_clients}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className={clsx('w-4 h-4', getLoadColor(server.load))} />
          <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all', getLoadBg(server.load))}
              style={{ width: `${Math.min(server.load, 100)}%` }}
            />
          </div>
          <span className={clsx('text-xs', getLoadColor(server.load))}>{server.load}%</span>
        </div>
      </div>
    </button>
  );
}
