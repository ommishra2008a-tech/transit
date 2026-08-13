import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Gauge, Clock, AlertTriangle } from 'lucide-react';
import { getBusById } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import { useRealtimeLocation } from '../../hooks/useRealtimeLocation';
import TransitMap from '../../components/Map/TransitMap';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
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
        if (b?.route_id) return getStopsByRoute(b.route_id);
        return [];
      })
      .then((s) => setStops(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
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
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-slate-50">
      {/* Top Header Control Panel */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-xs z-10">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-xl border-slate-200"
            >
              <ArrowLeft size={16} /> Back
            </Button>
            <div className="flex items-center gap-2">
              {isConnected && (
                <Badge variant="running" pulse>
                  LIVE SIGNAL
                </Badge>
              )}
              <StatusBadge status={bus?.status || 'OFFLINE'} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                🚌 {bus?.bus_number}
              </h1>
              {route && (
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {route.start_location} → {route.end_location}
                </p>
              )}
            </div>

            {nextStopInfo && (
              <div className="bg-primary-50 border border-primary-200 p-3 rounded-2xl flex items-center justify-between md:justify-end gap-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700">Next Upcoming Stop</p>
                  <p className="text-sm font-extrabold text-slate-900">{nextStopInfo.stop.stop_name}</p>
                </div>
                <div className="text-right border-l border-primary-200 pl-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700">ETA</p>
                  <p className="text-sm font-extrabold text-primary-700">{eta}</p>
                </div>
              </div>
            )}
          </div>

          {/* Telemetry Bar */}
          <div className="flex items-center gap-6 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <Gauge size={14} className="text-primary-600" />
              {location ? formatSpeed(location.speed) : '--'}
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <Navigation size={14} className="text-primary-600" />
              {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '--'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              {timeAgo(lastUpdate)}
            </span>
            {isStale && (
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <AlertTriangle size={14} /> Location Stale
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative p-2 md:p-4">
        {!location && (
          <div className="absolute inset-4 flex items-center justify-center z-10 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200">
            <div className="text-center p-6 max-w-sm">
              <div className="w-10 h-10 border-3 border-primary-600/30 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-800 font-bold">Waiting for bus GPS location...</p>
              <p className="text-xs text-slate-500 mt-1">Location will update live when driver starts the trip</p>
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
