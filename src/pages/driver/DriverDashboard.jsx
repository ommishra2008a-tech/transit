import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Bus as BusIcon, Navigation, ShieldAlert, Route as RouteIcon, Radio, CheckCircle2, Navigation2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAssignedBus } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import { getActiveTrip, startTrip } from '../../services/trip.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import StopList from '../../components/StopList/StopList';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
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
        setStops(s || []);
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
      <PageContainer narrow>
        <div className="skeleton h-28 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
        <div className="skeleton h-60 w-full rounded-3xl" />
      </PageContainer>
    );
  }

  const route = bus?.expand?.route_id;
  const isTripActive = bus?.status === 'RUNNING' || activeTrip;

  return (
    <PageContainer narrow>
      {/* Hero Banner */}
      <PageHeader
        title={`Welcome, ${user?.name || 'Driver'} 👋`}
        subtitle="Assigned vehicle console & live telemetry broadcast controls."
        badge="Driver Operational Console"
        badgeIcon={Navigation2}
        statusPill={
          <div className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5 backdrop-blur-md">
            <Radio size={12} className={isTripActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'} />
            <span>{isTripActive ? 'BROADCASTING' : 'STANDBY'}</span>
          </div>
        }
      />

      {!bus ? (
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-8 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <ShieldAlert size={40} className="text-amber-500 mx-auto mb-3 animate-pulse" />
          <h3 className="text-slate-900 dark:text-white font-extrabold text-lg">No Vehicle Assigned</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Your account is not assigned to a bus vehicle. Contact Fleet Operations Admin for assignment.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Side-by-Side Assigned Bus & Route Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Assigned Bus Card */}
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative backdrop-blur-md">
              <div className="absolute top-4 right-4">
                <StatusBadge status={bus.status} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900">
                  <BusIcon size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ASSIGNED VEHICLE</span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                {bus.bus_number}
              </h3>
              <p className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 mt-1">
                {bus.registration_number}
              </p>
            </div>

            {/* Current Route Card */}
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-100 dark:border-emerald-900">
                  <RouteIcon size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ASSIGNED ROUTE</span>
              </div>

              {route ? (
                <>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {route.start_location} <span className="text-blue-500">→</span> {route.end_location}
                  </p>
                  <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1">
                    {stops.length} Station Stops
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">No route assigned</p>
              )}
            </div>
          </div>

          {/* Route Stops Sequence */}
          {stops.length > 0 && (
            <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden backdrop-blur-md">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">Route Station Timeline</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-700">
                  {stops.length} STATIONS
                </span>
              </div>

              <div className="p-5">
                <StopList stops={stops} currentStopIndex={0} />
              </div>
            </div>
          )}

          {/* START TRIP Action CTA */}
          <div className="pt-2">
            <Button
              variant={isTripActive ? 'secondary' : 'success'}
              size="xl"
              onClick={handleStartTrip}
              disabled={starting || isTripActive}
              loading={starting}
              className="w-full text-base font-extrabold uppercase tracking-wider shadow-lg"
            >
              {isTripActive ? (
                <>
                  <CheckCircle2 size={20} />
                  Trip Active (Broadcasting Live GPS)
                </>
              ) : (
                <>
                  <Play size={20} className="fill-current" />
                  START TRIP & STREAM GPS
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </PageContainer>
  );
}
