import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBusById } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';

export default function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <p className="text-3xl mb-2">🚫</p>
        <p className="text-surface-400">Bus not found</p>
        <button className="btn btn-ghost mt-4" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const route = bus.expand?.route_id;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6">
      {/* Back button */}
      <button
        className="text-surface-400 hover:text-surface-200 text-sm mb-4 flex items-center gap-1 transition-colors"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Bus Header */}
      <div className="glass-card p-6 mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center text-2xl">
              🚌
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-100">{bus.bus_number}</h1>
              <p className="text-sm text-surface-500">{bus.registration_number}</p>
            </div>
          </div>
          <StatusBadge status={bus.status} />
        </div>

        {route && (
          <div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
            <p className="text-sm text-surface-400 mb-1">Route</p>
            <p className="font-semibold text-surface-200">{route.route_name}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-surface-400">
              <span className="w-2 h-2 rounded-full bg-success-400" />
              {route.start_location}
              <span className="text-surface-600">→</span>
              <span className="w-2 h-2 rounded-full bg-danger-400" />
              {route.end_location}
            </div>
          </div>
        )}
      </div>

      {/* Stops */}
      <div className="glass-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h2 className="text-lg font-semibold text-surface-200 mb-4">Route Stops</h2>
        <StopList stops={stops} />
      </div>

      {/* Track Button */}
      {bus.status === 'RUNNING' ? (
        <button
          className="btn btn-primary btn-lg w-full animate-fade-in"
          style={{ animationDelay: '200ms' }}
          onClick={() => navigate(`/passenger/track/${bus.id}`)}
        >
          📍 Track Bus Live
        </button>
      ) : (
        <div className="glass-card p-4 text-center text-surface-500 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p>🔴 Bus is currently <strong>{bus.status}</strong></p>
          <p className="text-xs mt-1">Live tracking available when the bus is running</p>
        </div>
      )}
    </div>
  );
}
