import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Square, CheckCircle, Navigation, Radio, Gauge, ArrowLeft, Bus, Activity, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getActiveTrip, endTrip } from '../../services/trip.service';
import { getAssignedBus } from '../../services/bus.service';
import { updateLocation } from '../../services/location.service';
import { formatSpeed } from '../../utils/geo';
import TransitMap from '../../components/Map/TransitMap';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function ActiveTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, speed, isTracking, startTracking, stopTracking } = useGeolocation();

  const [trip, setTrip] = useState(null);
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedTrip, setCompletedTrip] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const t = await getActiveTrip(user.id);
        if (!t) { navigate('/driver', { replace: true }); return; }
        setTrip(t);
        const b = await getAssignedBus(user.id);
        setBus(b);
        startTracking();
      } catch (e) {
        console.error(e);
        navigate('/driver', { replace: true });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, navigate, startTracking]);

  const sendLocation = useCallback(async () => {
    if (!latitude || !longitude || !trip || !bus) return;
    try {
      await updateLocation(bus.id, trip.id, latitude, longitude, speed || 0);
      setUpdateCount((c) => c + 1);
    } catch (e) {
      console.error('Location update failed:', e);
    }
  }, [latitude, longitude, speed, trip, bus]);

  useEffect(() => {
    if (isTracking && latitude && trip) {
      sendLocation();
      intervalRef.current = setInterval(sendLocation, 5000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isTracking, latitude, sendLocation, trip]);

  // Screen Wake Lock API for mobile drivers
  useEffect(() => {
    let wakeLock = null;
    async function requestLock() {
      if ('wakeLock' in navigator && isTracking) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (e) {
          console.warn('Screen Wake Lock skipped:', e.message);
        }
      }
    }
    requestLock();
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [isTracking]);

  async function handleEndTrip() {
    if (!trip || !bus) return;
    setEnding(true);
    try {
      stopTracking();
      if (intervalRef.current) clearInterval(intervalRef.current);
      const ended = await endTrip(trip.id, bus.id);
      setCompletedTrip({ ...trip, end_time: ended.end_time });
      setCompleted(true);
    } catch (e) {
      console.error(e);
      alert('Failed to end trip: ' + e.message);
    } finally {
      setEnding(false);
      setShowConfirmModal(false);
    }
  }

  if (loading) {
    return (
      <PageContainer narrow>
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="skeleton h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
        <div className="skeleton h-48 w-full rounded-3xl" />
      </PageContainer>
    );
  }

  // ===== TRIP COMPLETED SCREEN =====
  if (completed) {
    return (
      <PageContainer narrow className="py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center backdrop-blur-md"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <CheckCircle size={44} strokeWidth={2.5} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
            Trip Completed
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
            Your trip telemetry log has been recorded and finalized successfully.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">START TIME</p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                {new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">END TIME</p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                {completedTrip?.end_time ? new Date(completedTrip.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">UPDATES SENT</p>
              <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1">{updateCount || 1}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">BUS</p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1">{bus?.bus_number || 'BUS-101'}</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/driver')}
            className="w-full"
          >
            <ArrowLeft size={18} /> Back to Driver Dashboard
          </Button>
        </motion.div>
      </PageContainer>
    );
  }

  // ===== ACTIVE TRIP COCKPIT SCREEN =====
  const route = bus?.expand?.route_id;

  return (
    <PageContainer narrow>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Badge variant="running" pulse>
            BROADCASTING LIVE
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase border border-blue-200/80 dark:border-blue-800">
          <Lock size={12} /> Screen Lock Active
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Active Bus Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-3xl p-6 shadow-xl shadow-blue-600/20 border border-blue-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <Bus size={12} />
                <span>ACTIVE TRIP RUNNING</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {bus?.bus_number}
              </h2>
              <p className="text-xs text-blue-100 font-mono mt-0.5">
                {bus?.registration_number} • {route ? `${route.route_name}` : 'City Express Route'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md text-center min-w-[100px] flex-shrink-0">
              <p className="text-2xl font-extrabold">{Math.round(speed || 0)}</p>
              <p className="text-[10px] font-mono font-bold uppercase text-blue-200">KM/H SPEED</p>
            </div>
          </div>
        </div>

        {/* 2x2 Telemetry Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">
              <Radio size={14} className="text-emerald-500" />
              <span>GPS SIGNAL</span>
            </div>
            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE</span>
            </p>
          </div>

          <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">
              <Activity size={14} className="text-blue-500" />
              <span>PACKETS SENT</span>
            </div>
            <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {updateCount}
            </p>
          </div>
        </div>

        {/* Live Coordinates Box */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation size={18} className="text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-slate-400">LAT / LNG POSITION</p>
              <p className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                {latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Acquiring GPS fix...'}
              </p>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-xs h-56 relative overflow-hidden">
          <TransitMap
            busMarkers={[{ id: bus?.id || '1', latitude: latitude || 22.7196, longitude: longitude || 75.8577, label: bus?.bus_number || 'Bus' }]}
            center={latitude ? [latitude, longitude] : [22.7196, 75.8577]}
            height="100%"
          />
        </div>

        {/* END TRIP CTA */}
        <div className="pt-2">
          <Button
            variant="danger"
            size="xl"
            onClick={() => setShowConfirmModal(true)}
            disabled={ending}
            loading={ending}
            className="w-full text-base font-extrabold uppercase tracking-wider"
          >
            <Square size={18} className="fill-current" />
            END ACTIVE TRIP
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">End Active Trip?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will stop live GPS broadcasting and mark vehicle status back to ACTIVE.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleEndTrip} loading={ending}>
                Confirm End
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
}
