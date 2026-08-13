import { useState, useEffect } from 'react';
import { Search, Bus, Route as RouteIcon, MapPin, Compass, Navigation } from 'lucide-react';
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
      <PageContainer>
        <div className="skeleton h-28 w-full rounded-2xl sm:rounded-3xl" />
        <div className="skeleton h-12 w-full rounded-2xl" />
        <ResponsiveGrid>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </ResponsiveGrid>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero Banner */}
      <PageHeader
        title={`Hello, ${user?.name || 'Passenger'} 👋`}
        subtitle="Search active transit lines, view route stops & live map positions."
        badge="Live Passenger Command"
        badgeIcon={Compass}
        right={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[70px] sm:min-w-[90px]">
              <p className="text-lg sm:text-xl font-extrabold text-blue-400">{buses.length}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Vehicles</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[70px] sm:min-w-[90px]">
              <p className="text-lg sm:text-xl font-extrabold text-emerald-400">{routes.length}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Routes</p>
            </div>
          </div>
        }
      />

      {/* Search Bar */}
      <div className="animate-fade-in space-y-3">
        <Input
          icon={Search}
          placeholder="Search bus number, route name, or city location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 sm:h-12 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-xs border-slate-200 dark:border-slate-800"
        />

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'buses'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('buses')}
          >
            <Bus size={15} /> All Buses ({filteredBuses.length})
          </button>
          <button
            type="button"
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('routes')}
          >
            <RouteIcon size={15} /> City Routes ({routes.length})
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {activeTab === 'buses' ? (
        <section className="animate-fade-in">
          {filteredBuses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center text-slate-400 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <Navigation size={40} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-700 dark:text-slate-300 font-bold">No transit vehicles match search query</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for "BUS-101" or "Rajwada"</p>
            </div>
          ) : (
            <ResponsiveGrid>
              {filteredBuses.map((bus) => (
                <BusCard key={bus.id} bus={bus} />
              ))}
            </ResponsiveGrid>
          )}
        </section>
      ) : (
        <section className="animate-fade-in">
          <ResponsiveGrid>
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </ResponsiveGrid>
        </section>
      )}
    </PageContainer>
  );
}
