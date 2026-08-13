import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Route, MapPin, Activity, CheckCircle, Radio, XCircle } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import { getActiveTrips } from '../../services/trip.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

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
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Buses', value: stats.total, icon: Bus, color: 'text-primary-700', bg: 'bg-primary-50 border-primary-200' },
    { label: 'Active Fleet', value: stats.active, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Running Trips', value: stats.running, icon: Radio, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Offline / Inactive', value: stats.offline, icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6 space-y-6">
      <div className="animate-fade-in bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-950">Fleet Operations Dashboard ⚙️</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time system health and administration</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center">
          <Activity size={26} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`p-5 animate-fade-in ${stat.bg}`} style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
                <Icon size={20} className={stat.color} />
              </div>
              <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Nav Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/admin/buses', icon: Bus, label: 'Bus Fleet Management', desc: 'Add, edit, assign drivers & routes' },
          { to: '/admin/routes', icon: Route, label: 'Route & Stop Manager', desc: 'Manage route lines & stop sequences' },
          { to: '/admin/live-map', icon: MapPin, label: 'Live Fleet Map', desc: 'Monitor all running buses in real-time' },
        ].map((link, idx) => {
          const LinkIcon = link.icon;
          return (
            <Link key={link.to} to={link.to} className="group">
              <Card hover className="p-6 h-full animate-fade-in" style={{ animationDelay: `${(idx + 4) * 60}ms` }}>
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-3 group-hover:bg-primary-700 group-hover:text-white transition-colors">
                  <LinkIcon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-primary-700 transition-colors">
                  {link.label}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{link.desc}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Active Trips Monitor */}
      <Card className="animate-fade-in">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
          <div>
            <CardTitle className="text-lg">Active Running Trips</CardTitle>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{activeTrips.length} active trip(s) currently broadcasting</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTrips.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No trips running right now</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeTrips.map((trip) => (
                <div key={trip.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Bus size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{trip.expand?.bus_id?.bus_number || 'Bus'}</p>
                      <p className="text-xs text-slate-500">
                        Driver: {trip.expand?.driver_id?.name || 'Rahul Sharma'} · Started {new Date(trip.start_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="RUNNING" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
