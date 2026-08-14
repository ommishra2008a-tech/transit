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
        // Fallback to default password to ensure smooth backend connection during demo clicks
        const loginPassword = password ? password : '123456password';
        const activeRole = await login(targetAccount.email, loginPassword);
        navigate(roleAccounts[activeRole]?.route || targetAccount.route);
      } catch (err) {
        console.error('Login failed', err);
      }
    };

  return (
    <div className="min-h-dvh min-h-screen w-full bg-[#051126] text-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[460px] mx-auto my-auto relative z-10 space-y-8"
      >
        {/* Top Logo */}
        <div className="flex flex-col items-center justify-center text-center">
          <SmartTransitLogo layout="vertical" />
        </div>

        {/* Login Form Card */}
        <div className="bg-[#18191e] border border-[#26282e] rounded-[32px] p-8 sm:p-12 shadow-2xl relative">
          
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-sm font-semibold text-center shadow-lg"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignInClick} className="space-y-7">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-extrabold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-sm" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  icon={() => (
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: [-5, 5, -5, 0] }}
                      transition={{ duration: 0.4 }}
                      className="text-slate-400"
                    >
                      <Mail size={18} strokeWidth={2} />
                    </motion.div>
                  )}
                  placeholder="commuter@smarttransit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#2a2720] border-[#383329] text-white text-base placeholder:text-slate-500 focus:border-[#f48a66] h-14 rounded-2xl"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] sm:text-sm font-extrabold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 drop-shadow-sm" htmlFor="password">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Passwords: 123456password')}
                  className="text-sm sm:text-[15px] font-bold text-[#8be2e3] hover:text-white transition-colors"
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
                  className="bg-[#2a2720] border-[#383329] text-white text-base placeholder:text-slate-500 focus:border-[#f48a66] h-14 rounded-2xl"
                />
              </div>
            </div>

            {/* Coral Gradient SIGN IN Button */}
            <div className="pt-4">
              <Button
                type="submit"
                loading={loading}
                className="w-full font-extrabold tracking-widest h-14 text-base bg-gradient-to-r from-[#fc6b45] via-[#ff825c] to-[#fda07c] text-slate-900 border-none shadow-xl shadow-coral-500/20 rounded-2xl hover:from-[#fa5e34] hover:to-[#fc916a]"
              >
                SIGN IN
              </Button>
            </div>
          </form>

          {/* Footer Text */}
          <div className="mt-10 pt-6 border-t border-[#26282e] text-center text-sm font-medium text-slate-300 flex items-center justify-center gap-2">
            <span>New to SmartTransit?</span>
            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="text-[#8be2e3] font-extrabold hover:text-white transition-colors text-base"
            >
              Sign Up
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
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-[#00d2ff] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Select Access Portal</h3>
                <p className="text-sm text-slate-400 mt-2">Choose the workspace you want to enter:</p>
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
