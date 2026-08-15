import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, User as UserIcon, Home, Clock, Play } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';
import { solarch } from '../../lib/solarch';
import AuthRequiredModal from '../../components/AuthRequiredModal';

export default function DriverDashboard() {
  const { user, requireDriverApproval } = useAuth();
  const { openSidebar } = useSidebar();
  const navigate = useNavigate();
  const [assignedTrip, setAssignedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isRealDriver = user && (user.role || '').toUpperCase() === 'DRIVER';

  useEffect(() => {
    // Only enforce setup & approval redirects for actual DRIVER accounts
    if (isRealDriver) {
      if (requireDriverApproval && user?.approval_status === 'PENDING') {
        navigate('/driver/pending', { replace: true });
        return;
      }

      if (!user.name || !user.phone || !user.assigned_bus) {
        navigate('/driver/setup', { replace: true });
      }
    }
  }, [user, requireDriverApproval, isRealDriver, navigate]);

  // Fetch assigned trip for this driver or a sample trip for view-only exploration
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        let docs = [];
        if (user?.assigned_bus) {
          const response = await solarch.db.collection('trips').get({
            filter: { bus_number: user.assigned_bus },
            limit: 1
          });
          docs = response?.items || response?.documents || [];
        }

        if (docs.length === 0) {
          // In view-only mode or if driver has no bus, fetch any active trip as a demonstration
          const anyResponse = await solarch.db.collection('trips').get({ limit: 1 });
          docs = anyResponse?.items || anyResponse?.documents || [];
        }

        if (docs.length > 0) {
          setAssignedTrip(docs[0]);
        } else {
          setAssignedTrip(null);
        }
      } catch (err) {
        console.error('Failed to fetch assigned trip:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [user]);

  const handleStartTrip = async () => {
    if (!isRealDriver) {
      setAuthModalOpen(true);
      return;
    }

    if (!assignedTrip) return;
    try {
      if (assignedTrip.status !== 'IN_PROGRESS') {
        await solarch.db.collection('trips').update(assignedTrip.$id || assignedTrip.id, {
          status: 'IN_PROGRESS',
          start_time: new Date().toISOString()
        });
      }
      navigate('/driver/trip');
    } catch (err) {
      console.error('Failed to start trip', err);
      alert('Could not start trip. Check connection.');
    }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Driver';
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const isTripActive = assignedTrip?.status === 'IN_PROGRESS';

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.02] bg-[url('https://images.unsplash.com/photo-1555626906-fcf10d6851b4?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center pointer-events-none mix-blend-screen"></div>

      <div className="flex-1 overflow-y-auto pb-24 relative z-10 px-5 pt-12">
        <header className="flex items-center justify-between mb-8">
          <button onClick={openSidebar} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden cursor-pointer">
             <img src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </header>

        {/* Greeting Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-slate-400 text-[13px] font-medium tracking-wide uppercase mb-1">Good Morning,</p>
          <h2 className="text-[28px] font-bold tracking-tight text-white flex items-center gap-2">
            {capitalizedName} <span className="text-2xl animate-waving-hand origin-bottom-right inline-block">👋</span>
          </h2>
        </motion.div>

        {/* Assigned Trip Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-xl relative overflow-hidden"
        >
          {/* subtle glow behind card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] pointer-events-none"></div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Assigned Bus</p>
              <h3 className="text-[22px] font-bold text-white tracking-wide">{assignedTrip ? assignedTrip.bus_number : 'No Trip Assigned'}</h3>
              <p className="text-[13px] text-slate-400 mt-0.5">{assignedTrip ? assignedTrip.route_id : 'Please contact admin for a schedule.'}</p>
            </div>
            {/* Minimal Bus Graphic */}
            <div className="w-16 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center">
              <img src="/vite.svg" alt="Bus" className="w-8 opacity-50 grayscale" />
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-b border-white/5 mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Start Time</span>
              <span className="text-[14px] font-bold text-white">{assignedTrip?.start_time ? new Date(assignedTrip.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</span>
              <span className="text-[12px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{assignedTrip?.status || 'Waiting'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[20px] font-bold text-white">0</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">km Dist</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[20px] font-bold text-white">0</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Stops</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[20px] font-bold text-white">00:00</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Duration</span>
            </div>
          </div>

          <button 
            onClick={handleStartTrip}
            disabled={loading || !assignedTrip}
            className={`w-full h-[56px] text-white font-bold text-[16px] rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 group ${!assignedTrip ? 'bg-slate-600 opacity-50 cursor-not-allowed shadow-none hover:shadow-none' : isTripActive ? 'bg-blue-600' : 'bg-gradient-to-r from-emerald-600 to-emerald-500'}`}
          >
            <Play fill="currentColor" size={16} className="group-hover:scale-110 transition-transform" />
            <span>{isTripActive ? 'Resume Trip' : 'Start Trip'}</span>
          </button>
        </motion.div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/90 backdrop-blur-2xl border-t border-white/5 pb-safe pt-2 px-6">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          <button onClick={() => navigate('/driver')} className="flex flex-col items-center gap-1.5 text-blue-500">
            <Home size={22} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-semibold">Dashboard</span>
          </button>
          <button onClick={() => navigate('/driver/trip')} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <Clock size={22} />
            <span className="text-[10px] font-medium">My Trips</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <UserIcon size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        requiredRole="Driver"
        actionName="starting or managing trips"
      />
    </div>
  );
}
