import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ToggleLeft, ToggleRight, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { solarch } from '../../lib/solarch';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { requireDriverApproval, toggleDriverApproval } = useAuth();
  
  const [adminCount, setAdminCount] = useState(0);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addStatus, setAddStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const fetchAdminCount = async () => {
      try {
        const res = await solarch.db.collection('users').get({ filter: { role: 'admin' }, limit: 50 });
        const docs = res?.items || res?.documents || [];
        setAdminCount(docs.length);
      } catch (err) {
        console.error('Failed to fetch admins', err);
      } finally {
        setLoadingAdmins(false);
      }
    };
    fetchAdminCount();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    if (adminCount >= 10) {
      setAddStatus({ type: 'error', msg: 'Maximum limit of 10 Admins reached.' });
      return;
    }

    try {
      await solarch.db.collection('users').create({
        email: newAdminEmail,
        role: 'admin',
        created_at: new Date().toISOString()
      });
      setAdminCount(prev => prev + 1);
      setNewAdminEmail('');
      setAddStatus({ type: 'success', msg: 'Admin successfully added.' });
      setTimeout(() => setAddStatus({ type: '', msg: '' }), 3000);
    } catch (err) {
      console.error(err);
      setAddStatus({ type: 'error', msg: 'Failed to add Admin.' });
    }
  };

  return (
    <div className="min-h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-5 pt-12 pb-6 border-b border-white/5 flex items-center gap-4 bg-[#0b101a]/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold tracking-wide">System Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-8 relative z-10 space-y-8">
        
        {/* Global Security Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <ShieldCheck size={20} className="text-blue-500" />
            <h3 className="font-semibold tracking-wide text-[15px]">Security & Approvals</h3>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Require Driver Approval</h4>
              <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                When enabled, new drivers cannot start trips or view maps until manually approved by an admin.
              </p>
            </div>
            <button 
              onClick={() => toggleDriverApproval(!requireDriverApproval)}
              className={`transition-colors ${requireDriverApproval ? 'text-blue-500' : 'text-slate-600'}`}
            >
              {requireDriverApproval ? <ToggleRight size={44} strokeWidth={1.5} /> : <ToggleLeft size={44} strokeWidth={1.5} />}
            </button>
          </div>
        </motion.div>

        {/* Admin Management Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <UserPlus size={20} className="text-purple-500" />
              <h3 className="font-semibold tracking-wide text-[15px]">Manage Admins</h3>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Quota</span>
              <span className="text-sm font-bold text-white">{loadingAdmins ? '-' : adminCount}/10</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The system is limited to a strict maximum of 10 administrators to ensure tight security control over the platform.
          </p>

          {addStatus.msg && (
            <div className={`p-3 rounded-xl flex items-center gap-3 mb-6 text-sm font-medium ${addStatus.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              {addStatus.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              {addStatus.msg}
            </div>
          )}

          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="relative group">
              <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">New Admin Email</label>
              <input
                type="email" required placeholder="admin@transit.dev"
                value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)}
                disabled={adminCount >= 10}
                className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 h-[52px] rounded-xl px-4 outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <button
              type="submit" 
              disabled={adminCount >= 10 || !newAdminEmail}
              className="w-full h-[52px] bg-gradient-to-r from-purple-700 to-purple-500 text-white font-bold text-[14px] rounded-xl shadow-[0_8px_20px_rgba(168,85,247,0.2)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Administrator
            </button>
          </form>

        </motion.div>

      </div>
    </div>
  );
}
