import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBusById } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import { useRealtimeLocation } from '../../hooks/useRealtimeLocation';
import TransitMap from '../../components/Map/TransitMap';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { calculateETA, findNextStop, formatSpeed, timeAgo } from '../../utils/geo';

export default function TrackBus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const { location, isConnected, lastUpdate, isStale } = useRealtimeLocation(id);

  useEffect(() => {
    getBusById(id)
      .then((b) => {
        setBus(b);
        if (b.route_id) return getStopsByRoute(b.route_id);
        return [];
      })
      .then((s) => setStops(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  const route = bus?.expand?.route_id;
  const nextStopInfo = location && stops.length > 0
    ? findNextStop(location.latitude, location.longitude, stops)
    : null;
  const eta = nextStopInfo && location
    ? calculateETA(nextStopInfo.distance, location.speed)
    : 'Calculating...';

  // Map data
  const busMarkers = location ? [{
    id: bus.id,
    latitude: location.latitude,
    longitude: location.longitude,
    speed: location.speed,
    label: bus.bus_number,
  }] : [];

  const routeLine = stops.map((s) => [s.latitude, s.longitude]);

  const allPoints = [
    ...stops.map((s) => [s.latitude, s.longitude]),
    ...(location ? [[location.latitude, location.longitude]] : []),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Info Panel */}
      <div className="p-4 bg-surface-950/90 backdrop-blur-sm border-b border-surface-800/50 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button className="text-surface-400 hover:text-surface-200 text-sm" onClick={() => navigate(-1)}>← Back</button>
            <div className="flex items-center gap-2">
              {isConnected && <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse-dot" />}
              <StatusBadge status={bus?.status || 'OFFLINE'} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-surface-100">{bus?.bus_number}</h1>
              {route && <p className="text-sm text-surface-400">{route.start_location} → {route.end_location}</p>}
            </div>
            <div className="text-right">
              {nextStopInfo && (
                <>
                  <p className="text-xs text-surface-500">Next Stop</p>
                  <p className="text-sm font-semibold text-primary-400">{nextStopInfo.stop.stop_name}</p>
                  <p className="text-xs text-surface-400">ETA: {eta}</p>
                </>
              )}
            </div>
          </div>

          {/* Live stats bar */}
          <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
            <span>🏎️ {location ? formatSpeed(location.speed) : '--'}</span>
            <span>📍 {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '--'}</span>
            <span>🕐 {timeAgo(lastUpdate)}</span>
            {isStale && <span className="text-warning-400">⚠️ Stale</span>}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {!location && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface-900/50 backdrop-blur-sm">
            <div className="glass-card p-6 text-center">
              <div className="w-8 h-8 border-3 border-primary-400/30 border-t-primary-400 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-surface-300">Waiting for bus location...</p>
              <p className="text-xs text-surface-500 mt-1">Location will appear when the driver starts sharing GPS</p>
            </div>
          </div>
        )}
        <TransitMap
          busMarkers={busMarkers}
          stopMarkers={stops}
          routeLine={routeLine}
          fitBounds={allPoints.length >= 2 ? allPoints : null}
          center={location ? [location.latitude, location.longitude] : [22.7196, 75.8577]}
          height="100%"
        />
      </div>
    </div>
  );
}
