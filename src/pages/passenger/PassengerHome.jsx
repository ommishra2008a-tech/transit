import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Bus, Route as RouteIcon, Compass, Navigation } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getBuses } from '../../services/bus.service';
import { getRoutes } from '../../services/route.service';
import BusCard from '../../components/BusCard/BusCard';
import RouteCard from '../../components/RouteCard/RouteCard';
import Input from '../../components/ui/Input';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import ResponsiveGrid from '../../components/layout/ResponsiveGrid';

export default function PassengerHome() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buses');

  useEffect(() => {
    Promise.all([getBuses(), getRoutes()])
      .then(([b, r]) => { setBuses(b || []); setRoutes(r || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBuses = buses.filter((bus) => {
    const q = search.toLowerCase();
    const route = bus.expand?.route_id;
    return (
      bus.bus_number.toLowerCase().includes(q) ||
      route?.route_name?.toLowerCase().includes(q) ||
      route?.start_location?.toLowerCase().includes(q) ||
      route?.end_location?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <PageContainer>
        <div className="skeleton h-32 w-full rounded-3xl" />
        <div className="skeleton h-12 w-full rounded-2xl" />
        <ResponsiveGrid>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </ResponsiveGrid>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero Banner */}
      <PageHeader
        title={`Hello, ${user?.name || 'Passenger'} 👋`}
        subtitle="Search active transit lines, inspect station timelines & track buses live."
        badge="Live Passenger Console"
        badgeIcon={Compass}
        right={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[80px] sm:min-w-[95px] backdrop-blur-md">
              <p className="text-xl sm:text-2xl font-extrabold text-blue-400 leading-none">{buses.length}</p>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase mt-1">Vehicles</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[80px] sm:min-w-[95px] backdrop-blur-md">
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 leading-none">{routes.length}</p>
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase mt-1">Routes</p>
            </div>
          </div>
        }
      />

      {/* Search Bar & View Tabs */}
      <div className="space-y-3">
        <Input
          icon={Search}
          placeholder="Search bus number, route name, or city location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900/90 shadow-xs border-slate-200/80 dark:border-slate-800"
        />

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer select-none ${
              activeTab === 'buses'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white/95 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('buses')}
          >
            <Bus size={16} /> All Buses ({filteredBuses.length})
          </button>
          <button
            type="button"
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer select-none ${
              activeTab === 'routes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white/95 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('routes')}
          >
            <RouteIcon size={16} /> City Routes ({routes.length})
          </button>
        </div>
      </div>

      {/* Content Grid with Motion Entrance */}
      {activeTab === 'buses' ? (
        <motion.section
          key="buses-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {filteredBuses.length === 0 ? (
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-8 sm:p-12 text-center text-slate-400 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <Navigation size={42} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-800 dark:text-slate-200 font-extrabold text-base">No vehicles match search query</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for "BUS-101" or "Rajwada"</p>
            </div>
          ) : (
            <ResponsiveGrid>
              {filteredBuses.map((bus) => (
                <BusCard key={bus.id} bus={bus} />
              ))}
            </ResponsiveGrid>
          )}
        </motion.section>
      ) : (
        <motion.section
          key="routes-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ResponsiveGrid>
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </ResponsiveGrid>
        </motion.section>
      )}
    </PageContainer>
  );
}
