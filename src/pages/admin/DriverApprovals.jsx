import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, ShieldAlert, UserCheck } from 'lucide-react';
import { solarch } from '../../lib/solarch';

export default function DriverApprovals() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await solarch.db.collection('users').get({ filter: { role: 'driver' }, limit: 100 });
      const docs = res?.items || res?.documents || [];
      setDrivers(docs);
    } catch (err) {
      console.error('Failed to fetch drivers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    try {
      await solarch.db.collection('users').update(driverId, { approval_status: 'APPROVED' });
      setDrivers(prev => prev.map(d => d.$id === driverId ? { ...d, approval_status: 'APPROVED' } : d));
    } catch (err) {
      console.error('Failed to approve driver', err);
      alert('Approval failed. Check connection.');
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const status = d.approval_status || 'PENDING';
    return status === filter;
  });

  return (
    <div className="min-h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-5 pt-12 pb-6 border-b border-white/5 flex flex-col gap-5 bg-[#0b101a]/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-[20px] font-bold tracking-wide">Driver Approvals</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#070b13] border border-white/5 rounded-[16px] p-1.5 shadow-inner w-full max-w-sm">
          <button
            onClick={() => setFilter('PENDING')}
            className={`flex-1 py-2 text-[12px] font-bold rounded-xl transition-all ${filter === 'PENDING' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`flex-1 py-2 text-[12px] font-bold rounded-xl transition-all ${filter === 'APPROVED' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Approved
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 relative z-10 space-y-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-[#0b101a]/50 border border-white/5 rounded-2xl h-[80px] animate-pulse"></div>
          ))
        ) : filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={driver.$id}
              className="bg-[#0b101a]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${filter === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {filter === 'PENDING' ? <ShieldAlert size={20} /> : <UserCheck size={20} />}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-white tracking-wide">{driver.name || driver.email}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{driver.phone || 'No Phone'}</p>
                </div>
              </div>
              
              {filter === 'PENDING' && (
                <button 
                  onClick={() => handleApprove(driver.$id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
                >
                  <Check size={16} strokeWidth={3} />
                  Approve
                </button>
              )}
              {filter === 'APPROVED' && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                  Active
                </span>
              )}
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 mt-10">
            {filter === 'PENDING' ? <ShieldAlert size={48} className="mb-4 opacity-30" /> : <UserCheck size={48} className="mb-4 opacity-30" />}
            <p className="text-[16px] font-medium text-slate-400">No {filter.toLowerCase()} drivers found.</p>
          </div>
        )}
      </div>

    </div>
  );
}
