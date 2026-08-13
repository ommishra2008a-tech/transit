import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Info, User, Bus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SmartTransitLogo from '../../components/SmartTransitLogo';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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
      // Error managed in useAuth
    }
  };

  const demoAccounts = [
    { label: 'Passenger', email: 'passenger@transit.dev', icon: User },
    { label: 'Driver', email: 'driver@transit.dev', icon: Bus },
    { label: 'Admin', email: 'admin@transit.dev', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 py-10 overflow-y-auto">
      <div className="w-full max-w-md my-auto animate-slide-up">
        {/* Main Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {/* Logo Badge Container */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary-50 px-5 py-3 rounded-2xl border border-primary-100/80">
              <SmartTransitLogo layout="horizontal" className="h-9" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-950 text-center tracking-tight mb-6 leading-tight">
            Welcome to Smart<br />Transit
          </h1>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                icon={Mail}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Password is: 123456')}
                  className="text-xs font-semibold text-primary-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                icon={Lock}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full rounded-full h-12 text-base font-bold shadow-md shadow-primary-700/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Login <ArrowRight size={18} className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <Info size={14} className="text-slate-400" />
            <span>12-Hour MVP Demo Version</span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase text-center mb-3">
              QUICK DEMO ACCOUNTS
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => {
                const AccIcon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 text-slate-700 hover:text-primary-700 flex flex-col items-center justify-center transition-all cursor-pointer group"
                    onClick={() => { setEmail(acc.email); setPassword('123456'); }}
                  >
                    <AccIcon size={18} className="text-slate-500 group-hover:text-primary-700 mb-1" />
                    <span className="text-xs font-semibold">{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
