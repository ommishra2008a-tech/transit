import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Bus, ShieldCheck, ArrowRight, Sparkles, X, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SmartTransitLogo from '../../components/SmartTransitLogo';

export default function Login() {
  const [email, setEmail] = useState('passenger@transit.dev');
  const [password, setPassword] = useState('123456password');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);
  
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  // Role credentials mapping
  const roleAccounts = {
    PASSENGER: { email: 'passenger@transit.dev', label: 'Passenger Portal', route: '/passenger', icon: User, desc: 'Track live buses, view arrival ETAs & station stops' },
    DRIVER: { email: 'driver@transit.dev', label: 'Driver Cockpit', route: '/driver', icon: Bus, desc: 'Stream live GPS telemetry & broadcast active trips' },
    ADMIN: { email: 'admin@transit.dev', label: 'Fleet Admin Console', route: '/admin', icon: ShieldCheck, desc: 'Manage city fleet, assign drivers & route corridors' },
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    // Open role selection modal as requested by user audio prompt
    setShowRoleModal(true);
  };

  const executeLoginForRole = async (roleKey) => {
    setShowRoleModal(false);
    const targetAccount = roleAccounts[roleKey];
    try {
      const activeRole = await login(targetAccount.email, password);
      navigate(roleAccounts[activeRole]?.route || targetAccount.route);
    } catch {
      // Handled by useAuth
    }
  };

  return (
    <div className="min-h-dvh min-h-screen w-full bg-[#040a17] text-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto relative cinematic-bg">
      {/* Ambient Blue & Coral Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[420px] mx-auto my-auto relative z-10 space-y-5"
      >
        {/* Top Logo with Lighting Effect & Bounce */}
        <div className="flex flex-col items-center justify-center text-center">
          <SmartTransitLogo layout="vertical" />
        </div>

        {/* Feature Overview Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-[#0a1220]/90 border border-[#1b2a42] text-xs text-slate-300 flex items-center gap-3 shadow-lg backdrop-blur-md"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-[#00d2ff] flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-extrabold text-white text-xs">Real-Time Public Transit Tracking</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Live bus telemetry, SSE arrival ETAs, & route navigation.</p>
          </div>
        </motion.div>

        {/* Login Form Card */}
        <div className="bg-[#0e1626]/95 border border-[#1e2a3f] rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-black/70 backdrop-blur-xl relative">
          
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignInClick} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <Input
                id="email"
                type="email"
                icon={Mail}
                placeholder="user@smarttransit.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#131d31] border-[#1e2a3f] text-white placeholder:text-slate-500 focus:border-[#00d2ff] h-12"
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
                  onClick={() => alert('Demo Passwords: 123456password')}
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
                className="bg-[#131d31] border-[#1e2a3f] text-white placeholder:text-slate-500 focus:border-[#00d2ff] h-12"
              />
            </div>

            {/* Coral Gradient SIGN IN Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="coral"
                size="lg"
                loading={loading}
                className="w-full font-extrabold tracking-wider h-12 text-sm uppercase shadow-lg shadow-coral-500/25"
              >
                SIGN IN <ArrowRight size={18} />
              </Button>
            </div>
          </form>

          {/* Footer Text */}
          <div className="mt-5 pt-4 border-t border-[#1e2a3f] text-center text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Don't have an account?</span>
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="text-[#00d2ff] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Sign Up <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== ROLE SELECTION POP-UP MODAL (MATCHED TO AUDIO DIRECTIVE) ===== */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="bg-[#0e1626] border border-[#1e2a3f] rounded-[32px] p-6 sm:p-7 max-w-sm w-full shadow-2xl relative overflow-hidden text-white space-y-4"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#131d31] border border-[#1e2a3f]"
              >
                <X size={16} />
              </button>

              <div className="text-center pt-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-[#00d2ff] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Select Access Portal</h3>
                <p className="text-xs text-slate-400 mt-1">Choose the workspace you want to enter:</p>
              </div>

              <div className="space-y-2.5 pt-1">
                {Object.entries(roleAccounts).map(([roleKey, acc]) => {
                  const AccIcon = acc.icon;
                  return (
                    <motion.button
                      key={roleKey}
                      type="button"
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => executeLoginForRole(roleKey)}
                      className="w-full p-3.5 rounded-2xl bg-[#131d31] border border-[#1e2a3f] hover:border-cyan-500/50 hover:bg-[#18243c] transition-all text-left flex items-center gap-3.5 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#0e1626] text-[#00d2ff] flex items-center justify-center flex-shrink-0 border border-[#1e2a3f] group-hover:border-cyan-500/40">
                        <AccIcon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-white group-hover:text-[#00d2ff] transition-colors">{acc.label}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{acc.desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
