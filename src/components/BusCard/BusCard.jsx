import { useNavigate } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';

export default function BusCard({ bus }) {
  const navigate = useNavigate();
  const route = bus.expand?.route_id;

  return (
    <div
      className="glass-card p-4 cursor-pointer group"
      onClick={() => navigate(`/passenger/bus/${bus.id}`)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 text-lg">
            🚌
          </div>
          <div>
            <h3 className="font-semibold text-surface-100 group-hover:text-primary-400 transition-colors">
              {bus.bus_number}
            </h3>
            <p className="text-xs text-surface-500">{bus.registration_number}</p>
          </div>
        </div>
        <StatusBadge status={bus.status} />
      </div>

      {route && (
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <span className="text-success-400">●</span>
          <span>{route.start_location}</span>
          <span className="text-surface-600">→</span>
          <span>{route.end_location}</span>
        </div>
      )}
    </div>
  );
}
