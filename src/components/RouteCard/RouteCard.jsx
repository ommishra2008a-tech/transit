import { Route as RouteIcon, MapPin, ArrowRight } from 'lucide-react';
import StatusBadge from '../StatusBadge/StatusBadge';
import { Card } from '../ui/Card';

export default function RouteCard({ route, onClick }) {
  return (
    <Card
      hover
      className="p-5 cursor-pointer group bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100 dark:border-blue-900">
            <RouteIcon size={20} />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {route.route_name}
          </h3>
        </div>
        <StatusBadge status={route.status} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
          <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
          <span className="truncate">{route.start_location}</span>
        </span>
        <ArrowRight size={14} className="text-slate-400 mx-1 flex-shrink-0" />
        <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
          <MapPin size={14} className="text-red-500 flex-shrink-0" />
          <span className="truncate">{route.end_location}</span>
        </span>
      </div>
    </Card>
  );
}
