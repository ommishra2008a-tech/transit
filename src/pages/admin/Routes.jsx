import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route as RouteIcon, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
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
      .then((r) => setRoutes(r || []))
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
    setStops(s || []);
  }

  if (loading) {
    return (
      <PageContainer narrow>
        <div className="skeleton h-24 w-full rounded-3xl" />
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <PageHeader
        title="Route & Stop Manager 🗺️"
        subtitle={`Managing ${routes.length} configured city transport route corridors.`}
        badge="Route Corridors"
        badgeIcon={MapPin}
      />

      <div className="space-y-3">
        {routes.map((route, idx) => {
          const isExpanded = selectedRoute?.id === route.id;
          return (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
            >
              <Card
                interactive
                className={`p-4 sm:p-5 transition-all ${
                  isExpanded ? 'border-blue-500 dark:border-blue-600 ring-2 ring-blue-500/15' : ''
                }`}
                onClick={() => handleSelectRoute(route)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900 flex-shrink-0">
                      <RouteIcon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate">{route.route_name}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="truncate">{route.start_location}</span>
                        <span className="text-blue-500">→</span>
                        <span className="truncate">{route.end_location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={route.status} />
                    <span className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Stop Sequence Accordion */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card className="ml-3 sm:ml-6 mt-2 p-5 border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-slate-900/80 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                        <span>STATION STOP SEQUENCE</span>
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold">{stops.length} STOPS</span>
                      </div>
                      <StopList stops={stops} />
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </PageContainer>
  );
}
