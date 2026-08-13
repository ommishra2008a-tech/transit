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
import PageContainer from '../../components/layout/PageContainer';

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
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
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
    <PageContainer full>
      {/* Top Header Control Panel */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs z-10">
        <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-lg sm:rounded-xl border-slate-200 dark:border-slate-800 text-xs"
            >
              <ArrowLeft size={15} /> Back
            </Button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isConnected && (
                <Badge variant="running" pulse>
                  LIVE
                </Badge>
              )}
              <StatusBadge status={bus?.status || 'OFFLINE'} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pt-0.5 sm:pt-1">
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                🚌 {bus?.bus_number}
              </h1>
              {route && (
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {route.start_location} → {route.end_location}
                </p>
              )}
            </div>

            {nextStopInfo && (
              <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Next Stop</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">{nextStopInfo.stop.stop_name}</p>
                </div>
                <div className="text-right border-l border-blue-200 dark:border-blue-800 pl-3 sm:pl-4 flex-shrink-0">
                  <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">ETA</p>
                  <p className="text-xs sm:text-sm font-extrabold text-blue-700 dark:text-blue-400">{eta}</p>
                </div>
              </div>
            )}
          </div>

          {/* Telemetry Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Gauge size={13} className="text-blue-600 dark:text-blue-400" />
              {location ? formatSpeed(location.speed) : '--'}
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 font-mono">
              <Navigation size={13} className="text-blue-600 dark:text-blue-400" />
              {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '--'}
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <Clock size={13} className="text-slate-400 dark:text-slate-500" />
              {timeAgo(lastUpdate)}
            </span>
            {isStale && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <AlertTriangle size={13} /> Stale
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative p-1.5 sm:p-2 md:p-4">
        {!location && (
          <div className="absolute inset-2 sm:inset-4 flex items-center justify-center z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center p-4 sm:p-6 max-w-sm">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-800 dark:text-white font-bold text-sm sm:text-base">Waiting for bus GPS...</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">Location updates when driver starts trip</p>
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
    </PageContainer>
  );
}
