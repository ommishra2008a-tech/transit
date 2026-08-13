import { useState, useEffect } from 'react';
import { getRoutes, getStopsByRoute } from '../../services/route.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoutes()
      .then(setRoutes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSelectRoute(route) {
    if (selectedRoute?.id === route.id) {
      setSelectedRoute(null);
      setStops([]);
      return;
    }
    setSelectedRoute(route);
    const s = await getStopsByRoute(route.id);
    setStops(s);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-100">Route Management 🗺️</h1>
        <p className="text-surface-500">{routes.length} routes configured</p>
      </div>

      <div className="space-y-3">
        {routes.map((route, idx) => (
          <div key={route.id} className="animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
            <div
              className={`glass-card p-4 cursor-pointer transition-all ${selectedRoute?.id === route.id ? 'border-primary-500/50' : ''}`}
              onClick={() => handleSelectRoute(route)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-surface-100">{route.route_name}</h3>
                <div className="flex items-center gap-2">
                  <StatusBadge status={route.status} />
                  <span className="text-surface-500 text-sm">{selectedRoute?.id === route.id ? '▲' : '▼'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <span className="w-2 h-2 rounded-full bg-success-400" />
                {route.start_location}
                <span className="text-surface-600">→</span>
                <span className="w-2 h-2 rounded-full bg-danger-400" />
                {route.end_location}
              </div>
            </div>

            {/* Stops Dropdown */}
            {selectedRoute?.id === route.id && (
              <div className="ml-4 mt-2 p-4 glass-card animate-slide-up">
                <h4 className="text-sm font-medium text-surface-400 mb-3">STOPS ({stops.length})</h4>
                <StopList stops={stops} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
