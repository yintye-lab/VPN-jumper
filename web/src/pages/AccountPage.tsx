import { Shield, Mail, User as UserIcon, Calendar, Crown } from 'lucide-react';
import type { User } from '../services/api';

interface AccountPageProps {
  user: User;
}

export default function AccountPage({ user }: AccountPageProps) {
  const planColors: Record<string, string> = {
    free: 'badge-blue',
    pro: 'badge-yellow',
    enterprise: 'badge-green',
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-gray-400 mt-1">Manage your profile and subscription</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-2xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <span className={planColors[user.subscription_plan] || 'badge-blue'}>
              {user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1)} Plan
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={UserIcon} label="Username" value={user.username} />
          <InfoRow icon={Shield} label="Max Devices" value={String(user.max_devices)} />
          <InfoRow icon={Crown} label="Plan" value={user.subscription_plan} />
          <InfoRow icon={Calendar} label="Member Since" value={new Date(user.created_at).toLocaleDateString()} />
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Subscription Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlanCard
            name="Free"
            price="$0"
            features={['3 devices', '5 server locations', 'Basic support']}
            current={user.subscription_plan === 'free'}
          />
          <PlanCard
            name="Pro"
            price="$9.99"
            features={['10 devices', 'All servers', 'Priority support', 'Kill switch']}
            current={user.subscription_plan === 'pro'}
            highlighted
          />
          <PlanCard
            name="Enterprise"
            price="$29.99"
            features={['Unlimited devices', 'Dedicated servers', '24/7 support', 'Custom DNS']}
            current={user.subscription_plan === 'enterprise'}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  current,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  current?: boolean;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        highlighted
          ? 'border-brand-500 bg-brand-950/50'
          : current
          ? 'border-green-700 bg-green-950/30'
          : 'border-gray-800 bg-gray-900'
      }`}
    >
      <h4 className="font-semibold text-lg">{name}</h4>
      <p className="text-2xl font-bold mt-1">
        {price}
        <span className="text-sm font-normal text-gray-400">/mo</span>
      </p>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="text-sm text-gray-400 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-brand-500" />
            {f}
          </li>
        ))}
      </ul>
      {current ? (
        <button className="btn-secondary w-full mt-4 text-sm" disabled>
          Current Plan
        </button>
      ) : (
        <button className={`w-full mt-4 text-sm ${highlighted ? 'btn-primary' : 'btn-secondary'}`}>
          Upgrade
        </button>
      )}
    </div>
  );
}
