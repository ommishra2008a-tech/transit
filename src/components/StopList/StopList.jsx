export default function StopList({ stops, currentStopIndex = 0 }) {
  if (!stops || stops.length === 0) {
    return <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">No stops configured for this route</p>;
  }

  return (
    <div className="relative py-1">
      {stops.map((stop, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === stops.length - 1;
        const isCurrent = idx === currentStopIndex;
        const isNext = idx === currentStopIndex + 1;
        const isCompleted = idx < currentStopIndex;

        // Badge config
        let badgeText = null;
        let badgeClass = '';

        if (isFirst) {
          badgeText = 'ORIGIN';
          badgeClass = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        } else if (isLast) {
          badgeText = 'TERMINAL';
          badgeClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        } else if (isNext) {
          badgeText = 'NEXT';
          badgeClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }

        // Dot color
        const isHighlighted = isFirst || isCurrent || isNext || isLast;
        const dotColor = isFirst || isCurrent
          ? 'border-emerald-500 bg-white dark:bg-slate-900'
          : isNext || isLast
          ? 'border-blue-500 bg-white dark:bg-slate-900'
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900';

        const innerDotColor = isFirst || isCurrent
          ? 'bg-emerald-500'
          : isNext || isLast
          ? 'bg-blue-500'
          : 'bg-slate-300 dark:bg-slate-600';

        // Connecting line color
        const lineColor = isFirst || isCurrent
          ? 'bg-blue-400 dark:bg-blue-500'
          : 'bg-slate-200 dark:bg-slate-700';

        // Text color
        const nameColor = isNext
          ? 'text-blue-600 dark:text-blue-400'
          : isHighlighted
          ? 'text-slate-900 dark:text-white'
          : 'text-slate-600 dark:text-slate-400';

        return (
          <div key={stop.id || stop.stop_name || idx} className="relative flex items-start">
            {/* Timeline column: dot + line */}
            <div className="flex flex-col items-center mr-3.5 flex-shrink-0" style={{ width: '24px' }}>
              {/* Dot */}
              <div className={`w-5 h-5 rounded-full border-[2.5px] flex items-center justify-center z-10 ${dotColor}`}>
                <div className={`w-2 h-2 rounded-full ${innerDotColor}`} />
              </div>
              {/* Connecting line (not on last item) */}
              {!isLast && (
                <div className={`w-[3px] flex-1 min-h-[32px] rounded-full ${lineColor}`} />
              )}
            </div>

            {/* Content column */}
            <div className="flex-1 flex items-center justify-between gap-2 pb-5 min-w-0">
              <div className="min-w-0">
                <p className={`text-[13px] sm:text-sm font-bold truncate ${nameColor}`}>
                  {stop.stop_name}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Stop #{stop.stop_order !== undefined ? stop.stop_order : idx + 1}
                </p>
              </div>

              {badgeText && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border flex-shrink-0 ${badgeClass}`}>
                  {badgeText}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
