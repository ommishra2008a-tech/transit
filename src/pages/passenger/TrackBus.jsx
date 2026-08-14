import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gauge, Clock, AlertTriangle, Radio, Navigation2, Compass } from 'lucide-react';
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
      .then((s) => setStops(s || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#070b14]">
        <div className="w-10 h-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
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
    <PageContainer full className="relative h-full overflow-hidden">
      {/* ===== FLOATING TOP CONTROL BAR ===== */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20"
      >
        <div className="max-w-4xl mx-auto glass-surface rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-xl border-slate-200 dark:border-slate-700 text-xs"
            >
              <ArrowLeft size={16} /> Back
            </Button>

            <div className="flex items-center gap-2">
              {isConnected && (
                <Badge variant="live" pulse>
                  LIVE SSE
                </Badge>
              )}
              <StatusBadge status={bus?.status || 'OFFLINE'} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                🚌 {bus?.bus_number}
                <span className="text-xs font-mono font-normal text-slate-400">({bus?.registration_number})</span>
              </h1>
              {route && (
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {route.start_location} → {route.end_location}
                </p>
              )}
            </div>

            {nextStopInfo && (
              <div className="bg-blue-50/90 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 p-2.5 rounded-2xl flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 backdrop-blur-md">
                <div className="min-w-0">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Next Station</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">{nextStopInfo.stop.stop_name}</p>
                </div>
                <div className="text-right border-l border-blue-200 dark:border-blue-800/80 pl-3 flex-shrink-0">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">ETA</p>
                  <p className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">{eta}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ===== FULL VIEWPORT MAP CONTAINER ===== */}
      <div className="flex-1 w-full h-full relative">
        {!location && (
          <div className="absolute inset-4 sm:inset-6 flex items-center justify-center z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="text-center p-6 max-w-sm">
              <div className="w-10 h-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-900 dark:text-white font-extrabold text-base">Waiting for Bus GPS Telemetry...</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Telemetry streams when driver starts trip</p>
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

      {/* ===== FLOATING BOTTOM TELEMETRY DOCK ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="absolute bottom-16 md:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-20 pointer-events-auto"
      >
        <div className="max-w-4xl mx-auto glass-surface rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/10">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                <Gauge size={16} className="text-blue-600 dark:text-blue-400" />
                {location ? formatSpeed(location.speed) : '-- km/h'}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400">
                <Navigation2 size={16} className="text-blue-600 dark:text-blue-400" />
                {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '--'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Clock size={14} />
                {timeAgo(lastUpdate)}
              </span>
              {isStale && (
                <span className="flex items-center gap-1 text-rose-500 font-extrabold text-[11px] font-mono">
                  <AlertTriangle size={14} /> STALE
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
