import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, Route as RouteIcon, MapPin, Activity, CheckCircle, Radio, XCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import { getActiveTrips } from '../../services/trip.service';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { Card } from '../../components/ui/Card';

export default function AdminDashboard() {
  const [buses, setBuses] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBuses(), getActiveTrips()])
      .then(([b, t]) => { setBuses(b || []); setActiveTrips(t || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: buses.length,
    active: buses.filter((b) => b.status === 'ACTIVE').length,
    running: buses.filter((b) => b.status === 'RUNNING').length,
    offline: buses.filter((b) => b.status === 'OFFLINE' || b.status === 'INACTIVE').length,
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="skeleton h-28 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-48 w-full rounded-3xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero Banner */}
      <PageHeader
        title="Fleet Operations Control Center ⚙️"
        subtitle="Real-time city transport metrics, fleet administration, & driver assignment console."
        badge="System Administration"
        badgeIcon={ShieldCheck}
        right={
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5 backdrop-blur-md">
              <Radio size={12} className="text-emerald-400 animate-pulse" />
              <span>{stats.running} RUNNING</span>
            </div>
          </div>
        }
      />

      {/* 4 Metric Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs border-l-4 border-l-blue-600 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">TOTAL VEHICLES</span>
            <Bus size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.total}</p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs border-l-4 border-l-emerald-500 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">ACTIVE FLEET</span>
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.active}</p>
        </div>

        <div className="bg-emerald-50/90 dark:bg-emerald-950/40 rounded-3xl p-5 border border-emerald-200/80 dark:border-emerald-900/60 border-l-4 border-l-emerald-500 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">RUNNING TRIPS</span>
            <Radio size={18} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 leading-none">{stats.running}</p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs border-l-4 border-l-slate-400 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">OFFLINE</span>
            <XCircle size={18} className="text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.offline}</p>
        </div>
      </motion.div>

      {/* Admin Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link to="/admin/buses">
          <Card interactive className="p-5 flex items-center justify-between group">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900">
                <Bus size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Bus Fleet Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add, edit, assign drivers & routes</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </Card>
        </Link>

        <Link to="/admin/routes">
          <Card interactive className="p-5 flex items-center justify-between group">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900">
                <RouteIcon size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Route & Stop Manager</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage route lines & stop sequences</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </Card>
        </Link>

        <Link to="/admin/live-map">
          <Card interactive className="p-5 flex items-center justify-between group">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Live Fleet Map</h3>
                <p className="text-xs text-slate-400 mt-0.5">Monitor all running buses live</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </Card>
        </Link>
      </div>

      {/* Active Trips Overview Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Active Running Trips ({activeTrips.length})
          </h3>
          <Link to="/admin/live-map" className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline">
            View Live Map →
          </Link>
        </div>

        {activeTrips.length === 0 ? (
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-6 text-center border border-slate-200/80 dark:border-slate-800 text-slate-400">
            <Activity size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No trips currently running</p>
            <p className="text-xs text-slate-400 mt-0.5">Trips will appear here when drivers tap Start Trip</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeTrips.map((t) => (
              <div key={t.id} className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                    <Bus size={20} />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Bus Vehicle #{t.bus_id}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      Started: {new Date(t.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
