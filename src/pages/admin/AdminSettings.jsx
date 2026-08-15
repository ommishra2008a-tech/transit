import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ToggleLeft, ToggleRight, UserPlus, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { solarch } from '../../lib/solarch';
import AuthRequiredModal from '../../components/AuthRequiredModal';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user, requireDriverApproval, toggleDriverApproval } = useAuth();
  
  const [adminCount, setAdminCount] = useState(0);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [actionStatus, setActionStatus] = useState({ type: '', msg: '' });
  const [authModal, setAuthModal] = useState({ open: false, action: '' });

  const isAdmin = user && (user.role || '').toUpperCase() === 'ADMIN';

  useEffect(() => {
    const fetchAdminsAndRequests = async () => {
      try {
        // Fetch current admins
        const adminRes = await solarch.db.collection('users').get({ filter: { role: 'ADMIN' }, limit: 50 });
        setAdminCount(adminRes?.items?.length || adminRes?.documents?.length || 0);

        // Fetch pending requests
        const reqRes = await solarch.db.collection('users').get({ filter: { admin_request: 'PENDING' }, limit: 50 });
        setPendingRequests(reqRes?.items || reqRes?.documents || []);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoadingAdmins(false);
        setLoadingRequests(false);
      }
    };
    fetchAdminsAndRequests();
  }, []);

  const handleToggleApproval = (newValue) => {
    if (!isAdmin) {
      setAuthModal({ open: true, action: 'change security settings' });
      return;
    }
    toggleDriverApproval(newValue);
  };

  const handleApprove = async (id) => {
    if (!isAdmin) {
      setAuthModal({ open: true, action: 'approve admin requests' });
      return;
    }
    try {
      const res = await solarch.request(`/api/admin/requests/${id}/approve`, 'POST');
      if (res.code === 200) {
        setPendingRequests(prev => prev.filter(r => r.id !== id && r.$id !== id));
        setAdminCount(prev => prev + 1);
        setActionStatus({ type: 'success', msg: 'Admin request approved.' });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setActionStatus({ type: 'error', msg: err.message || 'Failed to approve request.' });
    }
    setTimeout(() => setActionStatus({ type: '', msg: '' }), 4000);
  };

  const handleReject = async (id) => {
    if (!isAdmin) {
      setAuthModal({ open: true, action: 'reject admin requests' });
      return;
    }
    try {
      const res = await solarch.request(`/api/admin/requests/${id}/reject`, 'POST');
      if (res.code === 200) {
        setPendingRequests(prev => prev.filter(r => r.id !== id && r.$id !== id));
        setActionStatus({ type: 'success', msg: 'Admin request rejected.' });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setActionStatus({ type: 'error', msg: err.message || 'Failed to reject request.' });
    }
    setTimeout(() => setActionStatus({ type: '', msg: '' }), 4000);
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
              onClick={() => handleToggleApproval(!requireDriverApproval)}
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

          {actionStatus.msg && (
            <div className={`p-3 rounded-xl flex items-center gap-3 mb-6 text-sm font-medium ${actionStatus.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              {actionStatus.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              {actionStatus.msg}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white mb-3">Pending Requests</h4>
            {loadingRequests ? (
              <div className="text-center py-6 text-slate-500 text-sm">Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 bg-[#030712] border border-white/5 rounded-xl text-slate-500 text-sm">
                No pending admin requests.
              </div>
            ) : (
              pendingRequests.map(req => {
                const id = req.id || req.$id;
                return (
                  <div key={id} className="flex items-center justify-between p-4 bg-[#030712] border border-white/10 rounded-xl">
                    <div>
                      <h5 className="text-sm font-semibold text-white">{req.name || 'Unknown Name'}</h5>
                      <p className="text-xs text-slate-400">{req.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(id)}
                        disabled={adminCount >= 10}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </motion.div>

      </div>

      <AuthRequiredModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, action: '' })}
        requiredRole="Admin"
        actionName={authModal.action}
      />
    </div>
  );
}
