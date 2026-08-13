import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Info, User, Bus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
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
    { label: 'Passenger', email: 'passenger@transit.dev', icon: User, desc: 'Public tracking &\nETAs' },
    { label: 'Driver', email: 'driver@transit.dev', icon: Bus, desc: 'GPS & trip\nstream' },
    { label: 'Admin', email: 'admin@transit.dev', icon: ShieldCheck, desc: 'Fleet control\ncenter' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Navbar for Login Screen */}
      <div className="h-[60px] bg-white border-b border-slate-200 flex items-center px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Bus size={22} className="text-[#0047b3]" strokeWidth={2.5} />
          <span className="text-lg font-bold text-[#0047b3] tracking-wide">SMART TRANSIT</span>
        </div>
      </div>

      {/* Main Content Centered */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-slate-200">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center">
            <div className="w-[60px] h-[60px] rounded-[16px] bg-[#0047b3] flex items-center justify-center shadow-md mb-4">
              <Bus size={32} color="white" strokeWidth={2} />
            </div>
            <h1 className="text-[22px] font-bold text-[#0047b3] tracking-wide mb-3">
              SMART TRANSIT
            </h1>
            <h2 className="text-[22px] font-semibold text-slate-900 mb-2">
              Sign In to Platform
            </h2>
            <p className="text-[15px] text-slate-500 font-medium leading-snug max-w-[320px]">
              Select your role or enter credentials to access your portal
            </p>
          </div>

          <div className="w-full h-px bg-slate-100 my-6" />

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-[12px] font-semibold tracking-[0.1em] uppercase text-slate-600" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="driver@transit.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[48px] bg-[#f8fafc] border border-slate-300 rounded-[12px] pl-[44px] pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0047b3] focus:ring-1 focus:ring-[#0047b3] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-semibold tracking-[0.1em] uppercase text-slate-600" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Password for testing is: 123456')}
                  className="text-[13px] font-medium text-[#0047b3] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock size={20} strokeWidth={1.5} />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-[48px] bg-[#f8fafc] border border-slate-300 rounded-[12px] pl-[44px] pr-4 text-[24px] tracking-widest text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal outline-none focus:border-[#0047b3] focus:ring-1 focus:ring-[#0047b3] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-[48px] rounded-[12px] bg-[#0047b3] hover:bg-[#003380] text-white text-[16px] font-semibold transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Access Platform <ArrowRight size={20} strokeWidth={2} />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="w-full h-px bg-slate-100 mt-8 mb-6 relative flex items-center justify-center">
            <span className="absolute bg-white px-4 text-[12px] font-semibold tracking-[0.1em] text-slate-500 uppercase">
              One-Click Demo Access
            </span>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map((acc) => {
              const AccIcon = acc.icon;
              return (
                <button
                  key={acc.email}
                  type="button"
                  className="h-[96px] rounded-[12px] bg-white border border-slate-300 hover:border-[#0047b3] hover:bg-blue-50 text-slate-700 hover:text-[#0047b3] flex flex-col items-center justify-center transition-all cursor-pointer group px-1"
                  onClick={() => { setEmail(acc.email); setPassword('123456'); }}
                >
                  <AccIcon size={22} strokeWidth={1.5} className="text-slate-800 group-hover:text-[#0047b3] mb-2" />
                  <span className="text-[13px] font-bold text-slate-900 mb-1">{acc.label}</span>
                  <span className="text-[10px] text-slate-500 text-center leading-[1.15] whitespace-pre-line">
                    {acc.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-slate-500 font-medium">
            <Info size={14} />
            <span>SIH25013 Platform Version</span>
          </div>

        </div>
      </div>
    </div>
  );
}
