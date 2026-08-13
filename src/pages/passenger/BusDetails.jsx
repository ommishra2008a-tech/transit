import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      <div className="p-6 max-w-lg mx-auto space-y-4">
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <p className="text-3xl mb-2">🚫</p>
        <p className="text-slate-500">Bus not found</p>
        <button className="btn-navy mt-4" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const route = bus.expand?.route_id;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between pb-24">
      {/* Top Header Bar */}
      <div className="bg-[#e2e8f0]/80 backdrop-blur-sm px-4 py-3.5 flex items-center justify-between sticky top-0 z-10 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center text-[#142d76] hover:bg-slate-300/50 rounded-full transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#142d76] font-mono tracking-wide">{bus.bus_number}</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4 animate-slide-up flex-1">
        {/* Top Route & Status Card */}
        {route && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="font-semibold text-slate-800 text-base md:text-lg flex items-center gap-2">
              <span>{route.start_location}</span>
              <span className="text-slate-400">→</span>
              <span>{route.end_location}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007a4d] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />
              {bus.status === 'RUNNING' ? 'RUNNING' : bus.status}
            </span>
          </div>
        )}

        {/* Stop Sequence Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Stop Sequence</h2>
          <StopList stops={stops} currentStopIndex={0} />
        </div>
      </div>

      {/* Fixed Bottom Track Bus Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/80 z-20 flex justify-center">
        <button
          className="btn-navy w-full max-w-lg py-4 text-base shadow-lg cursor-pointer"
          onClick={() => navigate(`/passenger/track/${bus.id}`)}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Track Bus
        </button>
      </div>
    </div>
  );
}
