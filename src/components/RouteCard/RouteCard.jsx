import { Route as RouteIcon, MapPin, ArrowRight } from 'lucide-react';
import StatusBadge from '../StatusBadge/StatusBadge';
import { Card } from '../ui/Card';

export default function RouteCard({ route, onClick }) {
  return (
    <Card
      hover
      className="p-5 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold group-hover:bg-primary-700 group-hover:text-white transition-colors">
            <RouteIcon size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-primary-700 transition-colors">
            {route.route_name}
          </h3>
        </div>
        <StatusBadge status={route.status} />
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1 text-slate-700 font-bold">
          <MapPin size={14} className="text-emerald-600" />
          {route.start_location}
        </span>
        <ArrowRight size={14} className="text-slate-300 mx-1" />
        <span className="flex items-center gap-1 text-slate-700 font-bold">
          <MapPin size={14} className="text-red-500" />
          {route.end_location}
        </span>
      </div>
    </Card>
  );
}
