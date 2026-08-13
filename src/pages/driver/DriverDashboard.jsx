import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Bus as BusIcon, Navigation, ShieldAlert, Route as RouteIcon, MapPin, Radio, CheckCircle2, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAssignedBus } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import { getActiveTrip, startTrip } from '../../services/trip.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';
import Button from '../../components/ui/Button';

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
      <div className="flex-1 px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
        </div>
        <div className="skeleton h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const route = bus?.expand?.route_id;
  const isTripActive = bus?.status === 'RUNNING' || activeTrip;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-4 py-4 space-y-4">

          {/* ===== HERO BANNER — Blue gradient ===== */}
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden animate-fade-in">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 text-blue-100 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Radio size={13} className={isTripActive ? 'text-emerald-300 animate-pulse' : ''} />
                OPERATIONAL CONSOLE
              </div>
              <h1 className="text-[22px] sm:text-2xl font-extrabold tracking-tight leading-tight">
                Welcome, {user?.name || 'Driver'} 👋
              </h1>
              <p className="text-blue-100 text-[13px] mt-1 leading-snug">
                Vehicle assignment & live telemetry broadcast controls
              </p>
            </div>
          </div>

          {!bus ? (
            /* No bus assigned */
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <ShieldAlert size={40} className="text-amber-500 mx-auto mb-3" />
              <h3 className="text-slate-900 dark:text-white font-bold text-lg">No Bus Assigned</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Your account is not assigned to a bus. Contact Fleet Operations Admin.
              </p>
            </div>
          ) : (
            <>
              {/* ===== TWO SIDE-BY-SIDE CARDS ===== */}
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                {/* Assigned Bus Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                  {/* Status badge top-right */}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={bus.status} />
                  </div>

                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <BusIcon size={16} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Assigned Bus</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                    {bus.bus_number}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                    {bus.registration_number}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-medium space-y-0.5">
                    <p>City Express <span className="font-bold text-slate-700 dark:text-slate-300">45</span> Capacity</p>
                  </div>
                </div>

                {/* Current Route Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <RouteIcon size={16} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Route</span>
                  </div>

                  {route ? (
                    <>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                        {route.start_location} <span className="text-slate-400">→</span> {route.end_location}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{stops.length} Stops</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline">View Details</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No route assigned</p>
                  )}
                </div>
              </div>

              {/* ===== ROUTE STOPS CARD ===== */}
              {stops.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation size={16} className="text-blue-600 dark:text-blue-400" />
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Route Stops</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                      {stops.length} Stations
                    </span>
                  </div>

                  {/* Stop List */}
                  <div className="px-4 py-3">
                    <StopList stops={stops} currentStopIndex={0} />
                  </div>
                </div>
              )}

              {/* ===== GREEN CTA BUTTON ===== */}
              <div className="animate-fade-in">
                <button
                  type="button"
                  className={`w-full h-[52px] rounded-2xl text-white font-extrabold text-[14px] uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
                    starting || bus.status === 'RUNNING'
                      ? 'bg-slate-400 dark:bg-slate-600 shadow-none cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 active:scale-[0.98]'
                  }`}
                  onClick={handleStartTrip}
                  disabled={starting || bus.status === 'RUNNING'}
                >
                  {starting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Initializing...
                    </>
                  ) : bus.status === 'RUNNING' ? (
                    <>
                      <CheckCircle2 size={20} />
                      Trip Active (Broadcasting)
                    </>
                  ) : (
                    <>
                      <Play size={18} className="fill-current" />
                      START TRIP & SHARE GPS
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
