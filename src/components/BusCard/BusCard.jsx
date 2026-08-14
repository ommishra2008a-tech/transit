import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, ArrowRight, ChevronRight, Navigation } from 'lucide-react';
import StatusBadge from '../StatusBadge/StatusBadge';
import { Card } from '../ui/Card';

export default function BusCard({ bus }) {
  const navigate = useNavigate();
  const route = bus.expand?.route_id;

  return (
    <Card
      interactive
      className="p-5 flex flex-col justify-between"
      onClick={() => navigate(`/passenger/bus/${bus.id}`)}
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900/60 shadow-2xs">
              <Bus size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-none tracking-tight">
                {bus.bus_number}
              </h3>
              <p className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 mt-1">
                {bus.registration_number}
              </p>
            </div>
          </div>
          <StatusBadge status={bus.status} />
        </div>

        {route && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 mb-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Route Line
            </p>
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800 dark:text-slate-100">
              <span className="truncate">{route.start_location}</span>
              <ArrowRight size={14} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{route.end_location}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-extrabold text-blue-600 dark:text-blue-400">
        <span className="flex items-center gap-1.5">
          <Navigation size={14} /> View Stops & Timeline
        </span>
        <ChevronRight size={16} className="text-blue-500" />
      </div>
    </Card>
  );
}
