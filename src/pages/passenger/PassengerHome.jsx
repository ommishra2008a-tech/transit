import { useState, useEffect } from 'react';
import { Search, Bus, Route as RouteIcon, MapPin, Compass, Navigation } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getBuses } from '../../services/bus.service';
import { getRoutes } from '../../services/route.service';
import BusCard from '../../components/BusCard/BusCard';
import RouteCard from '../../components/RouteCard/RouteCard';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

export default function PassengerHome() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buses');

  useEffect(() => {
    Promise.all([getBuses(), getRoutes()])
      .then(([b, r]) => { setBuses(b); setRoutes(r); })
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
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
        <div className="skeleton h-28 w-full rounded-3xl" />
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Enterprise Hero Banner */}
      <div className="animate-fade-in bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Compass size={14} className="animate-pulse" /> Live Passenger Command
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hello, {user?.name || 'Passenger'} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1">Search active transit lines, view route stops & live map positions.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[90px]">
              <p className="text-xl font-extrabold text-blue-400">{buses.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Vehicles</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[90px]">
              <p className="text-xl font-extrabold text-emerald-400">{routes.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Routes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="animate-fade-in space-y-3">
        <Input
          icon={Search}
          placeholder="Search bus number, route name, or city location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 text-base rounded-2xl bg-white shadow-xs border-slate-200"
        />

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'buses'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('buses')}
          >
            <Bus size={16} /> All Buses ({filteredBuses.length})
          </button>
          <button
            type="button"
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('routes')}
          >
            <RouteIcon size={16} /> City Routes ({routes.length})
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {activeTab === 'buses' ? (
        <section className="animate-fade-in space-y-3">
          {filteredBuses.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-200/80 shadow-xs">
              <Navigation size={40} className="mx-auto mb-2 text-slate-300" />
              <p className="text-slate-700 font-bold">No transit vehicles match search query</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for "BUS-101" or "Rajwada"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBuses.map((bus) => (
                <BusCard key={bus.id} bus={bus} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="animate-fade-in space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
