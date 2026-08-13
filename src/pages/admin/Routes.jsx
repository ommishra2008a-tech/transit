import { useState, useEffect } from 'react';
import { Route as RouteIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { getRoutes, getStopsByRoute } from '../../services/route.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';
import { Card } from '../../components/ui/Card';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

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
      <PageContainer narrow>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <PageHeader
        light
        title="Route & Stop Manager 🗺️"
        subtitle={`${routes.length} configured city routes`}
      />

      <div className="space-y-3">
        {routes.map((route, idx) => {
          const isExpanded = selectedRoute?.id === route.id;
          return (
            <div key={route.id} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
              <Card
                hover
                className={`p-4 sm:p-5 cursor-pointer transition-all bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 ${
                  isExpanded ? 'border-blue-500 dark:border-blue-600 ring-2 ring-blue-500/10' : ''
                }`}
                onClick={() => handleSelectRoute(route)}
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900 flex-shrink-0">
                      <RouteIcon size={18} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base lg:text-lg truncate">{route.route_name}</h3>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <StatusBadge status={route.status} />
                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 pl-11 sm:pl-14">
                  <span className="truncate">{route.start_location}</span>
                  <span className="text-slate-300 dark:text-slate-600 flex-shrink-0">→</span>
                  <span className="truncate">{route.end_location}</span>
                </div>
              </Card>

              {/* Stop Sequence Dropdown */}
              {isExpanded && (
                <Card className="ml-3 sm:ml-4 md:ml-6 mt-2 p-4 sm:p-5 animate-slide-up border-blue-200 dark:border-blue-900 bg-slate-50/70 dark:bg-slate-900/60">
                  <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 sm:mb-4">
                    STOP SEQUENCE ({stops.length} STOPS)
                  </h4>
                  <StopList stops={stops} />
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
