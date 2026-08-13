import { useState, useEffect } from 'react';
import { Route as RouteIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { getRoutes, getStopsByRoute } from '../../services/route.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';
import { Card } from '../../components/ui/Card';

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
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="animate-fade-in bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Route & Stop Manager 🗺️</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{routes.length} configured city routes</p>
        </div>
      </div>

      <div className="space-y-3">
        {routes.map((route, idx) => {
          const isExpanded = selectedRoute?.id === route.id;
          return (
            <div key={route.id} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
              <Card
                hover
                className={`p-5 cursor-pointer transition-all bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 ${
                  isExpanded ? 'border-blue-500 dark:border-blue-600 ring-2 ring-blue-500/10' : ''
                }`}
                onClick={() => handleSelectRoute(route)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900">
                      <RouteIcon size={20} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">{route.route_name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={route.status} />
                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 pl-14">
                  <span>{route.start_location}</span>
                  <span className="text-slate-300 dark:text-slate-600">→</span>
                  <span>{route.end_location}</span>
                </div>
              </Card>

              {/* Stop Sequence Dropdown */}
              {isExpanded && (
                <Card className="ml-4 sm:ml-6 mt-2 p-5 animate-slide-up border-blue-200 dark:border-blue-900 bg-slate-50/70 dark:bg-slate-900/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                    STOP SEQUENCE ({stops.length} STOPS)
                  </h4>
                  <StopList stops={stops} />
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
