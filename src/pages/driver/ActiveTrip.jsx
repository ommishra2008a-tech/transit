import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getActiveTrip, endTrip } from '../../services/trip.service';
import { getAssignedBus } from '../../services/bus.service';
import { updateLocation } from '../../services/location.service';
import { formatSpeed } from '../../utils/geo';

export default function ActiveTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { latitude, longitude, speed, accuracy, error: geoError, isTracking, startTracking, stopTracking } = useGeolocation();

  const [trip, setTrip] = useState(null);
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedTrip, setCompletedTrip] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef(null);

  // Load trip data
  useEffect(() => {
    async function load() {
      try {
        const t = await getActiveTrip(user.id);
        if (!t) { navigate('/driver', { replace: true }); return; }
        setTrip(t);
        const b = await getAssignedBus(user.id);
        setBus(b);
        // Start GPS tracking
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

  // Send location updates every 5 seconds
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
      // Send immediately
      sendLocation();
      // Then every 5 seconds
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
        <div className="w-8 h-8 border-3 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Trip Completed State
  if (completed) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6">
        <div className="glass-card p-8 text-center animate-slide-up">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-success-400 mb-2">Trip Completed</h1>
          <p className="text-surface-400 mb-6">Your trip has been recorded successfully</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-surface-800/50">
              <p className="text-xs text-surface-500">Start Time</p>
              <p className="text-sm font-semibold text-surface-200">
                {new Date(trip.start_time).toLocaleTimeString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/50">
              <p className="text-xs text-surface-500">End Time</p>
              <p className="text-sm font-semibold text-surface-200">
                {completedTrip?.end_time ? new Date(completedTrip.end_time).toLocaleTimeString() : '--'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/50">
              <p className="text-xs text-surface-500">Location Updates</p>
              <p className="text-sm font-semibold text-surface-200">{updateCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/50">
              <p className="text-xs text-surface-500">Bus</p>
              <p className="text-sm font-semibold text-surface-200">{bus?.bus_number}</p>
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/driver')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active Trip State
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6">
      {/* Trip Active Header */}
      <div className="glass-card p-6 mb-4 animate-fade-in border-success-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-surface-100">{bus?.bus_number}</h1>
            <p className="text-sm text-surface-500">Trip Active</p>
          </div>
          <div className="badge badge-running text-sm px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse-dot" />
            TRIP ACTIVE
          </div>
        </div>

        {/* GPS Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-surface-800/50">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${isTracking && latitude ? 'bg-success-400 animate-pulse-dot' : 'bg-danger-400'}`} />
              <p className="text-xs text-surface-500">GPS Status</p>
            </div>
            <p className="text-sm font-semibold text-surface-200">
              {isTracking && latitude ? 'Tracking' : geoError ? 'Error' : 'Connecting...'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface-800/50">
            <p className="text-xs text-surface-500 mb-1">Speed</p>
            <p className="text-sm font-semibold text-surface-200">{formatSpeed(speed)}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-800/50">
            <p className="text-xs text-surface-500 mb-1">Position</p>
            <p className="text-xs font-mono text-surface-300">
              {latitude ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : '--'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface-800/50">
            <p className="text-xs text-surface-500 mb-1">Updates Sent</p>
            <p className="text-sm font-semibold text-primary-400">{updateCount}</p>
          </div>
        </div>

        {geoError && (
          <div className="mt-3 p-2 rounded-lg bg-danger-500/10 border border-danger-500/30 text-danger-400 text-xs">
            GPS Error: {geoError}
          </div>
        )}
      </div>

      {/* End Trip Button */}
      <button
        className="btn btn-danger btn-lg w-full"
        onClick={handleEndTrip}
        disabled={ending}
      >
        {ending ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Ending...</>
        ) : '⏹ END TRIP'}
      </button>
    </div>
  );
}
