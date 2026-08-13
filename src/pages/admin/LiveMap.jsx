import { useState, useEffect, useRef } from 'react';
import { Bus as BusIcon, Radio } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import { subscribeToAllLocations } from '../../services/location.service';
import TransitMap from '../../components/Map/TransitMap';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { formatSpeed, timeAgo } from '../../utils/geo';
import Badge from '../../components/ui/Badge';
import PageContainer from '../../components/layout/PageContainer';

export default function LiveMap() {
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    getBuses()
      .then((b) => { setBuses(b); setLoading(false); })
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
    <PageContainer full>
      {/* Header */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Live Fleet Map
              <Badge variant="running" pulse>REALTIME</Badge>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {busMarkers.length} bus(es) active and broadcasting live GPS
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile toggle for sidebar */}
            <button
              type="button"
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {showSidebar ? 'Hide List' : `Show List (${busMarkers.length})`}
            </button>
            <StatusBadge status={busMarkers.length > 0 ? 'RUNNING' : 'INACTIVE'} />
          </div>
        </div>
      </div>

      {/* Sidebar + Map */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar — Desktop: always show, Mobile: slide-over */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          absolute md:relative z-20 md:z-auto
          w-72 sm:w-80 h-full
          border-r border-slate-200 dark:border-slate-800 
          bg-white dark:bg-slate-900 
          overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3
          transition-transform duration-200 ease-out
          md:block
        `}>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ACTIVE BROADCASTS</p>
          {busMarkers.length === 0 ? (
            <div className="p-4 sm:p-6 text-center text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <Radio size={22} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              No active GPS broadcasts
            </div>
          ) : (
            busMarkers.map((m) => (
              <div key={m.id} className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 transition-all">
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <BusIcon size={14} className="text-blue-600 dark:text-blue-400" /> {m.label}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Speed: {formatSpeed(m.speed)}</span>
                  <span>{timeAgo(locations[m.id]?.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile overlay backdrop */}
        {showSidebar && (
          <div
            className="absolute inset-0 bg-black/20 z-10 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Map */}
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
