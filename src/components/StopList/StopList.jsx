import { motion } from 'framer-motion';

export default function StopList({ stops, currentStopIndex = 0 }) {
  if (!stops || stops.length === 0) {
    return <p className="text-slate-400 dark:text-slate-500 text-xs font-mono text-center py-6">No station stops configured for this route</p>;
  }

  return (
    <div className="relative py-1">
      {stops.map((stop, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === stops.length - 1;
        const isCurrent = idx === currentStopIndex;
        const isNext = idx === currentStopIndex + 1;

        let badgeText = null;
        let badgeClass = '';

        if (isFirst) {
          badgeText = 'ORIGIN';
          badgeClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        } else if (isLast) {
          badgeText = 'TERMINAL';
          badgeClass = 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        } else if (isNext) {
          badgeText = 'NEXT';
          badgeClass = 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }

        const isHighlighted = isFirst || isCurrent || isNext || isLast;
        const dotColor = isFirst || isCurrent
          ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xs shadow-emerald-500/30'
          : isNext || isLast
          ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-xs shadow-blue-500/30'
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900';

        const innerDotColor = isFirst || isCurrent
          ? 'bg-emerald-500'
          : isNext || isLast
          ? 'bg-blue-500'
          : 'bg-slate-300 dark:bg-slate-600';

        const lineColor = isFirst || isCurrent
          ? 'bg-blue-500 dark:bg-blue-500'
          : 'bg-slate-200 dark:bg-slate-800';

        const nameColor = isNext
          ? 'text-blue-600 dark:text-blue-400'
          : isHighlighted
          ? 'text-slate-900 dark:text-white'
          : 'text-slate-600 dark:text-slate-400';

        return (
          <motion.div
            key={stop.id || stop.stop_name || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.2 }}
            className="relative flex items-start"
          >
            <div className="flex flex-col items-center mr-3.5 flex-shrink-0" style={{ width: '24px' }}>
              <div className={`w-5 h-5 rounded-full border-[2.5px] flex items-center justify-center z-10 ${dotColor}`}>
                <div className={`w-2 h-2 rounded-full ${innerDotColor}`} />
              </div>
              {!isLast && (
                <div className={`w-[3px] flex-1 min-h-[36px] rounded-full ${lineColor}`} />
              )}
            </div>

            <div className="flex-1 flex items-center justify-between gap-2 pb-5 min-w-0">
              <div className="min-w-0">
                <p className={`text-xs sm:text-sm font-extrabold truncate ${nameColor}`}>
                  {stop.stop_name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  Stop #{stop.stop_order !== undefined ? stop.stop_order : idx + 1}
                </p>
              </div>

              {badgeText && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold uppercase tracking-wider border flex-shrink-0 ${badgeClass}`}>
                  {badgeText}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
