import { useNavigate } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';

export default function BusCard({ bus }) {
  const navigate = useNavigate();
  const route = bus.expand?.route_id;

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-[#142d76]/20 transition-all group"
      onClick={() => navigate(`/passenger/bus/${bus.id}`)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#f0f4ff] flex items-center justify-center text-[#142d76] text-xl font-bold">
            🚌
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#142d76] transition-colors">
              {bus.bus_number}
            </h3>
            <p className="text-xs font-mono text-slate-400">{bus.registration_number}</p>
          </div>
        </div>
        <StatusBadge status={bus.status} />
      </div>

      {route && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <span>{route.start_location}</span>
            <span className="text-slate-400">→</span>
            <span>{route.end_location}</span>
          </div>
          <span className="text-xs text-[#142d76] font-bold group-hover:underline">
            View Stops →
          </span>
        </div>
      )}
    </div>
  );
}
