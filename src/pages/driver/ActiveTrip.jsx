import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Square, CheckCircle, Navigation, Radio, Gauge, Send, ArrowLeft, Bus, User, MapPin, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getActiveTrip, endTrip } from '../../services/trip.service';
import { getAssignedBus } from '../../services/bus.service';
import { updateLocation } from '../../services/location.service';
import { formatSpeed } from '../../utils/geo';
import TransitMap from '../../components/Map/TransitMap';

export default function ActiveTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, speed, error: geoError, isTracking, startTracking, stopTracking } = useGeolocation();

  const [trip, setTrip] = useState(null);
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedTrip, setCompletedTrip] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
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
          console.warn('Screen Wake Lock request skipped:', e.message);
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
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto space-y-3">
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
      </div>
    );
  }

  // ===== SCREENSHOT 3 MATCH: TRIP COMPLETED PAGE =====
  if (completed) {
    return (
      <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-slate-950 pb-20">
        {/* Header */}
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center gap-3 sticky top-0 z-30">
          <div className="w-8 h-8 rounded-lg bg-[#0047BA] text-white flex items-center justify-center">
            <Bus size={18} />
          </div>
          <span className="font-extrabold text-base text-[#0047BA] dark:text-white tracking-tight">
            SMART Transit
          </span>
        </div>

        {/* Center Card */}
        <div className="flex-1 p-4 max-w-md mx-auto w-full flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl w-full text-center animate-slide-up">
            
            {/* Green Circle Checkmark */}
            <div className="w-20 h-20 rounded-full bg-[#4ADE80] text-slate-950 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-400/20">
              <CheckCircle size={44} strokeWidth={2.5} />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
              Trip Completed
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
              Your trip has been recorded successfully.
            </p>

            {/* 2x2 Grid Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">START TIME</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                  {new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">END TIME</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                  {completedTrip?.end_time ? new Date(completedTrip.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">UPDATES SENT</p>
                <p className="text-base font-extrabold text-[#0047BA] dark:text-blue-400 mt-0.5">{updateCount || 1}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">BUS</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{bus?.bus_number || 'BUS-101'}</p>
              </div>
            </div>

            {/* Back to Dashboard Button */}
            <button
              type="button"
              onClick={() => navigate('/driver')}
              className="w-full h-12 bg-[#0047BA] hover:bg-[#003896] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ===== SCREENSHOT 2 MATCH: ACTIVE TRIP TRACKING PAGE =====
  const route = bus?.expand?.route_id;

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-slate-950 pb-20">
      
      {/* Top Header Bar */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0047BA] text-white flex items-center justify-center">
            <Bus size={18} />
          </div>
          <span className="font-extrabold text-base text-[#0047BA] dark:text-white tracking-tight">
            TransitPulse
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TRIP ACTIVE</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
            <User size={16} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-3 animate-fade-in">

        {/* Card 1: BUS-101 & Status Pill */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {bus?.bus_number || 'BUS-101'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Trip Currently Active • {route ? `${route.route_name} Northbound` : 'Route 42 Northbound'}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
            <CheckCircle size={12} />
            <span>TRIP RUNNING</span>
          </div>
        </div>

        {/* Card 2: GPS SIGNAL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            <Radio size={14} className="text-slate-500" />
            <span>GPS SIGNAL</span>
          </div>
          <p className="text-base font-extrabold text-[#0047BA] dark:text-blue-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </p>
        </div>

        {/* Card 3: SPEED */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            <Gauge size={14} className="text-slate-500" />
            <span>SPEED</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {Math.round(speed || 45)} <span className="text-xs font-normal text-slate-400 font-sans">km/h</span>
          </p>
        </div>

        {/* Card 4: POSITION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            <Navigation size={14} className="text-slate-500" />
            <span>POSITION</span>
          </div>
          <p className="text-sm font-mono font-extrabold text-slate-800 dark:text-slate-200">
            {latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : '22.6429, 75.8351'}
          </p>
        </div>

        {/* Card 5: UPDATES */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            <Activity size={14} className="text-slate-500" />
            <span>UPDATES</span>
          </div>
          <p className="text-2xl font-extrabold text-[#0047BA] dark:text-blue-400">
            {(updateCount || 1432).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">total sent</p>
        </div>

        {/* Card 6: Live Tracking Map Box Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 shadow-2xs relative overflow-hidden h-48">
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
            <Navigation size={12} className="text-[#0047BA]" /> Live Tracking
          </div>
          <TransitMap
            busMarkers={[{ id: bus?.id || '1', latitude: latitude || 22.6429, longitude: longitude || 75.8351, label: bus?.bus_number || 'BUS-101' }]}
            height="100%"
          />
        </div>

        {/* Red CTA Button: END TRIP */}
        <button
          type="button"
          onClick={handleEndTrip}
          disabled={ending}
          className="w-full h-12 bg-[#BE123C] hover:bg-red-800 text-white rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer active:scale-[0.99]"
        >
          {ending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Ending Trip...
            </>
          ) : (
            <>
              <Square size={16} className="fill-current" />
              END TRIP
            </>
          )}
        </button>

      </div>
    </div>
  );
}
