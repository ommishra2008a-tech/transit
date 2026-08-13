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
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6">
      {/* Greeting */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-100">
          Hello, {user?.name || 'Passenger'} 👋
        </h1>
        <p className="text-surface-500">Track your bus in real time</p>
      </div>

      {/* Search */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <input
          type="text"
          className="input"
          placeholder="Search buses, routes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Active Buses */}
      <section className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="text-lg font-semibold text-surface-200 mb-3 flex items-center gap-2">
          🚌 Available Buses
          <span className="badge badge-active text-xs">{filteredBuses.length}</span>
        </h2>
        {filteredBuses.length === 0 ? (
          <div className="glass-card p-8 text-center text-surface-500">
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
      <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h2 className="text-lg font-semibold text-surface-200 mb-3 flex items-center gap-2">
          🗺️ Routes
          <span className="badge badge-active text-xs">{routes.length}</span>
        </h2>
        <div className="grid gap-3">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </section>
    </div>
  );
}
