import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getBuses } from '../../services/bus.service';
import { getRoutes } from '../../services/route.service';
import BusCard from '../../components/BusCard/BusCard';
import RouteCard from '../../components/RouteCard/RouteCard';

export default function PassengerHome() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6 space-y-6">
      {/* Greeting */}
      <div className="animate-fade-in bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#142d76]">
            Hello, {user?.name || 'Passenger'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your bus in real time</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#f0f4ff] flex items-center justify-center text-2xl">
          🚍
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in">
        <span className="absolute left-3.5 top-3.5 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          className="transit-input"
          placeholder="Search buses, routes, stops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Available Buses */}
      <section className="animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Available Buses
            <span className="px-2.5 py-0.5 rounded-full bg-[#f0f4ff] text-[#142d76] text-xs font-bold">
              {filteredBuses.length}
            </span>
          </h2>
        </div>
        {filteredBuses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
            <p className="text-3xl mb-2">🔍</p>
            <p>No buses found</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        )}
      </section>

      {/* Routes */}
      <section className="animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            City Routes
            <span className="px-2.5 py-0.5 rounded-full bg-[#f0f4ff] text-[#142d76] text-xs font-bold">
              {routes.length}
            </span>
          </h2>
        </div>
        <div className="grid gap-3">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </section>
    </div>
  );
}
