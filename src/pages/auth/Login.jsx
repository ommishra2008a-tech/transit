import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Info, User, Bus, ShieldCheck, Activity, Radio, MapPin } from 'lucide-react';
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
      // Error handled by useAuth
    }
  };

  const demoAccounts = [
    { label: 'Passenger', email: 'passenger@transit.dev', icon: User, desc: 'Public tracking & ETAs' },
    { label: 'Driver', email: 'driver@transit.dev', icon: Bus, desc: 'GPS & trip stream' },
    { label: 'Admin', email: 'admin@transit.dev', icon: ShieldCheck, desc: 'Fleet control center' },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-auto mb-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-4 sm:py-8 animate-slide-up">
        
        {/* Left Enterprise Mobility Graphic Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-slate-800 min-h-[540px]">
          {/* Background ambient lighting */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl" />

          {/* Top Brand Tagline */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider uppercase mb-6">
              <Activity size={14} className="animate-pulse" />
              Real-Time Transport Platform
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Next-Generation Public Transit Management
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Empowering small cities with real-time bus tracking, automated ETA calculations, driver telemetry, and fleet operations control.
            </p>
          </div>

          {/* Mid Metric Preview Box */}
          <div className="relative z-10 grid grid-cols-3 gap-3 my-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <div className="text-left">
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <Radio size={12} className="animate-pulse" /> Live
              </div>
              <p className="text-xl font-extrabold text-white mt-1">100%</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">SSE Realtime</p>
            </div>
            <div className="text-left border-l border-slate-700/60 pl-3">
              <div className="flex items-center gap-1 text-blue-400 text-xs font-bold">
                <MapPin size={12} /> Routes
              </div>
              <p className="text-xl font-extrabold text-white mt-1">Indore</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Smart City</p>
            </div>
            <div className="text-left border-l border-slate-700/60 pl-3">
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Bus size={12} /> Fleet
              </div>
              <p className="text-xl font-extrabold text-white mt-1">Solarch</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">BaaS Engine</p>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Powered by Solarch TypeScript BaaS</span>
            <span className="text-slate-500 font-mono">v1.0.0</span>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="lg:col-span-6 w-full">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 text-slate-900">
            {/* Logo Header */}
            <div className="flex justify-center mb-6">
              <div className="bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100/80">
                <SmartTransitLogo layout="horizontal" className="h-9" />
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 text-center tracking-tight mb-2">
              Sign In to Platform
            </h1>
            <p className="text-xs font-medium text-slate-500 text-center mb-6">
              Select your role or enter credentials to access your portal
            </p>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  icon={Mail}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo Password for testing is: 123456')}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full rounded-2xl h-12 text-sm font-extrabold shadow-md shadow-blue-600/20 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Access Platform <ArrowRight size={18} className="ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Quick Role Switcher Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase text-center mb-3">
                ONE-CLICK DEMO ACCESS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {demoAccounts.map((acc) => {
                  const AccIcon = acc.icon;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 flex flex-col items-center justify-center transition-all cursor-pointer group"
                      onClick={() => { setEmail(acc.email); setPassword('123456'); }}
                    >
                      <AccIcon size={18} className="text-slate-500 group-hover:text-blue-700 mb-1" />
                      <span className="text-xs font-bold">{acc.label}</span>
                      <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{acc.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <Info size={14} />
              <span>SIH25013 Platform Version</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
