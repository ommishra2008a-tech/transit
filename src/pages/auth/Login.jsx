import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Info, User, Bus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
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
      // Error handled by useAuth
    }
  };

  const demoAccounts = [
    { label: 'Passenger', email: 'passenger@transit.dev', icon: User },
    { label: 'Driver', email: 'driver@transit.dev', icon: Bus },
    { label: 'Admin', email: 'admin@transit.dev', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-dvh min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-md mx-auto my-auto animate-slide-up">
        
        {/* Main Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          
          {/* Top Brand Logo */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0047BA] text-white flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0">
              <Bus size={26} strokeWidth={2.2} />
            </div>
            <div className="font-extrabold tracking-tight text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>SMART</span>
              <span>TRANSIT</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center tracking-tight mb-2">
            Sign In to Platform
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center max-w-xs mx-auto mb-6 leading-relaxed">
            Select your role or enter credentials to access your portal
          </p>

          <div className="border-b border-slate-100 dark:border-slate-800 mb-6" />

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <Input
                id="email"
                type="email"
                icon={Mail}
                placeholder="passenger@transit.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-12 text-sm font-mono text-slate-900 dark:text-slate-100 rounded-xl"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="password">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Password for testing is: 123456')}
                  className="text-xs font-mono font-bold text-[#0047BA] dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                icon={Lock}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-12 text-sm font-mono text-slate-900 dark:text-slate-100 rounded-xl"
              />
            </div>

            {/* Access Platform Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 bg-[#0047BA] hover:bg-[#003896] text-white rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-[0.99]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Platform <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Role Switcher Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase text-center mb-4">
              ONE-CLICK DEMO ACCESS
            </p>
            <div className="grid grid-cols-3 gap-3">
              {demoAccounts.map((acc) => {
                const AccIcon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 hover:border-[#0047BA] dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center transition-all cursor-pointer group shadow-2xs"
                    onClick={() => { setEmail(acc.email); setPassword('123456'); }}
                  >
                    <AccIcon size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-[#0047BA] dark:group-hover:text-blue-400 mb-1.5" />
                    <span className="text-xs font-mono font-bold">{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Version Note */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 dark:text-slate-500">
            <Info size={14} />
            <span>SIH25013 Platform Version</span>
          </div>

        </div>

      </div>
    </div>
  );
}
