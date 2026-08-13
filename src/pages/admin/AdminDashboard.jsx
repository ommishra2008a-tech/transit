import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBuses } from '../../services/bus.service';
import { getActiveTrips } from '../../services/trip.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';

export default function AdminDashboard() {
  const [buses, setBuses] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBuses(), getActiveTrips()])
      .then(([b, t]) => { setBuses(b); setActiveTrips(t); })
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
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24" />)}
        </div>
        <div className="skeleton h-48" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Buses', value: stats.total, icon: '🚌', color: 'text-primary-400', bg: 'bg-primary-600/10' },
    { label: 'Active', value: stats.active, icon: '✅', color: 'text-info-400', bg: 'bg-info-600/10' },
    { label: 'Running', value: stats.running, icon: '🟢', color: 'text-success-400', bg: 'bg-success-600/10' },
    { label: 'Offline', value: stats.offline, icon: '🔴', color: 'text-danger-400', bg: 'bg-danger-600/10' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-100">Admin Dashboard ⚙️</h1>
        <p className="text-surface-500">Fleet overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={stat.label} className="stat-card animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-xl mb-3`}>
              {stat.icon}
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/admin/buses', icon: '🚌', label: 'Manage Buses', desc: 'Add, edit, remove buses' },
          { to: '/admin/routes', icon: '🗺️', label: 'Manage Routes', desc: 'Routes and stops' },
          { to: '/admin/live-map', icon: '📍', label: 'Live Fleet Map', desc: 'All buses in real-time' },
        ].map((link, idx) => (
          <Link key={link.to} to={link.to} className="glass-card p-5 group animate-fade-in" style={{ animationDelay: `${(idx + 4) * 80}ms` }}>
            <span className="text-2xl">{link.icon}</span>
            <h3 className="font-semibold text-surface-100 mt-2 group-hover:text-primary-400 transition-colors">{link.label}</h3>
            <p className="text-xs text-surface-500 mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Active Trips */}
      <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
        <h2 className="text-lg font-semibold text-surface-200 mb-3 flex items-center gap-2">
          🟢 Active Trips
          <span className="badge badge-running text-xs">{activeTrips.length}</span>
        </h2>
        {activeTrips.length === 0 ? (
          <div className="glass-card p-6 text-center text-surface-500">No active trips</div>
        ) : (
          <div className="grid gap-3">
            {activeTrips.map((trip) => (
              <div key={trip.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-600/15 flex items-center justify-center text-lg">🚌</div>
                  <div>
                    <p className="font-semibold text-surface-200">{trip.expand?.bus_id?.bus_number || 'Bus'}</p>
                    <p className="text-xs text-surface-500">
                      Driver: {trip.expand?.driver_id?.name || 'Unknown'} · Started {new Date(trip.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <StatusBadge status="RUNNING" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
