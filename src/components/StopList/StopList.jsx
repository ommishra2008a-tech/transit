export default function StopList({ stops, currentStopIndex = 0 }) {
  if (!stops || stops.length === 0) {
    return <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">No stops configured for this route</p>;
  }

  return (
    <div className="relative pl-8 py-2">
      {/* Vertical Connecting Line (Positioned at 9px to line up with 20px dot center) */}
      <div className="absolute left-[9px] top-4 bottom-6 w-[2.5px] bg-slate-200 dark:bg-slate-700 pointer-events-none" />

      <div className="space-y-6">
        {stops.map((stop, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === stops.length - 1;
          const isCurrent = idx === currentStopIndex;
          const isNext = idx === currentStopIndex + 1;

          let badgeText = null;
          let badgeBg = "";

          if (isFirst) {
            badgeText = "ORIGIN";
            badgeBg = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
          } else if (isLast) {
            badgeText = "TERMINAL";
            badgeBg = "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800";
          } else if (isCurrent) {
            badgeText = "CURRENT";
            badgeBg = "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800";
          } else if (isNext) {
            badgeText = "NEXT";
            badgeBg = "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
          }

          return (
            <div key={stop.id || stop.stop_name || idx} className="relative flex items-center justify-between gap-3 animate-fade-in group">
              {/* Dot Icon on the line (Positioned at left-0 inside pl-8 wrapper) */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900 transition-all ${
                  isFirst || isCurrent
                    ? "border-emerald-600 shadow-xs shadow-emerald-500/20"
                    : isNext || isLast
                    ? "border-blue-600 shadow-xs shadow-blue-500/20"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isFirst || isCurrent
                      ? "bg-emerald-600 animate-pulse"
                      : isNext || isLast
                      ? "bg-blue-600"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              </div>

              {/* Stop Info */}
              <div className="flex-1 min-w-0 pl-1">
                <p className={`text-sm sm:text-base font-bold truncate ${
                  isFirst || isCurrent
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-700 dark:text-slate-300"
                }`}>
                  {stop.stop_name}
                </p>
                {stop.stop_order !== undefined && (
                  <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Stop #{stop.stop_order}</p>
                )}
              </div>

              {/* Badge */}
              {badgeText && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex-shrink-0 ${badgeBg}`}>
                  {badgeText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
