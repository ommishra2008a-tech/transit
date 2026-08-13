import { useState, useEffect, useRef } from 'react';
import { getBuses } from '../../services/bus.service';
import { subscribeToAllLocations } from '../../services/location.service';
import TransitMap from '../../components/Map/TransitMap';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { formatSpeed, timeAgo } from '../../utils/geo';

export default function LiveMap() {
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef(null);

  useEffect(() => {
    // Load buses
    getBuses()
      .then((b) => { setBuses(b); setLoading(false); })
      .catch(console.error);

    // Subscribe to ALL location updates
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

  // Build bus markers from location data
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-4 bg-surface-950/90 backdrop-blur-sm border-b border-surface-800/50 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-surface-100">Live Fleet Map 📍</h1>
            <p className="text-xs text-surface-500">{busMarkers.length} bus(es) broadcasting live</p>
          </div>
          <StatusBadge status={busMarkers.length > 0 ? 'RUNNING' : 'INACTIVE'} />
        </div>
      </div>

      {/* Sidebar + Map layout */}
      <div className="flex-1 flex">
        {/* Bus list sidebar */}
        <div className="hidden md:block w-72 border-r border-surface-800/50 bg-surface-950/80 overflow-y-auto p-3 space-y-2">
          <p className="text-xs text-surface-500 font-medium mb-2 px-1">LIVE BUSES</p>
          {busMarkers.length === 0 ? (
            <p className="text-xs text-surface-600 px-1">No buses broadcasting</p>
          ) : (
            busMarkers.map((m) => (
              <div key={m.id} className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/30 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-surface-200">🚌 {m.label}</span>
                  <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse-dot" />
                </div>
                <p className="text-xs text-surface-500">
                  {formatSpeed(m.speed)} · {timeAgo(locations[m.id]?.timestamp)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface-900/60">
              <div className="w-8 h-8 border-3 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
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
