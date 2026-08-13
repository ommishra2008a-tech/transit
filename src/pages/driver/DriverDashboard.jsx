import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAssignedBus } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import { getActiveTrip, startTrip } from '../../services/trip.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';

export default function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [stops, setStops] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const b = await getAssignedBus(user.id);
      setBus(b);
      if (b?.route_id) {
        const s = await getStopsByRoute(b.route_id);
        setStops(s);
      }
      const trip = await getActiveTrip(user.id);
      setActiveTrip(trip);
      if (trip) navigate('/driver/trip', { replace: true });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTrip() {
    if (!bus) return;
    setStarting(true);
    try {
      const trip = await startTrip(bus.id, user.id, bus.route_id);
      setActiveTrip(trip);
      navigate('/driver/trip');
    } catch (e) {
      console.error(e);
      alert('Failed to start trip: ' + e.message);
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  const route = bus?.expand?.route_id;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6">
      {/* Welcome */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-100">
          Welcome, {user?.name || 'Driver'} 🚌
        </h1>
        <p className="text-surface-500">Your driving dashboard</p>
      </div>

      {!bus ? (
        <div className="glass-card p-8 text-center">
          <p className="text-3xl mb-2">🚫</p>
          <p className="text-surface-400">No bus assigned to you</p>
          <p className="text-xs text-surface-500 mt-1">Contact admin to get assigned</p>
        </div>
      ) : (
        <>
          {/* Assigned Bus */}
          <div className="glass-card p-6 mb-6 animate-fade-in">
            <h2 className="text-sm font-medium text-surface-500 mb-3">YOUR ASSIGNED BUS</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-600/20 flex items-center justify-center text-3xl">
                  🚌
                </div>
                <div>
                  <h3 className="text-xl font-bold text-surface-100">{bus.bus_number}</h3>
                  <p className="text-sm text-surface-500">{bus.registration_number}</p>
                </div>
              </div>
              <StatusBadge status={bus.status} />
            </div>

            {route && (
              <div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
                <p className="text-sm text-surface-400 mb-1">Assigned Route</p>
                <p className="font-semibold text-surface-200">{route.route_name}</p>
                <p className="text-sm text-surface-400 mt-0.5">
                  {route.start_location} → {route.end_location}
                </p>
              </div>
            )}
          </div>

          {/* Route Stops */}
          {stops.length > 0 && (
            <div className="glass-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <h2 className="text-sm font-medium text-surface-500 mb-4">ROUTE STOPS</h2>
              <StopList stops={stops} />
            </div>
          )}

          {/* Start Trip Button */}
          <button
            className="btn btn-success btn-lg w-full animate-fade-in"
            style={{ animationDelay: '200ms' }}
            onClick={handleStartTrip}
            disabled={starting || bus.status === 'RUNNING'}
          >
            {starting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Starting...</>
            ) : bus.status === 'RUNNING' ? (
              'Trip Already Active'
            ) : (
              '▶ START TRIP'
            )}
          </button>
        </>
      )}
    </div>
  );
}
