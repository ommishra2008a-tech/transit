import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Info, User, Bus, ShieldCheck, Sparkles } from 'lucide-react';
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
      // Error handled by useAuth
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
    <div className="min-h-dvh min-h-screen w-full bg-slate-50 dark:bg-[#070b14] flex items-center justify-center p-4 sm:p-6 overflow-y-auto relative ambient-glow">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[420px] mx-auto my-auto relative z-10"
      >
        {/* Full Page Centered Login Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          
          {/* Top Brand Logo Header */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <SmartTransitLogo layout="vertical" />
          </div>

          {/* Role Segmented Selector */}
          <div className="mb-6 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-3 gap-1">
            {demoAccounts.map((acc) => {
              const AccIcon = acc.icon;
              const isSelected = selectedRole === acc.role || email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleRoleSelect(acc)}
                  className={`relative py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                    isSelected
                      ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="roleSelectorIndicator"
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <AccIcon size={16} className="relative z-10" />
                  <span className="relative z-10">{acc.label}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="email">
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
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="password">
                  PASSWORD
                </label>
              </div>
              <Input
                id="password"
                type="password"
                icon={Lock}
                placeholder="••••••"
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
                loading={loading}
                className="w-full h-12 text-sm shadow-md"
              >
                Sign In to Platform <ArrowRight size={18} />
              </Button>
            </div>
          </form>

          {/* Quick Info / Security Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-500 animate-pulse" />
              <span>SIH25013 Platform</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
              v2.0 RELEASE
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
