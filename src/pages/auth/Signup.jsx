import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Check, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SmartTransitLogo from '../../components/SmartTransitLogo';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requestAdmin, setRequestAdmin] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const { signup, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();
    
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    try {
      await signup(name, email, password, confirmPassword, requestAdmin);
      // Navigation handled by the useEffect above upon successful login
    } catch (err) {
      // Error handled by useAuth and displayed below
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#030712] relative overflow-hidden font-sans antialiased selection:bg-blue-500/30">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] px-6 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <SmartTransitLogo />
        </div>

        <div className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-slate-400 text-sm mt-1">Join the SmartTransit network</p>
          </div>

          {(error || validationError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center shadow-lg"
            >
              {validationError || error}
            </motion.div>
          )}

          <div className="space-y-6">
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              
              {/* Name Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <User size={18} strokeWidth={2} />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#070b13] border border-white/5 text-white text-sm placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-[#0b101a] focus:ring-1 focus:ring-blue-500/50 h-[56px] rounded-2xl pl-12 pr-4 outline-none transition-all shadow-inner"
                />
              </div>

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Mail size={18} strokeWidth={2} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#070b13] border border-white/5 text-white text-sm placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-[#0b101a] focus:ring-1 focus:ring-blue-500/50 h-[56px] rounded-2xl pl-12 pr-12 outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#070b13] border border-white/5 text-white text-sm placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-[#0b101a] focus:ring-1 focus:ring-blue-500/50 h-[56px] rounded-2xl pl-12 pr-4 outline-none transition-all shadow-inner"
                />
              </div>

              {/* Admin Request Checkbox */}
              <div className="flex items-center pt-2 pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-[20px] h-[20px] rounded-[6px] border flex items-center justify-center transition-colors ${requestAdmin ? 'bg-purple-600 border-purple-600' : 'border-slate-600 group-hover:border-purple-500/50'}`}>
                    {requestAdmin && <Check size={14} strokeWidth={3} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={requestAdmin} onChange={() => setRequestAdmin(!requestAdmin)} />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-purple-400" />
                    Request Admin Privileges
                  </span>
                </label>
              </div>

              {/* Main Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[56px] relative flex items-center justify-center bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold text-[15px] rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:from-blue-600 hover:to-blue-400 transition-all disabled:opacity-70 group overflow-hidden mt-2"
              >
                <span className="tracking-wide">{loading ? 'Creating Account...' : 'Sign Up'}</span>
                {!loading && (
                  <div className="absolute right-4 w-7 h-7 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white/60 transition-colors bg-white/10 backdrop-blur-sm">
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
