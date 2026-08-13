import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Bus as BusIcon, Navigation, ShieldAlert, Route as RouteIcon, MapPin, Radio, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAssignedBus } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import { getActiveTrip, startTrip } from '../../services/trip.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

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
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
        <div className="skeleton h-24 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skeleton h-44 rounded-2xl" />
          <div className="skeleton h-44 rounded-2xl" />
        </div>
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const route = bus?.expand?.route_id;
  const isTripActive = bus?.status === 'RUNNING' || activeTrip;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Driver Operational Header Card */}
      <div className="animate-fade-in bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio size={14} className={isTripActive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'} />
            <span>Operational Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {user?.name || 'Driver'} 👋
          </h1>
          <p className="text-slate-300 text-sm mt-1">Vehicle assignment & live telemetry broadcast controls</p>
        </div>

        {/* Live Trip Status Pill */}
        <div className="relative z-10 flex-shrink-0">
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 font-bold text-xs ${
            isTripActive 
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isTripActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isTripActive ? 'TRIP LIVE' : 'STATUS: READY'}</span>
          </div>
        </div>
      </div>

      {!bus ? (
        <Card className="p-8 text-center bg-white dark:bg-slate-900">
          <ShieldAlert size={44} className="text-amber-500 mx-auto mb-3" />
          <h3 className="text-slate-900 dark:text-white font-bold text-xl">No Bus Vehicle Assigned</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Your account is currently not assigned to an active transit bus. Please contact your Fleet Operations Admin.
          </p>
        </Card>
      ) : (
        <>
          {/* 2-Column Grid: Assigned Bus Info & Current Route */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assigned Bus Card */}
            <Card className="animate-fade-in overflow-hidden flex flex-col justify-between">
              <CardHeader className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between pb-3">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <BusIcon size={16} className="text-blue-600 dark:text-blue-400" /> Assigned Bus Info
                </CardTitle>
                <StatusBadge status={bus.status} />
              </CardHeader>
              <CardContent className="p-5 pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-100 dark:border-blue-900 flex-shrink-0">
                    <BusIcon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{bus.bus_number}</h3>
                    <p className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{bus.registration_number}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span>Vehicle Type: City Express</span>
                  <span>Capacity: 45 Passengers</span>
                </div>
              </CardContent>
            </Card>

            {/* Current Route Card */}
            <Card className="animate-fade-in overflow-hidden flex flex-col justify-between">
              <CardHeader className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between pb-3">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <RouteIcon size={16} className="text-emerald-600 dark:text-emerald-400" /> Current Route Line
                </CardTitle>
                <Badge variant="active" className="text-[10px]">
                  {stops.length} Stops
                </Badge>
              </CardHeader>
              <CardContent className="p-5 pt-4">
                {route ? (
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{route.route_name}</h4>
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2">
                        <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                        <span>{route.start_location}</span>
                        <span className="text-slate-400 font-normal">→</span>
                        <span>{route.end_location}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">No route configured for this bus.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Route Stops Sequence Timeline */}
          {stops.length > 0 && (
            <Card className="animate-fade-in overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation size={18} className="text-blue-600 dark:text-blue-400" /> Route Stop Sequence Timeline
                </CardTitle>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {stops.length} Stations
                </span>
              </CardHeader>
              <CardContent className="p-5">
                <StopList stops={stops} />
              </CardContent>
            </Card>
          )}

          {/* Start Trip Prominent Action Button */}
          <div className="pt-2">
            <Button
              variant="success"
              size="lg"
              className="w-full rounded-2xl h-14 text-base font-extrabold shadow-lg shadow-emerald-600/25 cursor-pointer uppercase tracking-wider"
              onClick={handleStartTrip}
              disabled={starting || bus.status === 'RUNNING'}
            >
              {starting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Initializing Broadcast...
                </>
              ) : bus.status === 'RUNNING' ? (
                <>
                  <CheckCircle2 size={22} className="mr-2" />
                  Trip Currently Active (Broadcasting GPS)
                </>
              ) : (
                <>
                  <Play size={22} className="fill-current mr-2" />
                  START TRIP & SHARE GPS
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
