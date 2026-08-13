import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(email, password);
      const routes = { PASSENGER: '/passenger', DRIVER: '/driver', ADMIN: '/admin' };
      navigate(routes[role] || '/');
    } catch {
      // error is set in useAuth
    }
  };

  const demoAccounts = [
    { label: 'Passenger', email: 'passenger@transit.dev', icon: '👤' },
    { label: 'Driver', email: 'driver@transit.dev', icon: '🚌' },
    { label: 'Admin', email: 'admin@transit.dev', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-surface-950 via-surface-900 to-primary-900/20">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚍</div>
          <h1 className="text-3xl font-bold text-surface-100">SmartTransit</h1>
          <p className="text-surface-500 mt-1">Real-time public transport tracking</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-surface-100 mb-6">Sign in to continue</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-400 mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-surface-700/50">
            <p className="text-xs text-surface-500 mb-3 text-center">Quick demo login (password: 123456)</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  className="btn btn-ghost btn-sm flex-col py-2 h-auto"
                  onClick={() => { setEmail(acc.email); setPassword('123456'); }}
                >
                  <span className="text-lg">{acc.icon}</span>
                  <span className="text-xs">{acc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
