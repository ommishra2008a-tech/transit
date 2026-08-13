import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Square, CheckCircle, Navigation, Radio, Gauge, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getActiveTrip, endTrip } from '../../services/trip.service';
import { getAssignedBus } from '../../services/bus.service';
import { updateLocation } from '../../services/location.service';
import { formatSpeed } from '../../utils/geo';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveGrid from '../../components/layout/ResponsiveGrid';

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
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (completed) {
    return (
      <PageContainer narrow>
        <Card className="p-6 sm:p-8 text-center animate-slide-up border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/30">
          <CheckCircle size={48} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Trip Completed ✓</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-5 sm:mb-6">Your trip has been recorded successfully</p>

          <ResponsiveGrid cols={2} gap={3}>
            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">Start Time</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {new Date(trip.start_time).toLocaleTimeString()}
              </p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">End Time</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {completedTrip?.end_time ? new Date(completedTrip.end_time).toLocaleTimeString() : '--'}
              </p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">Updates Sent</p>
              <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">{updateCount}</p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">Bus</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{bus?.bus_number}</p>
            </div>
          </ResponsiveGrid>

          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-xl sm:rounded-2xl h-11 sm:h-12 mt-5 sm:mt-6 text-sm"
            onClick={() => navigate('/driver')}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <Card className="animate-fade-in border-emerald-200 dark:border-emerald-900 overflow-hidden">
        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 flex-row items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{bus?.bus_number}</CardTitle>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Trip Currently Active</p>
          </div>
          <Badge variant="running" pulse>
            TRIP RUNNING
          </Badge>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <ResponsiveGrid cols={2} gap={3}>
            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Radio size={14} className={isTracking && latitude ? 'text-emerald-600 animate-pulse' : 'text-red-500'} />
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">GPS Signal</p>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {isTracking && latitude ? 'Active' : geoError ? 'Error' : 'Acquiring...'}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Gauge size={14} className="text-blue-600 dark:text-blue-400" />
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Speed</p>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{formatSpeed(speed)}</p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Navigation size={14} className="text-blue-600 dark:text-blue-400" />
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Position</p>
              </div>
              <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : '--'}
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Send size={14} className="text-blue-600 dark:text-blue-400" />
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Updates</p>
              </div>
              <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400">{updateCount}</p>
            </div>
          </ResponsiveGrid>

          {geoError && (
            <div className="mt-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-[10px] sm:text-xs font-semibold">
              GPS Warning: {geoError}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="danger"
        size="lg"
        className="w-full rounded-xl sm:rounded-2xl h-12 sm:h-14 text-sm sm:text-base font-extrabold shadow-lg shadow-red-600/20 cursor-pointer"
        onClick={handleEndTrip}
        disabled={ending}
      >
        {ending ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Ending Trip...
          </>
        ) : (
          <>
            <Square size={18} className="fill-current" />
            END TRIP
          </>
        )}
      </Button>
    </PageContainer>
  );
}
