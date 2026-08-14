import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Bus, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SmartTransitLogo from '../../components/SmartTransitLogo';

export default function Login() {
  const [email, setEmail] = useState('passenger@transit.dev');
  const [password, setPassword] = useState('123456password');
  const [selectedRole, setSelectedRole] = useState('PASSENGER');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(email, password);
      const routes = { PASSENGER: '/passenger', DRIVER: '/driver', ADMIN: '/admin' };
      navigate(routes[role] || '/');
    } catch {
      // Handled by useAuth
    }
  };

  const demoAccounts = [
    { role: 'PASSENGER', label: 'Passenger', email: 'passenger@transit.dev', icon: User },
    { role: 'DRIVER', label: 'Driver', email: 'driver@transit.dev', icon: Bus },
    { role: 'ADMIN', label: 'Admin', email: 'admin@transit.dev', icon: ShieldCheck },
  ];

  const handleRoleSelect = (acc) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword('123456password');
  };

  return (
    <div className="min-h-dvh min-h-screen w-full bg-[#040a17] text-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto relative cinematic-bg">
      {/* Ambient Blue & Coral Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[400px] mx-auto my-auto relative z-10 space-y-6"
      >
        {/* Top Logo & Title (Matched to Screenshot 2) */}
        <div className="flex flex-col items-center justify-center text-center">
          <SmartTransitLogo layout="vertical" />
        </div>

        {/* Card Container (Matched to Screenshot 2) */}
        <div className="bg-[#0e1626]/95 border border-[#1e2a3f] rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-black/60 backdrop-blur-xl">
          
          {/* Quick Role Segmented Selector */}
          <div className="mb-5 p-1 rounded-2xl bg-[#131d31] border border-[#1e2a3f] grid grid-cols-3 gap-1">
            {demoAccounts.map((acc) => {
              const AccIcon = acc.icon;
              const isSelected = selectedRole === acc.role || email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleRoleSelect(acc)}
                  className={`relative py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                    isSelected
                      ? 'text-[#00d2ff] font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="roleSelectorIndicator"
                      className="absolute inset-0 bg-[#0e1626] rounded-xl shadow-xs border border-cyan-500/40"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <AccIcon size={14} className="relative z-10" />
                  <span className="relative z-10">{acc.label}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <Input
                id="email"
                type="email"
                icon={Mail}
                placeholder="commuter@smarttransit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#131d31] border-[#1e2a3f] text-white placeholder:text-slate-500 focus:border-[#00d2ff]"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400" htmlFor="password">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Passwords for testing: 123456password')}
                  className="text-[11px] font-mono font-bold text-[#00d2ff] hover:underline"
                >
                  Forgot?
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
                className="bg-[#131d31] border-[#1e2a3f] text-white placeholder:text-slate-500 focus:border-[#00d2ff]"
              />
            </div>

            {/* Coral Gradient SIGN IN Button (Matched to Screenshot 2) */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="coral"
                size="xl"
                loading={loading}
                className="w-full text-base font-extrabold tracking-wider"
              >
                SIGN IN <ArrowRight size={18} />
              </Button>
            </div>
          </form>

          {/* Footer Text */}
          <div className="mt-6 pt-4 border-t border-[#1e2a3f] text-center text-xs font-medium text-slate-400">
            <span>New to SmartTransit? </span>
            <button
              type="button"
              onClick={() => handleRoleSelect(demoAccounts[0])}
              className="text-[#00d2ff] font-bold hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
