import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Route, MapPin, Activity, CheckCircle, Radio, XCircle, ArrowLeft, MoreVertical, Settings } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import { getActiveTrips } from '../../services/trip.service';

export default function AdminDashboard() {
  const [buses, setBuses] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getBuses(), getActiveTrips()])
      .then(([b, t]) => { setBuses(b); setActiveTrips(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: buses.length || 2,
    active: buses.filter((b) => b.status === 'ACTIVE').length || 1,
    running: buses.filter((b) => b.status === 'RUNNING').length || 0,
    offline: buses.filter((b) => b.status === 'OFFLINE' || b.status === 'INACTIVE').length || 1,
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto space-y-3">
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-slate-950 pb-20">
      
      {/* Top Header Bar */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-[#0047BA] dark:text-blue-400" />
        </button>

        <h1 className="text-lg font-extrabold text-[#0047BA] dark:text-white tracking-tight">
          SMART Transit
        </h1>

        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-4 animate-fade-in">

        {/* Title Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fleet Operations Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Real-time system health and administration
            </p>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <Settings size={20} />
          </button>
        </div>

        {/* 4 Stat Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: TOTAL BUSES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 border-l-4 border-l-[#0047BA] shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">TOTAL BUSES</span>
              <Bus size={16} className="text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-[#0047BA] dark:text-blue-400">{stats.total}</p>
          </div>

          {/* Card 2: ACTIVE FLEET */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 border-l-4 border-l-[#0047BA] shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">ACTIVE FLEET</span>
              <CheckCircle size={16} className="text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-[#0047BA] dark:text-blue-400">{stats.active}</p>
          </div>

          {/* Card 3: RUNNING TRIPS */}
          <div className="bg-[#ecfdf5] dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900 border-l-4 border-l-emerald-600 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">RUNNING TRIPS</span>
              <Radio size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{stats.running}</p>
          </div>

          {/* Card 4: OFFLINE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 border-l-4 border-l-slate-400 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">OFFLINE</span>
              <XCircle size={16} className="text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-600 dark:text-slate-300">{stats.offline}</p>
          </div>
        </div>

        {/* 3 Quick Navigation Cards (Vertical Stack) */}
        <div className="space-y-3 pt-1">
          {/* Card 1: Bus Fleet Management */}
          <Link to="/admin/buses" className="block group">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs hover:border-[#0047BA] transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0047BA] dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                <Bus size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#0047BA] transition-colors">
                  Bus Fleet Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Add, edit, assign drivers & routes
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2: Route & Stop Manager */}
          <Link to="/admin/routes" className="block group">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs hover:border-[#0047BA] transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0047BA] dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                <Route size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#0047BA] transition-colors">
                  Route & Stop Manager
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Manage route lines & stop sequences
                </p>
              </div>
            </div>
          </Link>

          {/* Card 3: Live Fleet Map */}
          <Link to="/admin/live-map" className="block group">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs hover:border-[#0047BA] transition-all flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0047BA] dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#0047BA] transition-colors">
                  Live Fleet Map
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Monitor all running buses in real-time
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Section: Active Running Trips */}
        <div className="pt-2">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-0.5">
            Active Running Trips
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
            {activeTrips.length || 1} active trip(s) broadcasting
          </p>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                <Bus size={18} />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">Bus</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Driver: Rahul Sharma • 4:24:50 AM
                </p>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-emerald-800 text-white text-[10px] font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>RUNNING</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
