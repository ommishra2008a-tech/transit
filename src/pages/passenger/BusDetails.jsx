import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Bus, Route as RouteIcon, ShieldCheck } from 'lucide-react';
import { getBusById } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import StopList from '../../components/StopList/StopList';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/ui/Button';

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
        if (b?.route_id) return getStopsByRoute(b.route_id);
        return [];
      })
      .then((s) => setStops(s || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageContainer narrow>
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="skeleton h-28 w-full rounded-3xl" />
        <div className="skeleton h-24 w-full rounded-3xl" />
        <div className="skeleton h-64 w-full rounded-3xl" />
      </PageContainer>
    );
  }

  if (!bus) {
    return (
      <PageContainer narrow className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <Bus size={32} />
        </div>
        <p className="text-slate-900 dark:text-white font-extrabold text-lg">Bus Vehicle Not Found</p>
        <p className="text-slate-400 text-xs mt-1">The requested bus vehicle does not exist or was removed.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </PageContainer>
    );
  }

  const route = bus.expand?.route_id;

  return (
    <PageContainer narrow>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          VEHICLE SPECIFICATION
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Vehicle Hero Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-100 dark:border-blue-900">
            <Bus size={28} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {bus.bus_number}
            </h2>
            <StatusBadge status={bus.status} />
          </div>

          <p className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {bus.registration_number}
          </p>
        </div>

        {/* Route Line Card */}
        {route && (
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <RouteIcon size={14} className="text-blue-500" />
                <span>ASSIGNED ROUTE LINE</span>
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{stops.length} STATIONS</span>
            </div>

            <div className="pt-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-slate-400">ORIGIN</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{route.start_location}</p>
              </div>
              <span className="text-blue-500 text-lg font-bold">→</span>
              <div className="min-w-0 text-right">
                <p className="text-[10px] font-mono text-slate-400">DESTINATION</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{route.end_location}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stop Timeline */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Station Stop Sequence
          </h3>
          <StopList stops={stops} currentStopIndex={0} />
        </div>

        {/* Action CTA */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="xl"
            onClick={() => navigate(`/passenger/track/${bus.id}`)}
            className="w-full shadow-lg"
          >
            <MapPin size={20} />
            Track Bus Live on Map
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}
