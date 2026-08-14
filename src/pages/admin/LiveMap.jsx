import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus as BusIcon, Radio, Layers, X } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import { subscribeToAllLocations } from '../../services/location.service';
import TransitMap from '../../components/Map/TransitMap';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { formatSpeed, timeAgo } from '../../utils/geo';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageContainer from '../../components/layout/PageContainer';

export default function LiveMap() {
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    getBuses()
      .then((b) => { setBuses(b || []); setLoading(false); })
      .catch(console.error);

    subscribeToAllLocations((e) => {
      if (e.action === 'create' || e.action === 'update') {
        const rec = e.record;
        setLocations((prev) => ({
          ...prev,
          [rec.bus_id]: {
            latitude: rec.latitude,
            longitude: rec.longitude,
            speed: rec.speed,
            timestamp: rec.timestamp,
          },
        }));
      }
    }).then((unsub) => {
      unsubRef.current = unsub;
    });

    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  const busMarkers = Object.entries(locations).map(([busId, loc]) => {
    const bus = buses.find((b) => b.id === busId);
    return {
      id: busId,
      latitude: loc.latitude,
      longitude: loc.longitude,
      speed: loc.speed,
      label: bus?.bus_number || busId,
    };
  });

  const allPoints = busMarkers.map((m) => [m.latitude, m.longitude]);

  return (
    <PageContainer full className="relative h-full overflow-hidden">
      {/* Top Header Control */}
      <div className="p-3 sm:p-4 bg-white/95 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 shadow-xs z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              City-Wide Live Fleet Map
              <Badge variant="live" pulse>REALTIME SSE</Badge>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {busMarkers.length} vehicle(s) broadcasting live location telemetry
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden"
            >
              <Layers size={14} />
              {showSidebar ? 'Hide Drawer' : `Broadcasts (${busMarkers.length})`}
            </Button>
            <StatusBadge status={busMarkers.length > 0 ? 'RUNNING' : 'INACTIVE'} />
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Drawer */}
        <AnimatePresence>
          {(showSidebar || window.innerWidth >= 768) && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute md:relative z-20 md:z-auto w-72 sm:w-80 h-full border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-y-auto p-4 space-y-3 shadow-xl md:shadow-none"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  ACTIVE BROADCASTS ({busMarkers.length})
                </p>
                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {busMarkers.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <Radio size={28} className="mx-auto mb-2 text-slate-400 animate-pulse" />
                  <p className="font-extrabold text-slate-700 dark:text-slate-300">No active GPS broadcasts</p>
                  <p className="text-[11px] text-slate-400 mt-1">Broadcasts appear when drivers tap Start Trip</p>
                </div>
              ) : (
                busMarkers.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                        <BusIcon size={16} className="text-blue-600 dark:text-blue-400" /> {m.label}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>Speed: {formatSpeed(m.speed)}</span>
                      <span>{timeAgo(locations[m.id]?.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile backdrop */}
        {showSidebar && (
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs z-10 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Map Container */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs">
              <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}
          <TransitMap
            busMarkers={busMarkers}
            fitBounds={allPoints.length >= 2 ? allPoints : null}
            height="100%"
          />
        </div>
      </div>
    </PageContainer>
  );
}
