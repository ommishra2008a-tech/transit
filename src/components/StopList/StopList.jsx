export default function StopList({ stops, currentStopIndex = 0 }) {
  if (!stops || stops.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-4">No stops available</p>;
  }

  return (
    <div className="relative pl-6 py-2">
      {/* Vertical Connecting Line */}
      <div className="absolute left-[9px] top-4 bottom-6 w-[2px] bg-slate-200" />

      <div className="space-y-6">
        {stops.map((stop, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === stops.length - 1;
          const isCurrent = idx === currentStopIndex;
          const isNext = idx === currentStopIndex + 1;

          // Color scheme matching mockup #3:
          // Start / Active = Green (#007a4d)
          // Current / Next = Navy Blue (#142d76)
          // Upcoming / Remaining = Light Grey (#cbd5e1)
          let dotClass = "border-slate-300 bg-slate-200";
          let textClass = "text-slate-600 font-normal";
          let badgeText = isFirst ? "Start" : isLast ? "End" : null;

          if (isFirst || isCurrent) {
            dotClass = "border-[#007a4d] bg-[#007a4d]";
            textClass = "text-slate-900 font-semibold";
          } else if (isNext) {
            dotClass = "border-[#142d76] bg-[#142d76]";
            textClass = "text-slate-900 font-semibold";
          } else {
            dotClass = "border-slate-200 bg-slate-200";
            textClass = "text-slate-500 font-medium";
          }

          return (
            <div key={stop.id || stop.stop_name} className="relative flex items-start gap-3 animate-fade-in">
              {/* Dot Icon on the line */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                  isFirst || isCurrent ? "border-[#007a4d]" : isNext ? "border-[#142d76]" : "border-slate-200"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isFirst || isCurrent ? "bg-[#007a4d]" : isNext ? "bg-[#142d76]" : "bg-slate-300"
                  }`}
                />
              </div>

              {/* Stop Name & Status Label */}
              <div className="flex-1">
                <p className={`text-base leading-snug ${textClass}`}>
                  {stop.stop_name}
                </p>
                {badgeText && (
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{badgeText}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
