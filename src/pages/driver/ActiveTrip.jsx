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
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6">
        <Card className="p-8 text-center animate-slide-up border-emerald-200 bg-emerald-50/30">
          <CheckCircle size={56} className="text-emerald-600 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Trip Completed ✓</h1>
          <p className="text-slate-500 text-sm mb-6">Your trip has been recorded successfully</p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <p className="text-xs font-semibold text-slate-400">Start Time</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {new Date(trip.start_time).toLocaleTimeString()}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <p className="text-xs font-semibold text-slate-400">End Time</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {completedTrip?.end_time ? new Date(completedTrip.end_time).toLocaleTimeString() : '--'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <p className="text-xs font-semibold text-slate-400">Updates Sent</p>
              <p className="text-sm font-bold text-primary-700 mt-0.5">{updateCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <p className="text-xs font-semibold text-slate-400">Bus</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{bus?.bus_number}</p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-2xl h-12"
            onClick={() => navigate('/driver')}
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6 space-y-5">
      <Card className="animate-fade-in border-emerald-200 overflow-hidden">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{bus?.bus_number}</CardTitle>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Trip Currently Active</p>
          </div>
          <Badge variant="running" pulse>
            TRIP RUNNING
          </Badge>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Radio size={16} className={isTracking && latitude ? 'text-emerald-600 animate-pulse' : 'text-red-500'} />
                <p className="text-xs font-semibold text-slate-500">GPS Signal</p>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {isTracking && latitude ? 'Active' : geoError ? 'Error' : 'Acquiring...'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Gauge size={16} className="text-primary-600" />
                <p className="text-xs font-semibold text-slate-500">Speed</p>
              </div>
              <p className="text-sm font-bold text-slate-900">{formatSpeed(speed)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Navigation size={16} className="text-primary-600" />
                <p className="text-xs font-semibold text-slate-500">Position</p>
              </div>
              <p className="text-xs font-mono font-bold text-slate-800">
                {latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : '--'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Send size={16} className="text-primary-600" />
                <p className="text-xs font-semibold text-slate-500">Updates Sent</p>
              </div>
              <p className="text-sm font-bold text-primary-700">{updateCount}</p>
            </div>
          </div>

          {geoError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              GPS Signal Warning: {geoError}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="danger"
        size="lg"
        className="w-full rounded-2xl h-14 text-base font-extrabold shadow-lg shadow-red-600/20 cursor-pointer"
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
            <Square size={20} className="fill-current" />
            END TRIP
          </>
        )}
      </Button>
    </div>
  );
}
