import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Route, MapPin, Activity, CheckCircle, Radio, XCircle } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import { getActiveTrips } from '../../services/trip.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import ResponsiveGrid from '../../components/layout/ResponsiveGrid';

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
      <PageContainer>
        <ResponsiveGrid>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </ResponsiveGrid>
        <div className="skeleton h-48 rounded-2xl" />
      </PageContainer>
    );
  }

  const statCards = [
    { label: 'Total Buses', value: stats.total, icon: Bus, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900' },
    { label: 'Active Fleet', value: stats.active, icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900' },
    { label: 'Running Trips', value: stats.running, icon: Radio, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900' },
    { label: 'Offline', value: stats.offline, icon: XCircle, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800' },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        light
        title="Fleet Operations Dashboard ⚙️"
        subtitle="Real-time system health and administration"
        right={
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
            <Activity size={22} />
          </div>
        }
      />

      {/* Stats Grid */}
      <ResponsiveGrid>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`p-4 sm:p-5 animate-fade-in ${stat.bg}`} style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{stat.label}</span>
                <Icon size={18} className={stat.color} />
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </Card>
          );
        })}
      </ResponsiveGrid>

      {/* Quick Nav Links */}
      <ResponsiveGrid cols={3}>
        {[
          { to: '/admin/buses', icon: Bus, label: 'Bus Fleet Management', desc: 'Add, edit, assign drivers & routes' },
          { to: '/admin/routes', icon: Route, label: 'Route & Stop Manager', desc: 'Manage route lines & stop sequences' },
          { to: '/admin/live-map', icon: MapPin, label: 'Live Fleet Map', desc: 'Monitor all running buses in real-time' },
        ].map((link, idx) => {
          const LinkIcon = link.icon;
          return (
            <Link key={link.to} to={link.to} className="group">
              <Card hover className="p-4 sm:p-6 h-full animate-fade-in" style={{ animationDelay: `${(idx + 4) * 60}ms` }}>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                  <LinkIcon size={20} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {link.label}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{link.desc}</p>
              </Card>
            </Link>
          );
        })}
      </ResponsiveGrid>

      {/* Active Trips Monitor */}
      <Card className="animate-fade-in">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-base sm:text-lg">Active Running Trips</CardTitle>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{activeTrips.length} active trip(s) broadcasting</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTrips.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm">No trips running right now</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeTrips.map((trip) => (
                <div key={trip.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                      <Bus size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{trip.expand?.bus_id?.bus_number || 'Bus'}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Driver: {trip.expand?.driver_id?.name || 'Rahul Sharma'} · {new Date(trip.start_time).toLocaleTimeString()}
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
    </PageContainer>
  );
}
