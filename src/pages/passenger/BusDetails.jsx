import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, MoreVertical } from 'lucide-react';
import { getBusById } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
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
        if (b?.route_id) return getStopsByRoute(b.route_id);
        return [];
      })
      .then((s) => setStops(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 p-4 max-w-md mx-auto space-y-3">
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="flex-1 p-6 max-w-md mx-auto text-center">
        <p className="text-3xl mb-2">🚫</p>
        <p className="text-slate-500 font-semibold text-sm">Bus vehicle not found</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[#0047BA] text-white font-bold text-xs rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  const route = bus.expand?.route_id;

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-slate-950 pb-20">
      
      {/* Top Header Bar */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-[#0047BA] dark:text-blue-400" />
        </button>

        <h1 className="text-lg font-extrabold text-[#0047BA] dark:text-white tracking-tight">
          Bus Details
        </h1>

        <button
          type="button"
          className="p-1.5 rounded-lg text-[#0047BA] dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-3.5 animate-fade-in">

        {/* Card 1: BUS-102 & Registration (Centered) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xs text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {bus.bus_number}
          </h2>
          <p className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
            {bus.registration_number}
          </p>
        </div>

        {/* Card 2: ROUTE LINE & Stop Count */}
        {route && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-2.5">
              <span>ROUTE LINE</span>
              <span className="text-[#0047BA] dark:text-blue-400">{stops.length} STOPS</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center gap-3">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{route.start_location}</span>
              <span className="text-slate-400 text-base">→</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{route.end_location}</span>
            </div>
          </div>
        )}

        {/* Card 3: Route Stop Sequence Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
            Route Stop Sequence
          </h3>
          <StopList stops={stops} currentStopIndex={0} />
        </div>

        {/* Action Button: Track Bus Live */}
        <button
          type="button"
          onClick={() => navigate(`/passenger/track/${bus.id}`)}
          className="w-full h-12 bg-[#0047BA] hover:bg-[#003896] text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-[0.99]"
        >
          <MapPin size={18} />
          Track Bus Live
        </button>

      </div>
    </div>
  );
}
