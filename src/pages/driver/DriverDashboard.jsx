import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Bus as BusIcon, Navigation, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAssignedBus } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import { getActiveTrip, startTrip } from '../../services/trip.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

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
        <div className="skeleton h-12 w-64 rounded-2xl" />
        <div className="skeleton h-40 w-full rounded-2xl" />
        <div className="skeleton h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const route = bus?.expand?.route_id;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6 space-y-5">
      {/* Welcome */}
      <div className="animate-fade-in bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#142d76]">
            Welcome, {user?.name || 'Driver'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Driver Portal & Trip Controls</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#f0f4ff] text-[#142d76] flex items-center justify-center">
          <BusIcon size={26} />
        </div>
      </div>

      {!bus ? (
        <Card className="p-8 text-center">
          <ShieldAlert size={40} className="text-amber-500 mx-auto mb-2" />
          <p className="text-slate-700 font-semibold text-lg">No bus assigned</p>
          <p className="text-xs text-slate-500 mt-1">Please contact your administrator to get assigned to a bus.</p>
        </Card>
      ) : (
        <>
          {/* Assigned Bus Card */}
          <Card className="animate-fade-in overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Assigned Bus Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f0f4ff] text-[#142d76] flex items-center justify-center font-bold">
                    <BusIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{bus.bus_number}</h3>
                    <p className="text-xs font-mono text-slate-500">{bus.registration_number}</p>
                  </div>
                </div>
                <StatusBadge status={bus.status} />
              </div>

              {route && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Route</p>
                  <p className="font-bold text-slate-900 text-base">{route.route_name}</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                    <Navigation size={14} className="text-[#142d76]" />
                    {route.start_location} → {route.end_location}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Stops */}
          {stops.length > 0 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-base">Route Stops Sequence</CardTitle>
              </CardHeader>
              <CardContent>
                <StopList stops={stops} />
              </CardContent>
            </Card>
          )}

          {/* Start Trip Button */}
          <Button
            variant="success"
            size="lg"
            className="w-full rounded-2xl h-14 text-base font-extrabold shadow-lg shadow-emerald-600/20 cursor-pointer"
            onClick={handleStartTrip}
            disabled={starting || bus.status === 'RUNNING'}
          >
            {starting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Starting Trip...
              </>
            ) : bus.status === 'RUNNING' ? (
              'Trip Currently Active'
            ) : (
              <>
                <Play size={20} className="fill-current" />
                START TRIP & SHARE GPS
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
