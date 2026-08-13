import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Bus as BusIcon, Navigation, ShieldAlert, Route as RouteIcon, MapPin, Radio, CheckCircle2 } from 'lucide-react';
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
      <div className="flex-1 px-4 py-3 space-y-3 max-w-lg mx-auto w-full">
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="skeleton h-28 rounded-xl" />
          <div className="skeleton h-28 rounded-xl" />
        </div>
        <div className="skeleton h-60 w-full rounded-xl" />
      </div>
    );
  }

  const route = bus?.expand?.route_id;
  const isTripActive = bus?.status === 'RUNNING' || activeTrip;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-3.5 py-3.5 space-y-3">

          {/* ===== COMPACT HERO BANNER ===== */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white rounded-xl p-4 shadow-sm relative overflow-hidden animate-fade-in">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Radio size={12} className={isTripActive ? 'text-emerald-300 animate-pulse' : ''} />
                OPERATIONAL CONSOLE
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-tight">
                Welcome, {user?.name || 'Driver'} 👋
              </h1>
              <p className="text-blue-100 text-xs mt-0.5 leading-snug">
                Vehicle assignment & live telemetry broadcast controls
              </p>
            </div>
          </div>

          {!bus ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 text-center border border-slate-200 dark:border-slate-800 shadow-2xs">
              <ShieldAlert size={36} className="text-amber-500 mx-auto mb-2" />
              <h3 className="text-slate-900 dark:text-white font-bold text-base">No Bus Assigned</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs mx-auto">
                Your account is not assigned to a bus. Contact Fleet Operations Admin.
              </p>
            </div>
          ) : (
            <>
              {/* ===== COMPACT TWO SIDE-BY-SIDE CARDS ===== */}
              <div className="grid grid-cols-2 gap-2.5 animate-fade-in">
                {/* Assigned Bus Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs relative">
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={bus.status} />
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <BusIcon size={14} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Assigned Bus</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                    {bus.bus_number}
                  </h3>
                  <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                    {bus.registration_number}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                    City Express <span className="font-bold text-slate-700 dark:text-slate-300">45</span> Capacity
                  </div>
                </div>

                {/* Current Route Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <RouteIcon size={14} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Route</span>
                  </div>

                  {route ? (
                    <>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {route.start_location} <span className="text-slate-400">→</span> {route.end_location}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{stops.length} Stops</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline">View Details</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No route assigned</p>
                  )}
                </div>
              </div>

              {/* ===== COMPACT ROUTE STOPS CARD ===== */}
              {stops.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden animate-fade-in">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Navigation size={14} className="text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">Route Stops</h3>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                      {stops.length} STATIONS
                    </span>
                  </div>

                  <div className="px-3.5 py-2">
                    <StopList stops={stops} currentStopIndex={0} />
                  </div>
                </div>
              )}

              {/* ===== COMPACT GREEN CTA BUTTON ===== */}
              <div className="animate-fade-in pt-0.5">
                <button
                  type="button"
                  className={`w-full h-11 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                    starting || bus.status === 'RUNNING'
                      ? 'bg-slate-400 dark:bg-slate-600 shadow-none cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:scale-[0.99]'
                  }`}
                  onClick={handleStartTrip}
                  disabled={starting || bus.status === 'RUNNING'}
                >
                  {starting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Initializing...
                    </>
                  ) : bus.status === 'RUNNING' ? (
                    <>
                      <CheckCircle2 size={16} />
                      Trip Active (Broadcasting)
                    </>
                  ) : (
                    <>
                      <Play size={15} className="fill-current" />
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
