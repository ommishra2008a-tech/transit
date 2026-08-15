import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, LogIn, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthRequiredModal({ isOpen, onClose, requiredRole = 'Admin', actionName = 'this action' }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    logout();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[4000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#0b101a] border border-white/10 rounded-[28px] p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Lock size={28} />
          </div>

          <h3 className="text-lg font-bold text-white mb-1.5">{requiredRole} Access Required</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You are currently exploring in <span className="text-amber-300 font-semibold">View-Only Mode</span>. To perform {actionName}, please log in with an authorized {requiredRole} account.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleLoginRedirect}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-[0.98]"
            >
              <LogIn size={15} />
              <span>Login as {requiredRole}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors"
            >
              Continue in View-Only Mode
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
