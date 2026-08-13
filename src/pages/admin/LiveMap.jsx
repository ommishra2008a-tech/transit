import { useState, useEffect, useRef } from 'react';
import { Bus as BusIcon, Radio } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import { subscribeToAllLocations } from '../../services/location.service';
import TransitMap from '../../components/Map/TransitMap';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { formatSpeed, timeAgo } from '../../utils/geo';
import Badge from '../../components/ui/Badge';

export default function LiveMap() {
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
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
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-xs z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Live Fleet Map
              <Badge variant="running" pulse>REALTIME</Badge>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {busMarkers.length} bus(es) active and broadcasting live GPS
            </p>
          </div>
          <StatusBadge status={busMarkers.length > 0 ? 'RUNNING' : 'INACTIVE'} />
        </div>
      </div>

      {/* Sidebar + Map */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-80 border-r border-slate-200 bg-white overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ACTIVE BROADCASTS</p>
          {busMarkers.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs rounded-xl bg-slate-50 border border-slate-200">
              <Radio size={24} className="mx-auto mb-2 text-slate-300" />
              No active GPS broadcasts
            </div>
          ) : (
            busMarkers.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-primary-300 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <BusIcon size={16} className="text-primary-700" /> {m.label}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Speed: {formatSpeed(m.speed)}</span>
                  <span>{timeAgo(locations[m.id]?.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 backdrop-blur-xs">
              <div className="w-8 h-8 border-3 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
            </div>
          )}
          <TransitMap
            busMarkers={busMarkers}
            fitBounds={allPoints.length >= 2 ? allPoints : null}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
