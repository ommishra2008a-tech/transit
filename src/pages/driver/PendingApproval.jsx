import { motion } from 'framer-motion';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-[#030712] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-[#030712] to-[#030712] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b101a]/80 backdrop-blur-xl border border-amber-500/20 rounded-[32px] p-8 w-full max-w-sm text-center shadow-[0_0_50px_rgba(245,158,11,0.1)] relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border-4 border-amber-500/20 flex items-center justify-center mx-auto mb-6 relative">
          <Clock size={40} className="text-amber-500 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#0b101a] rounded-full flex items-center justify-center">
            <ShieldAlert size={14} className="text-amber-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-wide mb-2">Approval Pending</h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Your driver account is currently under review. Please wait for an administrator to approve your account before you can start trips.
        </p>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8">
          <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">
            Current Status
          </p>
          <p className="text-lg font-bold text-white mt-1">
            Waiting for Admin
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-colors border border-white/5 flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
