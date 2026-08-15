import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MapPin } from 'lucide-react';
import { solarch } from '../../lib/solarch';

export default function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const [realStops, setRealStops] = useState([]);

  // Fetch real trip details and stops
  useEffect(() => {
    const init = async () => {
      try {
        const tripDoc = await solarch.db.collection('trips').getById(id);
        setTrip(tripDoc);
        if (tripDoc?.route_id) {
          const stopsRes = await solarch.db.collection('stops').get({
            filter: { route_id: tripDoc.route_id },
            limit: 50
          });
          if (stopsRes?.items?.length > 0) {
            const sorted = stopsRes.items.sort((a, b) => a.stop_order - b.stop_order);
            setRealStops(sorted);
          }
        }
      } catch (err) {
        console.error('Failed to load trip', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // Fallback stops if stops collection is empty
  const defaultStops = [
    { name: 'Airport Road', time: '09:10 AM', status: 'Completed' },
    { name: 'Janjeerwala Square', time: '09:18 AM', status: 'Completed' },
    { name: 'Malhar Mega Mall', time: '09:24 AM', status: 'Current Stop' },
    { name: 'Vijay Nagar Square', time: '09:30 AM', status: 'Upcoming' },
    { name: 'Scheme No. 54', time: '09:35 AM', status: 'Upcoming' },
    { name: 'Vijay Nagar', time: '09:40 AM', status: 'Upcoming' }
  ];

  const displayStops = realStops.length > 0 
    ? realStops.map((s, idx) => ({
        name: s.stop_name || `Stop ${idx + 1}`,
        time: idx === 0 ? 'Start' : idx === realStops.length - 1 ? 'End' : '--:--',
        status: idx === 0 ? 'Completed' : idx === 1 ? 'Current Stop' : 'Upcoming'
      }))
    : defaultStops;

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 px-5 pt-12 pb-6 border-b border-white/5 flex items-center gap-4 bg-[#0b101a]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold tracking-wide">{trip?.bus_number || 'Loading...'}</h1>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <p className="text-[12px] text-slate-400 mt-1">{trip?.route_id || 'Route Information'}</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 relative z-10">
        
        {/* Telemetry Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#0b101a]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-[24px] font-bold text-white">{trip?.speed_kmh || '0'}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Speed</span>
          </div>
          <div className="bg-[#0b101a]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-[24px] font-bold text-white">2</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Min ETA</span>
          </div>
          <div className="bg-[#0b101a]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-[24px] font-bold text-white">1.2</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">km Left</span>
          </div>
        </div>

        {/* Driver Card */}
        <div className="bg-[#0b101a]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
               {/* Dummy Driver Avatar */}
               <img src="https://ui-avatars.com/api/?name=Rohit+Sharma&background=0D8ABC&color=fff" alt="Driver" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Driver</p>
              <h4 className="text-[15px] font-bold text-white">{trip?.driver_email?.split('@')[0].toUpperCase() || 'Driver Assigned'}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-amber-400 text-[12px]">★</span>
                <span className="text-slate-300 text-[12px] font-medium">4.8</span>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-[#131720] border border-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 transition-colors">
            <Phone size={18} />
          </button>
        </div>

        {/* Route Stops Timeline */}
        <div>
          <h3 className="text-[16px] font-bold text-white mb-5 tracking-wide">Route Stops</h3>
          <div className="space-y-0 relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-[10px] bottom-[30px] w-[2px] bg-white/10"></div>
            
            {displayStops.map((stop, index) => {
              const isCompleted = stop.status === 'Completed';
              const isCurrent = stop.status === 'Current Stop';
              const isUpcoming = stop.status === 'Upcoming';

              return (
                <div key={index} className="flex items-start gap-4 pb-6 relative z-10">
                  <div className="w-8 flex flex-col items-center mt-0.5">
                    {isCompleted ? (
                      <div className="w-[14px] h-[14px] rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/50 -ml-[5px]">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,1)]" />
                      </div>
                    ) : (
                      <div className="w-[12px] h-[12px] rounded-full border-2 border-slate-600 bg-[#030712]" />
                    )}
                  </div>
                  <div className="flex-1 flex items-start justify-between">
                    <div>
                      <h4 className={`text-[15px] font-semibold ${isCompleted || isCurrent ? 'text-white' : 'text-slate-400'}`}>
                        {stop.name}
                      </h4>
                      {isCurrent && (
                        <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mt-1">Current Stop</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-[13px] font-medium ${isCompleted || isCurrent ? 'text-white' : 'text-slate-500'}`}>
                        {stop.time}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stop.status}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
