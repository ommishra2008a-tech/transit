import StatusBadge from '../StatusBadge/StatusBadge';

export default function RouteCard({ route, onClick }) {
  return (
    <div
      className="glass-card p-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-surface-100 group-hover:text-primary-400 transition-colors">
          {route.route_name}
        </h3>
        <StatusBadge status={route.status} />
      </div>
      <div className="flex items-center gap-2 text-sm text-surface-400">
        <span className="w-2 h-2 rounded-full bg-success-400" />
        <span>{route.start_location}</span>
        <span className="text-surface-600 mx-1">→</span>
        <span className="w-2 h-2 rounded-full bg-danger-400" />
        <span>{route.end_location}</span>
      </div>
    </div>
  );
}
