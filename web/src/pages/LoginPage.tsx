import { useState } from 'react';
import { Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<unknown>;
  onRegister: (email: string, username: string, password: string) => Promise<unknown>;
}

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await onRegister(email, username, password);
      } else {
        await onLogin(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 mb-4">
            <Shield className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold">ShieldVPN</h1>
          <p className="text-gray-400 mt-2">Secure, fast, private browsing</p>
        </div>

        <div className="card">
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                !isRegister ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                isRegister ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
