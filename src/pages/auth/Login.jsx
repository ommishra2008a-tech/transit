import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Bus, ShieldCheck, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SmartTransitLogo from '../../components/SmartTransitLogo';

export default function Login() {
  const [activeTab, setActiveTab] = useState('PASSENGER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  
  const { login, user, loading, clearError } = useAuth();
  const navigate = useNavigate();

  // Clear errors on initial mount
  useEffect(() => {
    setLoginError('');
    clearError();
  }, [clearError]);

  // Single source of truth for post-login navigation.
  useEffect(() => {
    if (user && !loading) {
      let role = (user.role || 'PASSENGER').toUpperCase();
      if (!['DRIVER', 'ADMIN', 'PASSENGER'].includes(role)) {
        role = 'PASSENGER';
      }
      
      if (role === 'DRIVER') navigate('/driver', { replace: true });
      else if (role === 'ADMIN') navigate('/admin', { replace: true });
      else navigate('/passenger', { replace: true });
    }
  }, [user, loading, navigate]);

  const roleAccounts = {
    PASSENGER: { label: 'Passenger', route: '/passenger', icon: User, placeholder: 'passenger@transit.dev' },
    DRIVER: { label: 'Driver', route: '/driver', icon: Bus, placeholder: 'driver@transit.dev' },
    ADMIN: { label: 'Admin', route: '/admin', icon: ShieldCheck, placeholder: 'admin@transit.dev' },
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setLoginError('');
    clearError();
  };

  const handleSignInClick = async (e) => {
    e?.preventDefault();
    setLoginError('');
    clearError();

    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }
    
    try {
      await login(email.trim(), password);
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password.');
    }
  };

  const handleForgotPassword = () => {
    setLoginError('Password Reset: Please contact your fleet administrator or system support.');
  };

  return (
    <div className="min-h-dvh min-h-screen w-full bg-[#030712] text-white flex items-center justify-center p-4 sm:p-6 overflow-y-auto relative">
      {/* Background Ambience representing City Night */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030712] to-[#030712] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Cinematic subtle background image */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://images.unsplash.com/photo-1555626906-fcf10d6851b4?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center pointer-events-none mix-blend-screen"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] mx-auto my-auto relative z-10"
      >
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <SmartTransitLogo layout="vertical" />
        </div>

        <div className="bg-[#0b101a]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 sm:p-8 shadow-[0_0_40px_rgba(37,99,235,0.1)] relative overflow-hidden">
          
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back!</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center shadow-lg"
            >
              {loginError}
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Role Portal Selection Tabs */}
            <div className="flex bg-[#070b13] border border-white/5 rounded-[18px] p-1.5 shadow-inner">
              {Object.entries(roleAccounts).map(([key, acc]) => {
                const Icon = acc.icon;
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTabChange(key)}
                    className={`flex-1 py-2.5 flex flex-col items-center justify-center rounded-[12px] transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.4)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'mb-1.5 drop-shadow-md' : 'mb-1.5 opacity-70'} />
                    <span className="text-[11px] font-medium tracking-wide">{acc.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSignInClick} className="space-y-4">
              {/* Email Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Mail size={18} strokeWidth={2} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder={roleAccounts[activeTab]?.placeholder || "Email Address"}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                  required
                  className="w-full bg-[#070b13] border border-white/5 text-white text-sm placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-[#0b101a] focus:ring-1 focus:ring-blue-500/50 h-[56px] rounded-2xl pl-12 pr-4 outline-none transition-all shadow-inner"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                  required
                  className="w-full bg-[#070b13] border border-white/5 text-white text-sm placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-[#0b101a] focus:ring-1 focus:ring-blue-500/50 h-[56px] rounded-2xl pl-12 pr-12 outline-none transition-all tracking-[0.2em] shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-[18px] h-[18px] rounded-[6px] border flex items-center justify-center transition-colors ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                    {rememberMe && <Check size={12} strokeWidth={3} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors">
                  Forgot Password?
                </button>
              </div>

              {/* Main Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[56px] relative flex items-center justify-center bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold text-[15px] rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:from-blue-600 hover:to-blue-400 transition-all disabled:opacity-70 group overflow-hidden"
              >
                <span className="tracking-wide">{loading ? 'Signing in...' : 'Sign In'}</span>
                {!loading && (
                  <div className="absolute right-4 w-7 h-7 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white/60 transition-colors bg-white/10 backdrop-blur-sm">
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            </form>
          </div>
          
          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-6 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> Secure</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Fast</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" /> Reliable</span>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
