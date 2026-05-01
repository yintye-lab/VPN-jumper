import { Power } from 'lucide-react';
import { clsx } from 'clsx';

interface ConnectionToggleProps {
  connected: boolean;
  connecting: boolean;
  onToggle: () => void;
  serverName?: string;
}

export default function ConnectionToggle({
  connected,
  connecting,
  onToggle,
  serverName,
}: ConnectionToggleProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={onToggle}
        disabled={connecting}
        className={clsx(
          'relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500',
          connected
            ? 'bg-green-600/20 ring-4 ring-green-500 shadow-[0_0_60px_rgba(34,197,94,0.3)]'
            : 'bg-gray-800 ring-4 ring-gray-700 hover:ring-brand-500 hover:shadow-[0_0_60px_rgba(51,141,252,0.2)]',
          connecting && 'animate-pulse'
        )}
      >
        <Power
          className={clsx(
            'w-16 h-16 transition-colors',
            connected ? 'text-green-400' : 'text-gray-500'
          )}
        />
      </button>

      <div className="text-center">
        <p className={clsx('text-lg font-semibold', connected ? 'text-green-400' : 'text-gray-400')}>
          {connecting ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'}
        </p>
        {serverName && connected && (
          <p className="text-sm text-gray-500 mt-1">{serverName}</p>
        )}
      </div>
    </div>
  );
}
